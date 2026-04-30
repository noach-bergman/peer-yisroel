import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null } }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error, info) { console.error('App error:', error.message, info?.componentStack?.slice(0, 300)) }
  render() {
    if (this.state.error) return (
      <div style={{ padding: 40, direction: 'rtl', color: '#c00', fontFamily: 'Arial' }}>
        <h2>שגיאה בטעינת האתר</h2>
        <pre style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre>
      </div>
    )
    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
