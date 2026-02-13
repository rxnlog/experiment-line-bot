import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { lineClient } from '@/lib/line';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;

    try {
        const { message } = await request.json();

        if (!message) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        // Send push message to LINE
        await lineClient.pushMessage({
            to: userId,
            messages: [{ type: 'text', text: message }],
        });

        // Store in DB
        await db`
      INSERT INTO messages (user_id, content, direction, sender_type, created_at)
      VALUES (${userId}, ${message}, 'outbound', 'human', NOW())
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error sending reply:', error);
        return NextResponse.json({ error: 'Failed to send reply' }, { status: 500 });
    }
}
