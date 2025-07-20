/**
 * Job Details Modal with Address Reveal and Dispute System
 * Shows full details only after collector has successfully locked payment
 */

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  MapPin, 
  Phone, 
  Clock, 
  Package, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  MessageSquare
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAppState } from '@store/AppStateProvider'
import { useWallet } from '@store/WalletProvider'
import { formatDualCurrency } from '@utils/currency'

const JobDetailsModal = ({ job, isOpen, onClose }) => {
  const [showDispute, setShowDispute] = useState(false)
  const [disputeReason, setDisputeReason] = useState('')
  const [disputeAmount, setDisputeAmount] = useState('')
  const [isSubmittingDispute, setIsSubmittingDispute] = useState(false)
  const [isCompletingJob, setIsCompletingJob] = useState(false)

  const { completeJob, submitDispute } = useAppState()
  const { address } = useWallet()

  if (!job || !isOpen) return null

  // Check if current user is the collector who claimed this job
  const isCollectorForThisJob = job.collector === address && job.status === 'claimed'
  
  // Only show full details if payment is locked (job is claimed)
  const showFullDetails = job.status === 'claimed' || job.status === 'completed' || job.status === 'disputed'

  const handleCompleteJob = async () => {
    setIsCompletingJob(true)
    try {
      const result = await completeJob(job.id, {
        completedAt: new Date().toISOString(),
        collectorNotes: 'Job completed as described'
      })

      // Show success with transaction link
      toast.success(
        <div>
          <div className="font-semibold">Job completed successfully!</div>
          <div className="text-sm text-gray-600 mt-1">Payment released to user</div>
          {result?.transactionId && (
            <button
              onClick={() => window.open(`https://explorer.iota.org/?network=testnet&query=${result.transactionId}`, '_blank')}
              className="text-blue-600 hover:text-blue-800 text-xs mt-2 flex items-center"
            >
              View live transaction →
            </button>
          )}
        </div>,
        { duration: 8000 }
      )
      onClose()
    } catch (error) {
      toast.error('Failed to complete job')
    } finally {
      setIsCompletingJob(false)
    }
  }

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      toast.error('Please provide a reason for the dispute')
      return
    }

    if (!disputeAmount || parseFloat(disputeAmount) <= 0) {
      toast.error('Please provide a valid dispute amount')
      return
    }

    setIsSubmittingDispute(true)
    try {
      await submitDispute(job.id, {
        reason: disputeReason,
        proposedAmount: parseFloat(disputeAmount),
        originalAmount: job.reward,
        submittedBy: 'collector',
        submittedAt: new Date().toISOString()
      })
      toast.success('Dispute submitted. User will be notified.')
      setShowDispute(false)
      onClose()
    } catch (error) {
      toast.error('Failed to submit dispute')
    } finally {
      setIsSubmittingDispute(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">Job Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Job Basic Info */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{job.title}</h3>
              <p className="text-gray-600 mb-4">{job.description}</p>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Material:</span>
                  <span className="ml-2 font-medium">{job.itemType}</span>
                </div>
                <div>
                  <span className="text-gray-500">Weight:</span>
                  <span className="ml-2 font-medium">{job.weight} kg</span>
                </div>
                <div>
                  <span className="text-gray-500">Payment:</span>
                  <span className="ml-2 font-medium">{formatDualCurrency(job.reward)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Status:</span>
                  <span className={`ml-2 font-medium ${
                    job.status === 'claimed' ? 'text-blue-600' :
                    job.status === 'completed' ? 'text-green-600' :
                    job.status === 'disputed' ? 'text-red-600' :
                    'text-gray-600'
                  }`}>
                    {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Lock Status */}
            {job.status === 'claimed' && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 mr-2" />
                  <span className="font-medium text-blue-900">Payment Locked in Escrow</span>
                </div>
                <p className="text-blue-700 text-sm mt-1">
                  {formatDualCurrency(job.lockedAmount)} has been locked and will be released upon job completion.
                </p>
              </div>
            )}

            {/* Address Details - Only shown after payment lock */}
            {showFullDetails && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center">
                  <MapPin className="h-5 w-5 mr-2" />
                  Collection Address
                </h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-green-700 font-medium">Address:</span>
                    <p className="text-green-800 mt-1">{job.location}</p>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Contact:</span>
                    <p className="text-green-800 mt-1">+60 12-345 6789</p>
                  </div>
                  <div>
                    <span className="text-green-700 font-medium">Best Time:</span>
                    <p className="text-green-800 mt-1">9:00 AM - 6:00 PM</p>
                  </div>
                </div>
              </div>
            )}

            {/* Photo */}
            {job.photoUrl && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Photo</h4>
                <img 
                  src={job.photoUrl} 
                  alt="Recyclables" 
                  className="w-full h-48 object-cover rounded-xl"
                />
              </div>
            )}

            {/* Collector Actions */}
            {isCollectorForThisJob && !showDispute && (
              <div className="flex space-x-4">
                <button
                  onClick={handleCompleteJob}
                  disabled={isCompletingJob}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center"
                >
                  {isCompletingJob ? (
                    <>
                      <div className="spinner mr-2" />
                      Completing...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-5 w-5 mr-2" />
                      Complete Job
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowDispute(true)}
                  className="flex-1 bg-red-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center"
                >
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Report Issue
                </button>
              </div>
            )}

            {/* Dispute Form */}
            {showDispute && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <h4 className="font-semibold text-red-900 mb-3 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Report Issue
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Issue Description
                    </label>
                    <textarea
                      value={disputeReason}
                      onChange={(e) => setDisputeReason(e.target.value)}
                      className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      rows="3"
                      placeholder="Describe the issue (e.g., items don't match description, wrong weight, etc.)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-red-700 mb-1">
                      Proposed Payment Amount (IOTA)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      value={disputeAmount}
                      onChange={(e) => setDisputeAmount(e.target.value)}
                      className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder={`Original: ${job.reward} IOTA`}
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      onClick={() => setShowDispute(false)}
                      className="flex-1 py-2 px-4 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSubmitDispute}
                      disabled={isSubmittingDispute}
                      className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {isSubmittingDispute ? 'Submitting...' : 'Submit Dispute'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Warning for non-collectors */}
            {!showFullDetails && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mr-2" />
                  <span className="font-medium text-yellow-900">Limited Information</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  Full address and contact details are only revealed after successfully claiming the job and locking payment.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default JobDetailsModal
