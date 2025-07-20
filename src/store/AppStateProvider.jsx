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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedJob = {
        id: jobId,
        status: 'claimed',
        claimedAt: new Date().toISOString(),
        collector: 'current_user',
      }
      
      dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })
      toast.success('Job claimed successfully!')
      
    } catch (error) {
      toast.error('Failed to claim job')
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
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
    dispatch,
  }

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  )
}
