import React, { useState, useEffect, useRef } from 'react';
import { respondToRequest } from '../services/api';

export default function RequestDetail({ request, onAnswered }) {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    setAnswer('');
    setLoading(false);
  }, [request]);

  // Setup voice input for supervisor
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setAnswer(prev => (prev ? prev + ' ' + text : text));
    };

    recog.onerror = () => setListening(false);
    recog.onend = () => setListening(false);

    recognitionRef.current = recog;
    return () => { try { recog.stop(); } catch {} };
  }, []);

  const startListening = () => { recognitionRef.current && recognitionRef.current.start(); setListening(true); };
  const stopListening = () => { recognitionRef.current && recognitionRef.current.stop(); setListening(false); };

  const submit = async () => {
    if (!answer.trim()) return alert('Please enter an answer');
    try {
      setLoading(true);
      const res = await respondToRequest(request._id, answer);
      if (res.data && res.data.ok) {
        alert('Answered — knowledge base updated');
        onAnswered();
      } else {
        alert('Error: ' + (res.data?.message || 'unknown'));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to submit answer');
    } finally { setLoading(false); }
  };

  if (!request) return <div style={{ padding: 12 }}>Select a request to view details</div>;

  return (
    <div style={{ padding: 12 }}>
      <h3>Request Detail</h3>
      <div><strong>Question:</strong></div>
      <div style={{ marginBottom: 12 }}>{request.question}</div>

      <div><strong>Answer:</strong></div>
      <textarea
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        rows={6}
        style={{ width: '100%', padding: 8 }}
        placeholder="Write your answer here..."
      />

      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button onClick={submit} disabled={loading}>{loading ? 'Submitting…' : 'Submit Answer'}</button>
        <button
          onClick={() => (listening ? stopListening() : startListening())}
          disabled={!recognitionRef.current}
          style={{ padding: '6px 10px', borderRadius: 6, background: listening ? '#ff4d4f' : '#eee', color: listening ? '#fff' : '#333', border: 'none' }}
        >
          {listening ? '🔴 Listening' : '🎤 Mic'}
        </button>
      </div>
    </div>
  );
}




