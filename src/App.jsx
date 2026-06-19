import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { supabase } from './lib/supabase.js'
import Login from './pages/Login.jsx'
import Dashboard from './pages/Dashboard.jsx'
import NovoCaso from './pages/NovoCaso.jsx'
import Caso from './pages/Caso.jsx'

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [perfil, setPerfil] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchPerfil(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session)
      if (session) fetchPerfil(session.user.id)
      else { setPerfil(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function fetchPerfil(userId) {
    const { data } = await supabase.from('usuarios').select('*').eq('id', userId).single()
    setPerfil(data)
    setLoading(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 12 }}>
      <div className="spinner" />
      <span style={{ color: 'var(--text2)', fontSize: 13 }}>Carregando...</span>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={!session ? <Login /> : <Navigate to="/" />} />
      <Route path="/" element={session ? <Dashboard perfil={perfil} /> : <Navigate to="/login" />} />
      <Route path="/novo" element={session && perfil?.tipo === 'coordenacao' ? <NovoCaso perfil={perfil} /> : <Navigate to="/" />} />
      <Route path="/caso/:id" element={session ? <Caso perfil={perfil} /> : <Navigate to="/login" />} />
    </Routes>
  )
}
