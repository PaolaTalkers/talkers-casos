-- ============================================================
-- SCHEMA — Casos Pedagógicos · Talkers Idiomas
-- Cole este SQL no SQL Editor do Supabase e execute
-- ============================================================

-- Tabela de usuários (vinculada ao auth do Supabase)
create table public.usuarios (
  id uuid references auth.users(id) on delete cascade primary key,
  nome text not null,
  email text not null,
  tipo text not null check (tipo in ('coordenacao', 'administrativo')),
  created_at timestamptz default now()
);

-- Tabela principal de casos
create table public.casos (
  id uuid default gen_random_uuid() primary key,
  nome_aluno text not null,
  teacher text,
  turma text,
  modalidade text,
  livro_detectado text,
  dificuldades text[],
  relato_teacher text,
  relato_aluno text,
  transcricao text,
  historico_manual text,
  diagnostico jsonb,
  status text not null default 'open' check (status in ('open', 'progress', 'done')),
  criado_por uuid references public.usuarios(id),
  criado_por_nome text,
  validado_por text,
  validado_em timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Índices úteis
create index casos_status_idx on public.casos(status);
create index casos_nome_aluno_idx on public.casos(nome_aluno);
create index casos_created_at_idx on public.casos(created_at desc);

-- Trigger para atualizar updated_at automaticamente
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger casos_updated_at
  before update on public.casos
  for each row execute function update_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- Garante que só usuários autenticados acessam os dados
-- ============================================================

alter table public.usuarios enable row level security;
alter table public.casos enable row level security;

-- Usuários podem ver seu próprio perfil
create policy "usuario_ve_proprio_perfil"
  on public.usuarios for select
  using (auth.uid() = id);

-- Todos os usuários autenticados podem ver todos os casos
create policy "todos_veem_casos"
  on public.casos for select
  using (auth.role() = 'authenticated');

-- Só coordenação pode criar casos
create policy "coordenacao_cria_casos"
  on public.casos for insert
  with check (
    exists (
      select 1 from public.usuarios
      where id = auth.uid() and tipo = 'coordenacao'
    )
  );

-- Só coordenação pode atualizar casos
create policy "coordenacao_atualiza_casos"
  on public.casos for update
  using (
    exists (
      select 1 from public.usuarios
      where id = auth.uid() and tipo = 'coordenacao'
    )
  );

-- ============================================================
-- COMO CRIAR USUÁRIOS
-- Após rodar este schema, crie usuários assim:
--
-- 1. No Supabase → Authentication → Users → Invite user
--    (ou use signUp via código)
--
-- 2. Depois insira o perfil manualmente:
--    insert into public.usuarios (id, nome, email, tipo)
--    values (
--      'uuid-do-usuario-criado-no-auth',
--      'Ana Caroline',
--      'ana@talkers.com.br',
--      'coordenacao'  -- ou 'administrativo'
--    );
-- ============================================================
