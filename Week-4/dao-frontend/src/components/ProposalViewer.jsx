import React, { useState, useEffect } from 'react';
import { getContracts } from '../utils/ethereum';
import { formatEther } from 'ethers';

const ProposalViewer = ({ signer, account, selectedProposalId, onProposalSelected, onProposalDataFetched }) => {
  const [searchInput, setSearchInput] = useState('');
  const [proposalId, setProposalId] = useState('');
  const [proposalState, setProposalState] = useState(null);
  const [proposalDetails, setProposalDetails] = useState(null);
  const [timeStats, setTimeStats] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  
  const [recentProposals, setRecentProposals] = useState([]);
  const [isFetchingRecent, setIsFetchingRecent] = useState(false);

  const formatTime = (seconds) => {
    if (seconds <= 0) return "Almost there...";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) return `~${h}h ${m}m`;
    return `~${m}m`;
  };

  useEffect(() => {
    if (selectedProposalId && selectedProposalId !== proposalId && selectedProposalId.length > 5) {
      setSearchInput(selectedProposalId);
      executeSearch(selectedProposalId);
    }
  }, [selectedProposalId]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (!signer || !searchInput || searchInput.length < 5) return;
    executeSearch(searchInput);
  };

  const executeSearch = async (idToSearch) => {
    setIsSearching(true);
    setProposalId(idToSearch);

    try {
      if (onProposalSelected) onProposalSelected(idToSearch);
      
      const { governor } = await getContracts(signer);
      
      // Fetch current state
      const stateCode = await governor.state(idToSearch);
      const states = ['Pending', 'Active', 'Canceled', 'Defeated', 'Succeeded', 'Queued', 'Expired', 'Executed'];
      const currentState = states[Number(stateCode)] || 'Unknown';
      setProposalState(currentState);

      // Fetch deep details
      const proposer = await governor.proposalProposer(idToSearch);
      const snapshot = await governor.proposalSnapshot(idToSearch);
      const deadline = await governor.proposalDeadline(idToSearch);
      const votes = await governor.proposalVotes(idToSearch);

      // Fetch current block for time estimation
      const currentBlock = await signer.provider.getBlockNumber();
      let blocksRemaining = 0;
      let estimatedTime = "";

      if (currentState === 'Pending') {
        blocksRemaining = Number(snapshot) - currentBlock;
        estimatedTime = formatTime(blocksRemaining * 2); // 2 seconds per block
      } else if (currentState === 'Active') {
        blocksRemaining = Number(deadline) - currentBlock;
        estimatedTime = formatTime(blocksRemaining * 2);
      }

      setTimeStats({
        currentBlock,
        blocksRemaining: blocksRemaining > 0 ? blocksRemaining : 0,
        estimatedTime
      });

      // Try to fetch the description from events (last 100k blocks)
      let descriptionText = "View description on Block Explorer (Event Logs)";
      const filter = governor.filters.ProposalCreated();
      
      // Chunked scan - walk backwards in 2000-block pages (RPC safe)
      const CHUNK = 2000n;
      const MAX_CHUNKS = 30;
      const curBlock = BigInt(await signer.provider.getBlockNumber());
      let events = [];
      for (let i = 0; i < MAX_CHUNKS; i++) {
        const toBlock = curBlock - BigInt(i) * CHUNK;
        const fromBlock = toBlock - CHUNK + 1n > 0n ? toBlock - CHUNK + 1n : 0n;
        try {
          const chunk = await governor.queryFilter(filter, fromBlock, toBlock);
          if (chunk.length > 0) {
            const found = chunk.find(e => e.args[0].toString() === idToSearch);
            if (found) { events = [found]; break; }
          }
        } catch (e) { /* skip bad chunk */ }
        if (fromBlock === 0n) break;
      }

      const foundEvent = events.find(e => e.args[0].toString() === idToSearch);
      if (foundEvent) {
        descriptionText = foundEvent.args[8];
        if (onProposalDataFetched) onProposalDataFetched(foundEvent.args);
      } else {
        if (onProposalDataFetched) onProposalDataFetched(null);
      }
      setProposalDetails({
        proposer,
        description: descriptionText,
        snapshot: snapshot.toString(),
        deadline: deadline.toString(),
        forVotes: formatEther(votes.forVotes),
        againstVotes: formatEther(votes.againstVotes),
        abstainVotes: formatEther(votes.abstainVotes)
      });

    } catch (err) {
      setProposalState('Invalid ID');
      setProposalDetails(null);
      setTimeStats(null);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchMyProposals = async () => {
    if (!signer || !account) return;
    try {
      setIsFetchingRecent(true);
      const { governor } = await getContracts(signer);
      const filter = governor.filters.ProposalCreated();
      
      // Chunked scan - walk backwards in 2000-block pages (RPC safe)
      const CHUNK = 2000n;
      const MAX_CHUNKS = 30; // scan up to 60,000 blocks = ~33 hours
      const currentBlock = BigInt(await signer.provider.getBlockNumber());
      let events = [];
      for (let i = 0; i < MAX_CHUNKS; i++) {
        const toBlock = currentBlock - BigInt(i) * CHUNK;
        const fromBlock = toBlock - CHUNK + 1n > 0n ? toBlock - CHUNK + 1n : 0n;
        try {
          const chunk = await governor.queryFilter(filter, fromBlock, toBlock);
          events = [...events, ...chunk];
        } catch (e) {
          // This chunk failed, skip it silently
        }
        if (fromBlock === 0n) break;
      }
      
      // Filter by the connected account
      const myEvents = events.filter(e => e.args[1].toLowerCase() === account.toLowerCase());
      
      const formatted = myEvents.map(e => ({
        id: e.args[0].toString(),
        description: e.args[8]
      })).reverse(); // Newest first
      
      setRecentProposals(formatted);
      if(formatted.length === 0) alert("No recent proposals found for your address on the network.");
    } catch(err) {
      console.error(err);
      alert("Failed to scan network for proposals.");
    } finally {
      setIsFetchingRecent(false);
    }
  };

  return (
    <div className="glass-panel" style={{ marginBottom: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        Proposal Explorer
      </h3>
      
      <form onSubmit={handleSearch} className="flex-row" style={{ marginBottom: proposalState ? '1rem' : '0' }}>
        <input 
          type="text" 
          placeholder="Search by Proposal ID..." 
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          style={{ marginBottom: 0, flex: 1 }}
        />
        <button type="submit" className="btn" disabled={isSearching || !searchInput}>
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {(!proposalState || proposalState === 'Invalid ID') && (
        <div style={{ marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Forgot your ID?</span>
            <button type="button" onClick={fetchMyProposals} className="btn" style={{ background: 'rgba(108, 92, 231, 0.2)', border: '1px solid var(--primary)', color: 'white', padding: '0.4rem 0.8rem', fontSize: '0.85rem', fontWeight: '500' }} disabled={isFetchingRecent}>
              {isFetchingRecent ? '⏳ Scanning Blockchain...' : 'Find My Proposals'}
            </button>
          </div>
          {isFetchingRecent && (
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem', textAlign: 'right' }}>
              Scanning recent blocks in chunks — this may take 10–20 seconds...
            </p>
          )}
        </div>
      )}

      {recentProposals.length > 0 && (
        <div className="animate-fade-in" style={{ marginTop: '1rem', background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
          <h5 style={{ color: 'var(--primary)', marginBottom: '0.8rem', fontSize: '0.9rem' }}>Your Recent Proposals</h5>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '200px', overflowY: 'auto' }}>
            {recentProposals.map(p => (
              <li key={p.id} style={{ marginBottom: '0.8rem', background: 'rgba(255,255,255,0.02)', padding: '0.8rem', borderRadius: '6px', cursor: 'pointer', transition: 'background 0.2s' }} 
                  onMouseOver={(e) => e.currentTarget.style.background = 'rgba(108, 92, 231, 0.1)'}
                  onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                  onClick={() => { setSearchInput(p.id); setRecentProposals([]); executeSearch(p.id); }}>
                <strong style={{ color: 'var(--text-main)', display: 'block', fontSize: '0.95rem', marginBottom: '0.2rem' }}>{p.description.slice(0, 60)}{p.description.length > 60 ? '...' : ''}</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>ID: {p.id}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

        <div className="alert-box animate-fade-in" style={{ marginTop: '1rem', background: proposalState === 'Active' ? 'rgba(0, 184, 148, 0.1)' : (proposalState === 'Pending' ? 'rgba(243, 156, 18, 0.1)' : 'rgba(255,255,255,0.05)'), borderLeftColor: proposalState === 'Active' ? 'var(--success)' : (proposalState === 'Pending' ? '#f39c12' : 'gray'), display: 'block' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: 'var(--text-muted)' }}>Current State:</span>
            <strong style={{ color: proposalState === 'Active' ? 'var(--success)' : (proposalState === 'Pending' ? '#f39c12' : 'white'), fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>{proposalState}</strong>
          </div>
          
          {proposalState === 'Pending' && timeStats && (
            <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: '#f39c12', fontSize: '0.85rem', fontWeight: '600' }}>VOTING DELAY ACTIVE</span>
                <span style={{ color: 'white', fontSize: '0.85rem' }}>{timeStats.estimatedTime} remaining</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>Waiting for {timeStats.blocksRemaining.toLocaleString()} blocks to be mined before voting begins.</p>
            </div>
          )}

          {proposalState === 'Active' && timeStats && (
            <div style={{ marginTop: '1rem', padding: '0.8rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                <span style={{ color: 'var(--success)', fontSize: '0.85rem', fontWeight: '600' }}>VOTING IS OPEN</span>
                <span style={{ color: 'white', fontSize: '0.85rem' }}>Closes in {timeStats.estimatedTime}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', margin: 0 }}>{timeStats.blocksRemaining.toLocaleString()} blocks remaining until snapshot deadline.</p>
            </div>
          )}
        </div>

      {proposalDetails && (
        <div className="animate-fade-in" style={{ marginTop: '1.5rem', background: 'linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(0,0,0,0.2) 100%)', borderRadius: '12px', border: '1px solid var(--glass-border)', overflow: 'hidden' }}>
          
          <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
            <h5 style={{ color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px', marginBottom: '0.5rem' }}>Proposal Description</h5>
            <p style={{ color: 'var(--text-main)', fontSize: '1.1rem', fontWeight: '500', margin: 0, lineHeight: '1.5' }}>{proposalDetails.description}</p>
          </div>

          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.2)', padding: '0.8rem 1rem', borderRadius: '8px' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Proposer</span>
              <span style={{ fontFamily: 'monospace', color: 'var(--primary)', background: 'rgba(108, 92, 231, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
                {proposalDetails.proposer.slice(0,6)}...{proposalDetails.proposer.slice(-4)}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ background: 'rgba(0, 184, 148, 0.05)', border: '1px solid rgba(0, 184, 148, 0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>For Votes</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--success)' }}>{proposalDetails.forVotes}</div>
              </div>
              <div style={{ background: 'rgba(255, 118, 117, 0.05)', border: '1px solid rgba(255, 118, 117, 0.2)', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.3rem' }}>Against Votes</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--danger)' }}>{proposalDetails.againstVotes}</div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '1rem', marginTop: '0.5rem' }}>
              <span><strong style={{color:'white'}}>Snapshot Block:</strong> {proposalDetails.snapshot}</span>
              <span><strong style={{color:'white'}}>Deadline Block:</strong> {proposalDetails.deadline}</span>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default ProposalViewer;
