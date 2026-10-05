import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Recebe o evento de ordem de servico do Tracker (relay de sync-order-to-platform)
// e mantem a cadeia Tracker -> Platform -> ToolSS/SSGEN:
//   1. upsert da OS na Platform, com o MESMO client_id do Tracker (ids unificados em 05/10/2026)
//   2. se a OS tem arquivo de resultado novo, reserva o arquivo em result_ingestions
//      e dispara ingest-results em background (uma unica vez por arquivo)
// Chamado so com chave de servico deste projeto (o Tracker usa SSGEN_CLIENT_SERVICE_ROLE_KEY, JWT legado).
// O payload so fornece o id da OS: a OS e relida no Tracker, nunca se confia no corpo recebido.

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
// Leitura parada em 'processando' por mais que isso e considerada morta e e redisparada
const STALE_MINUTES = 15;

const errText = (raw: string): string => {
  try {
    const j = JSON.parse(raw);
    return String(j?.error ?? raw).slice(0, 300);
  } catch {
    return raw.slice(0, 300);
  }
};
const resultMsg = (detail: string) => `Resultado nao processado: ${detail}`;

// Chave de servico: a secret nova do projeto (env) ou o JWT legado service_role deste
// projeto. O JWT so chega aqui com assinatura valida porque a funcao roda com verify_jwt=true.
function isServiceToken(token: string): boolean {
  if (!token) return false;
  if (token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")) return true;
  try {
    const part = token.split(".")[1];
    if (!part) return false;
    const claims = JSON.parse(atob(part.replace(/-/g, "+").replace(/_/g, "/")));
    const ref = new URL(Deno.env.get("SUPABASE_URL")!).hostname.split(".")[0];
    return claims?.role === "service_role" && claims?.ref === ref;
  } catch {
    return false;
  }
}

Deno.serve(async (req: Request) => {
  const bearer = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
  if (!isServiceToken(bearer)) return json({ error: "Unauthorized" }, 401);

  const local = createClient(SUPABASE_URL, SERVICE_KEY);
  const platform = createClient(
    Deno.env.get("PLATFORM_URL")!,
    Deno.env.get("PLATFORM_SERVICE_ROLE_KEY")!,
  );
  const tracker = createClient(
    Deno.env.get("TRACKER_URL")!,
    Deno.env.get("TRACKER_SERVICE_ROLE_KEY")!,
  );

  let record: Record<string, unknown> | null = null;

  // So escreve no Tracker se o status mudar: a escrita dispara o trigger de novo,
  // e a volta seguinte chega aqui com o status ja igual e para.
  const setTrackerStatus = async (status: string, error: string | null) => {
    if (!record) return;
    if (record.sync_status === status && (record.sync_error ?? null) === error) return;
    await tracker.from("service_orders")
      .update({ sync_status: status, sync_error: error })
      .eq("id", record.id as string);
    record = { ...record, sync_status: status, sync_error: error };
  };

  try {
    const payload = await req.json();
    const osId = payload?.record?.id as string | undefined;
    if (!osId) return json({ error: "No record id" }, 400);

    // Fonte da verdade: a OS como esta no banco do Tracker
    const { data: os, error: osErr } = await tracker
      .from("service_orders")
      .select("*")
      .eq("id", osId)
      .maybeSingle();
    if (osErr) throw new Error(`leitura da OS no Tracker: ${osErr.message}`);
    if (!os) return json({ skipped: true, reason: "OS inexistente no Tracker" });
    record = os as Record<string, unknown>;
    if (record.deleted_at || !record.client_id) return json({ skipped: true });

    const clientId = record.client_id as string;
    const osNum = record.ordem_servico_ssgen;
    if (osNum === null || osNum === undefined || String(osNum).trim() === "") {
      await setTrackerStatus("erro", "OS sem numero SSGen: nao sincronizada com a Platform.");
      return json({ error: "OS sem ordem_servico_ssgen" });
    }

    // Cliente: mesmo id nos tres sistemas. Sem fallback por nome (nomes repetidos
    // na Platform mandavam a OS para o cadastro errado).
    const { data: client } = await platform
      .from("clients")
      .select("id")
      .eq("id", clientId)
      .is("deleted_at", null)
      .maybeSingle();

    if (!client) {
      const msg = `Cliente ${clientId} nao existe na Platform. Cadastre o cliente na Platform com o mesmo id do Tracker.`;
      await setTrackerStatus("erro", msg);
      console.log(`[tracker-order-sync] OS ${osNum} ERRO: ${msg}`);
      return json({ error: msg });
    }

    const orNull = (v: unknown) => (v === undefined || v === "" ? null : v);
    const orderData: Record<string, unknown> = {
      client_id: clientId,
      ordem_servico_ssgen: osNum,
      ordem_servico_neogen: orNull(record.ordem_servico_neogen),
      nome_produto: orNull(record.nome_produto),
      numero_amostras: orNull(record.numero_amostras),
      etapa_atual: record.etapa_atual || "Recebida",
      prioridade: orNull(record.prioridade),
      cra_data: orNull(record.cra_data),
      envio_planilha_data: orNull(record.envio_planilha_data),
      lpr_data: orNull(record.lpr_data),
      envio_resultados_data: orNull(record.envio_resultados_data),
      liberacao_data: orNull(record.liberacao_data),
      dt_faturamento: orNull(record.dt_faturamento),
      result_file_path: orNull(record.result_file_path),
      updated_at: new Date().toISOString(),
    };

    const { data: existing, error: exErr } = await platform
      .from("service_orders")
      .select("id, client_id")
      .eq("ordem_servico_ssgen", osNum);
    if (exErr) throw new Error(`busca OS na Platform: ${exErr.message}`);

    // Mesmo numero de OS em outro cliente: nao move a OS, sinaliza erro
    const other = (existing ?? []).find((o) => o.client_id !== clientId);
    const mine = (existing ?? []).find((o) => o.client_id === clientId);
    if (other && !mine) {
      const msg = `OS ${osNum} ja existe na Platform em outro cliente (${other.client_id}). Verificar antes de sincronizar.`;
      await setTrackerStatus("erro", msg);
      console.log(`[tracker-order-sync] OS ${osNum} ERRO: ${msg}`);
      return json({ error: msg });
    }

    let platformOsId: string | null = null;
    let action: string;
    if (mine) {
      const { error } = await platform
        .from("service_orders")
        .update(orderData)
        .eq("id", mine.id);
      if (error) throw new Error(`update OS: ${error.message}`);
      platformOsId = mine.id;
      action = "updated";
    } else {
      const { data, error } = await platform
        .from("service_orders")
        .insert({ ...orderData, created_at: record.created_at || new Date().toISOString() })
        .select("id");
      if (error) throw new Error(`insert OS: ${error.message}`);
      platformOsId = data?.[0]?.id ?? null;
      action = "inserted";
    }

    // Arquivo de resultado: estado vem de result_ingestions (trava por arquivo)
    let ingest = "sem arquivo";
    let finalStatus: string | null = "ok";
    let finalError: string | null = null;
    const filePath = record.result_file_path as string | null;

    if (filePath) {
      const claimRow = {
        file_path: filePath,
        client_id: clientId,
        service_order_id: platformOsId,
        status: "processando",
        started_at: new Date().toISOString(),
        finished_at: null,
        result: null,
      };
      const { data: claimed, error: claimErr } = await local
        .from("result_ingestions")
        .upsert(claimRow, { onConflict: "file_path", ignoreDuplicates: true })
        .select("file_path");
      if (claimErr) {
        await setTrackerStatus("erro", resultMsg(`falha ao reservar o arquivo (${claimErr.message})`));
        throw new Error(`reserva do arquivo: ${claimErr.message}`);
      }

      let dispatch = !!(claimed && claimed.length > 0);

      if (!dispatch) {
        const { data: row } = await local
          .from("result_ingestions")
          .select("status, started_at, result")
          .eq("file_path", filePath)
          .maybeSingle();
        ingest = row?.status ?? "desconhecido";

        if (row?.status === "processando") {
          const ageMin = (Date.now() - new Date(row.started_at as string).getTime()) / 60000;
          if (ageMin > STALE_MINUTES) {
            // Leitura anterior morreu sem registrar: retoma a reserva (condicional, so um vence)
            const { data: retaken } = await local
              .from("result_ingestions")
              .update({ started_at: new Date().toISOString(), service_order_id: platformOsId })
              .eq("file_path", filePath)
              .eq("status", "processando")
              .eq("started_at", row.started_at as string)
              .select("file_path");
            dispatch = !!(retaken && retaken.length > 0);
          }
          // Em processamento: nao mexe no status atual do Tracker
          if (!dispatch) finalStatus = null;
        } else if (row?.status === "erro") {
          finalStatus = "erro";
          const detail = (row.result as Record<string, unknown> | null)?.error ?? "ver result_ingestions";
          finalError = resultMsg(String(detail).slice(0, 300));
        }
      }

      if (dispatch) {
        ingest = "disparado";
        const markError = async (detail: string) => {
          await local.from("result_ingestions")
            .update({ status: "erro", finished_at: new Date().toISOString(), result: { error: detail } })
            .eq("file_path", filePath)
            .eq("status", "processando");
          await setTrackerStatus("erro", resultMsg(detail));
        };
        EdgeRuntime.waitUntil(
          fetch(`${SUPABASE_URL}/functions/v1/ingest-results`, {
            method: "POST",
            headers: {
              // repassa a chave recebida (JWT de servico), aceita pelo gateway de ingest-results
              Authorization: `Bearer ${bearer}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              file_path: filePath,
              client_id: clientId,
              service_order_id: platformOsId,
            }),
          })
            .then(async (r) => {
              const out = await r.text();
              console.log(`[tracker-order-sync] OS ${osNum} ingest ${r.status}: ${out.slice(0, 500)}`);
              if (!r.ok) await markError(errText(out));
            })
            .catch(async (e) => {
              console.error(`[tracker-order-sync] OS ${osNum} ingest falhou:`, e);
              await markError(`falha ao chamar a leitura do arquivo (${String(e).slice(0, 200)})`);
            }),
        );
      }
    }

    if (finalStatus) await setTrackerStatus(finalStatus, finalError);
    console.log(`[tracker-order-sync] OS ${osNum} ${action} => ${platformOsId} | resultado: ${ingest}`);
    return json({ action, id: platformOsId, ingest });
  } catch (err) {
    console.error("[tracker-order-sync] erro:", err);
    return json({ error: String(err) }, 500);
  }
});
