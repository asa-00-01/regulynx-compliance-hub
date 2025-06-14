
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot } from 'lucide-react';

const ChatHeader = () => {
  return (
    <CardHeader className="border-b">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div>
          <CardTitle className="text-lg">AI Compliance Assistant</CardTitle>
          <p className="text-sm text-muted-foreground">Connected to company RAG system</p>
        </div>
        <Badge variant="outline" className="ml-auto">Online</Badge>
      </div>
    </CardHeader>
  );
};

export default ChatHeader;
