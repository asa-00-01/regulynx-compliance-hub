
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const HeaderSearch = () => {
  return (
    <div className="relative flex-1 max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search..."
        className="pl-10 w-full"
      />
    </div>
  );
};

export default HeaderSearch;
