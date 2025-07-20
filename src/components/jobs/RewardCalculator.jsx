import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calculator, Info, TrendingUp } from 'lucide-react'
import { myrToIOTA, formatDualCurrency, formatIOTA } from '@utils/currency'

const RewardCalculator = ({ itemType, weight, onRewardChange }) => {
  const [suggestedReward, setSuggestedReward] = useState(0)
  const [marketRates, setMarketRates] = useState({})

  // Market rates per kg in RM (Malaysian Ringgit)
  const baseRates = {
    cardboard: { min: 0.30, max: 0.60, avg: 0.45 },
    plastic: { min: 0.40, max: 0.80, avg: 0.60 },
    glass: { min: 0.10, max: 0.30, avg: 0.20 },
    metal: { min: 1.50, max: 3.00, avg: 2.25 },
    paper: { min: 0.20, max: 0.50, avg: 0.35 },
    electronics: { min: 5.00, max: 15.00, avg: 10.00 },
    other: { min: 0.25, max: 0.50, avg: 0.35 }
  }

  useEffect(() => {
    if (itemType && weight) {
      const rate = baseRates[itemType] || baseRates.other

      // Base material value (market rate)
      const materialValue = parseFloat(weight) * rate.avg

      // Platform fee (5% deducted from user's payment)
      const platformFee = materialValue * 0.05

      // User receives 95% of material value
      const userReceives = materialValue - platformFee

      // Collector pays the full material value (this gets locked in escrow)
      const collectorPays = materialValue

      // Minimum payment threshold
      const finalCollectorPayment = Math.max(5, Math.round(collectorPays * 100) / 100)

      // Convert RM to IOTA for blockchain transactions
      const collectorPaysIOTA = Math.round(myrToIOTA(finalCollectorPayment) * 1000) / 1000

      setSuggestedReward(collectorPaysIOTA)
      setMarketRates(rate)

      if (onRewardChange) {
        onRewardChange(collectorPaysIOTA)
      }
    }
  }, [itemType, weight, onRewardChange])

  const getRewardLevel = (reward) => {
    if (!marketRates.avg || !weight) return 'fair'
    
    const materialValue = parseFloat(weight) * marketRates.avg
    const ratio = reward / materialValue
    
    if (ratio < 1.2) return 'low'
    if (ratio > 2.0) return 'high'
    return 'fair'
  }

  const rewardLevel = getRewardLevel(suggestedReward)

  const levelColors = {
    low: 'text-red-600 bg-red-50 border-red-200',
    fair: 'text-green-600 bg-green-50 border-green-200',
    high: 'text-blue-600 bg-blue-50 border-blue-200'
  }

  const levelLabels = {
    low: 'Below Market Rate',
    fair: 'Fair Market Rate',
    high: 'Premium Rate'
  }

  if (!itemType || !weight) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-blue-50 border border-blue-200 rounded-xl p-4 mt-4"
    >
      <div className="flex items-center space-x-2 mb-3">
        <Calculator className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold text-blue-900">Reward Calculator</h3>
      </div>

      <div className="space-y-3">
        {/* Market Rate Info */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Market Rate ({itemType})</span>
            <span className="text-sm text-gray-600">
              RM {marketRates.min?.toFixed(2)} - {marketRates.max?.toFixed(2)}/kg
            </span>
          </div>
          <div className="text-xs text-gray-500">
            Material value: RM {(parseFloat(weight || 0) * marketRates.avg).toFixed(2)}
          </div>
        </div>

        {/* Suggested Reward */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Suggested Reward</span>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">
                {formatDualCurrency(suggestedReward, false)}
              </div>
              <div className="text-xs text-gray-500">
                {formatIOTA(suggestedReward)}
              </div>
            </div>
          </div>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${levelColors[rewardLevel]}`}>
            <TrendingUp className="h-3 w-3 mr-1" />
            {levelLabels[rewardLevel]}
          </div>
        </div>

        {/* Breakdown */}
        <div className="bg-white rounded-lg p-3 border border-blue-100">
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between">
              <span>Material value (market rate):</span>
              <span>RM {(parseFloat(weight || 0) * marketRates.avg).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-orange-600">
              <span>Platform fee (5% deducted):</span>
              <span>RM {(parseFloat(weight || 0) * marketRates.avg * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1 text-blue-600">
              <span>Collector pays (locked in escrow):</span>
              <span>{formatDualCurrency(suggestedReward, false)}</span>
            </div>
            <div className="flex justify-between text-green-600 font-medium">
              <span>You receive (after platform fee):</span>
              <span>{formatDualCurrency(Math.round(suggestedReward * 0.95 * 1000) / 1000, false)}</span>
            </div>
            <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded mt-2">
              💡 Collector locks payment when accepting job. You receive 95% after successful collection.
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-start space-x-2 text-xs text-blue-700">
          <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium mb-1">🔄 How Payment Works</p>
            <p className="mb-2">
              <strong>1. Collector Accepts:</strong> Payment gets locked in smart contract escrow
            </p>
            <p className="mb-2">
              <strong>2. Collection Complete:</strong> You receive 95% of material value
            </p>
            <p>
              <strong>3. Platform Fee:</strong> 5% covers transaction security and dispute resolution
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RewardCalculator
