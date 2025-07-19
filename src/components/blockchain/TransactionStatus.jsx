import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ExternalLink,
  Copy,
  X
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { TransactionUtils } from '@utils/blockchain'

const TransactionStatus = ({ 
  transaction, 
  onClose, 
  showDetails = true 
}) => {
  if (!transaction) return null

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
      case 'confirmed':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600 animate-spin" />
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
      case 'confirmed':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'pending':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'failed':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  const getStatusMessage = (status, type) => {
    const actionMap = {
      postJob: 'Job Posting',
      claimJob: 'Job Claiming',
      completeJob: 'Job Completion',
      releasePayment: 'Payment Release',
      transfer: 'Token Transfer'
    }

    const action = actionMap[type] || 'Transaction'

    switch (status) {
      case 'success':
      case 'confirmed':
        return `${action} Confirmed`
      case 'pending':
        return `${action} Pending...`
      case 'failed':
        return `${action} Failed`
      default:
        return `${action} Processing`
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const openInExplorer = () => {
    const url = TransactionUtils.getExplorerUrl(transaction.hash)
    window.open(url, '_blank')
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`border rounded-xl p-4 ${getStatusColor(transaction.status)}`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            {getStatusIcon(transaction.status)}
            <div>
              <h3 className="font-semibold">
                {getStatusMessage(transaction.status, transaction.type)}
              </h3>
              <p className="text-sm opacity-75">
                {new Date(transaction.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 hover:bg-black hover:bg-opacity-10 rounded-lg transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 pt-4 border-t border-current border-opacity-20"
          >
            <div className="space-y-2 text-sm">
              {/* Transaction Hash */}
              <div className="flex items-center justify-between">
                <span className="opacity-75">Transaction Hash:</span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono">
                    {TransactionUtils.formatTxHash(transaction.hash)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(transaction.hash)}
                    className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                  >
                    <Copy className="h-3 w-3" />
                  </button>
                  <button
                    onClick={openInExplorer}
                    className="p-1 hover:bg-black hover:bg-opacity-10 rounded"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* Gas Used */}
              {transaction.gasUsed && (
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Gas Used:</span>
                  <span className="font-mono">{transaction.gasUsed} IOTA</span>
                </div>
              )}

              {/* Confirmations */}
              {transaction.confirmations !== undefined && (
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Confirmations:</span>
                  <span className="font-mono">{transaction.confirmations}/1</span>
                </div>
              )}

              {/* Block Number */}
              {transaction.blockNumber && (
                <div className="flex items-center justify-between">
                  <span className="opacity-75">Block:</span>
                  <span className="font-mono">#{transaction.blockNumber}</span>
                </div>
              )}

              {/* Progress Bar for Pending Transactions */}
              {transaction.status === 'pending' && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Confirming...</span>
                    <span>{transaction.confirmations || 0}/1</span>
                  </div>
                  <div className="w-full bg-black bg-opacity-20 rounded-full h-1">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ 
                        width: transaction.confirmations >= 1 ? '100%' : '60%'
                      }}
                      transition={{ duration: 0.5 }}
                      className="bg-current h-1 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  )
}

export default TransactionStatus
