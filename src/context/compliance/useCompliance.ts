
import { useContext } from 'react';
import { ComplianceContext } from './ComplianceContext';

export const useCompliance = () => {
  const context = useContext(ComplianceContext);
  if (!context) {
    throw new Error('useCompliance must be used within a ComplianceProvider');
  }
  return context;
};
