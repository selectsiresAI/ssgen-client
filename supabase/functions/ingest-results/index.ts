import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as XLSX from "npm:xlsx@0.18.5";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Normalized header → canonical field name
// Supports: Grid Neogen exports (EN), CDCB SSGen files (PT/EN), and mixed formats
const HEADER_MAP: Record<string, string> = {
  // --- Animal identification ---
  "official id": "cdcb_id", "cdcb id": "cdcb_id", "cdcb_id": "cdcb_id", "hobra": "cdcb_id",
  "id oficial": "cdcb_id",
  "animal id": "ear_tag", "animal_id": "ear_tag", "brinco": "ear_tag", "ear tag": "ear_tag",
  "id animal": "ear_tag", "id fazenda": "ear_tag",
  "nome": "name", "nome animal": "name", "name": "name", "animal name": "name", "nome_animal": "name",
  "registro": "registration", "registration": "registration", "reg": "registration",
  "data nascimento": "birth_date", "data_nascimento": "birth_date", "birth date": "birth_date",
  "nasc": "birth_date", "dt nasc": "birth_date", "nascimento": "birth_date",
  "sexo": "sex", "sex": "sex",
  "raca": "breed", "breed": "breed",
  "sample id": "sample_id", "id amostra": "sample_id",
  "farm id": "farm_id_grid",
  // Sire/dam NAAB
  "sire naab code": "sire_naab", "sire naab": "sire_naab", "naab pai": "sire_naab",
  "codigo naab do pai": "sire_naab",
  "mgs naab code": "mgs_naab", "mgs naab": "mgs_naab",
  "mmgs naab code": "mmgs_naab", "mmgs naab": "mmgs_naab",

  // --- Economic indexes ---
  "nm$": "nm_dollar", "nm": "nm_dollar", "nmpf": "nm_dollar",
  "merito liquido ($)": "nm_dollar", "ml $": "nm_dollar", "ml $ ranking": "nm_dollar",
  "fm$": "fm_dollar", "fm": "fm_dollar",
  "merito fluido ($)": "fm_dollar", "merito fluido": "fm_dollar",
  "cm$": "cm_dollar", "cm": "cm_dollar", "cheese merit": "cm_dollar",
  "merito queijo ($)": "cm_dollar", "merito queijo": "cm_dollar",
  "gm$": "gm_dollar", "gm": "gm_dollar", "grazing merit": "gm_dollar",
  "mp ($$)": "gm_dollar", "mp$": "gm_dollar",
  "hhp$": "hhp_dollar", "hhp": "hhp_dollar",
  "indice de saude select sires": "hhp_dollar", "hth$": "hhp_dollar",
  "ssi high health index": "hhp_dollar",
  "tpi": "tpi", "ipi": "tpi",
  "jpi": "jpi", "jersey performance index": "jpi",
  "jui": "jui", "jersey udder index": "jui", "jersey udder": "jui",

  // --- Production PTAs ---
  "milk": "pta_milk", "pta milk": "pta_milk", "pta_milk": "pta_milk",
  "leite": "pta_milk",
  "fat (lbs)": "pta_fat", "fat lbs": "pta_fat", "fat": "pta_fat", "pta fat": "pta_fat",
  "pta_fat": "pta_fat", "gordura": "pta_fat", "gord. (lbs.)": "pta_fat",
  "fat (%)": "pta_fat_pct", "fat pct": "pta_fat_pct", "fat%": "pta_fat_pct",
  "pta_fat_pct": "pta_fat_pct", "%g": "pta_fat_pct", "gord. %": "pta_fat_pct", "gord.%": "pta_fat_pct",
  "pro (lbs.)": "pta_protein", "pro (lbs)": "pta_protein", "pro lbs": "pta_protein",
  "protein": "pta_protein", "pta protein": "pta_protein", "pta_protein": "pta_protein",
  "proteina": "pta_protein", "prot. (lbs.)": "pta_protein",
  "pro (%)": "pta_protein_pct", "pro%": "pta_protein_pct", "protein%": "pta_protein_pct",
  "prot pct": "pta_protein_pct", "pta_protein_pct": "pta_protein_pct", "%p": "pta_protein_pct",
  "prot. %": "pta_protein_pct",

  // --- Functional PTAs ---
  "pl": "pta_pl", "pta pl": "pta_pl", "pta_pl": "pta_pl", "productive life": "pta_pl",
  "vp": "pta_pl",
  "scs": "pta_scs", "pta scs": "pta_scs", "pta_scs": "pta_scs",
  "ccs": "pta_scs",
  "dpr": "pta_dpr", "pta dpr": "pta_dpr", "pta_dpr": "pta_dpr",
  "hcr": "pta_hcr", "pta hcr": "pta_hcr", "pta_hcr": "pta_hcr",
  "tcv": "pta_hcr",
  "ccr": "pta_ccr", "pta ccr": "pta_ccr", "pta_ccr": "pta_ccr",
  "tcn": "pta_ccr",
  "liv": "pta_livability", "livability": "pta_livability", "pta livability": "pta_livability",
  "pta_livability": "pta_livability",
  "sce": "pta_sce", "pta sce": "pta_sce", "pta_sce": "pta_sce",
  "fpf": "pta_sce",
  "dce": "pta_sire_sce", "sire sce": "pta_sire_sce", "pta_sire_sce": "pta_sire_sce",
  "fpt": "pta_sire_sce",

  // --- Type / Conformation ---
  "ptat": "pta_ptat", "pta type": "pta_ptat", "pta_ptat": "pta_ptat",
  "pta tipo": "pta_ptat",
  "udc": "pta_udc", "pta udder": "pta_udc", "pta_udc": "pta_udc",
  "flc": "pta_flc", "f&l": "pta_flc", "pta_flc": "pta_flc", "feet legs": "pta_flc",
  "composto de pernas e pes": "pta_flc",

  // --- Health / Wellness ---
  "feed save": "f_sav", "f_sav": "f_sav", "feed saved": "f_sav",
  "economia alimentar": "f_sav",
  "rfi": "rfi", "consumo alimentar residual": "rfi",
  "cfp": "cfp",
  "dab": "da", "da": "da",
  "ket": "ket", "cet": "ket",
  "mas": "mast", "mast": "mast",
  "met": "met",
  "rp": "rp", "rpl": "rp",
  "ssb": "ssb", "natimortos touro": "ssb", "natimorto touro": "ssb",
  "dsb": "dsb", "natimortos filhas": "dsb", "natimorto filhas": "dsb",
  "hliv": "h_liv", "h_liv": "h_liv", "herd livability": "h_liv",
  "liv nov.": "h_liv",
  "fi": "fi",
  "gl": "gl", "dg": "gl",
  "efc": "efc", "eficiencia alimentar $": "efc",
  "bwc": "bwc",
  "hipoc": "cfp",

  // --- Linear type traits ---
  "sta": "sta", "estatura": "sta", "est.": "sta",
  "str": "str_num", "str_num": "str_num", "forca": "str_num",
  "dfm": "dfm", "forma leiteira": "dfm", "caract. leit.": "dfm",
  "rpa": "rua", "rua": "rua", "rump angle": "rua", "ang. garupa": "rua",
  "rls": "rls", "p.lateral": "rls",
  "rtp": "rtp", "coloc. tetos posteriores": "rtp", "coloc. tetos post.": "rtp",
  "tlg": "ftl", "ftl": "ftl", "teat length": "ftl", "comprimento de tetos": "ftl", "comp. teto": "ftl",
  "rtw": "rw", "rw": "rw", "rump width": "rw", "larg. garupa": "rw",
  "rlr": "rlr", "rear legs rear": "rlr", "p.posterior": "rlr",
  "fta": "fta", "foot angle": "fta", "ang.casco": "fta",
  "fls": "fls", "fore legs": "fls", "escore de pernas e pes": "fls", "p&p escore": "fls",
  "fua": "fua", "fore udder": "fua", "insercao de ubere anterior": "fua", "ub. anterior": "fua",
  "ruh": "ruh", "rear udder height": "ruh", "alt.ub.post.": "ruh", "alt.ub. post.": "ruh",
  "ruw": "ruw", "rear udder width": "ruw",
  "largura de ubere vista posterior": "ruw", "larg.ub. post.": "ruw",
  "ucl": "ucl", "udder cleft": "ucl", "lig medio": "ucl", "lig. medio": "ucl",
  "udp": "udp", "udder depth": "udp", "profundidade de ubere": "udp", "prof. ubere": "udp",
  "ftp": "ftp", "front teat placement": "ftp",
  "colocacao de tetos anteriores": "ftp", "coloc. tetos ant.": "ftp",
  "prof corp": "dfm", "prof. corp.": "dfm",
  "comp. ub.": "ucl",
  "gfi": "gfi",
  "mfv": "mf_num", "mf_num": "mf_num", "mf": "mf_num",
  "msp": "mf_num",

  // --- Casein ---
  "a2 beta cas": "beta_casein", "beta casein": "beta_casein", "beta_casein": "beta_casein",
  "a2 beta casein": "beta_casein", "a2 beta caseina": "beta_casein",
  "kappa cas": "kappa_casein", "kappa casein": "kappa_casein", "kappa_casein": "kappa_casein",
  "kappa caseina": "kappa_casein",

  // --- Reliabilities ---
  "rel milk": "rel_milk", "rel_milk": "rel_milk",
  "confiab. gen. %": "rel_milk",
  "rel fat": "rel_fat", "rel_fat": "rel_fat",
  "rel protein": "rel_protein", "rel_protein": "rel_protein",

  // --- Haplotypes ---
  "bvh": "bvh", "blad": "blad", "dumps": "dumps", "cvm": "cvm",
  "brachyspina": "bvh", "atrof. colun. vert.": "bvh",
  "desm. colun.vert": "dumps", "mieloencefalopatia": "cvm",
  "pai genomico": "sire_naab",
  "p&p": "fls",
};

