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
    const { email, master_password } = await req.json();

    if (!email || !master_password) {
      return new Response(JSON.stringify({ error: "email and master_password required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const expectedMaster = Deno.env.get("MASTER_PASSWORD");
    if (!expectedMaster || master_password !== expectedMaster) {
      return new Response(JSON.stringify({ error: "Invalid credentials" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Find user by email
    const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers({
      page: 1,
      perPage: 1,
    });

    // listUsers doesn't filter by email, so use a different approach
    const { data: linkData, error: linkErr } = await adminClient.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkErr) {
      return new Response(JSON.stringify({ error: `User not found or link error: ${linkErr.message}` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Extract the token_hash and verification type from the generated link
    const properties = linkData.properties;

    return new Response(JSON.stringify({
      token_hash: properties.hashed_token,
      type: "magiclink",
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
