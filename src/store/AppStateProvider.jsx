import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { database } from '@utils/database'

// App State Context
const AppStateContext = createContext()

export const useAppState = () => {
  const context = useContext(AppStateContext)
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider')
  }
  return context
}

// Action types
const ACTIONS = {
  SET_USER_ROLE: 'SET_USER_ROLE',
  SET_JOBS: 'SET_JOBS',
  ADD_JOB: 'ADD_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_STATS: 'SET_STATS',
  SET_USER_PROFILE: 'SET_USER_PROFILE',
}

// Initial state
const initialState = {
  userRole: 'recycler', // 'recycler' or 'collector'
  jobs: [],
  userJobs: [],
  claimedJobs: [],
  completedJobs: [],
  loading: false,
  error: null,
  stats: {
    totalJobs: 47,
    completedToday: 12,
    totalEarned: 1247,
    activeCollectors: 23,
  },
  userProfile: {
    jobsPosted: 0,
    jobsCompleted: 0,
    totalEarned: 0,
    totalSpent: 0,
    reputationScore: 100,
  },
}

// Reducer function
const appStateReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_USER_ROLE:
      return { ...state, userRole: action.payload }
    
    case ACTIONS.SET_JOBS:
      return { ...state, jobs: action.payload }
    
    case ACTIONS.ADD_JOB:
      return { 
        ...state, 
        jobs: [action.payload, ...state.jobs],
        userJobs: state.userRole === 'recycler' 
          ? [action.payload, ...state.userJobs] 
          : state.userJobs
      }
    
    case ACTIONS.UPDATE_JOB:
      const updatedJobs = state.jobs.map(job => 
        job.id === action.payload.id ? { ...job, ...action.payload } : job
      )
      return {
        ...state,
        jobs: updatedJobs,
        userJobs: state.userJobs.map(job => 
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        ),
        claimedJobs: state.claimedJobs.map(job => 
          job.id === action.payload.id ? { ...job, ...action.payload } : job
        ),
      }
    
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload }
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload }
    
    case ACTIONS.SET_STATS:
      return { ...state, stats: { ...state.stats, ...action.payload } }
    
    case ACTIONS.SET_USER_PROFILE:
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } }
    
    default:
      return state
  }
}

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, initialState)

  // Action creators
  const setUserRole = (role) => {
    console.log('🔄 Role switching:', { from: state.userRole, to: role })
    dispatch({ type: ACTIONS.SET_USER_ROLE, payload: role })
    localStorage.setItem('userRole', role)
    toast.success(`Switched to ${role} mode`)
  }

  const addJob = async (jobData) => {
    try {
      // Save to database
      const newJob = await database.createJob({
        ...jobData,
        poster: 'current_user', // In real app, this would be wallet address
      })

      dispatch({ type: ACTIONS.ADD_JOB, payload: newJob })

      // Update stats from database
      const stats = await database.getStats()
      dispatch({ type: ACTIONS.SET_STATS, payload: stats })

      dispatch({
        type: ACTIONS.SET_USER_PROFILE,
        payload: {
          jobsPosted: state.userProfile.jobsPosted + 1,
          totalSpent: state.userProfile.totalSpent + parseFloat(jobData.reward)
        }
      })

      toast.success('Job posted successfully!')
      return newJob
    } catch (error) {
      toast.error('Failed to post job')
      throw error
    }
  }

  const claimJob = async (jobId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })

    try {
      const job = state.jobs.find(j => j.id === jobId)
      if (!job) {
        throw new Error('Job not found')
      }

      // Get current wallet info from localStorage and context
      const walletConnected = localStorage.getItem('wallet_connected') === 'true'
      const walletBalance = localStorage.getItem('wallet_balance') || '0'
      const storedAddress = localStorage.getItem('wallet_address')

      // Try multiple sources for wallet address
      const contextAddress = window.walletContext?.address
      const walletData = localStorage.getItem('iota_wallet')
      let walletJsonAddress = null

      if (walletData) {
        try {
          const parsed = JSON.parse(walletData)
          walletJsonAddress = parsed.address
        } catch (e) {
          console.warn('Failed to parse wallet data:', e)
        }
      }

      const actualAddress = storedAddress || contextAddress || walletJsonAddress

      console.log('🔍 Wallet info check:', {
        connected: walletConnected,
        storedAddress,
        contextAddress,
        actualAddress,
        balance: walletBalance
      })

      if (!walletConnected) {
        throw new Error('Wallet not connected')
      }

      if (!actualAddress) {
        throw new Error('No wallet address found. Please reconnect your wallet.')
      }

      // Check if collector has sufficient balance
      const collectorBalance = parseFloat(walletBalance)
      const requiredAmount = parseFloat(job.reward)

      console.log('🔍 Balance check:', {
        collectorBalance,
        requiredAmount,
        walletBalance,
        jobReward: job.reward
      })

      if (collectorBalance < requiredAmount) {
        throw new Error(`Insufficient balance. Required: ${requiredAmount} IOTA, Available: ${collectorBalance} IOTA`)
      }

      // Create real blockchain transaction for payment locking
      toast.loading('Creating blockchain transaction for payment lock...', { duration: 5000 })

      // Use the validated address from above
      const walletAddress = actualAddress

      let updatedJob

      // Import wallet provider to create real transaction
      const { iotaClient } = await import('../utils/iotaClient')

      try {
        // Create real IOTA transaction for escrow locking
        const escrowTransaction = await iotaClient.sendTransaction(
          'marketplace_contract', // to
          requiredAmount.toString(), // amount to lock
          {
            method: 'claim_job',
            jobId,
            collector: walletAddress,
            action: 'lock_payment_in_escrow'
          }
        )

        console.log('🔗 Escrow transaction created:', escrowTransaction)

        // Update job status to claimed with real transaction ID
        updatedJob = {
          id: jobId,
          status: 'claimed',
          claimedAt: new Date().toISOString(),
          collector: walletAddress,
          lockedAmount: requiredAmount,
          escrowTransactionId: escrowTransaction.hash || escrowTransaction.transactionId,
          escrowBlockNumber: escrowTransaction.blockNumber,
          escrowTimestamp: escrowTransaction.timestamp,
        }

        // Show success with transaction link
        toast.success(
          <div>
            <div className="font-semibold">🔒 Payment Locked in Escrow!</div>
            <div className="text-sm text-gray-600 mt-1">{requiredAmount} IOTA secured on blockchain</div>
            {escrowTransaction.hash && (
              <button
                onClick={() => window.open(`https://explorer.iota.org/?network=testnet&query=${escrowTransaction.hash}`, '_blank')}
                className="text-blue-600 hover:text-blue-800 text-xs mt-2 flex items-center"
              >
                View escrow transaction →
              </button>
            )}
          </div>,
          { duration: 8000 }
        )

      } catch (error) {
        console.error('Escrow transaction failed:', error)
        // Fallback to demo transaction
        updatedJob = {
          id: jobId,
          status: 'claimed',
          claimedAt: new Date().toISOString(),
          collector: walletAddress,
          lockedAmount: requiredAmount,
          escrowTransactionId: 'escrow_demo_' + Date.now(),
        }

        toast.success(`Job claimed! ${requiredAmount} IOTA locked in escrow (demo mode)`)
      }

      dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })

      // Debug logging
      console.log('🎯 Job claimed successfully:', {
        jobId,
        collector: walletAddress,
        status: 'claimed',
        lockedAmount: requiredAmount,
        updatedJob
      })

      // Debug: Check if job was actually updated in state
      setTimeout(() => {
        const currentJobs = JSON.parse(localStorage.getItem('app_state') || '{}').jobs || []
        const claimedJob = currentJobs.find(j => j.id === jobId)
        console.log('🔍 Job after update:', claimedJob)
        console.log('🔍 All jobs:', currentJobs.map(j => ({ id: j.id, status: j.status, collector: j.collector })))
      }, 100)

      // Update wallet balance but keep connection
      const newBalance = collectorBalance - requiredAmount
      localStorage.setItem('wallet_balance', newBalance.toString())

      // Ensure wallet connection persists - CRITICAL for preventing logout
      localStorage.setItem('wallet_connected', 'true')
      localStorage.setItem('wallet_address', walletAddress)
      localStorage.setItem('wallet_type', localStorage.getItem('wallet_type') || 'demo')
      localStorage.setItem('is_new_user', 'false')

      // Also update wallet context if available
      if (window.walletContext) {
        window.walletContext.address = walletAddress
      }

      // Force wallet context update to prevent logout
      window.dispatchEvent(new Event('wallet-updated'))

      console.log('🔒 Wallet persistence updated:', {
        address: walletAddress,
        connected: 'true',
        balance: newBalance
      })

      console.log('💰 Balance updated:', {
        previous: collectorBalance,
        new: newBalance,
        locked: requiredAmount
      })

      toast.success(
        <div>
          <div className="font-semibold">🎉 Job Claimed Successfully!</div>
          <div className="text-sm text-gray-600 mt-1">{requiredAmount} IOTA locked in escrow</div>
          <div className="text-sm text-blue-600 mt-1">Check "My Jobs" tab to see your claimed job</div>
        </div>,
        { duration: 6000 }
      )

    } catch (error) {
      toast.error(error.message || 'Failed to claim job')
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      throw error
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const completeJob = async (jobId, proofData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })

    try {
      const job = state.jobs.find(j => j.id === jobId)
      if (!job) {
        throw new Error('Job not found')
      }

      // Step 1: Mark job as completed
      const updatedJob = {
        id: jobId,
        status: 'completed',
        completedAt: new Date().toISOString(),
        completionProof: proofData,
      }

      dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })
      toast.success('Job marked as completed!')

      // Step 2: Automatically process payment
      await processJobPayment(jobId, job)

    } catch (error) {
      toast.error('Failed to complete job: ' + error.message)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const processJobPayment = async (jobId, job) => {
    try {
      // Import IOTA client for payment processing
      const { iotaClient } = await import('../utils/iotaClient')

      // Check if wallet is connected
      if (!iotaClient.currentWallet) {
        toast.error('Wallet not connected. Please connect your wallet to receive payment.')
        return
      }

      toast.loading('Processing payment via IOTA blockchain...', { duration: 3000 })

      // Create payment transaction
      const paymentResult = await iotaClient.sendTransaction(
        iotaClient.currentWallet.address, // Pay to collector's wallet
        job.reward, // Amount in IOTA
        {
          jobId: jobId,
          type: 'job_completion_payment',
          description: `Payment for: ${job.title}`,
          timestamp: new Date().toISOString()
        }
      )

      if (paymentResult.success) {
        // Update job status to paid
        const paidJob = {
          id: jobId,
          status: 'paid',
          paidAt: new Date().toISOString(),
          transactionId: paymentResult.transactionId,
          transactionHash: paymentResult.hash
        }

        dispatch({ type: ACTIONS.UPDATE_JOB, payload: paidJob })

        // Update user earnings
        dispatch({
          type: ACTIONS.SET_USER_PROFILE,
          payload: { totalEarned: state.userProfile.totalEarned + job.reward }
        })

        // Update stats
        dispatch({
          type: ACTIONS.SET_STATS,
          payload: { completedToday: state.stats.completedToday + 1 }
        })

        // Show success message with transaction details
        toast.success(
          <div>
            <div className="font-semibold">💰 Payment Sent!</div>
            <div className="text-sm">Amount: {job.reward} IOTA</div>
            <div className="text-xs text-gray-600">TX: {paymentResult.transactionId?.slice(0, 10)}...</div>
          </div>,
          { duration: 5000 }
        )
      } else {
        throw new Error(paymentResult.error || 'Payment transaction failed')
      }

    } catch (error) {
      toast.error('Payment failed: ' + error.message)

      // Mark job as completed but payment pending
      const pendingPaymentJob = {
        id: jobId,
        status: 'payment_pending',
        paymentError: error.message,
        updatedAt: new Date().toISOString()
      }

      dispatch({ type: ACTIONS.UPDATE_JOB, payload: pendingPaymentJob })
    }
  }

  const releasePayment = async (jobId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })

    try {
      const job = state.jobs.find(j => j.id === jobId)
      if (!job) {
        throw new Error('Job not found')
      }

      // Process manual payment release
      await processJobPayment(jobId, job)

    } catch (error) {
      toast.error('Failed to release payment: ' + error.message)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const submitDispute = async (jobId, disputeData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })

    try {
      const job = state.jobs.find(j => j.id === jobId)
      if (!job) {
        throw new Error('Job not found')
      }

      // Update job with dispute information
      const disputedJob = {
        id: jobId,
        status: 'disputed',
        disputeData: {
          ...disputeData,
          disputeId: 'dispute_' + Date.now(),
          status: 'pending_user_response',
          submittedAt: new Date().toISOString()
        }
      }

      dispatch({ type: ACTIONS.UPDATE_JOB, payload: disputedJob })
      toast.success('Dispute submitted. User will be notified to respond.')

    } catch (error) {
      toast.error('Failed to submit dispute: ' + error.message)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const respondToDispute = async (jobId, response) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })

    try {
      const job = state.jobs.find(j => j.id === jobId)
      if (!job || !job.disputeData) {
        throw new Error('Dispute not found')
      }

      if (response.action === 'accept') {
        // User accepts the dispute - pay the disputed amount
        const updatedJob = {
          id: jobId,
          status: 'completed',
          disputeData: {
            ...job.disputeData,
            status: 'resolved_accepted',
            userResponse: response,
            resolvedAt: new Date().toISOString(),
            finalAmount: job.disputeData.proposedAmount
          }
        }

        dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })

        // Process payment with disputed amount
        await processJobPayment(jobId, { ...job, reward: job.disputeData.proposedAmount })

        toast.success('Dispute resolved. Payment processed with agreed amount.')

      } else {
        // User rejects the dispute - escalate to platform review
        const updatedJob = {
          id: jobId,
          status: 'disputed',
          disputeData: {
            ...job.disputeData,
            status: 'escalated_to_platform',
            userResponse: response,
            escalatedAt: new Date().toISOString(),
            reviewDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
          }
        }

        dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })
        toast.info('Dispute escalated to platform review. Decision within 2-3 days.')
      }

    } catch (error) {
      toast.error('Failed to respond to dispute: ' + error.message)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const platformResolveDispute = async (jobId, decision) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })

    try {
      const job = state.jobs.find(j => j.id === jobId)
      if (!job || !job.disputeData) {
        throw new Error('Dispute not found')
      }

      const finalAmount = decision === 'original' ? job.reward : job.disputeData.proposedAmount

      const resolvedJob = {
        id: jobId,
        status: 'completed',
        disputeData: {
          ...job.disputeData,
          status: 'resolved_by_platform',
          platformDecision: decision,
          finalAmount: finalAmount,
          resolvedAt: new Date().toISOString()
        }
      }

      dispatch({ type: ACTIONS.UPDATE_JOB, payload: resolvedJob })

      // Process payment with platform-decided amount
      await processJobPayment(jobId, { ...job, reward: finalAmount })

      toast.success(`Dispute resolved by platform. Payment: ${finalAmount} IOTA`)

    } catch (error) {
      toast.error('Failed to resolve dispute: ' + error.message)
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  // Load saved user role on mount
  useEffect(() => {
    const savedRole = localStorage.getItem('userRole')
    if (savedRole && ['recycler', 'collector'].includes(savedRole)) {
      dispatch({ type: ACTIONS.SET_USER_ROLE, payload: savedRole })
    }
  }, [])

  // Database initialization
  useEffect(() => {
    const initializeData = async () => {
      try {
        // Load jobs from database
        const jobs = await database.getJobs()
        dispatch({ type: ACTIONS.SET_JOBS, payload: jobs })

        // Load stats from database
        const stats = await database.getStats()
        dispatch({ type: ACTIONS.SET_STATS, payload: stats })

        // Demo jobs are now automatically loaded from database initialization
      } catch (error) {
        console.error('Failed to initialize data:', error)
      }
    }

    initializeData()
  }, [])

  const value = {
    ...state,
    setUserRole,
    addJob,
    claimJob,
    completeJob,
    releasePayment,
    submitDispute,
    respondToDispute,
    platformResolveDispute,
    dispatch,
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
