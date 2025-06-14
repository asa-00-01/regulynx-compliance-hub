
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  tools?: string[];
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <div
      className={cn(
        "flex gap-3",
        message.role === 'user' ? 'justify-end' : 'justify-start'
      )}
    >
      {message.role === 'assistant' && (
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[80%] space-y-2",
        message.role === 'user' ? 'items-end' : 'items-start'
      )}>
        <div className={cn(
          "rounded-lg px-4 py-2",
          message.role === 'user' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-muted'
        )}>
          <p className="text-sm">{message.content}</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(message.timestamp)}</span>
          {message.tools && message.tools.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-1">
                {message.tools.map((tool, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {message.role === 'user' && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4" />
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
