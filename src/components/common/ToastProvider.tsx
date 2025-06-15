
import React from 'react';
import { Toaster } from '@/components/ui/sonner';

const ToastProvider: React.FC = () => {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
        },
      }}
    />
  );
};

export default ToastProvider;
