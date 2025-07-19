import React from 'react'
import { motion } from 'framer-motion'
import { Recycle } from 'lucide-react'

const LoadingScreen = ({ message = 'Loading...', fullScreen = true }) => {
  const containerClass = fullScreen 
    ? 'fixed inset-0 bg-white z-50 flex items-center justify-center'
    : 'flex items-center justify-center py-12'

  return (
    <div className={containerClass}>
      <div className="text-center">
        {/* Animated Logo */}
        <motion.div
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ 
            rotate: { duration: 2, repeat: Infinity, ease: "linear" },
            scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
          }}
          className="inline-block p-4 bg-primary-100 rounded-full mb-6"
        >
          <Recycle className="h-12 w-12 text-primary-600" />
        </motion.div>

        {/* Loading Text */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 mb-2"
        >
          {message}
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-gray-600 mb-8"
        >
          Please wait while we process your request
        </motion.p>

        {/* Loading Dots */}
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: index * 0.2
              }}
              className="w-3 h-3 bg-primary-600 rounded-full"
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default LoadingScreen
