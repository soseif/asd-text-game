import React from 'react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

function showLoadError(err) {
  const root = document.getElementById('root')
  if (!root) return
  const msg = (err && err.message) || String(err)
  const stack = (err && err.stack) || ''
  root.innerHTML = `
    <div style="padding:24px;font-family:monospace;background:#1a1a1a;color:#f88;min-height:100vh;">
      <h2 style="color:#f66;">Load Error</h2>
      <p><strong>${msg}</strong></p>
      <pre style="font-size:12px;overflow:auto;white-space:pre-wrap;">${stack}</pre>
      <p style="color:#888;">也可以按 F12 → Console 查看完整报错</p>
    </div>
  `
}

class ErrorBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(err) {
    return { error: err }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'monospace', background: '#111', color: '#f88', minHeight: '100vh' }}>
          <h2>Something went wrong</h2>
          <pre>{this.state.error?.message ?? String(this.state.error)}</pre>
          {this.state.error?.stack && <pre style={{ fontSize: 12, overflow: 'auto' }}>{this.state.error.stack}</pre>}
        </div>
      )
    }
    return this.props.children
  }
}

async function init() {
  try {
    const { default: App } = await import('./App.jsx')
    const { LocaleProvider } = await import('./i18n/index.jsx')
    createRoot(document.getElementById('root')).render(
      <StrictMode>
        <ErrorBoundary>
          <LocaleProvider>
            <App />
          </LocaleProvider>
        </ErrorBoundary>
      </StrictMode>
    )
  } catch (err) {
    showLoadError(err)
  }
}

init()
