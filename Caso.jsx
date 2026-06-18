import React, { useState } from 'react'
import { supabase } from '../lib/supabase.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function entrar(e) {
    e.preventDefault()
    setErro('')
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
    if (error) setErro('Email ou senha incorretos.')
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg3)' }}>
      <div style={{ width: 360 }}>
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 600, color: 'var(--text)', marginBottom: 4 }}>Talkers Idiomas</div>
          <div style={{ fontSize: 13, color: 'var(--text2)' }}>Casos Pedagógicos</div>
        </div>
        <div className="card" style={{ padding: '24px 28px' }}>
          <form onSubmit={entrar} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, color: 'var(--text2)', marginBottom: 5 }}>Senha</label>
              <input type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" required />
            </div>
            {erro && <div style={{ fontSize: 12, color: 'var(--danger)', background: 'var(--danger-bg)', padding: '7px 10px', borderRadius: 'var(--radius)' }}>{erro}</div>}
            <button type="submit" className="primary" disabled={loading} style={{ marginTop: 4, justifyContent: 'center' }}>
              {loading ? <><div className="spinner" style={{ width: 14, height: 14, borderWidth: 1.5 }} /> Entrando...</> : 'Entrar'}
            </button>
          </form>
        </div>
        <div style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'var(--text3)' }}>
          Acesso restrito à equipe Talkers
        </div>
      </div>
    </div>
  )
}
