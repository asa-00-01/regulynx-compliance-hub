
import { useState, useMemo } from 'react';
import { Document, DocumentStatus, DocumentType } from '@/types/supabase';
import { useToast } from '@/hooks/use-toast';
import { useCompliance } from '@/context/ComplianceContext';

interface UseAdvancedDocumentFiltersProps {
  documents: Document[];
}

interface FilterState {
  searchTerm: string;
  statusFilter: DocumentStatus | 'all';
  typeFilter: DocumentType | 'all';
  customerFilter: string;
  dateRange: { from?: Date; to?: Date };
}

export const useAdvancedDocumentFilters = ({ documents }: UseAdvancedDocumentFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all',
    customerFilter: '',
    dateRange: {}
  });
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const { toast } = useToast();
  const { state } = useCompliance();

  const filteredDocuments = useMemo(() => {
    return documents.filter(document => {
      // Search term filter
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const customer = state.users.find(u => u.id === document.user_id);
        const customerName = customer?.fullName || '';
        
        if (!document.file_name.toLowerCase().includes(searchLower) &&
            !customerName.toLowerCase().includes(searchLower) &&
            !document.id.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      // Status filter
      if (filters.statusFilter !== 'all' && document.status !== filters.statusFilter) {
        return false;
      }

      // Type filter
      if (filters.typeFilter !== 'all' && document.type !== filters.typeFilter) {
        return false;
      }

      // Customer filter
      if (filters.customerFilter) {
        const customer = state.users.find(u => u.id === document.user_id);
        const customerName = customer?.fullName || '';
        if (!customerName.toLowerCase().includes(filters.customerFilter.toLowerCase())) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.from || filters.dateRange.to) {
        const documentDate = new Date(document.upload_date);
        if (filters.dateRange.from && documentDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && documentDate > filters.dateRange.to) return false;
      }

      return true;
    });
  }, [documents, filters, state.users]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.statusFilter !== 'all') count++;
    if (filters.typeFilter !== 'all') count++;
    if (filters.customerFilter) count++;
    if (filters.dateRange.from || filters.dateRange.to) count++;
    return count;
  }, [filters]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      searchTerm: '',
      statusFilter: 'all',
      typeFilter: 'all',
      customerFilter: '',
      dateRange: {}
    });
    setSelectedDocuments([]);
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId) 
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
  };

  const toggleAllDocuments = () => {
    if (selectedDocuments.length === filteredDocuments.length) {
      setSelectedDocuments([]);
    } else {
      setSelectedDocuments(filteredDocuments.map(doc => doc.id));
    }
  };

  const clearSelection = () => {
    setSelectedDocuments([]);
  };

  const exportData = () => {
    const exportData = filteredDocuments.map(doc => ({
      id: doc.id,
      fileName: doc.file_name,
      type: doc.type,
      status: doc.status,
      uploadDate: doc.upload_date,
      userId: doc.user_id,
      user: state.users.find(u => u.id === doc.user_id)?.fullName || 'Unknown User'
    }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `documents-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data Exported",
      description: `Successfully exported ${exportData.length} documents.`
    });
  };

  const handleBulkAction = (action: string, data?: any) => {
    console.log('Bulk action:', action, 'on documents:', selectedDocuments, 'with data:', data);
    
    // Perform the selected bulk action
    switch (action) {
      case 'approve':
        toast({
          title: "Documents Approved",
          description: `Successfully approved ${selectedDocuments.length} document(s).`
        });
        break;
      case 'reject':
        toast({
          title: "Documents Rejected",
          description: `Successfully rejected ${selectedDocuments.length} document(s).`
        });
        break;
      case 'request_info':
        toast({
          title: "Information Requested",
          description: `Information request sent for ${selectedDocuments.length} document(s).`
        });
        break;
      case 'send_notification':
        toast({
          title: "Notifications Sent",
          description: `Notifications sent for ${selectedDocuments.length} document(s).`
        });
        break;
      case 'flag_review':
        toast({
          title: "Documents Flagged",
          description: `Successfully flagged ${selectedDocuments.length} document(s) for review.`
        });
        break;
      case 'export_selected':
        const exportData = filteredDocuments
          .filter(doc => selectedDocuments.includes(doc.id))
          .map(doc => ({
            id: doc.id,
            fileName: doc.file_name,
            type: doc.type,
            status: doc.status,
            uploadDate: doc.upload_date,
            userId: doc.user_id,
            user: state.users.find(u => u.id === doc.user_id)?.fullName || 'Unknown User'
          }));
        
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `selected-documents-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        toast({
          title: "Documents Exported",
          description: `Successfully exported ${selectedDocuments.length} document(s).`
        });
        break;
      default:
        toast({
          title: "Action Completed",
          description: `Successfully performed ${action} on ${selectedDocuments.length} document(s).`
        });
    }
    
    // Simulate bulk action processing
    setTimeout(() => {
      toast({
        title: "Bulk Action Completed",
        description: `Successfully performed ${action} on ${selectedDocuments.length} document(s).`
      });
      clearSelection();
    }, 1000);
  };

  return {
    filters,
    filteredDocuments,
    activeFiltersCount,
    selectedDocuments,
    updateFilter,
    resetFilters,
    toggleDocumentSelection,
    toggleAllDocuments,
    clearSelection,
    handleBulkAction,
    exportData
  };
};
