import React from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Clock, 
  Coins, 
  Weight, 
  User, 
  CheckCircle,
  AlertCircle,
  Package
} from 'lucide-react'
import { useAppState } from '@store/AppStateProvider'

const JobCard = ({ job, onAction, actionLabel, actionIcon: ActionIcon, showPoster = false }) => {
  const { userRole } = useAppState()

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800'
      case 'claimed': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'payment_pending': return 'bg-orange-100 text-orange-800'
      case 'paid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'posted': return <Package className="h-4 w-4" />
      case 'claimed': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'payment_pending': return <AlertCircle className="h-4 w-4" />
      case 'paid': return <Coins className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  const getItemTypeIcon = (itemType) => {
    switch (itemType.toLowerCase()) {
      case 'cardboard': return '📦'
      case 'plastic': return '🥤'
      case 'glass': return '🍾'
      case 'metal': return '🥫'
      case 'paper': return '📄'
      case 'electronics': return '📱'
      default: return '♻️'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="card-interactive p-6 bg-white"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">
            {getItemTypeIcon(job.itemType)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {job.title}
            </h3>
            {showPoster && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <User className="h-3 w-3" />
                <span>Posted by {job.poster}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
          {getStatusIcon(job.status)}
          <span className="capitalize">{job.status}</span>
        </div>
      </div>

      {/* Image */}
      {job.photoUrl && (
        <div className="mb-4">
          <img
            src={job.photoUrl}
            alt={job.title}
            className="w-full h-48 object-cover rounded-xl"
            loading="lazy"
          />
        </div>
      )}

      {/* Description */}
      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
        {job.description}
      </p>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Weight className="h-4 w-4 text-gray-400" />
          <span>{job.weight}kg</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Coins className="h-4 w-4 text-accent-500" />
          <span className="font-semibold text-accent-600">RM {job.reward}</span>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-gray-600 col-span-2">
          <MapPin className="h-4 w-4 text-gray-400" />
          <span className="truncate">{job.location}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(job.createdAt)}</span>
        </div>

        {onAction && actionLabel && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onAction(job)}
            className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            {ActionIcon && <ActionIcon className="h-4 w-4" />}
            <span>{actionLabel}</span>
          </motion.button>
        )}
      </div>

      {/* Progress Indicator for claimed/completed jobs */}
      {(job.status === 'claimed' || job.status === 'completed' || job.status === 'payment_pending') && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
            <span>Progress</span>
            <span>
              {job.status === 'claimed' ? '50%' :
               job.status === 'completed' ? '75%' :
               job.status === 'payment_pending' ? '90%' : '100%'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                job.status === 'claimed' ? 'bg-yellow-500 w-1/2' :
                job.status === 'completed' ? 'bg-green-500 w-3/4' :
                job.status === 'payment_pending' ? 'bg-orange-500 w-11/12' :
                'bg-purple-500 w-full'
              }`}
            />
          </div>
        </div>
      )}

      {/* Payment Details for paid jobs */}
      {job.status === 'paid' && job.transactionId && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Transaction ID:</span>
            <span className="font-mono text-purple-600">
              {job.transactionId.slice(0, 8)}...{job.transactionId.slice(-6)}
            </span>
          </div>
          {job.paidAt && (
            <div className="flex items-center justify-between text-xs mt-1">
              <span className="text-gray-500">Paid:</span>
              <span className="text-green-600">{formatTimeAgo(job.paidAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Payment Error for payment_pending jobs */}
      {job.status === 'payment_pending' && job.paymentError && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
            <div className="font-medium">Payment Pending</div>
            <div className="mt-1">{job.paymentError}</div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default JobCard
