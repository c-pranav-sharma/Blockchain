import React from 'react';
import Dashboard from '../components/Dashboard';

const Home = ({ account, daoData, signer, refreshData }) => {
  return (
    <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <Dashboard 
        account={account} 
        daoData={daoData} 
        signer={signer} 
        refreshData={refreshData} 
      />
    </div>
  );
};

export default Home;
