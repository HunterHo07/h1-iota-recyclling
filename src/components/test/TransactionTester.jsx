import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Play, 
  ExternalLink, 
  Copy, 
  Package, 
  Shield, 
  Coins,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@store/WalletProvider'
import { iotaClient } from '@utils/iotaClient'

const TransactionTester = () => {
  const { address, sendTransaction } = useWallet()
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState([])
  const [currentStep, setCurrentStep] = useState(0)

  const testTransactions = [
    {
      id: 1,
      name: "Job Creation",
      description: "Create a recycling job on blockchain",
      icon: <Package className="h-5 w-5 text-green-600" />,
      color: "green",
      data: {
        method: 'create_job',
        title: 'Test Plastic Bottles Collection',
        reward: '5.0',
        location: 'Test Location'
      }
    },
    {
      id: 2,
      name: "Escrow Lock",
      description: "Lock payment in escrow when claiming job",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      color: "blue",
      data: {
        method: 'claim_job',
        jobId: 'test_job_123',
        amount: '5.0',
        action: 'lock_payment'
      }
    },
    {
      id: 3,
      name: "Payment Release",
      description: "Release payment after job completion",
      icon: <Coins className="h-5 w-5 text-purple-600" />,
      color: "purple",
      data: {
        method: 'complete_job',
        jobId: 'test_job_123',
        amount: '4.75', // 95% to user, 5% platform fee
        action: 'release_payment'
      }
    }
  ]

  const runTestSequence = async () => {
    setIsRunning(true)
    setTestResults([])
    setCurrentStep(0)

    try {
      for (let i = 0; i < testTransactions.length; i++) {
        const test = testTransactions[i]
        setCurrentStep(i + 1)

        toast.loading(`Running ${test.name}...`, { duration: 3000 })

        try {
          // Create real IOTA transaction
          const result = await iotaClient.sendTransaction(
            'marketplace_contract',
            test.data.amount || '0.001',
            test.data
          )

          const testResult = {
            ...test,
            status: 'success',
            transactionId: result.hash || result.transactionId,
            timestamp: new Date().toISOString(),
            explorerUrl: `https://explorer.iota.org/?network=testnet&query=${result.hash || result.transactionId}`,
            result
          }

          setTestResults(prev => [...prev, testResult])

          toast.success(
            <div>
              <div className="font-semibold">{test.name} Successful!</div>
              <div className="text-sm text-gray-600 mt-1">Transaction: {(result.hash || result.transactionId).slice(0, 20)}...</div>
              <button
                onClick={() => window.open(testResult.explorerUrl, '_blank')}
                className="text-blue-600 hover:text-blue-800 text-xs mt-2 flex items-center"
              >
                View on IOTA Explorer →
              </button>
            </div>,
            { duration: 8000 }
          )

          // Wait 2 seconds between transactions
          await new Promise(resolve => setTimeout(resolve, 2000))

        } catch (error) {
          console.error(`${test.name} failed:`, error)
          
          const testResult = {
            ...test,
            status: 'failed',
            error: error.message,
            timestamp: new Date().toISOString()
          }

          setTestResults(prev => [...prev, testResult])
          toast.error(`${test.name} failed: ${error.message}`)
        }
      }

      toast.success('All test transactions completed! Check the results below.')

    } catch (error) {
      console.error('Test sequence failed:', error)
      toast.error('Test sequence failed')
    } finally {
      setIsRunning(false)
      setCurrentStep(0)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied!`)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Play className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Transaction Tester</h2>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
        </div>
        
        <button
          onClick={runTestSequence}
          disabled={isRunning || !address}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Play className={`h-4 w-4 ${isRunning ? 'animate-pulse' : ''}`} />
          <span>{isRunning ? `Running Step ${currentStep}/3...` : 'Run 3 Test Transactions'}</span>
        </button>
      </div>

      {!address && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-yellow-800">Please connect your wallet first to run transactions</span>
          </div>
        </div>
      )}

      {/* Test Sequence Preview */}
      <div className="mb-8">
        <h3 className="font-medium text-gray-900 mb-4">Test Sequence:</h3>
        <div className="space-y-3">
          {testTransactions.map((test, index) => (
            <div
              key={test.id}
              className={`p-3 border rounded-lg ${
                currentStep > index ? 'bg-green-50 border-green-200' :
                currentStep === index + 1 ? 'bg-blue-50 border-blue-200' :
                'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  currentStep > index ? 'bg-green-100' :
                  currentStep === index + 1 ? 'bg-blue-100' :
                  'bg-gray-100'
                }`}>
                  {test.icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{test.name}</div>
                  <div className="text-sm text-gray-600">{test.description}</div>
                </div>
                <div className="text-sm font-medium">
                  {test.data.amount || '0.001'} IOTA
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Test Results */}
      {testResults.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-900 mb-4">Transaction Results:</h3>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${getStatusColor(result.status)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {result.status === 'success' ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 mb-1">{result.name}</div>
                      
                      {result.status === 'success' ? (
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <div className="flex items-center space-x-4">
                              <span>Amount: <span className="font-medium">{result.data.amount || '0.001'} IOTA</span></span>
                              <span>Method: <span className="font-mono text-xs">{result.data.method}</span></span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span className="text-xs text-gray-500">Transaction:</span>
                            <span className="font-mono text-xs text-gray-700">
                              {result.transactionId.slice(0, 20)}...{result.transactionId.slice(-10)}
                            </span>
                            <button
                              onClick={() => copyToClipboard(result.transactionId, 'Transaction ID')}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Copy className="h-3 w-3 text-gray-500" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-red-600">
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  </div>

                  {result.status === 'success' && (
                    <button
                      onClick={() => window.open(result.explorerUrl, '_blank')}
                      className="flex items-center space-x-1 px-3 py-1 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <ExternalLink className="h-3 w-3" />
                      <span className="text-xs">View Live</span>
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">How to Verify Your Transactions:</h4>
        <div className="text-sm text-blue-800 space-y-1">
          <div>1. Click "Run 3 Test Transactions" to create real IOTA transactions</div>
          <div>2. Each transaction will show a unique transaction ID</div>
          <div>3. Click "View Live" to see the transaction on IOTA Explorer</div>
          <div>4. Your wallet address: <span className="font-mono">{address?.slice(0, 20)}...{address?.slice(-10)}</span></div>
          <div>5. All transactions will be visible on the public IOTA testnet</div>
        </div>
      </div>
    </motion.div>
  )
}

export default TransactionTester
