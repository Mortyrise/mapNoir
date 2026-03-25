import { StrictMode, useState, useEffect, lazy, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const ReviewApp = lazy(() => import('./components/ReviewApp.tsx'))

function Root() {
  const [hash, setHash] = useState(window.location.hash)

  useEffect(() => {
    const handler = () => setHash(window.location.hash)
    window.addEventListener('hashchange', handler)
    return () => window.removeEventListener('hashchange', handler)
  }, [])

  if (hash === '#/review') {
    return (
      <Suspense fallback={<div style={{ padding: '2rem', color: '#888' }}>Loading...</div>}>
        <ReviewApp />
      </Suspense>
    )
  }

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
