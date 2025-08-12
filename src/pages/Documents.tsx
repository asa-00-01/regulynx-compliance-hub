
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Download, Plus } from 'lucide-react';
import DocumentVerificationView from '@/components/documents/DocumentVerificationView';
import DocumentsGrid from '@/components/documents/DocumentsGrid';
import DocumentStats from '@/components/documents/DocumentStats';
import { useDocuments } from '@/hooks/useDocuments';
import { Document, DocumentStatus } from '@/types/supabase';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Documents = () => {
  const [activeTab, setActiveTab] = useState<DocumentStatus | 'all'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const { t } = useTranslation();

  const {
    documents,
    loading,
    stats,
    refetch
  } = useDocuments(userId);

  const filteredDocuments = documents.filter(doc => {
    if (activeTab === 'all') return true;
    return doc.status === activeTab;
  });

  const handleTabChange = (value: string) => {
    setActiveTab(value as DocumentStatus | 'all');
  };

  const handleViewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleReviewDocument = (document: Document) => {
    setSelectedDocument(document);
  };

  const handleVerificationComplete = () => {
    setSelectedDocument(null);
    refetch();
  };

  const handleUploadComplete = () => {
    refetch();
  };

  if (selectedDocument) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{t('navigation.documents')}</h1>
            <p className="text-muted-foreground">
              {t('documents.verificationDesc')}
            </p>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setSelectedDocument(null)}
          >
            {t('common.back')}
          </Button>
        </div>
        
        <DocumentVerificationView
          document={selectedDocument}
          onVerificationComplete={handleVerificationComplete}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('navigation.documents')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('documents.description')}
            {userId && ` ${t('documents.forSelectedCustomer')}`}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t('common.export')}
          </Button>
        </div>
      </div>

      {/* Document Statistics */}
      <DocumentStats stats={stats} />

      {/* Search and Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('documents.searchPlaceholder')}
              className="pl-10 w-64"
            />
          </div>
          
          <Select defaultValue="all">
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('documents.type')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('documents.allTypes')}</SelectItem>
              <SelectItem value="passport">{t('documents.passport')}</SelectItem>
              <SelectItem value="drivers_license">{t('documents.driversLicense')}</SelectItem>
              <SelectItem value="utility_bill">{t('documents.utilityBill')}</SelectItem>
              <SelectItem value="bank_statement">{t('documents.bankStatement')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t('common.filters')}
        </Button>
      </div>

      {/* Documents Grid */}
      <DocumentsGrid
        documents={filteredDocuments}
        loading={loading}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onUploadComplete={handleUploadComplete}
        onViewDocument={handleViewDocument}
        onReviewDocument={handleReviewDocument}
      />
    </div>
  );
};

export default Documents;
