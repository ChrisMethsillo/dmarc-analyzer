import { useAuth } from '@src/context/AuthContext'
import { Outlet, useNavigate } from 'react-router-dom'

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()
  if (!isAuthenticated) {
    navigate('/login')
  }
  return <Outlet />
}

export default PrivateRoute
