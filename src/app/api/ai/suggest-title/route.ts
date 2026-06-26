import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { content } = await request.json();
    if (!content || content.length < 20) {
      return NextResponse.json({ error: 'Content too short' }, { status: 400 });
    }

    // Simple title suggestion based on content
    const words = content.replace(/<[^>]*>/g, '').split(' ').slice(0, 8);
    const suggestion = words.join(' ') + '...';

    return NextResponse.json({ suggestion });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate suggestion' }, { status: 500 });
  }
}
