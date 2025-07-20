import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Copy, 
  Check, 
  Wallet, 
  Coins, 
  Shield, 
  ExternalLink,
  Eye,
  EyeOff
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { useWallet } from '@store/WalletProvider'

const QuickCopyPanel = () => {
  const { address, balance, isConnected } = useWallet()
  const [copiedItems, setCopiedItems] = useState({})
  const [showFullAddress, setShowFullAddress] = useState(false)

  const copyToClipboard = async (text, label, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItems(prev => ({ ...prev, [key]: true }))
      toast.success(`${label} copied to clipboard!`)
      
      // Reset copied state after 2 seconds
      setTimeout(() => {
        setCopiedItems(prev => ({ ...prev, [key]: false }))
      }, 2000)
    } catch (error) {
      toast.error('Failed to copy to clipboard')
    }
  }

  const copyData = [
    {
      key: 'address',
      label: 'Wallet Address',
      value: address,
      icon: <Wallet className="h-4 w-4" />,
      color: 'blue',
      display: showFullAddress ? address : (address ? `${address.slice(0, 20)}...${address.slice(-10)}` : 'Not connected'),
      fullValue: address
    },
    {
      key: 'balance',
      label: 'Balance',
      value: balance ? `${balance} IOTA` : '0 IOTA',
      icon: <Coins className="h-4 w-4" />,
      color: 'green',
      display: balance ? `${balance} IOTA` : '0 IOTA',
      fullValue: balance
    },
    {
      key: 'marketplace_contract',
      label: 'Marketplace Contract',
      value: '0x9e0364a3eb25bb451ccc5decde1f894d7d4f7e2eaf00e8a880477d9629536f76',
      icon: <Shield className="h-4 w-4" />,
      color: 'purple',
      display: '0x9e0364a3...9536f76',
      fullValue: '0x9e0364a3eb25bb451ccc5decde1f894d7d4f7e2eaf00e8a880477d9629536f76'
    },
    {
      key: 'token_contract',
      label: 'CLT Token Contract',
      value: '0x5dac6ac215432c4cd2c244616891b305667d5d5fdbb02ddcb68705dcd07a3687',
      icon: <Coins className="h-4 w-4" />,
      color: 'orange',
      display: '0x5dac6ac2...07a3687',
      fullValue: '0x5dac6ac215432c4cd2c244616891b305667d5d5fdbb02ddcb68705dcd07a3687'
    },
    {
      key: 'deployment_tx',
      label: 'Deployment Transaction',
      value: '9iCMkMGi8oeG9P7YqYLwo7ZTZDBo5cCAEdLF4VBLfqcZ',
      icon: <ExternalLink className="h-4 w-4" />,
      color: 'indigo',
      display: '9iCMkMGi...BLfqcZ',
      fullValue: '9iCMkMGi8oeG9P7YqYLwo7ZTZDBo5cCAEdLF4VBLfqcZ'
    }
  ]

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-800',
      green: 'bg-green-50 border-green-200 text-green-800',
      purple: 'bg-purple-50 border-purple-200 text-purple-800',
      orange: 'bg-orange-50 border-orange-200 text-orange-800',
      indigo: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    }
    return colors[color] || colors.blue
  }

  const getIconColor = (color) => {
    const colors = {
      blue: 'text-blue-600',
      green: 'text-green-600',
      purple: 'text-purple-600',
      orange: 'text-orange-600',
      indigo: 'text-indigo-600'
    }
    return colors[color] || colors.blue
  }

  const openInExplorer = (value) => {
    window.open(`https://explorer.iota.org/?network=testnet&query=${value}`, '_blank')
  }

  if (!isConnected) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <div className="text-center">
          <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Connect Wallet First</h3>
          <p className="text-gray-600">Connect your wallet to see copyable information</p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Copy className="h-5 w-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900">Quick Copy Panel</h2>
        </div>
        <button
          onClick={() => setShowFullAddress(!showFullAddress)}
          className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-800"
        >
          {showFullAddress ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span>{showFullAddress ? 'Hide' : 'Show'} Full</span>
        </button>
      </div>

      <div className="space-y-4">
        {copyData.map((item, index) => (
          <motion.div
            key={item.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 border rounded-lg ${getColorClasses(item.color)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className={`${getIconColor(item.color)}`}>
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 mb-1">{item.label}</div>
                  <div className="bg-white border border-gray-200 rounded px-3 py-2">
                    <code className="text-sm text-gray-800 font-mono break-all">
                      {item.display}
                    </code>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => copyToClipboard(item.fullValue || item.value, item.label, item.key)}
                  className="flex items-center space-x-1 px-3 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  title={`Copy ${item.label}`}
                >
                  {copiedItems[item.key] ? (
                    <>
                      <Check className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-600">Copy</span>
                    </>
                  )}
                </button>
                
                {(item.key === 'marketplace_contract' || item.key === 'token_contract' || item.key === 'deployment_tx') && (
                  <button
                    onClick={() => openInExplorer(item.fullValue || item.value)}
                    className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    title="View on IOTA Explorer"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="text-sm">Explorer</span>
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Copy All Button */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={() => {
            const allData = copyData
              .filter(item => item.fullValue || item.value)
              .map(item => `${item.label}: ${item.fullValue || item.value}`)
              .join('\n')
            copyToClipboard(allData, 'All wallet information', 'all')
          }}
          className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          <Copy className="h-4 w-4" />
          <span>Copy All Information</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">💡 Quick Tips:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <div>• Click "Copy" to copy individual items</div>
          <div>• Click "Explorer" to view contracts on IOTA blockchain</div>
          <div>• Click "Copy All Information" to copy everything at once</div>
          <div>• Toggle "Show Full" to see complete addresses</div>
        </div>
      </div>
    </motion.div>
  )
}

export default QuickCopyPanel
