'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Fingerprint, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface BiometricAuthProps {
  onSuccess: () => void
  onError?: (error: string) => void
  className?: string
}

export function BiometricAuth({ onSuccess, onError, className }: BiometricAuthProps) {
  const [isSupported, setIsSupported] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)

  useEffect(() => {
    // Check if biometric authentication is supported
    if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
      setIsSupported(true)
    }
  }, [])

  const handleBiometricAuth = async () => {
    setIsAuthenticating(true)
    
    try {
      // Check if credentials are available
      const credentials = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          timeout: 60000,
          rpId: window.location.hostname,
          userVerification: 'required',
        }
      })

      if (credentials) {
        onSuccess()
        toast.success('Biometric authentication successful')
      } else {
        throw new Error('Authentication failed')
      }
    } catch (error: any) {
      console.error('Biometric auth error:', error)
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Biometric authentication cancelled or not allowed'
        : 'Biometric authentication failed. Please try again.'
      toast.error(errorMessage)
      onError?.(errorMessage)
    } finally {
      setIsAuthenticating(false)
    }
  }

  if (!isSupported) {
    return null
  }

  return (
    <Button
      variant="outline"
      onClick={handleBiometricAuth}
      disabled={isAuthenticating}
      className={className}
    >
      {isAuthenticating ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Fingerprint className="h-4 w-4 mr-2" />
      )}
      {isAuthenticating ? 'Authenticating...' : 'Use Biometric'}
    </Button>
  )
}