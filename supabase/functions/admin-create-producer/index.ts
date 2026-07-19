import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateProducerRequest {
  email: string;
  password?: string;
  full_name: string;
  phone?: string;
  platform_client_ids: string[]; // clients this producer can see
  breed?: string; // 'HO' | 'JE' — grava clients.default_breed nas fazendas vinculadas
}

function normBreed(b: unknown): "HO" | "JE" {
  const u = String(b ?? "").trim().toUpperCase();
  return (u === "JE" || u === "JER" || u === "JERSEY") ? "JE" : "HO";
}

interface BulkCreateRequest {
  producers: CreateProducerRequest[];
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

    // Auth: admin only
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

    const { data: profile } = await clientDb
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.pathname.split("/").pop();

    // ============================
    // GET /admin-create-producer/list — List existing producers + their links
    // ============================
    if (req.method === "GET" && action === "list") {
      const { data: users } = await clientDb.auth.admin.listUsers({ perPage: 500 });

      const { data: links } = await clientDb
        .from("client_links")
        .select("user_id, platform_client_id");

      const { data: profiles } = await clientDb
        .from("profiles")
        .select("id, email, full_name, phone, role");

      const platformDb = createClient(
        Deno.env.get("PLATFORM_URL")!,
        Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
      );

      // Get client names
      const clientIds = [...new Set((links ?? []).map((l: { platform_client_id: string }) => l.platform_client_id))];
      let clientMap: Record<string, string> = {};
      if (clientIds.length > 0) {
        const { data: clients } = await platformDb
          .from("clients")
          .select("id, nome")
          .in("id", clientIds);
        clientMap = Object.fromEntries((clients ?? []).map((c: { id: string; nome: string }) => [c.id, c.nome]));
      }

      const profileMap = Object.fromEntries(
        (profiles ?? []).map((p: Record<string, unknown>) => [p.id as string, p])
      );

      const linksMap: Record<string, { platform_client_id: string; client_name: string }[]> = {};
      for (const link of (links ?? [])) {
        const l = link as { user_id: string; platform_client_id: string };
        if (!linksMap[l.user_id]) linksMap[l.user_id] = [];
        linksMap[l.user_id].push({
          platform_client_id: l.platform_client_id,
          client_name: clientMap[l.platform_client_id] ?? "Desconhecido",
        });
      }

      const result = (users?.users ?? []).map((u: { id: string; email?: string; created_at: string }) => ({
        id: u.id,
        email: u.email,
        full_name: (profileMap[u.id] as Record<string, unknown>)?.full_name ?? null,
        role: (profileMap[u.id] as Record<string, unknown>)?.role ?? "user",
        created_at: u.created_at,
        client_links: linksMap[u.id] ?? [],
      }));

      return new Response(JSON.stringify({ data: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================
    // POST /admin-create-producer/create — Create single producer
    // ============================
    if (req.method === "POST" && (action === "create" || action === "admin-create-producer")) {
      const body = await req.json() as CreateProducerRequest | BulkCreateRequest;

      const producers = "producers" in body ? body.producers : [body];
      const results: { email: string; success: boolean; error?: string; user_id?: string }[] = [];

      for (const p of producers) {
        try {
          const password = p.password || generatePassword();

          // Create auth user
          const { data: newUser, error: createErr } = await clientDb.auth.admin.createUser({
            email: p.email,
            password,
            email_confirm: true,
            user_metadata: { full_name: p.full_name },
          });

          if (createErr) {
            results.push({ email: p.email, success: false, error: createErr.message });
            continue;
          }

          const userId = newUser.user.id;

          // Create profile
          await clientDb.from("profiles").upsert({
            id: userId,
            email: p.email,
            full_name: p.full_name,
            phone: p.phone ?? null,
            role: "user",
            locale: "pt-BR",
          });

          // Create client_links
          if (p.platform_client_ids && p.platform_client_ids.length > 0) {
            const links = p.platform_client_ids.map((clientId: string) => ({
              user_id: userId,
              platform_client_id: clientId,
            }));
            await clientDb.from("client_links").insert(links);

            // Set default_breed on the linked Platform clients (onboarding breed flag)
            if (p.breed) {
              const platformDb = createClient(
                Deno.env.get("PLATFORM_URL")!,
                Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
              );
              await platformDb.from("clients")
                .update({ default_breed: normBreed(p.breed) })
                .in("id", p.platform_client_ids);
            }
          }

          results.push({
            email: p.email,
            success: true,
            user_id: userId,
          });
        } catch (err) {
          results.push({ email: p.email, success: false, error: (err as Error).message });
        }
      }

      const successCount = results.filter((r) => r.success).length;

      return new Response(JSON.stringify({
        success: successCount > 0,
        created: successCount,
        failed: results.length - successCount,
        results,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================
    // POST /admin-create-producer/link — Add client_link to existing user
    // ============================
    if (req.method === "POST" && action === "link") {
      const { user_id, platform_client_id } = await req.json() as {
        user_id: string;
        platform_client_id: string;
      };

      const { error } = await clientDb.from("client_links").insert({
        user_id,
        platform_client_id,
      });

      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ============================
    // POST /admin-create-producer/set-breed — Set default_breed on a Platform client
    // ============================
    if (req.method === "POST" && action === "set-breed") {
      const { platform_client_id, breed } = await req.json() as {
        platform_client_id: string; breed: string;
      };
      const platformDb = createClient(
        Deno.env.get("PLATFORM_URL")!,
        Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
      );
      const { error } = await platformDb.from("clients")
        .update({ default_breed: normBreed(breed) })
        .eq("id", platform_client_id);
      if (error) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ success: true, breed: normBreed(breed) }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action. Use /list, /create, /link, or /set-breed" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function generatePassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let pass = "";
  for (let i = 0; i < 12; i++) {
    pass += chars[Math.floor(Math.random() * chars.length)];
  }
  return pass + "!";
}
