// src/components/CallerSim.js
import React, { useState } from 'react';
import { aiCall } from '../services/api';

export default function CallerSim({ onCreated }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!question.trim()) return alert('Enter a question');
    try {
      setLoading(true);
      const res = await aiCall(question.trim(), 'ui-caller');
      if (res.data && res.data.ok) {
        alert('Call simulated. AI replied: ' + res.data.answer);
        setQuestion('');
        onCreated && onCreated(); // notify parent to refresh lists
      } else {
        alert('Error: ' + (res.data?.message || 'unknown'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to simulate call');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
      <h4>Simulate Caller</h4>
      <div>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Ask: Do you offer hair coloring?"
          style={{ width: '100%', padding: 8 }}
        />
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={submit} disabled={loading}>
          {loading ? 'Sending…' : 'Simulate Call'}
        </button>
      </div>
    </div>
  );
}
