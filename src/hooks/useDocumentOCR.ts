
import { useState } from 'react';
import { createWorker } from 'tesseract.js';

interface OCRResult {
  extractedText: string;
  extractedData: {
    name?: string;
    dob?: string;
    idNumber?: string;
    nationality?: string;
    expiryDate?: string;
  };
}

export function useDocumentOCR() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const processImage = async (file: File): Promise<OCRResult> => {
    setIsProcessing(true);
    setProgress(0);
    setError(null);

    try {
      // Check if file is an image format that Tesseract can handle
      const supportedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
      
      if (!supportedImageTypes.includes(file.type)) {
        console.log('File type not supported for OCR:', file.type);
        // For non-image files (like PDFs), return a basic result without OCR
        setProgress(100);
        return {
          extractedText: '',
          extractedData: {}
        };
      }

      // Convert File to data URL for Tesseract
      const imageData = URL.createObjectURL(file);
      
      setProgress(20);
      
      const worker = await createWorker('eng');
      
      setProgress(40);
      
      const result = await worker.recognize(imageData);
      
      setProgress(90);
      
      // Extract data from OCR result using simple regex patterns
      const extractedText = result.data.text;
      const extractedData = extractDataFromText(extractedText);

      setProgress(100);
      await worker.terminate();
      
      // Cleanup the object URL to avoid memory leaks
      URL.revokeObjectURL(imageData);
      
      return {
        extractedText,
        extractedData,
      };
    } catch (err) {
      console.error('OCR processing error:', err);
      setError(err instanceof Error ? err.message : 'OCR processing failed');
      
      // Even if OCR fails, we can still allow the document upload
      // Return empty result instead of throwing
      return {
        extractedText: '',
        extractedData: {}
      };
    } finally {
      setIsProcessing(false);
    }
  };

  // Basic regex patterns to extract common document fields
  const extractDataFromText = (text: string) => {
    const patterns = {
      name: /(?:name|full name|surname)[\s:]+([A-Za-z\s]+)/i,
      dob: /(?:birth|dob|date of birth)[\s:]+(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
      idNumber: /(?:id number|identification|passport no)[\s:]+([A-Z0-9]{5,12})/i,
      nationality: /(?:nationality|country)[\s:]+([A-Za-z\s]+)/i,
      expiryDate: /(?:expiry|expiration|expires)[\s:]+(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
    };

    const extractedData: Record<string, string | undefined> = {};

    Object.entries(patterns).forEach(([key, pattern]) => {
      const match = text.match(pattern);
      if (match && match[1]) {
        extractedData[key] = match[1].trim();
      }
    });

    return extractedData;
  };

  return { processImage, isProcessing, progress, error };
}

export default useDocumentOCR;
