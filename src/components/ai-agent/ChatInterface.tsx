
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import ChatHeader from './ChatHeader';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import LoadingMessage from './LoadingMessage';

interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  tools?: string[];
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI compliance assistant. I can help you with AML monitoring, risk assessment, case management, and regulatory guidance. How can I assist you today?",
      role: 'assistant',
      timestamp: new Date(),
      tools: ['RAG System', 'Compliance Database']
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: generateAIResponse(inputValue),
        role: 'assistant',
        timestamp: new Date(),
        tools: getRandomTools()
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const generateAIResponse = (input: string): string => {
    const responses = [
      "Based on our compliance database, I can provide guidance on that topic. Let me analyze the current regulatory requirements...",
      "I've searched through our AML monitoring system and found relevant patterns. Here's what I can tell you...",
      "Using our risk assessment tools, I can help evaluate this scenario. The key factors to consider are...",
      "I've consulted our regulatory knowledge base and case history. Here's my analysis...",
      "Drawing from our compliance framework and recent updates, I recommend the following approach..."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const getRandomTools = (): string[] => {
    const tools = ['RAG System', 'Compliance Database', 'Risk Engine', 'Regulatory Updates', 'Case Management'];
    const count = Math.floor(Math.random() * 3) + 1;
    return tools.slice(0, count);
  };

  return (
    <Card className="h-[600px] flex flex-col">
      <ChatHeader />

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
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
        />
      </CardContent>
    </Card>
  );
};

export default ChatInterface;
