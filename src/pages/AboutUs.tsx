import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const AboutUs = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If user is logged in, show about view from dashboard
  // Otherwise show public about page
  if (user) {
    navigate('/dashboard');
    return null;
  }

  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center text-yellow-400">About Us</h1>
        <div className="max-w-4xl mx-auto space-y-6 text-white/80 leading-relaxed">
          <p>
            BTCMining is one of the leading cryptocurrency mining platforms, offering cryptocurrency mining capacities in every range - for newcomers. Our mission is to make acquiring cryptocurrencies easy and fast for everyone.
          </p>
          <p>
            Please sign in to view more about our company, mission, and values.
          </p>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AboutUs;

