# Task Submission API

A RESTful API built with Node.js and Express for managing task submissions from interns.

## Features
- **Submit Task**: POST request to submit a task with title, repository link, and submission URL.
- **List Submissions**: GET request to fetch all submissions.
- **Filter by Intern**: GET request to fetch submissions for a specific intern.
- **CORS Enabled**: Ready for frontend integration.

## Getting Started

### Installation
1. Navigate to the project folder:
   ```bash
   cd d:/BlockChain/Week-2/FullStack/task-submission-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the API
- **Start Server**:
  ```bash
  npm start
  ```
  The server will run on `http://localhost:5001`.

## API Endpoints

### 1. Submit Task
- **URL**: `/api/tasks/submit`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "internId": "1",
    "taskTitle": "Smart Contract Deployment",
    "githubRepo": "https://github.com/user/repo",
    "submissionLink": "https://deployed-app.com"
  }
  ```

### 2. Get All Submissions
- **URL**: `/api/tasks`
- **Method**: `GET`

### 3. Get Intern Submissions
- **URL**: `/api/tasks/intern/:internId`
- **Method**: `GET`

---
Built for the Blockchain Internship Program.
