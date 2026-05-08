# Web3 Minting Lifecycle Simulator

An interactive educational tool demonstrating the step-by-step process of minting tokens on the blockchain, from a backend API call to smart contract finalization.

## 🌟 Features
- **Visual Pipeline**: Watch the data packet travel through 5 distinct stages of the Web3 lifecycle.
- **Dynamic Highlights**: Each node (API, Wallet, RPC, Mempool, Smart Contract) lights up as it processes the request.
- **Real-time Logs**: See the simulated backend actions as they happen.
- **Transaction Hash Generation**: Get a simulated TX hash upon successful minting.
- **Premium UI**: Dark-themed, glassmorphic design with smooth Framer Motion animations.

## 🛠️ Tech Stack
- **Frontend**: React, TypeScript, Vite
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Modern Custom Properties)

## 🚀 Getting Started

1. **Navigate to the project folder**:
   ```bash
   cd d:/BlockChain/Week-2/FullStack/web3-minting-simulator
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Run the simulator**:
   ```bash
   npm run dev
   ```
   Open the provided URL in your browser to start the simulation.

## 📚 The Lifecycle Stages
1. **Node.js Express API**: Constructs the transaction payload (to, value, data).
2. **ethers.js Wallet**: Signs the transaction securely using a private key.
3. **RPC Provider**: Broadcasts the signed transaction to the SecureChain network.
4. **Blockchain Mempool**: The transaction waits to be picked up and processed by miners/validators.
5. **Smart Contract**: The code executes on-chain, and the minting event is emitted.

---
Built as part of the FullStack Blockchain Development Course.
