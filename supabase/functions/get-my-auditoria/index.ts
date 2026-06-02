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
      return new Response(JSON.stringify({ data: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const step = url.searchParams.get("step");
    const serviceOrderId = url.searchParams.get("service_order_id");

    // Helper: get female IDs filtered by service order if provided
    async function getFemaleFilter() {
      if (!serviceOrderId) return null; // null = no filter, use all
      const { data: grIds } = await platformDb
        .from("genomic_results")
        .select("id")
        .eq("service_order_id", serviceOrderId);
      return (grIds ?? []).map((r: { id: string }) => r.id);
    }

    // Map frontend trait names → actual DB column names (with PostgREST alias syntax)
    const TRAIT_ALIAS: Record<string, string> = {
      ptam: "ptam:pta_milk", ptaf: "ptaf:pta_fat", ptaf_pct: "ptaf_pct:pta_fat_pct",
      ptap: "ptap:pta_protein", ptap_pct: "ptap_pct:pta_protein_pct",
      pl: "pl:pta_pl", dpr: "dpr:pta_dpr", liv: "liv:pta_livability", scs: "scs:pta_scs",
      mf: "mf:mf_num", str: "str:str_num",
      ptat: "ptat:pta_ptat", udc: "udc:pta_udc", flc: "flc:pta_flc",
      sce: "sce:pta_sce", ccr: "ccr:pta_ccr", hcr: "hcr:pta_hcr",
    };

    function mapSelectCols(cols: string): string {
      return cols.split(",").map(c => {
        const t = c.trim();
        return TRAIT_ALIAS[t] ?? t;
      }).join(", ");
    }

    // Helper: build base female query with client and optional SO filter
    async function getFemales(selectCols: string) {
      const mappedCols = mapSelectCols(selectCols);
      const resultIds = await getFemaleFilter();
      let query = platformDb
        .from("females")
        .select(mappedCols)
        .in("client_id", clientIds);
      if (resultIds !== null) {
        if (resultIds.length === 0) return [];
        query = query.in("genomic_result_id", resultIds);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data ?? [];
    }

    if (step === "1") {
      // Step 1: Parentage overview
      const females = await getFemales("sire_naab, mgs_naab, mmgs_naab");
      const roles = ["sire", "mgs", "mmgs"] as const;
      const result: { role: string; status: string; n: number; pct: number }[] = [];
      const total = females.length;

      for (const role of roles) {
        const field = role === "sire" ? "sire_naab" : role === "mgs" ? "mgs_naab" : "mmgs_naab";
        let informed = 0;
        let unknown = 0;
        females.forEach((f: Record<string, unknown>) => {
          const val = f[field] as string | null;
          if (val && val.trim() !== "" && val !== "0" && val.toUpperCase() !== "DESCONHECIDO") {
            informed++;
          } else {
            unknown++;
          }
        });
        if (unknown > 0) result.push({ role, status: "Desconhecido", n: unknown, pct: total > 0 ? (unknown / total) * 100 : 0 });
        if (informed > 0) result.push({ role, status: "Completo", n: informed, pct: total > 0 ? (informed / total) * 100 : 0 });
      }

      return new Response(JSON.stringify({ data: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (step === "2") {
      // Step 2: Top parents
      const parentType = url.searchParams.get("parent_type") ?? "sire";
      const orderTrait = url.searchParams.get("order_trait") ?? "hhp_dollar";
      const limit = parseInt(url.searchParams.get("limit") ?? "20");
      const field = parentType === "mgs" ? "mgs_naab" : "sire_naab";

      const females = await getFemales(`${field}, ${orderTrait}`);

      // Group by parent NAAB
      const groups = new Map<string, { count: number; traitSum: number; traitCount: number }>();
      females.forEach((f: Record<string, unknown>) => {
        const naab = f[field] as string | null;
        if (!naab || naab.trim() === "" || naab === "0") return;
        const g = groups.get(naab) ?? { count: 0, traitSum: 0, traitCount: 0 };
        g.count++;
        const traitVal = f[orderTrait] as number | null;
        if (traitVal !== null && traitVal !== undefined && !Number.isNaN(Number(traitVal))) {
          g.traitSum += Number(traitVal);
          g.traitCount++;
        }
        groups.set(naab, g);
      });

      const sorted = Array.from(groups.entries())
        .map(([naab, g]) => ({
          parent_label: naab,
          daughters_count: g.count,
          trait_mean: g.traitCount > 0 ? g.traitSum / g.traitCount : null,
        }))
        .sort((a, b) => b.daughters_count - a.daughters_count)
        .slice(0, limit);

      return new Response(JSON.stringify({ data: sorted }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (step === "4") {
      // Step 4: Linear means
      const traitsParam = url.searchParams.get("traits") ?? "sta,str,dfm,rua,rls,rtp,ftl,rw,rlr,fta,fls,fua,ruh,ruw,ucl,udp,ftp";
      const traits = traitsParam.split(",").map(t => t.trim()).filter(Boolean);

      const selectCols = ["id", ...traits].join(", ");
      const females = await getFemales(selectCols);

      const result: { trait_key: string; group_label: string; mean_value: number; n: number }[] = [];

      for (const trait of traits) {
        const values = females
          .map((f: Record<string, unknown>) => Number(f[trait]))
          .filter((v: number) => Number.isFinite(v));

        if (values.length > 0) {
          const mean = values.reduce((a: number, b: number) => a + b, 0) / values.length;
          result.push({
            trait_key: trait,
            group_label: "Rebanho",
            mean_value: mean,
            n: values.length,
          });
        }
      }

      return new Response(JSON.stringify({ data: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (step === "7") {
      // Step 7: Distribution - return raw PTA values
      const traitsParam = url.searchParams.get("traits") ?? "hhp_dollar,tpi,nm_dollar,dpr,pl,scs";
      const traits = traitsParam.split(",").map(t => t.trim()).filter(Boolean);

      const selectCols = ["id", ...traits].join(", ");
      const females = await getFemales(selectCols);

      // Return raw data - histogram will be calculated on frontend
      const result: Record<string, number[]> = {};
      for (const trait of traits) {
        result[trait] = females
          .map((f: Record<string, unknown>) => Number(f[trait]))
          .filter((v: number) => Number.isFinite(v));
      }

      return new Response(JSON.stringify({ data: result }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid step parameter" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
