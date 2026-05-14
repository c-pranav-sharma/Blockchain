# DAO Frontend Architecture & Implementation Plan

This document outlines the architecture, setup instructions, and deployment checklist for the React + Vite frontend communicating with the SecureChain DAO smart contracts.

## 1. Folder Structure

We follow a modular approach for scalability and clean code separation:

```text
dao-frontend/
├── public/              # Static assets
├── src/
│   ├── abis/            # Contract ABI JSON files (copied from Remix/Hardhat)
│   ├── components/      # React UI components (Dashboard, ProposalEncoder, etc.)
│   ├── hooks/           # Custom React hooks (e.g., useDAO.js)
│   ├── utils/           # Helper scripts (ethereum.js, contract instances)
│   ├── App.jsx          # Main application file
│   ├── main.jsx         # React entry point
│   └── index.css        # Global CSS styles
├── .env                 # Environment variables
├── vite.config.js       # Vite bundler configuration
└── package.json         # Node.js dependencies
```

## 2. ABI Integration

**What are ABIs?**
The Application Binary Interface (ABI) is a JSON representation of a smart contract's methods and structures. The frontend uses it to encode and decode data when interacting with the blockchain.

**Where to store them:**
Store all `.json` files inside the `src/abis/` folder.

**How to get them from Remix:**
1. In Remix IDE, navigate to the **Solidity Compiler** plugin.
2. Compile your contract.
3. At the bottom of the plugin, click **ABI** to copy the JSON array.
4. Paste the array into a new file (e.g., `src/abis/DAOToken.json`).

**Importing in React:**
```javascript
import TokenABI from '../abis/DAOToken.json';
// Used as: new Contract(ADDRESS, TokenABI, providerOrSigner);
```

## 3. Technology Stack & Key Configurations

### Vite Configuration (`vite.config.js`)
To ensure compatibility with Web3 libraries and proper `BigInt` handling (required by ethers v6):
- Set `target: 'es2020'` in both `build` and `optimizeDeps` so the bundler does not transpile `BigInt` to unsupported syntax.
- Polyfill the `global` object with `window` inside `define`.

### Environment Variables (`.env`)
Variables are prefixed with `VITE_` to be exposed to the client bundle.
```env
VITE_RPC_URL=https://rpc.securechain.ai
VITE_CHAIN_ID=34
VITE_CURRENCY_SYMBOL=SCAI
VITE_TOKEN_ADDRESS=0x0926ad2E0239f31804693eAd2E458d4b89eb94C8
VITE_GOVERNOR_ADDRESS=0x3929f2A2e83216B56c22724Ef97b6b8bf51771F4
VITE_VAULT_ADDRESS=0xE141451951d217CD082750E07eA347a3Ce0767Ef
```

## 4. UI/UX & Security Considerations

### Security Safeguards
1. **Address Validation:** Prevent users from entering invalid EVM addresses by regex checking `^0x[a-fA-F0-9]{40}$`.
2. **Amount Validation:** Ensure proposed treasury amounts are `> 0` and within the available treasury balance limits.
3. **Delegation Checks:** Inform users that they must *delegate* their votes to themselves before creating proposals or voting. `useDAO.js` constantly checks this state.

### UI/UX Best Practices
1. **Loading States:** Disable buttons during transaction mining to prevent duplicate submissions (`disabled={isLoading}`).
2. **Network Validations:** Auto-prompt the user to switch to SecureChain (Chain ID: 34) if they are on a different network upon connection.
3. **Pending Transactions:** Clearly display "Submitting..." and wait for the transaction receipt (`await tx.wait()`) before clearing the form.
4. **State Mapping:** Translate numeric proposal states (0, 1, 4, etc.) to human-readable text ("Pending", "Active", "Succeeded").

## 5. Final Deployment Checklist (Vercel)

Follow these exact steps to push the frontend to production.

1. **Commit your code to GitHub:**
   ```bash
   git add .
   git commit -m "feat: complete dao frontend"
   git push origin main
   ```
2. **Import Project to Vercel:**
   - Go to [Vercel](https://vercel.com/) and click "Add New Project".
   - Import your GitHub repository.
3. **Configure Environment Variables in Vercel:**
   - In the Build Settings, expand "Environment Variables".
   - Add all your `VITE_...` variables exactly as they appear in your local `.env`.
4. **Deploy:**
   - Click "Deploy". Vercel will automatically run `npm run build` based on Vite configuration.
5. **Testing Lifecycle on Production:**
   - Visit the deployed URL.
   - Connect MetaMask (ensure you are on SecureChain).
   - Check if Dashboard loads Treasury and User balances correctly.
   - Delegate votes if necessary.
   - Submit a test treasury proposal.
   - Wait for Voting Delay, cast a vote.
   - Wait for Voting Period to end, then Queue and Execute the proposal. Verify funds are dispensed.
