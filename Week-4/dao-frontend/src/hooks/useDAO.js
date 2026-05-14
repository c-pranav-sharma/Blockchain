import { useState, useEffect } from 'react';
import { getContracts } from '../utils/ethereum';
import { formatEther } from 'ethers';

export const useDAO = (account, provider) => {
  const [daoData, setDaoData] = useState({
    treasuryBalance: '0',
    userVotes: '0',
    userBalance: '0',
    isLoading: true,
  });

  const fetchDAOData = async () => {
    if (!provider) return;
    
    try {
      setDaoData(prev => ({ ...prev, isLoading: true }));
      const { token, vault } = await getContracts(provider);
      
      const balance = await vault.getVaultBalance();
      const treasuryBalance = formatEther(balance);
      
      let userVotes = '0';
      let userBalance = '0';

      if (account) {
        const votes = await token.getVotes(account);
        const tokenBal = await token.balanceOf(account);
        userVotes = formatEther(votes);
        userBalance = formatEther(tokenBal);
      }

      setDaoData({
        treasuryBalance,
        userVotes,
        userBalance,
        isLoading: false,
      });
    } catch (err) {
      console.error("Error fetching DAO data:", err);
      setDaoData(prev => ({ ...prev, isLoading: false }));
    }
  };

  useEffect(() => {
    fetchDAOData();
    // In a real app, you might want to add event listeners here
  }, [account, provider]);

  return { daoData, refreshDAOData: fetchDAOData };
};

export const proposalStateMapper = (stateCode) => {
  const states = {
    0: 'Pending',
    1: 'Active',
    2: 'Canceled',
    3: 'Defeated',
    4: 'Succeeded',
    5: 'Queued',
    6: 'Expired',
    7: 'Executed'
  };
  return states[stateCode] || 'Unknown';
};
