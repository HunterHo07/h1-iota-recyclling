import { useState, useCallback } from 'react'
import { toast } from 'react-hot-toast'
import { marketplace, walletManager, TransactionUtils } from '@utils/blockchain'
import { useWallet } from '@store/WalletProvider'
import { useAppState } from '@store/AppStateProvider'

/**
 * Hook for blockchain interactions
 */
export const useBlockchain = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { isConnected, sendTransaction } = useWallet()
  const { dispatch } = useAppState()

  const handleError = useCallback((error, defaultMessage = 'Transaction failed') => {
    console.error('Blockchain error:', error)
    setError(error.message || defaultMessage)
    toast.error(error.message || defaultMessage)
  }, [])

  const postJobToBlockchain = useCallback(async (jobData) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      // Show transaction pending toast
      const toastId = toast.loading('Posting job to blockchain...')

      // Call smart contract
      const result = await marketplace.postJob(jobData)

      if (!result.success) {
        throw new Error(result.error)
      }

      // Simulate wallet transaction
      const txResult = await sendTransaction({
        type: 'contract_call',
        method: 'postJob',
        params: jobData,
        gasEstimate: '0.002'
      })

      toast.success('Job posted successfully!', { id: toastId })

      return {
        success: true,
        jobId: result.jobId,
        transactionHash: txResult.hash,
        gasUsed: result.gasUsed
      }

    } catch (error) {
      handleError(error, 'Failed to post job')
      throw error
    } finally {
      setLoading(false)
    }
  }, [isConnected, sendTransaction, handleError])

  const claimJobOnBlockchain = useCallback(async (jobId) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const toastId = toast.loading('Claiming job...')

      const result = await marketplace.claimJob(jobId)

      if (!result.success) {
        throw new Error(result.error)
      }

      const txResult = await sendTransaction({
        type: 'contract_call',
        method: 'claimJob',
        params: { jobId },
        gasEstimate: '0.001'
      })

      toast.success('Job claimed successfully!', { id: toastId })

      return {
        success: true,
        transactionHash: txResult.hash,
        gasUsed: result.gasUsed
      }

    } catch (error) {
      handleError(error, 'Failed to claim job')
      throw error
    } finally {
      setLoading(false)
    }
  }, [isConnected, sendTransaction, handleError])

  const completeJobOnBlockchain = useCallback(async (jobId, proofUrl) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const toastId = toast.loading('Completing job...')

      const result = await marketplace.completeJob(jobId, proofUrl)

      if (!result.success) {
        throw new Error(result.error)
      }

      const txResult = await sendTransaction({
        type: 'contract_call',
        method: 'completeJob',
        params: { jobId, proofUrl },
        gasEstimate: '0.0015'
      })

      toast.success('Job completed successfully!', { id: toastId })

      return {
        success: true,
        transactionHash: txResult.hash,
        gasUsed: result.gasUsed
      }

    } catch (error) {
      handleError(error, 'Failed to complete job')
      throw error
    } finally {
      setLoading(false)
    }
  }, [isConnected, sendTransaction, handleError])

  const releasePaymentOnBlockchain = useCallback(async (jobId, amount) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    setLoading(true)
    setError(null)

    try {
      const toastId = toast.loading('Releasing payment...')

      const result = await marketplace.releasePayment(jobId, amount)

      if (!result.success) {
        throw new Error(result.error)
      }

      const txResult = await sendTransaction({
        type: 'contract_call',
        method: 'releasePayment',
        params: { jobId, amount },
        gasEstimate: '0.003'
      })

      toast.success('Payment released successfully!', { id: toastId })

      return {
        success: true,
        transactionHash: txResult.hash,
        gasUsed: result.gasUsed
      }

    } catch (error) {
      handleError(error, 'Failed to release payment')
      throw error
    } finally {
      setLoading(false)
    }
  }, [isConnected, sendTransaction, handleError])

  const getJobFromBlockchain = useCallback(async (jobId) => {
    setLoading(true)
    setError(null)

    try {
      const result = await marketplace.getJobDetails(jobId)

      if (!result.success) {
        throw new Error(result.error)
      }

      return result.data

    } catch (error) {
      handleError(error, 'Failed to fetch job details')
      throw error
    } finally {
      setLoading(false)
    }
  }, [handleError])

  return {
    loading,
    error,
    postJobToBlockchain,
    claimJobOnBlockchain,
    completeJobOnBlockchain,
    releasePaymentOnBlockchain,
    getJobFromBlockchain,
    clearError: () => setError(null)
  }
}

/**
 * Hook for transaction monitoring
 */
export const useTransactionMonitor = () => {
  const [transactions, setTransactions] = useState([])
  const [monitoring, setMonitoring] = useState(false)

  const addTransaction = useCallback((txData) => {
    const transaction = {
      id: Date.now().toString(),
      hash: txData.hash,
      type: txData.type,
      status: 'pending',
      timestamp: Date.now(),
      gasUsed: txData.gasUsed,
      ...txData
    }

    setTransactions(prev => [transaction, ...prev])
    
    // Start monitoring this transaction
    monitorTransaction(transaction.hash)
    
    return transaction.id
  }, [])

  const monitorTransaction = useCallback(async (txHash) => {
    setMonitoring(true)
    
    try {
      // Poll for transaction status
      const pollInterval = setInterval(async () => {
        try {
          const result = await marketplace.getTransactionStatus(txHash)
          
          if (result.success) {
            setTransactions(prev => 
              prev.map(tx => 
                tx.hash === txHash 
                  ? { 
                      ...tx, 
                      status: result.status,
                      confirmations: result.confirmations,
                      blockNumber: result.blockNumber
                    }
                  : tx
              )
            )

            // Stop polling if transaction is confirmed
            if (result.confirmations >= 1) {
              clearInterval(pollInterval)
              toast.success(`Transaction confirmed: ${TransactionUtils.formatTxHash(txHash)}`)
            }
          }
        } catch (error) {
          console.error('Error monitoring transaction:', error)
          clearInterval(pollInterval)
        }
      }, 5000) // Poll every 5 seconds

      // Stop polling after 5 minutes
      setTimeout(() => {
        clearInterval(pollInterval)
        setMonitoring(false)
      }, 300000)

    } catch (error) {
      console.error('Error starting transaction monitor:', error)
      setMonitoring(false)
    }
  }, [])

  const getTransactionStatus = useCallback((txHash) => {
    const tx = transactions.find(t => t.hash === txHash)
    return tx ? tx.status : 'unknown'
  }, [transactions])

  const clearTransactions = useCallback(() => {
    setTransactions([])
  }, [])

  return {
    transactions,
    monitoring,
    addTransaction,
    getTransactionStatus,
    clearTransactions
  }
}

/**
 * Hook for wallet operations
 */
export const useWalletOperations = () => {
  const [loading, setLoading] = useState(false)
  const { updateBalance } = useWallet()

  const refreshBalance = useCallback(async (address) => {
    if (!address) return

    setLoading(true)
    try {
      const result = await walletManager.getBalance(address)
      if (result.success) {
        updateBalance(result.balance)
      }
    } catch (error) {
      console.error('Error refreshing balance:', error)
    } finally {
      setLoading(false)
    }
  }, [updateBalance])

  const sendTokens = useCallback(async (to, amount) => {
    setLoading(true)
    try {
      const result = await walletManager.sendTokens(to, amount)
      
      if (result.success) {
        toast.success('Tokens sent successfully!')
        return result
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast.error(error.message || 'Failed to send tokens')
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    refreshBalance,
    sendTokens
  }
}

export default {
  useBlockchain,
  useTransactionMonitor,
  useWalletOperations
}
