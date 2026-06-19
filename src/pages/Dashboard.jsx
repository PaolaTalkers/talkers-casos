import React, { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import Layout from '../components/Layout.jsx'

const STATUS_LABEL = { open: 'Em aberto', progress: 'Em andamento', done: 'Arquivado' }
const STATUS_CLASS = { open: 'pill-open', progress: 'pill-progress', done: 'pill-done' }

export default function Dashboard({ perfil }) {
  const [casos, setCasos] = useState([])
  const [loading, setLoading] = useState(true)
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const statusFilter = params.get('status')

  useEffect(() => { fetchCasos() }, [statusFilter])

  async function fetchCasos() {
    setLoading(true)
    let q = supabase.from('casos').select('*').order('created_at', { ascending: false })
    if (statusFilter) q = q.eq('status', statusFilter)
    const { data } = await q
    setCasos(data || [])
    setLoading(false)
  }

  const isCoordenacao = perfil?.tipo === 'coordenacao'
  const title = statusFilter ? STATUS_LABEL[statusFilter] || 'Casos' : 'Todos os casos'

  return (
    <Layout perfil={perfil}>
      <div style={{ padding: '20px 28px', borderBottom: '0.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)' }}>
        <h1 style={{ fontSize: 16, fontWeight: 600 }}>{title}</h1>
        {isCoordenacao && (
          <button className="primary" onClick={() => navigate('/novo')}>
            <i className="ti ti-plus" aria-hidden="true" /> Novo caso
          </button>
        )}
      </div>

      <div style={{ padding: '20px 28px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--text2)' }}>
            <div className="spinner" /> <span style={{ fontSize: 13 }}>Carregando casos...</span>
          </div>
        ) : casos.length === 0 ? (
          <div style={{ fontSize: 13, color: 'var(--text3)', padding: '20px 0' }}>Nenhum caso encontrado.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {casos.map(c => (
              <div key={c.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/caso/${c.id}`)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{c.nome_aluno}</div>
                  <span className={`pill ${STATUS_CLASS[c.status]}`}>{STATUS_LABEL[c.status]}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', fontSize: 12, color: 'var(--text2)' }}>
                  <span><i className="ti ti-user" style={{ fontSize: 12, marginRight: 3 }} aria-hidden="true" />{c.teacher}</span>
                  <span><i className="ti ti-books" style={{ fontSize: 12, marginRight: 3 }} aria-hidden="true" />{c.turma}</span>
                  <span><i className="ti ti-device-mobile" style={{ fontSize: 12, marginRight: 3 }} aria-hidden="true" />{c.modalidade}</span>
                  <span><i className="ti ti-calendar" style={{ fontSize: 12, marginRight: 3 }} aria-hidden="true" />{new Date(c.created_at).toLocaleDateString('pt-BR')}</span>
                </div>
                {c.dificuldades?.length > 0 && (
                  <div style={{ marginTop: 8, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                    {c.dificuldades.map(d => (
                      <span key={d} style={{ fontSize: 11, padding: '2px 7px', borderRadius: 20, background: 'var(--bg2)', color: 'var(--text2)', border: '0.5px solid var(--border)' }}>{d}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
