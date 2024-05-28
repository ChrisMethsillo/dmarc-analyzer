import React, { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import axios from 'axios'
import MapLegend from './MapLegend'

const fetchCountriesByIP = async (ips) => {
  const results = []
  for (const chunk of ips) {
    try {
      const response = await axios.post('http://ip-api.com/batch', chunk, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
      results.push(...response.data)

      const remainingRequests = parseInt(response.headers['x-rl'], 10)
      const timeToReset = parseInt(response.headers['x-ttl'], 10)

      if (remainingRequests === 0) {
        await new Promise((resolve) => setTimeout(resolve, timeToReset * 1000))
      }
    } catch (error) {
      console.error('Error fetching IP data:', error)
    }
  }
  return results
}

const ChoroplethMap = ({ ipData }) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const [countryData, setCountryData] = useState(null)
  const [geoJsonData, setGeoJsonData] = useState(null)

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView([20, 0], 2)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstance.current)
    }

    const getCountries = async () => {
      const ipList = Object.keys(ipData)
      const chunks = []

      for (let i = 0; i < ipList.length; i += 100) {
        chunks.push(ipList.slice(i, i + 100).map((ip) => ({ query: ip })))
      }

      const countryFrequency = {}
      let requestsCount = 0

      for (const chunk of chunks) {
        if (requestsCount >= 15) {
          await new Promise((resolve) => setTimeout(resolve, 60000))
          requestsCount = 0
        }

        const ipInfos = await fetchCountriesByIP([chunk])
        requestsCount += 1

        ipInfos.forEach((info) => {
          if (info.status === 'success') {
            const country = info.country
            countryFrequency[country] =
              (countryFrequency[country] || 0) + ipData[info.query]
          }
        })
      }
      setCountryData(countryFrequency)
    }
    getCountries()

    const fetchGeoJsonData = async () => {
      const response = await axios.get('src/assets/maps/world.geo.json')
      setGeoJsonData(response.data)
    }

    fetchGeoJsonData()

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove()
        mapInstance.current = null
      }
    }
  }, [ipData])

  useEffect(() => {
    if (geoJsonData && countryData && mapInstance.current) {
      const getColor = (density) => {
        return density > 200
          ? '#f16d7a'
          : density >= 100
            ? '#fa8a76'
            : density >= 50
              ? '#ffa679'
              : density >= 25
                ? '#ffc285'
                : density >= 10
                  ? '#ffdd9a'
                  : density >= 1
                    ? '#fef6b5'
                    : '#ffffff'
      }

      const style = (feature) => {
        const countryName = feature.properties.name
        const density = (countryData && countryData[countryName]) || 0
        return {
          fillColor: getColor(density),
          weight: 1,
          opacity: 1,
          color: 'black',
          dashArray: '3',
          fillOpacity: 0.7,
        }
      }

      const onEachFeature = (feature, layer) => {
        const countryName = feature.properties.name
        const count = (countryData && countryData[countryName]) || 0
        layer.bindPopup(`${countryName}: ${count}`)
      }

      const geoJsonLayer = L.geoJSON(geoJsonData, {
        style: style,
        onEachFeature: onEachFeature,
      })

      geoJsonLayer.addTo(mapInstance.current)
    }
  }, [geoJsonData, countryData])

  return (
    <div className="z-0">
      <div ref={mapRef} style={{ height: '600px', width: '100%', zIndex: 0 }}>
        <MapLegend />
      </div>
    </div>
  )
}

export default ChoroplethMap
