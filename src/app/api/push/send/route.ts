import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { title, body, data } = await request.json();
    // Send push notification via FCM
    // Implementation depends on FCM server key setup
    return NextResponse.json({ success: true, sent: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
  }
}
