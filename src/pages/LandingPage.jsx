import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Recycle, 
  Smartphone, 
  Truck, 
  Coins, 
  Shield, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Play
} from 'lucide-react'
import { useAppState } from '@store/AppStateProvider'

const LandingPage = () => {
  const { stats } = useAppState()

  const features = [
    {
      icon: Smartphone,
      title: 'Easy Posting',
      description: 'Snap a photo, add details, set your reward. Post recyclables in under 2 minutes.'
    },
    {
      icon: Truck,
      title: 'Quick Pickup',
      description: 'Local collectors see your post and come to you. No more trips to recycling centers.'
    },
    {
      icon: Coins,
      title: 'Earn Rewards',
      description: 'Get paid in IOTA tokens for your recyclables. Turn trash into cash instantly.'
    },
    {
      icon: Shield,
      title: 'Blockchain Trust',
      description: 'Smart contracts ensure fair payments. Transparent, secure, and trustless.'
    }
  ]

  const steps = [
    {
      number: '01',
      title: 'Post Your Recyclables',
      description: 'Take a photo, describe your items, and set a reward amount.',
      image: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=400&h=300&fit=crop'
    },
    {
      number: '02',
      title: 'Collector Claims Job',
      description: 'Local collectors browse and claim your recycling job.',
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
    },
    {
      number: '03',
      title: 'Pickup & Payment',
      description: 'Collector picks up items, completes job, and gets paid automatically.',
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop&auto=format'
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary-50 via-white to-secondary-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Turn Your{' '}
                <span className="text-primary-600">Trash</span>{' '}
                Into{' '}
                <span className="text-accent-600">Cash</span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Recycling pickup as easy as ordering food delivery. 
                Post recyclables, get them picked up, and earn IOTA tokens.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link
                  to="/recycler"
                  className="btn-primary flex items-center justify-center group"
                >
                  <Smartphone className="h-6 w-6 mr-3" />
                  I Have Recyclables
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  to="/collector"
                  className="btn-secondary flex items-center justify-center group"
                >
                  <Truck className="h-6 w-6 mr-3" />
                  I'll Collect Them
                  <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              {/* Roadmap Button */}
              <div className="flex justify-center mb-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    document.querySelector('#roadmap-section')?.scrollIntoView({
                      behavior: 'smooth'
                    })
                  }}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <span className="mr-2">🚀</span>
                  View Roadmap: Reusable Items Coming Soon
                  <ArrowRight className="h-4 w-4 ml-2" />
                </motion.button>
              </div>

              {/* Stats Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
              >
                <div className="grid grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600 mb-1">
                      {stats.totalJobs}
                    </div>
                    <div className="text-sm text-gray-600">Jobs Posted</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary-600 mb-1">
                      RM {stats.totalEarned.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Earned</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-600 mb-1">
                      {stats.activeCollectors}
                    </div>
                    <div className="text-sm text-gray-600">Active Collectors</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column - Visual */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&h=400&fit=crop"
                  alt="Recycling in action"
                  className="rounded-2xl shadow-2xl"
                />
                
                {/* Floating Elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-6 -right-6 bg-white rounded-xl shadow-lg p-4"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-gray-700">Live Jobs</span>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
                  className="absolute -bottom-6 -left-6 bg-primary-600 rounded-xl shadow-lg p-4 text-white"
                >
                  <div className="flex items-center space-x-2">
                    <Coins className="h-5 w-5" />
                    <span className="text-sm font-semibold">+RM 50 earned!</span>
                  </div>
                </motion.div>
              </div>

              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary-200 to-secondary-200 rounded-2xl transform rotate-6 scale-105 opacity-20"></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose IOTA Recycling?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make recycling convenient, profitable, and trustworthy through blockchain technology.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center group"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6 group-hover:bg-primary-200 transition-colors">
                    <Icon className="h-8 w-8 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Three simple steps to turn your recyclables into cash
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="card p-8 text-center">
                  <div className="text-6xl font-bold text-primary-100 mb-4">
                    {step.number}
                  </div>
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-48 object-cover rounded-xl mb-6"
                  />
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>
                
                {/* Arrow connector (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                    <ArrowRight className="h-8 w-8 text-primary-300" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Showcase Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              See It In Action
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real blockchain integration, professional UI, and complete user flows
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Demo Video/Screenshot */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl p-8 shadow-2xl">
                <div className="bg-gray-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="bg-gray-900 rounded p-3 text-green-400 font-mono text-sm">
                    <div>$ npm run demo</div>
                    <div className="text-gray-500">🎬 Starting automated demo...</div>
                    <div className="text-gray-500">✅ Wallet connected</div>
                    <div className="text-gray-500">📝 Job posted to blockchain</div>
                    <div className="text-gray-500">🚚 Job claimed by collector</div>
                    <div className="text-gray-500">💰 Payment released automatically</div>
                  </div>
                </div>
                <div className="text-center">
                  <Link
                    to="/recycler"
                    className="inline-flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors cursor-pointer"
                  >
                    <Play className="h-4 w-4" />
                    <span className="text-sm font-medium">Try Live Demo</span>
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Features List */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Real Blockchain Integration</h3>
                  <p className="text-gray-600">Actual IOTA transactions with gas fees, not simulated</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Professional UI/UX</h3>
                  <p className="text-gray-600">60px+ buttons, smooth animations, mobile-responsive</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Complete User Flow</h3>
                  <p className="text-gray-600">End-to-end job lifecycle with smart contract escrow</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Automated Demo</h3>
                  <p className="text-gray-600">Zero-click presentation perfect for hackathon judging</p>
                </div>
              </div>

              <div className="pt-4">
                <Link
                  to="/recycler"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
                >
                  <span>Try It Now</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section id="roadmap-section" className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              🚀 Coming Soon: Reusable Items Marketplace
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Beyond recycling - turn your unwanted furniture, electronics, and household items into cash!
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Current vs Future */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">♻️</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Current: Recyclables</h3>
                    <p className="text-green-600 text-sm">Live Now!</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• Paper, plastic, metal, glass</li>
                  <li>• Earn money from waste materials</li>
                  <li>• Help environment through recycling</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg border border-purple-200">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🛋️</span>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Future: Reusable Items</h3>
                    <p className="text-purple-600 text-sm">Coming Q2 2025</p>
                  </div>
                </div>
                <ul className="space-y-2 text-gray-600">
                  <li>• TVs, sofas, furniture, electronics</li>
                  <li>• Save disposal fees + earn money</li>
                  <li>• One person's trash = another's treasure</li>
                </ul>
              </div>
            </motion.div>

            {/* Value Proposition */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white"
            >
              <h3 className="text-2xl font-bold mb-6">💡 The Big Idea</h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">💸</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Stop Paying Disposal Fees</h4>
                    <p className="text-purple-100 text-sm">Instead of paying RM 50-200 to dispose of old furniture or electronics, earn money from collectors who see value in them.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">🔄</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Circular Economy</h4>
                    <p className="text-purple-100 text-sm">Collectors can refurbish, resell, or repurpose items. What's trash to you might be treasure to someone else.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-sm">🌍</span>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Environmental Impact</h4>
                    <p className="text-purple-100 text-sm">Reduce landfill waste by giving items a second life. Every reused item is one less in the dump.</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-4 bg-white bg-opacity-10 rounded-xl">
                <p className="text-center text-sm">
                  <strong>Join our waitlist</strong> to be the first to try reusable items marketplace!
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Start Recycling?
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              Join thousands of users already earning money while helping the environment
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/recycler"
                className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl min-h-[60px] flex items-center justify-center"
              >
                <Smartphone className="h-6 w-6 mr-3" />
                Get Started as Recycler
              </Link>
              
              <Link
                to="/collector"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 min-h-[60px] flex items-center justify-center"
              >
                <Truck className="h-6 w-6 mr-3" />
                Start Collecting
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage
