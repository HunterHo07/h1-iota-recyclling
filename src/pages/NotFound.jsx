import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft, Recycle } from 'lucide-react'

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated 404 */}
          <motion.div
            animate={{ 
              rotate: [0, 10, -10, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="text-8xl font-bold text-primary-600 mb-4"
          >
            404
          </motion.div>

          {/* Recycling Icon */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="inline-block p-4 bg-primary-100 rounded-full mb-6"
          >
            <Recycle className="h-12 w-12 text-primary-600" />
          </motion.div>

          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h1>
          
          <p className="text-gray-600 mb-8">
            Oops! The page you're looking for seems to have been recycled. 
            Let's get you back to where you need to be.
          </p>

          <div className="space-y-4">
            <Link
              to="/"
              className="btn-primary w-full flex items-center justify-center"
            >
              <Home className="h-5 w-5 mr-2" />
              Go Home
            </Link>
            
            <button
              onClick={() => window.history.back()}
              className="btn-outline w-full flex items-center justify-center"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Go Back
            </button>
          </div>

          {/* Fun fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 p-4 bg-primary-50 rounded-lg"
          >
            <p className="text-sm text-primary-700">
              💡 <strong>Did you know?</strong> Recycling one aluminum can saves enough energy to power a TV for 3 hours!
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default NotFound
