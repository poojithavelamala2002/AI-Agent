// src/models/Knowledge.js
const mongoose = require('mongoose');

const KnowledgeSchema = new mongoose.Schema({
  questionNormalized: { type: String, index: true },
  answer: { type: String, required: true },
  source: { type: String, default: 'supervisor' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Knowledge', KnowledgeSchema);
