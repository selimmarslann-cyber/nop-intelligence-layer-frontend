// lib/groq.ts
// Groq Dev Assistant: All completions route through https://api.groq.com/openai/v1/chat/completions
// API key from .env (GROQ_API_KEY)

// .env'den okunan env‑değişkenler
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

if (!GROQ_API_KEY) {
  throw new Error('❌ GROQ_API_KEY is missing in .env file');
}

/**
 * GROQ (OpenAI‑compatible) chat/completion endpoint.
 *
 * @param prompt   Kullanıcı mesajı
 * @param opts     Opsiyonel parametreler (model, temperature, max_tokens …)
 */
export async function groqChat(
  prompt: string,
  opts: {
    model?: string;          // örnek: "mixtral-8x7b-32768"
    temperature?: number;
    max_tokens?: number;
    stream?: boolean;
  } = {}
) {
  const payload = {
    model: opts.model ?? 'mixtral-8x7b-32768', // isteğe bağlı; default seçildi
    messages: [{ role: 'user', content: prompt }],
    temperature: opts.temperature ?? 0.7,
    max_tokens: opts.max_tokens ?? 1024,
    stream: opts.stream ?? false,
  };

  // Route all completions through https://api.groq.com/openai/v1/chat/completions
  const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const txt = await response.text();
    throw new Error(
      `❌ GROQ request failed (${response.status}) – ${response.statusText}\n${txt}`
    );
  }

  // JSON cevabı döner
  return response.json();
}
