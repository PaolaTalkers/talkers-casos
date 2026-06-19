import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import { detectLevel, TALKERS_CONTEXT } from '../lib/talkers.js'
import Layout from '../components/Layout.jsx'

const DIFFS = [
  { key: 'speaking', label: 'Speaking', icon: 'ti-microphone' },
  { key: 'writing', label: 'Writing', icon: 'ti-pencil' },
  { key: 'listening', label: 'Listening', icon: 'ti-headphones' },
  { key: 'reading', label: 'Reading', icon: 'ti-book-2' },
  { key: 'gramatica', label: 'Gramática', icon: 'ti-brackets' },
  { key: 'comportamento', label: 'Comportamento', icon: 'ti-mood-sad' },
]

export default function NovoCaso({ perfil }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({ nome: '', teacher: '', turma: '', modalidade: '', relatoTeacher: '', relatoAluno: '', transcricao: '', historico: '' })
  const [selectedDiffs, setSelectedDiffs] = useState([])
  const [diffDetails, setDiffDetails] = useState({})
  const [grammarContent, setGrammarContent] = useState('')
  const [levelDetected, setLevelDetected] = useState(null)
  const [agentQ, setAgentQ] = useState('Preencha o nome do aluno, selecione a dificuldade e adicione o relato do teacher.')
  const [canGenerate, setCanGenerate] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadMsg, setLoadMsg] = useState('')

  function setF(k, v) {
    const next = { ...form, [k]: v }
    setForm(next)
    const lv = detectLevel(next.turma, next.teacher)
    setLevelDetected(lv)
    validate(next, selectedDiffs, grammarContent)
  }

  function toggleDiff(key) {
    const next = selectedDiffs.includes(key) ? selectedDiffs.filter(d => d !== key) : [...selectedDiffs, key]
    setSelectedDiffs(next)
    validate(form, next, grammarContent)
  }

  function setDetail(diff, field, val) {
    setDiffDetails(prev => ({ ...prev, [diff]: { ...prev[diff], [field]: val } }))
  }

  function setGrammar(v) {
    setGrammarContent(v)
    validate(form, selectedDiffs, v)
  }

  function validate(f, diffs, grammar) {
    if (!f.nome.trim()) { setAgentQ('Qual é o nome do aluno?'); setCanGenerate(false); return }
    if (diffs.length === 0) { setAgentQ('Selecione pelo menos uma área de dificuldade.'); setCanGenerate(false); return }
    if (diffs.includes('gramatica') && !grammar.trim()) { setAgentQ('Gramática selecionada: qual estrutura ou conteúdo específico está travando?'); setCanGenerate(false); return }
    if (!f.relatoTeacher.trim()) { setAgentQ('Adicione o relato do teacher para gerar o diagnóstico.'); setCanGenerate(false); return }
    setAgentQ(null)
    setCanGenerate(true)
  }

  async function gerar() {
    setLoading(true)
    const msgs = ['Lendo o formulário...', 'Triangulando as fontes...', 'Levantando hipóteses...', 'Estruturando o plano...']
    let mi = 0
    setLoadMsg(msgs[0])
    const interval = setInterval(() => { mi = (mi + 1) % msgs.length; setLoadMsg(msgs[mi]) }, 1800)

    const diffsInfo = selectedDiffs.map(d => {
      const det = diffDetails[d] || {}
      const parts = Object.values(det).filter(Boolean)
      if (d === 'gramatica') return `gramática (${grammarContent}): ${parts.join(' | ')}`
      return `${d}: ${parts.join(' | ') || '(sem detalhes adicionais)'}`
    }).join('\n')

    const prompt = `${TALKERS_CONTEXT}

DADOS DO CASO:
- Aluno: ${form.nome}
- Teacher: ${form.teacher || 'não informado'}
- Turma: ${form.turma || 'não informada'}
- Modalidade: ${form.modalidade || 'não informada'}
- Livro/nível detectado: ${levelDetected || 'não detectado'}
- Dificuldades e detalhes:
${diffsInfo}
- Relato do teacher: ${form.relatoTeacher}
${form.relatoAluno ? `- Relato do aluno/responsável: ${form.relatoAluno}` : ''}
${form.transcricao ? `- Transcrição de aula: ${form.transcricao}` : ''}
${form.historico ? `- Histórico do aluno: ${form.historico}` : ''}

Você é o agente pedagógico da Talkers Idiomas. Gere um diagnóstico pedagógico preciso com base nos dados acima.

INSTRUÇÕES:
1. Analise TODAS as informações antes de gerar qualquer hipótese.
2. Seja específico — indique qual estrutura CEFR, qual habilidade cognitiva, qual padrão comportamental.
3. Não ignore contradições entre fontes.
4. Sinalize quando o caso ultrapassar o escopo pedagógico.
5. Se faltar informação crítica, liste as perguntas no campo perguntas_agente.
6. Atividades devem respeitar o Método Talkers: gramática em contexto, mínimo 40% oral.

Responda APENAS com JSON válido, sem markdown:
{
  "perguntas_agente": [],
  "resumo_dificuldades": "...",
  "hipoteses": [{"nivel":"Nível 1","titulo":"...","descricao":"..."}],
  "hipotese_principal": "...",
  "flags": [],
  "acoes": [{"responsavel":"...","acao":"..."}],
  "prazo_reavaliacao": "..."
}`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] })
      })
      const data = await res.json()
      clearInterval(interval)
      let raw = data.content?.find(b => b.type === 'text')?.text || ''
      raw = raw.replace(/```json|```/g, '').trim()
      const parsed = JSON.parse(raw)

      const { data: caso, error } = await supabase.from('casos').insert({
        nome_aluno: form.nome,
        teacher: form.teacher,
        turma: form.turma,
        modalidade: form.modalidade,
        livro_detectado: levelDetected,
        dificuldades: selectedDiffs,
        relato_teacher: form.relatoTeacher,
        relato_aluno: form.relatoAluno,
        transcricao: form.transcricao,
        historico_manual: form.historico,
        diagnostico: parsed,
        status: 'open',
        criado_por: perfil?.id,
        criado_por_nome: perfil?.nome,
      }).select().single()

      setLoading(false)
      if (!error && caso) navigate(`/caso/${caso.id}`)
    } catch (err) {
      clearInterval(interval)
      setLoading(false)
      alert('Erro ao gerar diagnóstico. Tente novamente.')
    }
  }

  return (
    <Layout perfil={perfil}>
      <div style={{ padding: '20px 28px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, background: 'var(--bg)' }}>
        <button onClick={() => navigate('/')}><i className="ti ti-arrow-left" aria-hidden="true" /> Voltar</button>
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>Novo caso pedagógico</h1>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 28 }}>

        <Section title="Identificação">
          <Row>
            <Field label="Nome do aluno" required>
              <input value={form.nome} onChange={e => setF('nome', e.target.value)} placeholder="Nome completo" />
            </Field>
            <Field label="Teacher responsável">
              <input value={form.teacher} onChange={e => setF('teacher', e.target.value)} placeholder="Nome do teacher" />
            </Field>
          </Row>
          <Row>
            <Field label="Turma">
              <input value={form.turma} onChange={e => setF('turma', e.target.value)} placeholder="Ex: Inter A SEG 18–20" />
            </Field>
            <Field label="Modalidade">
              <select value={form.modalidade} onChange={e => setF('modalidade', e.target.value)}>
                <option value="">Selecionar...</option>
                <option>Kids</option><option>Teens</option><option>Adults</option>
                <option>VIP</option><option>Home School (TKS)</option><option>In Company</option>
              </select>
            </Field>
          </Row>
          {levelDetected && (
            <div className="info-box" style={{ borderRadius: 0, marginTop: 4 }}>
              <i className="ti ti-book" aria-hidden="true" style={{ marginRight: 6 }} />
              Livro detectado: <strong>{levelDetected}</strong>
            </div>
          )}
        </Section>

        <Section title="Dificuldade identificada">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {DIFFS.map(d => (
              <DiffOption key={d.key} icon={d.icon} label={d.label} selected={selectedDiffs.includes(d.key)} onClick={() => toggleDiff(d.key)} />
            ))}
          </div>

          {selectedDiffs.includes('speaking') && <DiffDetail title="Speaking">
            <DLabel>O que o aluno faz</DLabel>
            <textarea placeholder="Ex: para no meio das frases, usa sempre presente simples..." onChange={e => setDetail('speaking', 'faz', e.target.value)} />
            <DLabel>O que o aluno NÃO consegue fazer</DLabel>
            <textarea placeholder="Ex: não sustenta conversa por mais de 30s..." onChange={e => setDetail('speaking', 'nao_consegue', e.target.value)} />
            <DLabel>Quando aparece mais</DLabel>
            <textarea placeholder="Ex: em role plays, com vocabulário novo..." onChange={e => setDetail('speaking', 'quando', e.target.value)} />
          </DiffDetail>}

          {selectedDiffs.includes('writing') && <DiffDetail title="Writing">
            <DLabel>O que o aluno faz</DLabel>
            <textarea placeholder="Descreva o comportamento..." onChange={e => setDetail('writing', 'faz', e.target.value)} />
            <DLabel>O que NÃO consegue fazer</DLabel>
            <textarea placeholder="Ex: não usa conectivos, não estrutura parágrafos..." onChange={e => setDetail('writing', 'nao_consegue', e.target.value)} />
          </DiffDetail>}

          {selectedDiffs.includes('listening') && <DiffDetail title="Listening">
            <DLabel>O que o aluno faz</DLabel>
            <textarea placeholder="Descreva o comportamento..." onChange={e => setDetail('listening', 'faz', e.target.value)} />
            <DLabel>Quando aparece mais</DLabel>
            <textarea placeholder="Ex: com sotaque nativo, com velocidade normal..." onChange={e => setDetail('listening', 'quando', e.target.value)} />
          </DiffDetail>}

          {selectedDiffs.includes('reading') && <DiffDetail title="Reading">
            <DLabel>O que o aluno faz</DLabel>
            <textarea placeholder="Descreva o comportamento..." onChange={e => setDetail('reading', 'faz', e.target.value)} />
            <DLabel>Quando aparece mais</DLabel>
            <textarea placeholder="Ex: lê palavra por palavra, não infere pelo contexto..." onChange={e => setDetail('reading', 'quando', e.target.value)} />
          </DiffDetail>}

          {selectedDiffs.includes('gramatica') && <DiffDetail title="Gramática">
            <DLabel>Estrutura gramatical específica *</DLabel>
            <input placeholder="Ex: past simple, present continuous, question formation..." value={grammarContent} onChange={e => setGrammar(e.target.value)} />
            <DLabel>Descrição da dificuldade</DLabel>
            <textarea placeholder="O que você observou em aula sobre essa estrutura..." onChange={e => setDetail('gramatica', 'descricao', e.target.value)} />
          </DiffDetail>}

          {selectedDiffs.includes('comportamento') && <DiffDetail title="Comportamento">
            <DLabel>Comportamento observado</DLabel>
            <textarea placeholder="Ex: dispersão, ansiedade, baixo engajamento..." onChange={e => setDetail('comportamento', 'observado', e.target.value)} />
            <DLabel>Quando aparece mais</DLabel>
            <textarea placeholder="Ex: ao ser corrigido, em atividades orais..." onChange={e => setDetail('comportamento', 'quando', e.target.value)} />
          </DiffDetail>}
        </Section>

        <Section title="Relatos">
          <Field label="Relato do teacher" required>
            <textarea rows={5} value={form.relatoTeacher} onChange={e => setF('relatoTeacher', e.target.value)} placeholder="O que o teacher observou em aula — quanto mais detalhe, mais preciso o diagnóstico..." />
          </Field>
          <Field label="Relato do aluno ou responsável (opcional)">
            <textarea rows={3} value={form.relatoAluno} onChange={e => setF('relatoAluno', e.target.value)} placeholder="O que o aluno ou responsável relatou..." />
          </Field>
          <Field label="Transcrição de aula (opcional)">
            <textarea rows={3} value={form.transcricao} onChange={e => setF('transcricao', e.target.value)} placeholder="Trechos relevantes da transcrição..." />
          </Field>
        </Section>

        <Section title="Histórico do aluno">
          <Field label="Histórico relevante (casos anteriores são puxados automaticamente)">
            <textarea rows={3} value={form.historico} onChange={e => setF('historico', e.target.value)} placeholder="Ex: já passou por intervenção, trocou de turma, tem dificuldades emocionais conhecidas..." />
          </Field>
        </Section>

        {agentQ && (
          <div className="warn-box">
            <i className="ti ti-help-circle" aria-hidden="true" style={{ marginRight: 6 }} />
            {agentQ}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, paddingBottom: 40 }}>
          <button className="primary" onClick={gerar} disabled={!canGenerate || loading}>
            {loading
              ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> {loadMsg}</>
              : <><i className="ti ti-sparkles" aria-hidden="true" /> Gerar diagnóstico</>}
          </button>
          <button onClick={() => navigate('/')}>Cancelar</button>
        </div>

      </div>
    </Layout>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 14, paddingBottom: 8, borderBottom: '0.5px solid var(--border)' }}>{title}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>{children}</div>
    </div>
  )
}

function Row({ children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>{children}</div>
}

function Field({ label, required, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <label style={{ fontSize: 12, color: 'var(--text2)' }}>{label}{required && <span style={{ color: 'var(--danger)', marginLeft: 2 }}>*</span>}</label>
      {children}
    </div>
  )
}

function DiffOption({ icon, label, selected, onClick }) {
  return (
    <div onClick={onClick} style={{ border: `0.5px solid ${selected ? 'var(--info)' : 'var(--border)'}`, borderRadius: 'var(--radius)', padding: '9px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: selected ? 'var(--info)' : 'var(--text2)', background: selected ? 'var(--info-bg)' : 'var(--bg)', transition: 'all .15s' }}>
      <i className={`ti ${icon}`} style={{ fontSize: 15 }} aria-hidden="true" /> {label}
    </div>
  )
}

function DiffDetail({ title, children }) {
  return (
    <div style={{ border: '0.5px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, background: 'var(--bg2)', marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text2)', marginBottom: 4 }}>{title}</div>
      {children}
    </div>
  )
}

function DLabel({ children }) {
  return <label style={{ fontSize: 11, color: 'var(--text3)', marginTop: 4 }}>{children}</label>
}
