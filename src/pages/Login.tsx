import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const redirectedRef = useRef(false);
  const { signIn, user, profile, isAdmin, loading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false, 
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Simplified and more reliable redirect logic
  useEffect(() => {
    if (authLoading) return; // Still loading auth state
    
    if (user && !redirectedRef.current) {
      redirectedRef.current = true;
      
      // Small delay to ensure state is consistent
      const timer = setTimeout(() => {
        if (profile) {
          navigate(isAdmin ? '/admin' : '/dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
        setIsSubmitting(false);
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [user, profile, isAdmin, authLoading, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) setFormErrors((prev) => ({ ...prev, [field]: '' }));
    if (authError) setAuthError(null);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Enter a valid email';
    if (!formData.password) errors.password = 'Password is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setAuthError(null);

    try {
      const result = await signIn(formData.email.trim().toLowerCase(), formData.password);
      
      // Check if signIn was successful
      if (!result) {
        throw new Error('Sign in failed - no response received');
      }
      
      // Don't set isSubmitting to false here - let the useEffect handle redirect
      // The toast will be shown after successful redirect
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      
      // Handle different error types
      let errorMessage = 'Failed to sign in. Please check your credentials and try again.';
      
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthError(errorMessage);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-xl font-bold text-primary-foreground">
              CM
            </div>
            <span className="text-2xl font-bold text-white">
              Crypto<span className="text-primary">Mine</span>
            </span>
          </Link>
        </div>

        <Card className="shadow-2xl border border-white/10 bg-[#050C1A]/80 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
            <CardDescription className="text-white/60">Sign in to access your CryptoMine Pro dashboard</CardDescription>
          </CardHeader>

          {authError && (
            <div className="mx-6 mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {authError}
            </div>
          )}

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-white/80">
                  Email Address
                </Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`pl-10 bg-white/5 text-white ${
                      formErrors.email ? 'border-red-500/60 focus-visible:ring-red-500' : 'border-white/10 focus-visible:ring-primary'
                    }`}
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.email && <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>}
              </div>

              <div>
                <Label htmlFor="password" className="text-white/80">
                  Password
                </Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className={`pl-10 pr-10 bg-white/5 text-white ${
                      formErrors.password
                        ? 'border-red-500/60 focus-visible:ring-red-500'
                        : 'border-white/10 focus-visible:ring-primary'
                    }`}
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 rounded-full p-1 text-white/40 hover:text-white/80"
                    onClick={() => setShowPassword((prev) => !prev)}
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {formErrors.password && <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>}
              </div>

              <div className="flex items-center justify-between text-sm text-white/70">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={formData.rememberMe}
                    onCheckedChange={(checked) => handleInputChange('rememberMe', Boolean(checked))}
                    className="border-white/30 data-[state=checked]:bg-primary"
                    disabled={isSubmitting}
                  />
                  <Label htmlFor="remember">Remember me</Label>
                </div>
                <Link
                  to="/forgot-password"
                  className="text-primary hover:underline"
                  onClick={(e) => (isSubmitting ? e.preventDefault() : undefined)}
                >
                  Forgot password?
                </Link>
              </div>

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Signing In...' : 'Sign In'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex flex-col gap-2 text-center text-sm text-white/60">
            <p>
              Don&apos;t have an account?{' '}
              <Link
                to="/signup"
                className="text-primary hover:underline font-medium"
                onClick={(e) => (isSubmitting ? e.preventDefault() : undefined)}
              >
                Create account
              </Link>
            </p>
            <p className="text-xs text-white/40">Secured with 256-bit SSL encryption</p>
          </CardFooter>
        </Card>

        <div className="text-center text-xs text-white/40">
          <p>Need help? Contact support@cryptominepro.com • PCI Compliant • ISO 27001 Certified</p>
        </div>
      </div>
    </div>
  );
};

export default Login;