import React from 'react';
import DelegationChecker from './DelegationChecker';

const Dashboard = ({ account, daoData, signer, refreshData }) => {
  return (
    <div className="glass-panel animate-fade-in" style={{ marginBottom: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
        Treasury Dashboard
      </h2>
      
      {daoData.isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '3px solid var(--glass-border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          <p style={{ marginTop: '1rem', color: 'var(--text-muted)' }}>Syncing with SecureChain...</p>
        </div>
      ) : (
        <>
          <div className="grid-3">
            <div className="stat-card">
              <h5>Treasury Balance</h5>
              <h2>{daoData.treasuryBalance} <span style={{fontSize: '1rem', color: 'var(--primary)'}}>SCAI</span></h2>
            </div>
            <div className="stat-card">
              <h5>Your Token Balance</h5>
              <h2>{daoData.userBalance} <span style={{fontSize: '1rem', color: 'var(--primary)'}}>SCAI</span></h2>
            </div>
            <div className="stat-card">
              <h5>Your Voting Power</h5>
              <h2>{daoData.userVotes} <span style={{fontSize: '1rem', color: 'var(--success)'}}>Votes</span></h2>
            </div>
          </div>

          <DelegationChecker 
            account={account} 
            daoData={daoData} 
            signer={signer} 
            refreshData={refreshData} 
          />
        </>
      )}
    </div>
  );
};

export default Dashboard;
