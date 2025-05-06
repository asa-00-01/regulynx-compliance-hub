
import { useState } from 'react';
import { createWorker } from 'tesseract.js';

interface ExtractedData {
  fullText: string;
  name?: string;
  idNumber?: string;
  dateOfBirth?: string;
  expiryDate?: string;
  nationality?: string;
  rejection_reason?: string;
}

export const useDocumentOCR = () => {
  const [ocrResult, setOcrResult] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);

  const extractName = (text: string): string | undefined => {
    const nameRegex = /Name:\s*([A-Za-z\s]+)/i;
    const match = text.match(nameRegex);
    return match ? match[1].trim() : undefined;
  };

  const extractIDNumber = (text: string): string | undefined => {
    const idRegex = /ID Number:\s*(\w+)/i;
    const match = text.match(idRegex);
    return match ? match[1].trim() : undefined;
  };

  const extractDateOfBirth = (text: string): string | undefined => {
    const dobRegex = /Date of Birth:\s*(\d{2}[./-]\d{2}[./-]\d{4})/i;
    const match = text.match(dobRegex);
    return match ? match[1].trim() : undefined;
  };

  const extractExpiryDate = (text: string): string | undefined => {
    const expiryRegex = /Expiry Date:\s*(\d{2}[./-]\d{2}[./-]\d{4})/i;
    const match = text.match(expiryRegex);
    return match ? match[1].trim() : undefined;
  };

  const extractNationality = (text: string): string | undefined => {
    const nationalityRegex = /Nationality:\s*([A-Za-z\s]+)/i;
    const match = text.match(nationalityRegex);
    return match ? match[1].trim() : undefined;
  };

  const processImage = async (imageFile: File): Promise<ExtractedData> => {
    setLoading(true);
    setProgress(0);
    
    try {
      const worker = await createWorker('eng');
      
      // Set up logger for progress tracking
      worker.setLogger((m) => {
        if (m.status === 'recognizing text' && m.progress !== undefined) {
          setProgress(Math.floor(m.progress * 100));
        }
      });

      const { data } = await worker.recognize(imageFile);
      await worker.terminate();
      
      const fullText = data.text;
      
      // Extract information from the OCR result
      const name = extractName(fullText);
      const idNumber = extractIDNumber(fullText);
      const dateOfBirth = extractDateOfBirth(fullText);
      const expiryDate = extractExpiryDate(fullText);
      const nationality = extractNationality(fullText);
      
      const result = {
        fullText,
        name,
        idNumber,
        dateOfBirth,
        expiryDate,
        nationality,
      };
      
      setOcrResult(result);
      setExtractedData(result);
      setLoading(false);
      setProgress(100);
      
      return result;
    } catch (error) {
      console.error('OCR processing error:', error);
      setLoading(false);
      throw new Error('Failed to process document');
    }
  };

  // Mock process function for testing
  const processDocument = async (file: File, documentType: string): Promise<ExtractedData> => {
    setLoading(true);
    setProgress(0);
    
    // Simulate processing time
    await new Promise(resolve => {
      let currentProgress = 0;
      const interval = setInterval(() => {
        currentProgress += 10;
        setProgress(currentProgress);
        if (currentProgress >= 100) {
          clearInterval(interval);
          resolve(true);
        }
      }, 300);
    });

    // Generate mock data based on document type
    const mockData: ExtractedData = {
      fullText: `This is mock OCR text for a ${documentType} document.`,
      name: documentType === 'passport' ? 'Jane Doe' : 'John Smith',
      idNumber: documentType === 'passport' ? 'P12345678' : 'ID98765432',
      dateOfBirth: '1990-01-01',
      expiryDate: '2030-01-01',
      nationality: documentType === 'passport' ? 'United States' : 'Canada'
    };
    
    setOcrResult(mockData);
    setExtractedData(mockData);
    setLoading(false);
    
    return mockData;
  };

  const isProcessing = loading;
  const ocrProgress = progress;

  return {
    processImage,
    processDocument,
    ocrResult,
    extractedData,
    setExtractedData,
    loading,
    isProcessing,
    progress,
    ocrProgress
  };
};

export default useDocumentOCR;
