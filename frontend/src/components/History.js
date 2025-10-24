// src/components/History.js
import React, { useEffect, useState } from 'react';
import { fetchAllHelpRequests } from '../services/api';

export default function History({ refreshSignal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchAllHelpRequests();
      if (res.data && res.data.ok) setItems(res.data.helpRequests || []);
    } catch (err) {
      console.error('Failed to load history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshSignal]);

  return (
    <div style={{ padding: 12 }}>
      <h3>History (All Requests)</h3>
      {loading && <div>Loading…</div>}
      {!loading && items.length === 0 && <div>No requests yet</div>}
      <ul style={{ padding: 0 }}>
        {items.map(it => (
          <li key={it._id} style={{ marginBottom: 12, borderBottom: '1px dashed #eee', paddingBottom: 8 }}>
            <div><strong>Q:</strong> {it.question}</div>
            <div style={{ fontSize: 13, color: '#666' }}>Status: {it.status} • {new Date(it.createdAt).toLocaleString()}</div>
            {it.status === 'RESOLVED' && (
              <div style={{ marginTop: 6 }}><strong>Answer:</strong> {it.supervisorAnswer || '—'}</div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
