import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Copy,
  Clock,
  Zap,
  Coins
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@store/WalletProvider'

const TransactionPopup = ({ 
  isOpen, 
  onClose, 
  transaction, 
  onConfirm,
  type = 'contract_call' 
}) => {
  const [step, setStep] = useState('confirm') // confirm, processing, success, error
  const [txHash, setTxHash] = useState('')
  const [gasEstimate] = useState('0.000') // IOTA is feeless!
  const [error, setError] = useState('')
  const [countdown, setCountdown] = useState(30)

  const { sendTransaction, updateBalance } = useWallet()

  // Handle countdown during processing
  useEffect(() => {
    if (step === 'processing') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            return 0
          }
          return prev - 1
        })
      }, 100) // Fast countdown for demo

      return () => clearInterval(timer)
    }
  }, [step])

  const getTransactionTitle = () => {
    switch (transaction?.method) {
      case 'postJob': return 'Post Recycling Job'
      case 'claimJob': return 'Claim Job'
      case 'completeJob': return 'Complete Job'
      case 'releasePayment': return 'Release Payment'
      default: return 'Blockchain Transaction'
    }
  }

  const getTransactionDescription = () => {
    switch (transaction?.method) {
      case 'postJob': 
        return `Post "${transaction.params?.title}" to the IOTA blockchain with RM ${transaction.params?.reward} reward`
      case 'claimJob': 
        return 'Claim this recycling job and commit to pickup'
      case 'completeJob': 
        return 'Mark job as completed and submit proof'
      case 'releasePayment': 
        return `Release RM ${transaction.params?.amount} payment to collector`
      default: 
        return 'Execute smart contract function on IOTA blockchain'
    }
  }

  const handleConfirm = async () => {
    setStep('processing')
    setError('')
    setCountdown(30)

    try {
      // Prepare transaction data based on method
      let transactionData = {}

      if (transaction?.method === 'postJob') {
        // Job posting transaction - user pays gas fee
        transactionData = {
          method: 'create_job',
          params: transaction.params,
          amount: '0.001', // Small gas fee for job posting
          to: 'marketplace_contract'
        }
      } else if (transaction?.method === 'claimJob') {
        // Job claiming transaction - collector locks payment
        transactionData = {
          method: 'claim_job',
          params: transaction.params,
          amount: transaction.params.reward, // Lock reward amount
          to: 'marketplace_contract'
        }
      }

      // Send real IOTA transaction
      const result = await sendTransaction(transactionData)

      if (result.hash) {
        setTxHash(result.hash)
        setStep('success')

        // Update balance after transaction
        await updateBalance()

        if (onConfirm) {
          onConfirm({
            hash: result.hash,
            transactionId: result.hash,
            gasUsed: gasEstimate,
            status: 'success',
            blockNumber: result.blockNumber,
            timestamp: result.timestamp
          })
        }
      } else {
        throw new Error(result.error || 'Transaction failed')
      }

    } catch (error) {
      console.error('Transaction failed:', error)
      setError(error.message)
      setStep('error')
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const openInExplorer = () => {
    // Use official IOTA explorer for testnet
    window.open(`https://explorer.iota.org/?network=testnet&query=${txHash}`, '_blank')
  }

  if (!isOpen) return null

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
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-secondary-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">{getTransactionTitle()}</h2>
                <p className="text-primary-100 text-sm mt-1">IOTA Blockchain Transaction</p>
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
          <div className="p-6">
            {step === 'confirm' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transaction Details</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {getTransactionDescription()}
                  </p>
                </div>

                {/* Gas Fee Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-700">Network Fee</span>
                    <div className="flex items-center space-x-1">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-600">Fast</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gas Estimate:</span>
                      <span className="font-mono">{gasEstimate} IOTA</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Network:</span>
                      <span className="text-green-600 font-medium">IOTA Testnet</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Confirmation Time:</span>
                      <span>~10-30 seconds</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Coins className="h-5 w-5" />
                    <span>Confirm & Pay</span>
                  </button>
                </div>
              </div>
            )}

            {step === 'processing' && (
              <div className="text-center space-y-6">
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mx-auto"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Loader className="h-6 w-6 text-primary-600" />
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Processing Transaction</h3>
                  <p className="text-gray-600 text-sm">
                    Broadcasting to IOTA network...
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Estimated completion</span>
                    <div className="flex items-center space-x-1 text-blue-700">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm font-mono">{countdown}s</span>
                    </div>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${((30 - countdown) / 30) * 100}%` }}
                      className="bg-blue-600 h-2 rounded-full transition-all duration-100"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Do not close this window. Transaction is being confirmed on the blockchain.
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto"
                >
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">🎉 Live Transaction Successful!</h3>
                  <p className="text-gray-600 text-sm">
                    Your transaction is now live on the IOTA Testnet blockchain.
                  </p>
                  <div className="flex items-center justify-center mt-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Broadcasting to network nodes</span>
                  </div>
                </div>

                {/* Transaction Hash */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Transaction Hash</span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => copyToClipboard(txHash)}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                      <button
                        onClick={openInExplorer}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <ExternalLink className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs font-mono text-gray-600 break-all">
                    {txHash}
                  </p>
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 bg-gray-600 text-white rounded-xl font-medium hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                  <button
                    onClick={openInExplorer}
                    className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Live
                  </button>
                </div>
              </div>
            )}

            {step === 'error' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transaction Failed</h3>
                  <p className="text-gray-600 text-sm mb-3">
                    The transaction could not be completed:
                  </p>
                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-red-800 text-sm">{error}</p>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setStep('confirm')}
                    className="flex-1 py-3 px-4 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

export default TransactionPopup
