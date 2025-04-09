import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type StructuredResult = {
  updatedParagraph: string;
  replacementRange: [number, number];
};

type LinkResponse = {
  phrase: string;
  range: [number, number];
  url: string;
};

export async function POST(request: Request) {
  const { text, action, paragraphText } = await request.json();

  let systemPrompt = '';
  let userPrompt = '';

  const needsStructuredOutput = action === 'rewrite' || action === 'simplify';

  if (needsStructuredOutput) {
    systemPrompt = `
You are a professional editor. You will receive:
1. A full paragraph for context.
2. A sentence (or line) from that paragraph that should be rewritten or simplified.

Your task is to improve only the selected sentence for clarity, grammar, or simplicity while keeping the rest of the paragraph unchanged.

✅ Do not change anything outside the selected sentence.
✅ Ensure grammar, punctuation, and formatting are preserved.
✅ Preserve tone and meaning. Be concise and accurate.

🔒 Before returning:
- Verify that your final "updatedParagraph" exactly matches the original paragraph except for the selected sentence.
- Ensure "replacementRange" accurately reflects the character positions where changes were made inside the paragraph.
- Double-check that you return **valid JSON** in this exact format only:

{
  "updatedParagraph": "FULL paragraph with only the selected sentence changed",
  "replacementRange": [startIndex, endIndex]
}

⛔️ Do not return any quotes or explanations.
    `.trim();

    userPrompt = `
Paragraph:
${paragraphText}

Selected text to ${action === 'rewrite' ? 'rewrite' : 'simplify'}:
${text}
    `.trim();
  } else if (action === 'link') {
    systemPrompt = `
You are a technical writing assistant.

You will receive:
- A full paragraph
- A selected text range from that paragraph

Your task:
1. Find a single meaningful **phrase** in the selected text that would benefit from a hyperlink.
2. Return only the phrase, its **start and end index** within the original paragraph, and a useful URL.

Return your response in this strict JSON format:

{
  "phrase": "Account abstraction",
  "range": [startIndex, endIndex],
  "url": "https://example.com/article"
}

✅ Make sure the phrase exists verbatim in the paragraph text.
✅ Only return one phrase + link.
⛔️ Do not explain or return anything else.
    `.trim();

    userPrompt = `
Paragraph:
${paragraphText}

Selected text:
${text}
    `.trim();
  } else {
    return new Response('Invalid action', { status: 400 });
  }

  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4-0125-preview',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0,
  });

  const rawResult = chatResponse.choices[0]?.message?.content?.trim() ?? '';

  if (action === 'link') {
    try {
      const parsed: LinkResponse = JSON.parse(rawResult);
      const found = paragraphText.slice(parsed.range[0], parsed.range[1]);

      if (found !== parsed.phrase) {
        const start = paragraphText.indexOf(parsed.phrase);
        if (start === -1) {
          throw new Error('Phrase not found in paragraph');
        }

        const end = start + parsed.phrase.length;
        parsed.range = [start, end]; 
        console.warn('⚠️ AI range was incorrect. Fixed range:', parsed.range);
      }

      return Response.json({
        result: parsed
      });
    } catch (e) {
      console.error('Failed to parse link result:', rawResult, e);
      return new Response('Failed to parse link result', { status: 500 });
    }
  }

  if (needsStructuredOutput) {
    try {
      const parsed: StructuredResult = JSON.parse(rawResult);
      return Response.json({ result: parsed });
    } catch (e) {
      console.error('Failed to parse OpenAI JSON output:', rawResult, e);
      return new Response('Failed to parse result', { status: 500 });
    }
  }

  return Response.json({ result: rawResult });
}
