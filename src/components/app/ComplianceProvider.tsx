
import React from 'react';
import { ComplianceProvider as Provider } from '@/context/compliance/ComplianceProvider';

interface ComplianceProviderProps {
  children: React.ReactNode;
}

const ComplianceProvider: React.FC<ComplianceProviderProps> = ({ children }) => {
  return <Provider>{children}</Provider>;
};

export default ComplianceProvider;
