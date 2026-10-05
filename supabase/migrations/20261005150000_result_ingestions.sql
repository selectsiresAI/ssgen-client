-- Controle de ingestao de arquivos de resultado (Tracker -> Platform).
-- Uma linha por arquivo: trava contra ingestao duplicada e registro do que aconteceu.
-- status: processando | ok | erro | adiado (backlog que so roda com aprovacao)
create table if not exists public.result_ingestions (
  file_path        text primary key,
  client_id        uuid,
  service_order_id uuid,
  status           text not null default 'processando'
                   check (status in ('processando', 'ok', 'erro', 'adiado')),
  started_at       timestamptz not null default now(),
  finished_at      timestamptz,
  result           jsonb
);

alter table public.result_ingestions enable row level security;
-- Sem policies: so service_role (edge functions) le e escreve.
