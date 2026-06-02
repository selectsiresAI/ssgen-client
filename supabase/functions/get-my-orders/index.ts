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
    const status = url.searchParams.get("status");
    const from = (page - 1) * perPage;
    const to = from + perPage - 1;

    let query = platformDb
      .from("service_orders")
      .select("id, client_id, ordem_servico_ssgen, ordem_servico_neogen, nome_produto, numero_amostras, etapa_atual, prioridade, cra_data, envio_resultados_previsao, envio_resultados_data, dt_receb_resultados, liberacao_data, dt_faturamento, created_at", { count: "exact" })
      .in("client_id", clientIds)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (status === "in_progress") {
      query = query.neq("etapa_atual", "Faturamento");
    } else if (status) {
      query = query.eq("etapa_atual", status);
    }

    const { data: orders, count, error } = await query;
    if (error) throw error;

    // Enrich with client name
    const { data: clients } = await platformDb
      .from("clients")
      .select("id, nome, farm_name")
      .in("id", clientIds);

    const clientMap = new Map((clients ?? []).map((c: { id: string; nome: string; farm_name: string }) => [c.id, c]));

    const enriched = (orders ?? []).map((o: Record<string, unknown>) => ({
      ...o,
      client_name: (clientMap.get(o.client_id as string) as { nome?: string } | undefined)?.nome ?? null,
      farm_name: (clientMap.get(o.client_id as string) as { farm_name?: string } | undefined)?.farm_name ?? null,
    }));

    return new Response(JSON.stringify({ data: enriched, total: count, page, per_page: perPage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
