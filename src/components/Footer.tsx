import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => {
  return (
    <footer className="bg-[#0F1A2B] border-t border-white/10 relative overflow-hidden">
      {/* Background Cryptocurrency Coins */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 border-4 border-yellow-500 rounded-full"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-4 border-yellow-500 rounded-full"></div>
        <div className="absolute bottom-20 left-1/4 w-28 h-28 border-4 border-yellow-500 rounded-full"></div>
        <div className="absolute bottom-10 right-1/3 w-20 h-20 border-4 border-yellow-500 rounded-full"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-4 border-yellow-500 rounded-full"></div>
      </div>

      <div className="container mx-auto px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* Company Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">B</span>
              </div>
              <span className="text-xl font-bold text-white">BTCMining</span>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Btc Mining is one of the leading cryptocurrency mining platforms, offering cryptocurrency mining capacities in every range - for newcomers. Our mission is to make acquiring cryptocurrencies easy and fast for everyone.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h5 className="text-white font-semibold text-lg relative pb-2">
              Quick Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-yellow-400"></div>
            </h5>
            <ul className="space-y-2">
              <li>
                <Link to="/team" className="text-white/70 hover:text-yellow-400 transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/about-us" className="text-white/70 hover:text-yellow-400 transition-colors">
                  AboutUs
                </Link>
              </li>
            </ul>
          </div>

          {/* Useful Links */}
          <div className="space-y-4">
            <h5 className="text-white font-semibold text-lg relative pb-2">
              Useful Links
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-yellow-400"></div>
            </h5>
            <ul className="space-y-2">
              <li>
                <Link to="/usage-policy" className="text-white/70 hover:text-yellow-400 transition-colors">
                  Usage Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-white/70 hover:text-yellow-400 transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-white/70 hover:text-yellow-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-white/70 hover:text-yellow-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h5 className="text-white font-semibold text-lg relative pb-2">
              Contact Info
              <div className="absolute bottom-0 left-0 w-12 h-0.5 bg-yellow-400"></div>
            </h5>
            <ul className="space-y-3">
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-yellow-400" />
                <span className="text-white/70">VIP Customers Only</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-yellow-400" />
                <a href="mailto:[email protected]" className="text-white/70 hover:text-yellow-400 transition-colors">
                  [email protected]
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-yellow-400 mt-1" />
                <span className="text-white/70">
                  57 Kingfisher Grove, Willenhall, England, WV12 5HG (Company No. 15415402)
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="border-t border-white/10 pt-8">
          <div className="flex flex-col items-center gap-4">
            {/* Crest/Coat of Arms Placeholder */}
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center border-2 border-yellow-500/30">
              <div className="text-yellow-400 text-2xl">⚜</div>
            </div>
            <p className="text-white/70 text-sm text-center">
              Copyright © 2020-2025 Btc Mining All Right Reserved
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

