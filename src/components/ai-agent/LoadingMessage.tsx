
import React from 'react';
import { Bot, Loader2 } from 'lucide-react';

const LoadingMessage = () => {
  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-muted rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground">AI is thinking...</span>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
