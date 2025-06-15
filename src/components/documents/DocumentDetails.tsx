
import React from 'react';
import { format } from 'date-fns';
import { Document } from '@/types/supabase';
import { ExtractedData } from './types/documentTypes';
import { useTranslation } from 'react-i18next';

interface DocumentDetailsProps {
  document: Document;
  extractedData: ExtractedData;
}

const DocumentDetails: React.FC<DocumentDetailsProps> = ({ document, extractedData }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{t('documents.details')}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-muted-foreground">{t('documents.type')}:</p>
            <p className="font-medium capitalize">{document.type}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('documents.uploaded')}:</p>
            <p className="font-medium">
              {format(new Date(document.upload_date), 'PPP')}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('documents.fileName')}:</p>
            <p className="font-medium truncate">{document.file_name}</p>
          </div>
          <div>
            <p className="text-muted-foreground">{t('documents.userId')}:</p>
            <p className="font-medium truncate">{document.user_id}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentDetails;
