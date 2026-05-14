# SecureChain DAO Governance System

A production-ready, fully decentralized DAO Governance System deployed on the **SecureChain Mainnet (Chain ID: 34)**. Built with OpenZeppelin Governor + Timelock architecture and a React + Vite frontend.

---

## Live Deployment

| Contract | Address |
|---|---|
| DAOToken (ERC20Votes) | `0x0926ad2E0239f31804693eAd2E458d4b89eb94C8` |
| DAOGovernor | `0x3929f2A2e83216B56c22724Ef97b6b8bf51771F4` |
| CommunityVault (Treasury) | `0xE141451951d217CD082750E07eA347a3Ce0767Ef` |

**Network:** SecureChain Mainnet  
**RPC URL:** `https://rpc.securechain.ai`  
**Block Time:** ~2 seconds  
**Currency:** SCAI

---

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                  DAO Participants                    │
│          (Propose · Vote · Delegate)                │
└────────────────────┬─────────────────────────────────┘
                     │
                     ▼
          ┌──────────────────────┐
          │     DAOGovernor      │  ← OpenZeppelin Governor
          │  (SCAI Governor)     │    + GovernorSettings
          │                      │    + GovernorCountingSimple
          │  Voting Delay: 7200  │    + GovernorVotes
          │  Voting Period:302400│    + GovernorTimelockControl
          │  Threshold: 100 DGT  │
          │  Quorum: 1000 DGT    │
          └──────────┬───────────┘
                     │ queue / execute
                     ▼
          ┌──────────────────────┐
          │  TimelockController  │  ← On-chain execution delay
          │  (minDelay: 0 prod)  │
          └──────────┬───────────┘
                     │ owns
                     ▼
          ┌──────────────────────┐
          │   CommunityVault     │  ← Treasury
          │   (ETH Treasury)     │    OnlyOwner = Timelock
          └──────────────────────┘

          ┌──────────────────────┐
          │     DAOToken         │  ← ERC20 + ERC20Votes
          │   (DGT — 10,000)     │    + ERC20Permit (EIP-2612)
          └──────────────────────┘
```

---

## Smart Contract Overview

### 1. DAOToken (`DGT`)

| Property | Value |
|---|---|
| Standard | ERC20, ERC20Votes, ERC20Permit |
| Total Supply | 10,000 DGT |
| Voting Mechanism | Checkpoint-based (snapshot at proposal block) |
| Delegation | Self or to any address |

**Key behaviors:**
- Tokens must be **delegated** before they count as voting power
- Voting power is **snapshotted** at proposal creation — buying tokens after a proposal is created gives zero extra votes
- Supports gasless off-chain signatures via EIP-2612 (`permit`)

---

### 2. DAOGovernor

| Setting | Value | Real-time Equivalent |
|---|---|---|
| Voting Delay | 7,200 blocks | ~4 hours |
| Voting Period | 302,400 blocks | ~1 week |
| Proposal Threshold | 100 DGT | Must hold 100 DGT to propose |
| Quorum | 1,000 DGT | Minimum participation for proposal to pass |

**Vote types:**
- `0` — Against
- `1` — For
- `2` — Abstain

---

### 3. CommunityVault (Treasury)

Holds ETH and only releases funds when the DAO votes to do so through the full governance lifecycle.

| Feature | Implementation |
|---|---|
| Ownership | TimelockController (prevents direct attacks) |
| Reentrancy Guard | `nonReentrant` on `dispenseFunds` |
| Pause Mechanism | `Pausable` — can be paused via governance vote |
| Fund Tracking | `totalFundsDispensed`, `grantCount` counters |

---

## Governance Proposal Lifecycle

```
PROPOSAL CREATED
      │
      │  Wait 7,200 blocks (~4 hours)
      ▼
   PENDING  ──────────────────────────────► CANCELED
      │
      │  Voting Delay passes
      ▼
   ACTIVE  (302,400 blocks to vote, ~1 week)
      │
   ┌──┴──────────┐
   │             │
   ▼             ▼
