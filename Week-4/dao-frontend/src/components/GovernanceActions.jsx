import React, { useState, useEffect } from 'react';
import { getContracts } from '../utils/ethereum';
import { ethers } from 'ethers';

const GovernanceActions = ({ signer, selectedProposalId, onProposalSelected, proposalEventData }) => {
  const [proposalId, setProposalId] = useState('');
  const [voteSupport, setVoteSupport] = useState('1'); // 0=Against, 1=For, 2=Abstain
  const [loadingAction, setLoadingAction] = useState(null);

  useEffect(() => {
    if (selectedProposalId) {
      setProposalId(selectedProposalId);
    }
  }, [selectedProposalId]);

  const handleVote = async () => {
    if (!signer || !proposalId) return;
    try {
      setLoadingAction('vote');
      const { governor } = await getContracts(signer);
      const tx = await governor.castVote(proposalId, Number(voteSupport));
      await tx.wait();
      alert("Vote cast successfully!");
    } catch (err) {
      console.error(err);
      alert("Vote failed. " + (err.reason || err.message));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleQueue = async () => {
    if (!signer || !proposalId) return;
    if (!proposalEventData) {
      alert("Proposal data not found. Please search for the ID first to fetch the encoded calldata.");
      return;
    }
    try {
      setLoadingAction('queue');
      const { governor } = await getContracts(signer);
      
      const targets = proposalEventData[2];
      const values = proposalEventData[3];
      const calldatas = proposalEventData[5];
      const descriptionHash = ethers.id(proposalEventData[8]);
      
      const tx = await governor.queue(targets, values, calldatas, descriptionHash);
      await tx.wait();
      alert("Proposal queued successfully! Wait for the timelock duration to expire.");
    } catch (err) {
      console.error(err);
      alert("Queue failed. " + (err.reason || err.message));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleExecute = async () => {
    if (!signer || !proposalId) return;
    if (!proposalEventData) {
      alert("Proposal data not found. Please search for the ID first to fetch the encoded calldata.");
      return;
    }
    try {
      setLoadingAction('execute');
      const { governor } = await getContracts(signer);
      
      const targets = proposalEventData[2];
      const values = proposalEventData[3];
      const calldatas = proposalEventData[5];
      const descriptionHash = ethers.id(proposalEventData[8]);
      
      const tx = await governor.execute(targets, values, calldatas, descriptionHash);
      await tx.wait();
      alert("Proposal executed successfully! Treasury funds have been dispensed.");
    } catch (err) {
      console.error(err);
      alert("Execution failed. " + (err.reason || err.message));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        Governance Actions
      </h3>
      
      <div className="input-group">
        <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Target Proposal ID</label>
        <input 
          type="text" 
          placeholder="Paste ID to interact..." 
          value={proposalId}
          onChange={(e) => {
            setProposalId(e.target.value);
            if (onProposalSelected) onProposalSelected(e.target.value);
          }}
        />
      </div>
      
      <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(0,0,0,0.1)' }}>
        <h4 style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>Cast Your Vote</h4>
        <div className="flex-row">
          <select value={voteSupport} onChange={(e) => setVoteSupport(e.target.value)} style={{ marginBottom: 0 }}>
            <option value="1">👍 For</option>
            <option value="0">👎 Against</option>
            <option value="2">⚖️ Abstain</option>
          </select>
          <button className="btn" onClick={handleVote} disabled={loadingAction === 'vote' || !proposalId} style={{ whiteSpace: 'nowrap' }}>
            {loadingAction === 'vote' ? 'Voting...' : 'Cast Vote'}
          </button>
        </div>
      </div>

      <div className="flex-row">
        <button 
          className="btn" 
          style={{ flex: 1, background: 'rgba(255, 255, 255, 0.1)' }} 
          onClick={handleQueue} 
          disabled={loadingAction === 'queue' || !proposalId}
        >
          Queue
        </button>
        <button 
          className="btn" 
          style={{ flex: 1, background: 'rgba(0, 184, 148, 0.2)', color: 'var(--success)' }} 
          onClick={handleExecute} 
          disabled={loadingAction === 'execute' || !proposalId}
        >
          Execute
        </button>
      </div>
    </div>
  );
};

export default GovernanceActions;
