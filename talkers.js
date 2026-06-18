export const levelMap = [
  { k: ['storyland'], l: 'Storyland — 4 a 5 anos' },
  { k: ['sah starter', 'stars and heroes starter'], l: 'Stars and Heroes Starter — 5 a 6 anos' },
  { k: ['sah 1b', 'sah 1', 'sah1', 'stars and heroes 1'], l: 'Stars and Heroes 1 — 6 a 7 anos' },
  { k: ['sah 2', 'sah2', 'stars and heroes 2'], l: 'Stars and Heroes 2 — 7 a 8 anos' },
  { k: ['sah 3', 'sah3', 'stars and heroes 3'], l: 'Stars and Heroes 3 — 8 a 9 anos' },
  { k: ['new i learn', 'nil'], l: 'New I Learn 1 — 9 a 10 anos' },
  { k: ['go getter 1', 'gg1'], l: 'Go Getter 1 — A1' },
  { k: ['go getter 2', 'gg2'], l: 'Go Getter 2 — A1/A2' },
  { k: ['go getter 3', 'gg3'], l: 'Go Getter 3 — A2+' },
  { k: ['wider world starter', 'ww starter'], l: 'Wider World Starter' },
  { k: ['wider world 1', 'ww1'], l: 'Wider World 1' },
  { k: ['wider world 2', 'ww2'], l: 'Wider World 2' },
  { k: ['wider world 3', 'ww3'], l: 'Wider World 3' },
  { k: ['speakout starter', 'starter a'], l: 'Speakout Starter — A1' },
  { k: ['speakout elementary', 'elementary'], l: 'Speakout Elementary — A1/A2' },
  { k: ['pre-intermediate', 'pre intermediate', 'speakout pre'], l: 'Speakout Pre-Intermediate — A2+/B1' },
  { k: ['upper intermediate', 'speakout upper', 'upper a', 'upper'], l: 'Speakout Upper Intermediate — B2+' },
  { k: ['intermediate', 'inter a', 'inter b', 'speakout inter'], l: 'Speakout Intermediate — B1+' },
]

export function detectLevel(turma, teacher) {
  const combined = ((turma || '') + ' ' + (teacher || '')).toLowerCase()
  for (const entry of levelMap) {
    if (entry.k.some(k => combined.includes(k))) return entry.l
  }
  return null
}

export const TALKERS_CONTEXT = `
MÉTODO TALKERS — SEQUÊNCIA DE AULA (6 PASSOS):
1. Exposição/contexto — alunos entram na situação antes de aprender a estrutura
2. Comparação guiada — dois exemplos lado a lado, o aluno descobre antes de receber
3. Descoberta da lógica — aluno identifica o padrão com ajuda do teacher
4. Regra (o coração da estrutura) — nomear o uso central de forma clara e simples
5. Prática — exercícios com a estrutura-alvo, avaliação individual
6. Aplicação comunicativa — uso em contexto real (conversa, role play, situação)

PRINCÍPIOS:
- Mínimo 40% de prática oral em toda aula
- Gramática sempre em contexto, nunca isolada
- Teacher não traduz — usa gestos, imagens, contexto
- Interação diagnóstica real (não apenas "did you understand?")
- Warm-up conectado ao tema da aula

LIVROS POR NÍVEL:
Kids/Teens: Storyland (4-5a) → Stars and Heroes Starter (5-6a) → SH1 (6-7a) → SH2 (7-8a) → SH3 (8-9a) → New I Learn (9-10a) → Go Getter 1/2/3 (a partir de 10a) → Wider World 1/2/3 (a partir de 13a)
Adults: Speakout Starter (A1) → Elementary (A1/A2) → Pre-Intermediate (A2+/B1) → Intermediate (B1+) → Upper Intermediate (B2+)

MODALIDADES E O QUE AVALIAR:
- Kids/Teens: gestão de energia, atividades variadas, speaking com crianças tímidas
- VIP: personalização total, plano centrado no aluno não no livro
- Home School (TKS): presença digital, engajamento em tela
- In Company: vocabulário do setor, postura formal
- Adults grupos: fluência crescente, uso além do livro
`
