import { GoogleGenAI } from '@google/genai';

const key = process.env.VITE_GEMINI_API_KEY;

if (!key) {
  console.error('VITE_GEMINI_API_KEY is not set. Please check your .env file.');
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: key });

async function main() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents:
        'Health check. Reply with a short JSON: {"ok": true} and nothing else.',
    });
    console.log('Raw Gemini response:');
    console.log(response.text);
  } catch (err) {
    console.error('Gemini health check failed:');
    console.error(err?.message ?? err);
    process.exit(1);
  }
}

main();

