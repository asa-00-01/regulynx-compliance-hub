
export interface Notification {
  id: string;
  title: string;
  description: string;
  createdAt: string; // ISO string
  read: boolean;
  type: 'alert' | 'case' | 'system';
  data?: {
    caseId?: string;
    transactionId?: string;
  };
}
