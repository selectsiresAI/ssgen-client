import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ── Auto-classify category from birth_date ──
function autoCategory(birthDate: string | null): { category: string; parity_order: number | null } {
  if (!birthDate) return { category: "Indefinida", parity_order: null };
  const days = (Date.now() - new Date(birthDate).getTime()) / 86400000;
  const years = days / 365;
  if (years < 1) return { category: "Bezerra", parity_order: 0 };
  if (years < 2) return { category: "Novilha", parity_order: 0.1 };
  if (years < 3) return { category: "Primípara", parity_order: 1 };
  if (years < 4) return { category: "Secundípara", parity_order: 2 };
  return { category: "Multípara", parity_order: 3 };
}

// ── Auto-calculate HHP$ ──
// Fórmula NÃO é mais duplicada aqui: delega pra calculate_hhp_dollar_breed()
// na Platform (fonte única, HO+JE via breed_index_params). Evita a cópia local
// desalinhar da Platform de novo (ver incidente 2026-06-02) e cobre Jersey.
async function calcHHP(
  platformDb: ReturnType<typeof createClient>,
  f: Record<string, unknown>,
): Promise<number | null> {
  const n = (k: string) => typeof f[k] === "number" ? f[k] as number : null;
  const { data, error } = await platformDb.rpc("calculate_hhp_dollar_breed", {
    p_breed: typeof f.breed === "string" && f.breed ? f.breed : "HO",
    p_ptaf: n("ptaf"), p_ptap: n("ptap"), p_pl: n("pl"), p_liv: n("liv"),
    p_scs: n("scs"), p_dpr: n("dpr"), p_ccr: n("ccr"), p_udp: n("udp"), p_mast: n("mast"),
    p_rfi: n("rfi"), p_sta: n("sta"), p_dfm: n("dfm"), p_ruw: n("ruw"),
    p_rtp: n("rtp"), p_ftl: n("ftl"),
    p_ptat: n("ptat"), p_da: n("da"), p_hliv: n("h_liv"),
  });
  if (error) {
    console.error("calculate_hhp_dollar_breed RPC failed:", error.message);
    return null;
  }
  return typeof data === "number" ? data : null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const clientDb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const platformDb = createClient(
      Deno.env.get("PLATFORM_URL")!,
      Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    ).auth.getUser(token);

    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: links } = await clientDb
      .from("client_links")
      .select("platform_client_id")
      .eq("user_id", user.id);

    const clientIds = (links ?? []).map((l: { platform_client_id: string }) => l.platform_client_id);

    if (clientIds.length === 0) {
      return new Response(JSON.stringify({ data: [], total: 0, page: 1, per_page: 200 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "200"), 5000);
    const serviceOrderId = url.searchParams.get("service_order_id");
    const search = url.searchParams.get("search") ?? "";
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    const selectCols = [
      "id", "client_id", "ear_tag", "name", "registration", "cdcb_id", "birth_date",
      "breed", "category", "status", "parity_order",
      "sire_naab", "mgs_naab", "mmgs_naab", "genomic_result_id",
      "hhp_dollar", "tpi", "nm_dollar", "cm_dollar", "fm_dollar", "gm_dollar",
      "f_sav", "cfp", "da", "ket", "mast", "met", "rp", "ssb", "dsb",
      "h_liv", "fi", "gl", "efc", "bwc",
      "sta", "dfm", "rua", "rls", "rtp", "ftl", "rw", "rlr",
      "fta", "fls", "fua", "ruh", "ruw", "ucl", "udp", "ftp",
      "rfi", "beta_casein", "kappa_casein", "gfi", "jpi", "jui", "str:str_num",
      "ptam:pta_milk", "ptaf:pta_fat", "ptaf_pct:pta_fat_pct",
      "ptap:pta_protein", "ptap_pct:pta_protein_pct",
      "pl:pta_pl", "dpr:pta_dpr", "liv:pta_livability", "scs:pta_scs",
      "mf:mf_num",
      "ptat:pta_ptat", "udc:pta_udc", "flc:pta_flc",
      "sce:pta_sce", "ccr:pta_ccr", "hcr:pta_hcr",
      "created_at",
    ].join(", ");

    // Build base query builder (without range - we paginate internally to bypass 1000-row limit)
    const buildQuery = (rangeFrom: number, rangeTo: number) => {
      let q = platformDb
        .from("females")
        .select(selectCols, { count: "exact" })
        .in("client_id", clientIds)
        .is("deleted_at", null)
        .order("nm_dollar", { ascending: false, nullsFirst: false })
        .range(rangeFrom, rangeTo);

      if (serviceOrderId && resultIds) {
        q = q.in("genomic_result_id", resultIds);
      }
      if (search) {
        q = q.or(`name.ilike.%${search}%,ear_tag.ilike.%${search}%,registration.ilike.%${search}%,cdcb_id.ilike.%${search}%`);
      }
      return q;
    };

    // Resolve service order filter first
    let resultIds: string[] | null = null;
    if (serviceOrderId) {
      const { data: grIds } = await platformDb
        .from("genomic_results")
        .select("id")
        .eq("service_order_id", serviceOrderId);
      resultIds = (grIds ?? []).map((r: { id: string }) => r.id);
      if (resultIds.length === 0) {
        return new Response(JSON.stringify({ data: [], total: 0, page, per_page: perPage }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Fetch in chunks of 1000 to bypass PostgREST row limit
    const CHUNK = 1000;
    let allFemales: Record<string, unknown>[] = [];
    let totalCount = 0;

    for (let offset = from; offset <= to; offset += CHUNK) {
      const chunkEnd = Math.min(offset + CHUNK - 1, to);
      const { data: chunk, count, error } = await buildQuery(offset, chunkEnd);
      if (error) throw error;
      if (count != null) totalCount = count;
      if (!chunk || chunk.length === 0) break;
      allFemales = allFemales.concat(chunk);
      if (chunk.length < CHUNK) break; // no more rows
    }

    const females = allFemales;

    // ── Auto-enrich: category + HHP$ ──
    const enriched = await Promise.all((females ?? []).map(async (f: Record<string, unknown>) => {
      const row = { ...f };

      // Auto-classify category from birth_date if missing
      if (!row.category || row.category === "Indefinida") {
        const { category, parity_order } = autoCategory(row.birth_date as string | null);
        row.category = category;
        row.parity_order = parity_order;
      }

      // Auto-calculate HHP$ if missing (breed-aware, via Platform RPC)
      if (row.hhp_dollar == null) {
        row.hhp_dollar = await calcHHP(platformDb, row);
      }

      return row;
    }));

    // ── Enrich with sire/mgs/mmgs bull names (best-effort, batch lookup) ──
    const naabCodes = Array.from(new Set(
      enriched.flatMap((f: Record<string, unknown>) => [f.sire_naab, f.mgs_naab, f.mmgs_naab])
        .filter((c): c is string => typeof c === "string" && c.trim() !== ""),
    ));

    const bullNameByCode = new Map<string, string | null>();
    if (naabCodes.length > 0) {
      const { data: matches, error: matchErr } = await platformDb.rpc("find_bulls_smart_batch", { p_queries: naabCodes });
      if (matchErr) {
        console.error("[get-my-females-full] find_bulls_smart_batch error", matchErr);
      } else {
        for (const row of matches ?? []) {
          bullNameByCode.set(String(row.input_query).toUpperCase(), row.name ?? null);
        }
      }
    }

    const enrichedWithNames = enriched.map((f: Record<string, unknown>) => ({
      ...f,
      sire_name: typeof f.sire_naab === "string" ? bullNameByCode.get((f.sire_naab as string).toUpperCase()) ?? null : null,
      mgs_name: typeof f.mgs_naab === "string" ? bullNameByCode.get((f.mgs_naab as string).toUpperCase()) ?? null : null,
      mmgs_name: typeof f.mmgs_naab === "string" ? bullNameByCode.get((f.mmgs_naab as string).toUpperCase()) ?? null : null,
    }));

    return new Response(JSON.stringify({ data: enrichedWithNames, total: totalCount, page, per_page: perPage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
