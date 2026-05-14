import React, { useState } from 'react';
import { getContracts } from '../utils/ethereum';

const DelegationChecker = ({ account, daoData, signer, refreshData }) => {
  const [isDelegating, setIsDelegating] = useState(false);

  const needsDelegation = Number(daoData.userBalance) > 0 && Number(daoData.userVotes) === 0;

  const handleDelegate = async () => {
    if (!signer || !account) return;
    try {
      setIsDelegating(true);
      const { token } = await getContracts(signer);
      const tx = await token.delegate(account);
      await tx.wait();
      await refreshData();
    } catch (err) {
      console.error("Delegation failed:", err);
      alert("Delegation failed. Check console.");
    } finally {
      setIsDelegating(false);
    }
  };

  if (!needsDelegation) return null;

  return (
    <div className="alert-box animate-fade-in" style={{ background: 'rgba(255, 118, 117, 0.15)' }}>
      <div>
        <h4 style={{ color: '#ff7675', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Action Required: Delegate Your Votes
        </h4>
        <p style={{ color: '#ffcccc' }}>
          You have <strong>{daoData.userBalance}</strong> tokens but <strong>0</strong> voting power. 
          You must activate your voting rights.
        </p>
      </div>
      <button 
        className="btn btn-danger"
        onClick={handleDelegate} 
        disabled={isDelegating}
      >
        {isDelegating ? 'Activating...' : 'Activate Voting Power'}
      </button>
    </div>
  );
};

export default DelegationChecker;
