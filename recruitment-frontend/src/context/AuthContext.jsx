import { createContext, useContext, useState } from 'react'
import api from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [recruiter, setRecruiter] = useState(() => {
    const saved = localStorage.getItem('recruiter')
    return saved ? JSON.parse(saved) : null
  })

  async function login(email, password) {
    const { data } = await api.post('/auth/login', { email, password })
    localStorage.setItem('recruiter_token', data.token)
    localStorage.setItem('recruiter', JSON.stringify(data.recruiter))
    setRecruiter(data.recruiter)
  }

  function logout() {
    localStorage.removeItem('recruiter_token')
    localStorage.removeItem('recruiter')
    setRecruiter(null)
  }

  return (
    <AuthContext.Provider value={{ recruiter, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
