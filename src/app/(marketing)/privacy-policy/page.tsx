'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Shield, Lock, Eye, Database, FileText, Clock } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Privacy Policy
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Your privacy is important to us. Learn how we protect your data.
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Last Updated: March 15, 2025
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                1. Introduction
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                BonaPay Digital Services Limited ("BonaPay", "we", "our", "us") is committed to protecting 
                your privacy and personal information. This Privacy Policy explains how we collect, use, 
                disclose, and safeguard your information when you use our mobile application, website, 
                and services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Database className="h-6 w-6 text-blue-600" />
                2. Information We Collect
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We collect information that you provide directly to us, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4">
                <li>Personal identification information (name, email, phone number, date of birth)</li>
                <li>Government-issued ID documents for KYC verification (BVN, NIN, Passport, Driver's License)</li>
                <li>Financial information (bank account details, transaction history)</li>
                <li>Device information (IP address, device type, operating system)</li>
                <li>Usage data (app interactions, feature usage, transaction patterns)</li>
                <li>Location data (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-blue-600" />
                3. How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4">
                <li>To provide and maintain our banking services</li>
                <li>To verify your identity and prevent fraud</li>
                <li>To process transactions and payments</li>
                <li>To communicate with you about your account</li>
                <li>To improve our services and develop new features</li>
                <li>To comply with legal and regulatory requirements</li>
                <li>To send you security alerts and important notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-blue-600" />
                4. Data Sharing and Disclosure
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                We may share your information with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4">
                <li>Service providers and partners who assist in our operations</li>
                <li>Financial institutions for transaction processing</li>
                <li>Regulatory authorities as required by law</li>
                <li>Fraud prevention and credit reference agencies</li>
              </ul>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mt-4">
                We never sell your personal information to third parties for marketing purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Clock className="h-6 w-6 text-blue-600" />
                5. Data Retention
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We retain your personal information for as long as your account is active or as needed 
                to provide you services. We may also retain and use your information to comply with legal 
                obligations, resolve disputes, and enforce our agreements. Financial transaction data is 
                retained for a minimum of 7 years as required by banking regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Data Security</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We implement industry-standard security measures to protect your information, including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4 mt-4">
                <li>256-bit SSL/TLS encryption for all data transmission</li>
                <li>End-to-end encryption for sensitive data</li>
                <li>Multi-factor authentication for account access</li>
                <li>Regular security audits and penetration testing</li>
                <li>Secure data centers with 24/7 monitoring</li>
                <li>Employee background checks and security training</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Your Rights</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                You have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4">
                <li>Access your personal information</li>
                <li>Correct inaccurate or incomplete information</li>
                <li>Request deletion of your data (subject to legal requirements)</li>
                <li>Object to certain data processing activities</li>
                <li>Request data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Cookies and Tracking</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We use cookies and similar tracking technologies to enhance your experience, analyze usage, 
                and improve our services. You can control cookie settings through your browser preferences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Children's Privacy</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Our services are not intended for individuals under 18 years of age. We do not knowingly 
                collect personal information from minors. If you believe a minor has provided us with 
                personal information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Changes to This Policy</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes via email or through the app. Your continued use of our services after such 
                modifications constitutes your acceptance of the updated policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Contact Us</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                If you have questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300">Email: dpo@bonapay.com</p>
                <p className="text-slate-700 dark:text-slate-300">Phone: 0800-BONAPAY</p>
                <p className="text-slate-700 dark:text-slate-300">Address: Alexander House, Plot 9, Dr. Nurudeen Olowopopo Avenue, Central Area, Abuja, Nigeria</p>
              </div>
            </section>
          </motion.div>
        </div>
      </div>
    </div>
  )
}