import { Card } from "@/components/ui/card";
import { Zap, Shield, DollarSign, BarChart3, Globe, MessageCircle } from "lucide-react";

const features = [
  {
    icon: Zap,
    title: "High Performance",
    description: "State-of-the-art mining hardware with optimized algorithms for maximum efficiency and profitability.",
  },
  {
    icon: Shield,
    title: "Secure Platform",
    description: "Bank-level security with multi-factor authentication and cold storage for your digital assets.",
  },
  {
    icon: DollarSign,
    title: "Daily Payouts",
    description: "Receive your mining rewards automatically every day directly to your wallet.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Monitor your mining performance with detailed statistics and comprehensive dashboards.",
  },
  {
    icon: Globe,
    title: "Global Network",
    description: "Mining facilities across multiple continents ensuring 99.9% uptime and reliability.",
  },
  {
    icon: MessageCircle,
    title: "24/7 Support",
    description: "Dedicated support team available around the clock to assist with any questions or issues.",
  },
];

export const Features = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Why Choose CryptoMine Pro?
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-card hover:-translate-y-2 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="p-4 bg-secondary rounded-full mb-4 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
