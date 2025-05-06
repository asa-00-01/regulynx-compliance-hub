
import React from 'react';
import { ExtractedData } from './types/documentTypes';

interface ExtractedInformationProps {
  extractedData: ExtractedData;
}

const ExtractedInformation: React.FC<ExtractedInformationProps> = ({ extractedData }) => {
  return (
    <div className="p-4 bg-gray-50 rounded-md">
      <h3 className="text-sm font-medium mb-3">Extracted Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Full Name</p>
          <p className="text-sm font-medium">{extractedData?.name || 'Not available'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Date of Birth</p>
          <p className="text-sm font-medium">{extractedData?.dob || 'Not available'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Document Number</p>
          <p className="text-sm font-medium">{extractedData?.idNumber || 'Not available'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Nationality</p>
          <p className="text-sm font-medium">{extractedData?.nationality || 'Not available'}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Expiry Date</p>
          <p className="text-sm font-medium">{extractedData?.expiryDate || 'Not available'}</p>
        </div>
      </div>
    </div>
  );
};

export default ExtractedInformation;
