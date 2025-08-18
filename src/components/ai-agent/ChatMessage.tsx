
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Bot, User, Info, Database } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIMessage } from '@/services/ai/aiAgentService';

interface ChatMessageProps {
  message: AIMessage;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatConfidence = (confidence?: number) => {
    if (!confidence) return null;
    const percentage = Math.round(confidence * 100);
    const color = confidence >= 0.8 ? 'text-green-600' : confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600';
    return (
      <span className={cn('text-xs', color)}>
        {percentage}% confidence
      </span>
    );
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
          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{formatTime(message.timestamp)}</span>
          
          {/* Confidence indicator for AI responses */}
          {message.role === 'assistant' && message.metadata?.confidence && (
            <>
              <span>•</span>
              {formatConfidence(message.metadata.confidence)}
            </>
          )}
          
          {/* Tools used */}
          {message.tools && message.tools.length > 0 && (
            <>
              <span>•</span>
              <div className="flex gap-1">
                {message.tools.slice(0, 3).map((tool, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tool}
                  </Badge>
                ))}
                {message.tools.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{message.tools.length - 3}
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        {/* Sources for AI responses */}
        {message.role === 'assistant' && message.metadata?.sources && message.metadata.sources.length > 0 && (
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <Database className="w-3 h-3 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <span className="font-medium">Sources:</span>
              <div className="flex flex-wrap gap-1">
                {message.metadata.sources.map((source, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {source}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Processing time for AI responses */}
        {message.role === 'assistant' && message.metadata?.processingTime && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="w-3 h-3" />
            <span>Processed in {message.metadata.processingTime}ms</span>
          </div>
        )}
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
