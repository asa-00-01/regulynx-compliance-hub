
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

const ChatHeader = () => {
  const { t } = useTranslation();

  return (
    <CardHeader className="border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">{t('aiAgent.title')}</CardTitle>
          <p className="text-sm text-muted-foreground">{t('aiAgent.connected')}</p>
        </div>
        <Badge variant="outline" className="ml-auto">{t('aiAgent.online')}</Badge>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
