const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const taskRoutes = require('./routes/taskRoutes');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use('/api/tasks', taskRoutes);

// Welcome route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to the Task Submission API' });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
    console.log(`Task Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
