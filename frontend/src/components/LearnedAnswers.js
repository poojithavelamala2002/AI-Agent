// src/components/LearnedAnswers.js
import React, { useEffect, useState } from 'react';
import { fetchKnowledge } from '../services/api';

export default function LearnedAnswers({ refreshSignal }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchKnowledge();
      if (res.data && res.data.ok) setItems(res.data.items);
    } catch (err) {
      console.error('Failed to load knowledge', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [refreshSignal]);

  return (
    <div style={{ padding: 12 }}>
      <h3>Learned Answers</h3>
      {loading && <div>Loading…</div>}
      {!loading && items.length === 0 && <div>No learned answers yet</div>}
      <ul style={{ padding: 0 }}>
        {items.map(i => (
          <li key={i._id} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
            <div><strong>Q:</strong> {i.questionNormalized}</div>
            <div style={{ marginTop: 4 }}><strong>A:</strong> {i.answer}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

