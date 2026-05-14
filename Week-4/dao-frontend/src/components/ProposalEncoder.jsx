import React, { useState } from 'react';
import { getContracts } from '../utils/ethereum';
import { Interface, parseEther, id } from 'ethers';
import VaultABI from '../abis/CommunityVault.json';

const ProposalEncoder = ({ signer }) => {
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [proposalId, setProposalId] = useState(null);

  const handlePropose = async (e) => {
    e.preventDefault();
    if (!signer) return alert("Connect wallet first");
    
    // Validations
    if (!recipient.match(/^0x[a-fA-F0-9]{40}$/)) return alert("Invalid recipient address");
    if (isNaN(amount) || Number(amount) <= 0) return alert("Invalid amount");

    try {
      setIsLoading(true);
      const { governor, vault } = await getContracts(signer);
      
      const vaultInterface = new Interface(VaultABI);
      const encodedCall = vaultInterface.encodeFunctionData("dispenseFunds", [
        recipient,
        parseEther(amount)
      ]);

      const vaultAddress = await vault.getAddress();

      const tx = await governor.propose(
        [vaultAddress],
        [0],
        [encodedCall],
        description
      );

      // Calculate the actual Proposal ID!
      const descriptionHash = id(description);
      const computedProposalId = await governor.hashProposal(
        [vaultAddress],
        [0],
        [encodedCall],
        descriptionHash
      );

      setProposalId(computedProposalId.toString());
      
      // Reset form
      setRecipient('');
      setAmount('');
      setDescription('');
    } catch (err) {
      console.error("Proposal creation failed:", err);
      alert("Failed to create proposal. " + (err.reason || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel">
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
        New Treasury Proposal
      </h3>
      <form onSubmit={handlePropose}>
        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Recipient Address</label>
          <input 
            type="text" 
            placeholder="0x..." 
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Amount (SCAI)</label>
          <input 
            type="number" 
            step="0.0001"
            placeholder="e.g. 100.5" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Proposal Description</label>
          <textarea 
            placeholder="Why should the DAO fund this?" 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <button 
          type="submit" 
          className="btn"
          disabled={isLoading}
          style={{ width: '100%' }}
        >
          {isLoading ? 'Encoding & Submitting...' : 'Submit Proposal to DAO'}
        </button>
      </form>
      
      {proposalId && (
        <div className="alert-box animate-fade-in" style={{ marginTop: '1.5rem', background: 'rgba(0, 184, 148, 0.1)', borderLeftColor: 'var(--success)', display: 'block' }}>
          <h4 style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>Proposal Created!</h4>
          <p style={{ color: 'var(--text-main)', margin: 0, fontSize: '0.9rem', marginBottom: '0.5rem' }}>Your Proposal ID (Save this to vote):</p>
          <p style={{ color: 'var(--success)', margin: 0, wordBreak: 'break-all', fontFamily: 'monospace', background: 'rgba(0,0,0,0.2)', padding: '0.5rem', borderRadius: '4px' }}>{proposalId}</p>
        </div>
      )}
    </div>
  );
};

export default ProposalEncoder;
