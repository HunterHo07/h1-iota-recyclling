# 🔗 REAL IOTA WALLET TESTING GUIDE

This guide will help you test the **real IOTA wallet functionality** that has been implemented to replace the dummy/mock wallet system.

## 🎯 What's Been Fixed

### ✅ Real IOTA Wallet Creation
- Uses actual IOTA SDK (`@iota/crypto.js`, `@iota/util.js`) 
- Generates real IOTA addresses and mnemonics
- Creates wallets that work on IOTA testnet

### ✅ Real Network Balance Checking  
- Queries actual IOTA testnet nodes
- Uses `@iota/iota.js` to fetch real balances
- Falls back to demo balance if network unavailable

### ✅ Real Faucet Integration
- Makes actual HTTP requests to IOTA Shimmer testnet faucet
- Requests real testnet tokens
- Handles faucet responses and errors

### ✅ Enhanced MetaMask Snap Support
- Improved MetaMask detection and error handling
- Better IOTA Snap installation flow
- Real address retrieval from MetaMask Snap

## 🧪 Testing Methods

### Method 1: Automated Test Script

```bash
# Run the automated wallet test
npm run test:wallet
```

This will test:
- ✅ Real wallet creation with IOTA SDK
- ✅ Real balance checking from IOTA network  
- ✅ Real faucet token requests
- ✅ MetaMask Snap integration
- ✅ Existing wallet connection

### Method 2: Browser Testing

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Open browser and navigate to the app**

3. **Test "Create New Account":**
   - Click "Create New Account" button
   - Check browser console for detailed logs
   - Look for "✅ REAL IOTA WALLET" messages
   - Verify mnemonic backup popup appears
   - Check if real testnet tokens are requested

4. **Test "Connect Wallet":**
   - Click "Connect Wallet" button  
   - If MetaMask installed, it should try IOTA Snap
   - Check console for connection details
   - Verify real balance is fetched

## 🔍 How to Verify Real vs Demo

### Real IOTA Wallet Indicators:
- ✅ Console shows: "✅ REAL IOTA WALLET: Generated using IOTA cryptography"
- ✅ Toast shows: "Real IOTA wallet created!"
- ✅ Address starts with `smr1` (Shimmer testnet format)
- ✅ Mnemonic backup popup appears
- ✅ Real faucet request is made
- ✅ Balance queries actual IOTA network

### Demo/Fallback Indicators:
- ⚠️ Console shows: "⚠️ DEMO MODE: This is a demo wallet"
- ⚠️ Toast shows: "Demo IOTA account created!"
- ⚠️ Address is randomly generated
- ⚠️ Balance is stored in localStorage
- ⚠️ Faucet is simulated

## 🦊 MetaMask Snap Testing

### Prerequisites:
1. Install MetaMask browser extension
2. Make sure you're on a supported browser (Chrome, Firefox, Edge)

### Testing Steps:
1. Click "Connect Wallet"
2. MetaMask should prompt to install IOTA Snap
3. Approve the Snap installation
4. Grant permissions for IOTA address access
5. Verify real IOTA address is retrieved

### Expected Results:
- ✅ MetaMask popup appears
- ✅ IOTA Snap installs successfully  
- ✅ Real IOTA testnet address is returned
- ✅ Toast shows "Connected via MetaMask Snap!"

## 🌐 Network Requirements

### For Real Functionality:
- Internet connection required
- Access to `https://api.testnet.shimmer.network`
- Access to `https://faucet.testnet.shimmer.network`

### Fallback Behavior:
- If network unavailable → Demo mode
- If IOTA SDK fails → Demo wallet
- If faucet fails → Demo balance

## 🔧 Troubleshooting

### Issue: "Demo mode" instead of real wallet
**Cause:** IOTA SDK not loading properly
**Solution:** 
- Check internet connection
- Verify IOTA packages are installed: `npm install`
- Check browser console for import errors

### Issue: MetaMask Snap not working
**Cause:** MetaMask not installed or Snap not supported
**Solution:**
- Install MetaMask browser extension
- Update to latest MetaMask version
- Try on supported browser (Chrome recommended)

### Issue: Faucet requests failing
**Cause:** Faucet rate limiting or network issues
**Solution:**
- Wait a few minutes between requests
- Check if faucet is operational
- Fallback to demo balance will be used

### Issue: Balance shows 0 for real wallet
**Cause:** New wallet hasn't received faucet tokens yet
**Solution:**
- Wait 30-60 seconds after wallet creation
- Faucet tokens take time to process
- Check balance again after a few minutes

## 📊 Success Criteria

### ✅ Real Wallet Success:
1. Console shows "REAL IOTA WALLET" messages
2. Address format is `smr1...` (Shimmer testnet)
3. Mnemonic backup is shown to user
4. Real faucet request is attempted
5. Balance queries actual IOTA network
6. MetaMask Snap integration works (if MetaMask installed)

### ⚠️ Acceptable Fallbacks:
1. Demo mode if IOTA SDK unavailable
2. Demo balance if network unreachable
3. Manual connection if MetaMask unavailable

## 🚀 Next Steps

After confirming real wallet functionality:

1. **Test Transactions:** Try sending IOTA between wallets
2. **Test Persistence:** Refresh page and reconnect wallet
3. **Test Multiple Wallets:** Create and switch between wallets
4. **Test Error Handling:** Disconnect network and verify fallbacks

## 📝 Reporting Issues

If you encounter issues:

1. Check browser console for error messages
2. Run `npm run test:wallet` for detailed diagnostics
3. Verify network connectivity to IOTA testnet
4. Check if MetaMask is properly installed and updated

The wallet system now provides **real IOTA blockchain integration** while maintaining **robust fallbacks** for demo purposes!
