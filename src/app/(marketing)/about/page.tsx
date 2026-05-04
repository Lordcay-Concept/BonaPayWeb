'use client';
import { useDownloadModal } from '@/hooks/useDownloadModal'
import { DownloadModal } from '@/components/DownloadModal'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, Shield, Zap, Users, Award, Globe, Clock, CheckCircle, Target, Eye, Heart, Briefcase } from 'lucide-react'
import { motion } from 'framer-motion'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function AboutPage() {
  const leaders = [
    { 
      name: "Caleb Ufere", 
      role: "CEO & Co-founder", 
      bio: "20+ years in banking and fintech",
      image: "/images/Image-7.jpg",
      description: "Former Executive Director at leading Nigerian bank with expertise in digital transformation"
    },
    { 
      name: "Chioma Nwogha", 
      role: "CTO", 
      bio: "Former Lead Engineer at leading tech firm",
      image: "/images/Image-8.jpg",
      description: "Tech innovator with 15+ years experience building scalable financial systems"
    },
    { 
      name: "Emeka Nwosu", 
      role: "COO", 
      bio: "Operations expert with global experience",
      image: "/images/Image-9.jpg",
      description: "Operations leader who has managed teams across Africa and Europe"
    }
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
            About BonaPay
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Building the future of banking in Nigeria
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Our Story */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Our Story</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
              BonaPay was founded in 2023 with a simple mission: to make banking accessible, affordable, 
              and convenient for every Nigerian. We recognized that traditional banking was leaving too 
              many people behind, with high fees, complicated processes, and limited access.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Today, we serve over 100,000 customers across Nigeria, processing billions in transactions 
              monthly. Our digital-first approach has revolutionized how Nigerians bank, save, and grow 
              their money.
            </p>
          </motion.div>

          {/* Mission & Vision */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center">
              <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Our Mission</h3>
              <p className="text-slate-600 dark:text-slate-400">
                To democratize financial services in Nigeria by providing accessible, affordable, 
                and innovative digital banking solutions for everyone.
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-8 text-center">
              <Eye className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-2">Our Vision</h3>
              <p className="text-slate-600 dark:text-slate-400">
                To become Nigeria's most trusted digital bank, empowering millions to achieve 
                financial freedom through technology.
              </p>
            </div>
          </motion.div>

          {/* Core Values */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="text-center p-6">
                <Heart className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Customer First</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Every decision starts with what's best for our customers</p>
              </div>
              <div className="text-center p-6">
                <Shield className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Trust & Transparency</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">We operate with complete honesty and clarity</p>
              </div>
              <div className="text-center p-6">
                <Zap className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Innovation</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">Constantly improving and evolving our technology</p>
              </div>
            </div>
          </motion.div>

          {/* Leadership Team with Images */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center">Our Leadership</h2>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              {leaders.map((leader, index) => (
                <div key={index} className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl hover:shadow-lg transition-shadow">
                  <div className="relative w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-blue-500">
                    <Image
                      src={leader.image}
                      alt={leader.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className="font-semibold text-lg">{leader.name}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-2">{leader.role}</p>
                  <p className="text-xs text-slate-500 mb-3">{leader.bio}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400">{leader.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Milestones */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="mb-12">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 text-center">Our Journey</h2>
            <div className="space-y-4">
              {[
                { year: "2023", event: "BonaPay founded and licensed by CBN" },
                { year: "2023", event: "Launched mobile app with core banking features" },
                { year: "2024", event: "Reached 50,000 active users" },
                { year: "2024", event: "Introduced virtual cards and investments" },
                { year: "2025", event: "Crossed ₦5B in transactions" },
                { year: "2025", event: "Launched agent network across Nigeria" }
              ].map((milestone, index) => (
                <div key={index} className="flex gap-4 items-start">
                  <div className="w-20 font-bold text-blue-600">{milestone.year}</div>
                  <div className="flex-1 border-l-2 border-blue-200 pl-4 pb-4">
                    <p>{milestone.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-8">
            <h3 className="text-2xl font-bold mb-4">Join Our Mission</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Be part of Nigeria's digital banking revolution. Open your account today.
            </p>
            <button
                      onClick={handleGetStarted}
                      className="bg-white text-blue-600 hover:bg-slate-100 px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2 text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                    >
                      Start your Business Account
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}