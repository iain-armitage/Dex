
import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
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
  };

  const handleMic = () => {
    if (recognitionRef.current && !listening) {
      recognitionRef.current.start();
      setListening(true);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0e0e11', color: '#fff', fontFamily: 'sans-serif' }}>
      <div style={{ width: 250, background: '#13151a', padding: 20, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <img src="/dex-avatar.png" alt="Dex" width="100" style={{ borderRadius: '50%', marginBottom: 10 }} />
        <h2 style={{ margin: 0 }}>Dex</h2>
        <p style={{ fontSize: 12, color: '#aaa' }}>Ready to help</p>
        <nav style={{ marginTop: 30, width: '100%' }}>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>Chat</div>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>Tasks</div>
          <div style={{ padding: '10px 0', borderBottom: '1px solid #333' }}>Notes</div>
        </nav>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 20 }}>
        <div style={{ flex: 1, overflowY: 'auto', marginBottom: 10 }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ margin: '10px 0', color: msg.role === 'user' ? '#0f0' : '#0ff' }}>
              <strong>{msg.role}:</strong> {msg.content}
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
      </div>
    </div>
  );
}
