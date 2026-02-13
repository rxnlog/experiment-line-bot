'use client';

import { useState } from 'react';
import useSWR from 'swr';
// import { User } from '@/types/db';
import ChatSidebar from '@/components/chat/chat-sidebar';
import ChatWindow from '@/components/chat/chat-window';
import SettingsView from '@/components/settings-view';
import LineOfficialInfo from '@/components/line-oa-info';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define TS interfaces locally for now or better in a types file
interface User {
  user_id: string;
  display_name: string;
  picture_url: string;
  is_bot_active: boolean;
  updated_at: string;
}

const fetcher = (url: string) => fetch(url, {
  headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_KEY || 'hardcoded_secret_key_12345'}` }
}).then((res) => res.json());

export default function Dashboard() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [view, setView] = useState<'chat' | 'settings'>('chat');
  const { data: botSettings } = useSWR('/api/settings/bot', fetcher);

  const botDisplayName = botSettings?.bot_name ? ` - ${botSettings.bot_name}` : '';

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setView('chat');
  };

  const handleSettingsClick = () => {
    setView(prev => prev === 'settings' ? 'chat' : 'settings');
  };

  const handleHomeClick = () => {
    setSelectedUser(null);
    setView('chat');
  };

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <div className="hidden md:flex w-80 border-r bg-background flex-none">
        <ChatSidebar
          selectedUserId={selectedUser?.user_id}
          onSelectUser={handleSelectUser}
          onSettingsClick={handleSettingsClick}
          onHomeClick={handleHomeClick}
          botDisplayName={botDisplayName}
          mode="sidebar"
          view={view}
        />
      </div>

      {/* Topbar - Mobile */}
      <div className="flex md:hidden h-[110px] border-b flex-none">
        <ChatSidebar
          selectedUserId={selectedUser?.user_id}
          onSelectUser={handleSelectUser}
          onSettingsClick={handleSettingsClick}
          onHomeClick={handleHomeClick}
          botDisplayName={botDisplayName}
          mode="topbar"
          view={view}
        />
      </div>

      {/* Main Content (Remaining height on mobile, flex-1 on desktop) */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {view === 'settings' ? (
          <div className="flex-1 overflow-y-auto">
            <SettingsView />
          </div>
        ) : selectedUser ? (
          <ChatWindow user={selectedUser} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center bg-muted/5 p-4 overflow-y-auto">
            <LineOfficialInfo />
          </div>
        )}
      </div>
    </div>
  );
}
