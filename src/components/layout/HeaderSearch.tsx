
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { TooltipHelp } from '@/components/ui/tooltip-custom';
import { User } from '@/types';
import { ComplianceCaseDetails as Case } from '@/types/case';
import { Document } from '@/types';
import { Transaction } from '@/types/transaction';

const HeaderSearch = () => {
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

  const handleSelect = (url: string, state?: object) => {
    navigate(url, { state });
    setPopoverOpen(false);
    setSearchTerm('');
  };

  return (
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
                    <CommandItem key={c.id} onSelect={() => handleSelect('/compliance-cases', { caseId: c.id })}>
                      <span>{c.description.substring(0, 50)}{c.description.length > 50 ? '...' : ''}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.documents.length > 0 && (
                <CommandGroup heading="Documents">
                  {results.documents.slice(0, 3).map((doc: Document) => (
                    <CommandItem key={doc.id} onSelect={() => handleSelect('/documents')}>
                      <span>{doc.fileName}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              
              {results.transactions.length > 0 && (
                <CommandGroup heading="Transactions">
                  {results.transactions.slice(0, 3).map((t: Transaction) => (
                    <CommandItem key={t.id} onSelect={() => handleSelect('/transactions', { transactionId: t.id })}>
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
  );
};

export default HeaderSearch;
