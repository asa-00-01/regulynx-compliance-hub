
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Factor } from '@supabase/supabase-js';
import TwoFactorAuthDialog from './TwoFactorAuthDialog';

const UserSecuritySettings = () => {
  const [passwordData, setPasswordData] = useState({ newPassword: '', confirmPassword: '' });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password: passwordData.newPassword });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully');
      setPasswordData({ newPassword: '', confirmPassword: '' });
    }
    setIsSubmitting(false);
  };

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
    setTwoFactorEnabled(true);
    return true;
  };
  
  const handleLogoutOtherSessions = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    if (error) {
      toast.error(`Failed to log out other sessions: ${error.message}`);
    } else {
      toast.success('Successfully logged out of all other sessions.');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to maintain account security. You will be logged out of other sessions after updating your password.</CardDescription>
        </CardHeader>
        <form onSubmit={handlePasswordSubmit}>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <Input 
                  id="newPassword" 
                  name="newPassword"
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input 
                  id="confirmPassword" 
                  name="confirmPassword"
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button 
              type="submit"
              disabled={isSubmitting || !passwordData.newPassword || !passwordData.confirmPassword}
            >
              {isSubmitting ? 'Updating...' : 'Update Password'}
            </Button>
          </CardFooter>
        </form>
      </Card>

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

      <Card>
        <CardHeader>
          <CardTitle>Login Sessions</CardTitle>
          <CardDescription>Manage your active login sessions</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="flex items-center justify-between p-4 border rounded-md">
              <div>
                <p className="font-medium">Current Session</p>
                <p className="text-sm text-muted-foreground">This is your current active session.</p>
              </div>
              <div className="text-sm font-medium text-green-600">Active</div>
            </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button variant="outline" className="text-destructive hover:bg-destructive/10" onClick={handleLogoutOtherSessions}>
            Log Out All Other Sessions
          </Button>
        </CardFooter>
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
    </div>
  );
};

export default UserSecuritySettings;
