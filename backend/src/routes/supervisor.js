//const express = require('express');
//const router = express.Router();
//const { getPendingRequests, respondToRequest } = require('../controllers/supervisorController');

// Get pending requests
//router.get('/pending', getPendingRequests);

// Respond to a request
//router.post('/respond', respondToRequest);

//module.exports = router;

// src/routes/supervisor.js
const express = require('express');
const router = express.Router();
const { getPendingRequests, respondToRequest } = require('../controllers/supervisorController');
const HelpRequest = require('../models/HelpRequest');

// ✅ Get pending requests
router.get('/pending', getPendingRequests);

// ✅ Respond to a request
router.post('/respond', respondToRequest);

// ✅ Get unresolved requests
router.get('/unresolved', async (req, res) => {
  try {
    const list = await HelpRequest.find({ status: 'UNRESOLVED' }).sort({ unresolvedAt: -1 });
    res.json({ ok: true, requests: list });
  } catch (err) {
    console.error('Error fetching unresolved requests:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

// ✅ Mark a request as unresolved manually
router.post('/unresolve', async (req, res) => {
  try {
    const { requestId, reason = 'manual' } = req.body || {};
    if (!requestId) {
      return res.status(400).json({ ok: false, message: 'requestId required' });
    }

    const request = await HelpRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ ok: false, message: 'Request not found' });
    }

    request.status = 'UNRESOLVED';
    request.unresolvedAt = new Date();
    request.unresolvedReason = reason;
    await request.save();

    res.json({ ok: true });
  } catch (err) {
    console.error('Error marking request as unresolved:', err);
    res.status(500).json({ ok: false, message: 'Server error' });
  }
});

module.exports = router;
