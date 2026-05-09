import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Wallet, Info, ArrowUpCircle, ArrowDownCircle, Coins, ExternalLink, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from './contracts/constants';
import './index.css';

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  
  // Dashboard Stats
  const [stats, setStats] = useState({
    stakedBalance: '0',
    pendingRewards: '0',
    totalStaked: '0',
    walletBalance: '0'
  });

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const tempProvider = new ethers.BrowserProvider(window.ethereum);
        const signer = await tempProvider.getSigner();
        const tempContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        setAccount(accounts[0]);
        setProvider(tempProvider);
        setContract(tempContract);
        setLoading(false);
      } catch (error) {
        console.error("Connection error:", error);
        setLoading(false);
      }
    } else {
      alert("Please install MetaMask!");
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
      console.error("Error fetching stats:", error);
    }
  }, [contract, account, provider]);

  useEffect(() => {
    if (account && contract) {
      fetchStats();
      const interval = setInterval(fetchStats, 10000); // Auto-refresh every 10s
      return () => clearInterval(interval);
    }
  }, [account, contract, fetchStats]);

  const handleStake = async () => {
    if (!amount || isNaN(amount)) return;
    try {
      setLoading(true);
      const tx = await contract.stake({ value: ethers.parseEther(amount) });
      await tx.wait();
      setAmount('');
      fetchStats();
      setLoading(false);
    } catch (error) {
      console.error("Stake failed:", error);
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || isNaN(amount)) return;
    try {
      setLoading(true);
      const tx = await contract.withdraw(ethers.parseEther(amount));
      await tx.wait();
      setAmount('');
      fetchStats();
      setLoading(false);
    } catch (error) {
      console.error("Withdraw failed:", error);
      setLoading(false);
    }
  };

  const handleClaim = async () => {
    try {
      setLoading(true);
      const tx = await contract.claimRewards();
      await tx.wait();
      fetchStats();
      setLoading(false);
    } catch (error) {
      console.error("Claim failed:", error);
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          SCAI<span>STAKING</span>
        </div>
        <button className="connect-btn" onClick={connectWallet} disabled={loading}>
          <Wallet size={18} />
          {account ? `${account.substring(0, 6)}...${account.substring(38)}` : "Connect Wallet"}
        </button>
      </header>

      <main>
        <div className="dashboard-grid">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card stat-card"
          >
            <span className="stat-label">Your Staked Balance</span>
            <span className="stat-value">{stats.stakedBalance} SCAI</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card stat-card"
          >
            <span className="stat-label">Total Protocol Staked</span>
            <span className="stat-value">{stats.totalStaked} SCAI</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card stat-card"
          >
            <span className="stat-label">Wallet Balance</span>
            <span className="stat-value">{stats.walletBalance} SCAI</span>
          </motion.div>
        </div>

        <div className="staking-main">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card staking-form"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <ShieldCheck color="#00d2ff" />
              <h2>Staking Dashboard</h2>
            </div>
            
            <div className="input-group">
              <label className="stat-label">Amount to Stake / Withdraw</label>
              <div className="input-wrapper">
                <input 
                  type="text" 
                  placeholder="0.0" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={!account || loading}
                />
                <button className="max-btn" onClick={() => setAmount(stats.walletBalance)}>MAX</button>
              </div>
            </div>

            <div className="action-buttons">
              <button 
                className="btn btn-primary" 
                onClick={handleStake}
                disabled={!account || loading || !amount}
              >
                <ArrowUpCircle size={18} style={{ marginRight: '8px' }} />
                Stake SCAI
              </button>
              <button 
                className="btn btn-outline" 
                onClick={handleWithdraw}
                disabled={!account || loading || !amount}
              >
                <ArrowDownCircle size={18} style={{ marginRight: '8px' }} />
                Withdraw
              </button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="glass-card rewards-card"
          >
            <Coins size={48} color="#00d2ff" style={{ marginBottom: '1rem' }} />
            <span className="stat-label">Pending Rewards (SRT)</span>
            <span className="reward-amount">{stats.pendingRewards}</span>
            <button 
              className="btn claim-btn" 
              onClick={handleClaim}
              disabled={!account || loading || stats.pendingRewards === '0.0'}
            >
              Claim All Rewards
            </button>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.8rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Info size={14} />
                <span>APY: 10% (Fixed)</span>
              </div>
              <a href="#" style={{ color: '#00d2ff', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                View Contract <ExternalLink size={12} />
              </a>
            </div>
          </motion.div>
        </div>
      </main>

      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'center',
              alignItems: 'center', zIndex: 1000
            }}
          >
            <div className="loading-spinner" style={{ width: '50px', height: '50px', border: '5px solid rgba(255,255,255,0.1)', borderTopColor: '#00d2ff', borderRadius: '50%' }}></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
