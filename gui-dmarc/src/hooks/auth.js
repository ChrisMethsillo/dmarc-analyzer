import axios from 'axios'
import endpoints from './endpoints.json'
const URL = import.meta.env.VITE_BACKEND_URL

export async function fetchLogin({ username, password }) {
  try {
    const response = await axios.post(
      `${URL}/${endpoints.auth}`,
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
      console.log(response.data)
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
