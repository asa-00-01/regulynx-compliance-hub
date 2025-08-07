
import { User } from '@/types';
import { createStandardUser } from '@/types/userHelpers';

export const mockUsers: User[] = [
  createStandardUser({
    id: '1',
    email: 'compliance@regulynx.com',
    role: 'complianceOfficer',
    name: 'Alex Nordström',
    avatarUrl: 'https://i.pravatar.cc/150?img=1',
    riskScore: 25,
    status: 'active',
  }),
  createStandardUser({
    id: '2',
    email: 'admin@regulynx.com',
    role: 'admin',
    name: 'Johan Berg',
    avatarUrl: 'https://i.pravatar.cc/150?img=2',
    riskScore: 15,
    status: 'active',
  }),
  createStandardUser({
    id: '3',
    email: 'executive@regulynx.com',
    role: 'executive',
    name: 'Lena Wikström',
    avatarUrl: 'https://i.pravatar.cc/150?img=3',
    riskScore: 20,
    status: 'active',
  }),
  createStandardUser({
    id: '4',
    email: 'support@regulynx.com',
    role: 'support',
    name: 'Astrid Lindqvist',
    avatarUrl: 'https://i.pravatar.cc/150?img=4',
    riskScore: 30,
    status: 'active',
  }),
  createStandardUser({
    id: '5',
    email: 'compliance2@regulynx.com',
    role: 'complianceOfficer',
    name: 'Erik Karlsson',
    riskScore: 22,
    status: 'pending',
  }),
  createStandardUser({
    id: '6',
    email: 'support2@regulynx.com',
    role: 'support',
    name: 'Maria Andersson',
    riskScore: 35,
    status: 'active',
  }),
];
