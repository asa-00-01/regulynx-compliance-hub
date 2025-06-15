
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, User as UserIcon, Settings, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/common/LanguageSelector';
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import NotificationBell from './NotificationBell';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { User } from '@/types';
import { ComplianceCaseDetails as Case } from '@/types/case';
import { Document } from '@/types';
import { Transaction } from '@/types/transaction';

interface HeaderProps {
  toggleSidebar: () => void;
  sidebarOpen: boolean;
}

const Header = ({ toggleSidebar, sidebarOpen }: HeaderProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const { results, loading } = useGlobalSearch(debouncedSearchTerm);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (searchTerm.trim() !== '') {
        setPopoverOpen(true);
    } else {
        setPopoverOpen(false);
    }
  }, [searchTerm, loading]);

  const handleLogout = () => {
    logout();
  };

  const handleProfileClick = () => {
    navigate('/profile?tab=profile');
  };

  const handleSettingsClick = () => {
    navigate('/profile?tab=security');
  };
  
  const handleSelect = (url: string) => {
    navigate(url);
    setPopoverOpen(false);
    setSearchTerm('');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <TooltipHelp content={sidebarOpen ? "Close navigation menu" : "Open navigation menu"}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="md:hidden"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </TooltipHelp>
      <TooltipHelp content={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
        <Button
          variant="ghost"
          size="icon"
          className="hidden md:flex"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </TooltipHelp>

      <div className="flex-1">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <div className="relative max-w-md w-full">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <TooltipHelp content="Search across users, cases, documents, and transactions. Use keywords to quickly find what you're looking for.">
                <input
                  type="search"
                  placeholder="Search users, cases, documents..."
                  className="pl-8 h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => { if (searchTerm) setPopoverOpen(true) }}
                />
              </TooltipHelp>
            </div>
          </PopoverTrigger>
          <PopoverContent className="w-[500px] p-0" align="start">
            <Command>
              <CommandList>
                {loading && <CommandItem disabled>Searching...</CommandItem>}
                {!loading && debouncedSearchTerm && results.users.length === 0 && results.cases.length === 0 && results.documents.length === 0 && results.transactions.length === 0 && <CommandEmpty>No results found.</CommandEmpty>}
                
                {results.users.length > 0 && (
                  <CommandGroup heading="Users">
                    {results.users.slice(0, 3).map((u: User) => (
                      <CommandItem key={u.id} onSelect={() => handleSelect(`/user-case/${u.id}`)}>
                        <span>{u.name} ({u.email})</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {results.cases.length > 0 && (
                  <CommandGroup heading="Cases">
                    {results.cases.slice(0, 3).map((c: Case) => (
                      <CommandItem key={c.id} onSelect={() => handleSelect(`/compliance-cases/${c.id}`)}>
                        <span>{c.description.substring(0, 50)}{c.description.length > 50 ? '...' : ''}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.documents.length > 0 && (
                  <CommandGroup heading="Documents">
                    {results.documents.slice(0, 3).map((doc: Document) => (
                      <CommandItem key={doc.id} onSelect={() => handleSelect('/documents')}>
                        <span>{(doc as any).fileName}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
                
                {results.transactions.length > 0 && (
                  <CommandGroup heading="Transactions">
                    {results.transactions.slice(0, 3).map((t: Transaction) => (
                      <CommandItem key={t.id} onSelect={() => handleSelect('/transactions')}>
                        <span>{t.id.substring(0,8)}... - {(t as any).party} - {t.amount} {t.currency}</span>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-2">
        <TooltipHelp content="Change the application language between English and Swedish">
          <LanguageSelector />
        </TooltipHelp>
        
        <NotificationBell />

        <DropdownMenu>
          <TooltipHelp content="Access your profile, settings, and account options">
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                  <AvatarFallback className="text-foreground bg-secondary">
                    {user?.name?.substring(0, 2).toUpperCase() || <UserIcon className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
          </TooltipHelp>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={handleProfileClick} className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleSettingsClick} className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={handleLogout} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
