import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Layout from '../components/Layout.jsx'

const STATUS_LABEL = { open: 'Em aberto', progress: 'Em andamento', done: 'Arquivado' }
const STATUS_CLASS = { open: 'pill-open', progress: 'pill-progress', done: 'pill-done' }

export default function Caso({ perfil }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [caso, setCaso] = useState(null)
  const [loading, setLoading] = useState(true)
  const isCoordenacao = perfil?.tipo === 'coordenacao'

  useEffect(() => { fetchCaso() }, [id])

  async function fetchCaso() {
    const { data } = await supabase.from('casos').select('*').eq('id', id).single()
    setCaso(data)
    setLoading(false)
  }

  async function atualizarStatus(status) {
    await supabase.from('casos').update({ status }).eq('id', id)
    setCaso(prev => ({ ...prev, status }))
  }

  async function validar() {
    await supabase.from('casos').update({ status: 'progress', validado_por: perfil?.nome, validado_em: new Date().toISOString() }).eq('id', id)
    setCaso(prev => ({ ...prev, status: 'progress', validado_por: perfil?.nome }))
  }

  async function arquivar() {
    await supabase.from('casos').update({ status: 'done' }).eq('id', id)
    setCaso(prev => ({ ...prev, status: 'done' }))
  }

  function exportarWord() {
    if (!caso) return
    const d = caso.diagnostico || {}
    const linhas = [
      `DIAGNÓSTICO PEDAGÓGICO — ${caso.nome_aluno}`,
      `Talkers Idiomas · Coordenação Pedagógica · ${new Date(caso.created_at).toLocaleDateString('pt-BR')}`,
      '',
      `Teacher: ${caso.teacher || '—'}`,
      `Turma: ${caso.turma || '—'}`,
      `Modalidade: ${caso.modalidade || '—'}`,
      `Livro detectado: ${caso.livro_detectado || '—'}`,
      `Criado por: ${caso.criado_por_nome || '—'}`,
      '',
      '── RESUMO DAS DIFICULDADES ──',
      d.resumo_dificuldades || '',
      '',
      '── HIPÓTESES DE ORIGEM ──',
      ...(d.hipoteses || []).map(h => `[${h.nivel}] ${h.titulo}\n${h.descricao}`),
      '',
      '── HIPÓTESE PRINCIPAL ──',
      d.hipotese_principal || '',
      '',
      ...(d.flags?.length ? ['── FLAGS PARA A COORDENAÇÃO ──', ...(d.flags || []), ''] : []),
      '── PRÓXIMOS PASSOS ──',
      ...(d.acoes || []).map(a => `${a.responsavel}: ${a.acao}`),
      '',
      `Prazo de reavaliação: ${d.prazo_reavaliacao || '—'}`,
      '',
      `Validado por: ${caso.validado_por || '(aguardando validação)'}`,
    ]
    const blob = new Blob([linhas.join('\n')], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `caso_${caso.nome_aluno.replace(/\s+/g, '_').toLowerCase()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return (
    <Layout perfil={perfil}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 28, color: 'var(--text2)' }}>
        <div className="spinner" /> <span style={{ fontSize: 13 }}>Carregando caso...</span>
      </div>
    </Layout>
  )

  if (!caso) return (
    <Layout perfil={perfil}>
      <div style={{ padding: 28, fontSize: 13, color: 'var(--text3)' }}>Caso não encontrado.</div>
    </Layout>
  )

  const d = caso.diagnostico || {}

  return (
    <Layout perfil={perfil}>
      <div style={{ padding: '18px 28px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')}><i className="ti ti-arrow-left" aria-hidden="true" /> Voltar</button>
          <h1 style={{ fontSize: 15, fontWeight: 600 }}>{caso.nome_aluno}</h1>
          <span className={`pill ${STATUS_CLASS[caso.status]}`}>{STATUS_LABEL[caso.status]}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button onClick={exportarWord}><i className="ti ti-file-text" aria-hidden="true" /> Exportar</button>
          {isCoordenacao && caso.status === 'open' && <button className="primary" onClick={validar}><i className="ti ti-check" aria-hidden="true" /> Validar diagnóstico</button>}
          {isCoordenacao && caso.status === 'progress' && <button onClick={arquivar}><i className="ti ti-archive" aria-hidden="true" /> Arquivar caso</button>}
        </div>
      </div>

      <div style={{ padding: '24px 28px', maxWidth: 780, display: 'flex', flexDirection: 'column', gap: 24 }}>

        <div className="card">
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', fontSize: 13, color: 'var(--text2)' }}>
            <Meta icon="ti-user" label={caso.teacher || '—'} />
            <Meta icon="ti-books" label={caso.turma || '—'} />
            <Meta icon="ti-device-mobile" label={caso.modalidade || '—'} />
            {caso.livro_detectado && <Meta icon="ti-book" label={caso.livro_detectado} />}
            <Meta icon="ti-calendar" label={new Date(caso.created_at).toLocaleDateString('pt-BR')} />
            {caso.criado_por_nome && <Meta icon="ti-edit" label={`Aberto por ${caso.criado_por_nome}`} />}
          </div>
          {caso.dificuldades?.length > 0 && (
            <div style={{ marginTop: 12, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {caso.dificuldades.map(d => <span key={d} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'var(--bg2)', border: '0.5px solid var(--border)', color: 'var(--text2)' }}>{d}</span>)}
            </div>
          )}
        </div>

        {d.resumo_dificuldades && (
          <Secao title="Resumo das dificuldades">
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{d.resumo_dificuldades}</p>
          </Secao>
        )}

        {d.hipoteses?.length > 0 && (
          <Secao title="Hipóteses de origem">
            {d.hipoteses.map((h, i) => (
              <div key={i} className="card" style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--info)', marginBottom: 4 }}>{h.nivel}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{h.titulo}</div>
                <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.6 }}>{h.descricao}</div>
              </div>
            ))}
          </Secao>
        )}

        {d.hipotese_principal && (
          <Secao title="Hipótese principal">
            <div style={{ background: 'var(--warn-bg)', border: '0.5px solid var(--warn)', borderRadius: 'var(--radius-lg)', padding: '12px 16px' }}>
              <p style={{ fontSize: 13, color: 'var(--warn)', lineHeight: 1.7 }}>{d.hipotese_principal}</p>
            </div>
          </Secao>
        )}

        {d.flags?.filter(Boolean).length > 0 && (
          <Secao title="Flags para a coordenação">
            {d.flags.filter(Boolean).map((f, i) => (
              <div key={i} className="flag-box">
                <i className="ti ti-alert-triangle" aria-hidden="true" style={{ marginRight: 6 }} />{f}
              </div>
            ))}
          </Secao>
        )}

        {d.acoes?.length > 0 && (
          <Secao title="Próximos passos">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {d.acoes.map((a, i) => (
                <div key={i} className="card">
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 3 }}>{a.responsavel}</div>
                  <div style={{ fontSize: 13 }}>{a.acao}</div>
                </div>
              ))}
            </div>
          </Secao>
        )}

        {d.prazo_reavaliacao && (
          <Secao title="Prazo de reavaliação">
            <p style={{ fontSize: 13, color: 'var(--text2)' }}>{d.prazo_reavaliacao}</p>
          </Secao>
        )}

        {caso.validado_por && (
          <div className="info-box">
            <i className="ti ti-check" aria-hidden="true" style={{ marginRight: 6 }} />
            Validado por {caso.validado_por} em {new Date(caso.validado_em).toLocaleDateString('pt-BR')}
          </div>
        )}

        {caso.relato_teacher && (
          <Secao title="Relato do teacher (original)">
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{caso.relato_teacher}</p>
          </Secao>
        )}

        {caso.historico_manual && (
          <Secao title="Histórico informado">
            <p style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.7 }}>{caso.historico_manual}</p>
          </Secao>
        )}

      </div>
    </Layout>
  )
}

function Secao({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10, paddingBottom: 6, borderBottom: '0.5px solid var(--border)' }}>{title}</div>
      {children}
    </div>
  )
}

function Meta({ icon, label }) {
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <i className={`ti ${icon}`} style={{ fontSize: 13 }} aria-hidden="true" />{label}
    </span>
  )
}