SUCCEEDED     DEFEATED
   │
   │  governor.queue()
   ▼
 QUEUED  (Timelock delay)
   │
   │  governor.execute()
   ▼
EXECUTED ✅
```

---

## Frontend Features

### Dashboard (Home Page)
- Live treasury balance (SCAI)
- Your DGT token balance
- Your active voting power
- Delegation status checker with one-click "Delegate to Self"

### Proposals & Voting Page

#### Explore & Vote Tab
- **Proposal Explorer** — Search any proposal by ID to see:
  - Proposal description
  - Current lifecycle state (Pending / Active / Succeeded etc.)
  - Real-time countdown: "Closes in ~3h 42m"
  - Proposer address
  - Live vote counts (For / Against)
  - Block snapshot + deadline
- **Find My Proposals** — One click scans the full blockchain history and lists all proposals created by your wallet
- **Governance Actions** — Cast vote (For / Against / Abstain), Queue, Execute
- Two-way sync: paste ID in either panel and both update simultaneously

#### Create New Proposal Tab
- Encode `dispenseFunds` calldata for the CommunityVault
- Submits on-chain proposal transaction
- Displays full numeric Proposal ID (not the tx hash)

---

## Project Structure

```
Week-4/dao-frontend/
├── contracts/
│   └── DAO.sol                    # All 3 smart contracts (Hardhat version)
├── src/
│   ├── abis/
│   │   ├── DAOGovernor.json       # Contract ABI
│   │   ├── DAOToken.json
│   │   └── CommunityVault.json
│   ├── components/
│   │   ├── Dashboard.jsx          # Treasury + token stats
│   │   ├── DelegationChecker.jsx  # Self-delegation prompt
│   │   ├── GovernanceActions.jsx  # Vote / Queue / Execute
│   │   ├── Navbar.jsx             # Navigation with routing
│   │   ├── ProposalEncoder.jsx    # Proposal creation form
│   │   └── ProposalViewer.jsx     # Proposal explorer + live countdown
│   ├── hooks/
│   │   └── useDAO.js              # Core data fetching hook
│   ├── pages/
│   │   ├── Home.jsx               # Dashboard page
│   │   └── Proposals.jsx          # Tabbed proposals page
│   ├── utils/
│   │   └── ethereum.js            # MetaMask connection + SecureChain config
│   ├── App.jsx                    # Root with React Router
│   ├── main.jsx                   # Entry point + BrowserRouter
│   └── index.css                  # Glassmorphism design system
├── test/
│   ├── unit.test.cjs              # 37 unit tests
│   ├── security.test.cjs          # 17 security + edge-case tests
│   └── gas.test.cjs               # 15 gas + performance tests
├── hardhat.config.cjs             # Hardhat configuration
├── package.json
└── vite.config.js
```

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- MetaMask browser extension
- SecureChain network configured in MetaMask (the app auto-prompts to add it)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/c-pranav-sharma/Blockchain.git
cd Blockchain/Week-4/dao-frontend

# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Environment Variables

Create a `.env` file in `dao-frontend/`:

```env
VITE_RPC_URL=https://rpc.securechain.ai
VITE_CHAIN_ID=34
VITE_TOKEN_ADDRESS=0x0926ad2E0239f31804693eAd2E458d4b89eb94C8
VITE_GOVERNOR_ADDRESS=0x3929f2A2e83216B56c22724Ef97b6b8bf51771F4
VITE_VAULT_ADDRESS=0xE141451951d217CD082750E07eA347a3Ce0767Ef
```

---

## Smart Contract Testing

The project includes a full Hardhat test suite with 69 tests across 3 categories:

### Run All Tests

```bash
npm test
```

### Run Individual Suites

```bash
# Unit tests (37 tests)
npm run test:unit

# Security & edge-case tests (17 tests)
npm run test:security

# Gas optimization tests (15 tests)
npm run test:gas

