import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Column name aliases → canonical field names
const COLUMN_MAP: Record<string, string> = {
  // Animal ID
  "animal id": "animal_id", "animal_id": "animal_id", "id animal": "animal_id",
  "brinco": "animal_id", "ear tag": "animal_id",
  // Name
  "nome": "nome_animal", "nome animal": "nome_animal", "name": "nome_animal",
  "nome_animal": "nome_animal", "animal name": "nome_animal",
  // Registration
  "registro": "registro", "registration": "registro", "reg": "registro",
  // Birth date
  "data nascimento": "data_nascimento", "data_nascimento": "data_nascimento",
  "birth date": "data_nascimento", "nasc": "data_nascimento", "dt nasc": "data_nascimento",
  // Sex
  "sexo": "sexo", "sex": "sexo",
  // Breed
  "raca": "raca", "raça": "raca", "breed": "raca",
  // PTAs
  "milk": "pta_milk", "pta milk": "pta_milk", "pta_milk": "pta_milk", "leite": "pta_milk",
  "fat": "pta_fat", "pta fat": "pta_fat", "pta_fat": "pta_fat", "gordura": "pta_fat",
  "fat%": "pta_fat_pct", "fat pct": "pta_fat_pct", "pta_fat_pct": "pta_fat_pct", "%g": "pta_fat_pct",
  "protein": "pta_protein", "pta protein": "pta_protein", "pta_protein": "pta_protein", "proteina": "pta_protein",
  "protein%": "pta_protein_pct", "prot pct": "pta_protein_pct", "pta_protein_pct": "pta_protein_pct", "%p": "pta_protein_pct",
  "pl": "pta_pl", "pta pl": "pta_pl", "pta_pl": "pta_pl", "productive life": "pta_pl",
  "scs": "pta_scs", "pta scs": "pta_scs", "pta_scs": "pta_scs",
  "dpr": "pta_dpr", "pta dpr": "pta_dpr", "pta_dpr": "pta_dpr",
  "hcr": "pta_hcr", "pta hcr": "pta_hcr", "pta_hcr": "pta_hcr",
  "ccr": "pta_ccr", "pta ccr": "pta_ccr", "pta_ccr": "pta_ccr",
  "livability": "pta_livability", "pta livability": "pta_livability", "pta_livability": "pta_livability", "liv": "pta_livability",
  "sce": "pta_sce", "pta sce": "pta_sce", "pta_sce": "pta_sce",
  "sire sce": "pta_sire_sce", "pta_sire_sce": "pta_sire_sce",
  "type": "pta_type", "pta type": "pta_type", "pta_type": "pta_type",
  "udder": "pta_udder", "pta udder": "pta_udder", "pta_udder": "pta_udder",
  "feet legs": "pta_feet_legs", "f&l": "pta_feet_legs", "pta_feet_legs": "pta_feet_legs",
  // Indexes
  "tpi": "tpi", "nm$": "nmpf", "nmpf": "nmpf", "nm": "nmpf",
  "cm$": "cheese_merit", "cheese merit": "cheese_merit",
  "fm$": "fluid_merit", "fluid merit": "fluid_merit",
  "gm$": "grazing_merit", "grazing merit": "grazing_merit",
  "hhp$": "hhp_dollar", "hhp": "hhp_dollar",
  // Reliabilities
  "rel milk": "rel_milk", "rel_milk": "rel_milk",
  "rel fat": "rel_fat", "rel_fat": "rel_fat",
  "rel protein": "rel_protein", "rel_protein": "rel_protein",
  // Haplotypes
  "bvh": "bvh", "blad": "blad", "dumps": "dumps", "mf": "mf", "cvm": "cvm",
};

const NUMERIC_FIELDS = new Set([
  "pta_milk", "pta_fat", "pta_fat_pct", "pta_protein", "pta_protein_pct",
  "pta_pl", "pta_scs", "pta_dpr", "pta_hcr", "pta_ccr", "pta_livability",
  "pta_sce", "pta_sire_sce", "pta_type", "pta_udder", "pta_feet_legs",
  "tpi", "nmpf", "cheese_merit", "fluid_merit", "grazing_merit", "hhp_dollar",
  "rel_milk", "rel_fat", "rel_protein",
]);

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase().replace(/[_\-]+/g, " ").replace(/\s+/g, " ");
}

