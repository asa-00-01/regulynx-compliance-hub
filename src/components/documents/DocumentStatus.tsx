
import React from 'react';
import { Document } from '@/types/supabase';
import { ExtractedData } from './types/documentTypes';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface DocumentStatusProps {
  document: Document;
  extractedData: ExtractedData;
}

const DocumentStatus: React.FC<DocumentStatusProps> = ({ document, extractedData }) => {
  const { t } = useTranslation();
  if (document.status === 'verified') {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-md">
        <div className="flex items-center gap-2 text-green-700">
          <Check className="h-5 w-5" />
          <p className="font-medium">{t('documents.statusVerified')}</p>
        </div>
        <p className="text-sm text-green-700 mt-1">
          {t('documents.verifiedBy')}: {document.verified_by || t('documents.system')} {t('documents.on')} {
            document.verification_date ? format(new Date(document.verification_date), 'PPP') : 'N/A'
          }
        </p>
      </div>
    );
  }

  if (document.status === 'rejected') {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center gap-2 text-red-700">
          <X className="h-5 w-5" />
          <p className="font-medium">{t('documents.statusRejected')}</p>
        </div>
        <p className="text-sm text-red-700 mt-1">
          {t('documents.rejectedBy')}: {document.verified_by || t('documents.system')} {t('documents.on')} {
            document.verification_date ? format(new Date(document.verification_date), 'PPP') : 'N/A'
          }
        </p>
        {extractedData?.rejection_reason && (
          <div className="mt-2">
            <p className="text-xs text-muted-foreground">{t('documents.reason')}:</p>
            <p className="text-sm">{extractedData.rejection_reason}</p>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export default DocumentStatus;
