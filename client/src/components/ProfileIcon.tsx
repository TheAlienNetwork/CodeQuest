import { useState } from 'react';
import { User, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: number;
  email: string;
  adventurersName: string;
  profileImageUrl?: string;
  xp: number;
  level: number;
  rank: string;
}

interface ProfileIconProps {
  user: User;
  onProfileClick: () => void;
  onLogout: () => void;
}

export default function ProfileIcon({ user, onProfileClick, onLogout }: ProfileIconProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full border-2 border-[var(--cyber-cyan)] hover:border-[var(--cyber-pink)] transition-colors"
        >
          {user.profileImageUrl ? (
            <img
              src={user.profileImageUrl}
              alt={user.adventurersName}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <User className="h-5 w-5 text-[var(--cyber-cyan)]" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[var(--cyber-gray)] border-[var(--cyber-cyan)]/30">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-[var(--cyber-cyan)]">{user.adventurersName}</p>
            <p className="text-xs text-gray-400">{user.email}</p>
            <p className="text-xs text-[#ff9900]">
              Level {user.level} • {user.rank}
            </p>
          </div>
        </div>
        <DropdownMenuItem
          onClick={onProfileClick}
          className="text-white hover:bg-[var(--cyber-purple)]/20"
        >
          <Settings className="mr-2 h-4 w-4" />
          Profile Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onLogout}
          className="text-red-400 hover:bg-red-400/20"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}