import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import MobileGate from './MobileGate.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileGate />
  </StrictMode>,
)
