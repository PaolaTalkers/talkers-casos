# Como fazer o deploy — Talkers Casos Pedagógicos
## Supabase + Vercel · Passo a passo completo

---

## PARTE 1 — Supabase (banco de dados e autenticação)

### 1. Criar conta e projeto
1. Acesse https://supabase.com e crie uma conta gratuita
2. Clique em "New project"
3. Nome: `talkers-casos` · Escolha uma senha forte · Região: South America (São Paulo)
4. Aguarde o projeto ser criado (~2 minutos)

### 2. Criar as tabelas
1. No menu lateral, clique em "SQL Editor"
2. Clique em "New query"
3. Cole TODO o conteúdo do arquivo `schema.sql`
4. Clique em "Run" (ou Ctrl+Enter)
5. Deve aparecer "Success" para cada comando

### 3. Pegar as chaves do projeto
1. No menu lateral, clique em "Project Settings" → "API"
2. Copie:
   - **Project URL** → vai para VITE_SUPABASE_URL
   - **anon public** (em Project API keys) → vai para VITE_SUPABASE_ANON_KEY

### 4. Criar os usuários
1. No menu lateral, clique em "Authentication" → "Users"
2. Clique em "Invite user" e coloque o email de cada pessoa
3. Elas receberão um email para criar a senha
4. Depois que criarem a conta, vá em "SQL Editor" e rode:

```sql
-- Substitua pelos dados reais de cada pessoa
insert into public.usuarios (id, nome, email, tipo)
values (
  'cole-aqui-o-uuid-do-usuario',  -- veja em Authentication → Users
  'Ana Caroline',
  'ana@email.com',
  'coordenacao'  -- ou 'administrativo'
);
```

---

## PARTE 2 — GitHub (repositório do código)

### 5. Subir o código para o GitHub
1. Crie uma conta em https://github.com se não tiver
2. Crie um repositório novo chamado `talkers-casos`
3. Na pasta do projeto no seu computador, rode:
```bash
git init
git add .
git commit -m "primeiro deploy"
git remote add origin https://github.com/SEU_USUARIO/talkers-casos.git
git push -u origin main
```

---

## PARTE 3 — Vercel (publicação do site)

### 6. Criar conta e conectar o repositório
1. Acesse https://vercel.com e crie uma conta (pode entrar com o GitHub)
2. Clique em "Add New Project"
3. Escolha o repositório `talkers-casos`
4. Clique em "Import"

### 7. Configurar as variáveis de ambiente
Na tela de configuração do deploy, antes de clicar em Deploy:
1. Clique em "Environment Variables"
2. Adicione uma por vez:

| Nome | Valor |
|------|-------|
| VITE_SUPABASE_URL | sua URL do Supabase (copiada no passo 3) |
| VITE_SUPABASE_ANON_KEY | sua anon key do Supabase (copiada no passo 3) |
| VITE_ANTHROPIC_KEY | sua API key da Anthropic |

> Para pegar a API key da Anthropic: https://console.anthropic.com → API Keys → Create Key

### 8. Fazer o deploy
1. Clique em "Deploy"
2. Aguarde ~2 minutos
3. O Vercel vai gerar uma URL tipo: `talkers-casos-xyz.vercel.app`
4. Essa é a URL do sistema — compartilhe com a equipe

---

## PARTE 4 — Atualizar o sistema no futuro

Sempre que quiser atualizar o sistema:
1. Faça as alterações no código
2. Rode `git add . && git commit -m "descrição" && git push`
3. O Vercel detecta automaticamente e faz o deploy em ~1 minuto

---

## Problemas comuns

**"Invalid API key" ao gerar diagnóstico**
→ Verifique se VITE_ANTHROPIC_KEY está correto nas variáveis do Vercel

**"Error: relation does not exist"**
→ O schema.sql não foi executado corretamente no Supabase. Rode novamente.

**Usuário não consegue acessar após criar senha**
→ Verifique se o perfil foi inserido na tabela `usuarios` com o UUID correto

**Site abre mas fica em branco**
→ Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis do Vercel

---

## Custos

| Serviço | Plano gratuito |
|---------|----------------|
| Supabase | 500MB banco · 2 projetos · ilimitado para esse volume |
| Vercel | Deploy ilimitado · domínio gratuito · suficiente para uso interno |
| Anthropic | Pago por uso — estimativa de R$0,50 a R$2,00 por diagnóstico gerado |

---

*Talkers Idiomas · Coordenação Pedagógica · Junho/2026*
