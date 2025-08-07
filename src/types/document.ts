
export interface Document {
  id: string;
  userId: string;
  type: 'passport' | 'id' | 'license';
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'verified' | 'rejected' | 'information_requested';
  verifiedBy?: string;
  verificationDate?: string;
  extractedData?: {
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
