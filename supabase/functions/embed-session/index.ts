// embed-session — gera um link de login de USO ÚNICO para a conta SSGEN da Fazenda Pérola (Matheus Freire),
// para o DS360 embutir o SSGEN dentro do menu Genética da Pérola (aba "SSGEN").
//
// Segurança (pedido do Diego, 27/10/2026):
//  - só responde a pedido ASSINADO pelo DS360: HMAC-SHA256(segredo compartilhado, "<ts>|<email>") em x-embed-sig,
//    com x-embed-ts em milissegundos e janela de 60 s;
//  - só gera acesso para UMA conta fixa (EMBED_USER_EMAIL, padrão matheusrfreire@gmail.com): não aceita e-mail
//    vindo do pedido;
//  - o link é o magiclink do Supabase (uso único); não é gravado nem logado aqui.
// verify_jwt = false de propósito: quem chama é o servidor do DS360, que não tem JWT do Supabase.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const EMAIL = (Deno.env.get("EMBED_USER_EMAIL") ?? "matheusrfreire@gmail.com").trim().toLowerCase();
const DESTINO = "https://www.ssgen.com.br/";
const JANELA_MS = 60_000;
const enc = new TextEncoder();

function json(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { "Content-Type": "application/json" } });
}

async function hmacHex(segredo: string, msg: string): Promise<string> {
  const chave = await crypto.subtle.importKey("raw", enc.encode(segredo), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const ass = new Uint8Array(await crypto.subtle.sign("HMAC", chave, enc.encode(msg)));
  return Array.from(ass).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function iguais(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const segredo = Deno.env.get("EMBED_SHARED_SECRET");
  if (!segredo) return json({ error: "not configured" }, 500);

  const ts = req.headers.get("x-embed-ts") ?? "";
  const sig = (req.headers.get("x-embed-sig") ?? "").toLowerCase();
  if (!/^\d{13}$/.test(ts) || Math.abs(Date.now() - Number(ts)) > JANELA_MS) return json({ error: "unauthorized" }, 401);
  if (!iguais(await hmacHex(segredo, `${ts}|${EMAIL}`), sig)) return json({ error: "unauthorized" }, 401);

  const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "magiclink",
    email: EMAIL,
    options: { redirectTo: DESTINO },
  });
  const url = data?.properties?.action_link;
  if (error || !url) return json({ error: "link generation failed" }, 500);
  return json({ url });
});
