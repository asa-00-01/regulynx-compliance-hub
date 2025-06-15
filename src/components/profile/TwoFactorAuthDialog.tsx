
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface TwoFactorAuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  qrCodeUrl: string;
  factorId: string;
  verify: (factorId: string, code: string) => Promise<boolean>;
}

const TwoFactorAuthDialog: React.FC<TwoFactorAuthDialogProps> = ({ isOpen, onClose, qrCodeUrl, factorId, verify }) => {
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleVerify = async () => {
    setIsVerifying(true);
    const success = await verify(factorId, code);
    if (success) {
      toast.success('Two-factor authentication enabled successfully!');
      onClose();
    } else {
      toast.error('Verification failed. Please check the code and try again.');
    }
    setIsVerifying(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enable Two-Factor Authentication</DialogTitle>
          <DialogDescription>
            Scan the QR code with your authenticator app and enter the code to verify.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center gap-4 py-4">
          <img src={qrCodeUrl} alt="2FA QR Code" className="p-2 border rounded-md bg-white" />
          <div className="w-full">
            <Label htmlFor="verification-code">Verification Code</Label>
            <Input
              id="verification-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleVerify} disabled={isVerifying || code.length < 6}>
            {isVerifying ? 'Verifying...' : 'Verify & Enable'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TwoFactorAuthDialog;
