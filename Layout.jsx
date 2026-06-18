import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'

export default function Layout({ perfil, children }) {
  const navigate = useNavigate()
  const loc = useLocation()

  async function sair() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const isCoordenacao = perfil?.tipo === 'coordenacao'

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg3)' }}>
      <aside style={{ width: 220, background: 'var(--bg2)', borderRight: '0.5px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, position: 'sticky', top: 0, height: '100vh' }}>
        <div style={{ padding: '16px 18px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>Casos Pedagógicos</div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>Talkers Idiomas</div>
        </div>

        <nav style={{ padding: '10px 0', flex: 1 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', padding: '8px 18px 4px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Visão geral</div>
          <NavItem icon="ti-files" label="Todos os casos" active={loc.pathname === '/'} onClick={() => navigate('/')} />
          {isCoordenacao && <NavItem icon="ti-plus" label="Novo caso" active={loc.pathname === '/novo'} onClick={() => navigate('/novo')} />}

          <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text3)', padding: '16px 18px 4px', letterSpacing: '.06em', textTransform: 'uppercase' }}>Filtrar</div>
          <NavItem icon="ti-clock" label="Em aberto" onClick={() => navigate('/?status=open')} />
          <NavItem icon="ti-refresh" label="Em andamento" onClick={() => navigate('/?status=progress')} />
          <NavItem icon="ti-check" label="Arquivados" onClick={() => navigate('/?status=done')} />
        </nav>

        <div style={{ padding: '14px 18px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 6 }}>
            <i className="ti ti-user" style={{ marginRight: 5, fontSize: 13 }} aria-hidden="true" />
            {perfil?.nome || 'Usuário'}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text3)', marginBottom: 10, textTransform: 'capitalize' }}>{perfil?.tipo === 'coordenacao' ? 'Coordenação pedagógica' : 'Administrativo'}</div>
          <button onClick={sair} style={{ fontSize: 12, padding: '5px 10px', width: '100%', justifyContent: 'center' }}>
            <i className="ti ti-logout" aria-hidden="true" /> Sair
          </button>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        {children}
      </main>
    </div>
  )
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 18px', fontSize: 13, color: active ? 'var(--text)' : 'var(--text2)', fontWeight: active ? 600 : 400, background: active ? 'var(--bg)' : 'transparent', cursor: 'pointer', transition: 'background .1s' }}
      onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'var(--bg)' }}
      onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
      <i className={`ti ${icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
      {label}
    </div>
  )
}
