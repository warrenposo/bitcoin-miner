import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Footer } from "@/components/Footer";

const SignIn = () => {
  const navigate = useNavigate();
  const redirectedRef = useRef(false);
  const { signIn, user, profile, isAdmin, loading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle automatic redirects after successful sign in
  useEffect(() => {
    if (user && !redirectedRef.current) {
      redirectedRef.current = true;
      setIsLoading(false);

      // Redirect immediately - don't wait for profile
      // Profile will load in background, dashboard will handle admin redirect
      const timer = setTimeout(() => {
        console.log('[SignIn] Redirecting to dashboard, user:', user.email);
        navigate('/dashboard', { replace: true });
      }, 50); // Very short delay just to ensure state is set

      return () => clearTimeout(timer);
    } else if (!user && !authLoading && redirectedRef.current) {
      // Reset redirect flag if user logs out
      redirectedRef.current = false;
    }
  }, [user, authLoading, navigate]);

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
    // Clear general error
    if (error) {
      setError(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await signIn(formData.email.trim().toLowerCase(), formData.password);

      // Sign in succeeded - redirect immediately as backup
      // The useEffect will also handle it, but this ensures it happens
      console.log('[SignIn] Sign in successful, redirecting to dashboard');
      setIsLoading(false);
      
      // Small delay to ensure user state is set, then redirect
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 200);

    } catch (error: any) {
      console.error('Sign in error:', error);

      // Handle different error types
      let errorMessage = 'Sign in failed. Please check your credentials and try again.';

      if (error.message) {
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (error.message.includes('Email not confirmed') || error.message.includes('email not confirmed')) {
          errorMessage = 'Please verify your email address before signing in.';
        } else if (error.message.includes('too many requests')) {
          errorMessage = 'Too many sign in attempts. Please wait a moment and try again.';
        } else {
          errorMessage = error.message;
        }
      }

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1421] flex flex-col">
      {/* Header Section with Floating Coins */}
      <div className="relative h-32 bg-[#050C1A] flex items-center justify-center overflow-hidden">
        {/* Floating Golden Coins Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-10 w-16 h-16 bg-yellow-500/30 rounded-full blur-md animate-pulse"></div>
          <div className="absolute top-8 right-20 w-12 h-12 bg-yellow-500/20 rounded-full blur-lg animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-4 left-1/4 w-20 h-20 bg-yellow-500/25 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 right-1/3 w-14 h-14 bg-yellow-500/20 rounded-full blur-md animate-pulse" style={{ animationDelay: '1.5s' }}></div>
        </div>
        <h1 className="text-4xl font-bold text-white relative z-10">Sign In</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-[#111B2D] flex items-center justify-center p-4 sm:p-8">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-12 items-center max-w-6xl">
          {/* Left Column - Illustration */}
          <div className="hidden lg:block relative h-full flex items-center justify-center">
            <div className="relative w-full max-w-md">
              {/* Room/Building Outline - Minimalist structure */}
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-0 w-32 h-32 border-2 border-white/30 rounded-lg"></div>
                <div className="absolute top-0 right-0 w-24 h-24 border-2 border-white/30 rounded-lg"></div>
                <div className="absolute bottom-0 left-1/4 w-40 h-32 border-2 border-white/30 rounded-lg"></div>
              </div>
              
              {/* Character Illustration */}
              <div className="relative z-10 flex items-end justify-center">
                {/* Person Character */}
                <div className="relative">
                  {/* Head */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-12 h-12 bg-white/30 rounded-full border-2 border-white/40"></div>
                  
                  {/* Body - Yellow shirt with black polka dots */}
                  <div className="relative w-16 h-20 bg-yellow-500 rounded-lg">
                    {/* Polka dots */}
                    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-6 left-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                    <div className="absolute top-6 right-3 w-1.5 h-1.5 bg-black rounded-full"></div>
                  </div>
                  
                  {/* Pants */}
                  <div className="absolute top-20 left-1/2 -translate-x-1/2 w-12 h-12 bg-gray-600 rounded-b-lg"></div>
                  
                  {/* Shoes */}
                  <div className="absolute top-28 left-1/2 -translate-x-1/2 w-16 h-3 bg-yellow-500 rounded"></div>
                  
                  {/* Mobile Device - Large phone/tablet */}
                  <div className="absolute top-4 left-full ml-4 w-28 h-40 bg-[#0B1421] rounded-xl border-2 border-white/30 p-3 shadow-xl">
                    <div className="text-white text-xs font-bold mb-2 text-center">Login</div>
                    <div className="w-10 h-10 bg-yellow-500 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <div className="space-y-2 mb-3">
                      <div className="h-2 bg-white/20 rounded w-full"></div>
                      <div className="h-2 bg-white/20 rounded w-full"></div>
                      <div className="h-2 bg-white/20 rounded w-full"></div>
                    </div>
                    <div className="flex items-center gap-1 mb-3 justify-center">
                      <div className="w-1 h-1 bg-white/30 rounded-full"></div>
                    </div>
                    <div className="h-5 bg-yellow-500 rounded w-full"></div>
                  </div>
                </div>
                
                {/* Plant - Yellow potted plant */}
                <div className="absolute bottom-0 left-0">
                  <div className="relative">
                    {/* Pot */}
                    <div className="w-10 h-10 bg-yellow-500 rounded-full"></div>
                    {/* Leaves */}
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -top-4 -left-2 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -top-6 right-0 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-5 h-5 bg-yellow-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Login Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-[#0F1A2B] rounded-lg p-4 sm:p-8 border border-white/5">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Login To Your Account</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username or Email */}
                <div>
                  <Input
                    type="text"
                    placeholder="Username or Email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="bg-[#0B1421] text-white border-white/10 h-12"
                  />
                  {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                </div>

                {/* Password */}
                <div>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      className="bg-[#0B1421] text-white border-white/10 h-12 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password}</p>}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="remember"
                      checked={formData.rememberMe}
                      onCheckedChange={(checked) => handleInputChange("rememberMe", checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-white/70 text-sm">
                      Remember Me
                    </Label>
                  </div>
                  <Link to="/forgot-password" className="text-sm text-yellow-400 hover:text-yellow-300">
                    Forgot Password
                  </Link>
                </div>

                {/* Login Button */}
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold py-3 h-12"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing In..." : "Login"}
                </Button>
              </form>

              {/* Registration Link */}
              <div className="mt-6 text-center">
                <p className="text-sm text-white/70">
                  Don't Have An Account?{" "}
                  <Link to="/signup" className="text-yellow-400 hover:text-yellow-300 font-medium">
                    Register
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default SignIn;
