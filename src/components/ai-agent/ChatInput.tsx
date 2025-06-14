
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface ChatInputProps {
  inputValue: string;
  setInputValue: (value: string) => void;
  onSendMessage: () => void;
  isLoading: boolean;
}

const ChatInput = ({ inputValue, setInputValue, onSendMessage, isLoading }: ChatInputProps) => {
  const { t } = useTranslation();

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={t('aiAgent.placeholder')}
          className="flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={onSendMessage}
          disabled={!inputValue.trim() || isLoading}
          size="icon"
          title={t('aiAgent.sendButton')}
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        {t('aiAgent.keyboardHint')}
      </p>
    </div>
  );
};

export default ChatInput;
