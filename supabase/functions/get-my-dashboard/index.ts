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
      return new Response(JSON.stringify({
        total_females: 0,
        total_genotyped: 0,
        orders_in_progress: 0,
        orders_completed: 0,
        recent_results: 0,
        clients: [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const [femalesRes, genotypedRes, ordersProgressRes, ordersCompleteRes, recentResultsRes, clientsRes] = await Promise.all([
      platformDb.from("females").select("id", { count: "exact", head: true }).in("client_id", clientIds).is("deleted_at", null),
      platformDb.from("females").select("id", { count: "exact", head: true }).in("client_id", clientIds).not("genomic_result_id", "is", null).is("deleted_at", null),
      platformDb.from("service_orders").select("id", { count: "exact", head: true }).in("client_id", clientIds).not("etapa_atual", "in", '("Faturamento")').is("deleted_at", null),
      platformDb.from("service_orders").select("id", { count: "exact", head: true }).in("client_id", clientIds).eq("etapa_atual", "Faturamento").is("deleted_at", null),
      platformDb.from("genomic_results").select("id", { count: "exact", head: true }).in("client_id", clientIds).eq("visivel_ssgen", true),
      platformDb.from("clients").select("id, nome, farm_name, cidade, estado").in("id", clientIds).is("deleted_at", null),
    ]);

    return new Response(JSON.stringify({
      total_females: femalesRes.count ?? 0,
      total_genotyped: genotypedRes.count ?? 0,
      orders_in_progress: ordersProgressRes.count ?? 0,
      orders_completed: ordersCompleteRes.count ?? 0,
      recent_results: recentResultsRes.count ?? 0,
      clients: clientsRes.data ?? [],
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
