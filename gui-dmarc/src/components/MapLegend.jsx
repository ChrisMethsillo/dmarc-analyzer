import React from 'react'
import '@src/styles/Legend.css'

const MapLegend = () => {
  return (
    <div className="legend">
      <p className="pb-2 px-3">Number of rows by ip</p>
      <div style={{ '--color': '#f16d7a' }}> {'>'}200 </div>
      <div style={{ '--color': '#fa8a76' }}>200 - 100</div>
      <div style={{ '--color': '#ffa679' }}>100 - 50</div>
      <div style={{ '--color': '#ffc285' }}>50 - 25</div>
      <div style={{ '--color': '#ffdd9a' }}>25 - 10</div>
      <div style={{ '--color': '#fef6b5' }}>10 - 1</div>
      <div style={{ '--color': '#ffffff' }}>0</div>
    </div>
  )
}
export default MapLegend
