import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { text, action } = await request.json();

  let systemPrompt = '';
  let userPrompt = '';

  switch (action) {
    case 'rewrite':
      systemPrompt = 'You are a professional copy editor. Rewrite text to improve clarity and tone while preserving the original meaning.';
      userPrompt = `Rewrite the following professionally:\n\n"${text}"`;
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
