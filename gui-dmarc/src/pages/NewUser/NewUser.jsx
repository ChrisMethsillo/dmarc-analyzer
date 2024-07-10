import React, { useState, useEffect } from 'react'
import { createNewUser } from '../../hooks/dmarcReports'
import { useAuth } from '../../context/AuthContext'

const generateRandomPassword = () => {
  const length = 12
  const charset =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0, n = charset.length; i < length; ++i) {
    password += charset.charAt(Math.floor(Math.random() * n))
  }
  return password
}

const NewUser = () => {
  const { userData } = useAuth()

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    user_type: '',
    password: '',
  })

  // Generar una contraseña aleatoria cuando el componente se carga
  useEffect(() => {
    setFormData((prevState) => ({
      ...prevState,
      password: generateRandomPassword(),
    }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    try {
      console.log('Creating new user:', formData)
      createNewUser(formData)
      alert('User created successfully')
    } catch (error) {
      if (error.response?.status === 409) {
        alert('User already exists')
      } else {
        alert('An error occurred. Please try again later.')
      }
    }
  }
  if (userData?.user_type !== 'admin') {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <h1 className="text-4xl text-gray-200">
          You are not authorized to view this page
        </h1>
      </div>
    )
  }

  return (
    <div className="w-screen h-screen">
      <form
        onSubmit={handleSubmit}
        className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md"
      >
        <h2 className="text-2xl mb-6 text-center text-gray-200">
          Create new user
        </h2>

        <label className="block text-gray-200 mb-2">
          Username
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 text-gray-900 rounded-lg text-white"
            required
          />
        </label>

        <label className="block text-gray-200 mb-2">
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 text-gray-900 rounded-lg text-white"
            required
          />
        </label>

        <label className="block text-gray-200 mb-2">
          User type
          <select
            name="user_type"
            value={formData.user_type}
            onChange={handleChange}
            className="w-full p-2 mt-1 mb-4 text-gray-900 rounded-lg text-white"
            required
          >
            <option value="">Select option</option>
            <option value="admin">Administrator</option>
            <option value="user">User</option>
          </select>
        </label>

        <label className="block text-gray-200 mb-2">
          Random password
          <input
            type="text"
            name="password"
            value={formData.password}
            readOnly
            className="w-full p-2 mt-1 mb-4 text-gray-900 rounded-lg bg-gray-700 cursor-not-allowed"
          />
        </label>

        <button
          type="submit"
          className="w-full p-3 mt-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create User
        </button>
      </form>
    </div>
  )
}

export default NewUser
