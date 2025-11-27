import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Team = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, show team view from dashboard
  // Otherwise show public team page
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-yellow-400">Our Team</h1>
        <p className="text-center text-white/70 mb-12 max-w-3xl mx-auto">
          Meet the dedicated professionals behind BTCMining, working tirelessly to provide you with the best cloud mining experience.
        </p>
        {/* Team content would go here - same as dashboard team view */}
        <div className="text-center py-12">
          <p className="text-white/70">Please sign in to view our team members.</p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Team;

