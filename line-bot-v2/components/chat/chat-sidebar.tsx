'use client';

import useSWR from 'swr';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Bot, User as UserIcon, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

// Fetcher function
// NOTE: Hardcoded auth is out of scope for this POC. This mimics a JWT login 
// to streamline development and is expected to be replaced by actual auth.
const fetcher = (url: string) => fetch(url, {
    headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345'}` }
}).then((res) => {
    if (!res.ok) throw new Error('Failed to fetch');
    return res.json();
});

interface User {
    user_id: string;
    display_name: string;
    picture_url: string;
    is_bot_active: boolean;
    updated_at: string;
    last_message?: string;
    last_message_at?: string;
}

interface ChatSidebarProps {
    selectedUserId?: string;
    onSelectUser: (user: User) => void;
    onSettingsClick: () => void;
    onHomeClick: () => void;
    botDisplayName?: string;
    mode?: 'sidebar' | 'topbar';
    view?: 'chat' | 'settings';
}

export default function ChatSidebar({
    selectedUserId,
    onSelectUser,
    onSettingsClick,
    onHomeClick,
    botDisplayName,
    mode = 'sidebar',
    view = 'chat'
}: ChatSidebarProps) {
    const { data: users, error } = useSWR<User[]>('/api/conversations', fetcher, { refreshInterval: 5000 });
    const { theme, setTheme } = useTheme();

    if (error) return <div className="p-4 text-red-500 text-sm">Error: {error.message}</div>;
    if (!users) return <div className="p-4 text-sm animate-pulse">Loading...</div>;

    const usersList = Array.isArray(users) ? users : [];

    if (mode === 'topbar') {
        return (
            <div className="flex flex-col h-full w-full bg-background border-b">
                <div className="px-4 py-1.5 flex items-center justify-between border-b flex-none">
                    <button onClick={onHomeClick} className="flex items-center gap-1 cursor-pointer">
                        <Bot className="w-4 h-4 text-primary" />
                        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Conversations</span>
                    </button>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                            className="h-6 w-6 cursor-pointer"
                        >
                            <Sun className="w-3.5 h-3.5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute w-3.5 h-3.5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="sr-only">Toggle theme</span>
                        </Button>
                        <Button
                            variant={view === 'settings' ? 'secondary' : 'ghost'}
                            size="icon"
                            onClick={onSettingsClick}
                            className="h-6 w-6 cursor-pointer"
                        >
                            <Settings className={cn("w-3.5 h-3.5", view === 'settings' && "text-primary")} />
                        </Button>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="flex items-center gap-4 px-4 py-2 min-w-max h-full">
                        {usersList.length === 0 ? (
                            <div className="text-xs text-muted-foreground">No conversations</div>
                        ) : (
                            usersList.map((user) => (
                                <button
                                    key={user.user_id}
                                    onClick={() => onSelectUser(user)}
                                    className={cn(
                                        "flex flex-col items-center gap-1 group transition-all cursor-pointer",
                                        selectedUserId === user.user_id ? "scale-105" : "opacity-70 hover:opacity-100"
                                    )}
                                >
                                    <div className={cn(
                                        "relative rounded-full p-0.5 transition-colors",
                                        selectedUserId === user.user_id ? "bg-primary" : "bg-transparent"
                                    )}>
                                        <Avatar className="w-10 h-10 border-2 border-background">
                                            <AvatarImage src={user.picture_url} />
                                            <AvatarFallback><UserIcon className="w-5 h-5" /></AvatarFallback>
                                        </Avatar>
                                        {user.is_bot_active && (
                                            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border-2 border-background" />
                                        )}
                                    </div>
                                    <span className={cn(
                                        "text-[12px] font-semibold max-w-[70px] truncate mt-0.5",
                                        selectedUserId === user.user_id ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {user.display_name.split(' ')[0]}
                                    </span>
                                </button>
                            ))
                        )}
                    </div>
                    <ScrollBar orientation="horizontal" />
                </ScrollArea>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full min-h-0 overflow-hidden">
            <div className="p-4 border-b font-semibold flex items-center justify-between flex-none">
                <button
                    onClick={onHomeClick}
                    className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer text-left bg-transparent border-none p-0"
                >
                    <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                    <div className="flex flex-col leading-none">
                        <span className="text-[10px] uppercase text-muted-foreground font-bold tracking-wider">LINE Bot</span>
                        <span className="text-base font-bold truncate max-w-[150px]">
                            {botDisplayName ? botDisplayName.replace(' - ', '') : 'Assistant'}
                        </span>
                    </div>
                </button>
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                        className="h-8 w-8 cursor-pointer"
                    >
                        <Sun className="w-4 h-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute w-4 h-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                    <Button
                        variant={view === 'settings' ? 'secondary' : 'ghost'}
                        size="icon"
                        onClick={onSettingsClick}
                        className="h-8 w-8 cursor-pointer"
                    >
                        <Settings className={cn("w-4 h-4", view === 'settings' && "text-primary")} />
                    </Button>
                </div>
            </div>
            <ScrollArea className="flex-1 min-h-0">
                <div className="flex flex-col gap-1 p-2">
                    {usersList.length === 0 ? (
                        <div className="p-4 text-center text-xs text-muted-foreground mt-4">
                            No conversations yet
                        </div>
                    ) : (
                        usersList.map((user) => (
                            <button
                                key={user.user_id}
                                onClick={() => onSelectUser(user)}
                                className={cn(
                                    "flex items-center gap-3 p-3 pr-10 rounded-lg text-left transition-colors hover:bg-muted cursor-pointer min-w-0",
                                    selectedUserId === user.user_id && "bg-muted"
                                )}
                            >
                                <Avatar className="flex-shrink-0">
                                    <AvatarImage src={user.picture_url} />
                                    <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="flex items-center justify-between gap-1 overflow-hidden">
                                        <div className="font-medium truncate">{user.display_name}</div>
                                        <div className="text-[10px] text-muted-foreground whitespace-nowrap">
                                            {user.last_message_at ? new Date(user.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </div>
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate opacity-70">
                                        {user.last_message || 'No messages yet'}
                                    </div>
                                </div>
                                {user.is_bot_active && (
                                    <Badge variant="secondary" className="text-[10px] px-1 h-5">Bot On</Badge>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
