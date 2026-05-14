import React, { useState, useEffect } from 'react';
import { connectWallet } from './utils/ethereum';
import { useDAO } from './hooks/useDAO';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Proposals from './pages/Proposals';

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState('');

  const { daoData, refreshDAOData } = useDAO(account, provider);

  const handleConnect = async () => {
    try {
      setError('');
      const { account, provider, signer } = await connectWallet();
      setAccount(account);
      setProvider(provider);
      setSigner(signer);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount('');
          setProvider(null);
          setSigner(null);
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }, []);

  return (
    <div className="app-container">
      <Navbar account={account} handleConnect={handleConnect} />

      {error && (
        <div className="alert-box" style={{ background: 'rgba(255, 118, 117, 0.2)', borderLeftColor: 'var(--danger)' }}>
          <div>
            <h4>Connection Error</h4>
            <p>{error}</p>
          </div>
        </div>
      )}

      <main>
        <Routes>
          <Route path="/" element={<Home account={account} daoData={daoData} signer={signer} refreshData={refreshDAOData} />} />
          <Route path="/proposals" element={<Proposals signer={signer} account={account} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
