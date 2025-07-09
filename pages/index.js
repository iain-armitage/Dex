
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState('');
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const synthRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    if ('webkitSpeechRecognition' in window) {
      const recognition = new webkitSpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput('');
        handleSend(transcript);
        setListening(false);
      };
      recognition.onerror = (e) => {
        console.error(e);
        setListening(false);
      };
      recognitionRef.current = recognition;
    }
  }, []);

  const handleSend = async (overrideText) => {
    const userInput = overrideText || input;
    if (!userInput.trim()) return;
    const userMsg = { role: 'user', content: userInput };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: [...messages, userMsg] })
    });
    const data = await res.json();
    const reply = data.reply;
    setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    const utterance = new SpeechSynthesisUtterance(reply);
    synthRef.current.speak(utterance);

    // Add task if Dex suggests one
    if (reply.toLowerCase().includes("task:")) {
      const taskText = reply.split("task:")[1].trim();
      setTasks(prev => [...prev, { title: taskText, time: new Date().toLocaleTimeString() }]);
    }
  };

  const handleMic = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0e0e11', color: '#fff', fontFamily: 'sans-serif' }}>
      {!fullscreen && (
        <div style={{ width: 250, background: '#13151a', padding: 20 }}>
          <img src="/dex-avatar.png" alt="Dex" width="100" style={{ borderRadius: '50%', marginBottom: 10 }} />
          <h2 style={{ margin: 0 }}>Dex</h2>
          <p style={{ fontSize: 12, color: '#aaa' }}>Ready to help</p>
          <nav style={{ marginTop: 30 }}>
            <div onClick={() => setActiveTab('chat')} style={{ padding: '10px 0', cursor: 'pointer', color: activeTab === 'chat' ? '#0ff' : '#fff' }}>Chat</div>
            <div onClick={() => setActiveTab('tasks')} style={{ padding: '10px 0', cursor: 'pointer', color: activeTab === 'tasks' ? '#0ff' : '#fff' }}>Tasks</div>
            <div onClick={() => setActiveTab('notes')} style={{ padding: '10px 0', cursor: 'pointer', color: activeTab === 'notes' ? '#0ff' : '#fff' }}>Notes</div>
            <div onClick={() => setFullscreen(true)} style={{ padding: '10px 0', cursor: 'pointer', color: '#aaa' }}>🔲 Fullscreen</div>
          </nav>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: fullscreen ? 60 : 20 }}>
        {fullscreen ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src="/dex-avatar.png" alt="Dex" width="300" style={{ animation: 'pulse 2s infinite' }} />
            <button onClick={() => setFullscreen(false)} style={{ position: 'absolute', top: 20, right: 20 }}>Exit Fullscreen</button>
          </div>
        ) : activeTab === 'chat' ? (
          <>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 10 }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ margin: '10px 0', color: msg.role === 'user' ? '#0f0' : '#0ff' }}>
                  <strong>{msg.role === 'user' ? 'Mr. Armitage' : 'Dex'}:</strong> {msg.content}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex' }}>
              <input value={input} onChange={e => setInput(e.target.value)} style={{ flex: 1, padding: 10 }} placeholder="Type your message..." />
              <button onClick={() => handleSend()} style={{ padding: 10, marginLeft: 10 }}>Send</button>
              <button onClick={handleMic} style={{ padding: 10, marginLeft: 10 }}>
                {listening ? '🎙️...' : '🎤'}
              </button>
            </div>
          </>
        ) : activeTab === 'tasks' ? (
          <div>
            <h3>Scheduled Tasks</h3>
            {tasks.map((t, i) => (
              <div key={i} style={{ margin: '5px 0' }}>✅ {t.title} <span style={{ fontSize: 12, color: '#888' }}>({t.time})</span></div>
            ))}
          </div>
        ) : (
          <div style={{ flex: 1 }}>
            <h3>Notes</h3>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              style={{ width: '100%', height: '80%', padding: 10, background: '#1e1e1e', color: '#fff', border: 'none' }}
              placeholder="Write your notes here..."
            />
          </div>
        )}
      </div>
    </div>
  );
}
