import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ExternalLink, 
  Copy, 
  Shield, 
  Coins, 
  Eye, 
  EyeOff,
  CheckCircle 
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const ContractInfo = () => {
  const [showDetails, setShowDetails] = useState(false)

  const contracts = {
    marketplace: {
      name: "Recycling Marketplace",
      address: "0x9e0364a3eb25bb451ccc5decde1f894d7d4f7e2eaf00e8a880477d9629536f76",
      packageId: "0x467f12c8428e855dfe74fac334a791958abc0065588aee3dbfc0d9e2aeb46d99",
      deploymentTx: "9iCMkMGi8oeG9P7YqYLwo7ZTZDBo5cCAEdLF4VBLfqcZ",
      description: "Main marketplace contract with escrow system"
    },
    token: {
      name: "CLT Reward Token",
      address: "0x5dac6ac215432c4cd2c244616891b305667d5d5fdbb02ddcb68705dcd07a3687",
      packageId: "0x467f12c8428e855dfe74fac334a791958abc0065588aee3dbfc0d9e2aeb46d99",
      metadataAddress: "0x6d071f95c79a4c8b00b6116bb4f310e3b9d46cbb36ed6195abc4c26ec4d6b5d4",
      deploymentTx: "9iCMkMGi8oeG9P7YqYLwo7ZTZDBo5cCAEdLF4VBLfqcZ",
      description: "Custom reward token for collectors"
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard!`)
  }

  const openInExplorer = (query) => {
    window.open(`https://explorer.iota.org/?network=testnet&query=${query}`, '_blank')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-green-600" />
          <h2 className="text-xl font-semibold text-gray-900">Smart Contracts</h2>
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
        >
          {showDetails ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          <span className="text-sm">{showDetails ? 'Hide' : 'Show'} Details</span>
        </button>
      </div>

      <div className="space-y-4">
        {/* Marketplace Contract */}
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-900">{contracts.marketplace.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                Live on IOTA
              </span>
            </div>
          </div>
          
          {showDetails && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Contract Address:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-green-800 font-mono text-xs">
                    {contracts.marketplace.address.slice(0, 10)}...{contracts.marketplace.address.slice(-8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(contracts.marketplace.address, 'Contract address')}
                    className="p-1 hover:bg-green-200 rounded"
                  >
                    <Copy className="h-3 w-3 text-green-600" />
                  </button>
                  <button
                    onClick={() => openInExplorer(contracts.marketplace.address)}
                    className="p-1 hover:bg-green-200 rounded"
                  >
                    <ExternalLink className="h-3 w-3 text-green-600" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">Deployment Tx:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-green-800 font-mono text-xs">
                    {contracts.marketplace.deploymentTx.slice(0, 10)}...{contracts.marketplace.deploymentTx.slice(-8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(contracts.marketplace.deploymentTx, 'Deployment transaction')}
                    className="p-1 hover:bg-green-200 rounded"
                  >
                    <Copy className="h-3 w-3 text-green-600" />
                  </button>
                  <button
                    onClick={() => openInExplorer(contracts.marketplace.deploymentTx)}
                    className="p-1 hover:bg-green-200 rounded"
                  >
                    <ExternalLink className="h-3 w-3 text-green-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* CLT Token Contract */}
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Coins className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-900">{contracts.token.name}</span>
            </div>
            <div className="flex items-center space-x-1">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                Custom Token
              </span>
            </div>
          </div>
          
          {showDetails && (
            <div className="space-y-2 mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Token Address:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-800 font-mono text-xs">
                    {contracts.token.address.slice(0, 10)}...{contracts.token.address.slice(-8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(contracts.token.address, 'Token address')}
                    className="p-1 hover:bg-blue-200 rounded"
                  >
                    <Copy className="h-3 w-3 text-blue-600" />
                  </button>
                  <button
                    onClick={() => openInExplorer(contracts.token.address)}
                    className="p-1 hover:bg-blue-200 rounded"
                  >
                    <ExternalLink className="h-3 w-3 text-blue-600" />
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">Metadata:</span>
                <div className="flex items-center space-x-2">
                  <span className="text-blue-800 font-mono text-xs">
                    {contracts.token.metadataAddress.slice(0, 10)}...{contracts.token.metadataAddress.slice(-8)}
                  </span>
                  <button
                    onClick={() => copyToClipboard(contracts.token.metadataAddress, 'Token metadata')}
                    className="p-1 hover:bg-blue-200 rounded"
                  >
                    <Copy className="h-3 w-3 text-blue-600" />
                  </button>
                  <button
                    onClick={() => openInExplorer(contracts.token.metadataAddress)}
                    className="p-1 hover:bg-blue-200 rounded"
                  >
                    <ExternalLink className="h-3 w-3 text-blue-600" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Network Info */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Network:</span>
            <span className="text-gray-800 font-medium">IOTA Testnet</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Package ID:</span>
            <div className="flex items-center space-x-2">
              <span className="text-gray-800 font-mono text-xs">
                {contracts.marketplace.packageId.slice(0, 10)}...{contracts.marketplace.packageId.slice(-8)}
              </span>
              <button
                onClick={() => copyToClipboard(contracts.marketplace.packageId, 'Package ID')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                <Copy className="h-3 w-3 text-gray-600" />
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Deployed:</span>
            <span className="text-gray-800 font-medium">2025-07-20</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default ContractInfo
