require('dotenv').config();
const express = require('express');
const cors = require('cors');

const aiRoutes = require('./routes/ai');
const supervisorRoutes = require('./routes/supervisor');
const helpRequestRoutes = require('./routes/helpRequests');
const knowledgeRoutes = require('./routes/knowledge');


const app = express(); // ✅ define app first

// Built-in middlewares
app.use(cors());
app.use(express.json());

// Simple health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'dev' });
});

// Connect AI routes
app.use('/api/ai', aiRoutes);

// Connect supervisor routes
app.use('/api/supervisor', supervisorRoutes);

app.use('/api/help-requests', helpRequestRoutes);

app.use('/api/knowledge', knowledgeRoutes);


module.exports = app;
