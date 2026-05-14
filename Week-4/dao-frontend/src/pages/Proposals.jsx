import React, { useState } from 'react';
import ProposalEncoder from '../components/ProposalEncoder';
import ProposalViewer from '../components/ProposalViewer';
import GovernanceActions from '../components/GovernanceActions';

const Proposals = ({ signer, account }) => {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedProposalId, setSelectedProposalId] = useState('');
  const [proposalEventData, setProposalEventData] = useState(null);

  if (!account) {
    return (
      <div className="glass-panel" style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>Please Connect Your Wallet</h2>
        <p style={{ color: 'var(--text-muted)' }}>You must be connected to the network to interact with DAO proposals.</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '2rem', marginBottom: '2.5rem', borderBottom: '1px solid var(--glass-border)' }}>
        <button 
          onClick={() => setActiveTab('explore')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: activeTab === 'explore' ? 'var(--primary)' : 'var(--text-muted)', 
            fontSize: '1.2rem', 
            fontWeight: activeTab === 'explore' ? '600' : '400', 
            cursor: 'pointer',
            borderBottom: activeTab === 'explore' ? '3px solid var(--primary)' : '3px solid transparent', 
            padding: '0.5rem 1rem',
            transition: 'all 0.3s ease'
          }}
        >
          Explore & Vote
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          style={{ 
            background: 'transparent', 
            border: 'none', 
            color: activeTab === 'create' ? 'var(--primary)' : 'var(--text-muted)', 
            fontSize: '1.2rem', 
            fontWeight: activeTab === 'create' ? '600' : '400', 
            cursor: 'pointer',
            borderBottom: activeTab === 'create' ? '3px solid var(--primary)' : '3px solid transparent', 
            padding: '0.5rem 1rem',
            transition: 'all 0.3s ease'
          }}
        >
          Create New Proposal
        </button>
      </div>

      {/* Tab Content */}
      <div style={{ paddingBottom: '4rem' }}>
        {activeTab === 'explore' && (
          <div className="animate-fade-in">
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem', textAlign: 'center' }}>
              Search for existing proposals, check their real-time voting status, and cast your votes to shape the future of the DAO.
            </p>
            
            <div className="grid-2" style={{ alignItems: 'start', gap: '2rem' }}>
              <div style={{ paddingRight: '1rem' }}>
                <ProposalViewer signer={signer} account={account} selectedProposalId={selectedProposalId} onProposalSelected={setSelectedProposalId} onProposalDataFetched={setProposalEventData} />
              </div>
              <div style={{ paddingLeft: '1rem', borderLeft: '1px dashed rgba(255,255,255,0.1)' }}>
                <GovernanceActions signer={signer} selectedProposalId={selectedProposalId} onProposalSelected={setSelectedProposalId} proposalEventData={proposalEventData} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'create' && (
          <div className="animate-fade-in" style={{ maxWidth: '850px', margin: '0 auto' }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>
              Draft a new treasury proposal. You must have sufficient voting power to submit a proposal to the network.
            </p>
            <ProposalEncoder signer={signer} />
          </div>
        )}
      </div>

    </div>
  );
};

export default Proposals;
