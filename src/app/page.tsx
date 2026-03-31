import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Shield, Zap, Users, Wallet } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Navigation */}
      <nav className="border-b bg-white/80 backdrop-blur-sm dark:bg-slate-950/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            FintechFlow
          </div>
          <div className="space-x-4">
            <Link href="/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Banking for the Modern Age
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8">
            Send money, pay bills, and manage your finances with zero stress. 
            Experience the future of digital banking today.
          </p>
          <Link href="/signup">
            <Button size="lg" className="text-lg">
              Start Your Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Why Choose FintechFlow?
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg">
            Experience banking reimagined for the digital age
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Zap className="h-8 w-8 text-blue-500" />}
            title="Instant Transfers"
            description="Send and receive money instantly to any bank in Nigeria"
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8 text-blue-500" />}
            title="Bank-Level Security"
            description="Your money and data are protected with enterprise-grade security"
          />
          <FeatureCard
            icon={<Wallet className="h-8 w-8 text-blue-500" />}
            title="Smart Budgeting"
            description="Track your spending and save money effortlessly"
          />
          <FeatureCard
            icon={<Users className="h-8 w-8 text-blue-500" />}
            title="24/7 Support"
            description="Our support team is always here to help you"
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-blue-100 text-lg mb-8">
            Join thousands of Nigerians who trust FintechFlow for their banking needs
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg">
              Create Free Account
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="text-center p-6 rounded-xl bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-center mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-slate-600 dark:text-slate-300">{description}</p>
    </div>
  )
}