import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Returns the breed index params (weights + reference catalog/benchmarks/trend)
// for the logged client's breed. Breed resolution order:
//   1. clients.default_breed (set at onboarding)
//   2. modal normalized breed among the client's females
//   3. 'HO' fallback
Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const clientDb = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const platformDb = createClient(
      Deno.env.get("PLATFORM_URL")!,
      Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
    );

    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: { user }, error: authError } = await createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
    ).auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Optional explicit override: ?breed=HO|JE
    const url = new URL(req.url);
    const forced = url.searchParams.get("breed");

    let breed = forced ?? null;

    if (!breed) {
      const { data: links } = await clientDb
        .from("client_links").select("platform_client_id").eq("user_id", user.id);
      const clientIds = (links ?? []).map((l: { platform_client_id: string }) => l.platform_client_id);

      if (clientIds.length > 0) {
        // 1) default_breed on the client(s)
        const { data: clients } = await platformDb
          .from("clients").select("default_breed").in("id", clientIds).is("deleted_at", null);
        breed = (clients ?? []).map((c: { default_breed: string | null }) => c.default_breed).find(Boolean) ?? null;

        // 2) modal breed among the client's females (normalized)
        if (!breed) {
          const { data: fem } = await platformDb
            .from("females").select("breed").in("client_id", clientIds).is("deleted_at", null).limit(5000);
          const counts: Record<string, number> = {};
          for (const f of (fem ?? []) as { breed: string | null }[]) {
            const b = normalize(f.breed);
            counts[b] = (counts[b] ?? 0) + 1;
          }
          breed = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
        }
      }
    }

    breed = normalize(breed); // 3) HO fallback + variant cleanup

    const { data: params, error: pErr } = await platformDb
      .from("breed_index_params").select("*").eq("breed", breed).maybeSingle();

    if (pErr || !params) {
      // last resort: HO
      const { data: ho } = await platformDb
        .from("breed_index_params").select("*").eq("breed", "HO").maybeSingle();
      return new Response(JSON.stringify({ breed: "HO", params: ho }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ breed, params }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function normalize(b: string | null): string {
  if (!b) return "HO";
  const u = b.trim().toUpperCase();
  if (u === "HO" || u === "HOL" || u === "HOLSTEIN") return "HO";
  if (u === "JE" || u === "JER" || u === "JERSEY") return "JE";
  return "HO";
}
