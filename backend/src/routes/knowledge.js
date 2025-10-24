// src/routes/knowledge.js
const express = require('express');
const router = express.Router();
const { getAllKnowledge } = require('../controllers/knowledgeController');

router.get('/', getAllKnowledge);

module.exports = router;
