import React from 'react'
import { Routes, Route } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

// Import pages
import LandingPage from '@pages/LandingPage'
import RecyclerDashboard from '@pages/RecyclerDashboard'
import CollectorDashboard from '@pages/CollectorDashboard'
import JobDetails from '@pages/JobDetails'
import Profile from '@pages/Profile'
import NotFound from '@pages/NotFound'

// Import providers
import { WalletProvider } from '@store/WalletProvider'
import { AppStateProvider } from '@store/AppStateProvider'

// Import components
import Navbar from '@components/layout/Navbar'
import Footer from '@components/layout/Footer'
import LoadingScreen from '@components/ui/LoadingScreen'
import TransactionMonitor from '@components/blockchain/TransactionMonitor'
import WalletGuard from '@components/auth/WalletGuard'

function App() {
  const location = useLocation()

  return (
    <WalletProvider>
      <AppStateProvider>
        <div className="min-h-screen bg-gray-50 flex flex-col">
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
