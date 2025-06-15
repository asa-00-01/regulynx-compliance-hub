
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const LoginSessions = () => {
  const handleLogoutOtherSessions = async () => {
    const { error } = await supabase.auth.signOut({ scope: 'others' });
    if (error) {
      toast.error(`Failed to log out other sessions: ${error.message}`);
    } else {
      toast.success('Successfully logged out of all other sessions.');
    }
  };

  return (
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
  );
};

export default LoginSessions;
