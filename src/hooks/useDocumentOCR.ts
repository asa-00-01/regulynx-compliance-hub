import { useState } from 'react';
import { createWorker } from 'tesseract.js';

interface ExtractedData {
  fullText: string;
  name?: string;
  idNumber?: string;
  dateOfBirth?: string;
  expiryDate?: string;
}

export const useDocumentOCR = () => {
  const [ocrResult, setOcrResult] = useState<ExtractedData | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

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

  const processImage = async (imageFile: File): Promise<ExtractedData> => {
    setLoading(true);
    setProgress(0);
    
    try {
      const worker = await createWorker('eng');
      
      // Set up logger for progress tracking
      worker.logger = (m) => {
        if (m.status === 'recognizing text' && m.progress !== undefined) {
          setProgress(Math.floor(m.progress * 100));
        }
      };

      const { data } = await worker.recognize(imageFile);
      await worker.terminate();
      
      const fullText = data.text;
      
      // Extract information from the OCR result
      const name = extractName(fullText);
      const idNumber = extractIDNumber(fullText);
      const dateOfBirth = extractDateOfBirth(fullText);
      const expiryDate = extractExpiryDate(fullText);
      
      const extractedData = {
        fullText,
        name,
        idNumber,
        dateOfBirth,
        expiryDate,
      };
      
      setOcrResult(extractedData);
      setLoading(false);
      setProgress(100);
      
      return extractedData;
    } catch (error) {
      console.error('OCR processing error:', error);
      setLoading(false);
      throw new Error('Failed to process document');
    }
  };

  return {
    processImage,
    ocrResult,
    loading,
    progress,
  };
};

export default useDocumentOCR;
