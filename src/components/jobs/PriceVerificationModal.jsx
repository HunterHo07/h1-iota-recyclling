import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  AlertTriangle, 
  CheckCircle, 
  DollarSign,
  Scale,
  Camera,
  MessageSquare
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const PriceVerificationModal = ({ 
  isOpen, 
  onClose, 
  job, 
  onConfirmPrice,
  onReportIssue 
}) => {
  const [verifiedWeight, setVerifiedWeight] = useState(job?.weight || 0)
  const [finalPrice, setFinalPrice] = useState(job?.reward || 0)
  const [issueReason, setIssueReason] = useState('')
  const [showIssueForm, setShowIssueForm] = useState(false)
  const [proofPhotos, setProofPhotos] = useState([])

  const originalPrice = job?.reward || 0
  const priceDifference = originalPrice - finalPrice
  const priceChangePercent = ((priceDifference / originalPrice) * 100).toFixed(1)

  const isPriceReduced = finalPrice < originalPrice
  const isSignificantReduction = isPriceReduced && Math.abs(priceChangePercent) > 20

  const handleConfirmPrice = () => {
    if (isSignificantReduction && !issueReason.trim()) {
      setShowIssueForm(true)
      return
    }

    const verification = {
      originalWeight: job.weight,
      verifiedWeight,
      originalPrice,
      finalPrice,
      reason: issueReason,
      proofPhotos,
      timestamp: new Date().toISOString()
    }

    onConfirmPrice(verification)
    toast.success('Price verification completed!')
    onClose()
  }

  const handleReportIssue = () => {
    if (!issueReason.trim()) {
      toast.error('Please provide a reason for the price adjustment')
      return
    }

    const report = {
      jobId: job.id,
      originalPrice,
      suggestedPrice: finalPrice,
      reason: issueReason,
      proofPhotos,
      reportedBy: 'collector',
      timestamp: new Date().toISOString()
    }

    onReportIssue(report)
    toast.success('Issue reported. User will be notified.')
    onClose()
  }

  if (!isOpen || !job) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">Price Verification</h2>
                <p className="text-blue-100 text-sm mt-1">Verify actual weight and condition</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Job Info */}
            <div className="bg-gray-50 rounded-xl p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{job.title}</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Expected Weight:</span>
                  <span className="font-medium ml-2">{job.weight}kg</span>
                </div>
                <div>
                  <span className="text-gray-600">Original Price:</span>
                  <span className="font-medium ml-2">RM {originalPrice}</span>
                </div>
              </div>
            </div>

            {/* Weight Verification */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Scale className="h-4 w-4 inline mr-2" />
                Actual Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={verifiedWeight}
                onChange={(e) => {
                  const weight = parseFloat(e.target.value) || 0
                  setVerifiedWeight(weight)
                  // Auto-adjust price based on weight difference
                  const weightRatio = weight / job.weight
                  setFinalPrice(Math.round(originalPrice * weightRatio * 100) / 100)
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter actual weight"
              />
            </div>

            {/* Price Adjustment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="h-4 w-4 inline mr-2" />
                Final Price (RM)
              </label>
              <input
                type="number"
                step="0.01"
                value={finalPrice}
                onChange={(e) => setFinalPrice(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter final price"
              />
              
              {isPriceReduced && (
                <div className={`mt-2 p-3 rounded-lg ${isSignificantReduction ? 'bg-red-50 border border-red-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className={`h-4 w-4 ${isSignificantReduction ? 'text-red-600' : 'text-yellow-600'}`} />
                    <span className={`text-sm font-medium ${isSignificantReduction ? 'text-red-800' : 'text-yellow-800'}`}>
                      Price reduced by RM {priceDifference.toFixed(2)} ({priceChangePercent}%)
                    </span>
                  </div>
                  {isSignificantReduction && (
                    <p className="text-red-700 text-xs mt-1">
                      Significant price reduction requires explanation
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Issue Reason (if price reduced significantly) */}
            {(showIssueForm || isSignificantReduction) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-3"
              >
                <label className="block text-sm font-medium text-gray-700">
                  <MessageSquare className="h-4 w-4 inline mr-2" />
                  Reason for Price Adjustment *
                </label>
                <textarea
                  value={issueReason}
                  onChange={(e) => setIssueReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows="3"
                  placeholder="e.g., Items were contaminated, weight was overestimated, some items not recyclable..."
                />
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-blue-800 text-sm">
                    <strong>💡 Common reasons:</strong> Contaminated materials, mixed non-recyclables, 
                    overestimated weight, damaged items, or different material type than expected.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Proof Photos */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Camera className="h-4 w-4 inline mr-2" />
                Proof Photos (Optional)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                <Camera className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600">
                  Take photos of actual items for verification
                </p>
                <button className="mt-2 text-blue-600 text-sm hover:text-blue-700">
                  Add Photos
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              
              {isSignificantReduction ? (
                <button
                  onClick={handleReportIssue}
                  className="flex-1 py-3 px-4 bg-orange-600 text-white rounded-xl font-medium hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span>Report Issue</span>
                </button>
              ) : (
                <button
                  onClick={handleConfirmPrice}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="h-5 w-5" />
                  <span>Confirm Price</span>
                </button>
              )}
            </div>

            {/* Fee Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-green-800 text-sm">
                <strong>🎉 No fees for collectors!</strong> You receive the full amount. 
                We cover platform costs to support environmental efforts.
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default PriceVerificationModal
