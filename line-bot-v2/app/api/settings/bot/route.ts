import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const { rows } = await db`SELECT * FROM bot_settings LIMIT 1`;
        const settings = rows[0] || {
            bot_name: 'AI Assistant',
            bot_avatar_url: '',
            system_prompt_template: 'You are a helpful assistant.'
        };
        return NextResponse.json(settings);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { bot_name, bot_avatar_url, system_prompt_template } = await req.json();

        // Upsert settings (assuming id=1 for single bot instance)
        await db`
      INSERT INTO bot_settings (id, bot_name, bot_avatar_url, system_prompt_template, updated_at)
      VALUES (1, ${bot_name}, ${bot_avatar_url}, ${system_prompt_template}, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        bot_name = EXCLUDED.bot_name,
        bot_avatar_url = EXCLUDED.bot_avatar_url,
        system_prompt_template = EXCLUDED.system_prompt_template,
        updated_at = NOW()
    `;

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
}
