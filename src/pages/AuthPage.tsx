
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Navigate } from 'react-router-dom';
import { Loader2, Shield } from 'lucide-react';
import { useAuth } from '@/context/auth/AuthContext';
import { toast } from 'sonner';

const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { user, signIn, signUp, loading: authLoading, isAuthenticated } = useAuth();

  // Redirect if already authenticated
  if (isAuthenticated && user) {
    console.log('User is authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (showReset) {
        // Handle password reset - would need to implement this in the context
        toast.info('Password reset functionality not implemented yet');
        setShowReset(false);
        return;
      }
      
      if (isSignUp) {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          return;
        }
        
        console.log('Attempting sign up for:', email);
        const result = await signUp(email, password, { email, name: email.split('@')[0] });
        
        if (!result.error) {
          toast.success('Account created successfully! Please check your email to verify your account.');
          // Switch to sign in mode after successful signup
          setIsSignUp(false);
          resetForm();
        } else {
          console.error('Sign up error:', result.error);
          toast.error(result.error.message || 'Sign up failed');
        }
      } else {
        console.log('Attempting sign in for:', email);
        const result = await signIn(email, password);
        
        if (!result.error) {
          console.log('Sign in successful, should redirect automatically');
          toast.success('Successfully signed in');
          // The redirect will happen automatically via the useAuth hook
        } else {
          console.error('Sign in error:', result.error);
          toast.error(result.error.message || 'Sign in failed');
        }
      }
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
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

  // Show loading if auth is still being determined
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

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
                    disabled={isLoading}
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
                    disabled={isLoading}
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
                      disabled={isLoading}
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
                        disabled={isLoading}
                      />
                      <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
                    </div>
                    
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-sm"
                      onClick={() => setShowReset(true)}
                      disabled={isLoading}
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
                  disabled={isLoading}
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
                disabled={isLoading}
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
