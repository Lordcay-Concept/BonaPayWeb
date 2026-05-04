'use client';

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { MapPin, Phone, Mail, Clock, Send, Facebook, X, Instagram, Linkedin } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    toast.success('Message sent successfully! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', subject: '', message: '' })
    setSubmitting(false)
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
            Contact Us
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            We're here to help. Reach out to us anytime.
          </motion.p>
        </div>
      </section>

      {/* Contact Information */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <MapPin className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Visit Us</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Alexander House, Plot 9,<br />
              Dr. Nurudeen Olowopopo Avenue,<br />
              Central Area, Abuja, Nigeria
            </p>
          </motion.div>
          
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }} className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <Phone className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Call Us</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Customer Support: 0800-BONAPAY<br />
              Business Inquiries: 01-888-1234<br />
              Mon - Fri, 8AM - 8PM
            </p>
          </motion.div>
          
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.2 }} className="text-center p-6 bg-slate-50 dark:bg-slate-800 rounded-xl">
            <Mail className="h-10 w-10 text-blue-600 mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Email Us</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Support: support@bonapay.com<br />
              Business: business@bonapay.com<br />
              Press: press@bonapay.com
            </p>
          </motion.div>
        </div>

        {/* Contact Form and Map */}
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="subject">Subject</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      required
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="message">Message</Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      required
                      rows={5}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? 'Sending...' : 'Send Message'}
                    <Send className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Map and Social Links */}
          <motion.div variants={fadeInUp} initial="initial" animate="animate" transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <CardTitle>Find Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-slate-200 dark:bg-slate-700 rounded-lg h-64 flex items-center justify-center">
                  <p className="text-slate-500">Map View - Abuja Office Location</p>
                </div>
                <div className="pt-4">
                  <h3 className="font-semibold mb-3">Connect With Us</h3>
                  <div className="flex gap-4">
                    <Link href="#" className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 transition-colors">
                      <Facebook className="h-5 w-5 text-blue-600" />
                    </Link>
                    <Link href="#" className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 transition-colors">
                      <X className="h-5 w-5 text-blue-600" />
                    </Link>
                    <Link href="#" className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 transition-colors">
                      <Instagram className="h-5 w-5 text-blue-600" />
                    </Link>
                    <Link href="#" className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full hover:bg-blue-100 transition-colors">
                      <Linkedin className="h-5 w-5 text-blue-600" />
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}