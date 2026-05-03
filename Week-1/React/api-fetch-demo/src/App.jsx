import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { RefreshCw, AlertCircle, Database, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

function App() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    setError(null)
    try {
      // Simulate a bit of delay for the premium loading effect
      await new Promise(resolve => setTimeout(resolve, 800))
      const response = await axios.get('https://jsonplaceholder.typicode.com/posts?_limit=9')
      setData(response.data)
    } catch (err) {
      setError('Failed to fetch data. Please check your connection.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  return (
    <div className="app-layout">
      <header>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1>API Insights</h1>
          <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Live data from JSONPlaceholder API
          </p>
        </motion.div>

        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchData} 
          className="refresh-btn"
          disabled={loading}
        >
          <RefreshCw size={18} className={loading ? 'spin' : ''} />
          {loading ? 'Fetching...' : 'Refresh Data'}
        </motion.button>
      </header>

      <main>
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="loading-container"
            >
              <div className="spinner"></div>
              <p>Aggregating data points...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="error-card"
            >
              <AlertCircle size={40} style={{ marginBottom: '1rem' }} />
              <h3>Oops! Something went wrong</h3>
              <p>{error}</p>
            </motion.div>
          ) : (
            <motion.div 
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="data-grid"
            >
              {data.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="post-card"
                >
                  <div className="post-id">Post #{post.id}</div>
                  <h3 className="post-title">{post.title}</h3>
                  <p className="post-body">{post.body}</p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer style={{ marginTop: '4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        <p>Built with React + Vite + Framer Motion</p>
      </footer>
    </div>
  )
}

export default App
