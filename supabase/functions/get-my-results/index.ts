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
      return new Response(JSON.stringify({ data: [], total: 0, page: 1, per_page: 20 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") ?? "1");
    const perPage = Math.min(parseInt(url.searchParams.get("per_page") ?? "20"), 100);
    const search = url.searchParams.get("search");
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = platformDb
      .from("genomic_results")
      .select("id, client_id, service_order_id, animal_id, nome_animal, registro, data_nascimento, sexo, raca, pta_milk, pta_fat, pta_protein, pta_pl, pta_scs, pta_dpr, tpi, nmpf, hhp_dollar, bvh, blad, dumps, mf, cvm, file_name, uploaded_at", { count: "exact" })
      .in("client_id", clientIds)
      .eq("visivel_ssgen", true)
      .order("uploaded_at", { ascending: false })
      .range(from, to);

    if (search) {
      query = query.or(`nome_animal.ilike.%${search}%,animal_id.ilike.%${search}%,registro.ilike.%${search}%`);
    }

    const { data: results, count, error } = await query;
    if (error) throw error;

    return new Response(JSON.stringify({ data: results ?? [], total: count, page, per_page: perPage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
