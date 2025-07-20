/**
 * 🔗 REAL IOTA WALLET PROVIDER
 *
 * Features:
 * - Real IOTA wallet integration (Firefly, MetaMask Snap)
 * - Blockchain-based authentication
 * - Wallet address as unique user ID
 * - Auto account creation for new users
 * - IOTA Testnet support with real transactions
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import { iotaClient } from '@utils/iotaClient'
import { iotaIdentity } from '@utils/iotaIdentity'
import { iotaToMYR, formatIOTA, formatMYR, formatDualCurrency } from '@utils/currency'

// 🔗 IOTA Wallet Context - Real blockchain authentication
const WalletContext = createContext()

export const useWallet = () => {
  const context = useContext(WalletContext)
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [address, setAddress] = useState('')
  const [balance, setBalance] = useState('0')
  const [isConnecting, setIsConnecting] = useState(false)
  const [network, setNetwork] = useState('testnet')
  const [userType, setUserType] = useState(null) // 'recycler' or 'collector'
  const [isNewUser, setIsNewUser] = useState(false)

  // 🔗 REAL IOTA WALLET CONNECTION
  const connectWallet = async (walletType = 'existing') => {
    setIsConnecting(true)

    try {
      // Initialize IOTA client
      await iotaClient.initialize()

      if (walletType === 'new') {
        // 🆕 AUTO CREATE NEW IOTA ACCOUNT
        const toastId = toast.loading('Creating new IOTA account on testnet...', { duration: 3000 })

        const result = await iotaClient.createNewWallet()

        if (!result.success) {
          throw new Error(result.error)
        }

        setAddress(result.address)
        setBalance(result.balance)
        setIsConnected(true)
        setIsNewUser(true)

        // Create IOTA Identity for new user
        const identityResult = await iotaIdentity.createDID(result.address, 'individual')
        if (identityResult.success) {
          console.log('🆔 IOTA Identity created:', identityResult.did)
        }

        // Show different message based on wallet type
        if (result.isDemo) {
          toast.success(
            <div>
              <div className="font-semibold">✅ Demo IOTA wallet created!</div>
              <div className="text-sm text-gray-600 mt-1">
                Address: {result.address.slice(0, 10)}...{result.address.slice(-6)}
              </div>
              <div className="text-sm text-yellow-600">
                ⚠️ Using demo mode (IOTA SDK not available)
              </div>
            </div>,
            { id: toastId, duration: 4000 }
          )

        } else if (result.isReal) {
          toast.success(
            <div>
              <div className="font-semibold">✅ Real IOTA wallet created!</div>
              <div className="text-sm text-gray-600 mt-1">
                Address: {result.address.slice(0, 10)}...{result.address.slice(-6)}
              </div>
              <div className="text-sm text-green-600 mt-1">
                🌐 Connected to real IOTA testnet
              </div>
            </div>,
            { id: toastId, duration: 6000 }
          )


          // Show mnemonic backup reminder
          setTimeout(() => {
            toast(
              <div className="max-w-md">
                <div className="font-semibold text-orange-600 mb-2">🔐 Backup Your Mnemonic</div>
                <div className="text-xs bg-gray-100 p-2 rounded font-mono break-all">
                  {result.mnemonic}
                </div>
                <div className="text-xs text-gray-600 mt-2">
                  Save this mnemonic phrase securely. You'll need it to recover your wallet.
                </div>
              </div>,
              { duration: 10000 }
            )
          }, 2000)
        } else {
          toast.success('🎉 IOTA account created!', { id: toastId })

        }

        // Wait a bit then check balance and request faucet tokens
        setTimeout(async () => {
          // Request faucet tokens if real wallet
          if (result.isReal) {
            const faucetToastId = toast.loading('Requesting testnet tokens from faucet...', { duration: 8000 })

            const faucetSuccess = await iotaClient.requestFaucetTokens(result.address)
            if (faucetSuccess) {
              toast.success('💰 Testnet tokens requested! Check balance in a few moments.', { id: faucetToastId })
            } else {
              toast.error('⚠️ Faucet request failed. Using demo balance.', { id: faucetToastId })
            }
          }

          // Update balance
          const newBalance = await iotaClient.getBalance(result.address)
          setBalance(newBalance.toString())

          if (newBalance > 0) {
            toast.success(`💰 Balance updated: ${newBalance.toFixed(3)} IOTA`)
          }
        }, 3000)

      } else {
        // 🔗 CONNECT EXISTING WALLET
        const toastId = toast.loading('Connecting to IOTA wallet...', { duration: 5000 })

        const result = await iotaClient.connectExistingWallet()

        if (!result.success) {
          if (result.needsNewWallet) {
            toast.error('No wallet found. Please create a new account first.', { id: toastId })
            return
          }
          throw new Error(result.error)
        }

        setAddress(result.address)
        setBalance(result.balance)
        setIsConnected(true)
        setIsNewUser(false)

        // Create or retrieve IOTA Identity for existing user
        const existingIdentity = iotaIdentity.getUserIdentity(result.address)
        if (!existingIdentity.success) {
          await iotaIdentity.createDID(result.address, 'individual')
        }

        // Show success message based on connection type
        if (result.provider === 'metamask-snap') {
          toast.success(
            <div>
              <div className="font-semibold">🎉 Connected via MetaMask IOTA Snap!</div>
              <div className="text-sm text-gray-600 mt-1">
                Address: {result.address.slice(0, 10)}...{result.address.slice(-6)}
              </div>
              <div className="text-sm text-green-600">
                🦊 Real IOTA wallet via MetaMask
              </div>
              <div className="text-sm text-blue-600 mt-1">
                🌐 Connected to IOTA testnet
              </div>
            </div>,
            { id: toastId, duration: 6000 }
          )
        } else if (result.isReal) {
          toast.success(
            <div>
              <div className="font-semibold">✅ Real IOTA wallet connected!</div>
              <div className="text-sm text-gray-600 mt-1">
                Address: {result.address.slice(0, 10)}...{result.address.slice(-6)}
              </div>
              <div className="text-sm text-green-600">
                🌐 Connected to IOTA testnet
              </div>
            </div>,
            { id: toastId, duration: 4000 }
          )
        } else {
          toast.success(`✅ Wallet connected via ${result.provider || 'IOTA'}!`, { id: toastId })
        }

        // Update balance after connection
        setTimeout(async () => {
          const newBalance = await iotaClient.getBalance(result.address)
          setBalance(newBalance.toString())
        }, 2000)
      }

      // Store connection state
      localStorage.setItem('wallet_connected', 'true')
      localStorage.setItem('wallet_address', address)
      localStorage.setItem('wallet_type', walletType)
      localStorage.setItem('is_new_user', isNewUser.toString())

    } catch (error) {
      toast.error(`Failed to connect wallet: ${error.message}`)
    } finally {
      setIsConnecting(false)
    }
  }

  // 🆕 CREATE NEW ACCOUNT FUNCTION
  const createNewAccount = async () => {
    return await connectWallet('new')
  }

  const disconnectWallet = () => {
    // Disconnect from IOTA client
    iotaClient.disconnect()

    setIsConnected(false)
    setAddress('')
    setBalance('0')
    setUserType(null)
    setIsNewUser(false)

    // Clear stored data
    localStorage.removeItem('wallet_connected')
    localStorage.removeItem('wallet_address')
    localStorage.removeItem('wallet_type')
    localStorage.removeItem('is_new_user')

    toast.success('🔌 IOTA wallet disconnected')
  }

  const updateBalance = (newBalance) => {
    setBalance(newBalance)
    localStorage.setItem('wallet_balance', newBalance)
  }

  // 🔗 REAL IOTA TRANSACTION FUNCTION
  const sendTransaction = async (transactionData) => {
    if (!isConnected) {
      throw new Error('Wallet not connected')
    }

    try {
      const result = await iotaClient.sendTransaction(
        transactionData.to || address,
        transactionData.amount || 0,
        transactionData
      )

      if (!result.success) {
        throw new Error(result.error)
      }

      // Update balance after transaction (IOTA is feeless!)
      const newBalance = await iotaClient.getBalance(address)
      updateBalance(newBalance.toString())

      return {
        hash: result.transactionId,
        status: result.status,
        gasUsed: 0, // IOTA is feeless!
        blockNumber: result.blockNumber,
        timestamp: result.timestamp
      }
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  // Check for existing connection on mount
  useEffect(() => {
    const savedConnection = localStorage.getItem('wallet_connected')
    const savedAddress = localStorage.getItem('wallet_address')
    const savedBalance = localStorage.getItem('wallet_balance')
    
    if (savedConnection === 'true' && savedAddress && savedBalance) {
      setIsConnected(true)
      setAddress(savedAddress)
      setBalance(savedBalance)
    }
  }, [])

  // 🔄 REAL BALANCE MONITORING
  useEffect(() => {
    if (!isConnected || !address) return

    const interval = setInterval(async () => {
      try {
        const newBalance = await iotaClient.getBalance(address)
        const balanceStr = newBalance.toString()

        // Only update if balance changed
        if (balanceStr !== balance) {
          updateBalance(balanceStr)
          console.log('💰 Balance updated:', balanceStr, 'IOTA')
        }
      } catch (error) {
        console.error('Failed to update balance:', error)
      }
    }, 10000) // Check every 10 seconds

    return () => clearInterval(interval)
  }, [isConnected, address, balance])

  const value = {
    // Connection state
    isConnected,
    address,
    balance,
    isConnecting,
    network,
    userType,
    isNewUser,

    // Connection functions
    connectWallet,
    createNewAccount,
    disconnectWallet,
    updateBalance,
    sendTransaction,

    // Utility functions
    formatAddress: (addr) => addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '',
    formatBalance: (bal) => (Math.round(parseFloat(bal) * 1000) / 1000).toFixed(3),
    formatBalanceWithMYR: (bal) => formatDualCurrency(Math.round(parseFloat(bal) * 1000) / 1000),
    getBalanceInMYR: (bal) => iotaToMYR(parseFloat(bal)),
    formatIOTA,
    formatMYR,

    // Authentication helpers
    requireWallet: () => {
      if (!isConnected) {
        throw new Error('Wallet connection required')
      }
      return true
    },

    // User identification (blockchain-based)
    getUserId: () => address, // Wallet address as unique user ID
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
