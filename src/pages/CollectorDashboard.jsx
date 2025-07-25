import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Truck,
  MapPin,
  Clock,
  CheckCircle,
  Coins,
  TrendingUp,
  Search,
  Filter,
  Navigation,
  Lock
} from 'lucide-react'
import { useAppState } from '@store/AppStateProvider'
import { useWallet } from '@store/WalletProvider'
import JobCard from '@components/jobs/JobCard'
import JobMap from '@components/map/JobMap'
import PriceVerificationModal from '@components/jobs/PriceVerificationModal'
import JobDetailsModal from '@components/jobs/JobDetailsModal'

const CollectorDashboard = () => {
  const [activeTab, setActiveTab] = useState('available')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showPriceVerification, setShowPriceVerification] = useState(false)
  const [selectedJobForVerification, setSelectedJobForVerification] = useState(null)
  const [showJobDetails, setShowJobDetails] = useState(false)
  const [selectedJobForDetails, setSelectedJobForDetails] = useState(null)
  
  const { jobs, claimJob, completeJob, userProfile } = useAppState()
  const { isConnected, balance, formatBalanceWithMYR, address } = useWallet()

  // Monitor for newly claimed jobs and auto-switch to "My Jobs" tab
  useEffect(() => {
    const claimedJobs = jobs.filter(job => job.status === 'claimed' && job.collector === address)
    console.log('🔍 Monitoring claimed jobs:', claimedJobs.length)

    if (claimedJobs.length > 0 && activeTab === 'available') {
      console.log('🎯 Found claimed job, switching to My Jobs tab')
      setTimeout(() => {
        setActiveTab('claimed')
      }, 1000)
    }
  }, [jobs, address, activeTab])

  // Filter and sort jobs
  const filteredJobs = jobs
    .filter(job => {
      const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           job.location.toLowerCase().includes(searchQuery.toLowerCase())

      // Debug logging for claimed jobs
      if (activeTab === 'claimed') {
        console.log('🔍 Checking job for claimed tab:', {
          jobId: job.id,
          status: job.status,
          collector: job.collector,
          currentAddress: address,
          matches: job.status === 'claimed' && job.collector === address
        })
      }

      switch (activeTab) {
        case 'available':
          return job.status === 'posted' && matchesSearch
        case 'claimed':
          return job.status === 'claimed' && job.collector === address && matchesSearch
        case 'completed':
          return ['completed', 'paid'].includes(job.status) && job.collector === address && matchesSearch
        default:
          return matchesSearch
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'reward':
          return b.reward - a.reward
        case 'distance':
          // Mock distance sorting
          return Math.random() - 0.5
        case 'newest':
        default:
          return new Date(b.createdAt) - new Date(a.createdAt)
      }
    })

  const tabs = [
    {
      id: 'available',
      label: 'Available',
      icon: MapPin,
      count: jobs.filter(j => j.status === 'posted').length
    },
    {
      id: 'claimed',
      label: 'My Jobs',
      icon: Truck,
      count: jobs.filter(j => j.status === 'claimed' && j.collector === address).length
    },
    {
      id: 'completed',
      label: 'Completed',
      icon: CheckCircle,
      count: jobs.filter(j => ['completed', 'paid'].includes(j.status) && j.collector === address).length
    },
  ]

  const stats = [
    {
      label: 'Available Balance',
      value: isConnected ? formatBalanceWithMYR(balance) : 'Connect Wallet',
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Locked in Escrow',
      value: `${formatBalanceWithMYR(userProfile.lockedBalance || 0)}`,
      icon: Lock,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Jobs Completed',
      value: userProfile.jobsCompleted,
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Total Earned',
      value: `RM ${userProfile.totalEarned}`,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    }
  ]

  const handleJobAction = async (job) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first')
      return
    }

    switch (job.status) {
      case 'posted':
        try {
          await claimJob(job.id)
          // Auto-switch to "My Jobs" tab to show claimed job
          setTimeout(() => {
            setActiveTab('claimed')
          }, 6000) // Wait for blockchain confirmation
        } catch (error) {
          toast.error(error.message || 'Failed to claim job')
        }
        break
      case 'claimed':
        // Show job details with address and dispute options
        setSelectedJobForDetails(job)
        setShowJobDetails(true)
        break
      default:
        // Show job details for other statuses
        setSelectedJobForDetails(job)
        setShowJobDetails(true)
    }
  }

  const handlePriceVerification = async (verification) => {
    try {
      await completeJob(selectedJobForVerification.id, {
        originalPrice: verification.originalPrice,
        finalPrice: verification.finalPrice,
        priceAdjustmentReason: verification.reason,
        verifiedWeight: verification.verifiedWeight,
        proofPhotos: verification.proofPhotos,
        completedAt: new Date().toISOString()
      })
      toast.success(`Job completed! Payment of RM ${verification.finalPrice} processed.`)
      setShowPriceVerification(false)
      setSelectedJobForVerification(null)
    } catch (error) {
      toast.error('Failed to complete job')
    }
  }

  const handleReportIssue = async (report) => {
    // In real app, this would notify the user and admin
    console.log('Issue reported:', report)
    toast.success('Issue reported. User will be contacted for clarification.')
    setShowPriceVerification(false)
    setSelectedJobForVerification(null)
  }

  const getActionLabel = (job) => {
    switch (job.status) {
      case 'posted':
        return 'Claim Job'
      case 'claimed':
        return 'Verify & Complete'
      case 'completed':
        return 'View Details'
      case 'paid':
        return 'View Receipt'
      default:
        return 'View Details'
    }
  }

  const getActionIcon = (job) => {
    switch (job.status) {
      case 'posted':
        return Truck
      case 'claimed':
        return CheckCircle
      default:
        return MapPin
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Collector Dashboard</h1>
              <p className="text-gray-600 mt-1">Find and collect recycling jobs in your area</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn-secondary flex items-center space-x-2"
            >
              <Navigation className="h-5 w-5" />
              <span>Find Nearby Jobs</span>
            </motion.button>
          </div>

          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <p className="text-yellow-800 text-sm">
                Please connect your wallet to claim jobs and receive payments.
              </p>
            </motion.div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card p-6"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Interactive Job Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">📍 Interactive Job Map</h2>
            <p className="text-gray-600">Click on any marker to view job details and claim opportunities near you.</p>
          </div>
          <JobMap
            jobs={filteredJobs.filter(job => job.status === 'posted')}
            onJobSelect={(job) => handleJobAction(job)}
            userLocation={{ lat: 3.1390, lng: 101.6869 }} // Mock user location in KL
          />
        </motion.div>

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by title or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="newest">Newest First</option>
                <option value="reward">Highest Reward</option>
                <option value="distance">Nearest First</option>
              </select>
            </div>

            {/* Tabs */}
            <div className="flex bg-white rounded-xl p-1 border border-gray-200">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      activeTab === tab.id
                        ? 'bg-primary-600 text-white shadow-sm'
                        : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      activeTab === tab.id
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Jobs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <JobCard
                  job={job}
                  onAction={handleJobAction}
                  actionLabel={getActionLabel(job)}
                  actionIcon={getActionIcon(job)}
                  showPoster={activeTab === 'available'}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Empty State */}
        {filteredJobs.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Truck className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No jobs found' : 'No jobs available'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : activeTab === 'available'
                  ? 'Check back later for new recycling opportunities'
                  : 'You haven\'t claimed any jobs yet'
              }
            </p>
            {activeTab === 'available' && !searchQuery && (
              <button
                onClick={() => window.location.reload()}
                className="btn-primary"
              >
                <Search className="h-5 w-5 mr-2" />
                Refresh Jobs
              </button>
            )}
          </motion.div>
        )}
      </div>

      {/* Price Verification Modal */}
      <PriceVerificationModal
        isOpen={showPriceVerification}
        onClose={() => {
          setShowPriceVerification(false)
          setSelectedJobForVerification(null)
        }}
        job={selectedJobForVerification}
        onConfirmPrice={handlePriceVerification}
        onReportIssue={handleReportIssue}
      />

      {/* Job Details Modal */}
      <JobDetailsModal
        job={selectedJobForDetails}
        isOpen={showJobDetails}
        onClose={() => {
          setShowJobDetails(false)
          setSelectedJobForDetails(null)
        }}
      />
    </div>
  )
}

export default CollectorDashboard
