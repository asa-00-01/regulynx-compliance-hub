import { Document, DocumentStatus, DocumentType } from '@/types/supabase';
import { mockDocumentsCollection } from '@/mocks/centralizedMockData';

// Generate a random date in the past 30 days
const randomPastDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * 30));
  return date.toISOString();
};

// Generate random document ID
const randomId = () => Math.random().toString(36).substring(2, 15);

// Generate mock document data
export const generateMockDocument = (
  status: DocumentStatus = 'pending',
  type: DocumentType = 'passport'
): Document => {
  const id = randomId();
  const userId = 'mock-user-id';
  const uploadDate = randomPastDate();
  const typeNames = { passport: 'Passport', id: 'ID Card', license: 'Driver\'s License' };
  
  const extractedData: Record<string, any> = {
    name: type === 'passport' ? 'Jane Smith' : 'John Doe',
    idNumber: type === 'passport' ? `P${Math.floor(Math.random() * 10000000)}` : `ID${Math.floor(Math.random() * 10000000)}`,
    dateOfBirth: '1985-06-15',
    expiryDate: '2030-01-01',
    nationality: type === 'passport' ? 'United States' : 'Canada'
  };
  
  if (status === 'rejected') {
    extractedData.rejection_reason = 'Document is expired or information is unclear';
  }
  
  return {
    id,
    user_id: userId,
    file_name: `${typeNames[type]}_${id.substring(0, 5)}.pdf`,
    file_path: `documents/${userId}/${id}.pdf`,
    type,
    upload_date: uploadDate,
    status,
    verified_by: status !== 'pending' ? 'mock-verifier-id' : undefined,
    verification_date: status !== 'pending' ? randomPastDate() : undefined,
    extracted_data: extractedData,
    created_at: uploadDate,
    updated_at: uploadDate
  };
};

// Generate a set of mock documents
export const generateMockDocuments = (count = 5): Document[] => {
  // Return a subset of centralized documents if available
  if (mockDocumentsCollection.length > 0) {
    return mockDocumentsCollection.slice(0, count).map(doc => ({
      id: doc.id,
      user_id: doc.userId,
      file_name: doc.fileName,
      file_path: `documents/${doc.userId}/${doc.id}.pdf`,
      type: doc.type as DocumentType,
      upload_date: doc.uploadDate,
      status: doc.status as DocumentStatus,
      verified_by: doc.verifiedBy,
      verification_date: doc.verificationDate,
      extracted_data: doc.extractedData,
      created_at: doc.uploadDate,
      updated_at: doc.uploadDate
    }));
  }

  // Fallback to generated documents
  const documents: Document[] = [];
  const statuses: DocumentStatus[] = ['pending', 'verified', 'rejected'];
  const types: DocumentType[] = ['passport', 'id', 'license'];
  
  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const type = types[Math.floor(Math.random() * types.length)];
    documents.push(generateMockDocument(status, type));
  }
  
  return documents;
};

// Add mock documents to the existing documents list if it's empty
export const ensureMockDocuments = (documents: Document[]): Document[] => {
  if (documents.length === 0) {
    return mockDocumentsCollection.map(doc => ({
      id: doc.id,
      user_id: doc.userId,
      file_name: doc.fileName,
      file_path: `documents/${doc.userId}/${doc.id}.pdf`,
      type: doc.type as DocumentType,
      upload_date: doc.uploadDate,
      status: doc.status as DocumentStatus,
      verified_by: doc.verifiedBy,
      verification_date: doc.verificationDate,
      extracted_data: doc.extractedData,
      created_at: doc.uploadDate,
      updated_at: doc.uploadDate
    }));
  }
  return documents;
};
