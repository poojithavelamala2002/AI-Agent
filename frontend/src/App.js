// src/App.js
import React, { useState } from 'react';
import AskQuestion from './components/AskQuestion';
import PendingRequests from './components/PendingRequests';
import RequestDetail from './components/RequestDetail';
import LearnedAnswers from './components/LearnedAnswers';
import History from './components/History';

function App() {
  const [selected, setSelected] = useState(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Trigger refresh for all panels
  const notifyChange = () => setRefreshCounter(c => c + 1);

  // Called when supervisor answers a request
  const handleAnswered = () => {
    setSelected(null);
    notifyChange();
  };

  return (
    <div style={{ padding: 12, fontFamily: 'Arial, sans-serif' }}>
      {/* Top panel: Customer Ask Question */}
      <div style={{ marginBottom: 12, border: '1px solid #ddd', borderRadius: 6, padding: 8, background: '#fafafa' }}>
        <AskQuestion onNewAnswer={notifyChange} />
      </div>

      {/* Main dashboard */}
      <div style={{ display: 'flex', gap: 12 }}>
        {/* Left panel: Pending Requests */}
        <div style={{ width: 360, border: '1px solid #ddd', borderRadius: 6, background: '#fafafa', padding: 8 }}>
          <PendingRequests onSelect={setSelected} refreshSignal={refreshCounter} />
        </div>

        {/* Middle panel: Request Detail (Supervisor) */}
        <div style={{ flex: 1, border: '1px solid #ddd', borderRadius: 6, background: '#fff', padding: 8 }}>
          <RequestDetail request={selected} onAnswered={handleAnswered} />
        </div>

        {/* Right panel: Learned Answers & History */}
        <div style={{ width: 420, border: '1px solid #ddd', borderRadius: 6, background: '#fafafa', padding: 8 }}>
          <LearnedAnswers refreshSignal={refreshCounter} />
          <div style={{ height: 12 }} />
          <History refreshSignal={refreshCounter} />
        </div>
      </div>
    </div>
  );
}

export default App;



