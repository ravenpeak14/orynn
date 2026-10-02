import '@fontsource-variable/inter/index.css'
import './index.css'
// Registers the install-prompt listener as early as possible.
import './lib/install'

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OrynnApp } from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element.')

createRoot(root).render(
  <StrictMode>
    <OrynnApp />
  </StrictMode>,
)
