import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Activity, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  RefreshCw
} from 'lucide-react'
import { useTransactionMonitor } from '@hooks/useBlockchain'
import TransactionStatus from './TransactionStatus'

const TransactionMonitor = () => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAll, setShowAll] = useState(false)
  const { 
    transactions, 
    monitoring, 
    clearTransactions 
  } = useTransactionMonitor()

  const recentTransactions = showAll ? transactions : transactions.slice(0, 3)
  const pendingCount = transactions.filter(tx => tx.status === 'pending').length
  const hasTransactions = transactions.length > 0

  if (!hasTransactions) return null

  return (
    <div className="fixed bottom-4 right-4 z-40 max-w-sm w-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div 
          className="p-4 bg-gray-50 border-b border-gray-200 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Activity className="h-5 w-5 text-primary-600" />
                {monitoring && (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Transactions</h3>
                <p className="text-xs text-gray-600">
                  {pendingCount > 0 ? `${pendingCount} pending` : 'All confirmed'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {transactions.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    clearTransactions()
                  }}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="h-4 w-4 text-gray-500" />
                </button>
              )}
              
              {isExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </div>
          </div>
        </div>

        {/* Transaction List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden"
            >
              <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                {recentTransactions.map((transaction, index) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <TransactionStatus 
                      transaction={transaction}
                      showDetails={false}
                    />
                  </motion.div>
                ))}

                {transactions.length > 3 && (
                  <button
                    onClick={() => setShowAll(!showAll)}
                    className="w-full text-center py-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {showAll 
                      ? 'Show Less' 
                      : `Show ${transactions.length - 3} More`
                    }
                  </button>
                )}

                {transactions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent transactions</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Quick Status Bar */}
        {!isExpanded && hasTransactions && (
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
              </span>
              {pendingCount > 0 && (
                <div className="flex items-center space-x-1">
                  <RefreshCw className="h-3 w-3 text-yellow-600 animate-spin" />
                  <span className="text-yellow-600">{pendingCount} pending</span>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default TransactionMonitor
