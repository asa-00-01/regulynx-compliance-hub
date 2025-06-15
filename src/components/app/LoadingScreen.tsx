
import React from 'react';
import { useTranslation } from 'react-i18next';

interface LoadingScreenProps {
  text?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ text }) => {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="animate-pulse text-lg">{text || t('common.loading')}</div>
    </div>
  );
};

export default LoadingScreen;
