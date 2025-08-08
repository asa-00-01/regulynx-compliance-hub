
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useTranslation } from 'react-i18next';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Starting login process for:', email);
      const user = await login(email, password);
      
      if (user) {
        console.log('✅ Login successful, redirecting to dashboard');
        toast({
          title: t('login.successTitle'),
          description: t('login.successDescription'),
        });
        
        // Force navigation to dashboard
        window.location.href = '/dashboard';
      } else {
        console.warn('❌ Login failed - no user returned');
        setError(t('login.error'));
      }
    } catch (error: any) {
      console.error('🚨 Login error:', error);
      setError(error.message || t('login.error'));
      toast({
        title: 'Error',
        description: error.message || t('login.error'),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Regulynx</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('login.subtitle')}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{t('login.title')}</CardTitle>
            <CardDescription>
              {t('login.description')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">{t('login.emailLabel')}</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="compliance@regulynx.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t('login.passwordLabel')}</Label>
                  <a
                    href="#"
                    className="text-xs text-primary hover:underline"
                  >
                    {t('login.forgotPassword')}
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading}
              >
                {loading ? t('login.signingInButton') : t('login.signInButton')}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center text-sm">
            <p className="text-center text-sm text-muted-foreground">
              {t('login.demoAccounts')}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
