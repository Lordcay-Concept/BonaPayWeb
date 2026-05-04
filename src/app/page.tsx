'use client';
import { useDownloadModal } from '@/hooks/useDownloadModal'
import { DownloadModal } from '@/components/DownloadModal'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Wallet, Smartphone, TrendingUp, CreditCard, Clock, Star, CheckCircle, ChevronRight, Users, Award, Globe, Lock, 
Sparkles, Gift, Send, ArrowUp, Facebook, X, Instagram, Linkedin } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const fadeInLeft = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const fadeInRight = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" }
}

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export default function HomePage() {
  const { isOpen, showDownloadModal, hideDownloadModal } = useDownloadModal()
  const [showScroll, setShowScroll] = useState(false)

  const handleGetStarted = () => {
    showDownloadModal()
  }

  useEffect(() => {
    const handleScroll = () => {
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 300
      setShowScroll(isAtBottom)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 overflow-x-hidden">
      {/* Navigation Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800"
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="text-white font-bold text-lg">B</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 bg-clip-text text-transparent">
                BonaPay
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {['About', 'Features', 'Benefits', 'Security', 'Testimonials', 'FAQ'].map((item) => (
                <Link 
                  key={item} 
                  href={item === 'About' ? '/about' : `#${item.toLowerCase()}`} 
                  className="text-slate-600 hover:text-blue-600 dark:text-slate-300 dark:hover:text-blue-400 transition-colors font-medium"
                >
                  {item}
                </Link>
              ))}
            </div>

            {/* CTA Button */}
            <>
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </button>

              <DownloadModal isOpen={isOpen} onClose={hideDownloadModal} />
            </>
          </div>
        </nav>
      </motion.header>

      {/* Hero Section with Image 1 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-950 dark:via-slate-950 dark:to-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInLeft}
              className="text-center lg:text-left"
            >
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Trusted by milions of Nigerians</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
                Banking for the{' '}
                <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                  Modern Age
                </span>
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Send money, pay bills, buy airtime, and manage your finances with zero stress. 
                Experience the future of digital banking in Nigeria.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-lg"
                >
                  Create Free Account
                  <ArrowRight className="ml-2 h-5 w-5" />
                </button>
                <Link href="/learn-more">
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Learn More
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-6 justify-center lg:justify-start mt-8">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-blue-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-white text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  <span className="font-bold text-green-600">+50,000</span> active users this month
                </p>
              </div>
            </motion.div>

            {/* Right Content - Image 1: Mobile App Interface */}
            <motion.div
              initial="initial"
              animate="animate"
              variants={fadeInRight}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/Image-1.png"
                  alt="BonaPay Mobile App Interface"
                  width={600}
                  height={700}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <motion.section 
        id="features" 
        className="py-20 bg-white dark:bg-slate-950"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
        variants={staggerContainer}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Everything you need in a modern bank
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Experience seamless banking with powerful features designed for your financial freedom
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-blue-600" />}
              title="Instant Transfers"
              description="Send and receive money instantly to any bank in Nigeria with zero delays"
              delay={0}
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-blue-600" />}
              title="Bank-Level Security"
              description="Your money and data are protected with enterprise-grade security"
              delay={0.1}
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8 text-blue-600" />}
              title="Virtual Cards"
              description="Create virtual cards for secure online payments instantly"
              delay={0.2}
            />
            <FeatureCard
              icon={<Clock className="h-8 w-8 text-blue-600" />}
              title="24/7 Support"
              description="Our support team is always here to help you anytime"
              delay={0.3}
            />
          </div>
        </div>
      </motion.section>

      {/* Benefits Section with Image 2 */}
      <motion.section 
        id="benefits" 
        className="py-20 bg-slate-50 dark:bg-slate-900/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Why Choose Us</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-6">
                Why Nigerians choose <span className="text-blue-600">BonaPay</span>
              </h2>
              <div className="space-y-4">
                <BenefitItem text="No hidden fees - Transparent pricing" icon={CheckCircle} />
                <BenefitItem text="Instant account opening - Get started in minutes" icon={CheckCircle} />
                <BenefitItem text="High-yield savings - Grow your money with competitive interest" icon={TrendingUp} />
                <BenefitItem text="Bill payments - Electricity, airtime, data, cable TV" icon={Send} />
                <BenefitItem text="Virtual cards - For safe online shopping" icon={CreditCard} />
                <BenefitItem text="Referral bonuses - Earn up to ₦1,000 per referral" icon={Gift} />
              </div>
            </motion.div>
            <motion.div
              variants={fadeInRight}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/Image-2.png"
                  alt="BonaPay Debit Card"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-blue-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <StatCard number="100k+" label="Active Users" icon={<Users className="h-6 w-6" />} />
            <StatCard number="₦5B+" label="Transactions" icon={<TrendingUp className="h-6 w-6" />} />
            <StatCard number="24/7" label="Support" icon={<Clock className="h-6 w-6" />} />
            <StatCard number="99.9%" label="Uptime" icon={<Globe className="h-6 w-6" />} />
          </div>
        </div>
      </section>

      {/* Security Section with Image 3 */}
      <motion.section 
        id="security" 
        className="py-20 bg-white dark:bg-slate-950"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={fadeInLeft}>
              <div className="inline-flex items-center gap-2 bg-blue-100 dark:bg-blue-900/30 rounded-full px-4 py-2 mb-6">
                <Shield className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Bank-Grade Security</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                Your Security is Our Priority
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">
                Your money and data are protected with military-grade encryption and advanced security features
              </p>
              <div className="space-y-6">
                <SecurityFeature
                  icon={<Lock className="h-6 w-6 text-blue-600" />}
                  title="256-bit Encryption"
                  description="All your data is encrypted with the same technology used by banks worldwide"
                />
                <SecurityFeature
                  icon={<Shield className="h-6 w-6 text-blue-600" />}
                  title="Two-Factor Authentication"
                  description="Add an extra layer of security to protect your account"
                />
                <SecurityFeature
                  icon={<Award className="h-6 w-6 text-blue-600" />}
                  title="Fraud Detection"
                  description="Real-time monitoring to detect and prevent suspicious activities"
                />
              </div>
            </motion.div>
            <motion.div variants={fadeInRight} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/Image-3.png"
                  alt="Person using BonaPay on tablet"
                  width={600}
                  height={550}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Testimonial Section with Image 4 */}
      <motion.section 
        id="testimonials" 
        className="py-20 bg-slate-50 dark:bg-slate-900/50"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto mb-12" variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Loved by thousands of users
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              See what our customers have to say about BonaPay
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Testimonials Grid */}
            <div className="grid grid-cols-1 gap-6">
              <TestimonialCard
                name="Adebayo Ogunlesi"
                role="Business Owner"
                content="BonaPay has transformed how I handle business transactions. Fast, reliable, and secure!"
                rating={5}
              />
              <TestimonialCard
                name="Chioma Okonkwo"
                role="Freelancer"
                content="The virtual cards feature is a lifesaver for international payments. Highly recommended!"
                rating={5}
              />
              <TestimonialCard
                name="Emeka Nwosu"
                role="Student"
                content="Easy to use, great interest rates on savings, and amazing customer support!"
                rating={5}
              />
            </div>

            {/* Image 4 */}
            <motion.div variants={fadeInRight} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                <Image
                  src="/images/Image-4.png"
                  alt="Happy BonaPay users"
                  width={600}
                  height={500}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent flex items-end p-6">
                  <div className="text-white">
                    <p className="text-lg font-semibold">Join 100,000+ Happy Users</p>
                    <p className="text-sm opacity-90">Experience the future of banking today</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* FAQ Section */}
      <motion.section 
        id="faq" 
        className="py-20 bg-white dark:bg-slate-950"
        initial="initial"
        whileInView="animate"
        viewport={{ once: true }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto mb-16" variants={fadeInUp}>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Got questions? We've got answers
            </p>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <FAQItem
              question="How do I open an account?"
              answer="Simply click 'Get Started' and follow the registration process. It takes less than 2 minutes! You'll need your phone number, email, and a valid ID for verification."
            />
            <FAQItem
              question="Is my money safe?"
              answer="Yes! Your funds are held in licensed Nigerian banks and protected by NDIC insurance up to ₦500,000. We also use bank-grade encryption to protect your data."
            />
            <FAQItem
              question="What are the fees?"
              answer="Most transactions are free. We charge minimal fees for certain services like international transfers, which are clearly shown before you confirm any transaction."
            />
            <FAQItem
              question="How do I contact support?"
              answer="Our support team is available 24/7 via live chat in the app, email at support@bonapay.com, or call our toll-free line 0800-BONAPAY."
            />
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-500 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.1%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of Nigerians who have already switched to BonaPay for their daily banking needs
          </p>
          <button
            onClick={handleGetStarted}
            className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Create Free Account
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
          <p className="text-sm text-blue-200 mt-6">
            No credit card required • Free to sign up • Instant activation
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative">
        {/* TOP SECTION: */}
        <div className="relative bg-blue-200 text-white py-16 overflow-hidden">
          
          <div className="absolute inset-0 bg-[url('/images/Image-5.png')] bg-cover bg-center bg-no-repeat opacity-60 mix-blend-luminosity pointer-events-none" />
          
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-blue-600/70 to-blue-600/40 pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
              {/* Column 1: Company */}
              <div>
                <h3 className="font-bold text-lg mb-4">Company</h3>
                <ul className="space-y-2 opacity-80 text-sm">
                  <li><Link href="/about" className="hover:opacity-100 transition-opacity">About us</Link></li>
                  <li><Link href="/press-media" className="hover:opacity-100 transition-opacity">Press & Media</Link></li>
                  <li><Link href="/contact" className="hover:opacity-100 transition-opacity">Contact us</Link></li>
                  <li><Link href="/report-issue" className="hover:opacity-100 transition-opacity">Report an Issue</Link></li>
                </ul>
              </div>

              {/* Column 2: Resources */}
              <div>
                <h3 className="font-bold text-lg mb-4">Resources</h3>
                <ul className="space-y-2 opacity-80 text-sm">
                  <li><Link href="/privacy-policy" className="hover:opacity-100 transition-opacity">Privacy Policy</Link></li>
                  <li><Link href="/terms" className="hover:opacity-100 transition-opacity">Terms & Conditions</Link></li>
                  <li><Link href="/sms-alerts" className="hover:opacity-100 transition-opacity">SMS Alert Service</Link></li>
                  <li><Link href="/documentation" className="hover:opacity-100 transition-opacity">Documentation</Link></li>
                </ul>
              </div>

              {/* Column 3: Discover */}
              <div>
                <h3 className="font-bold text-lg mb-4">Discover</h3>
                <ul className="space-y-2 opacity-80 text-sm">
                  <li><Link href="/personal" className="hover:opacity-100 transition-opacity">Personal</Link></li>
                  <li><Link href="/business" className="hover:opacity-100 transition-opacity">Business</Link></li>
                  <li><Link href="/agent-network" className="hover:opacity-100 transition-opacity">Agent Network</Link></li>
                </ul>
              </div>

              {/* Column 4: BonaPay Office  */}
              <div>
                <h3 className="font-bold text-lg mb-4">BonaPay Office</h3>
                <p className="text-sm opacity-80 leading-relaxed">
                  HQ: Alexander House, Plot 9, <br />
                  Dr. Nurudeen Olowopopo Avenue, <br />
                  Central Area, Abuja.
                </p>
              </div>

              {/* Column 5 & 6: Detailed Address */}
              <div className="lg:col-span-2">
                <h3 className="font-bold text-lg mb-4">Office Address</h3>
                <div className="space-y-3 text-xs opacity-80">
                  <p><strong>ABUJA:</strong> Plot 819, Pushkin Building, Ebitu Ukiwe Street, Jabi, Opposite AA Rano Fuel Station, Abuja.</p>
                  <p><strong>LAGOS:</strong> No 103 Mosesola House, Allen Avenue, Ikeja, Lagos.</p>
                  <p><strong>PORT HARCOURT:</strong> Phase 2, GRA, Port Harcourt, Rivers State.</p>
                  <p className="font-bold cursor-pointer hover:underline">More &gt;&gt;</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION:  */}
        <div className="bg-white dark:bg-slate-900 py-6 border-t border-slate-100 dark:border-slate-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="text-xl font-bold text-blue-600 dark:text-white">BonaPay</span>
            </Link>

            {/* Copyright */}
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} BonaPay Digital Services Limited.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-4 text-slate-400">
              <Link href="#" className="hover:text-blue-600 transition-colors"><Facebook className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-blue-400 transition-colors"><X className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-pink-600 transition-colors"><Instagram className="w-5 h-5" /></Link>
              <Link href="#" className="hover:text-blue-700 transition-colors"><Linkedin className="w-5 h-5" /></Link>
            </div>
          </div>
        </div>

        {/* BACK TO TOP ARROW */}
        <AnimatePresence>
          {showScroll && (
            <motion.button
              initial={{ opacity: 0, scale: 0.5, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 20 }}
              onClick={scrollToTop}
              className="fixed bottom-10 right-10 z-[60] bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-2xl transition-all"
            >
              <ArrowUp className="w-6 h-6" />
            </motion.button>
          )}
        </AnimatePresence>
      </footer>
    </div>
  )
}

