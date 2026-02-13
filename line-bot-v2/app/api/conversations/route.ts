import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
    try {
        const { rows } = await db`
      SELECT 
        u.*, 
        m.content as last_message,
        m.created_at as last_message_at
      FROM users u
      LEFT JOIN (
        SELECT DISTINCT ON (user_id) user_id, content, created_at
        FROM messages
        ORDER BY user_id, created_at DESC
      ) m ON u.user_id = m.user_id
      ORDER BY u.updated_at DESC
    `;
        return NextResponse.json(rows);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}
