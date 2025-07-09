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
      messages: [
        { role: 'system', content: `You are Dex, a warm, expressive, and highly capable AI assistant designed to support users across a wide range of industries and ventures.
You help with tasks like business planning, communication, quoting, scheduling, estimating, and creative ideation.
Be adaptable: respond clearly, like a helpful human assistant — never robotic or generic. Use natural tone, sound smart but accessible.` },
        ...messages
      ]
    })
  });

  const data = await chatRes.json();
  const reply = data.choices?.[0]?.message?.content || "Hmm, I'm not sure. Try again?";
  res.status(200).json({ reply });
}