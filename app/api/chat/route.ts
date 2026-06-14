import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest } from 'next/server';

type Msg = { role: 'user' | 'assistant'; content: string };

/**
 * Converts our messages array (which may start with an assistant
 * opening question or have consecutive same-role turns) into a valid Gemini history.
 */
function toGeminiHistory(msgs: Msg[]) {
  const raw = msgs.map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: m.content }],
  }));

  // Drop any leading 'model' turns
  let start = 0;
  while (start < raw.length && raw[start].role === 'model') start++;

  // Merge consecutive same-role messages (Gemini requires strict alternation)
  const result: Array<{ role: 'user' | 'model'; parts: { text: string }[] }> = [];
  for (let i = start; i < raw.length; i++) {
    const cur = raw[i];
    const last = result[result.length - 1];
    if (last && last.role === cur.role) {
      last.parts.push(...cur.parts);
    } else {
      result.push({ role: cur.role, parts: [...cur.parts] });
    }
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, systemPrompt } = await request.json();

    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No messages provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'No API key configured. Set GEMINI_API_KEY in your environment.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const genai = new GoogleGenerativeAI(apiKey);

    const model = genai.getGenerativeModel({
      model: 'gemini-3.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: { maxOutputTokens: 800, temperature: 0.9 },
    });

    // All messages except the last become history; last is the current prompt
    const history = toGeminiHistory(messages.slice(0, -1));
    const lastMessage: Msg = messages[messages.length - 1];

    // If the last message isn't from user (shouldn't happen), default gracefully
    const userPrompt =
      lastMessage.role === 'user'
        ? lastMessage.content
        : messages.findLast((m: Msg) => m.role === 'user')?.content ?? '';

    const chat = model.startChat({ history });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = await chat.sendMessageStream(userPrompt);
          for await (const chunk of result.stream) {
            const text = chunk.text();
            if (text) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } catch (err) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: String(err) })}\n\n`)
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: `Request failed: ${String(err)}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
