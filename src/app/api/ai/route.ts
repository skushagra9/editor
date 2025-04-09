export async function POST(request: Request) {
    const { text, action } = await request.json();
    let result;
    
    if (action === 'rewrite') {
      result = `${text} [professionally rewritten with enhanced clarity]`;
    } else if (action === 'simplify') {
      result = `${text} [simplified for easier understanding]`;
    } else if (action === 'link') {
        result = `https://www.google.com`;
      }
    
    return Response.json({ result });
  }