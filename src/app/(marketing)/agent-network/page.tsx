'use client';
import { useDownloadModal } from '@/hooks/useDownloadModal'
import { DownloadModal } from '@/components/DownloadModal'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowRight, MapPin, Users, TrendingUp, Award, 
  CheckCircle, DollarSign, Smartphone, Shield, 
  Clock, Gift, Star, Phone, Mail, Target
} from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function AgentNetworkPage() {
  const benefits = [
    {
      icon: DollarSign,
      title: "Earn Commissions",
      description: "Make money on every transaction you process",
      rate: "Up to 1.5% commission"
    },
    {
      icon: Users,
      title: "Customer Growth",
      description: "Build a loyal customer base in your community",
      rate: "Recurring income"
    },
    {
      icon: Award,
      title: "Recognition",
      description: "Become a certified BonaPay agent",
      rate: "Official status"
    },
    {
      icon: TrendingUp,
      title: "Business Growth",
      description: "Attract more customers to your existing business",
      rate: "Increased foot traffic"
    }
  ]

  const services = [
    "Cash deposit & withdrawal",
    "Money transfer",
    "Bill payments",
    "Airtime & data purchase",
    "Account opening assistance",
    "Card issuance",
    "BVN enrollment",
    "Customer support"
  ]

  const requirements = [
    "Must own a registered business",
    "Have a physical shop/office",
    "Minimum ₦50,000 float capital",
    "Valid means of identification",
    "Business bank account",
    "Smartphone with internet access"
  ]

  const locations = [
    { city: "Lagos", agents: 250, status: "Active" },
    { city: "Abuja", agents: 180, status: "Active" },
    { city: "Port Harcourt", agents: 95, status: "Active" },
    { city: "Kano", agents: 120, status: "Active" },
    { city: "Ibadan", agents: 85, status: "Active" },
    { city: "Enugu", agents: 60, status: "Active" }
  ]

  const { isOpen, showDownloadModal, hideDownloadModal } = useDownloadModal()

  const handleGetStarted = () => {
    // Show download modal instead of going to signup
    showDownloadModal()
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Agent Network
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Join Nigeria's fastest-growing banking agent network and earn extra income
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Become an Agent */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
            Become a BonaPay Agent
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Join our network of trusted agents and provide essential banking services to your community 
            while earning attractive commissions.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">{benefit.description}</p>
                  <Badge variant="outline" className="text-green-600">{benefit.rate}</Badge>
                </CardContent>
              </Card>
            )
          })}
        </motion.div>

        {/* Services Offered */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="grid lg:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-4">Services You'll Offer</h2>
            <div className="grid grid-cols-2 gap-3">
              {services.map((service, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">{service}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4">Requirements to Join</h2>
            <ul className="space-y-3">
              {requirements.map((req, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">{req}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Agent Locations */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Our Agent Network Across Nigeria</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location, index) => (
              <Card key={index}>
                <CardContent className="p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">{location.city}</p>
                      <p className="text-sm text-slate-500">{location.agents} Agents</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-green-600">{location.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Commission Structure */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-8 text-white mb-16">
          <h2 className="text-2xl font-bold text-center mb-6">Commission Structure</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">1.5%</div>
              <p className="text-sm text-blue-100">Cash Deposits</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">1%</div>
              <p className="text-sm text-blue-100">Withdrawals</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">₦50-₦100</div>
              <p className="text-sm text-blue-100">Bill Payments</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">₦200</div>
              <p className="text-sm text-blue-100">Account Opening</p>
            </div>
          </div>
        </motion.div>

        {/* Success Story */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-16">
          <h2 className="text-2xl font-bold text-center mb-8">Success Stories</h2>
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                  MO
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 italic mb-3">
                    "Becoming a BonaPay agent transformed my small provision store. I now earn ₦80,000 
                    monthly just from agent banking services while still running my business. My shop 
                    has become a community banking hub!"
                  </p>
                  <p className="font-semibold">Mary Okafor</p>
                  <p className="text-sm text-slate-500">Agent, Lagos</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center">
          <button
                      onClick={handleGetStarted}
                      className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                    Apply to become an Agent
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
          <div className="flex justify-center gap-6 mt-6 text-sm text-slate-500">
            <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> Call: 0800-AGENT</span>
            <span className="flex items-center gap-1"><Mail className="h-4 w-4" /> Email: agent@bonapay.com</span>
          </div>
        </motion.div>
      </div>
    </div>
  )
}