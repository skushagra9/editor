import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { text, action, paragraphText } = await request.json();

  console.log(text, action, paragraphText)

  let systemPrompt = '';
  let userPrompt = '';

  switch (action) {
    case 'rewrite':
      systemPrompt = 'You are a professional copy editor. Improve clarity and tone of a specific section within a larger paragraph. Only rewrite the highlighted section, but use the full paragraph for context. Preserve original meaning. Return only the rewritten version of the highlighted section.';

      userPrompt = `
Paragraph:
"${paragraphText}"

Selected text to rewrite:
"${text}"
  `.trim();
      break;

    case 'simplify':
      systemPrompt = 'You simplify complex ideas for a general audience without losing important meaning.';
      userPrompt = `Simplify this text for better understanding:\n\n"${text}"`;
      break;

    case 'link':
      systemPrompt = 'You are a helpful assistant that provides a single, relevant URL in response to user queries.';
      userPrompt = `Provide a direct and useful URL related to the following topic:\n\n"${text}"\n\nJust return the URL.`;
      break;

    default:
      return new Response('Invalid action', { status: 400 });
  }

  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.5,
  });

  const result = chatResponse.choices[0]?.message?.content?.trim();
  console.log(result, systemPrompt, userPrompt)

  return Response.json({ result });
}
