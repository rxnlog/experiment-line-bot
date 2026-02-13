import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;

    try {
        const { isBotActive } = await request.json();

        if (typeof isBotActive !== 'boolean') {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        await db`
      UPDATE users 
      SET is_bot_active = ${isBotActive}, updated_at = NOW() 
      WHERE user_id = ${userId}
    `;

        return NextResponse.json({ success: true, isBotActive });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update bot status' }, { status: 500 });
    }
}
