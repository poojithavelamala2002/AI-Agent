// src/components/AskQuestion.js
import React, { useState, useEffect, useRef } from 'react';
import { aiCall } from '../services/api';

export default function AskQuestion({ onNewAnswer }) {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // Initialize SpeechRecognition (for voice input)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      recognitionRef.current = null;
      return;
    }

    const recog = new SpeechRecognition();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false;

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setQuestion(prev => (prev ? prev + ' ' + text : text));
    };

    recog.onerror = (ev) => {
      console.error('SpeechRecognition error:', ev);
      setListening(false);
    };

    recog.onend = () => setListening(false);

    recognitionRef.current = recog;

    return () => {
      try { recog.stop(); } catch (e) {}
      recognitionRef.current = null;
    };
  }, []);

  const startListening = () => {
    if (!recognitionRef.current) return alert('Voice not supported in this browser (use Chrome/Edge)');
    try {
      setListening(true);
      recognitionRef.current.start();
    } catch (err) {
      console.error('startListening error', err);
      setListening(false);
    }
  };

  const stopListening = () => {
    try { recognitionRef.current && recognitionRef.current.stop(); } catch (e) {}
    setListening(false);
  };

  // Speak text using browser TTS
  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'en-US';
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error('TTS error', e);
    }
  }

  const submitQuestion = async () => {
    const q = (question || '').trim();
    if (!q) return alert('Please enter a question');

    setLoading(true);
    try {
      // 1) Call AI receptionist first. The backend will check Knowledge and create
      // a HelpRequest only if AI doesn't know the answer.
      const res = await aiCall(q, 'cust1');

      if (!res || !res.data) {
        throw new Error('No response from AI');
      }

      if (res.data.ok) {
        const {  answer, helpRequestId } = res.data;

        // If AI knew the answer, answer will exist and 'from' may be 'ai'
        if (answer && (!helpRequestId)) {
          // AI answered directly from knowledge base
          speak(answer);
          onNewAnswer && onNewAnswer(res.data);
          setQuestion('');
          return;
        }

        // If helpRequestId exists, AI created a pending help request and told caller
        if (helpRequestId) {
          // Backend created the help request (no need to call createHelpRequest again)
          const aiMessage = answer || "Let me check with my supervisor and get back to you.";
          speak(aiMessage);
          onNewAnswer && onNewAnswer(res.data);
          setQuestion('');
          return;
        }

        // Fallback: if no explicit answer or helpRequestId, still handle gracefully
        const fallback = answer || 'Let me check with my supervisor and get back to you.';
        speak(fallback);
        onNewAnswer && onNewAnswer(res.data);
        setQuestion('');
        return;
      } else {
        // Backend responded but ok=false
        const msg = res.data?.message || 'AI returned an error';
        alert('AI error: ' + msg);
      }
    } catch (err) {
      console.error('submitQuestion error', err?.response?.data || err);
      alert('Failed to ask AI: ' + (err?.response?.data?.message || err.message || 'unknown'));
    } finally {
      setLoading(false);
    }
  };


  return (
    <div style={{ padding: 12 }}>
      <h3>Ask AI Receptionist</h3>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <input
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Type or use mic to ask..."
          style={{ flex: 1, padding: 8 }}
        />

        <button
          onClick={() => (listening ? stopListening() : startListening())}
          style={{
            padding: '6px 10px',
            borderRadius: 6,
            background: listening ? '#ff4d4f' : '#eee',
            color: listening ? '#fff' : '#333',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {listening ? '🔴 Listening' : '🎤 Mic'}
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <button onClick={submitQuestion} disabled={loading}>
          {loading ? 'Asking…' : 'Ask AI'}
        </button>
        <button onClick={() => setQuestion('')} disabled={loading} style={{ marginLeft: 8 }}>
          Clear
        </button>
      </div>
    </div>
  );
}

