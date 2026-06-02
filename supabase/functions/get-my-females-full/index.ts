import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "200"), 500);
    const serviceOrderId = url.searchParams.get("service_order_id");
    const search = url.searchParams.get("search") ?? "";
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    // Build select with ALL PTA columns (using PostgREST aliases where DB column name differs)
    const selectCols = [
      "id", "client_id", "ear_tag", "name", "registration", "birth_date",
      "breed", "category", "status", "parity_order",
      "sire_naab", "mgs_naab", "mmgs_naab", "genomic_result_id",
      // Direct columns (same name in DB)
      "hhp_dollar", "tpi", "nm_dollar", "cm_dollar", "fm_dollar", "gm_dollar",
      "f_sav", "cfp", "da", "ket", "mast", "met", "rp", "ssb", "dsb",
      "h_liv", "fi", "gl", "efc", "bwc",
      "sta", "dfm", "rua", "rls", "rtp", "ftl", "rw", "rlr",
      "fta", "fls", "fua", "ruh", "ruw", "ucl", "udp", "ftp",
      "rfi", "beta_casein", "kappa_casein", "gfi",
      // Aliased columns (DB name differs from frontend convention)
      "ptam:pta_milk", "ptaf:pta_fat", "ptaf_pct:pta_fat_pct",
      "ptap:pta_protein", "ptap_pct:pta_protein_pct",
      "pl:pta_pl", "dpr:pta_dpr", "liv:pta_livability", "scs:pta_scs",
      "mf:mf_num", "str:str_num",
      "ptat:pta_ptat", "udc:pta_udc", "flc:pta_flc",
      "sce:pta_sce", "ccr:pta_ccr", "hcr:pta_hcr",
      "created_at",
    ].join(", ");

    let query = platformDb
      .from("females")
      .select(selectCols, { count: "exact" })
      .in("client_id", clientIds)
      .order("name", { ascending: true })
      .range(from, to);

    // Filter by service order: find genomic_result_ids for that SO
    if (serviceOrderId) {
      const { data: grIds } = await platformDb
        .from("genomic_results")
        .select("id")
        .eq("service_order_id", serviceOrderId);
      const resultIds = (grIds ?? []).map((r: { id: string }) => r.id);
      if (resultIds.length === 0) {
        return new Response(JSON.stringify({ data: [], total: 0, page, per_page: perPage }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      query = query.in("genomic_result_id", resultIds);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,ear_tag.ilike.%${search}%,registration.ilike.%${search}%`);
    }

    const { data: females, count, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify({ data: females ?? [], total: count ?? 0, page, per_page: perPage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
