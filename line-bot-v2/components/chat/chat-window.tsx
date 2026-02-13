'use client';

import { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Send, Bot, User as UserIcon, ChevronLeft } from 'lucide-react';

interface User {
    user_id: string;
    display_name: string;
    picture_url: string;
    is_bot_active: boolean;
    updated_at: string;
}

interface Message {
    id: number;
    content: string;
    direction: 'inbound' | 'outbound';
    sender_type: 'user' | 'bot' | 'human';
    created_at: string;
}

interface ChatWindowProps {
    user: User;
    onBackClick?: () => void;
}

// NOTE: Hardcoded auth is out of scope for this POC. This mimics a JWT login 
// to streamline development and is expected to be replaced by actual auth.
const fetcher = (url: string) => fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345'}` }
}).then((res) => res.json());

export default function ChatWindow({ user, onBackClick }: ChatWindowProps) {
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const [inputText, setInputText] = useState('');
    const [isBotActive, setIsBotActive] = useState(user.is_bot_active);

    const { data: botSettings } = useSWR('/api/settings/bot', fetcher);

    const { data, mutate } = useSWR<{ messages: Message[] }>(
        `/api/conversations/${user.user_id}`,
        fetcher,
        { refreshInterval: 2000 }
    );

    // Sync bot status when user changes
    useEffect(() => {
        setIsBotActive(user.is_bot_active);
    }, [user]);

    // Scroll to bottom on new messages
    useEffect(() => {
        if (scrollAreaRef.current) {
            const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({
                    top: viewport.scrollHeight,
                    behavior: 'smooth'
                });
            }
        }
    }, [data?.messages]);

    const handleSendMessage = async () => {
        if (!inputText.trim()) return;

        try {
            await fetch(`/api/conversations/${user.user_id}/reply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // NOTE: Hardcoded auth is out of scope for this POC.
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345'}`
                },
                body: JSON.stringify({ message: inputText }),
            });
            setInputText('');
            mutate(); // Refresh messages
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleToggleBot = async (checked: boolean) => {
        setIsBotActive(checked);
        try {
            await fetch(`/api/conversations/${user.user_id}/toggle`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    // NOTE: Hardcoded auth is out of scope for this POC.
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345'}`
                },
                body: JSON.stringify({ isBotActive: checked }),
            });
            // Optionally revalidate user list in sidebar if we could access it
        } catch (error) {
            console.error('Failed to toggle bot', error);
            setIsBotActive(!checked); // Revert UI on error
        }
    };

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between flex-none">
                <div className="flex items-center gap-3 overflow-hidden">
                    {onBackClick && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onBackClick}
                            className="md:hidden -ml-2 h-8 w-8 flex-none cursor-pointer"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <Avatar className="flex-none">
                        <AvatarImage src={user.picture_url} />
                        <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <div className="font-semibold truncate">{user.display_name}</div>
                        <div className="text-xs text-muted-foreground truncate">ID: {user.user_id}</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Label htmlFor="bot-mode">Auto-Reply</Label>
                    <Switch
                        id="bot-mode"
                        checked={isBotActive}
                        onCheckedChange={handleToggleBot}
                        className="cursor-pointer"
                    />
                </div>
            </div>

            {/* Messages */}
            <ScrollArea ref={scrollAreaRef} className="flex-1 min-h-0">
                <div className="flex flex-col gap-4 p-4 md:px-24 md:py-8">
                    {data?.messages?.map((msg) => (
                        <div
                            key={msg.id}
                            className={`flex gap-3 ${msg.direction === 'outbound' ? 'flex-row-reverse' : 'flex-row'}`}
                        >
                            {/* Message Avatar */}
                            <Avatar className="w-10 h-10 flex-shrink-0 border shadow-sm">
                                {msg.direction === 'inbound' ? (
                                    <>
                                        <AvatarImage src={user.picture_url} />
                                        <AvatarFallback><UserIcon className="w-5 h-5" /></AvatarFallback>
                                    </>
                                ) : (
                                    <>
                                        <AvatarImage src={msg.sender_type === 'bot' ? botSettings?.bot_avatar_url : undefined} />
                                        <AvatarFallback>
                                            {msg.sender_type === 'bot' ? <Bot className="w-5 h-5" /> : <UserIcon className="w-5 h-5" />}
                                        </AvatarFallback>
                                    </>
                                )}
                            </Avatar>

                            <div
                                className={`max-w-[85%] rounded-lg p-3 break-words ${msg.direction === 'outbound'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                    }`}
                            >
                                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                                <div className="text-[10px] opacity-70 flex items-center gap-1 mt-1">
                                    {msg.sender_type === 'bot' && <Bot className="w-3 h-3 mr-1" />}
                                    {msg.sender_type === 'human' && <span className="mr-1">(You)</span>}
                                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            {/* Input */}
            <div className="p-4 md:px-24 md:py-8 border-t flex items-end gap-2 flex-none">
                <Textarea
                    placeholder="แชทเลย..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                    className="min-h-[44px] max-h-32 focus-visible:ring-primary resize-none py-3"
                    rows={1}
                />
                <Button
                    onClick={handleSendMessage}
                    className="cursor-pointer h-11 w-11 flex-none"
                    size="icon"
                >
                    <Send className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
}
