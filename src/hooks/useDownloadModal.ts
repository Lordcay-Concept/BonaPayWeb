'use client'

import { useState, useCallback } from 'react'

export function useDownloadModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState<string | undefined>()

  const showDownloadModal = useCallback((msg?: string) => {
    setMessage(msg)
    setIsOpen(true)
  }, [])

  const hideDownloadModal = useCallback(() => {
    setIsOpen(false)
    setMessage(undefined)
  }, [])

  return {
    isOpen,
    message,
    showDownloadModal,
    hideDownloadModal,
  }
}