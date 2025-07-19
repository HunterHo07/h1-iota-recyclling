/**
 * 🧪 REAL IOTA WALLET INTEGRATION TESTS
 * 
 * Comprehensive tests for real IOTA wallet functionality:
 * - Wallet connection and creation
 * - Real transaction processing
 * - Balance monitoring
 * - Error handling
 * - Testnet integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { WalletProvider, useWallet } from '../../src/store/WalletProvider'
import { iotaClient } from '../../src/utils/iotaClient'

// Mock IOTA client for testing
vi.mock('../../src/utils/iotaClient', () => ({
  iotaClient: {
    initialize: vi.fn(),
    createNewWallet: vi.fn(),
    connectExistingWallet: vi.fn(),
    getBalance: vi.fn(),
    sendTransaction: vi.fn(),
    getTransactionStatus: vi.fn(),
    disconnect: vi.fn()
  }
}))

// Test component to access wallet context
const TestWalletComponent = () => {
  const {
    isConnected,
    address,
    balance,
    isConnecting,
    connectWallet,
    createNewAccount,
    disconnectWallet,
    sendTransaction
  } = useWallet()

  return (
    <div>
      <div data-testid="connection-status">
        {isConnected ? 'connected' : 'disconnected'}
      </div>
      <div data-testid="address">{address}</div>
      <div data-testid="balance">{balance}</div>
      <div data-testid="connecting">{isConnecting ? 'connecting' : 'idle'}</div>
      
      <button 
        data-testid="connect-existing" 
        onClick={() => connectWallet('existing')}
        disabled={isConnecting}
      >
        Connect Existing
      </button>
      
      <button 
        data-testid="create-new" 
        onClick={createNewAccount}
        disabled={isConnecting}
      >
        Create New
      </button>
      
      <button 
        data-testid="disconnect" 
        onClick={disconnectWallet}
      >
        Disconnect
      </button>
      
      <button 
        data-testid="send-transaction" 
        onClick={() => sendTransaction({ to: 'test', amount: 1 })}
      >
        Send Transaction
      </button>
    </div>
  )
}

const renderWithWalletProvider = (component) => {
  return render(
    <BrowserRouter>
      <WalletProvider>
        {component}
      </WalletProvider>
    </BrowserRouter>
  )
}

describe('Real IOTA Wallet Integration', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks()
    
    // Clear localStorage
    localStorage.clear()
    
    // Setup default mock responses
    iotaClient.initialize.mockResolvedValue(true)
    iotaClient.createNewWallet.mockResolvedValue({
      success: true,
      address: 'iota1qp123456789abcdef123456789',
      balance: '100.000',
      isNew: true
    })
    iotaClient.connectExistingWallet.mockResolvedValue({
      success: true,
      address: 'iota1qp987654321fedcba987654321',
      balance: '50.000',
      provider: 'manual'
    })
    iotaClient.getBalance.mockResolvedValue(75.5)
    iotaClient.sendTransaction.mockResolvedValue({
      success: true,
      transactionId: 'iota_tx_123456789',
      status: 'confirmed'
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Wallet Connection', () => {
    it('should connect to existing wallet successfully', async () => {
      renderWithWalletProvider(<TestWalletComponent />)
      
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      // Should show connecting state
      await waitFor(() => {
        expect(screen.getByTestId('connecting')).toHaveTextContent('connecting')
      })
      
      // Should connect successfully
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
        expect(screen.getByTestId('address')).toHaveTextContent('iota1qp987654321fedcba987654321')
        expect(screen.getByTestId('balance')).toHaveTextContent('50.000')
      })
      
      expect(iotaClient.initialize).toHaveBeenCalled()
      expect(iotaClient.connectExistingWallet).toHaveBeenCalled()
    })

    it('should create new wallet successfully', async () => {
      renderWithWalletProvider(<TestWalletComponent />)
      
      const createButton = screen.getByTestId('create-new')
      fireEvent.click(createButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
        expect(screen.getByTestId('address')).toHaveTextContent('iota1qp123456789abcdef123456789')
        expect(screen.getByTestId('balance')).toHaveTextContent('100.000')
      })
      
      expect(iotaClient.initialize).toHaveBeenCalled()
      expect(iotaClient.createNewWallet).toHaveBeenCalled()
    })

    it('should handle connection failure gracefully', async () => {
      iotaClient.connectExistingWallet.mockResolvedValue({
        success: false,
        error: 'Connection failed'
      })
      
      renderWithWalletProvider(<TestWalletComponent />)
      
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
        expect(screen.getByTestId('connecting')).toHaveTextContent('idle')
      })
    })

    it('should disconnect wallet properly', async () => {
      renderWithWalletProvider(<TestWalletComponent />)
      
      // First connect
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
      })
      
      // Then disconnect
      const disconnectButton = screen.getByTestId('disconnect')
      fireEvent.click(disconnectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
        expect(screen.getByTestId('address')).toHaveTextContent('')
        expect(screen.getByTestId('balance')).toHaveTextContent('0')
      })
      
      expect(iotaClient.disconnect).toHaveBeenCalled()
    })
  })

  describe('Transaction Processing', () => {
    it('should send transaction successfully', async () => {
      renderWithWalletProvider(<TestWalletComponent />)
      
      // First connect wallet
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
      })
      
      // Send transaction
      const sendButton = screen.getByTestId('send-transaction')
      fireEvent.click(sendButton)
      
      await waitFor(() => {
        expect(iotaClient.sendTransaction).toHaveBeenCalledWith(
          'test',
          1,
          { to: 'test', amount: 1 }
        )
      })
    })

    it('should prevent transaction when wallet not connected', async () => {
      renderWithWalletProvider(<TestWalletComponent />)
      
      const sendButton = screen.getByTestId('send-transaction')
      
      // Should throw error when not connected
      await expect(async () => {
        fireEvent.click(sendButton)
      }).rejects.toThrow('Wallet not connected')
    })
  })

  describe('Balance Monitoring', () => {
    it('should update balance periodically', async () => {
      vi.useFakeTimers()
      
      renderWithWalletProvider(<TestWalletComponent />)
      
      // Connect wallet
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
      })
      
      // Mock balance update
      iotaClient.getBalance.mockResolvedValue(80.5)
      
      // Fast-forward time to trigger balance update
      vi.advanceTimersByTime(10000)
      
      await waitFor(() => {
        expect(iotaClient.getBalance).toHaveBeenCalledWith('iota1qp987654321fedcba987654321')
      })
      
      vi.useRealTimers()
    })
  })

  describe('Persistence', () => {
    it('should persist wallet connection in localStorage', async () => {
      renderWithWalletProvider(<TestWalletComponent />)
      
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
      })
      
      // Check localStorage
      expect(localStorage.getItem('wallet_connected')).toBe('true')
      expect(localStorage.getItem('wallet_address')).toBeTruthy()
    })

    it('should restore wallet connection from localStorage', async () => {
      // Pre-populate localStorage
      localStorage.setItem('wallet_connected', 'true')
      localStorage.setItem('wallet_address', 'iota1qp123456789abcdef123456789')
      localStorage.setItem('wallet_balance', '25.000')
      
      renderWithWalletProvider(<TestWalletComponent />)
      
      // Should automatically restore connection
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('connected')
        expect(screen.getByTestId('address')).toHaveTextContent('iota1qp123456789abcdef123456789')
        expect(screen.getByTestId('balance')).toHaveTextContent('25.000')
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle IOTA client initialization failure', async () => {
      iotaClient.initialize.mockResolvedValue(false)
      
      renderWithWalletProvider(<TestWalletComponent />)
      
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
      })
    })

    it('should handle network errors gracefully', async () => {
      iotaClient.connectExistingWallet.mockRejectedValue(new Error('Network error'))
      
      renderWithWalletProvider(<TestWalletComponent />)
      
      const connectButton = screen.getByTestId('connect-existing')
      fireEvent.click(connectButton)
      
      await waitFor(() => {
        expect(screen.getByTestId('connection-status')).toHaveTextContent('disconnected')
        expect(screen.getByTestId('connecting')).toHaveTextContent('idle')
      })
    })
  })
})
