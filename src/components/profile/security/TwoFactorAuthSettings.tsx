
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Factor } from '@supabase/supabase-js';
import TwoFactorAuthDialog from '../TwoFactorAuthDialog';

const TwoFactorAuthSettings = () => {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [factors, setFactors] = useState<Factor[]>([]);
  const [twoFactorEnrollData, setTwoFactorEnrollData] = useState<{ qrCodeUrl: string, factorId: string } | null>(null);

  useEffect(() => {
    const check2FA = async () => {
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) {
        toast.error('Could not fetch MFA status.');
        return;
      }
      setFactors(data.totp);
      setTwoFactorEnabled(data.totp.length > 0 && data.totp.some(f => f.status === 'verified'));
    };
    check2FA();
  }, []);

  const handleTwoFactorToggle = async () => {
    if (twoFactorEnabled) {
      // Disable 2FA
      const totpFactor = factors.find(f => f.status === 'verified');
      if (totpFactor) {
        const { error } = await supabase.auth.mfa.unenroll({ factorId: totpFactor.id });
        if (error) {
          toast.error(`Failed to disable 2FA: ${error.message}`);
        } else {
          toast.success('Two-factor authentication disabled');
          setTwoFactorEnabled(false);
          setFactors([]);
        }
      }
    } else {
      // Enable 2FA
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' });
      if (error) {
        toast.error(`Failed to start 2FA setup: ${error.message}`);
        return;
      }
      if(data) {
        setTwoFactorEnrollData({ qrCodeUrl: data.totp.qr_code, factorId: data.id });
      }
    }
  };

  const verifyTwoFactor = async (factorId: string, code: string): Promise<boolean> => {
    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      toast.error(`2FA challenge failed: ${challengeError.message}`);
      return false;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge!.id, code });
    if (verifyError) {
      toast.error(`2FA verification failed: ${verifyError.message}`);
      return false;
    }
    
    // refetch factors to update status
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) {
      toast.error('Could not fetch MFA status.');
    } else {
      setFactors(data.totp);
      setTwoFactorEnabled(data.totp.length > 0 && data.totp.some(f => f.status === 'verified'));
    }
    return true;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Two-Factor Authentication</CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Two-factor authentication</p>
              <p className="text-sm text-muted-foreground">
                {twoFactorEnabled 
                  ? 'Your account is protected with two-factor authentication' 
                  : 'Protect your account with two-factor authentication'}
              </p>
            </div>
            <Switch 
              checked={twoFactorEnabled} 
              onCheckedChange={handleTwoFactorToggle}
            />
          </div>
        </CardContent>
      </Card>
      
      {twoFactorEnrollData && (
        <TwoFactorAuthDialog 
          isOpen={!!twoFactorEnrollData}
          onClose={() => setTwoFactorEnrollData(null)}
          qrCodeUrl={twoFactorEnrollData.qrCodeUrl}
          factorId={twoFactorEnrollData.factorId}
          verify={verifyTwoFactor}
        />
      )}
    </>
  );
};

export default TwoFactorAuthSettings;
