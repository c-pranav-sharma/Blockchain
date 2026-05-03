import React from 'react'
import { Check, X, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const PriceCard = ({ 
  name, 
  price, 
  features, 
  isFeatured = false, 
  buttonText = "Get Started",
  delay = 0 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`price-card ${isFeatured ? 'featured' : ''}`}
    >
      {isFeatured && <div className="featured-badge">Most Popular</div>}
      
      <div className="plan-name">{name}</div>
      <div className="plan-price">
        ${price}<span>/mo</span>
      </div>

      <ul className="features-list">
        {features.map((feature, index) => (
          <li key={index} className={`feature-item ${feature.included ? '' : 'disabled'}`}>
            {feature.included ? (
              <Check size={18} className="text-purple-400" color="#8b5cf6" />
            ) : (
              <X size={18} color="#64748b" />
            )}
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>

      <motion.button 
        whileHover={{ gap: '12px' }}
        className="cta-button"
      >
        <span>{buttonText}</span>
        <ArrowRight size={18} style={{ marginLeft: '8px', verticalAlign: 'middle' }} />
      </motion.button>
    </motion.div>
  )
}

export default PriceCard
