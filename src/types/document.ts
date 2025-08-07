
export interface Document {
  id: string;
  user_id: string;  // Changed from userId to user_id to match Supabase schema
  type: 'passport' | 'id' | 'license';
  file_name: string;  // Changed from fileName to file_name
  upload_date: string;  // Changed from uploadDate to upload_date
  status: 'pending' | 'verified' | 'rejected' | 'information_requested';
  verified_by?: string;  // Changed from verifiedBy to verified_by
  verification_date?: string;  // Changed from verificationDate to verification_date
  extracted_data?: {  // Changed from extractedData to extracted_data
    name?: string;
    dob?: string;
    idNumber?: string;
    nationality?: string;
    expiryDate?: string;
    issueDate?: string;
    address?: string;
    sourceType?: string;
    amount?: string;
    verificationRequired?: string;
    accountHolder?: string;
    averageBalance?: string;
    transactionHistory?: string;
  };
}
