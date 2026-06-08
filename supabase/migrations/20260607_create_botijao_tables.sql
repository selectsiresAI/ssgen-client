-- Botijões (tanks)
CREATE TABLE public.botijoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  canecas integer NOT NULL DEFAULT 6,
  capacidade_litros numeric NOT NULL DEFAULT 35,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Items (doses in tanks)
CREATE TABLE public.botijao_itens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  botijao_id uuid NOT NULL REFERENCES public.botijoes(id) ON DELETE CASCADE,
  touro_code text NOT NULL,
  touro_name text,
  touro_breed text,
  tipo text NOT NULL DEFAULT 'Convencional',
  doses integer NOT NULL DEFAULT 0,
  preco numeric NOT NULL DEFAULT 0,
  caneca integer NOT NULL DEFAULT 1,
  observacoes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Nitrogen refill history
CREATE TABLE public.nitrogen_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  botijao_id uuid REFERENCES public.botijoes(id) ON DELETE CASCADE,
  data_abastecimento date NOT NULL DEFAULT CURRENT_DATE,
  volume numeric NOT NULL,
  observacoes text DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.botijoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.botijao_itens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nitrogen_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own botijoes" ON public.botijoes
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own itens" ON public.botijao_itens
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own nitrogen" ON public.nitrogen_records
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_botijoes_user ON public.botijoes(user_id);
CREATE INDEX idx_botijao_itens_user ON public.botijao_itens(user_id);
CREATE INDEX idx_botijao_itens_botijao ON public.botijao_itens(botijao_id);
CREATE INDEX idx_nitrogen_user ON public.nitrogen_records(user_id);
CREATE INDEX idx_nitrogen_botijao ON public.nitrogen_records(botijao_id);
