'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Download,
  Smartphone,
  Shield,
  Zap,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

interface DownloadModalProps {
  isOpen: boolean
  onClose: () => void
  message?: string
}

const APK_DOWNLOAD_URL =
  'https://github.com/Lordcay-Concept/bonapay-app/releases/download/v1.0.0/BonaPay.apk'

export function DownloadModal({ isOpen, onClose, message }: DownloadModalProps) {
  const [copied, setCopied] = useState(false)

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(APK_DOWNLOAD_URL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            <Smartphone className="h-6 w-6 text-blue-600" />
            Download BonaPay App
          </DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {message === 'web_access_denied'
              ? "Web access is only for authorized administrators. Please use our mobile app for your banking needs."
              : "To create an account, you'll need to download our mobile app first."}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col space-y-6 py-4">
          {/* App Icon / Logo */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="h-10 w-10 text-white" />
            </div>
          </div>

          {/* Main Download Button */}
          <a
            href={APK_DOWNLOAD_URL}
            download
            className="w-full"
          >
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg font-semibold gap-2">
              <Download className="h-5 w-5" />
              Download APK (v1.0.0)
            </Button>
          </a>

          {/* Direct Link Copy */}
          <div className="space-y-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Or copy direct link:</p>
            <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-2 border border-gray-200 dark:border-gray-700">
              <code className="flex-1 text-xs truncate font-mono text-gray-600 dark:text-gray-300">
                {APK_DOWNLOAD_URL}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopyLink}
                className="shrink-0 h-8 w-8 p-0"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Requirements Badges */}
          <div className="flex flex-wrap justify-center gap-3">
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full">
              <Smartphone className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Android 7.0+</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full">
              <Shield className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-300">Secure Banking</span>
            </div>
            <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 dark:bg-blue-950/30 rounded-full">
              <Zap className="h-3 w-3 text-blue-600" />
              <span className="text-xs text-gray-600 dark:text-gray-300">65MB</span>
            </div>
          </div>

          {/* Installation Instructions */}
          <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              How to install:
            </p>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                  1
                </span>
                <span>Download the APK file above</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                  2
                </span>
                <span>Go to Settings → Security → Enable "Unknown Sources"</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                  3
                </span>
                <span>Open the downloaded file and tap "Install"</span>
              </li>
              <li className="flex gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-blue-200 dark:bg-blue-800 rounded-full flex items-center justify-center text-xs font-bold text-blue-700 dark:text-blue-300">
                  4
                </span>
                <span>Open BonaPay and create your account</span>
              </li>
            </ol>
          </div>

          {/* Alternative Store Links (Optional) */}
          <div className="text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Coming soon to Google Play Store and Apple App Store
            </p>
          </div>
        </div>

        <Button variant="outline" onClick={onClose} className="w-full mt-2">
          Close
        </Button>
      </DialogContent>
    </Dialog>
  )
}