// Fields that go into genomic_results table
const GENOMIC_RESULTS_FIELDS = new Set([
  "ear_tag", "name", "registration", "birth_date", "sex", "breed",
  "pta_milk", "pta_fat", "pta_fat_pct", "pta_protein", "pta_protein_pct",
  "pta_pl", "pta_scs", "pta_dpr", "pta_hcr", "pta_ccr", "pta_livability",
  "pta_sce", "pta_sire_sce", "pta_ptat", "pta_udc", "pta_flc",
  "tpi", "nm_dollar", "cm_dollar", "fm_dollar", "gm_dollar", "hhp_dollar",
  "rel_milk", "rel_fat", "rel_protein",
  "bvh", "blad", "dumps", "mf_num", "cvm",
]);

// Rename map: canonical → genomic_results column name (where different)
const GR_COLUMN_RENAME: Record<string, string> = {
  "ear_tag": "animal_id",
  "name": "nome_animal",
  "registration": "registro",
  "birth_date": "data_nascimento",
  "sex": "sexo",
  "breed": "raca",
  "nm_dollar": "nmpf",
  "cm_dollar": "cheese_merit",
  "fm_dollar": "fluid_merit",
  "gm_dollar": "grazing_merit",
  "pta_ptat": "pta_type",
  "pta_udc": "pta_udder",
  "pta_flc": "pta_feet_legs",
  "mf_num": "mf",
};

