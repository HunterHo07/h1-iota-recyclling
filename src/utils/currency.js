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
  return iotaAmount * IOTA_TO_MYR_RATE
}

/**
 * Convert Malaysian Ringgit to IOTA
 */
export const myrToIOTA = (myrAmount) => {
  if (!myrAmount || isNaN(myrAmount)) return 0
  return myrAmount / IOTA_TO_MYR_RATE
}

/**
 * Format IOTA amount with currency symbol
 */
export const formatIOTA = (amount, decimals = 3) => {
  if (!amount || isNaN(amount)) return '0.000 IOTA'
  return `${parseFloat(amount).toFixed(decimals)} IOTA`
}

/**
 * Format MYR amount with currency symbol
 */
export const formatMYR = (amount, decimals = 2) => {
  if (!amount || isNaN(amount)) return 'RM 0.00'
  return `RM ${parseFloat(amount).toFixed(decimals)}`
}

/**
 * Format dual currency display (IOTA + MYR equivalent)
 */
export const formatDualCurrency = (iotaAmount, showIOTAFirst = true) => {
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
  className = '' 
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
