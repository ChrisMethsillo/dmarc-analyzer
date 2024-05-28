import React from 'react'
import ReactDOM from 'react-dom/client'
import MyRoutes from './Routes'

import './index.css'

export default function App() {
  return <MyRoutes />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
