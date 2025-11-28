import { Phone, Mail, MapPin } from "lucide-react";
import { Link } from "react-router-dom";

// WhatsApp Icon Component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

// Telegram Icon Component
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.559z"/>
  </svg>
);

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
                <Mail className="h-5 w-5 text-yellow-400" />
                <a href="mailto:btcminingbase@gmail.com" className="text-white/70 hover:text-yellow-400 transition-colors">
                  btcminingbase@gmail.com
                </a>
              </li>
              <li className="flex items-center gap-3">
                <WhatsAppIcon className="h-5 w-5 text-yellow-400" />
                <a 
                  href="https://wa.me/447400734398" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-yellow-400 transition-colors"
                >
                  +44 7400 734398
                </a>
              </li>
              <li className="flex items-center gap-3">
                <TelegramIcon className="h-5 w-5 text-yellow-400" />
                <a 
                  href="https://t.me/+dz1QVygXLJxlNzc0" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-white/70 hover:text-yellow-400 transition-colors"
                >
                  Join Telegram Group
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

