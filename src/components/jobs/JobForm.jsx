import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { 
  Camera, 
  Upload, 
  X, 
  MapPin, 
  Package, 
  Weight, 
  Coins,
  FileText,
  CheckCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAppState } from '@store/AppStateProvider'
import { useWallet } from '@store/WalletProvider'
import RewardCalculator from './RewardCalculator'
import TransactionPopup from '@components/blockchain/TransactionPopup'

const JobForm = ({ onSubmit, onCancel }) => {
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showTransactionPopup, setShowTransactionPopup] = useState(false)
  const [pendingJobData, setPendingJobData] = useState(null)
  const [showDummyOptions, setShowDummyOptions] = useState(false)
  const fileInputRef = useRef(null)
  
  const { addJob } = useAppState()
  const { isConnected } = useWallet()
  
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm({
    defaultValues: {
      title: '',
      description: '',
      itemType: 'cardboard',
      weight: '',
      location: '',
      reward: ''
    }
  })

  const itemTypes = [
    { value: 'cardboard', label: 'Cardboard', icon: '📦' },
    { value: 'plastic', label: 'Plastic', icon: '🥤' },
    { value: 'glass', label: 'Glass', icon: '🍾' },
    { value: 'metal', label: 'Metal', icon: '🥫' },
    { value: 'paper', label: 'Paper', icon: '📄' },
    { value: 'electronics', label: 'Electronics', icon: '📱' },
    { value: 'other', label: 'Other', icon: '♻️' }
  ]

  // Dummy photos for testing
  const dummyPhotos = [
    {
      id: 'cardboard',
      name: 'Cardboard Boxes',
      url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop&auto=format',
      description: 'Clean cardboard boxes'
    },
    {
      id: 'plastic',
      name: 'Plastic Bottles',
      url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop&auto=format',
      description: 'Plastic bottles collection'
    },
    {
      id: 'electronics',
      name: 'Old Electronics',
      url: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=400&h=300&fit=crop&auto=format',
      description: 'Electronic waste items'
    },
    {
      id: 'glass',
      name: 'Glass Bottles',
      url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=300&fit=crop&auto=format',
      description: 'Glass bottles and jars'
    },
    {
      id: 'metal',
      name: 'Metal Cans',
      url: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400&h=300&fit=crop&auto=format',
      description: 'Aluminum cans'
    },
    {
      id: 'paper',
      name: 'Paper Waste',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop&auto=format',
      description: 'Paper documents and newspapers'
    }
  ]

  const handleImageSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast.error('Image size must be less than 5MB')
        return
      }
      
      setSelectedImage(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const onFormSubmit = async (data) => {
    console.log('🚀 Form submission started', { data, isConnected, selectedImage })

    if (!isConnected) {
      console.log('❌ Wallet not connected')
      toast.error('Please connect your wallet first')
      return
    }

    if (!selectedImage) {
      console.log('❌ No image selected')
      toast.error('Please add a photo of your recyclables')
      return
    }

    console.log('✅ Validation passed, preparing job data...')

    // Prepare job data and show transaction popup
    const jobData = {
      ...data,
      weight: parseFloat(data.weight),
      reward: parseFloat(data.reward),
      photoUrl: imagePreview, // In real app, this would be uploaded to IPFS/cloud
      itemType: data.itemType
    }

    console.log('📋 Job data prepared:', jobData)
    setPendingJobData(jobData)
    setShowTransactionPopup(true)
    console.log('🔄 Transaction popup should show now')
  }

  const handleTransactionConfirm = async (txResult) => {
    setIsSubmitting(true)
    setShowTransactionPopup(false)

    try {
      // Simulate image upload to IPFS
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Add transaction ID to job data
      const jobDataWithTx = {
        ...pendingJobData,
        transactionId: txResult.transactionId || txResult.hash,
        blockNumber: txResult.blockNumber,
        timestamp: txResult.timestamp
      }

      const newJob = addJob(jobDataWithTx)

      if (onSubmit) {
        onSubmit(newJob)
      }

      // Show success with transaction link
      toast.success(
        <div>
          <div className="font-semibold">🎉 Job Posted Successfully!</div>
          <div className="text-sm text-gray-600 mt-1">Live on IOTA Testnet</div>
          {txResult.transactionId && (
            <button
              onClick={() => window.open(`https://explorer.iota.org/?network=testnet&query=${txResult.transactionId}`, '_blank')}
              className="text-blue-600 hover:text-blue-800 text-xs mt-2 flex items-center"
            >
              View live transaction →
            </button>
          )}
        </div>,
        { duration: 8000 }
      )

    } catch (error) {
      console.error('Error posting job:', error)
      toast.error('Failed to post job. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const watchedWeight = watch('weight')

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Post Recycling Job</h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="form-label">
              <Camera className="h-4 w-4 inline mr-2" />
              Photo of Recyclables *
            </label>
            
            {!imagePreview ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors"
              >
                <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">Click to upload photo</p>
                <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
          </div>

          {/* Title */}
          <div>
            <label className="form-label">
              <FileText className="h-4 w-4 inline mr-2" />
              Job Title *
            </label>
            <input
              {...register('title', { 
                required: 'Title is required',
                minLength: { value: 5, message: 'Title must be at least 5 characters' }
              })}
              className="form-input"
              placeholder="e.g., Cardboard boxes pickup"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="form-label">Description *</label>
            <textarea
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Description must be at least 10 characters' }
              })}
              className="form-input h-24 resize-none"
              placeholder="Describe your recyclables in detail..."
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Item Type & Weight */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="form-label">
                <Package className="h-4 w-4 inline mr-2" />
                Item Type *
              </label>
              <select
                {...register('itemType', { required: 'Item type is required' })}
                className="form-input"
              >
                {itemTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">
                <Weight className="h-4 w-4 inline mr-2" />
                Weight (kg) *
              </label>
              <input
                {...register('weight', { 
                  required: 'Weight is required',
                  min: { value: 0.1, message: 'Weight must be at least 0.1kg' },
                  max: { value: 1000, message: 'Weight cannot exceed 1000kg' }
                })}
                type="number"
                step="0.1"
                className="form-input"
                placeholder="5.0"
              />
              {errors.weight && (
                <p className="text-red-500 text-sm mt-1">{errors.weight.message}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="form-label">
              <MapPin className="h-4 w-4 inline mr-2" />
              Pickup Location *
            </label>
            <input
              {...register('location', { 
                required: 'Location is required',
                minLength: { value: 5, message: 'Please provide a detailed location' }
              })}
              className="form-input"
              placeholder="e.g., Kuala Lumpur, Malaysia"
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location.message}</p>
            )}
          </div>

          {/* Reward - Auto-calculated */}
          <div>
            <label className="form-label">
              <Coins className="h-4 w-4 inline mr-2" />
              Total Payment (Auto-calculated)
            </label>
            <div className="relative">
              <input
                {...register('reward', {
                  required: 'Reward amount is required',
                  min: { value: 0.1, message: 'Minimum reward is 0.1 IOTA' },
                  validate: (value) => {
                    const num = parseFloat(value)
                    if (isNaN(num) || num <= 0) {
                      return 'Invalid reward amount'
                    }
                    return true
                  }
                })}
                type="number"
                step="0.001"
                className="form-input bg-gray-50 text-gray-700 cursor-not-allowed"
                placeholder="Auto-calculated based on weight and material"
                readOnly
              />
              {errors.reward && (
                <p className="text-red-500 text-sm mt-1">{errors.reward.message}</p>
              )}
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Market Rate
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              💡 Amount calculated automatically based on material type, weight, and current market rates
            </p>

            {/* Reward Calculator */}
            <RewardCalculator
              itemType={watch('itemType')}
              weight={watchedWeight}
              onRewardChange={(amount) => {
                // Round to 3 decimal places for display
                const roundedAmount = Math.round(amount * 1000) / 1000
                console.log('💰 Reward calculated:', { amount, roundedAmount })
                setValue('reward', roundedAmount)
              }}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 btn-outline"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              disabled={isSubmitting || !isConnected}
              className="flex-1 btn-primary flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="spinner mr-2" />
                  Posting Job...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Post Job
                </>
              )}
            </button>
          </div>

          {!isConnected && (
            <p className="text-center text-sm text-red-600">
              Please connect your wallet to post a job
            </p>
          )}
        </form>
      </div>

      {/* Transaction Popup */}
      <TransactionPopup
        isOpen={showTransactionPopup}
        onClose={() => setShowTransactionPopup(false)}
        transaction={{
          method: 'postJob',
          params: pendingJobData
        }}
        onConfirm={handleTransactionConfirm}
      />
    </motion.div>
  )
}

export default JobForm
