
import { Document } from '@/types/supabase';

const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const generateMockDocument = (userId: string): Document => {
  const documentTypes: Document['type'][] = ['passport', 'id', 'license'];
  const statuses: Document['status'][] = ['pending', 'verified', 'rejected'];
  
  const type = documentTypes[Math.floor(Math.random() * documentTypes.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  const uploadDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString();
  
  return {
    id: generateUUID(),
    user_id: userId,
    type,
    file_name: `${type}_document_${Date.now()}.pdf`,
    file_path: `documents/${userId}/${type}_document_${Date.now()}.pdf`,
    upload_date: uploadDate,
    status,
    verified_by: status === 'verified' ? generateUUID() : null,
    verification_date: status === 'verified' ? new Date().toISOString() : null,
    extracted_data: {
      name: 'Mock Name',
      dob: '1990-01-01',
      idNumber: 'MOCK123456',
    },
    created_at: uploadDate,
    updated_at: uploadDate
  };
};

export const generateMockDocuments = (userIds: string[], count: number = 10): Document[] => {
  return Array.from({ length: count }, () => {
    const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
    return generateMockDocument(randomUserId);
  });
};
