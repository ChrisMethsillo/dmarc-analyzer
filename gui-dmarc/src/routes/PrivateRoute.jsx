import { useAuth } from '@src/context/AuthContext'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  if (!isAuthenticated) {
    navigate('/login')
  }
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />
}

export default PrivateRoute
