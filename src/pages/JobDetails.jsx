import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  Clock,
  Weight,
  Coins,
  User,
  Package,
  CheckCircle,
  Truck,
  Phone,
  Mail,
  Calendar,
  AlertCircle,
  Shield,
  Eye,
  EyeOff,
  Copy
} from 'lucide-react'
import { useAppState } from '@store/AppStateProvider'
import { useWallet } from '@store/WalletProvider'
import { toast } from 'react-hot-toast'

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { jobs, userRole, claimJob } = useAppState()
  const { isConnected, address } = useWallet()
  const [showFullAddress, setShowFullAddress] = useState(false)

  const job = jobs.find(j => j.id === id)

  // Check if current user has claimed this job
  const isJobClaimedByUser = job && job.claimedBy === address
  const canViewFullDetails = isJobClaimedByUser || (job && job.poster === address)

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const handleClaimJob = async () => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    try {
      await claimJob(job.id)
      toast.success('Job claimed successfully! Full details are now available.')
    } catch (error) {
      toast.error('Failed to claim job')
    }
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'posted': return 'bg-blue-100 text-blue-800'
      case 'claimed': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'paid': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-MY', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Dashboard</span>
          </button>
          
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <div className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(job.status)}`}>
                <span className="capitalize">{job.status}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image */}
            {job.photoUrl && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-0 overflow-hidden"
              >
                <img
                  src={job.photoUrl}
                  alt={job.title}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </motion.div>
            )}

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Description</h2>
              <p className="text-gray-600 leading-relaxed">{job.description}</p>
            </motion.div>

            {/* Contact Information - Only visible after claiming */}
            {canViewFullDetails && job.contactInfo && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <User className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Contact Information</h2>
                  <Shield className="h-4 w-4 text-green-600" />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">{job.contactInfo.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-600" />
                      <span className="font-mono">{job.contactInfo.phone}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(job.contactInfo.phone)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-600" />
                      <span>{job.contactInfo.email}</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(job.contactInfo.email)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Copy className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Pickup Details - Only visible after claiming */}
            {canViewFullDetails && job.pickupPreferences && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="card p-6"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Truck className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-semibold text-gray-900">Pickup Details</h2>
                  <Shield className="h-4 w-4 text-green-600" />
                </div>

                <div className="space-y-4">
                  {/* Full Address */}
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Full Address</span>
                      </div>
                      <button
                        onClick={() => setShowFullAddress(!showFullAddress)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        {showFullAddress ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="text-sm">{showFullAddress ? 'Hide' : 'Show'}</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-800 font-mono">
                        {showFullAddress ? job.fullAddress : '••••••••••••••••••••••••••••••••••••••••'}
                      </span>
                      {showFullAddress && (
                        <button
                          onClick={() => copyToClipboard(job.fullAddress)}
                          className="p-1 hover:bg-blue-200 rounded"
                        >
                          <Copy className="h-4 w-4 text-blue-600" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Available Time Slots</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.pickupPreferences.timeSlots.map((slot, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Preferred Days */}
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <span className="font-medium">Preferred Days</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {job.pickupPreferences.preferredDays.map((day, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {job.pickupPreferences.specialInstructions && (
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Special Instructions</span>
                      </div>
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                        <p className="text-orange-800 text-sm">
                          {job.pickupPreferences.specialInstructions}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Privacy Notice for Non-Claimed Jobs */}
            {!canViewFullDetails && userRole === 'collector' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="card p-6 border-2 border-dashed border-gray-300"
              >
                <div className="text-center">
                  <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Claim Job to View Full Details
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Contact information, full address, and pickup instructions will be revealed after you claim this job.
                  </p>
                  <button
                    onClick={handleClaimJob}
                    className="btn-primary"
                  >
                    Claim Job to Access Details
                  </button>
                </div>
              </motion.div>
            )}

            {/* Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Package className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Job Posted</p>
                    <p className="text-sm text-gray-500">{formatDate(job.createdAt)}</p>
                  </div>
                </div>

                {job.claimedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <Truck className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Job Claimed</p>
                      <p className="text-sm text-gray-500">{formatDate(job.claimedAt)}</p>
                    </div>
                  </div>
                )}

                {job.completedAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Job Completed</p>
                      <p className="text-sm text-gray-500">{formatDate(job.completedAt)}</p>
                    </div>
                  </div>
                )}

                {job.paidAt && (
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Coins className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Payment Released</p>
                      <p className="text-sm text-gray-500">{formatDate(job.paidAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Weight className="h-4 w-4" />
                    <span>Weight</span>
                  </div>
                  <span className="font-medium text-gray-900">{job.weight}kg</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Package className="h-4 w-4" />
                    <span>Type</span>
                  </div>
                  <span className="font-medium text-gray-900 capitalize">{job.itemType}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Coins className="h-4 w-4" />
                    <span>Reward</span>
                  </div>
                  <span className="font-semibold text-accent-600">RM {job.reward}</span>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <div className="flex items-start space-x-2 text-gray-600">
                    <MapPin className="h-4 w-4 mt-0.5" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Poster/Collector Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {userRole === 'recycler' ? 'Collector' : 'Posted By'}
              </h3>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {userRole === 'recycler' 
                      ? (job.collector || 'No collector yet') 
                      : job.poster
                    }
                  </p>
                  <p className="text-sm text-gray-500">
                    {userRole === 'recycler' ? 'Collector' : 'Job Poster'}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Action Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              {job.status === 'posted' && userRole === 'collector' && (
                <button className="w-full btn-primary">
                  <Truck className="h-5 w-5 mr-2" />
                  Claim This Job
                </button>
              )}
              
              {job.status === 'claimed' && job.collector === 'current_user' && (
                <button className="w-full btn-primary">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Mark as Completed
                </button>
              )}
              
              {job.status === 'completed' && job.poster === 'current_user' && (
                <button className="w-full btn-primary">
                  <Coins className="h-5 w-5 mr-2" />
                  Release Payment
                </button>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetails
