// src/components/PendingRequests.js
import React, { useEffect, useState } from 'react';
import { fetchPending, fetchUnresolved } from '../services/api';

export default function PendingRequests({ onSelect, refreshSignal }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState('pending'); // 'pending' | 'unresolved'

  const load = async () => {
    setLoading(true);
    try {
      if (view === 'pending') {
        const res = await fetchPending();
        if (res.data && res.data.ok) setRequests(res.data.requests || []);
      } else {
        const res = await fetchUnresolved();
        if (res.data && res.data.ok) setRequests(res.data.requests || []);
      }
    } catch (err) {
      console.error(`Failed to load ${view}`, err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // reload when refreshSignal changes or view toggles
  useEffect(() => { load(); }, [refreshSignal, view]);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>
          {view === 'pending' ? 'Pending Requests' : 'Unresolved Requests'} ({requests.length})
        </h3>

        <div>
          <button
            onClick={() => setView('pending')}
            disabled={view === 'pending'}
            style={{ marginRight: 8 }}
          >
            Pending
          </button>
          <button
            onClick={() => setView('unresolved')}
            disabled={view === 'unresolved'}
          >
            Unresolved
          </button>
        </div>
      </div>

      {loading && <div style={{ marginTop: 8 }}>Loading…</div>}

      {!loading && requests.length === 0 && (
        <div style={{ marginTop: 8 }}>{view === 'pending' ? 'No pending requests' : 'No unresolved requests'}</div>
      )}

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 12 }}>
        {requests.map(r => (
          <li key={r._id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <div style={{ fontWeight: 600 }}>{r.question}</div>

            <div style={{ fontSize: 12, color: '#666' }}>
              {view === 'pending' ? new Date(r.createdAt).toLocaleString() : (r.unresolvedAt ? new Date(r.unresolvedAt).toLocaleString() : new Date(r.createdAt).toLocaleString())}
            </div>

            {view === 'unresolved' && r.unresolvedReason && (
              <div style={{ fontSize: 12, color: '#b00', marginTop: 6 }}>
                Reason: {r.unresolvedReason}
              </div>
            )}

            <div style={{ marginTop: 6 }}>
              <button onClick={() => onSelect(r)}>Open</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}



