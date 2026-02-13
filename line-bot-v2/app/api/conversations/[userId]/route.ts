import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    const { userId } = await params;

    try {
        const userResult = await db`SELECT * FROM users WHERE user_id = ${userId}`;
        if (userResult.rowCount === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const messagesResult = await db`
      SELECT * FROM messages 
      WHERE user_id = ${userId} 
      ORDER BY created_at ASC
    `;

        return NextResponse.json({
            user: userResult.rows[0],
            messages: messagesResult.rows,
        });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch conversation details' }, { status: 500 });
    }
}
