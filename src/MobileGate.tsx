import React, { useEffect, useState, type JSX } from 'react'
import App from './App'

function detectMobile(): boolean {
  if (typeof navigator !== 'undefined') {
    // basic UA check
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera || ''
    if (/Mobi|Android|iPhone|iPad|iPod|Opera Mini|IEMobile|BlackBerry/i.test(ua)) {
      return true
    }
  }
  // viewport fallback
  if (typeof window !== 'undefined') {
    return window.matchMedia && window.matchMedia('(max-width: 767px)').matches
  }
  return false
}

export default function MobileGate(): JSX.Element {
  const [isMobile, setIsMobile] = useState<boolean>(() => detectMobile())

  useEffect(() => {
    function onResize() {
      setIsMobile(detectMobile())
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('orientationchange', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('orientationchange', onResize)
    }
  }, [])

  if (isMobile) {
    return <App />
  }

  return (
    <div className="mobile-only-message">
      <div className="mobile-only-box">
        <h1>This app is for mobile only</h1>
        <p>Please open this site on a phone or mobile emulator.</p>
      </div>
    </div>
  )
}