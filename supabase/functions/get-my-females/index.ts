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
      return new Response(JSON.stringify({ data: [], total: 0, page: 1, per_page: 50 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "50"), 200);
    const search = url.searchParams.get("search");
    const genotyped = url.searchParams.get("genotyped");
    const breed = url.searchParams.get("breed");
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = platformDb
      .from("females")
      .select("id, client_id, ear_tag, name, registration, birth_date, breed, category, status, pta_milk, pta_fat, pta_protein, pta_pl, pta_scs, pta_dpr, tpi, nmpf, hhp_dollar, genomic_result_id, sire_naab, mgs_naab, mmgs_naab, created_at", { count: "exact" })
      .in("client_id", clientIds)
      .is("deleted_at", null)
      .order("name", { ascending: true })
      .range(from, to);

    if (search) {
      query = query.or(`name.ilike.%${search}%,ear_tag.ilike.%${search}%,registration.ilike.%${search}%`);
    }
    if (genotyped === "true") {
      query = query.not("genomic_result_id", "is", null);
    } else if (genotyped === "false") {
      query = query.is("genomic_result_id", null);
    }
    if (breed) {
      query = query.ilike("breed", `%${breed}%`);
    }

    const { data: females, count, error } = await query;
    if (error) throw error;

    // ── Enrich with sire/mgs/mmgs bull names (best-effort, batch lookup) ──
    const naabCodes = Array.from(new Set(
      (females ?? []).flatMap((f: Record<string, unknown>) => [f.sire_naab, f.mgs_naab, f.mmgs_naab])
        .filter((c): c is string => typeof c === "string" && c.trim() !== ""),
    ));

    let bullNameByCode = new Map<string, string | null>();
    if (naabCodes.length > 0) {
      const { data: bulls } = await platformDb
        .from("bulls_denorm")
        .select("code, name")
        .in("code", naabCodes);
      bullNameByCode = new Map((bulls ?? []).map((b: { code: string; name: string | null }) => [b.code, b.name]));
    }

    const enrichedFemales = (females ?? []).map((f: Record<string, unknown>) => ({
      ...f,
      sire_name: typeof f.sire_naab === "string" ? bullNameByCode.get(f.sire_naab) ?? null : null,
      mgs_name: typeof f.mgs_naab === "string" ? bullNameByCode.get(f.mgs_naab) ?? null : null,
      mmgs_name: typeof f.mmgs_naab === "string" ? bullNameByCode.get(f.mmgs_naab) ?? null : null,
    }));

    return new Response(JSON.stringify({ data: enrichedFemales, total: count, page, per_page: perPage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
