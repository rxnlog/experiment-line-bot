import { NextRequest, NextResponse } from 'next/server';
import { validateSignature, WebhookEvent } from '@line/bot-sdk';
import { db } from '@/lib/db';
import { lineClient, lineConfig } from '@/lib/line';
import { aiModel } from '@/lib/ai';
import { generateText } from 'ai';

export async function POST(req: NextRequest) {
    try {
        const body = await req.text();
        const signature = req.headers.get('x-line-signature') as string;

        if (!lineConfig.channelSecret) {
            console.error('LINE_CHANNEL_SECRET is not set');
            return NextResponse.json({ error: 'Server config error' }, { status: 500 });
        }

        if (!validateSignature(body, lineConfig.channelSecret, signature)) {
            return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const events: WebhookEvent[] = JSON.parse(body).events;

        await Promise.all(events.map(async (event) => {
            if (event.type !== 'message' || event.message.type !== 'text') {
                return;
            }

            const userId = event.source.userId;
            if (!userId) return;

            const userMessage = event.message.text;

            // 1. Update/Insert User
            try {
                const profile = await lineClient.getProfile(userId);
                await db`
          INSERT INTO users (user_id, display_name, picture_url, updated_at)
          VALUES (${userId}, ${profile.displayName}, ${profile.pictureUrl}, NOW())
          ON CONFLICT (user_id) 
          DO UPDATE SET 
            display_name = EXCLUDED.display_name, 
            picture_url = EXCLUDED.picture_url, 
            updated_at = NOW()
        `;
            } catch (e) {
                console.error('Error fetching profile:', e);
                // Fallback for blocked users or errors
                await db`
          INSERT INTO users (user_id, display_name, updated_at)
          VALUES (${userId}, 'Unknown User', NOW())
          ON CONFLICT (user_id) DO UPDATE SET updated_at = NOW()
        `;
            }

            // 2. Store User Message
            await db`
        INSERT INTO messages (user_id, content, direction, sender_type, created_at)
        VALUES (${userId}, ${userMessage}, 'inbound', 'user', NOW())
      `;

            // 3. Check Bot Status & Settings
            const userResult = await db`SELECT is_bot_active FROM users WHERE user_id = ${userId}`;
            const isBotActive = userResult.rows[0]?.is_bot_active;
            console.log(`[Webhook] User: ${userId}, isBotActive: ${isBotActive}`);

            if (isBotActive) {
                console.log(`[Webhook] Bot is active for user ${userId}. Fetching settings...`);
                // Fetch Bot Settings
                const settingsResult = await db`SELECT bot_name, system_prompt_template FROM bot_settings LIMIT 1`;
                const botSettings = settingsResult.rows[0] || { bot_name: 'AI', system_prompt_template: 'You are a helpful assistant.' };

                // Fetch Recent History (Context)
                const historyResult = await db`
          SELECT content, sender_type 
          FROM messages 
          WHERE user_id = ${userId} 
          ORDER BY created_at DESC 
          LIMIT 10
        `;
                // Reverse to chronological order
                const history = historyResult.rows.reverse().map(m =>
                    `${m.sender_type === 'user' ? 'User' : 'Bot'}: ${m.content}`
                ).join('\n');

                const prompt = `
          ${botSettings.system_prompt_template}
          
          Current Conversation:
          ${history}
          User: ${userMessage}
          Bot:
        `;

                console.log(`[Webhook] Full Prompt sent to AI:`, prompt);
                console.log(`[Webhook] Sending prompt to AI...`);
                // Generate AI Reply
                try {
                    const { text } = await generateText({
                        model: aiModel,
                        prompt: prompt,
                    });

                    const replyText = text.trim();
                    console.log(`[Webhook] AI Reply generated: ${replyText.substring(0, 50)}...`);

                    // Send Reply to LINE
                    await lineClient.replyMessage({
                        replyToken: event.replyToken,
                        messages: [{ type: 'text', text: replyText }],
                    });
                    console.log(`[Webhook] Reply sent to LINE.`);

                    // Store Bot Reply
                    await db`
          INSERT INTO messages (user_id, content, direction, sender_type, created_at)
          VALUES (${userId}, ${replyText}, 'outbound', 'bot', NOW())
        `;
                } catch (aiError: any) {
                    console.error('[Webhook] AI/LINE Error:', aiError);
                }
            } else {
                console.log(`[Webhook] Bot is NOT active for user ${userId}.`);
            }
        }));

        return NextResponse.json({ status: 'success' });

    } catch (error) {
        console.error('Error in webhook:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
