import { test, expect } from '@playwright/test'

test.describe('Wallet Integration', () => {
  test('should connect wallet successfully', async ({ page }) => {
    await page.goto('/')
    
    // Click connect wallet button
    await page.click('button:has-text("Connect Wallet")')
    
    // Wait for connection success
    await expect(page.locator('text=Wallet connected successfully!')).toBeVisible()
    
    // Check wallet address is displayed
    await expect(page.locator('text=/0x[a-fA-F0-9]{4}\.\.\./')).toBeVisible()
    
    // Check balance is displayed
    await expect(page.locator('text=/\d+\.\d+ IOTA/')).toBeVisible()
  })

  test('should disconnect wallet', async ({ page }) => {
    await page.goto('/')
    
    // Connect first
    await page.click('button:has-text("Connect Wallet")')
    await expect(page.locator('text=Wallet connected successfully!')).toBeVisible()
    
    // Disconnect
    await page.click('text=Disconnect')
    await expect(page.locator('text=Wallet disconnected')).toBeVisible()
    
    // Check connect button is back
    await expect(page.locator('button:has-text("Connect Wallet")')).toBeVisible()
  })

  test('should persist wallet connection on page reload', async ({ page }) => {
    await page.goto('/')
    
    // Connect wallet
    await page.click('button:has-text("Connect Wallet")')
    await expect(page.locator('text=Wallet connected successfully!')).toBeVisible()
    
    // Reload page
    await page.reload()
    
    // Check wallet is still connected
    await expect(page.locator('text=/0x[a-fA-F0-9]{4}\.\.\./')).toBeVisible()
  })

  test('should show wallet required message for protected actions', async ({ page }) => {
    await page.goto('/recycler')
    
    // Try to post job without wallet
    await page.click('button:has-text("Post New Job")')
    await expect(page.locator('text=Please connect your wallet')).toBeVisible()
  })

  test('should update balance after transactions', async ({ page }) => {
    await page.goto('/')
    
    // Connect wallet
    await page.click('button:has-text("Connect Wallet")')
    await expect(page.locator('text=Wallet connected successfully!')).toBeVisible()
    
    // Get initial balance
    const initialBalance = await page.locator('text=/\d+\.\d+ IOTA/').textContent()
    
    // Perform a transaction (post job)
    await page.goto('/recycler')
    await page.click('button:has-text("Post New Job")')
    
    // Fill minimal form and submit
    await page.fill('input[placeholder*="Cardboard"]', 'Test job')
    await page.fill('textarea[placeholder*="Describe"]', 'Test description for automated test')
    await page.fill('input[placeholder*="5.0"]', '1')
    await page.fill('input[placeholder*="Kuala Lumpur"]', 'Test location')
    await page.fill('input[placeholder*="15.00"]', '5')
    
    // Mock file upload
    await page.setInputFiles('input[type="file"]', {
      name: 'test.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('fake-image-data')
    })
    
    await page.click('button:has-text("Post Job")')
    await expect(page.locator('text=Job posted successfully!')).toBeVisible()
    
    // Check balance has changed (gas fee deducted)
    const newBalance = await page.locator('text=/\d+\.\d+ IOTA/').textContent()
    expect(newBalance).not.toBe(initialBalance)
  })
})
