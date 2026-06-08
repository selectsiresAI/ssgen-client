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
// Formula: Select Sires HHP+ Index (15 traits)
function calcHHP(f: Record<string, unknown>): number | null {
  const n = (k: string) => typeof f[k] === "number" ? f[k] as number : null;
  const ptaf = n("ptaf");
  const ptap = n("ptap");
  const pl = n("pl");
  const liv = n("liv");
  const scs = n("scs");
  const dpr = n("dpr");
  const ccr = n("ccr");
  const rfi = n("rfi");
  const sta = n("sta");
  const dfm = n("dfm");
  const ruw = n("ruw");
  const udp = n("udp");
  const rtp = n("rtp");
  const ftl = n("ftl");
  const mast = n("mast");

  // Need at least the core traits
  if (ptaf == null || ptap == null || pl == null || scs == null || dpr == null) return null;

  return Math.round((
    4.91 * ptaf +
    6.01 * ptap +
    12.83 * pl +
    10.69 * (liv ?? 0) +
    (-158.56) * ((scs) - 3) +
    19.3 * dpr +
    15.84 * (ccr ?? 0) +
    (-0.19) * (rfi ?? 0) +
    (-13.32) * (sta ?? 0) +
    (-8.88) * (dfm ?? 0) +
    8.88 * (ruw ?? 0) +
    13.32 * (udp ?? 0) +
    (-14.80) * (Math.abs(rtp ?? 0.65) - 0.65) +
    (-26.64) * (Math.abs(ftl ?? 0.50) - 0.50) +
    25.37 * (mast ?? 0)
  ) * 100) / 100;
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
      "rfi", "beta_casein", "kappa_casein", "gfi",
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
    const enriched = (females ?? []).map((f: Record<string, unknown>) => {
      const row = { ...f };

      // Auto-classify category from birth_date if missing
      if (!row.category || row.category === "Indefinida") {
        const { category, parity_order } = autoCategory(row.birth_date as string | null);
        row.category = category;
        row.parity_order = parity_order;
      }

      // Auto-calculate HHP$ if missing
      if (row.hhp_dollar == null) {
        row.hhp_dollar = calcHHP(row);
      }

      return row;
    });

    return new Response(JSON.stringify({ data: enriched, total: totalCount, page, per_page: perPage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