// Component Definitions
function FeatureCard({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="text-center p-6 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="flex justify-center mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full w-14 h-14 mx-auto">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-400">{description}</p>
    </motion.div>
  )
}

function BenefitItem({ text, icon: Icon }: { text: string; icon: React.ElementType }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      className="flex items-center gap-3 group"
    >
      <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded-lg group-hover:scale-110 transition-transform">
        <Icon className="h-4 w-4 text-green-600" />
      </div>
      <span className="text-slate-700 dark:text-slate-300">{text}</span>
    </motion.div>
  )
}

function SecurityFeature({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex-shrink-0">
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </div>
      <div>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400">{description}</p>
      </div>
    </div>
  )
}

function StatCard({ number, label, icon }: { number: string; label: string; icon: React.ReactNode }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      className="text-center text-white"
    >
      <div className="flex justify-center mb-2 opacity-80">{icon}</div>
      <div className="text-3xl font-bold">{number}</div>
      <div className="text-sm text-blue-100">{label}</div>
    </motion.div>
  )
}

function TestimonialCard({ name, role, content, rating }: { name: string; role: string; content: string; rating: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
        ))}
      </div>
      <p className="text-slate-600 dark:text-slate-300 mb-4">"{content}"</p>
      <div>
        <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{role}</p>
      </div>
    </motion.div>
  )
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm cursor-pointer hover:shadow-md transition-all"
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-slate-900 dark:text-white">{question}</h3>
        <ChevronRight className={`h-5 w-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.3 }}
          className="mt-2"
        >
          <p className="text-slate-600 dark:text-slate-400 text-sm">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  )
}