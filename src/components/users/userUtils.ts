
import { UserRole } from '@/types';

export const getRoleBadgeClass = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return 'bg-purple-100 text-purple-800';
    case 'complianceOfficer':
      return 'bg-blue-100 text-blue-800';
    case 'executive':
      return 'bg-green-100 text-green-800';
    case 'support':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatRoleDisplay = (role: UserRole) => {
  return role === 'complianceOfficer' 
    ? 'Compliance Officer' 
    : role.charAt(0).toUpperCase() + role.slice(1);
};
