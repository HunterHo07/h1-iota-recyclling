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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedJob = {
        id: jobId,
        status: 'completed',
        completedAt: new Date().toISOString(),
        completionProof: proofData,
      }
      
      dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })
      
      // Update stats
      dispatch({ 
        type: ACTIONS.SET_STATS, 
        payload: { completedToday: state.stats.completedToday + 1 } 
      })
      
      toast.success('Job completed successfully!')
      
    } catch (error) {
      toast.error('Failed to complete job')
      dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: false })
    }
  }

  const releasePayment = async (jobId) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    
    try {
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const job = state.jobs.find(j => j.id === jobId)
      if (job) {
        const updatedJob = {
          id: jobId,
          status: 'paid',
          paidAt: new Date().toISOString(),
        }
        
        dispatch({ type: ACTIONS.UPDATE_JOB, payload: updatedJob })
        
        // Update user earnings
        dispatch({
          type: ACTIONS.SET_USER_PROFILE,
          payload: { totalEarned: state.userProfile.totalEarned + job.reward }
        })
        
        toast.success('Payment released successfully!')
      }
      
    } catch (error) {
      toast.error('Failed to release payment')
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

        // If no jobs exist, create some demo data
        if (jobs.length === 0) {
          const demoJobs = [
            {
              title: 'Cardboard boxes pickup',
              description: '5kg of cardboard boxes from office move',
              itemType: 'cardboard',
              weight: 5,
              location: 'KLCC, Kuala Lumpur',
              fullAddress: '50 Jalan Ampang, KLCC, 50450 Kuala Lumpur',
              contactInfo: {
                name: 'Sarah Chen',
                phone: '+60 12-345-6789',
                email: 'sarah.chen@company.com'
              },
              pickupPreferences: {
                timeSlots: ['9:00 AM - 12:00 PM', '2:00 PM - 5:00 PM'],
                preferredDays: ['Monday', 'Tuesday', 'Wednesday'],
                specialInstructions: 'Please call 30 minutes before arrival. Use service elevator on Level B1.'
              },
              photoUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400',
              reward: 15,
              poster: 'demo_user_1',
            },
            {
              title: 'Plastic bottles collection',
              description: '20 plastic bottles from event cleanup',
              itemType: 'plastic',
              weight: 2,
              location: 'Petaling Jaya, Malaysia',
              fullAddress: '123 Jalan SS2/24, SS2, 47300 Petaling Jaya, Selangor',
              contactInfo: {
                name: 'Ahmad Rahman',
                phone: '+60 17-888-9999',
                email: 'ahmad.rahman@gmail.com'
              },
              pickupPreferences: {
                timeSlots: ['10:00 AM - 1:00 PM', '3:00 PM - 6:00 PM'],
                preferredDays: ['Tuesday', 'Thursday', 'Saturday'],
                specialInstructions: 'Items are in the parking garage. Please text when you arrive.'
              },
              photoUrl: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=400&h=300&fit=crop&auto=format',
              reward: 8,
              poster: 'demo_user_2',
            },
          ]

          // Create demo jobs in database
          for (const jobData of demoJobs) {
            await database.createJob(jobData)
          }

          // Reload jobs after creating demo data
          const updatedJobs = await database.getJobs()
          dispatch({ type: ACTIONS.SET_JOBS, payload: updatedJobs })
        }
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
