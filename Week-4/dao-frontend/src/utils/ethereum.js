import { BrowserProvider, Contract } from 'ethers';
import TokenABI from '../abis/DAOToken.json';
import GovernorABI from '../abis/DAOGovernor.json';
import VaultABI from '../abis/CommunityVault.json';

const TARGET_CHAIN_ID = import.meta.env.VITE_CHAIN_ID || 34;
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc.securechain.ai';
const TOKEN_ADDRESS = import.meta.env.VITE_TOKEN_ADDRESS;
const GOVERNOR_ADDRESS = import.meta.env.VITE_GOVERNOR_ADDRESS;
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
const CURRENCY_SYMBOL = import.meta.env.VITE_CURRENCY_SYMBOL || 'SCAI';

export const connectWallet = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed. Please install it to use this app.");
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_requestAccounts", []);
    const network = await provider.getNetwork();

    if (network.chainId.toString() !== TARGET_CHAIN_ID.toString()) {
      await switchToSecureChain();
    }

    const signer = await provider.getSigner();
    return { account: accounts[0], provider, signer };
  } catch (err) {
    console.error("Connection error:", err);
    throw err;
  }
};

export const switchToSecureChain = async () => {
  const chainIdHex = `0x${parseInt(TARGET_CHAIN_ID).toString(16)}`;
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
  } catch (error) {
    if (error.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: chainIdHex,
            chainName: 'SecureChain Mainnet',
            rpcUrls: [RPC_URL],
            nativeCurrency: {
              name: 'SecureChain',
              symbol: CURRENCY_SYMBOL,
              decimals: 18,
            },
          },
        ],
      });
    } else {
      throw error;
    }
  }
};

export const getContracts = async (signerOrProvider) => {
  const token = new Contract(TOKEN_ADDRESS, TokenABI, signerOrProvider);
  const governor = new Contract(GOVERNOR_ADDRESS, GovernorABI, signerOrProvider);
  const vault = new Contract(VAULT_ADDRESS, VaultABI, signerOrProvider);

  return { token, governor, vault };
};
