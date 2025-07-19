import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MapPin, Navigation, Zap, Package } from 'lucide-react'

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
      {/* Map Header */}
      <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin className="h-5 w-5" />
            <h3 className="font-semibold">Jobs Near You</h3>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Navigation className="h-4 w-4" />
            <span>{jobs.length} jobs available</span>
          </div>
        </div>
      </div>

      {/* Mock Map Area */}
      <div className="relative h-64 bg-gradient-to-br from-blue-50 to-green-50 overflow-hidden">
        {/* Grid pattern to simulate map */}
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-8 grid-rows-8 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="border border-gray-300"></div>
            ))}
          </div>
        </div>

        {/* Area Labels */}
        <div className="absolute top-4 left-4 text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
          KLCC
        </div>
        <div className="absolute top-4 right-4 text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
          Mont Kiara
        </div>
        <div className="absolute bottom-4 left-4 text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
          Bangsar
        </div>
        <div className="absolute bottom-4 right-4 text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded">
          PJ
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
              <div className={`w-8 h-8 rounded-full ${getRewardColor(location.job.reward)} flex items-center justify-center text-white text-xs font-bold shadow-lg hover:scale-110 transition-transform`}>
                <span className="text-lg">{getItemIcon(location.job.itemType)}</span>
              </div>
              
              {/* Reward badge */}
              <div className="absolute -top-2 -right-2 bg-white text-xs font-bold text-gray-800 px-1 py-0.5 rounded-full shadow border">
                RM{location.job.reward}
              </div>
              
              {/* Pulse animation for new jobs */}
              {location.job.status === 'posted' && (
                <div className={`absolute inset-0 rounded-full ${getRewardColor(location.job.reward)} animate-ping opacity-75`}></div>
              )}
            </motion.div>
          )
        })}

        {/* User location (if available) */}
        {userLocation && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg">
              <div className="w-full h-full bg-blue-400 rounded-full animate-pulse"></div>
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
