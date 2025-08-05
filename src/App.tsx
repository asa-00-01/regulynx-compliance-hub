
import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTranslation } from 'react-i18next';
import './i18n/config';
import './App.css';
import AppRoutes from '@/components/app/AppRoutes';
import AppInitializer from '@/components/app/AppInitializer';
import LoadingScreen from '@/components/app/LoadingScreen';

function App() {
  const { authLoaded, loading } = useAuth();
  const { t } = useTranslation();

  console.log('App render - authLoaded:', authLoaded, 'loading:', loading);

  if (!authLoaded || loading) {
    return <LoadingScreen text={t('common.loading')} />;
  }

  return (
    <>
      <AppInitializer />
      <AppRoutes />
    </>
  );
}

export default App;
