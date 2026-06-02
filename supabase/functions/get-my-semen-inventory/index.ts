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
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const search = url.searchParams.get("search") ?? "";

    // Get distinct sire_naab from client's females
    const { data: females } = await platformDb
      .from("females")
      .select("sire_naab")
      .in("client_id", clientIds)
      .not("sire_naab", "is", null);

    const naabSet = new Set<string>();
    (females ?? []).forEach((f: { sire_naab: string | null }) => {
      if (f.sire_naab) naabSet.add(f.sire_naab);
    });

    if (naabSet.size === 0) {
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const naabCodes = Array.from(naabSet);

    // Count daughters per sire
    const daughterCount = new Map<string, number>();
    (females ?? []).forEach((f: { sire_naab: string | null }) => {
      if (f.sire_naab) {
        daughterCount.set(f.sire_naab, (daughterCount.get(f.sire_naab) ?? 0) + 1);
      }
    });

    // Fetch bull data
    let bullQuery = platformDb
      .from("bulls_denorm")
      .select("code, name, registration, company, hhp_dollar, tpi, nm_dollar, cm_dollar, fm_dollar, gm_dollar, f_sav, ptam, cfp, ptaf, ptaf_pct, ptap, ptap_pct, pl, dpr, liv, scs, mast, met, rp, da, ket, mf, ptat, udc, flc, sce, dce, ssb, dsb, h_liv, ccr, hcr, fi, bwc, sta, str, dfm, rua, rls, rtp, ftl, rw, rlr, fta, fls, fua, ruh, ruw, ucl, udp, ftp, rfi, beta_casein, kappa_casein, gfi")
      .in("code", naabCodes);

    if (search) {
      bullQuery = bullQuery.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data: bulls, error } = await bullQuery;
    if (error) throw error;

    const enriched = (bulls ?? []).map((b: Record<string, unknown>) => ({
      ...b,
      daughters_count: daughterCount.get(b.code as string) ?? 0,
    }));

    // Sort by daughters count desc
    enriched.sort((a: { daughters_count: number }, b: { daughters_count: number }) => b.daughters_count - a.daughters_count);

    return new Response(JSON.stringify({ data: enriched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
