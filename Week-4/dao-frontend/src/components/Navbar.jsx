import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ account, handleConnect }) => {
  const location = useLocation();

  return (
    <header className="header glass-panel" style={{ marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>SecureChain DAO</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0 }}>Next-Gen Decentralized Governance</p>
        </div>
        
        <nav style={{ display: 'flex', gap: '1rem', marginLeft: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ background: location.pathname === '/' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem' }}>
              Dashboard
            </button>
          </Link>
          <Link to="/proposals" style={{ textDecoration: 'none' }}>
            <button className="btn" style={{ background: location.pathname === '/proposals' ? 'var(--primary)' : 'rgba(255,255,255,0.1)', padding: '0.5rem 1rem' }}>
              Proposals & Voting
            </button>
          </Link>
        </nav>
      </div>
      
      {!account ? (
        <button className="btn" onClick={handleConnect}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
            <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
            <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
            <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
          </svg>
          Connect Wallet
        </button>
      ) : (
        <div className="wallet-badge">
          {account.slice(0, 6)}...{account.slice(-4)}
        </div>
      )}
    </header>
  );
};

export default Navbar;
