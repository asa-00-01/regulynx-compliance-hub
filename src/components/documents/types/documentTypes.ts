
import { Document as SupabaseDocument } from '@/types/supabase';

// Define a type for the extracted data to ensure type safety
export interface ExtractedData {
  name?: string;
  dob?: string;
  idNumber?: string;
  nationality?: string;
  expiryDate?: string;
  rejection_reason?: string;
}

export interface DocumentVerificationViewProps {
  document: SupabaseDocument;
  onVerificationComplete: () => void;
}
