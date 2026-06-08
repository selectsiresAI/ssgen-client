import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BotijaoPayload {
  id?: string;
  nome: string;
  canecas: number;
  capacidade_litros: number;
}

interface ItemPayload {
  id?: string;
  botijao_id: string;
  touro_code: string;
  touro_name?: string;
  touro_breed?: string;
  tipo: string;
  doses: number;
  preco: number;
  caneca: number;
  observacoes?: string;
}

interface NitrogenPayload {
  id?: string;
  botijao_id?: string;
  data_abastecimento: string;
  volume: number;
  observacoes?: string;
}

interface RequestBody {
  action: "upsert_botijao" | "delete_botijao" | "upsert_item" | "delete_item" | "add_nitrogen" | "delete_nitrogen";
  botijao?: BotijaoPayload;
  item?: ItemPayload;
  nitrogen?: NitrogenPayload;
  id?: string;
}

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

    const userId = user.id;
    const body: RequestBody = await req.json();

    let result: unknown = null;

    switch (body.action) {
      case "upsert_botijao": {
        const b = body.botijao!;
        if (b.id) {
          const { data, error } = await supabase
            .from("botijoes")
            .update({ nome: b.nome, canecas: b.canecas, capacidade_litros: b.capacidade_litros, updated_at: new Date().toISOString() })
            .eq("id", b.id)
            .eq("user_id", userId)
            .select()
            .single();
          if (error) throw error;
          result = data;
        } else {
          const { data, error } = await supabase
            .from("botijoes")
            .insert({ user_id: userId, nome: b.nome, canecas: b.canecas, capacidade_litros: b.capacidade_litros })
            .select()
            .single();
          if (error) throw error;
          result = data;
        }
        break;
      }

      case "delete_botijao": {
        const { error } = await supabase
          .from("botijoes")
          .delete()
          .eq("id", body.id!)
          .eq("user_id", userId);
        if (error) throw error;
        result = { deleted: true };
        break;
      }

      case "upsert_item": {
        const item = body.item!;
        if (item.id) {
          const { data, error } = await supabase
            .from("botijao_itens")
            .update({
              botijao_id: item.botijao_id,
              touro_code: item.touro_code,
              touro_name: item.touro_name ?? null,
              touro_breed: item.touro_breed ?? null,
              tipo: item.tipo,
              doses: item.doses,
              preco: item.preco,
              caneca: item.caneca,
              observacoes: item.observacoes ?? "",
              updated_at: new Date().toISOString(),
            })
            .eq("id", item.id)
            .eq("user_id", userId)
            .select()
            .single();
          if (error) throw error;
          result = data;
        } else {
          const { data, error } = await supabase
            .from("botijao_itens")
            .insert({
              user_id: userId,
              botijao_id: item.botijao_id,
              touro_code: item.touro_code,
              touro_name: item.touro_name ?? null,
              touro_breed: item.touro_breed ?? null,
              tipo: item.tipo,
              doses: item.doses,
              preco: item.preco,
              caneca: item.caneca,
              observacoes: item.observacoes ?? "",
            })
            .select()
            .single();
          if (error) throw error;
          result = data;
        }
        break;
      }

      case "delete_item": {
        const { error } = await supabase
          .from("botijao_itens")
          .delete()
          .eq("id", body.id!)
          .eq("user_id", userId);
        if (error) throw error;
        result = { deleted: true };
        break;
      }

      case "add_nitrogen": {
        const n = body.nitrogen!;
        const { data, error } = await supabase
          .from("nitrogen_records")
          .insert({
            user_id: userId,
            botijao_id: n.botijao_id ?? null,
            data_abastecimento: n.data_abastecimento,
            volume: n.volume,
            observacoes: n.observacoes ?? "",
          })
          .select()
          .single();
        if (error) throw error;
        result = data;
        break;
      }

      case "delete_nitrogen": {
        const { error } = await supabase
          .from("nitrogen_records")
          .delete()
          .eq("id", body.id!)
          .eq("user_id", userId);
        if (error) throw error;
        result = { deleted: true };
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Invalid action" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

    return new Response(JSON.stringify({ data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
