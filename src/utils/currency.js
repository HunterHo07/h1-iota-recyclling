/**
 * 💱 CURRENCY CONVERSION UTILITIES
 * 
 * Handles IOTA to RM (Malaysian Ringgit) conversion
 * In a real application, this would fetch live exchange rates
 */

// Mock exchange rate for demo purposes
// In production, this would be fetched from a real API like CoinGecko
const IOTA_TO_USD = 0.25 // $0.25 per IOTA (demo rate)
const USD_TO_MYR = 4.50   // 1 USD = 4.50 MYR (demo rate)

export const IOTA_TO_MYR_RATE = IOTA_TO_USD * USD_TO_MYR // ~1.125 MYR per IOTA

/**
 * Convert IOTA to Malaysian Ringgit
 */
export const iotaToMYR = (iotaAmount) => {
  if (!iotaAmount || isNaN(iotaAmount)) return 0
  return Math.round((iotaAmount * IOTA_TO_MYR_RATE) * 100) / 100 // Round to 2 decimal places
}

/**
 * Convert Malaysian Ringgit to IOTA
 */
export const myrToIOTA = (myrAmount) => {
  if (!myrAmount || isNaN(myrAmount)) return 0
  const iotaAmount = myrAmount / IOTA_TO_MYR_RATE
  return Math.round(iotaAmount * 1000) / 1000 // Round to 3 decimal places
}

/**
 * Format IOTA amount with currency symbol
 */
export const formatIOTA = (amount, decimals = 3) => {
  if (!amount || isNaN(amount)) return '0.000 IOTA'
  const numAmount = parseFloat(amount)
  const roundedAmount = Math.round(numAmount * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return `${roundedAmount.toFixed(decimals)} IOTA`
}

/**
 * Format MYR amount with currency symbol
 */
export const formatMYR = (amount, decimals = 2) => {
  if (!amount || isNaN(amount)) return 'RM 0.00'
  const numAmount = parseFloat(amount)
  const roundedAmount = Math.round(numAmount * Math.pow(10, decimals)) / Math.pow(10, decimals)
  return `RM ${roundedAmount.toFixed(decimals)}`
}

/**
 * Format dual currency display (IOTA + MYR equivalent)
 */
export const formatDualCurrency = (iotaAmount, showIOTAFirst = true) => {
  if (!iotaAmount || isNaN(iotaAmount)) {
    return showIOTAFirst ? '0.000 IOTA (RM 0.00)' : 'RM 0.00 (0.000 IOTA)'
  }

  const iota = formatIOTA(iotaAmount)
  const myr = formatMYR(iotaToMYR(iotaAmount))

  return showIOTAFirst
    ? `${iota} (${myr})`
    : `${myr} (${iota})`
}

/**
 * Get current exchange rate info
 */
export const getExchangeRateInfo = () => {
  return {
    iotaToUsd: IOTA_TO_USD,
    usdToMyr: USD_TO_MYR,
    iotaToMyr: IOTA_TO_MYR_RATE,
    lastUpdated: new Date().toISOString(),
    source: 'Demo rates for hackathon'
  }
}

/**
 * Currency conversion component helper
 */
export const CurrencyDisplay = ({
  iotaAmount,
  showBoth = true,
  primaryCurrency = 'IOTA',
  _className = ''
}) => {
  if (!showBoth) {
    return primaryCurrency === 'IOTA' 
      ? formatIOTA(iotaAmount)
      : formatMYR(iotaToMYR(iotaAmount))
  }
  
  return formatDualCurrency(iotaAmount, primaryCurrency === 'IOTA')
}

export default {
  iotaToMYR,
  myrToIOTA,
  formatIOTA,
  formatMYR,
  formatDualCurrency,
  getExchangeRateInfo,
  CurrencyDisplay,
  IOTA_TO_MYR_RATE
}
