
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatInterface from '@/components/ai-agent/ChatInterface';

const AIAgent = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AI Agent</h1>
            <p className="text-muted-foreground">
              Chat with our AI assistant for compliance insights and support
            </p>
          </div>
        </div>
        
        <ChatInterface />
      </div>
    </DashboardLayout>
  );
};

export default AIAgent;
