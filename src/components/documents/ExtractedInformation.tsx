
import React from 'react';
import { ExtractedData } from './types/documentTypes';
import { useTranslation } from 'react-i18next';

interface ExtractedInformationProps {
  extractedData: ExtractedData;
}

const ExtractedInformation: React.FC<ExtractedInformationProps> = ({ extractedData }) => {
  const { t } = useTranslation();
  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <h3 className="text-sm font-medium mb-3">{t('documents.extractedInfo')}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">{t('documents.fullName')}</p>
          <p className="text-sm font-medium">{extractedData?.name || t('documents.notAvailable')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('documents.dob')}</p>
          <p className="text-sm font-medium">{extractedData?.dob || t('documents.notAvailable')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('documents.docNumber')}</p>
          <p className="text-sm font-medium">{extractedData?.idNumber || t('documents.notAvailable')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('documents.nationality')}</p>
          <p className="text-sm font-medium">{extractedData?.nationality || t('documents.notAvailable')}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{t('documents.expiryDate')}</p>
          <p className="text-sm font-medium">{extractedData?.expiryDate || t('documents.notAvailable')}</p>
        </div>
      </div>
    </div>
  );
};

export default ExtractedInformation;