# Compile contracts only
npm run compile
```

### Test Results Summary

```
Unit Tests ─────────────────────── 37 passing
  DAOToken
    ✓ Name & symbol correct
    ✓ Mints 10,000 DGT to deployer
    ✓ Transfers work correctly
    ✓ Reverts on insufficient balance
    ✓ Zero voting power before delegation
    ✓ Reflects votes after self-delegation
    ✓ Checkpoint updates on transfer
    ✓ Allows delegation to another address
    ✓ Valid DOMAIN_SEPARATOR (EIP-2612)

  DAOGovernor
    ✓ Correct governor name
    ✓ Correct voting delay / period / threshold / quorum
    ✓ Proposal creation & ProposalCreated event
    ✓ Reverts below threshold
    ✓ Starts in Pending state
    ✓ Pending → Active transition
    ✓ Reverts vote in Pending state
    ✓ For / Against / Abstain votes
    ✓ Double-vote protection
    ✓ Defeated / Succeeded state transitions
    ✓ Full lifecycle (propose → vote → queue → execute)
    ✓ Queue reverts on non-succeeded proposals

  CommunityVault
    ✓ Owned by timelock
    ✓ Reverts on zero-address timelock
    ✓ Accepts ETH + emits FundsReceived
    ✓ getVaultBalance works
    ✓ Non-owner cannot updateGrantAmount / dispense / pause
    ✓ Reverts on insufficient balance
    ✓ Tracks grantCount + totalFundsDispensed

Security Tests ──────────────────── 17 passing
  ✓ Attacker cannot dispense funds directly
  ✓ Attacker cannot set grant amount
  ✓ Attacker cannot pause vault
  ✓ Attacker cannot bypass proposal threshold
  ✓ Direct timelock call is rejected
  ✓ nonReentrant guard validated
  ✓ Vault pause via governance works
  ✓ Zero-balance voter has zero vote weight
  ✓ Snapshot prevents post-proposal token buys
  ✓ Double-vote rejected
  ✓ Duplicate proposals rejected
  ✓ Dispense reverts on empty vault
  ✓ Zero-address timelock rejected
  ✓ Defeated proposals cannot be queued
  ✓ Token transfer reduces voting power
  ✓ Large calldata (5KB) doesn't revert
  ✓ Mismatched array lengths rejected

Gas Optimization Tests ──────────── 15 passing
  DAOToken deploy:        1,956,153 gas  ✓
  TimelockController:     1,891,961 gas  ✓
  DAOGovernor:            3,594,231 gas  ✓
  CommunityVault:           538,128 gas  ✓
  delegate():                28,453 gas  ✓
  propose():                 99,708 gas  ✓
  castVote():                86,736 gas  ✓
  queue():                  113,798 gas  ✓
  execute():                 99,629 gas  ✓
  receive ETH:               22,491 gas  ✓
  Governor bytecode:          15.38 KB   ✓ (< 24KB EIP-170)
  Vault bytecode:              1.94 KB   ✓
  Token bytecode:              7.76 KB   ✓
  View functions: zero-gas reads         ✓
```

---

## Deployment to Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New Project** → Import `Blockchain` repository
2. Set **Root Directory** to `Week-4/dao-frontend`
3. Framework will auto-detect as **Vite**
4. Add all 5 environment variables from the `.env` section above
5. Click **Deploy**

Vercel automatically redeploys on every push to `main`.

---

## Security Considerations

| Risk | Mitigation |
|---|---|
| Direct treasury drain | CommunityVault owned by Timelock — only Governor can call |
| Flash loan voting attack | ERC20Votes snapshots power at proposal block |
| Reentrancy on fund transfer | `nonReentrant` modifier on `dispenseFunds` |
| Malicious proposals | 100 DGT threshold + 1000 DGT quorum requirement |
| Timelock bypass | Admin role revoked from deployer after setup |
| Pausing abuse | Pause/unpause only executable via governance vote |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity 0.8.19 + OpenZeppelin 4.9.3 |
| Testing Framework | Hardhat 2.22 + Mocha + Chai |
| Frontend | React 19 + Vite 8 |
| Web3 Library | ethers.js v6 |
| Routing | React Router DOM v7 |
| Wallet | MetaMask (EIP-1193) |
| Network | SecureChain Mainnet (Chain ID: 34) |
| Deployment | Vercel |

---

## License

MIT
