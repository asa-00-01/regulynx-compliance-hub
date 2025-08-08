
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
 * Maps database statuses to form-compatible statuses
 */
export const transformSARToFormData = (sar: SAR): Partial<SARFormData> => {
  return {
    userId: sar.userId,
    userName: sar.userName,
    dateOfActivity: sar.dateOfActivity,
    summary: sar.summary,
    transactions: sar.transactions,
    notes: sar.notes,
    // Map database statuses to form-compatible statuses
    status: (sar.status === 'filed' || sar.status === 'rejected') ? 'submitted' : sar.status as 'draft' | 'submitted'
  };
};
