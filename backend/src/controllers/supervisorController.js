// src/controllers/supervisorController.js
const HelpRequest = require('../models/HelpRequest');
const Knowledge = require('../models/Knowledge');
const normalize = require('../utils/normalize');

// Get all pending help requests
exports.getPendingRequests = async (req, res) => {
  try {
    const requests = await HelpRequest.find({ status: 'PENDING' }).sort({ createdAt: -1 });
    res.json({ ok: true, requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Internal Server Error' });
  }
};

// Respond to a request
exports.respondToRequest = async (req, res) => {
  try {
    const { requestId, answer } = req.body || {};

    if (!requestId || !answer) {
      return res.status(400).json({ ok: false, message: 'requestId and answer required' });
    }

    // Find the help request
    const helpRequest = await HelpRequest.findById(requestId);
    if (!helpRequest) {
      return res.status(404).json({ ok: false, message: 'Help request not found' });
    }

    // Normalize original question and save to knowledge base
    const normalizedQuestion = normalize(helpRequest.question);
    await Knowledge.create({
      questionNormalized: normalizedQuestion,
      answer: answer,
      source: 'supervisor',
    });

    // Update help request status and store supervisor's answer
    helpRequest.status = 'RESOLVED';
    helpRequest.supervisorAnswer = answer;
    helpRequest.resolvedAt = new Date();
    await helpRequest.save();

    // Simulate AI notifying customer
    console.log(`📨 AI: Notifying customer (${helpRequest.customerId}) with answer: ${answer}`);

    res.json({ ok: true, message: 'Request answered and knowledge base updated' });
  } catch (err) {
    console.error('❌ Error in respondToRequest:', err);
    res.status(500).json({ ok: false, message: err.message || 'Internal Server Error' });
  }
};
