const HelpRequest = require('../models/HelpRequest');

/**
 * Scan for pending help requests older than their timeout and mark UNRESOLVED.
 * - runs periodically (e.g. every minute)
 * - idempotent: only updates requests still in PENDING
 *
 * Options:
 *   notifyFn(request, reason) - optional function called for each timed-out request
 */
function startTimeoutWorker({ intervalMs = 60_000, notifyFn = null } = {}) {
  let timer = null;
  let running = false;

  async function tick() {
    if (running) return; // avoid overlapping runs
    running = true;
    try {
      const now = new Date();

      // Find PENDING requests where createdAt + timeoutMinutes < now
      const pending = await HelpRequest.find({ status: 'PENDING' }).lean();

      const toUpdate = [];
      for (const r of pending) {
        const timeoutMs = (r.timeoutMinutes || 30) * 60_000;
        if (new Date(r.createdAt).getTime() + timeoutMs < now.getTime()) {
          toUpdate.push(r);
        }
      }

      if (toUpdate.length === 0) return;

      // Update each (use updateOne for concurrency safety)
      for (const r of toUpdate) {
        try {
          const res = await HelpRequest.updateOne(
            { _id: r._id, status: 'PENDING' },
            {
              $set: {
                status: 'UNRESOLVED',
                unresolvedAt: new Date(),
                unresolvedReason: 'timeout',
              },
            }
          );

          if (res.matchedCount === 1 || res.modifiedCount === 1) {
            if (typeof notifyFn === 'function') {
              try {
                notifyFn(r, 'timeout');
              } catch (e) {
                console.error('notifyFn error', e);
              }
            } else {
              console.log(`⏰ HelpRequest ${r._id} marked UNRESOLVED due to timeout.`);
            }
          }
        } catch (err) {
          console.error('Failed to mark help request unresolved', r._id, err);
        }
      }
    } catch (err) {
      console.error('Timer worker error', err);
    } finally {
      running = false;
    }
  }

  function start() {
    if (timer) return;
    timer = setInterval(tick, intervalMs);
    console.log('🕒 Timeout worker started, intervalMs=', intervalMs);
  }

  function stop() {
    if (!timer) return;
    clearInterval(timer);
    timer = null;
    console.log('🕒 Timeout worker stopped');
  }

  return { start, stop };
}

/**
 * Additional supervisor response check:
 * Every 5 minutes, mark PENDING requests older than 5 mins as UNRESOLVED
 * if supervisor did not respond.
 */
function startSupervisorTimeoutCheck() {
  const interval = 5 * 60 * 1000; // 5 minutes
  setInterval(async () => {
    try {
      const cutoff = new Date(Date.now() - interval);
      const pendingTooLong = await HelpRequest.find({
        status: 'PENDING',
        createdAt: { $lt: cutoff },
      });

      for (const req of pendingTooLong) {
        req.status = 'UNRESOLVED';
        req.unresolvedAt = new Date();
        req.unresolvedReason = 'Supervisor did not respond in time';
        await req.save();
        console.log(`⚠️ Marked as unresolved (supervisor timeout): ${req._id}`);
      }
    } catch (err) {
      console.error('Supervisor timeout check error:', err);
    }
  }, interval);

  console.log('⏱️ Supervisor timeout check started (every 5 mins)');
}

module.exports = { startTimeoutWorker, startSupervisorTimeoutCheck };

