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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
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

    // Fetch botijões
    const { data: botijoes } = await supabase
      .from("botijoes")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    // Fetch itens
    const { data: itens } = await supabase
      .from("botijao_itens")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at");

    // Fetch nitrogen records
    const { data: nitrogen } = await supabase
      .from("nitrogen_records")
      .select("*")
      .eq("user_id", user.id)
      .order("data_abastecimento", { ascending: false });

    return new Response(JSON.stringify({
      botijoes: botijoes ?? [],
      itens: itens ?? [],
      nitrogen: nitrogen ?? [],
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
