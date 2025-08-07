
import React, { useState, useEffect, useRef } from 'react';
import { Search, FileText, User } from 'lucide-react';
import { UnifiedUserData } from '@/context/compliance/types';
import { Document } from '@/types/supabase';

interface SearchResult {
  users: UnifiedUserData[];
  documents: Document[];
}

interface HeaderSearchProps {
  users: UnifiedUserData[];
  documents: Document[];
  onSelectUser: (user: UnifiedUserData) => void;
}

const HeaderSearch: React.FC<HeaderSearchProps> = ({ users, documents, onSelectUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({ users: [], documents: [] });
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchTerm) {
      const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

      const filteredDocuments = documents.filter(doc =>
        doc.file_name.toLowerCase().includes(searchTerm.toLowerCase())
      );

      setSearchResults({ users: filteredUsers, documents: filteredDocuments });
    } else {
      setSearchResults({ users: [], documents: [] });
    }
  }, [searchTerm, users, documents]);

  const handleUserClick = (user: UnifiedUserData) => {
    onSelectUser(user);
    setSearchTerm('');
    setSearchResults({ users: [], documents: [] });
  };

  return (
    <div className="relative w-full md:w-64">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Search className="w-5 h-5 text-gray-400" />
      </div>
      <input
        type="search"
        ref={searchInputRef}
        placeholder="Search users or documents"
        className="block w-full pl-10 pr-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <div className="absolute left-0 mt-2 w-full rounded-md shadow-lg bg-white z-10">
          <div className="max-h-60 overflow-y-auto">
            {searchResults.users.map((user) => (
              <div
                key={user.id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleUserClick(user)}
              >
                <User className="w-4 h-4 text-blue-500" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
            ))}

          {searchResults.documents.map((doc) => (
            <div 
              key={doc.id} 
              className="flex items-center space-x-2 p-2 hover:bg-gray-50 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-blue-500" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {doc.file_name}
                </p>
                <p className="text-xs text-gray-500">Document</p>
              </div>
            </div>
          ))}

            {searchResults.users.length === 0 && searchResults.documents.length === 0 && (
              <div className="p-2 text-sm text-gray-700">
                No results found.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderSearch;
