import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import {
  Wallet,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  Eye,
  Plus,
  Copy,
  Trash2
} from 'lucide-react'
import { useWallet } from '@store/WalletProvider'
import { iotaClient } from '@utils/iotaClient'
import TransactionHistory from '@components/blockchain/TransactionHistory'
import ContractInfo from '@components/blockchain/ContractInfo'
import TransactionTester from '@components/test/TransactionTester'
import QuickCopyPanel from '@components/wallet/QuickCopyPanel'

const WalletDebug = () => {
  const { isConnected, address, balance, connectWallet, isConnecting } = useWallet()
  const [detectionResults, setDetectionResults] = useState({})
  const [isDetecting, setIsDetecting] = useState(false)
  const [logs, setLogs] = useState([])

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [...prev, { message, type, timestamp }])
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const detectWallets = async () => {
    setIsDetecting(true)
    setLogs([])
    addLog('🔍 Starting wallet detection...', 'info')

    const results = {
      firefly: false,
      metamask: false,
      iotaWallet: false,
      shimmer: false,
      generic: false,
      windowObjects: []
    }

    try {
      // Check for Firefly
      if (typeof window !== 'undefined' && window.iota) {
        results.firefly = true
        addLog('✅ Firefly wallet detected (window.iota)', 'success')
        
        try {
          const accounts = await window.iota.request({ method: 'iota_requestAccounts' })
          addLog(`🔑 Firefly accounts: ${accounts?.length || 0}`, 'info')
        } catch (e) {
          addLog(`⚠️ Firefly account request failed: ${e.message}`, 'warning')
        }
      } else {
        addLog('❌ Firefly wallet not detected', 'error')
      }

      // Check for MetaMask
      if (typeof window !== 'undefined' && window.ethereum) {
        results.metamask = true
        addLog('✅ MetaMask detected (window.ethereum)', 'success')
        
        try {
          const provider = window.ethereum
          const accounts = await provider.request({ method: 'eth_requestAccounts' })
          addLog(`🔑 MetaMask accounts: ${accounts?.length || 0}`, 'info')
        } catch (e) {
          addLog(`⚠️ MetaMask account request failed: ${e.message}`, 'warning')
        }
      } else {
        addLog('❌ MetaMask not detected', 'error')
      }

      // Check for IOTA Wallet Extension
      if (typeof window !== 'undefined' && window.iotaWallet) {
        results.iotaWallet = true
        addLog('✅ IOTA Wallet Extension detected (window.iotaWallet)', 'success')
      } else {
        addLog('❌ IOTA Wallet Extension not detected', 'error')
      }

      // Check for Shimmer
      if (typeof window !== 'undefined' && window.shimmer) {
        results.shimmer = true
        addLog('✅ Shimmer wallet detected (window.shimmer)', 'success')
      } else {
        addLog('❌ Shimmer wallet not detected', 'error')
      }

      // Check all window objects for IOTA-related properties
      if (typeof window !== 'undefined') {
        const windowKeys = Object.keys(window).filter(key => 
          key.toLowerCase().includes('iota') || 
          key.toLowerCase().includes('shimmer') ||
          key.toLowerCase().includes('wallet')
        )
        results.windowObjects = windowKeys
        
        if (windowKeys.length > 0) {
          addLog(`🔍 Found window objects: ${windowKeys.join(', ')}`, 'info')
        } else {
          addLog('❌ No IOTA-related window objects found', 'error')
        }
      }

      setDetectionResults(results)
      addLog('✅ Wallet detection completed', 'success')
    } catch (error) {
      addLog(`❌ Detection error: ${error.message}`, 'error')
    } finally {
      setIsDetecting(false)
    }
  }

  const testConnection = async (walletType) => {
    addLog(`🔗 Testing ${walletType} connection...`, 'info')

    try {
      let result

      switch (walletType) {
        case 'firefly':
          addLog('🔥 Testing Firefly wallet specifically...', 'info')
          result = await iotaClient.connectFireflyWallet()
          break

        case 'metamask':
          addLog('🦊 Testing MetaMask Snap specifically...', 'info')
          result = await iotaClient.connectMetaMaskSnap()
          break

        case 'generic':
          addLog('🌐 Testing generic IOTA providers...', 'info')
          result = await iotaClient.connectGenericIOTAWallet()
          break

        case 'browser':
          addLog('🌍 Testing browser wallet APIs...', 'info')
          result = await iotaClient.connectBrowserWallet()
          break

        case 'create':
          addLog('🆕 Creating new IOTA wallet...', 'info')
          result = await iotaClient.createNewWallet()
          break

        case 'auto':
          addLog('🔍 Auto-detecting best wallet...', 'info')
          result = await iotaClient.connectExistingWallet()
          break

        default:
          addLog('🔍 Using default connection method...', 'info')
          result = await iotaClient.connectExistingWallet()
      }

      if (result.success) {
        addLog(`🎉 ${walletType} connection successful!`, 'success')
        addLog(`📍 Address: ${result.address}`, 'info')
        addLog(`💰 Balance: ${result.balance}`, 'info')
        addLog(`🔗 Provider: ${result.provider}`, 'info')

        if (result.isReal) {
          addLog(`✅ Real IOTA wallet detected!`, 'success')
        }
        if (result.isDemo) {
          addLog(`⚠️ Demo wallet (fallback mode)`, 'warning')
        }
        if (result.mnemonic) {
          addLog(`🔑 Mnemonic available for backup`, 'info')
        }
      } else {
        addLog(`❌ ${walletType} connection failed: ${result.error}`, 'error')
      }
    } catch (error) {
      addLog(`❌ ${walletType} test error: ${error.message}`, 'error')
    }
  }

  useEffect(() => {
    detectWallets()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Search className="h-6 w-6 text-primary-600" />
            <h1 className="text-2xl font-bold text-gray-900">IOTA Wallet Debug</h1>
          </div>

          {/* Current Connection Status */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">Current Connection Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                {isConnected ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <span className={isConnected ? 'text-green-700' : 'text-red-700'}>
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>
              {address && (
                <div className="text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Address:</span>
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded border">
                        {address.slice(0, 20)}...{address.slice(-10)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(address, 'Wallet address')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy full wallet address"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {balance && (
                <div className="text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700">Balance:</span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-green-100 text-green-800 px-2 py-1 rounded border">
                        {balance} IOTA
                      </span>
                      <button
                        onClick={() => copyToClipboard(balance, 'Balance amount')}
                        className="p-1 hover:bg-gray-200 rounded transition-colors"
                        title="Copy balance"
                      >
                        <Copy className="h-4 w-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Copy Panel */}
          <div className="mb-6">
            <QuickCopyPanel />
          </div>

          {/* Transaction Tester */}
          <div className="mb-6">
            <TransactionTester />
          </div>

          {/* Wallet Detection Results */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Wallet Detection Results</h2>
              <button
                onClick={detectWallets}
                disabled={isDetecting}
                className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${isDetecting ? 'animate-spin' : ''}`} />
                <span>Re-detect</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { key: 'firefly', name: 'Firefly Wallet', desc: 'Official IOTA wallet' },
                { key: 'metamask', name: 'MetaMask', desc: 'For IOTA Snap integration' },
                { key: 'iotaWallet', name: 'IOTA Wallet Extension', desc: 'Browser extension' },
                { key: 'shimmer', name: 'Shimmer Wallet', desc: 'Shimmer network wallet' }
              ].map(wallet => (
                <div key={wallet.key} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {detectionResults[wallet.key] ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      <span className="font-medium">{wallet.name}</span>
                    </div>
                    {detectionResults[wallet.key] && (
                      <button
                        onClick={() => testConnection(wallet.key)}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Test
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{wallet.desc}</p>
                </div>
              ))}
            </div>

            {detectionResults.windowObjects?.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-blue-900">Found Window Objects:</h3>
                  <button
                    onClick={() => copyToClipboard(detectionResults.windowObjects.join(', '), 'Window objects')}
                    className="p-1 hover:bg-blue-200 rounded transition-colors"
                    title="Copy window objects"
                  >
                    <Copy className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
                <div className="bg-white border border-blue-200 rounded p-3">
                  <code className="text-sm text-gray-800 font-mono break-all">
                    {detectionResults.windowObjects.join(', ')}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* Individual Wallet Connection Tests */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Individual Wallet Tests</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

              {/* Firefly Wallet */}
              <button
                onClick={() => testConnection('firefly')}
                className="flex flex-col items-center space-y-2 p-4 border-2 border-orange-500 text-orange-600 rounded-lg hover:bg-orange-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <span className="font-medium">Firefly Wallet</span>
                </div>
                <span className="text-sm text-gray-600">Official IOTA wallet</span>
              </button>

              {/* MetaMask Snap */}
              <button
                onClick={() => testConnection('metamask')}
                className="flex flex-col items-center space-y-2 p-4 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="font-medium">MetaMask Snap</span>
                </div>
                <span className="text-sm text-gray-600">IOTA via MetaMask</span>
              </button>

              {/* Generic IOTA */}
              <button
                onClick={() => testConnection('generic')}
                className="flex flex-col items-center space-y-2 p-4 border-2 border-purple-500 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="font-medium">Generic IOTA</span>
                </div>
                <span className="text-sm text-gray-600">Any IOTA provider</span>
              </button>

              {/* Browser Wallet */}
              <button
                onClick={() => testConnection('browser')}
                className="flex flex-col items-center space-y-2 p-4 border-2 border-green-500 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Browser Wallet</span>
                </div>
                <span className="text-sm text-gray-600">Standard wallet API</span>
              </button>

              {/* Create New */}
              <button
                onClick={() => testConnection('create')}
                className="flex flex-col items-center space-y-2 p-4 border-2 border-indigo-500 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                  <span className="font-medium">Create New</span>
                </div>
                <span className="text-sm text-gray-600">Generate new wallet</span>
              </button>

              {/* Auto-detect */}
              <button
                onClick={() => testConnection('auto')}
                className="flex flex-col items-center space-y-2 p-4 border-2 border-gray-500 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4" />
                  <span className="font-medium">Auto-detect</span>
                </div>
                <span className="text-sm text-gray-600">Try all methods</span>
              </button>
            </div>
          </div>

          {/* Main App Connection Test */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4">Main App Connection</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => connectWallet('existing')}
                disabled={isConnecting}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 disabled:opacity-50 transition-colors"
              >
                <Wallet className="h-5 w-5" />
                <span>{isConnecting ? 'Connecting...' : 'Connect Existing Wallet'}</span>
              </button>

              <button
                onClick={() => connectWallet('new')}
                disabled={isConnecting}
                className="flex items-center justify-center space-x-2 p-4 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 disabled:opacity-50 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>{isConnecting ? 'Creating...' : 'Create New Account'}</span>
              </button>
            </div>
          </div>

          {/* Debug Logs */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Debug Logs</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => copyToClipboard(logs.map(log => `[${log.timestamp}] ${log.message}`).join('\n'), 'Debug logs')}
                  className="flex items-center space-x-1 px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  title="Copy all logs"
                >
                  <Copy className="h-4 w-4" />
                  <span className="text-sm">Copy Logs</span>
                </button>
                <button
                  onClick={() => setLogs([])}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                  title="Clear logs"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="text-sm">Clear</span>
                </button>
              </div>
            </div>
            <div className="bg-gray-900 border border-gray-700 text-green-400 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className={`mb-1 ${
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'warning' ? 'text-yellow-400' :
                  log.type === 'success' ? 'text-green-400' : 'text-gray-300'
                }`}>
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
              {logs.length === 0 && (
                <div className="text-gray-500">No logs yet. Click "Re-detect" to start debugging.</div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default WalletDebug
