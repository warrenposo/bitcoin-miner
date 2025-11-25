import { Button } from "@/components/ui/button";
import { Bitcoin } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-hero">
      {/* Floating Bitcoin symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Bitcoin className="absolute top-20 left-10 w-32 h-32 text-crypto-blue-light/20 animate-pulse" />
        <Bitcoin className="absolute bottom-20 right-10 w-40 h-40 text-crypto-blue-light/20 animate-pulse" style={{ animationDelay: "1s" }} />
        <Bitcoin className="absolute top-1/2 left-1/4 w-24 h-24 text-crypto-blue-light/10 animate-pulse" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container mx-auto px-4 py-20 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary bg-clip-text text-transparent animate-in fade-in slide-in-from-bottom-4 duration-1000">
          Start Mining Bitcoin Today
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          Join thousands of miners earning cryptocurrency with our powerful cloud mining platform
        </p>
        <Button 
          size="lg" 
          className="text-lg px-8 py-6 bg-gradient-gold hover:shadow-glow transition-all duration-300 hover:scale-105 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300"
        >
          Start Mining Now
        </Button>
      </div>
    </section>
  );
};
