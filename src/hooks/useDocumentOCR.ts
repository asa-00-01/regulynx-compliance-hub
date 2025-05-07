import { useState } from 'react';
import { createWorker } from 'tesseract.js';

type ExtractedData = {
  name?: string;
  idNumber?: string;
  nationality?: string;
  expiryDate?: string;
  dateOfBirth?: string;
};

export default function useDocumentOCR() {
  const [progress, setProgress] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (imageFile: File): Promise<ExtractedData | null> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);
    setExtractedData(null);

    try {
      const worker = await createWorker('eng');
      
      // Configure progress tracking using the proper method
      worker.progress((p) => {
        setProgress(Math.floor(p.progress * 100));
      });

      const { data: { text } } = await worker.recognize(imageFile);
      await worker.terminate();

      // Extract data patterns from text
      const extractedData = extractInformation(text);
      
      setExtractedData(extractedData);
      setIsProcessing(false);
      return extractedData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during OCR processing';
      setError(errorMessage);
      setIsProcessing(false);
      return null;
    }
  };

  // Simple pattern matching for document information
  const extractInformation = (text: string): ExtractedData => {
    const data: ExtractedData = {};
    
    // Extract name (look for patterns like "Name:" or "Full Name:")
    const nameMatch = text.match(/(?:Name|Full Name|Surname and given names)[\s:]+([\w\s]+)/i);
    if (nameMatch && nameMatch[1]) {
      data.name = nameMatch[1].trim();
    }
    
    // Extract ID number (look for patterns like "No:", "ID:", "Document No:")
    const idMatch = text.match(/(?:No|ID|Document No|Passport No)[\s.:]+([A-Z0-9]+)/i);
    if (idMatch && idMatch[1]) {
      data.idNumber = idMatch[1].trim();
    }
    
    // Extract nationality
    const nationalityMatch = text.match(/(?:Nationality|Country)[\s:]+([\w\s]+)/i);
    if (nationalityMatch && nationalityMatch[1]) {
      data.nationality = nationalityMatch[1].trim();
    }
    
    // Extract expiry date
    const expiryMatch = text.match(/(?:Date of expiry|Expiry Date|Valid Until)[\s:]+([\d\s./-]+)/i);
    if (expiryMatch && expiryMatch[1]) {
      data.expiryDate = expiryMatch[1].trim();
    }
    
    // Extract date of birth
    const dobMatch = text.match(/(?:Date of birth|Birth Date|Born)[\s:]+([\d\s./-]+)/i);
    if (dobMatch && dobMatch[1]) {
      data.dateOfBirth = dobMatch[1].trim();
    }
    
    return data;
  };

  return {
    processImage,
    progress,
    isProcessing,
    extractedData,
    error
  };
}
