
import { SAR } from '@/types/sar';

export interface SARFormData {
  userId: string;
  userName: string;
  dateOfActivity: string;
  summary: string;
  transactions: string[];
  notes?: string[];
  status: 'draft' | 'submitted';
}

/**
 * Transforms a SAR object to SARFormData format for editing
 * Maps 'reviewed' status to 'submitted' since reviewed SARs cannot be edited as drafts
 */
export const transformSARToFormData = (sar: SAR): Partial<SARFormData> => {
  return {
    userId: sar.userId,
    userName: sar.userName,
    dateOfActivity: sar.dateOfActivity,
    summary: sar.summary,
    transactions: sar.transactions,
    notes: sar.notes,
    // Map 'reviewed' status to 'submitted' for form compatibility
    status: sar.status === 'reviewed' ? 'submitted' : sar.status as 'draft' | 'submitted'
  };
};
