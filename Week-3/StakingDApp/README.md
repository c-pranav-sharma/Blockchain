# 🚀 SCAIStaking DApp (Deliverable)

A professional, full-stack Web3 Staking application built for the SecureChain AI (SCAI) ecosystem. This project demonstrates end-to-end integration between a custom Solidity smart contract, a React/Vite frontend, and a Node.js/ML security layer.

## 🔗 Live Demo & Deployment
*   **Live App**: [scai-staking.vercel.app](https://blockchain-wine-sigma.vercel.app/) (Placeholder)
*   **Github Repo**: [github.com/c-pranav-sharma/Blockchain](https://github.com/c-pranav-sharma/Blockchain)

## ✨ Key Features
*   **Wallet Integration**: Full MetaMask support using `ethers.js` (BrowserProvider).
*   **Staking Mechanism**: Native SCAI staking with real-time reward calculation (SRT tokens).
*   **Real-time Dashboard**: Dynamic stats for staked balance, protocol TVL, and wallet balance.
*   **Premium UI/UX**: Built with React, Vanilla CSS (Glassmorphism), and `framer-motion` for smooth animations.
*   **Security Service**: Integrated with an ML-based Anomaly Detection engine to flag suspicious staking patterns.

## 🛠️ Technology Stack
*   **Blockchain**: Solidity, OpenZeppelin (ERC20, ReentrancyGuard).
*   **Frontend**: React.js, Vite, Ethers.js.
*   **Styling**: Vanilla CSS (Custom Design System).
*   **Security**: Python, Scikit-learn (Isolation Forest for Bot Detection).

## 📂 Project Structure
```text
├── src/
│   ├── contracts/        # ABI and Contract Constants
│   ├── App.jsx           # Main Application Logic
│   ├── index.css         # Custom Design System
│   └── main.jsx          # Entry point
├── MLService/            # Python-based Security Layer
├── Simulator/            # Architecture Flow Visualization
└── SCAIStaking.sol       # Core Smart Contract
```

## 🚀 Getting Started
1.  **Install Dependencies**:
    ```bash
    npm install
    ```
2.  **Run Development Server**:
    ```bash
    npm run dev
    ```
3.  **Build for Production**:
    ```bash
    npm run build
    ```

## 🔐 Security Features
The DApp includes a dedicated **ML Service** that monitors transaction logs to detect:
*   **Sybil Attacks**: Multiple accounts performing micro-staking.
*   **Bot Activity**: High-frequency transactions flagging suspicious patterns.

---
**Deliverable for**: Staking DApp Completion  
**Author**: Pranav Sharma  
**Repository**: [Blockchain Repository](https://github.com/c-pranav-sharma/Blockchain)
