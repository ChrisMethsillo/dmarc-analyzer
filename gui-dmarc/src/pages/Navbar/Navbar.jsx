import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@src/context/AuthContext'

const Navbar = () => {
  const { userData, logout } = useAuth()
  return (
    <nav className="flex w-full bg-blue-gray-900 p-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-white text-lg font-bold">
          <Link to="/">DMARC Analyzer</Link>
        </div>
        <ul className="flex space-x-4">
          <li>
            <Link to="/" className="text-white hover:text-gray-300">
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/reports" className="text-white hover:text-gray-300">
              Reports
            </Link>
          </li>
          {userData?.user_type === 'admin' && (
            <li>
              <Link to="/newuser" className="text-white hover:text-gray-300">
                Create User
              </Link>
            </li>
          )}
          <li>
            <p
              onClick={() => logout()}
              className="text-white hover:text-gray-300"
            >
              Logout
            </p>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
