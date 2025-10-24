// src/controllers/knowledgeController.js
const Knowledge = require('../models/Knowledge');

exports.getAllKnowledge = async (req, res) => {
  try {
    const items = await Knowledge.find().sort({ createdAt: -1 });
    res.json({ ok: true, items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, message: 'Internal Server Error' });
  }
};
