import { NextRequest, NextResponse } from 'next/server';
import { messagingApi } from '@line/bot-sdk';
import { sql } from '@vercel/postgres';

const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const client = new messagingApi.MessagingApiClient({
    channelAccessToken,
});

export async function POST(req: NextRequest) {
    try {
        const { userId, message } = await req.json();

        if (!userId || !message) {
            return NextResponse.json({ error: 'Missing userId or message' }, { status: 400 });
        }

        // 1. Send to LINE
        await client.pushMessage({
            to: userId,
            messages: [{ type: 'text', text: message }],
        });

        // 2. Log to DB
        await sql`
      INSERT INTO messages (user_id, content, direction, created_at)
      VALUES (${userId}, ${message}, 'outbound', NOW());
    `;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Reply error:', error);
        return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
    }
}
