// src/components/VoiceAgent.js
import React, { useEffect, useRef, useState } from 'react';
import { aiCall } from '../services/api';

/**
 * VoiceAgent
 * - Uses Web Speech API (SpeechRecognition) for STT
 * - Sends recognized text to backend /api/ai/call via aiCall()
 * - Plays AI response using speechSynthesis (TTS)
 *
 * Notes:
 * - Works best in Chrome/Edge on desktop (localhost).
 * - User must allow microphone access.
 */

export default function VoiceAgent({ onNewRequest }) {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [lastReply, setLastReply] = useState('');
  const recognitionRef = useRef(null);
  const isSupported = typeof window !== 'undefined' && (
    window.SpeechRecognition || window.webkitSpeechRecognition
  );

  useEffect(() => {
    if (!isSupported) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recog = new SpeechRecognition();

    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.continuous = false; // single utterance per start()

    recog.onresult = (event) => {
      const text = event.results[0][0].transcript;
      setTranscript(text);
      // send to backend
      sendToAI(text);
    };

    recog.onerror = (ev) => {
      console.error('SpeechRecognition error', ev);
      setListening(false);
    };

    recog.onend = () => {
      setListening(false);
    };

    recognitionRef.current = recog;
    // cleanup
    return () => {
      try { recog.stop(); } catch (e) {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function sendToAI(text) {
    try {
      const res = await aiCall(text, 'voice-caller');
      if (res?.data?.ok) {
        const reply = res.data.answer;
        setLastReply(reply);
        // speak reply
        speak(reply);
        // notify parent to refresh pending list / KB
        onNewRequest && onNewRequest();
      } else {
        const err = res?.data?.message || 'No response';
        setLastReply(err);
        speak(err);
      }
    } catch (err) {
      console.error('aiCall failed', err);
      const msg = 'Failed to contact AI';
      setLastReply(msg);
      speak(msg);
    }
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel(); // stop any existing
      const u = new SpeechSynthesisUtterance(text);
      // optional voice selection
      u.lang = 'en-US';
      // u.rate = 1;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.error('TTS error', e);
    }
  }

  function startListening() {
    if (!isSupported || !recognitionRef.current) return alert('SpeechRecognition not supported in this browser.');
    try {
      setTranscript('');
      setLastReply('');
      setListening(true);
      recognitionRef.current.start();
    } catch (err) {
      console.error('startListening error', err);
      setListening(false);
    }
  }

  function stopListening() {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setListening(false);
  }

  return (
    <div style={{ padding: 12, borderBottom: '1px solid #eee' }}>
      <h4>Voice Receptionist</h4>

      {!isSupported && (
        <div style={{ color: 'darkred' }}>
          Browser does not support Web Speech API. Use Chrome/Edge on desktop.
        </div>
      )}

      <div style={{ marginTop: 8 }}>
        <button onClick={() => listening ? stopListening() : startListening()} disabled={!isSupported}>
          {listening ? 'Stop listening' : 'Start listening'}
        </button>
      </div>

      <div style={{ marginTop: 8 }}>
        <div><strong>Transcript:</strong></div>
        <div style={{ minHeight: 20, padding: 6, background: '#fff', border: '1px solid #eee' }}>{transcript || '—'}</div>
      </div>

      <div style={{ marginTop: 8 }}>
        <div><strong>AI Reply (spoken):</strong></div>
        <div style={{ minHeight: 20, padding: 6, background: '#fff', border: '1px solid #eee' }}>{lastReply || '—'}</div>
      </div>

      <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
        Tip: Click Start, speak a single question, wait for AI to reply. Microphone permission required.
      </div>
    </div>
  );
}
