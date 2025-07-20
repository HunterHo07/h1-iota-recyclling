/**
 * 💾 SIMPLE DATABASE LAYER
 * 
 * For hackathon demo, we use localStorage as a simple database
 * In production, this would connect to a real database (MongoDB, PostgreSQL, etc.)
 */

class SimpleDatabase {
  constructor() {
    this.prefix = 'grab_recycle_'
    this.initialize()
  }

  initialize() {
    // Initialize default data if not exists
    if (!this.get('jobs')) {
      this.set('jobs', this.getDemoJobs())
    }
    if (!this.get('users')) {
      this.set('users', {})
    }
    if (!this.get('transactions')) {
      this.set('transactions', [])
    }
    if (!this.get('stats')) {
      this.set('stats', {
        totalJobs: 8,
        completedJobs: 3,
        totalRewards: 156,
        activeUsers: 12
      })
    }
  }

  // Demo data for development/testing
  getDemoJobs() {
    return [
      {
        id: 'demo_1',
        title: 'Office Cardboard Collection',
        description: 'Large amount of clean cardboard boxes from office relocation. Easy pickup from ground floor.',
        itemType: 'cardboard',
        weight: 25,
        reward: 18,
        location: 'KLCC, Kuala Lumpur',
        status: 'posted',
        poster: 'demo_recycler_1',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        urgency: 'medium',
        images: []
      },
      {
        id: 'demo_2',
        title: 'Plastic Bottles - Restaurant',
        description: 'Clean plastic bottles from restaurant. Available for pickup after 6 PM.',
        itemType: 'plastic',
        weight: 12,
        reward: 8,
        location: 'Mont Kiara, KL',
        status: 'posted',
        poster: 'demo_recycler_2',
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        urgency: 'low',
        images: []
      },
      {
        id: 'demo_3',
        title: 'Electronics Recycling',
        description: 'Old laptops, phones, and cables. Proper e-waste disposal needed.',
        itemType: 'electronics',
        weight: 8,
        reward: 35,
        location: 'Bangsar, KL',
        status: 'posted',
        poster: 'demo_recycler_3',
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
        urgency: 'high',
        images: []
      },
      {
        id: 'demo_4',
        title: 'Glass Bottles Collection',
        description: 'Wine and beer bottles from event. Clean and sorted.',
        itemType: 'glass',
        weight: 30,
        reward: 22,
        location: 'Petaling Jaya, Malaysia',
        status: 'posted',
        poster: 'demo_recycler_4',
        createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        urgency: 'medium',
        images: []
      },
      {
        id: 'demo_5',
        title: 'Metal Cans - Cafe',
        description: 'Aluminum cans from busy cafe. Daily collection available.',
        itemType: 'metal',
        weight: 15,
        reward: 12,
        location: 'Subang Jaya',
        status: 'posted',
        poster: 'demo_recycler_5',
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        urgency: 'low',
        images: []
      },
      {
        id: 'demo_6',
        title: 'Paper Waste - School',
        description: 'Clean paper waste from school office. Large quantity available.',
        itemType: 'paper',
        weight: 40,
        reward: 28,
        location: 'Shah Alam',
        status: 'posted',
        poster: 'demo_recycler_6',
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
        urgency: 'medium',
        images: []
      }
    ]
  }

