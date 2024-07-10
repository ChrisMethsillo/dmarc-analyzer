import React, { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { fetchUserData } from '@src/hooks/auth'

const AuthContext = createContext()

export const AuthProvider = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('accessToken'),
  )
  const [token, setToken] = useState(localStorage.getItem('accessToken'))
  const [tokenType, setTokenType] = useState(localStorage.getItem('tokenType'))
  const [userData, setUserData] = useState({})
  const navigate = useNavigate()

  const login = (newToken) => {
    const { access_token, token_type } = newToken
    localStorage.setItem('accessToken', access_token)
    localStorage.setItem('tokenType', token_type)

    setToken(access_token)
    setTokenType(token_type)
    setIsAuthenticated(true)

    fetchUserData()
      .then((data) => {
        setUserData(data)
      })
      .catch((error) => {
        console.error('Error fetching user data:', error)
        logout()
      })
    navigate('/')
  }

  const logout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('tokenType')

    setToken(null)
    setTokenType(null)
    setIsAuthenticated(false)
    setUserData({})
    navigate('/login')
  }

  useEffect(() => {
    const storedToken = localStorage.getItem('accessToken')
    const storedTokenType = localStorage.getItem('tokenType')
    if (storedToken) {
      setToken(storedToken)
      setTokenType(storedTokenType)
      setIsAuthenticated(true)
      fetchUserData()
        .then((data) => {
          setUserData(data)
        })
        .catch((error) => {
          console.error('Error fetching user data:', error)
          logout()
        })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ isAuthenticated, userData, login, logout }}>
      <Outlet />
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  return useContext(AuthContext)
}
