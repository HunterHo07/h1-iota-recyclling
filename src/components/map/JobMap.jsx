import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Zap, Package, RefreshCw } from 'lucide-react'

const JobMap = ({ jobs = [], onJobSelect, userLocation = null }) => {
  const [selectedJob, setSelectedJob] = useState(null)
  const [mapCenter, setMapCenter] = useState({ lat: 3.1390, lng: 101.6869 }) // KL center

  // Mock map data - in real app would use Google Maps/Mapbox
  const mockLocations = {
    'KLCC, Kuala Lumpur': { lat: 3.1578, lng: 101.7123, area: 'KLCC' },
    'Petaling Jaya, Malaysia': { lat: 3.1073, lng: 101.6067, area: 'PJ' },
    'Mont Kiara, KL': { lat: 3.1725, lng: 101.6508, area: 'Mont Kiara' },
    'Bangsar, KL': { lat: 3.1285, lng: 101.6670, area: 'Bangsar' },
    'Subang Jaya': { lat: 3.0833, lng: 101.5833, area: 'Subang' },
    'Shah Alam': { lat: 3.0733, lng: 101.5185, area: 'Shah Alam' }
  }

  const getJobLocation = (job) => {
    // Extract area from location string
    const location = job.location || ''
    for (const [key, coords] of Object.entries(mockLocations)) {
      if (location.includes(coords.area) || location.includes(key)) {
        return { ...coords, job }
      }
    }
    // Default location with some randomization
    return {
      lat: 3.1390 + (Math.random() - 0.5) * 0.1,
      lng: 101.6869 + (Math.random() - 0.5) * 0.1,
      area: 'KL Area',
      job
    }
  }

  const jobLocations = jobs.map(job => getJobLocation(job))

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case 'cardboard': return '📦'
      case 'plastic': return '🥤'
      case 'glass': return '🍾'
      case 'metal': return '🥫'
      case 'paper': return '📄'
      case 'electronics': return '📱'
      default: return '♻️'
    }
  }

  const getRewardColor = (reward) => {
    if (reward >= 20) return 'bg-green-500'
    if (reward >= 10) return 'bg-yellow-500'
    return 'bg-blue-500'
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Enhanced Map Header */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-secondary-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white bg-opacity-20 rounded-lg">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Jobs Near You</h3>
              <p className="text-sm text-blue-100">Real-time recycling opportunities</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <Navigation className="h-4 w-4" />
              <span className="font-medium">{jobs.length} jobs available</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <div className="text-xs text-blue-100">Total Rewards</div>
                <div className="font-bold">RM {jobs.reduce((sum, job) => sum + job.reward, 0)}</div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="p-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition-colors"
                title="Refresh map"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Mock Map Area */}
      <div className="relative h-80 bg-gradient-to-br from-blue-100 via-green-50 to-blue-50 overflow-hidden">
        {/* Map background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-12 grid-rows-12 h-full">
            {Array.from({ length: 144 }).map((_, i) => (
              <div key={i} className="border border-gray-200"></div>
            ))}
          </div>
        </div>

        {/* Roads/Streets simulation */}
        <div className="absolute inset-0">
          {/* Horizontal roads */}
          <div className="absolute top-1/4 left-0 right-0 h-1 bg-gray-300 opacity-60"></div>
          <div className="absolute top-1/2 left-0 right-0 h-2 bg-gray-400 opacity-70"></div>
          <div className="absolute top-3/4 left-0 right-0 h-1 bg-gray-300 opacity-60"></div>

          {/* Vertical roads */}
          <div className="absolute left-1/4 top-0 bottom-0 w-1 bg-gray-300 opacity-60"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-2 bg-gray-400 opacity-70"></div>
          <div className="absolute left-3/4 top-0 bottom-0 w-1 bg-gray-300 opacity-60"></div>
        </div>

        {/* Building blocks simulation */}
        <div className="absolute inset-0">
          {/* Commercial areas */}
          <div className="absolute top-8 left-8 w-16 h-12 bg-gray-200 opacity-40 rounded"></div>
          <div className="absolute top-8 right-8 w-20 h-16 bg-gray-200 opacity-40 rounded"></div>
          <div className="absolute bottom-8 left-8 w-18 h-14 bg-gray-200 opacity-40 rounded"></div>
          <div className="absolute bottom-8 right-8 w-16 h-12 bg-gray-200 opacity-40 rounded"></div>

          {/* Parks/green areas */}
          <div className="absolute top-1/3 left-1/3 w-12 h-8 bg-green-200 opacity-50 rounded-full"></div>
          <div className="absolute bottom-1/3 right-1/3 w-10 h-10 bg-green-200 opacity-50 rounded-full"></div>
        </div>

        {/* Enhanced Area Labels */}
        <div className="absolute top-4 left-4 text-xs font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm border">
          🏢 KLCC
        </div>
        <div className="absolute top-4 right-4 text-xs font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm border">
          🏘️ Mont Kiara
        </div>
        <div className="absolute bottom-4 left-4 text-xs font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm border">
          🌆 Bangsar
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-semibold text-gray-700 bg-white px-3 py-2 rounded-lg shadow-sm border">
          🏬 Petaling Jaya
        </div>

        {/* Central area label */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-gray-600 bg-white bg-opacity-90 px-3 py-2 rounded-lg shadow-sm border">
          📍 Kuala Lumpur City Center
        </div>

        {/* Job Markers */}
        {jobLocations.map((location, index) => {
          const x = ((location.lng - 101.5) / 0.3) * 100
          const y = ((3.2 - location.lat) / 0.15) * 100
          
          return (
            <motion.div
              key={location.job.id}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer"
              style={{ 
                left: `${Math.max(10, Math.min(90, x))}%`, 
                top: `${Math.max(10, Math.min(90, y))}%` 
              }}
              onClick={() => {
                setSelectedJob(location.job)
                if (onJobSelect) onJobSelect(location.job)
              }}
            >
              <div className={`w-10 h-10 rounded-full ${getRewardColor(location.job.reward)} flex items-center justify-center text-white text-xs font-bold shadow-xl hover:scale-125 transition-all duration-200 border-2 border-white`}>
                <span className="text-xl">{getItemIcon(location.job.itemType)}</span>
              </div>

              {/* Enhanced reward badge */}
              <div className="absolute -top-3 -right-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-xs font-bold text-gray-900 px-2 py-1 rounded-full shadow-lg border-2 border-white">
                RM{location.job.reward}
              </div>

              {/* Weight indicator */}
              <div className="absolute -bottom-3 -left-1 bg-blue-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full shadow-md">
                {location.job.weight}kg
              </div>

              {/* Pulse animation for new jobs */}
              {location.job.status === 'posted' && (
                <div className={`absolute inset-0 rounded-full ${getRewardColor(location.job.reward)} animate-ping opacity-60`}></div>
              )}

              {/* Hover tooltip */}
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                {location.job.title}
              </div>
            </motion.div>
          )
        })}

        {/* User location (if available) */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-5 h-5 bg-blue-600 rounded-full border-3 border-white shadow-lg">
              <div className="w-full h-full bg-blue-400 rounded-full animate-pulse"></div>
            </div>
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              📍 You are here
            </div>
          </div>
        )}

        {/* No Jobs State */}
        {jobs.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center p-8 bg-white bg-opacity-90 rounded-xl shadow-lg">
              <div className="text-4xl mb-3">🗺️</div>
              <h4 className="font-semibold text-gray-700 mb-2">No Jobs Available</h4>
              <p className="text-sm text-gray-600">Check back later for new recycling opportunities!</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Job Details */}
      {selectedJob && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-gray-200 bg-gray-50"
        >
          <div className="flex items-start space-x-3">
            <div className="text-2xl">{getItemIcon(selectedJob.itemType)}</div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900">{selectedJob.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{selectedJob.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Package className="h-4 w-4" />
                    <span>{selectedJob.weight}kg</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span>{selectedJob.location}</span>
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-green-600">RM {selectedJob.reward}</span>
                  <button
                    onClick={() => onJobSelect && onJobSelect(selectedJob)}
                    className="bg-primary-600 text-white px-3 py-1 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Map Legend */}
      <div className="p-3 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>High Value (RM 20+)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Medium (RM 10-19)</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>Standard (RM 1-9)</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <Zap className="h-3 w-3 text-yellow-500" />
            <span>Live updates</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobMap
