#!/usr/bin/env node

/**
 * 🧪 REAL IOTA WALLET TEST SCRIPT
 *
 * This script tests the real IOTA wallet functionality:
 * - Real wallet creation using IOTA SDK
 * - Real balance checking from IOTA network
 * - Real faucet token requests
 * - MetaMask Snap integration testing
 *
 * Note: This is a Node.js version with localStorage polyfill
 */

// Polyfill localStorage for Node.js
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null
  },
  setItem(key, value) {
    this.data[key] = value
  },
  removeItem(key) {
    delete this.data[key]
  },
  clear() {
    this.data = {}
  }
}

import { iotaClient } from '../src/utils/iotaClient.js'

console.log('🚀 IOTA WALLET INTEGRATION TEST')
console.log('================================')

async function testRealWalletCreation() {
  console.log('\n📝 Test 1: Real Wallet Creation')
  console.log('-------------------------------')
  
  try {
    await iotaClient.initialize()
    console.log('✅ IOTA client initialized')
    
    const result = await iotaClient.createNewWallet()
    
    if (result.success) {
      console.log('✅ Wallet creation successful!')
      console.log('📍 Address:', result.address)
      console.log('💰 Initial Balance:', result.balance)
      console.log('🔑 Has Mnemonic:', !!result.mnemonic)
      console.log('🌐 Is Real Wallet:', result.isReal)
      console.log('🎭 Is Demo Wallet:', result.isDemo)
      
      if (result.isReal) {
        console.log('🎉 SUCCESS: Real IOTA wallet created using IOTA SDK!')
      } else {
        console.log('⚠️  FALLBACK: Demo wallet created (IOTA SDK not available)')
      }
      
      return result
    } else {
      console.log('❌ Wallet creation failed:', result.error)
      return null
    }
  } catch (error) {
    console.log('❌ Test failed:', error.message)
    return null
  }
}

async function testRealBalanceCheck(address) {
  console.log('\n💰 Test 2: Real Balance Check')
  console.log('-----------------------------')
  
  try {
    const balance = await iotaClient.getBalance(address)
    console.log('✅ Balance check successful!')
    console.log('💰 Current Balance:', balance, 'IOTA')
    
    // Check if this is a real network query
    const realBalance = await iotaClient.getRealBalance(address)
    if (realBalance !== null) {
      console.log('🌐 Real network balance:', realBalance, 'IOTA')
      console.log('🎉 SUCCESS: Real balance retrieved from IOTA network!')
    } else {
      console.log('⚠️  FALLBACK: Using stored/demo balance')
    }
    
    return balance
  } catch (error) {
    console.log('❌ Balance check failed:', error.message)
    return 0
  }
}

async function testRealFaucetRequest(address) {
  console.log('\n🚰 Test 3: Real Faucet Request')
  console.log('------------------------------')
  
  try {
    console.log('🌐 Requesting tokens from real IOTA testnet faucet...')
    const success = await iotaClient.requestFaucetTokens(address)
    
    if (success) {
      console.log('✅ Faucet request successful!')
      console.log('⏳ Waiting for tokens to arrive...')
      
      // Wait and check balance
      await new Promise(resolve => setTimeout(resolve, 10000))
      
      const newBalance = await iotaClient.getBalance(address)
      console.log('💰 Updated Balance:', newBalance, 'IOTA')
      
      return true
    } else {
      console.log('⚠️  Faucet request failed or used fallback')
      return false
    }
  } catch (error) {
    console.log('❌ Faucet test failed:', error.message)
    return false
  }
}

async function testMetaMaskSnapConnection() {
  console.log('\n🦊 Test 4: MetaMask Snap Connection')
  console.log('-----------------------------------')
  
  try {
    const result = await iotaClient.connectMetaMaskSnap()
    
    if (result.success) {
      console.log('✅ MetaMask Snap connection successful!')
      console.log('📍 Address:', result.address)
      console.log('💰 Balance:', result.balance)
      console.log('🔗 Provider:', result.provider)
      console.log('🎉 SUCCESS: Real MetaMask Snap integration working!')
      return result
    } else {
      console.log('⚠️  MetaMask Snap connection failed:', result.error)
      console.log('💡 This is expected if MetaMask is not installed or IOTA Snap is not available')
      return null
    }
  } catch (error) {
    console.log('❌ MetaMask Snap test failed:', error.message)
    return null
  }
}

async function testExistingWalletConnection() {
  console.log('\n🔗 Test 5: Existing Wallet Connection')
  console.log('-------------------------------------')
  
  try {
    const result = await iotaClient.connectExistingWallet()
    
    if (result.success) {
      console.log('✅ Existing wallet connection successful!')
      console.log('📍 Address:', result.address)
      console.log('💰 Balance:', result.balance)
      console.log('🔗 Provider:', result.provider)
      return result
    } else {
      console.log('⚠️  No existing wallet found:', result.error)
      return null
    }
  } catch (error) {
    console.log('❌ Existing wallet test failed:', error.message)
    return null
  }
}

async function runAllTests() {
  console.log('🧪 Starting comprehensive IOTA wallet tests...\n')
  
  // Test 1: Create new wallet
  const wallet = await testRealWalletCreation()
  if (!wallet) {
    console.log('\n❌ Cannot continue tests without a wallet')
    return
  }
  
  // Test 2: Check balance
  await testRealBalanceCheck(wallet.address)
  
  // Test 3: Request faucet tokens
  await testRealFaucetRequest(wallet.address)
  
  // Test 4: MetaMask Snap (optional)
  await testMetaMaskSnapConnection()
  
  // Test 5: Existing wallet connection
  await testExistingWalletConnection()
  
  console.log('\n🎯 TEST SUMMARY')
  console.log('===============')
  console.log('✅ All tests completed!')
  console.log('📊 Check the results above to see which features are working with real IOTA integration')
  console.log('🌐 Real features will show "SUCCESS" messages')
  console.log('🎭 Demo/fallback features will show "FALLBACK" messages')
  console.log('\n💡 To test in browser:')
  console.log('   1. Run: npm run dev')
  console.log('   2. Open browser and check console for detailed logs')
  console.log('   3. Try "Create New Account" and "Connect Wallet" buttons')
}

// Run tests
runAllTests().catch(console.error)
