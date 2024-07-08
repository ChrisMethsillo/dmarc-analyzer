import axiosInstance from './axiosInstance'
import endpoints from './endpoints.json'

export async function fetchLogin({ username, password }) {
  try {
    const response = await axiosInstance.post(
      `/${endpoints.auth}`,
      new URLSearchParams({
        username,
        password,
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      },
    )

    if (response.status === 200 && response.data) {
      return { success: true, data: response.data }
    }
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return {
        success: false,
        data: null,
        message: 'Incorrect username or password',
      }
    }
    return { success: false, data: null, message: error.message }
  }
}

export async function fetchUserData() {
  const response = await axiosInstance.get(`/${endpoints.authMe}`)
  return response.data
}
