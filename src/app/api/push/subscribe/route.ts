import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const subscription = await request.json();
    // Store subscription in Firestore or send to FCM
    // For now, just acknowledge
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid subscription' }, { status: 400 });
  }
}
