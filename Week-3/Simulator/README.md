# SCAI Staking Integration Simulator

An interactive visualization tool demonstrating the full-stack architecture and transaction flow of the SCAI Staking DApp.

## Visualized Flow
1. **React Frontend (MetaMask)**: User initiates and signs the staking transaction.
2. **SCAI Blockchain**: Smart contract locks SCAI tokens and emits a confirmation event.
3. **Receipt Propagation**: Frontend receives the transaction receipt and initiates backend synchronization.
4. **Node.js/Express Backend**: Verifies the transaction on-chain using the TX ID.
5. **MongoDB**: Updates the intern's staking status in the database.

## Components
- **Architecture Grid**: Real-time highlighting of active system components.
- **Packet Animation**: Visual representation of data moving between layers.
- **Status Log**: Detailed system logs with timestamps and transaction details.

## Transaction Details
- **Transaction ID**: `0x2D358185c70ae71F9bea1c564252211b03150B98`
