# Intern Registration API

A RESTful API built with Node.js and Express for managing intern registrations. This project is part of the Blockchain Week-2 FullStack module.

## Features
- **Register Intern**: POST request to register a new intern with their domain and wallet address.
- **List Interns**: GET request to fetch all registered interns.
- **CORS Enabled**: Ready for frontend integration.
- **Environment Configuration**: Uses `dotenv` for port and environment management.

## Tech Stack
- **Backend**: Node.js, Express
- **Middleware**: CORS, Body-Parser
- **Config**: Dotenv

## Getting Started

### Prerequisites
- Node.js installed

### Installation
1. Navigate to the project folder:
   ```bash
   cd d:/BlockChain/Week-2/FullStack/intern-registration-api
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

### Running the API
- **Start Server**:
  ```bash
  npm start
  ```
  The server will run on `http://localhost:5000` by default.

## API Endpoints

### 1. Register Intern
- **URL**: `/api/interns/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "domain": "Blockchain Development",
    "walletAddress": "0x123...abc"
  }
  ```

### 2. Get All Interns
- **URL**: `/api/interns`
- **Method**: `GET`

---
Built with ❤️ for the Blockchain Internship Program.
