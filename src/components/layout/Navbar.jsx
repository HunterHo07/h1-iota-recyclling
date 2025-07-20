import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Recycle,
  Wallet,
  User,
  Menu,
  X,
  ToggleLeft,
  ToggleRight,
  Coins,
  Package,
  Plus
} from 'lucide-react'
import { useWallet } from '@store/WalletProvider'
import { useAppState } from '@store/AppStateProvider'

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const {
    isConnected,
    address,
    balance,
    connectWallet,
    createNewAccount,
    disconnectWallet,
    formatAddress,
    formatBalance,
    formatBalanceWithMYR,
    isConnecting
  } = useWallet()
  const { userRole, setUserRole, jobs } = useAppState()
  const location = useLocation()
  const navigate = useNavigate()

  const isLandingPage = location.pathname === '/'

  // Calculate user's jobs count (only if wallet connected)
  const userJobsCount = isConnected && address
    ? jobs.filter(job => job.poster === address || job.claimedBy === address).length
    : 0

  const toggleRole = () => {
    const newRole = userRole === 'recycler' ? 'collector' : 'recycler'
    setUserRole(newRole)

    // Navigate to the appropriate dashboard when role changes
    if (!isLandingPage) {
      const targetPath = newRole === 'recycler' ? '/recycler' : '/collector'
      // Use setTimeout to ensure state update completes first
      setTimeout(() => {
        navigate(targetPath, { replace: true })
      }, 100)
    }
  }

  // Auto-navigate when role changes and user is on a dashboard
  useEffect(() => {
    if (!isLandingPage && (location.pathname === '/recycler' || location.pathname === '/collector')) {
      const expectedPath = userRole === 'recycler' ? '/recycler' : '/collector'
      if (location.pathname !== expectedPath) {
        navigate(expectedPath, { replace: true })
      }
    }
  }, [userRole, location.pathname, isLandingPage, navigate])

  const navItems = [
    { 
      path: userRole === 'recycler' ? '/recycler' : '/collector', 
      label: 'Dashboard',
      icon: Recycle 
    },
    { 
      path: '/profile', 
      label: 'Profile',
      icon: User 
    },
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-2 bg-primary-100 rounded-xl group-hover:bg-primary-200 transition-colors">
              <Recycle className="h-6 w-6 text-primary-600" />
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">
              Grab Recycle
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isLandingPage && (
              <>
                {/* Role Toggle */}
                <div className="flex items-center space-x-3 bg-gray-100 rounded-xl p-2">
                  <span className={`text-sm font-medium transition-colors ${
                    userRole === 'recycler' ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    Recycler
                  </span>
                  <button
                    onClick={toggleRole}
                    className="focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-lg"
                  >
                    {userRole === 'recycler' ? (
                      <ToggleLeft className="h-6 w-6 text-gray-400 hover:text-primary-600 transition-colors" />
                    ) : (
                      <ToggleRight className="h-6 w-6 text-primary-600 hover:text-primary-700 transition-colors" />
                    )}
                  </button>
                  <span className={`text-sm font-medium transition-colors ${
                    userRole === 'collector' ? 'text-primary-600' : 'text-gray-500'
                  }`}>
                    Collector
                  </span>
                </div>

                {/* Navigation Links */}
                {navItems.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.path
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  )
                })}
              </>
            )}

            {/* Wallet Section */}
            {isConnected ? (
              <div className="flex items-center space-x-4">
                {/* My Jobs Counter */}
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 bg-primary-50 text-primary-700 px-3 py-1 rounded-lg hover:bg-primary-100 transition-colors"
                >
                  <Package className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    My Jobs ({userJobsCount})
                  </span>
                </Link>

                {/* Balance Display */}
                <div className="flex items-center space-x-2 bg-accent-50 px-3 py-2 rounded-lg">
                  <Coins className="h-4 w-4 text-accent-600" />
                  <span className="text-sm font-semibold text-accent-700">
                    {formatBalanceWithMYR(balance)}
                  </span>
                </div>

                {/* Wallet Address */}
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <Wallet className="h-4 w-4 text-gray-600" />
                  <span className="text-sm font-mono text-gray-700">
                    {formatAddress(address)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <button
                  onClick={disconnectWallet}
                  className="text-sm text-red-600 hover:text-red-700 font-medium"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => connectWallet('existing')}
                  disabled={isConnecting}
                  className="btn-primary text-sm py-2 px-4 min-h-0 disabled:opacity-50"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                </button>
                <button
                  onClick={createNewAccount}
                  disabled={isConnecting}
                  className="btn-secondary text-sm py-2 px-4 min-h-0 disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Account
                </button>

              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              {!isLandingPage && (
                <>
                  {/* Mobile Role Toggle */}
                  <div className="flex items-center justify-between bg-gray-100 rounded-xl p-3">
                    <span className="text-sm font-medium text-gray-700">Switch Role:</span>
                    <div className="flex items-center space-x-3">
                      <span className={`text-sm font-medium ${
                        userRole === 'recycler' ? 'text-primary-600' : 'text-gray-500'
                      }`}>
                        Recycler
                      </span>
                      <button onClick={toggleRole}>
                        {userRole === 'recycler' ? (
                          <ToggleLeft className="h-6 w-6 text-gray-400" />
                        ) : (
                          <ToggleRight className="h-6 w-6 text-primary-600" />
                        )}
                      </button>
                      <span className={`text-sm font-medium ${
                        userRole === 'collector' ? 'text-primary-600' : 'text-gray-500'
                      }`}>
                        Collector
                      </span>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = location.pathname === item.path
                    
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-600 hover:text-primary-600 hover:bg-gray-100'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    )
                  })}
                </>
              )}

              {/* Mobile Wallet Section */}
              {isConnected ? (
                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Balance:</span>
                    <span className="text-sm font-semibold text-accent-600">
                      {formatBalance(balance)} IOTA
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Address:</span>
                    <span className="text-sm font-mono text-gray-600">
                      {formatAddress(address)}
                    </span>
                  </div>
                  <button
                    onClick={disconnectWallet}
                    className="w-full text-center py-2 text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      connectWallet('existing')
                      setIsMobileMenuOpen(false)
                    }}
                    disabled={isConnecting}
                    className="w-full btn-primary text-sm py-3 disabled:opacity-50"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    {isConnecting ? 'Connecting...' : 'Connect Wallet'}
                  </button>
                  <button
                    onClick={() => {
                      createNewAccount()
                      setIsMobileMenuOpen(false)
                    }}
                    disabled={isConnecting}
                    className="w-full btn-secondary text-sm py-3 disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Account
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar
