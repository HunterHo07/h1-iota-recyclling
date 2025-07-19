import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test('should display hero section correctly', async ({ page }) => {
    await page.goto('/')
    
    // Check hero title
    await expect(page.locator('h1')).toContainText('Turn Your Trash Into Cash')
    
    // Check CTA buttons
    await expect(page.locator('text=I Have Recyclables')).toBeVisible()
    await expect(page.locator('text=I\'ll Collect Them')).toBeVisible()
    
    // Check stats banner
    await expect(page.locator('text=Jobs Posted')).toBeVisible()
    await expect(page.locator('text=Total Earned')).toBeVisible()
  })

  test('should navigate to recycler dashboard', async ({ page }) => {
    await page.goto('/')
    
    await page.click('text=I Have Recyclables')
    await expect(page).toHaveURL('/recycler')
    await expect(page.locator('h1')).toContainText('Recycler Dashboard')
  })

  test('should navigate to collector dashboard', async ({ page }) => {
    await page.goto('/')
    
    await page.click('text=I\'ll Collect Them')
    await expect(page).toHaveURL('/collector')
    await expect(page.locator('h1')).toContainText('Collector Dashboard')
  })

  test('should display features section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=Why Choose IOTA Recycling?')).toBeVisible()
    await expect(page.locator('text=Easy Posting')).toBeVisible()
    await expect(page.locator('text=Quick Pickup')).toBeVisible()
    await expect(page.locator('text=Earn Rewards')).toBeVisible()
    await expect(page.locator('text=Blockchain Trust')).toBeVisible()
  })

  test('should display how it works section', async ({ page }) => {
    await page.goto('/')
    
    await expect(page.locator('text=How It Works')).toBeVisible()
    await expect(page.locator('text=Post Your Recyclables')).toBeVisible()
    await expect(page.locator('text=Collector Claims Job')).toBeVisible()
    await expect(page.locator('text=Pickup & Payment')).toBeVisible()
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('/')
    
    // Check mobile menu button exists
    await expect(page.locator('button[aria-label="Menu"]')).toBeVisible()
    
    // Check hero content is still visible
    await expect(page.locator('h1')).toBeVisible()
    await expect(page.locator('text=I Have Recyclables')).toBeVisible()
  })
})
