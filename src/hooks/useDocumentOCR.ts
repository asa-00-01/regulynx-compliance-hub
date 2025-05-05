
import { useState } from 'react';
import { DocumentType } from '@/types/supabase';
import { createWorker } from 'tesseract.js';

interface ExtractedData {
  name?: string;
  dob?: string;
  idNumber?: string;
  nationality?: string;
  expiryDate?: string;
}

// Mock data for different document types
const mockExtractedData: Record<DocumentType, ExtractedData> = {
  passport: {
    name: "John Smith",
    dob: "1985-05-15",
    idNumber: "P12345678",
    nationality: "United Kingdom",
    expiryDate: "2030-05-14"
  },
  id: {
    name: "Anna Johnson",
    dob: "1992-08-23",
    idNumber: "ID-123-456-789",
    nationality: "Sweden",
    expiryDate: "2028-08-22"
  },
  license: {
    name: "Michael Brown",
    dob: "1990-11-30",
    idNumber: "DL987654321",
    nationality: "Sweden",
    expiryDate: "2026-11-29"
  }
};

export function useDocumentOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const processDocument = async (file: File, documentType: DocumentType, useMock = true) => {
    setIsProcessing(true);
    setOcrProgress(0);
    setOcrError(null);
    
    try {
      // For demo purposes, we'll use mock data if requested
      if (useMock) {
        // Simulate processing time
        await new Promise((resolve) => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += 10;
            setOcrProgress(progress);
            if (progress >= 100) {
              clearInterval(interval);
              resolve(null);
            }
          }, 300);
        });
        
        // Return mock data for the selected document type
        setExtractedData(mockExtractedData[documentType]);
        setIsProcessing(false);
        return mockExtractedData[documentType];
      }
      
      // Real OCR processing with Tesseract.js
      const worker = await createWorker('eng');
      
      worker.setProgressHandler((progress) => {
        setOcrProgress(Math.round(progress.progress * 100));
      });
      
      const result = await worker.recognize(file);
      await worker.terminate();
      
      // Here we would normally parse the OCR text result
      // This is a simplified extraction that would need to be improved
      // for production use with proper text parsing logic
      const text = result.data.text;
      
      // Very basic extraction logic (would need improvement)
      const extractedData: ExtractedData = {
        name: extractName(text, documentType),
        dob: extractDOB(text),
        idNumber: extractIDNumber(text, documentType),
        nationality: extractNationality(text),
        expiryDate: extractExpiryDate(text)
      };
      
      setExtractedData(extractedData);
      setIsProcessing(false);
      return extractedData;
      
    } catch (error) {
      console.error("OCR processing error:", error);
      setOcrError(error instanceof Error ? error.message : "Unknown OCR processing error");
      setIsProcessing(false);
      return null;
    }
  };
  
  // These would be improved with real pattern matching in a production system
  const extractName = (text: string, docType: DocumentType) => {
    // This is a stub - real implementation would use regex patterns
    // specific to document formats
    return mockExtractedData[docType].name;
  };
  
  const extractDOB = (text: string) => {
    // Look for date patterns
    const datePattern = /\d{2}([\/\.\-])\d{2}\1\d{4}/;
    const match = text.match(datePattern);
    return match ? match[0] : undefined;
  };
  
  const extractIDNumber = (text: string, docType: DocumentType) => {
    // This would use specific patterns based on document type
    return mockExtractedData[docType].idNumber;
  };
  
  const extractNationality = (text: string) => {
    // Look for common nationality keywords
    const countries = ["Sweden", "Finland", "Norway", "Denmark", "United Kingdom"];
    for (const country of countries) {
      if (text.includes(country)) {
        return country;
      }
    }
    return undefined;
  };
  
  const extractExpiryDate = (text: string) => {
    // Similar to DOB but looking for expiry context
    return mockExtractedData.passport.expiryDate;
  };

  return {
    processDocument,
    isProcessing,
    ocrProgress,
    extractedData,
    ocrError,
    setExtractedData
  };
}
