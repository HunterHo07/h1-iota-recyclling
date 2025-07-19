import { test, expect } from '@playwright/test'

test.describe('Job Lifecycle', () => {
  test.beforeEach(async ({ page }) => {
    // Connect wallet before each test
    await page.goto('/')
    await page.click('button:has-text("Connect Wallet")')
    await expect(page.locator('text=Wallet connected successfully!')).toBeVisible()
  })

  test('should complete full job lifecycle', async ({ page }) => {
    // Step 1: Post a job as recycler
    await page.goto('/recycler')
    await page.click('button:has-text("Post New Job")')
    
    // Fill job form
    await page.fill('input[placeholder*="Cardboard"]', 'E2E Test Cardboard Job')
    await page.fill('textarea[placeholder*="Describe"]', 'Automated test job for cardboard recycling')
    await page.selectOption('select', 'cardboard')
    await page.fill('input[placeholder*="5.0"]', '3.5')
    await page.fill('input[placeholder*="Kuala Lumpur"]', 'Test Location, KL')
    await page.fill('input[placeholder*="15.00"]', '12.50')
    
    // Mock file upload
    await page.setInputFiles('input[type="file"]', {
      name: 'cardboard.jpg',
      mimeType: 'image/jpeg',
      buffer: Buffer.from('test-cardboard-image')
    })
    
    await page.click('button:has-text("Post Job")')
    await expect(page.locator('text=Job posted successfully!')).toBeVisible()
    
    // Step 2: Switch to collector and claim job
    await page.click('button:has([class*="Toggle"])')
    await page.goto('/collector')
    
    // Find and claim the job
    await expect(page.locator('text=E2E Test Cardboard Job')).toBeVisible()
    await page.click('button:has-text("Claim Job")')
    await expect(page.locator('text=Job claimed successfully!')).toBeVisible()
    
    // Step 3: Complete the job
    await page.click('button[class*="tab"]:has-text("My Jobs")')
    await expect(page.locator('button:has-text("Complete Job")')).toBeVisible()
    await page.click('button:has-text("Complete Job")')
    await expect(page.locator('text=Job completed successfully!')).toBeVisible()
    
    // Step 4: Verify job status
    await expect(page.locator('text=completed')).toBeVisible()
  })

  test('should validate job posting form', async ({ page }) => {
    await page.goto('/recycler')
    await page.click('button:has-text("Post New Job")')
    
    // Try to submit empty form
    await page.click('button:has-text("Post Job")')
    
    // Check validation messages
    await expect(page.locator('text=Please add a photo')).toBeVisible()
    await expect(page.locator('text=Title is required')).toBeVisible()
    await expect(page.locator('text=Description is required')).toBeVisible()
    
    // Fill title with too short text
    await page.fill('input[placeholder*="Cardboard"]', 'Hi')
    await page.click('button:has-text("Post Job")')
    await expect(page.locator('text=Title must be at least 5 characters')).toBeVisible()
    
    // Test weight validation
    await page.fill('input[placeholder*="5.0"]', '0')
    await page.click('button:has-text("Post Job")')
    await expect(page.locator('text=Weight must be at least 0.1kg')).toBeVisible()
    
    // Test reward validation
    await page.fill('input[placeholder*="15.00"]', '0')
    await page.click('button:has-text("Post Job")')
    await expect(page.locator('text=Minimum reward is RM 1')).toBeVisible()
  })

  test('should filter and search jobs correctly', async ({ page }) => {
    await page.goto('/collector')
    
    // Test search functionality
    await page.fill('input[placeholder*="Search"]', 'cardboard')
    await page.waitForTimeout(500)
    
    // Check that only cardboard jobs are visible
    const jobCards = page.locator('.card-interactive')
    const count = await jobCards.count()
    
    if (count > 0) {
      for (let i = 0; i < count; i++) {
        const jobText = await jobCards.nth(i).textContent()
        expect(jobText.toLowerCase()).toContain('cardboard')
      }
    }
    
    // Test tab filtering
    await page.click('button:has-text("My Jobs")')
    await expect(page.locator('text=You haven\'t claimed any jobs yet')).toBeVisible()
    
    await page.click('button:has-text("Available")')
    // Should show available jobs again
  })

  test('should handle job claiming correctly', async ({ page }) => {
    await page.goto('/collector')
    
    // Check if there are available jobs
    const availableJobs = page.locator('button:has-text("Claim Job")')
    const jobCount = await availableJobs.count()
    
    if (jobCount > 0) {
      // Claim first available job
      await availableJobs.first().click()
      await expect(page.locator('text=Job claimed successfully!')).toBeVisible()
      
      // Check job moved to "My Jobs" tab
      await page.click('button:has-text("My Jobs")')
      await expect(page.locator('button:has-text("Complete Job")')).toBeVisible()
    }
  })

  test('should display job details correctly', async ({ page }) => {
    await page.goto('/recycler')
    
    // Check if there are any jobs
    const jobCards = page.locator('.card-interactive')
    const jobCount = await jobCards.count()
    
    if (jobCount > 0) {
      // Click on first job to view details
      await jobCards.first().click()
      
      // Should navigate to job details page
      await expect(page).toHaveURL(/\/job\/\d+/)
      
      // Check job details are displayed
      await expect(page.locator('h1')).toBeVisible()
      await expect(page.locator('text=Weight')).toBeVisible()
      await expect(page.locator('text=Reward')).toBeVisible()
      await expect(page.locator('text=Description')).toBeVisible()
    }
  })

  test('should handle role switching', async ({ page }) => {
    await page.goto('/recycler')
    await expect(page.locator('h1')).toContainText('Recycler Dashboard')
    
    // Switch to collector
    await page.click('button:has([class*="Toggle"])')
    await page.goto('/collector')
    await expect(page.locator('h1')).toContainText('Collector Dashboard')
    
    // Switch back to recycler
    await page.click('button:has([class*="Toggle"])')
    await page.goto('/recycler')
    await expect(page.locator('h1')).toContainText('Recycler Dashboard')
  })
})
