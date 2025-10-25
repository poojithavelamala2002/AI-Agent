// backend/src/server.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const app = require('./app'); // your main Express app

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
      throw new Error('MONGO_URI not set in environment variables');
    }

    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
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
    }
    const { start: startWorker } = startTimeoutWorker({
      intervalMs: 60_000,
      notifyFn: notifyOnTimeout,
    });
    startWorker();
    console.log('⏱️ Timeout worker started (checks every 1 minute)');

    // Health check route (ok to duplicate if present in app.js)
    app.get('/health', (req, res) => res.json({ ok: true }));

    // Serve React frontend in production
    if (process.env.NODE_ENV === 'production') {
      // __dirname is backend/src — go up two levels to repo root then into frontend/build
      const buildPath = path.join(__dirname, '../../frontend/build');
      console.log('Looking for frontend build at:', buildPath);

      // confirm build exists
      const indexPath = path.join(buildPath, 'index.html');
      if (!fs.existsSync(indexPath)) {
        console.error('❌ Frontend build missing. Expected index at:', indexPath);
        // don't throw here — you might still want server APIs to run even if frontend isn't built
      } else {
        // serve static assets
        app.use(express.static(buildPath));
        // fallback to index.html for client-side routing — use regex to avoid path-to-regexp '*' issues
        app.get(/.*/, (req, res) => {
          res.sendFile(indexPath);
        });
        console.log('🌐 Serving frontend from build folder');
      }
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
