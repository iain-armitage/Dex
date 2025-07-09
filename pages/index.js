import { useEffect, useRef, useState } from 'react';

export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const synthRef = useRef(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
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

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20, background: '#111', color: '#fff', height: '100vh' }}>
      <h1>Dex Assistant 🤖</h1>
      <div style={{ maxHeight: '60vh', overflowY: 'auto', marginBottom: 20 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ margin: '10px 0', color: msg.role === 'user' ? '#0f0' : '#0ff' }}>
            <strong>{msg.role}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <input value={input} onChange={e => setInput(e.target.value)} style={{ padding: 10, width: '80%' }} />
      <button onClick={handleSend} style={{ padding: 10, marginLeft: 10 }}>Send</button>
      <div style={{ marginTop: 30 }}>
        <img src="/dex-avatar.svg" alt="Dex" width="120" />
      </div>
    </div>
  );
}