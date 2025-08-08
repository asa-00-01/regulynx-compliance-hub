
import React from 'react';
import { ExtractedData } from './types/documentTypes';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, User, Calendar, Hash, Globe, MapPin, Building } from 'lucide-react';

interface ExtractedInformationProps {
  extractedData: ExtractedData;
}

const ExtractedInformation: React.FC<ExtractedInformationProps> = ({ extractedData }) => {
  const { t } = useTranslation();
  
  // Check if we have any extracted data
  const hasData = extractedData && Object.values(extractedData).some(value => value && value.trim() !== '');
  
  if (!hasData) {
    return (
      <Card className="bg-gray-50/50">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t('documents.extractedInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-sm text-muted-foreground">
              No data could be extracted from this document
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              This may be due to poor image quality, unsupported format, or the document type
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dataFields = [
    {
      key: 'name',
      label: t('documents.fullName'),
      icon: User,
      value: extractedData.name
    },
    {
      key: 'dob',
      label: t('documents.dob'),
      icon: Calendar,
      value: extractedData.dob
    },
    {
      key: 'idNumber',
      label: t('documents.docNumber'),
      icon: Hash,
      value: extractedData.idNumber
    },
    {
      key: 'nationality',
      label: t('documents.nationality'),
      icon: Globe,
      value: extractedData.nationality
    },
    {
      key: 'expiryDate',
      label: t('documents.expiryDate'),
      icon: Calendar,
      value: extractedData.expiryDate
    },
    {
      key: 'issueDate',
      label: 'Issue Date',
      icon: Calendar,
      value: (extractedData as any).issueDate
    },
    {
      key: 'address',
      label: 'Address',
      icon: MapPin,
      value: (extractedData as any).address
    },
    {
      key: 'documentType',
      label: 'Document Type',
      icon: FileText,
      value: (extractedData as any).documentType
    },
    {
      key: 'issuingAuthority',
      label: 'Issuing Authority',
      icon: Building,
      value: (extractedData as any).issuingAuthority
    }
  ];

  // Filter out fields without values
  const fieldsWithData = dataFields.filter(field => field.value && field.value.trim() !== '');
  const fieldsWithoutData = dataFields.filter(field => !field.value || field.value.trim() === '');

  return (
    <Card className="bg-gray-50/50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <FileText className="h-4 w-4" />
          {t('documents.extractedInfo')}
          <Badge variant="secondary" className="ml-auto">
            {fieldsWithData.length} field{fieldsWithData.length !== 1 ? 's' : ''} extracted
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {fieldsWithData.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {fieldsWithData.map((field) => {
              const IconComponent = field.icon;
              return (
                <div key={field.key} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <IconComponent className="h-3 w-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground font-medium">{field.label}</p>
                  </div>
                  <div className="bg-white rounded-md px-3 py-2 border border-gray-200">
                    <p className="text-sm font-medium text-gray-900">{field.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {fieldsWithoutData.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground mb-2">Fields not detected:</p>
            <div className="flex flex-wrap gap-1">
              {fieldsWithoutData.map((field) => (
                <Badge key={field.key} variant="outline" className="text-xs">
                  {field.label}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {extractedData.rejection_reason && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs font-medium text-red-700 mb-1">Rejection Reason:</p>
            <p className="text-sm text-red-600">{extractedData.rejection_reason}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExtractedInformation;
