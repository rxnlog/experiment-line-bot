import { NextRequest, NextResponse } from 'next/server';
import { messagingApi, WebhookEvent, validateSignature } from '@line/bot-sdk';
import { sql } from '@vercel/postgres';

// 1. Setup LINE Client
const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const channelSecret = process.env.LINE_CHANNEL_SECRET || '';

const client = new messagingApi.MessagingApiClient({
    channelAccessToken,
});

export async function POST(req: NextRequest) {
    try {
        // 2. Validate Signature
        const body = await req.text();
        const signature = req.headers.get('x-line-signature') as string;

        if (!channelSecret) {
            console.error('LINE_CHANNEL_SECRET is not set');
            return NextResponse.json({ error: 'Server config error' }, { status: 500 });
        }

        if (!validateSignature(body, channelSecret, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        // 3. Process Events
        const events: WebhookEvent[] = JSON.parse(body).events;

        await Promise.all(events.map(async (event) => {
            if (event.type !== 'message' || event.message.type !== 'text') {
                return;
            }

            const userId = event.source.userId;
            if (!userId) return;

            const userMessage = event.message.text;

            // 4. Update User Profile in DB
            try {
                const profile = await client.getProfile(userId);
                await sql`
          INSERT INTO users (user_id, display_name, picture_url, updated_at)
          VALUES (${userId}, ${profile.displayName}, ${profile.pictureUrl}, NOW())
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            display_name = EXCLUDED.display_name, 
            picture_url = EXCLUDED.picture_url, 
            updated_at = NOW();
        `;
            } catch (e) {
                console.error('Error fetching profile or updating user:', e);
                // Fallback if profile fetch fails (e.g. user blocked bot)
                await sql`
          INSERT INTO users (user_id, display_name, updated_at)
          VALUES (${userId}, 'Unknown User', NOW())
          ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW();
        `;
            }

            // 5. Store Message in DB
            await sql`
        INSERT INTO messages (user_id, content, direction, created_at)
        VALUES (${userId}, ${userMessage}, 'inbound', NOW());
      `;
        }));

        return NextResponse.json({ status: 'success' });

    } catch (error) {
        console.error('Error in webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
