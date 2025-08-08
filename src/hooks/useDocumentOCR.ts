
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
    issueDate?: string;
    address?: string;
    documentType?: string;
    issuingAuthority?: string;
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
      
      // Extract data from OCR result using enhanced regex patterns
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

  // Enhanced regex patterns to extract common document fields
  const extractDataFromText = (text: string) => {
    console.log('Extracting data from OCR text:', text);
    
    // Clean the text for better matching
    const cleanText = text.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    
    const patterns = {
      // Name patterns - more comprehensive
      name: [
        /(?:name|full name|surname|given name|first name|last name)[\s:]*([A-Za-z\s]{2,50})/i,
        /^([A-Z][a-z]+ [A-Z][a-z]+)/m, // Basic First Last pattern
        /(?:mr|ms|mrs|dr)\.?\s+([A-Za-z\s]{2,40})/i
      ],
      
      // Date of birth patterns
      dob: [
        /(?:birth|dob|date of birth|born)[\s:]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
        /(?:birth|dob|date of birth|born)[\s:]*(\d{1,2}\s+\w+\s+\d{2,4})/i,
        /(?:birth|dob|date of birth|born)[\s:]*(\d{2,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2})/i
      ],
      
      // ID/Document number patterns
      idNumber: [
        /(?:id number|identification|passport no|document no|number)[\s:]*([A-Z0-9]{5,15})/i,
        /(?:passport|id)[\s:]*([A-Z0-9]{6,12})/i,
        /^([A-Z]{1,3}\d{6,10})$/m // Pattern like AB1234567
      ],
      
      // Nationality patterns
      nationality: [
        /(?:nationality|citizen|country)[\s:]*([A-Za-z\s]{3,30})/i,
        /(?:national of|citizen of)[\s:]*([A-Za-z\s]{3,30})/i
      ],
      
      // Expiry date patterns
      expiryDate: [
        /(?:expiry|expiration|expires|valid until)[\s:]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
        /(?:expiry|expiration|expires|valid until)[\s:]*(\d{1,2}\s+\w+\s+\d{2,4})/i,
        /(?:expiry|expiration|expires|valid until)[\s:]*(\d{2,4}[\/\.\-]\d{1,2}[\/\.\-]\d{1,2})/i
      ],
      
      // Issue date patterns
      issueDate: [
        /(?:issue|issued|date of issue)[\s:]*(\d{1,2}[\/\.\-]\d{1,2}[\/\.\-]\d{2,4})/i,
        /(?:issue|issued|date of issue)[\s:]*(\d{1,2}\s+\w+\s+\d{2,4})/i
      ],
      
      // Address patterns
      address: [
        /(?:address|residence|domicile)[\s:]*([A-Za-z0-9\s,\.\-]{10,100})/i,
        /(\d+\s+[A-Za-z\s]+(?:street|st|avenue|ave|road|rd|lane|ln|drive|dr|way)[A-Za-z0-9\s,]*)/i
      ],
      
      // Document type
      documentType: [
        /^(passport|identity card|driver license|driving licence)/i,
        /(passport|identity card|id card|driver license|driving licence)/i
      ],
      
      // Issuing authority
      issuingAuthority: [
        /(?:issued by|issuing authority|authority)[\s:]*([A-Za-z\s]{5,50})/i,
        /(?:government of|ministry of|department of)[\s:]*([A-Za-z\s]{5,50})/i
      ]
    };

    const extractedData: Record<string, string | undefined> = {};

    Object.entries(patterns).forEach(([key, patternArray]) => {
      for (const pattern of patternArray) {
        const match = cleanText.match(pattern);
        if (match && match[1] && match[1].trim().length > 1) {
          // Clean and format the extracted value
          let value = match[1].trim();
          
          // Special formatting for specific fields
          if (key === 'name') {
            value = value.replace(/[^A-Za-z\s]/g, '').replace(/\s+/g, ' ').trim();
            // Ensure it looks like a proper name (at least 2 characters)
            if (value.length < 2 || !/[A-Za-z]/.test(value)) continue;
          }
          
          if (key === 'nationality') {
            value = value.replace(/[^A-Za-z\s]/g, '').trim();
            if (value.length < 3) continue;
          }
          
          if (key === 'idNumber') {
            value = value.replace(/\s/g, '').toUpperCase();
            if (value.length < 5) continue;
          }
          
          extractedData[key] = value;
          break; // Use the first match found
        }
      }
    });

    console.log('Extracted data:', extractedData);
    return extractedData;
  };

  return { processImage, isProcessing, progress, error };
}

export default useDocumentOCR;
