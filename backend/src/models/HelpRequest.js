// backend/src/models/HelpRequest.js
const mongoose = require('mongoose');

const HelpRequestSchema = new mongoose.Schema({
  question: { type: String, required: true },
  customerId: { type: String },

  status: { 
    type: String, 
    enum: ['PENDING', 'RESOLVED', 'UNRESOLVED'], 
    default: 'PENDING', 
    uppercase: true 
  },

  // how long we'll wait before considering it unresolved (in minutes)
  timeoutMinutes: { type: Number, default: 30 },

  // supervisor's answer (if resolved)
  supervisorAnswer: { type: String },

  // whether AI informed the customer after resolution
  aiReplySent: { type: Boolean, default: false },

  // timestamps
  createdAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date },

  // if unresolved due to timeout, record when & reason
  unresolvedAt: { type: Date },
  unresolvedReason: { type: String }
});

module.exports = mongoose.model('HelpRequest', HelpRequestSchema);

