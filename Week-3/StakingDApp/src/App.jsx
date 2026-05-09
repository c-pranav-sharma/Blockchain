import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { 
  Wallet, Info, ArrowUpCircle, ArrowDownCircle, Coins, 
  ExternalLink, ShieldCheck, Activity, Globe, AlertTriangle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contracts/constants';
import './index.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [chainId, setChainId] = useState(null);
  const [history, setHistory] = useState([]);
  const [isDemo, setIsDemo] = useState(false);
  
  const [stats, setStats] = useState({
    stakedBalance: '0',
    pendingRewards: '0',
    totalStaked: '0',
    walletBalance: '0'
  });

  const addHistory = (type, amt) => {
    const entry = {
      id: Date.now(),
      type,
      amount: amt,
      time: new Date().toLocaleTimeString(),
      status: 'Confirmed'
    };
    setHistory(prev => [entry, ...prev].slice(0, 5));
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        const network = await tempProvider.getNetwork();
        const signer = await tempProvider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        setChainId(network.chainId.toString());
        setAccount(accounts[0]);
        setProvider(tempProvider);
        setContract(tempContract);
        toast.success("Wallet Connected Successfully!");
        setLoading(false);
      } catch (error) {
        toast.error("Connection failed!");
        setLoading(false);
      }
    } else {
      toast.error("MetaMask not found!");
    }
  };

  const fetchStats = useCallback(async () => {
    if (!contract || !account) return;
    try {
      const [staked, pending, total, balance] = await Promise.all([
        contract.stakedBalance(account),
        contract.pendingRewards(account),
        contract.totalStaked(),
        provider.getBalance(account)
      ]);

      setStats({
        stakedBalance: ethers.formatEther(staked),
        pendingRewards: ethers.formatEther(pending),
        totalStaked: ethers.formatEther(total),
        walletBalance: parseFloat(ethers.formatEther(balance)).toFixed(4)
      });
    } catch (error) {
      console.error("Fetch error:", error);
    }
  }, [contract, account, provider]);

  useEffect(() => {
    if (isDemo) {
      setStats({
        stakedBalance: '150.0',
        pendingRewards: '12.5',
        totalStaked: '45000.0',
        walletBalance: '500.0'
      });
      return;
    }

    if (account && contract) {
      fetchStats();
      const interval = setInterval(fetchStats, 10000);
      return () => clearInterval(interval);
    }
  }, [account, contract, fetchStats, isDemo]);

  const handleAction = async (actionType, method, ...args) => {
    if (!amount || isNaN(amount)) {
      toast.error("Please enter a valid amount");
      return;
    }
    
    try {
      setLoading(true);
      toast.loading(`Processing ${actionType}...`, { id: 'tx' });

      if (isDemo) {
        if (actionType === 'Withdraw' && parseFloat(amount) > parseFloat(stats.stakedBalance)) {
          toast.error("Cannot withdraw more than staked!", { id: 'tx' });
          setLoading(false);
          return;
        }

        await new Promise(r => setTimeout(r, 1500)); // Simulate delay
        toast.success(`${actionType} (Demo) Successful!`, { id: 'tx' });
        
        // Update stats locally for demo
        if (actionType === 'Stake') {
          setStats(prev => ({ 
            ...prev, 
            stakedBalance: (parseFloat(prev.stakedBalance) + parseFloat(amount)).toString(),
            walletBalance: (parseFloat(prev.walletBalance) - parseFloat(amount)).toString()
          }));
        } else {
          setStats(prev => ({ 
            ...prev, 
            stakedBalance: (parseFloat(prev.stakedBalance) - parseFloat(amount)).toString(),
            walletBalance: (parseFloat(prev.walletBalance) + parseFloat(amount)).toString()
          }));
        }
      } else {
        const txPromise = actionType === 'Stake' 
          ? method({ value: ethers.parseEther(amount) })
          : method(...args);
        
        const tx = await txPromise;
        await tx.wait();
        toast.success(`${actionType} Successful!`, { id: 'tx' });
        fetchStats();
      }
      
      addHistory(actionType, amount);
      setAmount('');
    } catch (error) {
      console.error(error);
      
      // Detailed Error Handling
      let errorMsg = `${actionType} Failed!`;
      if (error.code === 'ACTION_REJECTED') errorMsg = "Transaction Rejected by User";
      if (error.code === 'INSUFFICIENT_FUNDS') errorMsg = "Insufficient Funds in Wallet";
      if (error.code === 'INVALID_ARGUMENT') errorMsg = "Invalid Amount Entered";
      if (error.code === 'CALL_EXCEPTION') errorMsg = "Contract Error: Ensure address is correct";
      
      toast.error(errorMsg, { id: 'tx' });
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setLoading(true);
      toast.loading("Claiming Rewards...", { id: 'claim' });
      
      if (isDemo) {
        await new Promise(r => setTimeout(r, 1500));
        toast.success("Rewards (Demo) Claimed!", { id: 'claim' });
        setStats(prev => ({ ...prev, pendingRewards: '0' }));
      } else {
        const tx = await contract.claimRewards();
        await tx.wait();
        toast.success("Rewards Claimed!", { id: 'claim' });
        fetchStats();
      }
      
      addHistory('Claim', stats.pendingRewards);
    } catch (error) {
      toast.error("Claim Failed!", { id: 'claim' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Toaster position="top-right" reverseOrder={false} />
      
      <header>
        <div className="logo">
          SCAI<span>STAKING</span>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <button 
            className={`connect-btn ${isDemo ? 'demo-active' : ''}`} 
            style={{ background: isDemo ? 'var(--success)' : 'rgba(255,255,255,0.05)', border: '1px solid var(--card-border)' }}
            onClick={() => {
              setIsDemo(!isDemo);
              if (!isDemo) toast("Presentation Mode Active", { icon: '📺' });
            }}
          >
            {isDemo ? "Presentation Mode: ON" : "Presentation Mode: OFF"}
          </button>
          {account && !isDemo && (
            <div className="network-badge">
              <Globe size={14} />
              <span>Chain ID: {chainId}</span>
            </div>
          )}
          <button className="connect-btn" onClick={connectWallet} disabled={loading}>
            <Wallet size={18} />
            {account ? `${account.substring(0, 6)}...${account.substring(38)}` : "Connect Wallet"}
          </button>
        </div>
      </header>

      <main>
        <div className="dashboard-grid">
          <StatCard label="Your Staked Balance" value={`${stats.stakedBalance} SCAI`} delay={0} />
          <StatCard label="Total Value Locked" value={`${stats.totalStaked} SCAI`} delay={0.1} />
          <StatCard label="Wallet Balance" value={`${stats.walletBalance} SCAI`} delay={0.2} />
        </div>

        <div className="staking-main">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card staking-form">
            <div className="card-header">
              <ShieldCheck color="#00d2ff" />
              <h2>Staking Dashboard</h2>
            </div>
            
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="stat-label">Enter Amount</label>
                <span className="stat-label" style={{ fontSize: '0.75rem' }}>Balance: {stats.walletBalance}</span>
              </div>
              <div className="input-wrapper">
                <input 
                  type="text" placeholder="0.0" value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!account || loading}
                />
                <button className="max-btn" onClick={() => setAmount(stats.walletBalance)}>MAX</button>
              </div>
            </div>

            <div className="action-buttons">
              <button className="btn btn-primary" onClick={() => handleAction('Stake', contract.stake)} disabled={!account || loading || !amount}>
                <ArrowUpCircle size={18} /> Stake SCAI
              </button>
              <button className="btn btn-outline" onClick={() => handleAction('Withdraw', contract.withdraw, ethers.parseEther(amount))} disabled={!account || loading || !amount}>
                <ArrowDownCircle size={18} /> Withdraw
              </button>
            </div>

            <div className="history-section">
              <div className="card-header" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                <Activity size={18} color="#94a3b8" />
                <h3 style={{ fontSize: '1rem', color: '#94a3b8' }}>Recent Activity</h3>
              </div>
              {history.length === 0 ? (
                <p className="stat-label" style={{ textAlign: 'center', py: '1rem' }}>No recent transactions</p>
              ) : (
                <div className="history-list">
                  {history.map(item => (
                    <div key={item.id} className="history-item">
                      <span className={`type-tag ${item.type.toLowerCase()}`}>{item.type}</span>
                      <span className="hist-amt">{item.amount} {item.type === 'Claim' ? 'SRT' : 'SCAI'}</span>
                      <span className="hist-time">{item.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="glass-card rewards-card">
            <Coins size={48} className="floating-icon" />
            <span className="stat-label">Estimated Rewards (SRT)</span>
            <span className="reward-amount">{stats.pendingRewards}</span>
            <button 
              className="btn claim-btn" onClick={handleClaim}
              disabled={!account || loading || stats.pendingRewards === '0.0'}
            >
              Claim All Rewards
            </button>
            
            <div className="info-footer">
              <div className="info-row">
                <Info size={14} />
                <span>APY: 10% (Fixed Rate)</span>
              </div>
              <div className="info-row">
                <Coins size={14} color="#9d50bb" />
                <span style={{ textAlign: 'left' }}>Rewards are paid in <strong>SRT (Staking Reward Token)</strong>, an ERC20 token minted directly to your wallet when you claim.</span>
              </div>
              <a href="https://github.com/c-pranav-sharma/Blockchain/blob/main/Week-3/SCAIStaking.sol" target="_blank" rel="noopener noreferrer" className="contract-link">
                View Smart Contract Source <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {loading && <LoadingOverlay />}
      </AnimatePresence>
    </div>
  );
}

// Sub-components for cleaner structure
const StatCard = ({ label, value, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="glass-card stat-card">
    <span className="stat-label">{label}</span>
    <span className="stat-value">{value}</span>
  </motion.div>
);

const LoadingOverlay = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="overlay">
    <div className="loading-spinner"></div>
  </motion.div>
);

export default App;
