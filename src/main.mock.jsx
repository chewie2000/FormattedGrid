import React from 'react'
import ReactDOM from 'react-dom/client'
import { SigmaClientProvider } from '@sigmacomputing/plugin'
import App from './App.jsx'
import MOCK from './mock/data.js'

ReactDOM.createRoot(document.getElementById('root')).render(
  <SigmaClientProvider mockState={MOCK}>
    <App />
  </SigmaClientProvider>,
)