// Fields that update the females table (all numeric proof columns)
const FEMALES_NUMERIC_FIELDS = new Set([
  "nm_dollar", "fm_dollar", "cm_dollar", "gm_dollar", "hhp_dollar", "tpi",
  "pta_milk", "pta_fat", "pta_fat_pct", "pta_protein", "pta_protein_pct",
  "pta_pl", "pta_scs", "pta_dpr", "pta_livability", "pta_ccr", "pta_hcr", "pta_sce",
  "pta_ptat", "pta_udc", "pta_flc",
  "f_sav", "rfi", "cfp", "da", "ket", "mast", "met", "rp", "ssb", "dsb",
  "h_liv", "fi", "gl", "efc", "bwc",
  "sta", "str_num", "dfm", "rua", "rls", "rtp", "ftl", "rw", "rlr",
  "fta", "fls", "fua", "ruh", "ruw", "ucl", "udp", "ftp",
  "mf_num", "gfi", "jpi", "jui",
]);

const FEMALES_TEXT_FIELDS = new Set(["beta_casein", "kappa_casein"]);

const ALL_NUMERIC = new Set([
  ...FEMALES_NUMERIC_FIELDS,
  "rel_milk", "rel_fat", "rel_protein",
]);

// Chave de servico: a secret nova do projeto (env) ou o JWT legado service_role deste
// projeto. O JWT so chega aqui com assinatura valida porque a funcao roda com verify_jwt=true.
function isServiceToken(token: string): boolean {
  if (!token) return false;
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return true;
  try {
    const part = token.split(".")[1];
    if (!part) return false;
    const claims = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    const ref = new URL(Deno.env.get("SUPABASE_URL")!).hostname.split(".")[0];
    return claims?.role === "service_role" && claims?.ref === ref;
  } catch {
    return false;
  }
}

