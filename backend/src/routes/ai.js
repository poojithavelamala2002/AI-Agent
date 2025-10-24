// src/routes/ai.js
const express = require('express');
const router = express.Router();
const { handleCall } = require('../controllers/aiAgentController');

router.post('/call', handleCall);

module.exports = router;
