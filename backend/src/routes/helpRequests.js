// backend/src/routes/helpRequests.js
const express = require('express');
const router = express.Router();
const helpRequestController = require('../controllers/helpRequestController');

console.log('helpRequestController exports:', helpRequestController);

router.post('/', helpRequestController.createHelpRequest);
router.get('/', helpRequestController.getAllHelpRequests);

module.exports = router;
