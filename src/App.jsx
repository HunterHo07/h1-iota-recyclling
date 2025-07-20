import React, { useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Import pages
import LandingPage from '@pages/LandingPage'
import RecyclerDashboard from '@pages/RecyclerDashboard'
import CollectorDashboard from '@pages/CollectorDashboard'
import JobDetails from '@pages/JobDetails'
import Profile from '@pages/Profile'
import WalletDebug from '@pages/WalletDebug'
import NotFound from '@pages/NotFound'

// Import providers
import { WalletProvider } from '@store/WalletProvider'
import { AppStateProvider, useAppState } from '@store/AppStateProvider'
import { useWallet } from '@store/WalletProvider'

// Import components
import Navbar from '@components/layout/Navbar'
import Footer from '@components/layout/Footer'
import LoadingScreen from '@components/ui/LoadingScreen'
import TransactionMonitor from '@components/blockchain/TransactionMonitor'
import WalletGuard from '@components/auth/WalletGuard'

// Route Recovery Component
const RouteRecovery = () => {
  const { userRole } = useAppState()
  const { isConnected } = useWallet()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Handle route recovery after login/connection issues
    if (isConnected && location.pathname === '/') {
      const savedRole = localStorage.getItem('userRole') || userRole
      const intendedRoute = localStorage.getItem('intended_route')

      if (intendedRoute && (intendedRoute === '/recycler' || intendedRoute === '/collector')) {
        localStorage.removeItem('intended_route')
        navigate(intendedRoute, { replace: true })
      } else if (savedRole === 'recycler') {
        navigate('/recycler', { replace: true })
      } else if (savedRole === 'collector') {
        navigate('/collector', { replace: true })
      }
    }
  }, [isConnected, location.pathname, userRole, navigate])

  return null
}

function App() {
  const location = useLocation()

  return (
    <WalletProvider>
      <AppStateProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          {/* Route Recovery */}
          <RouteRecovery />

          {/* Navigation */}
          <Navbar />

          {/* Main Content */}
          <main className="flex-1">
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route 
                  path="/" 
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <LandingPage />
                    </motion.div>
                  } 
                />
                <Route
                  path="/recycler"
                  element={
                    <WalletGuard requireWallet={true}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RecyclerDashboard />
                      </motion.div>
                    </WalletGuard>
                  }
                />
                <Route
                  path="/collector"
                  element={
                    <WalletGuard requireWallet={true}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <CollectorDashboard />
                      </motion.div>
                    </WalletGuard>
                  }
                />
                <Route
                  path="/job/:id"
                  element={
                    <WalletGuard requireWallet={true}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <JobDetails />
                      </motion.div>
                    </WalletGuard>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <WalletGuard requireWallet={true}>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Profile />
                      </motion.div>
                    </WalletGuard>
                  }
                />
                <Route
                  path="/debug"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <WalletDebug />
                    </motion.div>
                  }
                />
                <Route
                  path="*"
                  element={
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3 }}
                    >
                      <NotFound />
                    </motion.div>
                  }
                />
              </Routes>
            </AnimatePresence>
          </main>
          
          {/* Footer */}
          <Footer />

          {/* Transaction Monitor */}
          <TransactionMonitor />
        </div>
      </AppStateProvider>
    </WalletProvider>
  )
}

export default App
