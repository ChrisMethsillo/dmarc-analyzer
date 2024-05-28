import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('token'),
  )
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [tokenType, setTokenType] = useState(localStorage.getItem('tokenType'))
  const navigate = useNavigate()

  const login = (newToken) => {
    const { access_token, token_type } = newToken
    localStorage.setItem('accessToken', access_token)
    localStorage.setItem('tokenType', token_type)

    setToken(newToken)
    setTokenType(token_type)

    setIsAuthenticated(true)
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setTokenType(null)
    setIsAuthenticated(false)
    navigate('/login')
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedTokenType = localStorage.getItem('tokenType')
    if (storedToken) {
      setToken(storedToken)
      setTokenType(storedTokenType)
      setIsAuthenticated(true)
    }
  }, [])
  return (
    <AuthContext.Provider
      value={{ isAuthenticated, token, tokenType, login, logout }}
    >
      <Outlet />
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
