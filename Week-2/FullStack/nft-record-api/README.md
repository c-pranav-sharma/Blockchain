# NFT Record API

A RESTful API built with Node.js and Express for tracking NFT mint records in a MongoDB database.

## Features
- **Record NFT Mint**: POST request to store NFT minting details (tokenId, owner, metadata URI, etc.).
- **List All Records**: GET request to fetch all NFT records.
- **Get Specific Record**: GET request to fetch a record by `tokenId`.
- **MongoDB Integration**: Persistently stores data using Mongoose.

## Tech Stack
- **Backend**: Node.js, Express
- **Database**: MongoDB, Mongoose
- **Middleware**: CORS, Body-Parser
- **Config**: Dotenv

## Getting Started

### Prerequisites
- Node.js installed
- MongoDB running locally or a connection string

### Installation
1. Navigate to the project folder:
   ```bash
   cd d:/BlockChain/Week-2/FullStack/nft-record-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the API
1. Update `.env` with your MongoDB URI if necessary.
2. Start Server:
   ```bash
   npm start
   ```
   The server will run on `http://localhost:5002` by default.

## API Endpoints

### 1. Record NFT Mint
- **URL**: `/api/nfts/record`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "tokenId": 1,
    "ownerAddress": "0x123...abc",
    "metadataURI": "ipfs://Qm...",
    "transactionHash": "0xabc...123",
    "contractAddress": "0x789...def"
  }
  ```

### 2. Get All Records
- **URL**: `/api/nfts`
- **Method**: `GET`

### 3. Get Record by Token ID
- **URL**: `/api/nfts/:tokenId`
- **Method**: `GET`

---
Built for the Blockchain Internship Program.
