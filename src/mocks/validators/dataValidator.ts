
import { Document } from '@/types/supabase';
import { UnifiedUserData } from '@/context/compliance/types';

export const validateDocumentData = (documents: Document[]): boolean => {
  if (!Array.isArray(documents)) {
    console.error('Documents data is not an array');
    return false;
  }

  const requiredFields = ['id', 'user_id', 'file_name', 'type', 'status'];
  
  for (const doc of documents) {
    for (const field of requiredFields) {
      if (!(field in doc)) {
        console.error(`Document missing required field: ${field}`, doc);
        return false;
      }
    }
    
    // Validate document type
    if (!['passport', 'id', 'license'].includes(doc.type)) {
      console.error(`Invalid document type: ${doc.type}`, doc);
      return false;
    }
    
    // Validate status
    if (!['pending', 'verified', 'rejected', 'information_requested'].includes(doc.status)) {
      console.error(`Invalid document status: ${doc.status}`, doc);
      return false;
    }
    
    // Validate user_id format (should be UUID-like)
    if (typeof doc.user_id !== 'string' || doc.user_id.length === 0) {
      console.error(`Invalid user_id format: ${doc.user_id}`, doc);
      return false;
    }
  }
  
  console.log(`✓ Validated ${documents.length} documents`);
  return true;
};

export const validateUserData = (users: UnifiedUserData[]): boolean => {
  if (!Array.isArray(users)) {
    console.error('Users data is not an array');
    return false;
  }

  const requiredFields = ['id', 'fullName', 'email', 'kycStatus'];
  
  for (const user of users) {
    for (const field of requiredFields) {
      if (!(field in user)) {
        console.error(`User missing required field: ${field}`, user);
        return false;
      }
    }
    
    // Validate KYC status
    if (!['verified', 'pending', 'rejected', 'information_requested'].includes(user.kycStatus)) {
      console.error(`Invalid KYC status: ${user.kycStatus}`, user);
      return false;
    }
    
    // Validate documents array
    if (user.documents && !validateDocumentData(user.documents)) {
      return false;
    }
  }
  
  console.log(`✓ Validated ${users.length} users`);
  return true;
};

export const validateMockData = (data: { users: UnifiedUserData[], documents: Document[] }) => {
  console.log('Validating mock data structure...');
  
  const userValidation = validateUserData(data.users);
  const documentValidation = validateDocumentData(data.documents);
  
  if (userValidation && documentValidation) {
    console.log('✓ All mock data validation passed');
    return true;
  } else {
    console.error('✗ Mock data validation failed');
    return false;
  }
};
