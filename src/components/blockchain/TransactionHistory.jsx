import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  History, 
  ExternalLink, 
  Copy, 
  Package, 
  Shield, 
  Coins,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useAppState } from '@store/AppStateProvider'
import { useWallet } from '@store/WalletProvider'

const TransactionHistory = () => {
  const { jobs } = useAppState()
  const { address } = useWallet()
  const [transactions, setTransactions] = useState([])

  useEffect(() => {
    // Collect all transactions from jobs and user activities
    const allTransactions = []

    // Add job creation transactions
    jobs.forEach(job => {
      if (job.transactionId) {
        allTransactions.push({
          id: job.transactionId,
          type: 'job_creation',
          jobId: job.id,
          title: job.title,
          amount: job.reward,
          timestamp: job.createdAt,
          status: 'confirmed',
          from: job.poster,
          to: 'marketplace_contract',
          description: `Created job: ${job.title}`
        })
      }

      // Add escrow transactions
      if (job.escrowTransactionId && job.collector === address) {
        allTransactions.push({
          id: job.escrowTransactionId,
          type: 'escrow_lock',
          jobId: job.id,
          title: job.title,
          amount: job.lockedAmount || job.reward,
          timestamp: job.claimedAt,
          status: 'confirmed',
          from: job.collector,
          to: 'escrow_contract',
          description: `Locked payment for: ${job.title}`
        })
      }
    })

    // Sort by timestamp (newest first)
    allTransactions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    setTransactions(allTransactions)
  }, [jobs, address])

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const openInExplorer = (txId) => {
    window.open(`https://explorer.iota.org/?network=testnet&query=${txId}`, '_blank')
  }

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'job_creation':
        return <Package className="h-4 w-4 text-green-600" />
      case 'escrow_lock':
        return <Shield className="h-4 w-4 text-blue-600" />
      case 'payment_release':
        return <Coins className="h-4 w-4 text-purple-600" />
      default:
        return <History className="h-4 w-4 text-gray-600" />
    }
  }

  const getTransactionColor = (type) => {
    switch (type) {
      case 'job_creation':
        return 'bg-green-50 border-green-200'
      case 'escrow_lock':
        return 'bg-blue-50 border-blue-200'
      case 'payment_release':
        return 'bg-purple-50 border-purple-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center space-x-2 mb-6">
        <History className="h-5 w-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900">Your Transaction History</h2>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No transactions found</p>
          <p className="text-sm text-gray-500 mt-2">
            Your blockchain transactions will appear here after you post or claim jobs
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border rounded-lg ${getTransactionColor(tx.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="mt-1">
                    {getTransactionIcon(tx.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{tx.description}</h3>
                      <div className="flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">Confirmed</span>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600 space-y-1">
                      <div className="flex items-center space-x-4">
                        <span>Amount: <span className="font-medium">{tx.amount} IOTA</span></span>
                        <span>Job ID: <span className="font-mono text-xs">{tx.jobId}</span></span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{formatDate(tx.timestamp)}</span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Transaction:</span>
                      <span className="font-mono text-xs text-gray-700">
                        {tx.id.slice(0, 20)}...{tx.id.slice(-10)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(tx.id, 'Transaction ID')}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Copy className="h-3 w-3 text-gray-500" />
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openInExplorer(tx.id)}
                  className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-3 w-3" />
                  <span className="text-xs">View Live</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Contract Information */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-medium text-gray-900 mb-3">Our Smart Contracts</h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Marketplace Contract:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-gray-800">
                0x9e0364a3...9536f76
              </span>
              <button
                onClick={() => openInExplorer('0x9e0364a3eb25bb451ccc5decde1f894d7d4f7e2eaf00e8a880477d9629536f76')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ExternalLink className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">CLT Token Contract:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-gray-800">
                0x5dac6ac2...07a3687
              </span>
              <button
                onClick={() => openInExplorer('0x5dac6ac215432c4cd2c244616891b305667d5d5fdbb02ddcb68705dcd07a3687')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ExternalLink className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Deployment Transaction:</span>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-gray-800">
                9iCMkMGi...BLfqcZ
              </span>
              <button
                onClick={() => openInExplorer('9iCMkMGi8oeG9P7YqYLwo7ZTZDBo5cCAEdLF4VBLfqcZ')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <ExternalLink className="h-3 w-3 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Your Wallet Address */}
      {address && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Your Wallet Address:</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs text-blue-800">
                {address.slice(0, 20)}...{address.slice(-10)}
              </span>
              <button
                onClick={() => copyToClipboard(address, 'Wallet address')}
                className="p-1 hover:bg-blue-200 rounded"
              >
                <Copy className="h-3 w-3 text-blue-600" />
              </button>
              <button
                onClick={() => openInExplorer(address)}
                className="p-1 hover:bg-blue-200 rounded"
              >
                <ExternalLink className="h-3 w-3 text-blue-600" />
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  )
}

export default TransactionHistory
