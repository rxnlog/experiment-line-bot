'use client';

import useSWR from 'swr';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface User {
  user_id: string;
  display_name: string;
  picture_url: string;
  updated_at: string;
}

export default function Home() {
  const { data: users, error, isLoading } = useSWR<User[]>('/api/conversations', fetcher, { refreshInterval: 5000 });

  if (error) return <div className="p-10 text-red-500">Failed to load conversations. Check DB connection.</div>;
  if (isLoading) return <div className="p-10">Loading...</div>;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">LINE Bot Conversations</h1>

      <div className="grid gap-4 max-w-2xl mx-auto">
        {users?.map((user) => (
          <Link
            key={user.user_id}
            href={`/chat/${user.user_id}`}
            className="block p-6 bg-white rounded-lg shadow-sm hover:shadow-md transition border border-gray-100 flex items-center gap-4"
          >
            {user.picture_url ? (
              <img src={user.picture_url} alt={user.display_name} className="w-12 h-12 rounded-full" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">?</div>
            )}

            <div className="flex-1">
              <h2 className="text-xl font-semibold text-gray-900">{user.display_name || 'Unknown User'}</h2>
              <p className="text-sm text-gray-500 font-mono">{user.user_id}</p>
            </div>

            <div className="text-xs text-gray-400" suppressHydrationWarning>
              {new Date(user.updated_at).toLocaleString()}
            </div>
          </Link>
        ))}

        {!users?.length && (
          <div className="text-center text-gray-500 py-10">
            No conversations yet. Send a message to your bot!
          </div>
        )}
      </div>
    </main>
  );
}
