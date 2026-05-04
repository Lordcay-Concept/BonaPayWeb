'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { DownloadModal } from '@/components/DownloadModal'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function DownloadAppPage() {
  const searchParams = useSearchParams()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const message = searchParams.get('message')

  useEffect(() => {
    setIsModalOpen(true)
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mobile App Required</h1>
        <p className="text-gray-600 mt-2">
          Please download our mobile app to continue
        </p>
      </div>

      <Button asChild variant="outline">
        <Link href="/">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
      </Button>

      <DownloadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        message={message || undefined}
      />
    </div>
  )
}