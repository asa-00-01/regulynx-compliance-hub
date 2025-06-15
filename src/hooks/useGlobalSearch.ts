
import { useState, useEffect } from 'react';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';
import { mockUsersData } from '@/components/users/mockUsersData';
import { mockDocumentData } from '@/components/documents/mockDocumentData';
import { casesData } from '@/mocks/casesData';
import { Transaction } from '@/types/transaction';
import { User } from '@/types';
import { Document } from '@/components/documents/types/documentTypes';
import { Case } from '@/types/case';

interface SearchResults {
  transactions: Transaction[];
  users: User[];
  documents: Document[];
  cases: Case[];
}

export const useGlobalSearch = (term: string) => {
  const [results, setResults] = useState<SearchResults>({
    transactions: [],
    users: [],
    documents: [],
    cases: [],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!term.trim()) {
      setResults({ transactions: [], users: [], documents: [], cases: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const lowerCaseTerm = term.toLowerCase();

    // In a real app, this would be an API call.
    // Here we filter mock data with a simulated delay.
    const searchPromise = new Promise(resolve => {
        setTimeout(() => {
            const filteredTransactions = mockTransactionData.transactions.filter(t =>
                t.id.toLowerCase().includes(lowerCaseTerm) ||
                t.party.toLowerCase().includes(lowerCaseTerm) ||
                (t.description && t.description.toLowerCase().includes(lowerCaseTerm))
            );

            // The user objects in mockUsersData have `fullName`.
            const filteredUsers = (mockUsersData as any[]).filter(u =>
                (u.fullName && u.fullName.toLowerCase().includes(lowerCaseTerm)) ||
                (u.email && u.email.toLowerCase().includes(lowerCaseTerm))
            );

            const filteredDocuments = mockDocumentData.documents.filter(d =>
                (d.name && d.name.toLowerCase().includes(lowerCaseTerm)) ||
                (d.customer && d.customer.toLowerCase().includes(lowerCaseTerm))
            );

            const filteredCases = casesData.filter(c =>
                (c.caseId && c.caseId.toLowerCase().includes(lowerCaseTerm)) ||
                (c.subject && c.subject.toLowerCase().includes(lowerCaseTerm))
            );

            setResults({
                transactions: filteredTransactions,
                users: filteredUsers,
                documents: filteredDocuments,
                cases: filteredCases,
            });
            resolve(true);
        }, 300); // Simulate search latency
    });
    
    searchPromise.finally(() => {
        setLoading(false);
    });

  }, [term]);

  return { results, loading };
};
