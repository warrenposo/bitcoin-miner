import { Card } from "@/components/ui/card";

const stats = [
  { value: "50K+", label: "Active Miners" },
  { value: "250+", label: "BTC Mined" },
  { value: "99.9%", label: "Uptime" },
  { value: "150+", label: "Countries" },
];

export const Statistics = () => {
  return (
    <section className="py-20 px-4 bg-crypto-blue-light/50">
      <div className="container mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-16">
          Platform Statistics
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="p-8 text-center bg-gradient-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow group"
            >
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 group-hover:scale-110 transition-transform">
                {stat.value}
              </div>
              <div className="text-muted-foreground text-sm md:text-base">
                {stat.label}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
