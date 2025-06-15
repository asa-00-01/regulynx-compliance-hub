
import React from 'react';
import { DollarSign, User, Activity, Shield } from 'lucide-react';

export const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'transaction':
      return <DollarSign className="h-4 w-4" />;
    case 'kyc':
      return <User className="h-4 w-4" />;
    case 'behavioral':
      return <Activity className="h-4 w-4" />;
    default:
      return <Shield className="h-4 w-4" />;
  }
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case 'transaction':
      return 'bg-blue-100 text-blue-800';
    case 'kyc':
      return 'bg-purple-100 text-purple-800';
    case 'behavioral':
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};
