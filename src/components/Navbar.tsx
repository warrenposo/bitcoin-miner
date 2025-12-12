import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

export const Navbar = () => {
  const { user, signOut, isAdmin, loading, session } = useAuth();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  // Only show Sign Out if we're not loading AND we have a verified user with a valid session
  const showSignOut = !loading && Boolean(user) && Boolean(session);

  const handleAuthAction = async () => {
    if (isProcessing) return;

    if (showSignOut) {
      try {
        setIsProcessing(true);
        await signOut();
        navigate("/");
      } finally {
        setIsProcessing(false);
      }
    } else {
      navigate("/login");
    }
  };

  const handleLogoClick = () => {
    if (showSignOut) {
      navigate(isAdmin ? "/admin" : "/dashboard");
    } else {
      navigate("/");
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1"
          >
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold text-primary">BTC Mining Base</span>
          </button>
          <Button
            size="sm"
            className="hover:scale-105 transition-transform bg-gradient-gold shadow-glow"
            onClick={handleAuthAction}
            disabled={isProcessing}
          >
            {showSignOut ? (isProcessing ? "Signing Out..." : "Sign Out") : "Sign In"}
          </Button>
        </div>
      </div>
    </nav>
  );
};
