
import React from 'react';
import { useTranslation } from 'react-i18next';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Wifi, Database, HelpCircle } from 'lucide-react';
import { TooltipHelp } from '@/components/ui/tooltip-custom';

const ChatHeader = () => {
  const { t } = useTranslation();

  return (
    <CardHeader className="border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <CardTitle className="text-lg flex items-center gap-2">
            {t('aiAgent.title')}
            <TooltipHelp content="Your AI compliance assistant is connected to the company's knowledge base and can help with AML monitoring, risk assessment, case management, and regulatory guidance.">
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipHelp>
          </CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Database className="h-3 w-3" />
            <span>{t('aiAgent.connected')}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TooltipHelp content="AI assistant is online and ready to help with your compliance questions">
            <Badge variant="outline" className="flex items-center gap-1">
              <Wifi className="h-3 w-3 text-green-500" />
              {t('aiAgent.online')}
            </Badge>
          </TooltipHelp>
        </div>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
