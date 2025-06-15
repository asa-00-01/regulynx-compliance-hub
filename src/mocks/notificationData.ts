
import { Notification } from '@/types/notification';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Case Assigned',
    description: 'Case #CASE-00123 has been assigned to you.',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    type: 'case',
  },
  {
    id: '2',
    title: 'High-Risk Transaction',
    description: 'A transaction of $15,000 has been flagged as high-risk.',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    type: 'alert',
  },
  {
    id: '3',
    title: 'System Update',
    description: 'The system will be down for maintenance tonight at 2 AM.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    type: 'system',
  },
  {
    id: '4',
    title: 'Document Verified',
    description: 'Passport for user John Doe has been successfully verified.',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    read: true,
    type: 'case',
  },
];
