import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Package, 
  Clock, 
  CheckCircle, 
  Coins,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react'
import { useAppState } from '@store/AppStateProvider'
import { useWallet } from '@store/WalletProvider'
import JobCard from '@components/jobs/JobCard'
import JobForm from '@components/jobs/JobForm'

const RecyclerDashboard = () => {
  const [showJobForm, setShowJobForm] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const navigate = useNavigate()

  const { jobs, userProfile } = useAppState()
  const { isConnected } = useWallet()

  // Filter jobs based on active tab and search
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase())
    
    switch (activeTab) {
      case 'posted':
        return job.status === 'posted' && matchesSearch
      case 'active':
        return ['claimed', 'completed'].includes(job.status) && matchesSearch
      case 'completed':
        return job.status === 'paid' && matchesSearch
      default:
        return matchesSearch
    }
  })

  const tabs = [
    { id: 'all', label: 'All Jobs', icon: Package, count: jobs.length },
    { id: 'posted', label: 'Posted', icon: Clock, count: jobs.filter(j => j.status === 'posted').length },
    { id: 'active', label: 'Active', icon: TrendingUp, count: jobs.filter(j => ['claimed', 'completed'].includes(j.status)).length },
    { id: 'completed', label: 'Completed', icon: CheckCircle, count: jobs.filter(j => j.status === 'paid').length },
  ]

  const stats = [
    {
      label: 'Jobs Posted',
      value: userProfile.jobsPosted,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Total Earned',
      value: `RM ${userProfile.totalEarned}`,
      icon: Coins,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Reputation',
      value: userProfile.reputationScore,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recycler Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your recycling jobs and track earnings</p>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowJobForm(true)}
              disabled={!isConnected}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Post New Job</span>
            </motion.button>
          </div>

          {!isConnected && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg"
            >
              <p className="text-yellow-800 text-sm">
                Please connect your wallet to post recycling jobs and track earnings.
              </p>
            </motion.div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Filter Tabs */}
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
                  onAction={(job) => {
                    navigate(`/job/${job.id}`)
                  }}
                  actionLabel="View Details"
                  actionIcon={Package}
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
            <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchQuery ? 'No jobs found' : 'No jobs yet'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchQuery 
                ? 'Try adjusting your search terms or filters'
                : 'Start by posting your first recycling job'
              }
            </p>
            {!searchQuery && (
              <button
                onClick={() => setShowJobForm(true)}
                disabled={!isConnected}
                className="btn-primary"
              >
                <Plus className="h-5 w-5 mr-2" />
                Post Your First Job
              </button>
            )}
          </motion.div>
        )}

        {/* Job Form Modal */}
        <AnimatePresence>
          {showJobForm && (
            <JobForm
              onSubmit={() => setShowJobForm(false)}
              onCancel={() => setShowJobForm(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default RecyclerDashboard
