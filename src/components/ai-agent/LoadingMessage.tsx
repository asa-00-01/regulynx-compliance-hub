
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Bot, Loader2 } from 'lucide-react';

const LoadingMessage = () => {
  const { t } = useTranslation();

  const thinkingMessages = [
    'Analyzing your request...',
    'Searching compliance knowledge base...',
    'Reviewing regulatory guidelines...',
    'Preparing detailed response...'
  ];

  const [currentMessage, setCurrentMessage] = React.useState(0);

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % thinkingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex gap-3 justify-start">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      <div className="bg-muted rounded-lg px-4 py-2">
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm text-muted-foreground animate-pulse">
            {thinkingMessages[currentMessage]}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LoadingMessage;
