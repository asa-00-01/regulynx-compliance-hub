import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import RiskBadge, { getRiskLevelFromScore } from '@/components/common/RiskBadge';

interface PatternDetailsModalProps {
  pattern: any;
  isOpen: boolean;
  onClose: () => void;
}

const PatternDetailsModal: React.FC<PatternDetailsModalProps> = ({
  pattern,
  isOpen,
  onClose
}) => {
  if (!pattern) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Pattern Details</DialogTitle>
          <DialogDescription>
            Detailed information about the detected pattern
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span>Risk Level:</span>
            <RiskBadge riskLevel={getRiskLevelFromScore(pattern.score || 0)} />
          </div>
          
          <div>
            <span>ID:</span>
            <Badge variant="secondary">{pattern.id}</Badge>
          </div>

          <div>
            <span>Name:</span>
            <p>{pattern.name}</p>
          </div>

          <div>
            <span>Description:</span>
            <p>{pattern.description}</p>
          </div>

          <div>
            <span>Category:</span>
            <p>{pattern.category}</p>
          </div>

          <div>
            <span>Score:</span>
            <p>{pattern.score}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PatternDetailsModal;
