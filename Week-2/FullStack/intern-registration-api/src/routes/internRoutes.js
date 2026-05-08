const express = require('express');
const router = express.Router();
const { registerIntern, getInterns } = require('../controllers/internController');

// @route   POST /api/interns/register
router.post('/register', registerIntern);

// @route   GET /api/interns
router.get('/', getInterns);

module.exports = router;
