
import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Bot, Database } from 'lucide-react';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingMessage from './LoadingMessage';
import { useAIAgent } from '@/hooks/useAIAgent';
import { config } from '@/config/environment';

const ChatInterface = () => {
  const { t } = useTranslation();
  const {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    isMockMode,
    lastResponse,
    availableTools
  } = useAIAgent();
  
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <ChatHeader />

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Mode indicator */}
        <div className="px-4 py-2 border-b bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4" />
              <span className="text-sm font-medium">AI Compliance Assistant</span>
              <Badge variant={isMockMode ? "secondary" : "default"} className="text-xs">
                {isMockMode ? (
                  <>
                    <Database className="h-3 w-3 mr-1" />
                    Mock Mode
                  </>
                ) : (
                  <>
                    <Bot className="h-3 w-3 mr-1" />
                    Live Mode
                  </>
                )}
              </Badge>
            </div>
            
            {messages.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearConversation}
                className="h-8 px-2 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Clear conversation</span>
              </Button>
            )}
          </div>
          
          {/* Available tools indicator */}
          {availableTools.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted-foreground mb-1">
                Available Tools: {availableTools.length}
              </div>
              <div className="flex flex-wrap gap-1">
                {availableTools.slice(0, 5).map((tool, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {tool}
                  </Badge>
                ))}
                {availableTools.length > 5 && (
                  <Badge variant="outline" className="text-xs">
                    +{availableTools.length - 5} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Welcome to AI Compliance Assistant</h3>
                <p className="text-sm max-w-md mx-auto">
                  I can help you with AML compliance, KYC procedures, risk assessment, 
                  regulatory updates, and case management. Ask me anything!
                </p>
                {isMockMode && (
                  <div className="mt-4 p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Mock Mode Active:</strong> Try asking about "AML compliance", 
                      "KYC procedures", or "transaction monitoring" to see different responses.
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage key={message.id} message={message} />
            ))}
            
            {isLoading && <LoadingMessage />}
            
            {/* Invisible div to scroll to */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <ChatInput
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          placeholder={
            isMockMode 
              ? "Ask about AML, KYC, or compliance (Mock Mode)" 
              : "Ask me about compliance, regulations, or procedures..."
          }
        />
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
