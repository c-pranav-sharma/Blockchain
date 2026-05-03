import React from 'react'
import PriceCard from './components/PriceCard'
import './App.css'

function App() {
  const plans = [
    {
      name: "Starter",
      price: 0,
      features: [
        { text: "Up to 3 Projects", included: true },
        { text: "Basic Analytics", included: true },
        { text: "Community Support", included: true },
        { text: "Custom Domains", included: false },
        { text: "Advanced Security", included: false },
      ]
    },
    {
      name: "Pro",
      price: 29,
      isFeatured: true,
      features: [
        { text: "Unlimited Projects", included: true },
        { text: "Advanced Analytics", included: true },
        { text: "Priority Support", included: true },
        { text: "Custom Domains", included: true },
        { text: "Advanced Security", included: false },
      ],
      buttonText: "Upgrade Now"
    },
    {
      name: "Enterprise",
      price: 99,
      features: [
        { text: "Unlimited Projects", included: true },
        { text: "Custom Integrations", included: true },
        { text: "24/7 Phone Support", included: true },
        { text: "Custom Domains", included: true },
        { text: "Advanced Security", included: true },
      ],
      buttonText: "Contact Sales"
    }
  ]

  return (
    <div className="container">
      <header>
        <h1>Scale your business</h1>
        <p className="subtitle">
          Pick a plan that grows with you. No hidden fees.
        </p>
      </header>

      <div className="pricing-grid">
        {plans.map((plan, index) => (
          <PriceCard 
            key={plan.name}
            {...plan}
            delay={index * 0.15}
          />
        ))}
      </div>

      <footer style={{ marginTop: '6rem', textAlign: 'center', opacity: 0.5 }}>
        <p>© 2026 ComponentFlow Demo. All rights reserved.</p>
      </footer>
    </div>
  )
}

export default App