function normalizeHeader(h: string): string {
  return h.toString().trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents: ã→a, é→e
    .replace(/[_\-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\s*\$\s*/g, "$") // keep $ attached: "NM $" → "nm$"
    .replace(/\s*\(\s*/g, " (").replace(/\s*\)\s*/g, ")"); // normalize parens
}

function parseNum(val: unknown): number | null {
  if (val === null || val === undefined || val === "" || val === "-" || val === "." || val === "N/A") return null;
  if (typeof val === "number") return isNaN(val) ? null : val;
  const s = String(val).trim().replace(/,/g, "");
  const n = Number(s);
  return isNaN(n) ? null : n;
}

function parseDate(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "number") {
    const d = XLSX.SSF.parse_date_code(val);
    if (d) return `${d.y}-${String(d.m).padStart(2, "0")}-${String(d.d).padStart(2, "0")}`;
  }
  const s = String(val).trim();
  // Match slash-separated dates
  const slashMatch = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const [, a, b, year] = slashMatch;
    const ai = parseInt(a), bi = parseInt(b);
    // If first part > 12, it must be DD/MM/YYYY (Brazilian)
    // If second part > 12, it must be MM/DD/YYYY (American/CDCB)
    // If ambiguous (both <= 12), try MM/DD/YYYY (CDCB default for genomic results)
    if (ai > 12) {
      // DD/MM/YYYY
      return `${year}-${b.padStart(2, "0")}-${a.padStart(2, "0")}`;
    } else {
      // MM/DD/YYYY (CDCB format)
      return `${year}-${a.padStart(2, "0")}-${b.padStart(2, "0")}`;
    }
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return null;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  // Contexto para registrar erro inesperado em result_ingestions
  const ctx: { file_path?: string; client_id?: string } = {};
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");

    const clientDb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Auth check: admin or service_role (antes, chamada sem usuario passava direto)
    const isService = isServiceToken(token);
    if (!isService) {
      const { data: { user } } = await createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_ANON_KEY")!,
      ).auth.getUser(token);
      if (!user) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
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

    const body = await req.json();
    const { file_path, service_order_id, client_id, force } = body as {
      file_path: string;
      service_order_id?: string;
      client_id: string;
      force?: boolean;
    };

    ctx.file_path = file_path;
    ctx.client_id = client_id;

    if (!file_path || !client_id) {
      if (file_path) {
        await clientDb.from("result_ingestions")
          .update({ status: "erro", finished_at: new Date().toISOString(), result: { error: "client_id ausente" } })
          .eq("file_path", file_path)
          .eq("status", "processando");
      }
      return new Response(JSON.stringify({ error: "file_path and client_id are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Registro em result_ingestions (trava/controle por arquivo)
    const finish = async (status: "ok" | "erro", result: Record<string, unknown>) => {
      await clientDb.from("result_ingestions").upsert({
        file_path,
        client_id,
        service_order_id: service_order_id || null,
        status,
        finished_at: new Date().toISOString(),
        result,
      }, { onConflict: "file_path" });
    };
    const fail = async (status: number, error: string) => {
      await finish("erro", { error });
      return new Response(JSON.stringify({ error }), {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    };

    // Download file from Tracker storage (files are uploaded there by Gabriely)
    const trackerStorage = createClient(
      Deno.env.get("TRACKER_URL")!,
      Deno.env.get("TRACKER_SERVICE_ROLE_KEY")!,
    );

    const { data: fileData, error: dlError } = await trackerStorage.storage
      .from("order-results")
      .download(file_path);

    if (dlError || !fileData) {
      return await fail(400, `Download failed: ${dlError?.message ?? "no data"}`);
    }

    // Parse Excel — prefer "Todos os resultados" / "All Results" sheet, fallback to first
    const arrayBuffer = await fileData.arrayBuffer();
    const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: "array" });
    const allResultsSheet = workbook.SheetNames.find((n: string) =>
      /todos os resultado|all result/i.test(n)
    );
    const sheetName = allResultsSheet ?? workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    // CDCB files have header row at row 3 (rows 1-2 are section titles)
    // Detect: if row 1 has very few filled cells, try shifting header down
    let rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: null });

    // If first parse yielded __EMPTY columns, try with header row offset
    const firstRowKeys = rawRows.length > 0 ? Object.keys(rawRows[0]) : [];
    const emptyKeyCount = firstRowKeys.filter((k: string) => k.startsWith("__EMPTY")).length;
    if (emptyKeyCount > firstRowKeys.length * 0.5 || firstRowKeys.length < 3) {
      // Try header at row 3 (0-indexed: 2)
      rawRows = XLSX.utils.sheet_to_json(sheet, { defval: null, header: 1 }) as Record<string, unknown>[];
      // Find the header row: row with MOST distinct non-empty string values (the real column names)
      // Section headers (row 2) have few merged cells; actual headers (row 3) have many unique values
      let headerIdx = -1;
      let maxDistinct = 0;
      for (let i = 0; i < Math.min(rawRows.length, 10); i++) {
        const row = rawRows[i] as unknown[];
        if (!Array.isArray(row)) break;
        const strings = row.filter((v: unknown) => typeof v === "string" && v.trim().length > 0);
        const distinct = new Set(strings.map((s: unknown) => String(s).trim())).size;
        if (distinct > maxDistinct) {
          maxDistinct = distinct;
          headerIdx = i;
        }
      }
      if (headerIdx >= 0) {
        const headers = (rawRows[headerIdx] as unknown as unknown[]).map((v: unknown) =>
          v !== null && v !== undefined ? String(v).trim() : ""
        );
        const dataRows = rawRows.slice(headerIdx + 1) as unknown as unknown[][];
        rawRows = dataRows
          .filter((row: unknown) => Array.isArray(row))
          .map((row: unknown) => {
            const obj: Record<string, unknown> = {};
            (row as unknown[]).forEach((val: unknown, idx: number) => {
              if (idx < headers.length && headers[idx]) {
                obj[headers[idx]] = val;
              }
            });
            return obj;
          })
          .filter((obj: Record<string, unknown>) => {
            // Skip empty rows
            const vals = Object.values(obj).filter((v: unknown) => v !== null && v !== undefined && v !== "");
            return vals.length > 2;
          });
      }
    }

    if (rawRows.length === 0) {
      return await fail(400, "Empty spreadsheet");
    }

    // Map headers → canonical names
    const rawHeaders = Object.keys(rawRows[0]);
    const headerMapping: Record<string, string> = {};
    const unmapped: string[] = [];
    for (const rh of rawHeaders) {
      const normalized = normalizeHeader(rh);
      if (HEADER_MAP[normalized]) {
        headerMapping[rh] = HEADER_MAP[normalized];
      } else {
        unmapped.push(rh);
      }
    }

    const fileName = file_path.split("/").pop() ?? file_path;
    const platformDb = createClient(
      Deno.env.get("PLATFORM_URL")!,
      Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
    );

    // Reprocessamento forcado (arquivo corrigido no mesmo caminho): remove as provas
    // gravadas antes por este arquivo para nao duplicar
    if (force) {
      const { error: delErr } = await platformDb.from("genomic_results").delete().eq("file_path", file_path);
      if (delErr) return await fail(500, `Falha ao limpar provas anteriores do arquivo: ${delErr.message}`);
    }

    // Parse all rows into canonical format
    const parsedRows: Record<string, unknown>[] = rawRows.map((raw) => {
      const row: Record<string, unknown> = {};
      for (const [rawCol, canonCol] of Object.entries(headerMapping)) {
        const val = raw[rawCol];
        if (canonCol === "birth_date") {
          row[canonCol] = parseDate(val);
        } else if (ALL_NUMERIC.has(canonCol)) {
          row[canonCol] = parseNum(val);
        } else {
          row[canonCol] = val !== null && val !== undefined ? (String(val).trim() || null) : null;
        }
      }
      return row;
    });

    // Idempotencia: arquivo ja gravado por inteiro nao e reprocessado.
    // Gravacao parcial (leitura anterior morreu no meio) e refeita do zero.
    if (!force) {
      const { count: already } = await platformDb
        .from("genomic_results")
        .select("id", { count: "exact", head: true })
        .eq("file_path", file_path);
      if ((already ?? 0) >= parsedRows.length && parsedRows.length > 0) {
        await finish("ok", { skipped: true, reason: "arquivo ja ingerido", genomic_results: already });
        return new Response(JSON.stringify({ success: true, skipped: true, genomic_results_existing: already }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if ((already ?? 0) > 0) {
        const { error: delErr } = await platformDb.from("genomic_results").delete().eq("file_path", file_path);
        if (delErr) return await fail(500, `Falha ao limpar gravacao parcial do arquivo: ${delErr.message}`);
      }
    }

    // ========================================
    // STEP 1: Update/create females (animais novos entram na conta do cliente)
    // ========================================
    const errors: string[] = [];
    let femalesUpdated = 0;
    let femalesAttemptedCreate = 0;
    let femalesCreated = 0;
    let femalesNotFound = 0;

    for (const parsed of parsedRows) {
      // Build the update payload with all available proof columns
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() };
      let hasProof = false;

      for (const [canon, val] of Object.entries(parsed)) {
        if (val === null || val === undefined) continue;
        if (FEMALES_NUMERIC_FIELDS.has(canon) || FEMALES_TEXT_FIELDS.has(canon)) {
          update[canon] = val;
          hasProof = true;
        }
      }

      if (!hasProof) {
        femalesNotFound++;
        continue;
      }

      // Also set sire/mgs/mmgs if available
      if (parsed.sire_naab) update.sire_naab = parsed.sire_naab;
      if (parsed.mgs_naab) update.mgs_naab = parsed.mgs_naab;
      if (parsed.mmgs_naab) update.mmgs_naab = parsed.mmgs_naab;

      // Breed: PROMOTE to Jersey only (JE is authoritative — never demote to HO here).
      // Signal: the file's breed/raca column says Jersey, or JEUSA/JEBRA registration prefix.
      const breedStr = String(parsed.breed ?? "").trim().toUpperCase();
      const regStr = String(parsed.registration ?? "").trim().toUpperCase();
      if (breedStr === "JE" || breedStr === "JER" || breedStr === "JERSEY"
          || regStr.startsWith("JEUSA") || regStr.startsWith("JEBRA")) {
        update.breed = "JE";
      }

      // Match strategy: try cdcb_id first, then ear_tag + client_id
      let matched = false;
      const cdcbId = parsed.cdcb_id as string | null;
      const earTag = parsed.ear_tag as string | null;

      if (cdcbId) {
        const { data: updated } = await platformDb
          .from("females")
          .update(update)
          .eq("cdcb_id", cdcbId)
          .eq("client_id", client_id)
          .is("deleted_at", null)
          .select("id");
        if (updated && updated.length > 0) {
          matched = true;
          femalesUpdated += updated.length;
        }
      }

      if (!matched && earTag) {
        const { data: updated } = await platformDb
          .from("females")
          .update(update)
          .eq("ear_tag", earTag)
          .eq("client_id", client_id)
          .is("deleted_at", null)
          .select("id");
        if (updated && updated.length > 0) {
          matched = true;
          femalesUpdated += updated.length;
        }
      }

      // Fallback: identificador da fazenda (ToolSS grava o brinco/ID fazenda em identifier)
      if (!matched && earTag) {
        const { data: updated } = await platformDb
          .from("females")
          .update(update)
          .eq("identifier", earTag)
          .eq("client_id", client_id)
          .is("deleted_at", null)
          .select("id");
        if (updated && updated.length > 0) {
          matched = true;
          femalesUpdated += updated.length;
        }
      }

      // Animal novo (ex.: genotipagem nova de cliente que ja tem rebanho):
      // entra na conta atual do cliente, junto com os demais animais.
      if (!matched) {
        const identifier = String(earTag ?? cdcbId ?? parsed.name ?? "").trim().substring(0, 100);
        if (!identifier) {
          femalesNotFound++;
          continue;
        }
        const newFemale: Record<string, unknown> = {
          ...update,
          client_id,
          identifier,
          ear_tag: earTag ?? null,
          cdcb_id: cdcbId ?? null,
          name: (parsed.name as string | null) ?? null,
          registration: (parsed.registration as string | null) ?? null,
          birth_date: (parsed.birth_date as string | null) ?? null,
          breed: update.breed ?? ((parsed.breed as string | null) || null),
        };
        femalesAttemptedCreate++;
        const { error: insErr } = await platformDb.from("females").insert(newFemale);
        if (insErr) {
          femalesNotFound++;
          errors.push(`females insert ${identifier}: ${insErr.message}`);
        } else {
          femalesCreated++;
        }
      }
    }

    // ========================================
    // STEP 2: Insert into genomic_results (depois dos animais: o trigger
    // sync_genomic_to_female da Platform ja encontra as femeas novas e grava o vinculo)
    // ========================================
    const grRows = parsedRows.map((parsed) => {
      const grRow: Record<string, unknown> = {
        client_id,
        service_order_id: service_order_id || null,
        file_name: fileName,
        file_path,
        uploaded_at: new Date().toISOString(),
        visivel_toolss: true,
        visivel_ssgen: true,
      };
      for (const [canon, val] of Object.entries(parsed)) {
        if (!GENOMIC_RESULTS_FIELDS.has(canon)) continue;
        const grCol = GR_COLUMN_RENAME[canon] ?? canon;
        grRow[grCol] = val;
      }
      return grRow;
    });

    let grInserted = 0;
    for (let i = 0; i < grRows.length; i += 500) {
      const batch = grRows.slice(i, i + 500);
      const { data: ins, error: insErr } = await platformDb
        .from("genomic_results")
        .insert(batch)
        .select("id, animal_id, registro");

      if (insErr) {
        errors.push(`genomic_results batch ${Math.floor(i / 500) + 1}: ${insErr.message}`);
      } else {
        grInserted += ins?.length ?? 0;
      }
    }

    // ========================================
    // STEP 3: Update service order stage
    // ========================================
    if (service_order_id && grInserted > 0) {
      await platformDb
        .from("service_orders")
        .update({
          etapa_atual: "Receb. Resultados",
          dt_receb_resultados: new Date().toISOString().slice(0, 10),
          liberacao_n_amostras: grInserted,
          result_file_path: file_path,
          updated_at: new Date().toISOString(),
        })
        .eq("id", service_order_id);
    }

    // ========================================
    // STEP 4: Notify linked users
    // ========================================
    if (grInserted > 0) {
      const { data: linkedUsers } = await clientDb
        .from("client_links")
        .select("user_id")
        .eq("platform_client_id", client_id);

      if (linkedUsers && linkedUsers.length > 0) {
        const notifications = linkedUsers.map((link: { user_id: string }) => ({
          user_id: link.user_id,
          type: "result_released" as const,
          title: "Novos resultados genomicos",
          body: `${grInserted} resultado${grInserted > 1 ? "s" : ""} genomico${grInserted > 1 ? "s" : ""} ${grInserted > 1 ? "foram liberados" : "foi liberado"}.`,
          metadata: { service_order_id, client_id, count: grInserted, file_name: fileName },
        }));

        await clientDb.from("notifications").insert(notifications);
      }
    }

    const summary = {
      success: true,
      genomic_results_inserted: grInserted,
      females_proofs_updated: femalesUpdated,
      females_created: femalesCreated,
      females_not_found: femalesNotFound,
      total_rows: parsedRows.length,
      mapped_columns: [...new Set(Object.values(headerMapping))],
      unmapped_columns: unmapped.length > 0 ? unmapped : undefined,
      errors: errors.length > 0 ? errors.slice(0, 50) : undefined,
    };
    let problem: string | null = null;
    if (grInserted === 0) problem = "Nenhuma linha gravada em genomic_results";
    else if (femalesAttemptedCreate > 0 && femalesCreated === 0) problem = `Nenhum dos ${femalesAttemptedCreate} animais novos foi criado`;
    await finish(problem ? "erro" : "ok", problem ? { ...summary, error: problem } : summary);
    return new Response(JSON.stringify(problem ? { ...summary, success: false, error: problem } : summary), {
      status: problem ? 422 : 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    try {
      if (ctx.file_path) {
        await createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!)
          .from("result_ingestions")
          .upsert({ file_path: ctx.file_path, client_id: ctx.client_id ?? null, status: "erro", finished_at: new Date().toISOString(), result: { error: (err as Error).message } }, { onConflict: "file_path" });
      }
    } catch { /* registro de erro e melhor-esforco */ }
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
