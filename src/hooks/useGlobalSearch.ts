
import { useState, useEffect } from 'react';
import { mockTransactionData } from '@/components/transactions/mockTransactionData';
import { mockUsers } from '@/components/users/mockUsersData';
import { mockDocumentsCollection } from '@/mocks/centralizedMockData';
import { mockComplianceCases } from '@/mocks/casesData';
import { Transaction } from '@/types/transaction';
import { User, Document } from '@/types';
import { ComplianceCaseDetails as Case } from '@/types/case';

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
                ((t as any).party && (t as any).party.toLowerCase().includes(lowerCaseTerm)) ||
                ((t as any).description && (t as any).description.toLowerCase().includes(lowerCaseTerm))
            );

            // The user objects in mockUsers have `name`.
            const filteredUsers = mockUsers.filter(u =>
                (u.name && u.name.toLowerCase().includes(lowerCaseTerm)) ||
                (u.email && u.email.toLowerCase().includes(lowerCaseTerm))
            );

            const userMap = new Map(mockUsers.map(u => [u.id, u.name]));
            const filteredDocuments = mockDocumentsCollection.filter(d => {
              const customerName = (d as any).userId ? userMap.get((d as any).userId) : '';
              return ((d as any).fileName && (d as any).fileName.toLowerCase().includes(lowerCaseTerm)) ||
                     (customerName && customerName.toLowerCase().includes(lowerCaseTerm));
            });

            const filteredCases = mockComplianceCases.filter(c =>
                (c.id && c.id.toLowerCase().includes(lowerCaseTerm)) ||
                (c.description && c.description.toLowerCase().includes(lowerCaseTerm))
            );

            setResults({
                transactions: filteredTransactions as Transaction[],
                users: filteredUsers,
                documents: filteredDocuments as Document[],
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
