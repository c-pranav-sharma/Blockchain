const express = require('express');
const router = express.Router();
const { submitTask, getSubmissions, getInternSubmissions } = require('../controllers/taskController');

// @route   POST /api/tasks/submit
router.post('/submit', submitTask);

// @route   GET /api/tasks
router.get('/', getSubmissions);

// @route   GET /api/tasks/intern/:internId
router.get('/intern/:internId', getInternSubmissions);

module.exports = router;
