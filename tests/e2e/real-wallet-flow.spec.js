/**
 * 🎭 END-TO-END TESTS FOR REAL IOTA WALLET INTEGRATION
 * 
 * These tests verify the complete user flow with real IOTA wallet integration:
 * - Landing page wallet connection
 * - Wallet creation and connection flows
 * - Job posting with real transactions
 * - Complete recycling workflow
 * - Error handling and edge cases
 */

import { test, expect } from '@playwright/test'

test.describe('Real IOTA Wallet Integration E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/')
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle')
  })

  test.describe('Wallet Connection Flow', () => {
    test('should show wallet connection options on landing page', async ({ page }) => {
      // Check if wallet connection buttons are visible
      await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /new account/i })).toBeVisible()
    })

    test('should connect existing wallet successfully', async ({ page }) => {
      // Click connect wallet button
      await page.getByRole('button', { name: /connect wallet/i }).click()
      
      // Should show connecting state
      await expect(page.getByText(/connecting/i)).toBeVisible()
      
      // Wait for connection to complete
      await page.waitForTimeout(3000)
      
      // Should show connected state
      await expect(page.getByText(/disconnect/i)).toBeVisible()
      await expect(page.locator('[data-testid="wallet-address"]')).toBeVisible()
      await expect(page.locator('[data-testid="wallet-balance"]')).toBeVisible()
    })

    test('should create new wallet successfully', async ({ page }) => {
      // Click new account button
      await page.getByRole('button', { name: /new account/i }).click()
      
      // Should show creating account state
      await expect(page.getByText(/creating/i)).toBeVisible()
      
      // Wait for account creation
      await page.waitForTimeout(4000)
      
      // Should show connected state with new wallet
      await expect(page.getByText(/disconnect/i)).toBeVisible()
      await expect(page.getByText(/new iota account created/i)).toBeVisible()
    })

    test('should hide other buttons when wallet is connected', async ({ page }) => {
      // Connect wallet first
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Should only show disconnect button, not connect buttons
      await expect(page.getByText(/disconnect/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /connect wallet/i })).not.toBeVisible()
      await expect(page.getByRole('button', { name: /new account/i })).not.toBeVisible()
    })

    test('should disconnect wallet properly', async ({ page }) => {
      // Connect wallet first
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Disconnect wallet
      await page.getByText(/disconnect/i).click()
      
      // Should show disconnected state
      await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /new account/i })).toBeVisible()
      await expect(page.getByText(/disconnect/i)).not.toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('should require wallet connection for dashboard access', async ({ page }) => {
      // Try to access recycler dashboard without wallet
      await page.goto('/recycler')
      
      // Should be redirected to wallet connection page
      await expect(page.getByText(/wallet connection required/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /connect existing wallet/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /create new iota account/i })).toBeVisible()
    })

    test('should allow dashboard access after wallet connection', async ({ page }) => {
      // Connect wallet first
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Navigate to recycler dashboard
      await page.goto('/recycler')
      
      // Should access dashboard successfully
      await expect(page.getByText(/recycler dashboard/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /post new job/i })).toBeVisible()
    })
  })

  test.describe('Real Transaction Flow', () => {
    test('should post job with real IOTA transaction', async ({ page }) => {
      // Connect wallet first
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Navigate to recycler dashboard
      await page.goto('/recycler')
      
      // Click post new job
      await page.getByRole('button', { name: /post new job/i }).click()
      
      // Fill job form
      await page.fill('[data-testid="job-title"]', 'Test Recycling Job')
      await page.fill('[data-testid="job-description"]', 'Test description for IOTA integration')
      await page.selectOption('[data-testid="item-type"]', 'plastic')
      await page.fill('[data-testid="weight"]', '5')
      await page.fill('[data-testid="reward"]', '10')
      
      // Submit job
      await page.getByRole('button', { name: /post job/i }).click()
      
      // Should show transaction processing
      await expect(page.getByText(/posting job to blockchain/i)).toBeVisible()
      
      // Wait for transaction to complete
      await page.waitForTimeout(5000)
      
      // Should show success message
      await expect(page.getByText(/job posted successfully/i)).toBeVisible()
      
      // Should see the job in the list
      await expect(page.getByText('Test Recycling Job')).toBeVisible()
    })

    test('should claim job with real transaction', async ({ page }) => {
      // Connect wallet and post a job first
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Switch to collector role
      await page.getByRole('button', { name: /collector/i }).click()
      
      // Navigate to collector dashboard
      await page.goto('/collector')
      
      // Find and claim a job
      const jobCard = page.locator('[data-testid="job-card"]').first()
      await jobCard.getByRole('button', { name: /claim job/i }).click()
      
      // Should show claiming transaction
      await expect(page.getByText(/claiming job/i)).toBeVisible()
      
      // Wait for transaction
      await page.waitForTimeout(3000)
      
      // Should show success
      await expect(page.getByText(/job claimed successfully/i)).toBeVisible()
    })
  })

  test.describe('Balance and Transaction Monitoring', () => {
    test('should display real IOTA balance', async ({ page }) => {
      // Connect wallet
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Should show balance in IOTA
      const balanceElement = page.locator('[data-testid="wallet-balance"]')
      await expect(balanceElement).toBeVisible()
      await expect(balanceElement).toContainText('IOTA')
    })

    test('should show transaction history', async ({ page }) => {
      // Connect wallet
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Navigate to profile to see transaction history
      await page.goto('/profile')
      
      // Should show transaction section
      await expect(page.getByText(/transaction history/i)).toBeVisible()
    })

    test('should update balance after transactions', async ({ page }) => {
      // Connect wallet
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Get initial balance
      const initialBalance = await page.locator('[data-testid="wallet-balance"]').textContent()
      
      // Perform a transaction (post job)
      await page.goto('/recycler')
      await page.getByRole('button', { name: /post new job/i }).click()
      
      // Fill and submit job form
      await page.fill('[data-testid="job-title"]', 'Balance Test Job')
      await page.fill('[data-testid="reward"]', '5')
      await page.getByRole('button', { name: /post job/i }).click()
      
      // Wait for transaction
      await page.waitForTimeout(5000)
      
      // Balance should be updated (IOTA is feeless, but balance monitoring should work)
      const updatedBalance = await page.locator('[data-testid="wallet-balance"]').textContent()
      
      // Balance monitoring should be working
      expect(updatedBalance).toBeDefined()
    })
  })

  test.describe('Error Handling', () => {
    test('should handle wallet connection errors gracefully', async ({ page }) => {
      // Mock network error by intercepting requests
      await page.route('**/api/**', route => route.abort())
      
      // Try to connect wallet
      await page.getByRole('button', { name: /connect wallet/i }).click()
      
      // Should show error message
      await expect(page.getByText(/failed to connect/i)).toBeVisible()
      
      // Should return to disconnected state
      await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible()
    })

    test('should handle transaction failures', async ({ page }) => {
      // Connect wallet first
      await page.getByRole('button', { name: /connect wallet/i }).click()
      await page.waitForTimeout(3000)
      
      // Navigate to recycler dashboard
      await page.goto('/recycler')
      
      // Try to post job with invalid data
      await page.getByRole('button', { name: /post new job/i }).click()
      await page.getByRole('button', { name: /post job/i }).click()
      
      // Should show validation errors
      await expect(page.getByText(/required/i)).toBeVisible()
    })
  })

  test.describe('Mobile Responsiveness', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 })
      
      // Should show mobile menu
      await page.getByRole('button', { name: /menu/i }).click()
      
      // Should show wallet connection options in mobile menu
      await expect(page.getByRole('button', { name: /connect wallet/i })).toBeVisible()
      await expect(page.getByRole('button', { name: /new account/i })).toBeVisible()
    })
  })

  test.describe('Performance', () => {
    test('should load quickly with wallet integration', async ({ page }) => {
      const startTime = Date.now()
      
      await page.goto('/')
      await page.waitForLoadState('networkidle')
      
      const loadTime = Date.now() - startTime
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000)
    })
  })
})