  // Generic storage methods
  set(key, value) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value))
  }

  get(key) {
    const item = localStorage.getItem(this.prefix + key)
    return item ? JSON.parse(item) : null
  }

  // Job management
  async createJob(jobData) {
    const jobs = this.get('jobs') || []
    const newJob = {
      id: Date.now().toString(),
      ...jobData,
      status: 'posted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    jobs.push(newJob)
    this.set('jobs', jobs)
    
    // Update stats
    const stats = this.get('stats')
    stats.totalJobs += 1
    this.set('stats', stats)
    
    return newJob
  }

  async getJobs(filters = {}) {
    const jobs = this.get('jobs') || []
    
    if (filters.status) {
      return jobs.filter(job => job.status === filters.status)
    }
    
    if (filters.poster) {
      return jobs.filter(job => job.poster === filters.poster)
    }
    
    if (filters.collector) {
      return jobs.filter(job => job.collector === filters.collector)
    }
    
    return jobs
  }

  async updateJob(jobId, updates) {
    const jobs = this.get('jobs') || []
    const jobIndex = jobs.findIndex(job => job.id === jobId)
    
    if (jobIndex === -1) {
      throw new Error('Job not found')
    }
    
    jobs[jobIndex] = {
      ...jobs[jobIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.set('jobs', jobs)
    return jobs[jobIndex]
  }

  async deleteJob(jobId) {
    const jobs = this.get('jobs') || []
    const filteredJobs = jobs.filter(job => job.id !== jobId)
    this.set('jobs', filteredJobs)
    return true
  }

  // User management
  async createUser(userData) {
    const users = this.get('users') || {}
    const userId = userData.address || Date.now().toString()
    
    users[userId] = {
      id: userId,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.set('users', users)
    return users[userId]
  }

  async getUser(userId) {
    const users = this.get('users') || {}
    return users[userId] || null
  }

  async updateUser(userId, updates) {
    const users = this.get('users') || {}
    
    if (!users[userId]) {
      throw new Error('User not found')
    }
    
    users[userId] = {
      ...users[userId],
      ...updates,
      updatedAt: new Date().toISOString()
    }
    
    this.set('users', users)
    return users[userId]
  }

  // Transaction management
  async createTransaction(transactionData) {
    const transactions = this.get('transactions') || []
    const newTransaction = {
      id: Date.now().toString(),
      ...transactionData,
      createdAt: new Date().toISOString()
    }
    
    transactions.push(newTransaction)
    this.set('transactions', transactions)
    
    return newTransaction
  }

  async getTransactions(filters = {}) {
    const transactions = this.get('transactions') || []
    
    if (filters.address) {
      return transactions.filter(tx => 
        tx.from === filters.address || tx.to === filters.address
      )
    }
    
    if (filters.type) {
      return transactions.filter(tx => tx.type === filters.type)
    }
    
    return transactions
  }

  // Stats management
  async getStats() {
    return this.get('stats') || {
      totalJobs: 0,
      completedJobs: 0,
      totalRewards: 0,
      activeUsers: 0
    }
  }

  async updateStats(updates) {
    const stats = this.get('stats') || {}
    const newStats = { ...stats, ...updates }
    this.set('stats', newStats)
    return newStats
  }

  // Utility methods
  async clearAll() {
    const keys = Object.keys(localStorage).filter(key => 
      key.startsWith(this.prefix)
    )
    keys.forEach(key => localStorage.removeItem(key))
    this.initialize()
  }

  async exportData() {
    return {
      jobs: this.get('jobs'),
      users: this.get('users'),
      transactions: this.get('transactions'),
      stats: this.get('stats'),
      exportedAt: new Date().toISOString()
    }
  }

  async importData(data) {
    if (data.jobs) this.set('jobs', data.jobs)
    if (data.users) this.set('users', data.users)
    if (data.transactions) this.set('transactions', data.transactions)
    if (data.stats) this.set('stats', data.stats)
  }

  // Search functionality
  async searchJobs(query) {
    const jobs = this.get('jobs') || []
    const searchTerm = query.toLowerCase()
    
    return jobs.filter(job => 
      job.title.toLowerCase().includes(searchTerm) ||
      job.description.toLowerCase().includes(searchTerm) ||
      job.itemType.toLowerCase().includes(searchTerm) ||
      job.location.toLowerCase().includes(searchTerm)
    )
  }

  // Analytics
  async getAnalytics() {
    const jobs = this.get('jobs') || []
    const users = this.get('users') || {}
    const transactions = this.get('transactions') || []
    
    return {
      totalJobs: jobs.length,
      completedJobs: jobs.filter(job => job.status === 'completed').length,
      activeJobs: jobs.filter(job => job.status === 'posted' || job.status === 'claimed').length,
      totalUsers: Object.keys(users).length,
      totalTransactions: transactions.length,
      totalVolume: transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0),
      averageJobReward: jobs.length > 0 ? 
        jobs.reduce((sum, job) => sum + (job.reward || 0), 0) / jobs.length : 0,
      jobsByType: jobs.reduce((acc, job) => {
        acc[job.itemType] = (acc[job.itemType] || 0) + 1
        return acc
      }, {}),
      recentActivity: transactions.slice(-10).reverse()
    }
  }
}

// Export singleton instance
export const database = new SimpleDatabase()
export default database
