'use client';

import { useParams } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface Message {
    id: number;
    content: string;
    direction: 'inbound' | 'outbound';
    created_at: string;
}

export default function ChatPage() {
    const { userId } = useParams();
    const [input, setInput] = useState('');
    const scrollRef = useRef<HTMLDivElement>(null);

    // Fetch messages every 2 seconds
    const { data: messages, mutate } = useSWR<Message[]>(
        userId ? `/api/messages?userId=${userId}` : null,
        fetcher,
        { refreshInterval: 2000 }
    );

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const tempMsg = { id: Date.now(), content: input, direction: 'outbound' as const, created_at: new Date().toISOString() };

        // Optimistic update
        mutate([...(messages || []), tempMsg], false);
        setInput('');

        try {
            await fetch('/api/reply', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, message: tempMsg.content }),
            });
            mutate(); // Re-fetch to get real ID and status
        } catch (err) {
            alert('Failed to send');
            console.error(err);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white p-4 shadow-sm flex items-center justify-between">
                <h1 className="text-xl font-bold text-gray-800">Chat with: {userId}</h1>
                <a href="/" className="text-blue-500 hover:underline">Back to List</a>
            </header>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages?.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[70%] rounded-lg p-3 shadow-sm ${msg.direction === 'outbound'
                                    ? 'bg-blue-500 text-white rounded-br-none'
                                    : 'bg-white text-gray-800 rounded-bl-none'
                                }`}
                        >
                            <p>{msg.content}</p>
                            <div className={`text-[10px] mt-1 ${msg.direction === 'outbound' ? 'text-blue-100' : 'text-gray-400'}`} suppressHydrationWarning>
                                {new Date(msg.created_at).toLocaleTimeString()}
                            </div>
                        </div>
                    </div>
                ))}
                {!messages && <div className="text-center text-gray-400 mt-10">Loading messages...</div>}
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a reply..."
                    className="flex-1 border border-gray-300 rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                    type="submit"
                    disabled={!input.trim()}
                    className="bg-blue-600 text-white rounded-full px-6 py-2 font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                    Send
                </button>
            </form>
        </div>
    );
}
