import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Versão vigente da Política de Privacidade. Mudou o texto => subir a versão aqui e em src/lib/privacy.ts
// (todos os usuários passam a ver a tela de aceite de novo).
const CURRENT_VERSION = "1.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const jwt = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!jwt) return json({ error: "não autenticado" }, 401);

  const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data: auth, error: authErr } = await db.auth.getUser(jwt);
  const user = auth?.user;
  if (authErr || !user) return json({ error: "sessão inválida" }, 401);

  const body = await req.json().catch(() => ({})) as {
    action?: string; version?: string; hash?: string; locale?: string; marketing?: boolean; source?: string;
  };
  const action = body.action ?? "status";

  const status = async () => {
    const { data: rows } = await db
      .from("privacy_consents")
      .select("kind, policy_version, marketing_opt_in, accepted_at")
      .eq("user_id", user.id)
      .order("accepted_at", { ascending: false })
      .limit(50);
    const list = rows ?? [];
    const accepted = list.find((r) => r.kind === "accept" && r.policy_version === CURRENT_VERSION);
    return {
      current_version: CURRENT_VERSION,
      accepted: !!accepted,
      accepted_at: accepted?.accepted_at ?? null,
      marketing_opt_in: list[0]?.marketing_opt_in ?? false,
    };
  };

  if (action === "status") return json(await status());

  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || null;
  const ua = req.headers.get("user-agent");
  const base = {
    user_id: user.id,
    user_email: user.email ?? null,
    policy_version: CURRENT_VERSION,
    policy_hash: typeof body.hash === "string" ? body.hash.slice(0, 128) : null,
    ip,
    user_agent: ua ? ua.slice(0, 400) : null,
    locale: typeof body.locale === "string" ? body.locale.slice(0, 10) : null,
    source: typeof body.source === "string" ? body.source.slice(0, 30) : "portal",
  };

  if (action === "accept") {
    if (body.version !== CURRENT_VERSION) return json({ error: "versão da política desatualizada, recarregue a página" }, 409);
    const { error } = await db.from("privacy_consents").insert({ ...base, kind: "accept", marketing_opt_in: body.marketing === true });
    if (error) return json({ error: error.message }, 500);
    return json(await status());
  }

  if (action === "marketing") {
    const cur = await status();
    if (!cur.accepted) return json({ error: "aceite a política primeiro" }, 400);
    const { error } = await db.from("privacy_consents").insert({ ...base, kind: "marketing_change", marketing_opt_in: body.marketing === true });
    if (error) return json({ error: error.message }, 500);
    return json(await status());
  }

  return json({ error: "ação inválida" }, 400);
});
