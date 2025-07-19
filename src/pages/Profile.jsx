import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Wallet, 
  Package, 
  CheckCircle, 
  Coins, 
  TrendingUp,
  Award,
  Calendar,
  MapPin,
  Settings
} from 'lucide-react'
import { useWallet } from '@store/WalletProvider'
import { useAppState } from '@store/AppStateProvider'

const Profile = () => {
  const { address, balance, formatAddress, formatBalance } = useWallet()
  const { userProfile, userRole, stats } = useAppState()

  const profileStats = [
    {
      label: 'Jobs Posted',
      value: userProfile.jobsPosted,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Jobs Completed',
      value: userProfile.jobsCompleted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Total Earned',
      value: `RM ${userProfile.totalEarned}`,
      icon: Coins,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      label: 'Reputation Score',
      value: userProfile.reputationScore,
      icon: Award,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  const achievements = [
    {
      title: 'First Job',
      description: 'Posted your first recycling job',
      icon: Package,
      earned: userProfile.jobsPosted > 0,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Eco Warrior',
      description: 'Completed 10 recycling jobs',
      icon: CheckCircle,
      earned: userProfile.jobsCompleted >= 10,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Top Earner',
      description: 'Earned over RM 100',
      icon: Coins,
      earned: userProfile.totalEarned >= 100,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    },
    {
      title: 'Trusted Member',
      description: 'Reputation score above 150',
      icon: Award,
      earned: userProfile.reputationScore >= 150,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account and view your recycling activity</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card p-6"
            >
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {userRole === 'recycler' ? 'Recycler' : 'Collector'}
                  </h2>
                  <p className="text-gray-600">Member since January 2024</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <div className={`w-2 h-2 rounded-full ${
                      userProfile.reputationScore >= 100 ? 'bg-green-500' : 'bg-yellow-500'
                    }`} />
                    <span className="text-sm text-gray-600">
                      {userProfile.reputationScore >= 150 ? 'Trusted Member' : 
                       userProfile.reputationScore >= 100 ? 'Good Standing' : 'New Member'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              {address && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Wallet className="h-4 w-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-700">Wallet Address</span>
                    </div>
                    <span className="text-sm font-mono text-gray-600">{formatAddress(address)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Balance</span>
                    <span className="text-sm font-semibold text-primary-600">
                      {formatBalance(balance)} IOTA
                    </span>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-2 gap-4"
            >
              {profileStats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className="card p-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                        <Icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">{stat.label}</p>
                        <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>

            {/* Achievements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Achievements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((achievement, index) => {
                  const Icon = achievement.icon
                  return (
                    <div
                      key={achievement.title}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        achievement.earned
                          ? 'border-green-200 bg-green-50'
                          : 'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`p-2 rounded-lg ${
                          achievement.earned ? achievement.bgColor : 'bg-gray-200'
                        }`}>
                          <Icon className={`h-4 w-4 ${
                            achievement.earned ? achievement.color : 'text-gray-400'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-medium ${
                            achievement.earned ? 'text-gray-900' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h4>
                        </div>
                        {achievement.earned && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                      <p className={`text-sm ${
                        achievement.earned ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {achievement.description}
                      </p>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Account Settings</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <MapPin className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Update Location</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 text-left hover:bg-gray-50 rounded-lg transition-colors">
                  <Calendar className="h-5 w-5 text-gray-600" />
                  <span className="text-gray-700">Activity History</span>
                </button>
              </div>
            </motion.div>

            {/* Platform Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Jobs</span>
                  <span className="font-semibold text-gray-900">{stats.totalJobs}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Today</span>
                  <span className="font-semibold text-gray-900">{stats.completedToday}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Collectors</span>
                  <span className="font-semibold text-gray-900">{stats.activeCollectors}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-gray-600">Total Earned</span>
                  <span className="font-semibold text-primary-600">RM {stats.totalEarned}</span>
                </div>
              </div>
            </motion.div>

            {/* Reputation Progress */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="card p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Reputation Progress</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Score</span>
                  <span className="font-semibold text-gray-900">{userProfile.reputationScore}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (userProfile.reputationScore / 200) * 100)}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600">
                  {userProfile.reputationScore < 150 
                    ? `${150 - userProfile.reputationScore} points to Trusted Member`
                    : 'You are a Trusted Member!'
                  }
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