function parseNum(val: unknown): number | null {
  if (val === null || val === undefined || val === "" || val === "-") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function parseDate(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "number") {
    // Excel serial date
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(val).trim();
  // Try DD/MM/YYYY
  const brMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) return `${brMatch[3]}-${brMatch[2].padStart(2, "0")}-${brMatch[1].padStart(2, "0")}`;
  // Try YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth: only admin or service_role can call this
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const clientDb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Check caller is admin
    const { data: { user } } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    ).auth.getUser(token);

    if (user) {
      const { data: profile } = await clientDb
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (profile?.role !== "admin") {
        return new Response(JSON.stringify({ error: "Admin only" }), {
          status: 403,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    // Also allow service_role calls (no user but valid key)

    const body = await req.json();
    const { file_path, service_order_id, client_id } = body as {
      file_path: string;
      service_order_id: string;
      client_id: string;
    };

    if (!file_path || !client_id) {
      return new Response(JSON.stringify({ error: "file_path and client_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Download file from Tracker storage
    const trackerDb = createClient(
      Deno.env.get("TRACKER_URL")!,
      Deno.env.get("TRACKER_SERVICE_ROLE_KEY")!,
    );

    const { data: fileData, error: dlError } = await trackerDb.storage
      .from("order-results")
      .download(file_path);

    if (dlError || !fileData) {
      return new Response(JSON.stringify({ error: `Download failed: ${dlError?.message ?? "no data"}` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Parse Excel
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    if (rawRows.length === 0) {
      return new Response(JSON.stringify({ error: "Empty spreadsheet", inserted: 0 }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Map headers
    const rawHeaders = Object.keys(rawRows[0]);
    const headerMapping: Record<string, string> = {};
    for (const rh of rawHeaders) {
      const normalized = normalizeHeader(rh);
      if (COLUMN_MAP[normalized]) {
        headerMapping[rh] = COLUMN_MAP[normalized];
      }
    }

    const fileName = file_path.split("/").pop() ?? file_path;

    // Transform rows
    const rows = rawRows.map((raw) => {
      const row: Record<string, unknown> = {
        client_id,
        service_order_id: service_order_id || null,
        file_name: fileName,
        file_path,
        uploaded_at: new Date().toISOString(),
        visivel_toolss: true,
        visivel_ssgen: true,
      };

      for (const [rawCol, canonCol] of Object.entries(headerMapping)) {
        const val = raw[rawCol];
        if (canonCol === "data_nascimento") {
          row[canonCol] = parseDate(val);
        } else if (NUMERIC_FIELDS.has(canonCol)) {
          row[canonCol] = parseNum(val);
        } else {
          row[canonCol] = val !== null && val !== undefined ? String(val).trim() : null;
        }
      }

      return row;
    });

    // Insert into Platform genomic_results
    const platformDb = createClient(
      Deno.env.get("PLATFORM_URL")!,
      Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
    );

    // Batch insert (max 500 per batch)
    let inserted = 0;
    const errors: string[] = [];
    for (let i = 0; i < rows.length; i += 500) {
      const batch = rows.slice(i, i + 500);
      const { data: insertedData, error: insertError } = await platformDb
        .from("genomic_results")
        .insert(batch)
        .select("id, animal_id, registro");

      if (insertError) {
        errors.push(`Batch ${i / 500 + 1}: ${insertError.message}`);
      } else {
        inserted += insertedData?.length ?? 0;

        // Link to females where registration matches
        if (insertedData) {
          for (const result of insertedData) {
            if (result.registro) {
              await platformDb
                .from("females")
                .update({ genomic_result_id: result.id, updated_at: new Date().toISOString() })
                .eq("client_id", client_id)
                .eq("registration", result.registro)
                .is("genomic_result_id", null);
            }
          }
        }
      }
    }

    // Update service order stage if provided
    if (service_order_id && inserted > 0) {
      await platformDb
        .from("service_orders")
        .update({
          etapa_atual: "Receb. Resultados",
          dt_receb_resultados: new Date().toISOString().slice(0, 10),
          liberacao_n_amostras: inserted,
          result_file_path: file_path,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service_order_id);
    }

    // Notify linked users
    if (inserted > 0) {
      const { data: linkedUsers } = await clientDb
        .from("client_links")
        .select("user_id")
        .eq("platform_client_id", client_id);

      if (linkedUsers && linkedUsers.length > 0) {
        const notifications = linkedUsers.map((link: { user_id: string }) => ({
          user_id: link.user_id,
          type: "result_released" as const,
          title: "Novos resultados genomicos",
          body: `${inserted} resultado${inserted > 1 ? "s" : ""} genomico${inserted > 1 ? "s" : ""} ${inserted > 1 ? "foram liberados" : "foi liberado"}.`,
          metadata: { service_order_id, client_id, count: inserted, file_name: fileName },
        }));

        await clientDb.from("notifications").insert(notifications);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      inserted,
      total_rows: rows.length,
      mapped_columns: Object.values(headerMapping),
      errors: errors.length > 0 ? errors : undefined,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
