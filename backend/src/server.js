// backend/src/server.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = require('./app');

// Import models
const HelpRequest = require('./models/HelpRequest');
const Knowledge = require('./models/Knowledge');

// Import timeout worker
const { startTimeoutWorker } = require('./services/timers');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI;

async function start() {
  try {
    if (!MONGO_URI) {
      throw new Error('MONGO_URI not set in .env');
    }

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // ⚡ Clear old data ONLY in development
    if (process.env.NODE_ENV === 'development') {
      await HelpRequest.deleteMany({});
      await Knowledge.deleteMany({});
      console.log('🗑️ Cleared HelpRequests and Knowledge for development');
    }

    // 🔔 Timeout worker setup
    function notifyOnTimeout(req, reason) {
      console.log(`🔔 Timeout notify: request ${req._id} timed out (${reason}). Question: ${req.question}`);
      // Optionally, send webhook/Slack notifications here
    }

    // Start worker with 1-minute interval
    const { start: startWorker } = startTimeoutWorker({
      intervalMs: 60_000,
      notifyFn: notifyOnTimeout,
    });
    startWorker();
    console.log('⏱️ Timeout worker started (checks every 1 minute)');

    // Health check route
    app.get('/health', (req, res) => res.json({ ok: true }));

    // Serve frontend if in production
    if (process.env.NODE_ENV === 'production') {
      const buildPath = path.join(__dirname, '../frontend/build');
      app.use(express.static(buildPath));

      // Serve index.html for any unknown route (React Router support)
      app.get('*', (req, res) => {
        res.sendFile(path.join(buildPath, 'index.html'));
      });
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
}

start();

