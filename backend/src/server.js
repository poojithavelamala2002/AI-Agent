// src/server.js
require('dotenv').config();
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

    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // ⚡ Clear old data for fresh start
    await HelpRequest.deleteMany({});
    await Knowledge.deleteMany({});
    console.log('🗑️ Cleared HelpRequests and Knowledge. Fresh start!');

    // 🚀 Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });

    // 🔔 Timeout worker setup
    function notifyOnTimeout(req, reason) {
      console.log(`🔔 Timeout notify: request ${req._id} timed out (${reason}). Question: ${req.question}`);
      // TODO: Optionally send to webhook or Slack here (use fetch/axios)
    }

    // Start worker with 1-minute interval
    const { start: startWorker } = startTimeoutWorker({
      intervalMs: 60_000, // 1 minute
      notifyFn: notifyOnTimeout,
    });

    startWorker();
    console.log('⏱️ Timeout worker started (checks every 1 minute)');

  } catch (err) {
    console.error('❌ Failed to start server', err);
    process.exit(1);
  }
}

start();
