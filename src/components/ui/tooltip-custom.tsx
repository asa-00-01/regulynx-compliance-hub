
import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface TooltipHelpProps {
  content: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export const TooltipHelp = ({ content, children, className }: TooltipHelpProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center cursor-help">
            {children}
            <HelpCircle className={`h-4 w-4 ml-1 text-muted-foreground ${className}`} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{content}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
