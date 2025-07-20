/**
 * 🔐 WALLET AUTHENTICATION GUARD
 * 
 * Enforces wallet connection requirement for protected routes
 * Redirects unauthorized users to wallet connection page
 * Provides clear messaging about blockchain authentication
 */

import React, { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Wallet, 
  Shield, 
  AlertCircle, 
  ArrowRight,
  Plus,
  Download
} from 'lucide-react'
import { useWallet } from '@store/WalletProvider'
import { toast } from 'react-hot-toast'

const WalletGuard = ({ children, requireWallet = true }) => {
  const { isConnected, isConnecting } = useWallet()
  const navigate = useNavigate()
  const location = useLocation()

  // Allow access to landing page without wallet
  const publicRoutes = ['/', '/about', '/how-it-works']
  const isPublicRoute = publicRoutes.includes(location.pathname)

  useEffect(() => {
    // Store intended destination when wallet is required but not connected
    if (requireWallet && !isConnected && !isConnecting && !isPublicRoute) {
      localStorage.setItem('intended_route', location.pathname)
    }

    // Redirect to intended route after successful wallet connection
    if (isConnected && !isConnecting) {
      const intendedRoute = localStorage.getItem('intended_route')
      if (intendedRoute && intendedRoute !== location.pathname) {
        localStorage.removeItem('intended_route')
        navigate(intendedRoute, { replace: true })
      }
    }
  }, [isConnected, isConnecting, requireWallet, location.pathname, isPublicRoute, navigate])

  // If wallet not required or user is connected, render children
  if (!requireWallet || isConnected) {
    return children
  }

  // If on public route and wallet not required, render children
  if (isPublicRoute) {
    return children
  }

  // Show wallet connection requirement page
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <Shield className="h-8 w-8 text-primary-600" />
          </motion.div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Wallet Connection Required
          </h1>
          <p className="text-gray-600">
            Connect your IOTA wallet to access the recycling marketplace
          </p>
        </div>

        {/* Why Wallet Required */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">
                Why do I need a wallet?
              </h3>
              <ul className="text-blue-800 text-sm space-y-1">
                <li>• Secure blockchain-based identity</li>
                <li>• Guaranteed payments through smart contracts</li>
                <li>• Anti-fraud and spam protection</li>
                <li>• Transparent transaction history</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Connection Options */}
        <div className="space-y-4">
          {/* Go to Wallet Options */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/debug')}
            className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl font-medium hover:bg-primary-700 transition-colors flex items-center justify-center space-x-3"
          >
            <Wallet className="h-5 w-5" />
            <span>Choose Wallet Connection</span>
            <ArrowRight className="h-5 w-5" />
          </motion.button>

          {/* Quick Info */}
          <div className="text-center text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
            <div className="font-medium text-blue-800 mb-2">🔗 Multiple Wallet Options Available</div>
            <div>Connect with Firefly, MetaMask Snap, or create a new IOTA wallet</div>
          </div>

          {/* Download Wallet Link */}
          <div className="text-center pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">
              Don't have an IOTA wallet yet?
            </p>
            <a
              href="https://firefly.iota.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              <Download className="h-4 w-4" />
              <span>Download Firefly Wallet</span>
            </a>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm font-medium"
          >
            ← Back to Home
          </button>
        </div>

        {/* Network Info */}
        <div className="mt-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-xs text-gray-600">
            <span>Network:</span>
            <span className="font-medium text-green-600">IOTA Testnet</span>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-600 mt-1">
            <span>Gas Fees:</span>
            <span className="font-medium text-green-600">Feeless ✨</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// Higher-order component for protecting routes
export const withWalletGuard = (Component, requireWallet = true) => {
  return function ProtectedComponent(props) {
    return (
      <WalletGuard requireWallet={requireWallet}>
        <Component {...props} />
      </WalletGuard>
    )
  }
}

export default WalletGuard
