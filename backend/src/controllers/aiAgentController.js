// src/controllers/aiAgentController.js
const Knowledge = require('../models/Knowledge');
const HelpRequest = require('../models/HelpRequest');
const normalize = require('../utils/normalize');

// POST /api/ai/call
exports.handleCall = async (req, res) => {
  try {
    const { question, customerId } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ ok: false, message: 'Question is required' });
    }

    // Normalize question for matching
    const normalized = normalize(question);
    console.log('AI call - question:', question);
    console.log('AI call - normalized:', normalized);

    // 1) Try exact normalized match
    let existing = await Knowledge.findOne({ questionNormalized: normalized });

    // 2) Relaxed substring fallback (helps with slight variations)
    if (!existing) {
      const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex
      existing = await Knowledge.findOne({ questionNormalized: { $regex: escaped, $options: 'i' } });
    }

    if (existing) {
      console.log('AI answered from KB:', existing.answer);
      return res.json({
        ok: true,
        from: 'ai',
        answer: existing.answer,
      });
    }

    // 3) Not known — create a help request (model default status will apply)
    const help = await HelpRequest.create({
      question,
      customerId,
    });

    console.log(`🤖 AI: "Let me check with my supervisor and get back to you."`);
    console.log(`📨 New help request created: ${help._id} — ${help.question}`);

    return res.status(200).json({
      ok: true,
      from: 'ai',
      answer: "Let me check with my supervisor and get back to you.",
      helpRequestId: help._id,
    });
  } catch (err) {
    console.error('❌ Error in handleCall:', err);
    return res.status(500).json({ ok: false, message: err.message || 'Internal Server Error' });
  }
};

