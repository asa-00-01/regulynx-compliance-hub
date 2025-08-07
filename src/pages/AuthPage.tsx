
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);

  const { signIn, signUp, resetPassword, isLoading, isAuthenticated } = useSecureAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showReset) {
      await resetPassword(resetEmail);
      setShowReset(false);
      return;
    }
    
    if (isSignUp) {
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match');
      }
      await signUp(email, password);
    } else {
      await signIn(email, password, rememberMe);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setResetEmail('');
    setRememberMe(false);
    setShowReset(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle>
            {showReset ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription>
            {showReset 
              ? 'Enter your email to receive a password reset link'
              : isSignUp 
                ? 'Create a new account to get started'
                : 'Sign in to your account'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {showReset ? (
              <div className="space-y-2">
                <Label htmlFor="resetEmail">Email</Label>
                <Input
                  id="resetEmail"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    minLength={8}
                  />
                </div>
                
                {isSignUp && (
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                    />
                  </div>
                )}
                
                {!isSignUp && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="rememberMe"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                      />
                      <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                    </div>
                    
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => setShowReset(true)}
                    >
                      Forgot password?
                    </Button>
                  </div>
                )}
              </>
            )}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait...
                </>
              ) : showReset ? (
                'Send Reset Link'
              ) : isSignUp ? (
                'Create Account'
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          {!showReset && (
            <>
              <Separator className="my-4" />
              
              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    resetForm();
                  }}
                >
                  {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
                </Button>
              </div>
            </>
          )}
          
          {showReset && (
            <div className="text-center mt-4">
              <Button
                type="button"
                variant="link"
                onClick={() => {
                  setShowReset(false);
                  resetForm();
                }}
              >
                Back to sign in
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
