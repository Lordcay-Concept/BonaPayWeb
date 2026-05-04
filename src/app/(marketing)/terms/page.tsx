'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import { FileText, AlertCircle, CheckCircle, DollarSign, Users, Scale, Clock, Shield } from 'lucide-react'

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 }
}

export default function TermsPage() {
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
            Terms & Conditions
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-blue-100 max-w-3xl mx-auto"
          >
            Please read these terms carefully before using our services
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto">
          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 mb-8">
            <p className="text-lg text-slate-700 dark:text-slate-300">
              Last Updated: March 15, 2025 | Version: 2.0
            </p>
          </motion.div>

          <motion.div variants={fadeInUp} initial="initial" animate="animate" className="space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <FileText className="h-6 w-6 text-blue-600" />
                1. Agreement to Terms
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                By accessing or using BonaPay's mobile application, website, or any of our services, 
                you agree to be bound by these Terms & Conditions. If you disagree with any part of 
                these terms, you may not access our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-6 w-6 text-blue-600" />
                2. Eligibility
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                To use BonaPay services, you must:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4">
                <li>Be at least 18 years of age</li>
                <li>Be a legal resident of Nigeria</li>
                <li>Have a valid phone number and email address</li>
                <li>Complete the KYC verification process with valid identification</li>
                <li>Not have been previously banned from our services</li>
                <li>Comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <DollarSign className="h-6 w-6 text-blue-600" />
                3. Account Registration
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                When creating an account, you agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4">
                <li>Provide accurate, current, and complete information</li>
                <li>Maintain the security of your password and PIN</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Accept responsibility for all activities under your account</li>
                <li>Not share your account credentials with anyone</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                4. Transactions and Limits
              </h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                Transaction limits based on account tier:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 dark:bg-slate-800">
                      <th className="border p-2 text-left">Tier</th>
                      <th className="border p-2 text-left">Daily Limit</th>
                      <th className="border p-2 text-left">Single Transaction</th>
                      <th className="border p-2 text-left">Requirements</th>
                     </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border p-2">Tier 1</td>
                      <td className="border p-2">₦50,000</td>
                      <td className="border p-2">₦20,000</td>
                      <td className="border p-2">Phone Number</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Tier 2</td>
                      <td className="border p-2">₦500,000</td>
                      <td className="border p-2">₦100,000</td>
                      <td className="border p-2">BVN + Valid ID</td>
                    </tr>
                    <tr>
                      <td className="border p-2">Tier 3</td>
                      <td className="border p-2">₦5,000,000</td>
                      <td className="border p-2">₦1,000,000</td>
                      <td className="border p-2">Full KYC + Utility Bill</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Scale className="h-6 w-6 text-blue-600" />
                5. Fees and Charges
              </h2>
              <div className="space-y-2 text-slate-600 dark:text-slate-400">
                <p><strong>Free Services:</strong> Account opening, BonaPay to BonaPay transfers, virtual card issuance</p>
                <p><strong>Fee-based Services:</strong> Transfers to other banks (₦10 - ₦52), Bill payments (Free - ₦100)</p>
                <p><strong>Inactivity Fee:</strong> ₦100/month after 6 months of inactivity</p>
                <p><strong>Card Replacement:</strong> ₦2,500 for physical card replacement</p>
                <p className="mt-2 text-sm">All fees are inclusive of VAT where applicable. We reserve the right to modify fees with 30 days' notice.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">6. Prohibited Activities</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                You may not use our services for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4">
                <li>Illegal gambling or betting operations</li>
                <li>Money laundering or terrorist financing</li>
                <li>Fraudulent transactions or identity theft</li>
                <li>Purchase of illegal goods or services</li>
                <li>Pyramid schemes or Ponzi schemes</li>
                <li>Any activity that violates Nigerian law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">7. Account Suspension and Termination</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We reserve the right to suspend or terminate your account for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4 mt-4">
                <li>Violation of these terms</li>
                <li>Suspected fraudulent activity</li>
                <li>Providing false information</li>
                <li>Chargebacks or disputed transactions</li>
                <li>Extended account inactivity (12+ months)</li>
                <li>Failure to complete KYC verification</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">8. Liability Disclaimer</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                BonaPay provides its services "as is" without warranties of any kind. We are not liable for:
              </p>
              <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4 mt-4">
                <li>Third-party service interruptions</li>
                <li>Unauthorized account access due to user negligence</li>
                <li>Losses from investment products (past performance doesn't guarantee future results)</li>
                <li>Technical issues beyond our reasonable control</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">9. Dispute Resolution</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                Any disputes arising from these terms shall be resolved through:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-slate-600 dark:text-slate-400 ml-4 mt-4">
                <li>Internal complaint resolution process (14 days)</li>
                <li>Mediation through the Lagos Multi-Door Courthouse</li>
                <li>Arbitration in accordance with Nigerian law</li>
                <li>Legal action in Nigerian courts as a last resort</li>
              </ol>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">10. Amendments</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                We may modify these terms at any time. Changes become effective 30 days after notification 
                via email or in-app notification. Your continued use of our services constitutes acceptance 
                of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">11. Governing Law</h2>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                These terms are governed by the laws of the Federal Republic of Nigeria. Any legal actions 
                shall be filed exclusively in the courts of Nigeria.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">12. Contact Information</h2>
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <p className="text-slate-700 dark:text-slate-300">For questions about these terms, contact:</p>
                <p className="text-slate-700 dark:text-slate-300 mt-2">Email: legal@bonapay.com</p>
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