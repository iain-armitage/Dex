export default async function handler(req, res) {
  const { messages } = req.body;
  const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

  const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages
    })
  });

  const data = await chatRes.json();
  const reply = data.choices?.[0]?.message?.content || 'Hmm, I'm not sure. Try again?';
  res.status(200).json({ reply });
}