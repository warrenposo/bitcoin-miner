import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowRight,
  Zap,
  Users,
  Copy,
  Plus,
  Info,
  MapPin,
  Mail,
  LogOut,
  Lock,
  CircleDollarSign,
  Headphones,
  MessageSquare,
  Paperclip,
  Clock,
  LifeBuoy,
  AlertCircle,
} from 'lucide-react';

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
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { UserSidebar } from '@/components/UserSidebar';
import { WHATSAPP_LINK, WHATSAPP_DISPLAY } from '@/constants/contact';

interface MiningStats {
  hash_rate: number;
  total_mined: number;
  daily_earnings: number;
}


const translations = {
  en: {
    heroTitle: 'World-class security',
    heroBody1:
      'As a wholly owned subsidiary of Digital Currency Group, we offer clients the opportunity to tap into our ecosystem. BTC Mining has entered a deep strategic partnership agreement with Coinbase, the largest cryptocurrency exchange in the United States.',
    heroBody2:
      'BTC Mining already supports direct transfers from Coinbase exchange accounts to BTC Mining accounts. If you are also a Coinbase client, you can choose Coinbase Payments when making payments.',
    heroBody3: 'The funds are supervised by Coinbase, a third-party listed company.',
    depositCta: 'Deposit Funds',
    withdrawCta: 'Withdraw Now',
    appDownload: '⬇ APP Download',
  },
  es: {
    heroTitle: 'Seguridad de clase mundial',
    heroBody1:
      'Como subsidiaria de Digital Currency Group, ofrecemos a los clientes la oportunidad de acceder a nuestro ecosistema. BTC Mining mantiene una alianza estratégica con Coinbase, el mayor intercambio de criptomonedas en Estados Unidos.',
    heroBody2:
      'BTC Mining ya admite transferencias directas desde cuentas de Coinbase a cuentas de BTC Mining. Si también eres cliente de Coinbase, puedes elegir Coinbase Payments al realizar pagos.',
    heroBody3: 'Los fondos están supervisados por Coinbase, una compañía que cotiza en bolsa.',
    depositCta: 'Depositar fondos',
    withdrawCta: 'Retirar ahora',
    appDownload: '⬇ Descargar APP',
  },
  fr: {
    heroTitle: 'Une sécurité de classe mondiale',
    heroBody1:
      "En tant que filiale du Digital Currency Group, nous offrons aux clients l'opportunité d'accéder à notre écosystème. BTC Mining a conclu un partenariat stratégique avec Coinbase, le plus grand échange de crypto-monnaies aux États-Unis.",
    heroBody2:
      'BTC Mining prend déjà en charge les transferts directs des comptes Coinbase vers les comptes BTC Mining. Si vous êtes également client de Coinbase, vous pouvez choisir Coinbase Payments lors de vos paiements.',
    heroBody3: 'Les fonds sont supervisés par Coinbase, une société cotée en bourse.',
    depositCta: 'Déposer des fonds',
    withdrawCta: 'Retirer maintenant',
    appDownload: '⬇ Télécharger APP',
  },
  de: {
    heroTitle: 'Sicherheit auf Weltklasseniveau',
    heroBody1:
      'Als Tochtergesellschaft der Digital Currency Group bieten wir Kunden Zugang zu unserem Ökosystem. BTC Mining hat eine strategische Partnerschaft mit Coinbase, der größten Kryptobörse in den USA.',
    heroBody2:
      'BTC Mining unterstützt bereits direkte Überweisungen von Coinbase-Konten auf BTC-Mining-Konten. Wenn Sie ebenfalls Coinbase-Kunde sind, können Sie Coinbase Payments für Zahlungen wählen.',
    heroBody3: 'Die Gelder werden von Coinbase, einem börsennotierten Unternehmen, überwacht.',
    depositCta: 'Geld einzahlen',
    withdrawCta: 'Jetzt abheben',
    appDownload: '⬇ APP herunterladen',
  },
};

type LanguageKey = keyof typeof translations;
type DialCodeOption = { iso2: string; name: string; dial: string };

const FALLBACK_DIAL_CODES: DialCodeOption[] = [
  { iso2: 'US', name: 'United States', dial: '+1' },
  { iso2: 'GB', name: 'United Kingdom', dial: '+44' },
  { iso2: 'KE', name: 'Kenya', dial: '+254' },
  { iso2: 'NG', name: 'Nigeria', dial: '+234' },
  { iso2: 'ZA', name: 'South Africa', dial: '+27' },
  { iso2: 'IN', name: 'India', dial: '+91' },
  { iso2: 'CN', name: 'China', dial: '+86' },
  { iso2: 'AF', name: 'Afghanistan', dial: '+93' },
  { iso2: 'AE', name: 'United Arab Emirates', dial: '+971' },
  { iso2: 'SA', name: 'Saudi Arabia', dial: '+966' },
  { iso2: 'EG', name: 'Egypt', dial: '+20' },
  { iso2: 'TR', name: 'Turkey', dial: '+90' },
  { iso2: 'PK', name: 'Pakistan', dial: '+92' },
  { iso2: 'BD', name: 'Bangladesh', dial: '+880' },
  { iso2: 'ID', name: 'Indonesia', dial: '+62' },
  { iso2: 'MY', name: 'Malaysia', dial: '+60' },
  { iso2: 'SG', name: 'Singapore', dial: '+65' },
  { iso2: 'TH', name: 'Thailand', dial: '+66' },
  { iso2: 'VN', name: 'Vietnam', dial: '+84' },
  { iso2: 'PH', name: 'Philippines', dial: '+63' },
  { iso2: 'JP', name: 'Japan', dial: '+81' },
  { iso2: 'KR', name: 'South Korea', dial: '+82' },
  { iso2: 'DE', name: 'Germany', dial: '+49' },
  { iso2: 'FR', name: 'France', dial: '+33' },
  { iso2: 'IT', name: 'Italy', dial: '+39' },
  { iso2: 'ES', name: 'Spain', dial: '+34' },
  { iso2: 'PT', name: 'Portugal', dial: '+351' },
  { iso2: 'NL', name: 'Netherlands', dial: '+31' },
  { iso2: 'SE', name: 'Sweden', dial: '+46' },
  { iso2: 'NO', name: 'Norway', dial: '+47' },
  { iso2: 'DK', name: 'Denmark', dial: '+45' },
  { iso2: 'FI', name: 'Finland', dial: '+358' },
  { iso2: 'CH', name: 'Switzerland', dial: '+41' },
  { iso2: 'AU', name: 'Australia', dial: '+61' },
  { iso2: 'NZ', name: 'New Zealand', dial: '+64' },
  { iso2: 'CA', name: 'Canada', dial: '+1' },
  { iso2: 'BR', name: 'Brazil', dial: '+55' },
  { iso2: 'AR', name: 'Argentina', dial: '+54' },
  { iso2: 'MX', name: 'Mexico', dial: '+52' },
];

const Dashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [loading, setLoading] = useState(true);
  // Initialize language from localStorage if available, otherwise default to 'en'
  const [language, setLanguage] = useState<LanguageKey>(() => {
    const storedLang = localStorage.getItem('selectedLanguage') as LanguageKey;
    return storedLang && translations[storedLang] ? storedLang : 'en';
  });
  // Check for view from sessionStorage (set by navigation)
  const initialView = (sessionStorage.getItem('dashboard_view') as any) || 'dashboard';
  const [activeView, setActiveView] = useState<'dashboard' | 'my-referrals' | 'referral-bonus-logs' | 'withdraw-logs' | 'profile' | 'wallets' | '2fa-security' | 'change-password' | 'team' | 'about-us' | 'support-new' | 'support-all'>(initialView);

  // Clear sessionStorage view after using it
  useEffect(() => {
    if (initialView && initialView !== 'dashboard') {
      sessionStorage.removeItem('dashboard_view');
    }
  }, []);
  

  // Auto-expand account menu if an account view is active
  useEffect(() => {
    if (activeView === 'profile' || activeView === 'wallets' || activeView === '2fa-security' || activeView === 'change-password') {
      setAccountExpanded(true);
    }
  }, [activeView]);

  // Set profile data when component loads
  useEffect(() => {
    if (profile?.email) {
      setProfileData(prev => ({
        ...prev,
        email: profile.email,
        username: profile.email.split('@')[0] || '',
        firstName: profile.full_name?.split(' ')[0] || '',
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || '',
        phone: profile.mobile || '',
        countryCode: profile.country_code || prev.countryCode,
        country: profile.country || '',
        address: profile.address || '',
        state: profile.state || '',
        zipCode: profile.zip_code || '',
        city: profile.city || '',
      }));
    }
  }, [profile]);
  const [commission, setCommission] = useState(0);
  const [walletAddress, setWalletAddress] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);
  const [referralLink, setReferralLink] = useState('');
  const [referralBalance, setReferralBalance] = useState<number | null>(null);
  const [referralBonusLogs, setReferralBonusLogs] = useState<any[]>([]);
  const [withdrawLogs, setWithdrawLogs] = useState<any[]>([]);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    countryCode: '+93',
    country: '',
    address: '',
    state: '',
    zipCode: '',
    city: '',
  });
  const [dialCodeOptions, setDialCodeOptions] = useState<DialCodeOption[]>(FALLBACK_DIAL_CODES);
  const [otp, setOtp] = useState('');
  const [setupKey, setSetupKey] = useState('5KYBUO47PRDIP5NF');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [tickets, setTickets] = useState<any[]>([]);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketPriority, setTicketPriority] = useState('medium');
  const [ticketMessage, setTicketMessage] = useState('');
  const [submittingTicket, setSubmittingTicket] = useState(false);

  const copy = translations[language];

  useEffect(() => {
    const fetchDialCodes = async () => {
      const { data, error } = await supabase
        .from('countries')
        .select('iso2, name_en, dial_code, sort_order')
        .not('dial_code', 'is', null)
        .order('sort_order', { ascending: true })
        .order('name_en', { ascending: true });

      if (error || !data?.length) return;

      const options = data
        .filter((row: any) => !!row.dial_code)
        .map((row: any) => ({
          iso2: String(row.iso2 || '').toUpperCase(),
          name: String(row.name_en || row.iso2 || ''),
          dial: String(row.dial_code),
        }))
        .filter((row: DialCodeOption) => row.iso2 && row.name && row.dial);

      if (options.length > 0) setDialCodeOptions(options);
    };

    fetchDialCodes();
  }, []);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        navigate('/signin', { replace: true });
        return;
      }

      // Check if user is admin (check profile or email as fallback)
      const userIsAdmin = profile?.role === 'admin' || user.email?.toLowerCase() === 'warrenokumu98@gmail.com';
      
      if (userIsAdmin && profile?.role === 'admin') {
        // Only redirect if we're sure they're admin (profile loaded)
        console.log('[Dashboard] User is admin, redirecting to admin dashboard');
        navigate('/admin', { replace: true });
        return;
      }

      // If profile not loaded yet but user might be admin, wait a bit
      if (!profile && user.email?.toLowerCase() === 'warrenokumu98@gmail.com') {
        // Wait for profile to load, then redirect if admin
        const checkAdminTimer = setTimeout(() => {
          if (profile?.role === 'admin') {
            console.log('[Dashboard] Profile loaded, user is admin, redirecting');
            navigate('/admin', { replace: true });
          }
        }, 1000);
        
        // Start loading dashboard data while waiting
        setLoading(true);
        fetchData().catch(console.error);
        
        return () => clearTimeout(checkAdminTimer);
      }

      // Normal user - load dashboard immediately
      setLoading(true);
      fetchData().catch(console.error);
      
      // Set referral link (don't wait for profile)
      if (profile?.referral_code) {
        setReferralLink(`https://btccryptomining?ref=${profile.referral_code}`);
      } else if (user.email) {
        setReferralLink(`https://btccryptomining?ref=${user.email.split('@')[0]}`);
      }
    };

    loadDashboard();
  }, [user, profile, navigate]);

  const fetchData = async () => {
    try {
      // Fetch mining stats (so Balance card shows latest after admin updates)
      const { data: stats } = await supabase
        .from('mining_stats')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (stats) {
        setMiningStats(stats);
      } else {
        // Create initial stats if none exist
        const { data: newStats } = await supabase
          .from('mining_stats')
          .insert({
            user_id: user.id,
            hash_rate: 0,
            total_mined: 0,
            daily_earnings: 0,
          })
          .select()
          .single();
        if (newStats) setMiningStats(newStats);
      }

      // Fetch referral_balance from profile (so Referral Bonus card shows latest after admin updates)
      const { data: profileRow } = await supabase
        .from('profiles')
        .select('referral_balance')
        .eq('user_id', user!.id)
        .maybeSingle();
      setReferralBalance(profileRow?.referral_balance != null ? Number(profileRow.referral_balance) : 0);
      
      // Fetch tickets
      const { data: ticketData } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setTickets(ticketData || []);

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };


  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleHomeClick = () => {
    navigate('/dashboard');
  };

  const handleTeamClick = () => {
    window.open('https://example.com/demo-team', '_blank', 'noopener');
  };

  const handleAboutClick = () => {
    const section = document.getElementById('about-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/dashboard');
    }
  };



  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return '0.00 USD';
    return `${value.toFixed(2)} USD`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      {/* Top Navigation Bar */}
      <header className="bg-[#0F1A2B] border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold text-lg">B</span>
            </div>
            <span className="text-xl font-bold text-white">BTCMining</span>
          </div>
          
          {/* Center Navigation */}
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <button
              onClick={() => {
                setActiveView('dashboard');
                navigate('/dashboard');
              }}
              className={`text-sm font-medium transition-colors ${
                activeView === 'dashboard' ? 'text-yellow-400' : 'text-white/70 hover:text-white'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setActiveView('team')}
              className={`text-sm font-medium transition-colors ${
                activeView === 'team' ? 'text-yellow-400' : 'text-white/70 hover:text-white'
              }`}
            >
              Team
            </button>
            <button
              onClick={() => setActiveView('about-us')}
              className={`text-sm font-medium transition-colors ${
                activeView === 'about-us' ? 'text-yellow-400' : 'text-white/70 hover:text-white'
              }`}
            >
              AboutUs
            </button>
          </nav>
          
          {/* Right Side - Mobile Menu Button, Language and Logout */}
          <div className="flex items-center gap-2 lg:gap-4">
            {/* Mobile Menu Button */}
            <select
              className="hidden sm:block rounded-md bg-transparent px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
              value={language}
              onChange={(e) => {
                const newLang = e.target.value as LanguageKey;
                setLanguage(newLang);
                localStorage.setItem('selectedLanguage', newLang);
              }}
            >
              <option className="text-black" value="en">
                English
              </option>
              <option className="text-black" value="es">
                Español
              </option>
              <option className="text-black" value="fr">
                Français
              </option>
              <option className="text-black" value="de">
                Deutsch
              </option>
            </select>
            <Button className="bg-rose-500 hover:bg-rose-600 text-sm px-3 lg:px-4" onClick={handleSignOut}>
              <span className="hidden sm:inline">Logout</span>
              <span className="sm:hidden">Out</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <UserSidebar 
          activeView={activeView} 
          onViewChange={(view) => setActiveView(view as any)}
          onSignOut={handleSignOut}
        />

        <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-x-hidden">

          {/* My Referrals Page */}
          {activeView === 'my-referrals' && (
            <div className="space-y-6">
              {/* My Commission Section */}
              <div className="flex items-center justify-between rounded-lg border border-white/5 bg-[#111B2D]/70 p-4">
                <div className="flex items-center gap-4">
                  <span className="text-white/70">USDT</span>
                  <span className="text-white text-lg font-semibold">{commission.toFixed(4)}</span>
                </div>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-400">
                  Withdrawal
                </Button>
              </div>

              {/* USDT Wallet Address Section */}
              <div className="space-y-2">
                <Label className="text-white/70">USDT Wallet Address (Require TRC20)</Label>
                <div className="flex gap-2">
                  <Input
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    disabled={!isEditingWallet}
                    className="bg-[#0B1421] text-white border-white/10"
                    placeholder="Enter your USDT wallet address"
                  />
                  <Button
                    onClick={() => {
                      if (isEditingWallet && walletAddress) {
                        // Save wallet address logic here
                        setIsEditingWallet(false);
                        toast({
                          title: 'Success',
                          description: 'Wallet address updated',
                        });
                      } else {
                        setIsEditingWallet(true);
                      }
                    }}
                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                  >
                    {isEditingWallet ? 'Save' : 'Edit'}
                  </Button>
                </div>
              </div>

              {/* Your Referral Link Section */}
              <div className="space-y-2">
                <Label className="text-white/70">Your Referral Link</Label>
                <div className="flex gap-2">
                  <Input
                    value={referralLink}
                    readOnly
                    className="bg-[#0B1421] text-white border-white/10"
                  />
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(referralLink);
                      toast({
                        title: 'Copied!',
                        description: 'Referral link copied to clipboard',
                      });
                    }}
                    className="bg-yellow-500 text-black hover:bg-yellow-400"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
              </div>

              {/* Referral Program Description */}
              <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6 space-y-4">
                <h3 className="text-xl font-semibold text-white">
                  Earn USDT by referring new users, join our Affiliate Program (Partner Program), and earn a lifetime 10% commission!
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-white/80 text-sm">
                  <li>Put your affiliate link on your blog or any website you may have.</li>
                  <li>
                    New users register with us. You will get 10% of the top-up amount. For example, You recommend user A, you can get 7% of the referral plan, A recommends B to buy plan, you can get 2% B recommends C to buy plan, you can get 1%
                  </li>
                  <li>Mention Btc Mining. in your newsletter and use your affiliate link.</li>
                  <li>
                    Invite your friends and earn USDT benefits when they complete their purchases. Keep an eye on how much you earn each week, get paid in USDT, and each of your affiliates will generate lifetime commissions.
                  </li>
                  <li>We allow you to earn commissions by referring friends without purchasing any mining plans.</li>
                  <li>Team members enjoy team commission benefits and form a community of interests.</li>
                </ol>
              </div>

              {/* Your Team Section */}
              <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Your Team invited {teamMembers.length} users
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0B1421] text-white/70">
                      <tr>
                        <th className="py-3 px-4">User</th>
                        <th className="py-3 px-4">Recharge Amount</th>
                        <th className="py-3 px-4">Percent</th>
                        <th className="py-3 px-4">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="text-white/80">
                      {teamMembers.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-white/50">
                            No team members yet
                          </td>
                        </tr>
                      ) : (
                        teamMembers.map((member, index) => (
                          <tr key={index} className="border-t border-white/5">
                            <td className="py-3 px-4">{member.user}</td>
                            <td className="py-3 px-4">{member.recharge_amount}</td>
                            <td className="py-3 px-4">{member.percent}%</td>
                            <td className="py-3 px-4">{member.amount}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Referral Bonus Logs Page */}
          {activeView === 'referral-bonus-logs' && (
            <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Referral Bonus Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B1421] text-white">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Recharge amount</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    {referralBonusLogs.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-white">
                          No referral bonus received yet!
                        </td>
                      </tr>
                    ) : (
                      referralBonusLogs.map((log, index) => (
                        <tr key={index} className="border-t border-white/5">
                          <td className="py-3 px-4">{log.user}</td>
                          <td className="py-3 px-4">{log.recharge_amount}</td>
                          <td className="py-3 px-4">{log.amount}</td>
                          <td className="py-3 px-4">{log.time}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Withdraw Logs Page */}
          {activeView === 'withdraw-logs' && (
            <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6">
              <h3 className="text-xl font-semibold text-white mb-4">Withdraw Logs</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0B1421] text-white">
                    <tr>
                      <th className="py-3 px-4">Time</th>
                      <th className="py-3 px-4">Transaction ID</th>
                      <th className="py-3 px-4">Wallet</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Actual Amount</th>
                      <th className="py-3 px-4">Fee</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-white/80">
                    {withdrawLogs.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-white">
                          No Data Found!
                        </td>
                      </tr>
                    ) : (
                      withdrawLogs.map((log, index) => (
                        <tr key={index} className="border-t border-white/5">
                          <td className="py-3 px-4">{log.time}</td>
                          <td className="py-3 px-4">{log.transaction_id}</td>
                          <td className="py-3 px-4">{log.wallet}</td>
                          <td className="py-3 px-4">{log.amount}</td>
                          <td className="py-3 px-4">{log.actual_amount}</td>
                          <td className="py-3 px-4">{log.fee}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded text-xs ${
                              log.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                              log.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <button className="text-yellow-400 hover:text-yellow-300">View</button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* New Support Ticket Page */}
          {activeView === 'support-new' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <LifeBuoy className="h-8 w-8 text-yellow-400" />
                <h2 className="text-3xl font-bold text-white">Open New Ticket</h2>
              </div>
              
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!ticketSubject || !ticketMessage) {
                    toast({
                      title: 'Error',
                      description: 'Please fill in all fields',
                      variant: 'destructive',
                    });
                    return;
                  }

                  setSubmittingTicket(true);
                  try {
                    const { error } = await supabase
                      .from('support_tickets')
                      .insert({
                        user_id: user!.id,
                        name: profile?.full_name || user?.email?.split('@')[0] || 'User',
                        email: user?.email,
                        subject: ticketSubject,
                        message: ticketMessage,
                        priority: ticketPriority,
                        status: 'open',
                      });

                    if (error) throw error;

                    toast({
                      title: 'Success',
                      description: 'Support ticket submitted successfully',
                    });
                    setTicketSubject('');
                    setTicketMessage('');
                    setActiveView('support-all');
                    fetchData();
                  } catch (error: any) {
                    toast({
                      title: 'Error',
                      description: error.message || 'Failed to submit ticket',
                      variant: 'destructive',
                    });
                  } finally {
                    setSubmittingTicket(false);
                  }
                }}
                className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">Subject</Label>
                    <Input
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                      className="bg-[#0B1421] text-white border-white/10"
                      placeholder="Enter ticket subject"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Priority</Label>
                    <select
                      value={ticketPriority}
                      onChange={(e) => setTicketPriority(e.target.value)}
                      className="w-full bg-[#0B1421] text-white border border-white/10 rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-yellow-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Message</Label>
                  <Textarea
                    value={ticketMessage}
                    onChange={(e) => setTicketMessage(e.target.value)}
                    required
                    className="bg-[#0B1421] text-white border-white/10 min-h-[200px]"
                    placeholder="Describe your issue in detail..."
                  />
                </div>
                <Button
                  type="submit"
                  disabled={submittingTicket}
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400 mt-6"
                >
                  {submittingTicket ? 'Submitting...' : 'Submit Ticket'}
                </Button>
              </form>
            </div>
          )}

          {/* All Support Tickets Page */}
          {activeView === 'support-all' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-8 w-8 text-yellow-400" />
                  <h2 className="text-3xl font-bold text-white">Support Tickets</h2>
                </div>
                <Button 
                  onClick={() => setActiveView('support-new')}
                  className="bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Ticket
                </Button>
              </div>

              <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-[#0B1421] text-white/70">
                      <tr>
                        <th className="py-4 px-6">Subject</th>
                        <th className="py-4 px-6">Status</th>
                        <th className="py-4 px-6">Priority</th>
                        <th className="py-4 px-6">Last Reply</th>
                        <th className="py-4 px-6">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tickets.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-white/50">
                            <div className="flex flex-col items-center gap-2">
                              <Info className="h-8 w-8 opacity-20" />
                              <p>No support tickets found</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tickets.map((ticket) => (
                          <tr key={ticket.id} className="text-white/80 hover:bg-white/5 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-medium text-white">{ticket.subject}</div>
                              <div className="text-xs text-white/40 mt-1">Ticket ID: #{ticket.id.slice(0, 8)}</div>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                ticket.status === 'open' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                                ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                                ticket.status === 'resolved' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                                'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                                {ticket.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <span className={`flex items-center gap-1.5 ${
                                ticket.priority === 'urgent' ? 'text-red-400' :
                                ticket.priority === 'high' ? 'text-orange-400' :
                                ticket.priority === 'medium' ? 'text-yellow-400' :
                                'text-green-400'
                              }`}>
                                <AlertCircle className="h-3 w-3" />
                                <span className="capitalize">{ticket.priority}</span>
                              </span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center gap-2 text-white/60">
                                <Clock className="h-3 w-3" />
                                {new Date(ticket.updated_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10"
                                onClick={() => {
                                  // Detailed view could be implemented later if needed
                                  toast({
                                    title: "Ticket Details",
                                    description: `Status: ${ticket.status}. Admin Response: ${ticket.admin_response || 'No response yet.'}`,
                                  });
                                }}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}



          {/* Profile Setting Page */}
          {activeView === 'profile' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-white">Profile Setting</h2>
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (user && profile) {
                      const fullName = `${profileData.firstName} ${profileData.lastName}`.trim();
                      const { error } = await supabase
                        .from('profiles')
                        .update({
                          full_name: fullName,
                          mobile: profileData.phone,
                          country_code: profileData.countryCode,
                          country: profileData.country,
                          updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', user.id);
                      
                      if (error) throw error;
                      
                      toast({
                        title: 'Success',
                        description: 'Profile updated successfully',
                      });
                    }
                  } catch (error: any) {
                    toast({
                      title: 'Error',
                      description: error.message || 'Failed to update profile',
                      variant: 'destructive',
                    });
                  }
                }}
                className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6 space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/70">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      required
                      className="bg-[#0B1421] text-white border-white/10"
                      placeholder="First Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      className="bg-[#0B1421] text-white border-white/10"
                      placeholder="Last Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Username</Label>
                    <Input
                      value={profileData.username}
                      onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                      className="bg-[#0B1421] text-white border-white/10"
                      placeholder="Username"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">E-mail Address</Label>
                    <Input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="bg-[#0B1421] text-white border-white/10"
                      placeholder="Email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Mobile</Label>
                    <div className="flex gap-2">
                      <select
                        value={profileData.countryCode}
                        onChange={(e) => setProfileData(prev => ({ ...prev, countryCode: e.target.value }))}
                        className="bg-yellow-500 text-black px-3 py-2 rounded border-white/10"
                      >
                        {dialCodeOptions.map((opt) => (
                          <option key={`${opt.iso2}-${opt.dial}`} value={opt.dial}>
                            {opt.dial} ({opt.iso2})
                          </option>
                        ))}
                      </select>
                      <Input
                        value={profileData.phone}
                        onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        className="bg-[#0B1421] text-white border-white/10 flex-1"
                        placeholder="Your Phone Number"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/70">Country</Label>
                    <Input
                      value={profileData.country}
                      onChange={(e) => setProfileData(prev => ({ ...prev, country: e.target.value }))}
                      className="bg-[#0B1421] text-white border-white/10"
                      placeholder="Country"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400 mt-6"
                >
                  Submit
                </Button>
              </form>
            </div>
          )}

          {/* Wallets Page */}
          {activeView === 'wallets' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">User Coin Wallets</h2>
              <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-8">
                <p className="text-center text-red-500 text-lg">
                  You have no wallet yet, please buy some plan first
                </p>
              </div>
            </div>
          )}

          {/* 2FA Security Page */}
          {activeView === '2fa-security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Panel - Add Your Account */}
              <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-white">Add Your Account</h2>
                <p className="text-white/70">
                  Use the QR code or setup key on your Google Authenticator app to add your account.
                </p>
                <div className="flex items-center justify-center bg-[#0B1421] rounded-lg p-8 border border-white/10">
                  <div className="text-white/50 text-center">
                    <Lock className="h-16 w-16 mx-auto mb-2" />
                    <p>QR Code Placeholder</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Setup Key</Label>
                  <div className="flex gap-2">
                    <Input
                      value={setupKey}
                      readOnly
                      className="bg-[#0B1421] text-white border-white/10"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(setupKey);
                        toast({
                          title: 'Copied!',
                          description: 'Setup key copied to clipboard',
                        });
                      }}
                      className="bg-yellow-500 text-black hover:bg-yellow-400"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-yellow-400" />
                    <span className="text-white font-semibold">Help</span>
                  </div>
                  <p className="text-white/70 text-sm">
                    Google Authenticator is a multifactor app for mobile devices. It generates timed codes used during the 2-step verification process. To use Google Authenticator, install the Google Authenticator application on your mobile device.{' '}
                    <a href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                      Download
                    </a>
                  </p>
                </div>
              </div>

              {/* Right Panel - Enable 2FA Security */}
              <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-white">Enable 2FA Security</h2>
                <div className="space-y-2">
                  <Label className="text-white/70">Google Authenticator OTP</Label>
                  <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="bg-[#0B1421] text-white border-white/10"
                    placeholder="Enter the OTP"
                  />
                </div>
                <Button
                  onClick={async () => {
                    if (!otp) {
                      toast({
                        title: 'Error',
                        description: 'Please enter the OTP',
                        variant: 'destructive',
                      });
                      return;
                    }
                    // 2FA verification logic would go here
                    toast({
                      title: 'Success',
                      description: '2FA enabled successfully',
                    });
                    setOtp('');
                  }}
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  Submit
                </Button>
              </div>
            </div>
          )}

          {/* Change Password Page */}
          {activeView === 'change-password' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-white">Change Password</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (passwordData.newPassword !== passwordData.confirmPassword) {
                    toast({
                      title: 'Error',
                      description: 'New passwords do not match',
                      variant: 'destructive',
                    });
                    return;
                  }
                  if (passwordData.newPassword.length < 6) {
                    toast({
                      title: 'Error',
                      description: 'Password must be at least 6 characters',
                      variant: 'destructive',
                    });
                    return;
                  }
                  try {
                    if (user) {
                      // Update password using Supabase
                      const { error } = await supabase.auth.updateUser({
                        password: passwordData.newPassword
                      });
                      
                      if (error) throw error;
                      
                      toast({
                        title: 'Success',
                        description: 'Password changed successfully',
                      });
                      
                      setPasswordData({
                        currentPassword: '',
                        newPassword: '',
                        confirmPassword: '',
                      });
                    }
                  } catch (error: any) {
                    toast({
                      title: 'Error',
                      description: error.message || 'Failed to change password',
                      variant: 'destructive',
                    });
                  }
                }}
                className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-6 space-y-4 max-w-2xl"
              >
                <div className="space-y-2">
                  <Label className="text-white/70">Current Password</Label>
                  <Input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                    className="bg-[#0B1421] text-white border-white/10"
                    placeholder="Enter your current password"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                    className="bg-[#0B1421] text-white border-white/10"
                    placeholder="Enter your new password"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/70">Confirm New Password</Label>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                    className="bg-[#0B1421] text-white border-white/10"
                    placeholder="Confirm your new password"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                >
                  Change Password
                </Button>
              </form>
            </div>
          )}

          {/* Team Page */}
          {activeView === 'team' && (
            <div className="space-y-12 pb-12">
              {/* Core Leadership Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Core Leadership</h2>
                  <div className="w-16 h-0.5 bg-cyan-400"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Alexander Wright */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" 
                        alt="Alexander Wright"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">Alexander Wright</h3>
                    <p className="text-white/70 text-center mb-3">Founder & CEO</p>
                    <p className="text-white/80 text-sm text-left">
                      Former blockchain architect at Ethereum Foundation with 12+ years of experience in cryptocurrency mining operations. Alexander leads our strategic vision and technological innovation.
                    </p>
                  </div>
                  
                  {/* Sophia Smith */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop" 
                        alt="Sophia Smith"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">Sophia Smith</h3>
                    <p className="text-white/70 text-center mb-3">CTO & Head of Research</p>
                    <p className="text-white/80 text-sm text-left">
                      Computer science PhD with specialization in distributed systems. Sophia oversees our technological infrastructure and leads research into next-generation mining algorithms and hardware optimization.
                    </p>
                  </div>
                  
                  {/* Michael Rodriguez */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-32 h-32 mx-auto mb-4 rounded-full border-4 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop" 
                        alt="Michael Rodriguez"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-xl font-bold text-white text-center mb-2">Michael Rodriguez</h3>
                    <p className="text-white/70 text-center mb-3">COO & Strategic Partnerships</p>
                    <p className="text-white/80 text-sm text-left">
                      Former venture capitalist with extensive experience in scaling Web3 startups. Michael manages our operational efficiency and builds strategic relationships with key industry players.
                    </p>
                  </div>
                </div>
              </div>

              {/* Revolutionizing Crypto Mining Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-center">
                <div className="space-y-6 relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent blur-3xl"></div>
                  <div className="relative">
                    <h2 className="text-3xl font-bold text-white mb-4">Revolutionizing Crypto Mining</h2>
                    <p className="text-white/80 text-lg mb-8">
                      We're building the most efficient, sustainable, and profitable mining infrastructure for the decentralized future.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <div className="text-4xl font-bold text-white mb-2">250+</div>
                        <div className="text-white/70 text-sm">Mining Rigs</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-white mb-2">43%</div>
                        <div className="text-white/70 text-sm">Energy Efficiency</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-white mb-2">24/7</div>
                        <div className="text-white/70 text-sm">Technical Support</div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden border border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=600&h=600&fit=crop" 
                      alt="Cryptocurrency coins"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>

              {/* Our Team Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Our Team</h2>
                  <div className="w-16 h-0.5 bg-cyan-400"></div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* David Kim */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop" 
                        alt="David Kim"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white text-center mb-1">David Kim</h3>
                    <p className="text-white/70 text-center mb-3 text-sm">Backend Developer</p>
                    <p className="text-white/80 text-sm text-left">
                      Specializes in blockchain node architecture and mining pool optimization with 5+ years experience in the field.
                    </p>
                  </div>
                  
                  {/* Abraham Johnson */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop" 
                        alt="Abraham Johnson"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white text-center mb-1">Abraham Johnson</h3>
                    <p className="text-white/70 text-center mb-3 text-sm">Hardware Engineer</p>
                    <p className="text-white/80 text-sm text-left">
                      Expert in ASIC design and thermodynamics optimization. Previously worked at Bitmain developing mining hardware.
                    </p>
                  </div>
                  
                  {/* James Wilson */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop" 
                        alt="James Wilson"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white text-center mb-1">James Wilson</h3>
                    <p className="text-white/70 text-center mb-3 text-sm">Security Specialist</p>
                    <p className="text-white/80 text-sm text-left">
                      Blockchain security expert with background in cryptography and secure wallet implementations.
                    </p>
                  </div>
                  
                  {/* Jack Thompson */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop" 
                        alt="Jack Thompson"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white text-center mb-1">Jack Thompson</h3>
                    <p className="text-white/70 text-center mb-3 text-sm">Data Analyst</p>
                    <p className="text-white/80 text-sm text-left">
                      Market intelligence expert focused on cryptocurrency trends and mining profitability analysis.
                    </p>
                  </div>
                  
                  {/* Robert Williams */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop" 
                        alt="Robert Williams"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white text-center mb-1">Robert Williams</h3>
                    <p className="text-white/70 text-center mb-3 text-sm">Operations Manager</p>
                    <p className="text-white/80 text-sm text-left">
                      Logistics expert managing our global mining operations and ensuring seamless day-to-day functionality.
                    </p>
                  </div>
                  
                  {/* Olivia Martinez */}
                  <div className="bg-[#111B2D]/70 rounded-lg p-6 border border-white/5">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full border-2 border-cyan-400 overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop" 
                        alt="Olivia Martinez"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-bold text-white text-center mb-1">Olivia Martinez</h3>
                    <p className="text-white/70 text-center mb-3 text-sm">Client Relations</p>
                    <p className="text-white/80 text-sm text-left">
                      Handles investor communications and ensures exceptional customer experience across all touchpoints.
                    </p>
                  </div>
                </div>
              </div>

              {/* Supported Cryptocurrencies Section */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-white text-center">Supported Cryptocurrencies</h2>
                <div className="flex flex-wrap justify-center items-center gap-8">
                  {/* Bitcoin */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-yellow-500 flex items-center justify-center p-2">
                    <img 
                      src="https://assets.coingecko.com/coins/images/1/large/bitcoin.png" 
                      alt="Bitcoin"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.remove();
                      }}
                    />
                  </div>
                  {/* Ethereum */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-800 flex items-center justify-center p-2">
                    <img 
                      src="https://assets.coingecko.com/coins/images/279/large/ethereum.png" 
                      alt="Ethereum"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.remove();
                      }}
                    />
                  </div>
                  {/* Avalanche */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-red-600 flex items-center justify-center p-2">
                    <img 
                      src="https://assets.coingecko.com/coins/images/12559/large/avalanche-avax-logo.png" 
                      alt="Avalanche"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.remove();
                      }}
                    />
                  </div>
                  {/* Cardano */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-blue-900 flex items-center justify-center p-2">
                    <img 
                      src="https://assets.coingecko.com/coins/images/975/large/cardano.png" 
                      alt="Cardano"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.remove();
                      }}
                    />
                  </div>
                  {/* Polkadot */}
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-300 flex items-center justify-center p-2">
                    <img 
                      src="https://assets.coingecko.com/coins/images/12171/large/polkadot.png" 
                      alt="Polkadot"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.remove();
                      }}
                    />
                  </div>
                  {/* Solana */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 flex items-center justify-center p-2">
                    <img 
                      src="https://assets.coingecko.com/coins/images/4128/large/solana.png" 
                      alt="Solana"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement?.remove();
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Our Partners Section */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Our Partners</h2>
                  <div className="w-16 h-0.5 bg-cyan-400"></div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { name: 'Google', logo: 'https://cdn.simpleicons.org/google/4285F4' },
                    { name: 'YouTube', logo: 'https://cdn.simpleicons.org/youtube/FF0000' },
                    { name: 'Binance', logo: 'https://cdn.simpleicons.org/binance/F0B90B' },
                    { name: 'Coinbase', logo: 'https://cdn.simpleicons.org/coinbase/0052FF' },
                    { name: 'Chainlink', logo: 'https://cdn.simpleicons.org/chainlink/375BD2' },
                    { name: 'CoinPedia', logo: 'https://cdn.simpleicons.org/bitcoin/F7931A' },
                    { name: 'AMBCrypto', logo: 'https://cdn.simpleicons.org/bitcoin/F7931A' },
                  ].map((partner) => (
                    <div 
                      key={partner.name} 
                      className="bg-white rounded p-4 flex items-center justify-center h-20 hover:bg-gray-50 transition relative"
                    >
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain w-16 h-10"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector('.fallback-text')) {
                            const fallback = document.createElement('span');
                            fallback.className = 'fallback-text text-gray-600 text-xs font-semibold text-center';
                            fallback.textContent = partner.name;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                      <span className="fallback-text text-gray-600 text-xs font-semibold text-center hidden">
                        {partner.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* About Us Page */}
          {activeView === 'about-us' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold text-white mb-6">About Us</h1>
              
              <div className="space-y-6">
                {/* Mission Section */}
                <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">Our Mission</h2>
                  <p className="text-white/80 text-lg leading-relaxed">
                    BTCMining is one of the leading cryptocurrency mining platforms, offering cryptocurrency mining capacities in every range - for newcomers and experienced miners alike. Our mission is to make acquiring cryptocurrencies easy and fast for everyone.
                  </p>
                </div>
                
                {/* Company Overview */}
                <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">Company Overview</h2>
                  <div className="space-y-4 text-white/80">
                    <p>
                      As a wholly owned subsidiary of Digital Currency Group, we offer clients the opportunity to tap into our ecosystem. BTCMining has entered a deep strategic partnership agreement with Coinbase, the largest cryptocurrency exchange in the United States.
                    </p>
                    <p>
                      BTCMining already supports direct transfers from Coinbase exchange accounts to BTCMining accounts. If you are also a Coinbase client, you can choose Coinbase Payments when making payments.
                    </p>
                    <p>
                      The funds are supervised by Coinbase, a third-party listed company, ensuring the highest level of security and trust for our users.
                    </p>
                  </div>
                </div>
                
                {/* Why Choose Us */}
                <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">Why Choose BTCMining?</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="bg-[#0B1421] rounded-lg p-6 border border-white/5">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <Zap className="h-6 w-6 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">High Performance</h3>
                      <p className="text-white/70 text-sm">
                        Our state-of-the-art mining facilities ensure optimal hash rates and maximum profitability.
                      </p>
                    </div>
                    
                    <div className="bg-[#0B1421] rounded-lg p-6 border border-white/5">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <Lock className="h-6 w-6 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Secure & Trusted</h3>
                      <p className="text-white/70 text-sm">
                        Funds are supervised by Coinbase, providing enterprise-level security and peace of mind.
                      </p>
                    </div>
                    
                    <div className="bg-[#0B1421] rounded-lg p-6 border border-white/5">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <CircleDollarSign className="h-6 w-6 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">Daily Payouts</h3>
                      <p className="text-white/70 text-sm">
                        Receive your mining rewards daily with transparent and reliable payment processing.
                      </p>
                    </div>
                    
                    <div className="bg-[#0B1421] rounded-lg p-6 border border-white/5">
                      <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                        <Headphones className="h-6 w-6 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">24/7 Support</h3>
                      <p className="text-white/70 text-sm">
                        Our dedicated support team is available around the clock to assist you with any questions.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Statistics */}
                <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">Our Achievements</h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">100K+</div>
                      <div className="text-white/70">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">$50M+</div>
                      <div className="text-white/70">Mined Value</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">99.9%</div>
                      <div className="text-white/70">Uptime</div>
                    </div>
                    <div className="text-center">
                      <div className="text-4xl font-bold text-yellow-400 mb-2">150+</div>
                      <div className="text-white/70">Countries</div>
                    </div>
                  </div>
                </div>
                
                {/* Contact Section */}
                <div className="rounded-lg border border-white/5 bg-[#111B2D]/70 p-8">
                  <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
                  <p className="text-white/80 mb-6">
                    Have questions or want to learn more? We're here to help!
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-yellow-400" />
                      <a href="mailto:support@btcminingbase.com" className="text-white/70 hover:text-yellow-400 transition-colors">
                        support@btcminingbase.com
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <WhatsAppIcon className="h-5 w-5 text-yellow-400" />
                      <a 
                        href={WHATSAPP_LINK} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-yellow-400 transition-colors"
                      >
                        {WHATSAPP_DISPLAY}
                      </a>
                    </div>
                    <div className="flex items-center gap-3">
                      <TelegramIcon className="h-5 w-5 text-yellow-400" />
                      <a 
                        href="https://t.me/+dz1QVygXLJxlNzc0" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-white/70 hover:text-yellow-400 transition-colors"
                      >
                        Join Telegram Group
                      </a>
                    </div>
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-yellow-400 mt-1" />
                      <span className="text-white/70">
                        57 Kingfisher Grove, Willenhall, England, WV12 5HG
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dashboard View */}
          {activeView === 'dashboard' && (
            <>
          <section className="rounded-2xl border border-white/5 bg-[#111B2D]/70 p-6 text-sm leading-relaxed text-white/80">
            <h2 className="mb-3 text-lg font-semibold text-white">{copy.heroTitle}</h2>
            <p>{copy.heroBody1}</p>
            <p className="mt-3">{copy.heroBody2}</p>
            <p className="mt-3">{copy.heroBody3}</p>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-br from-[#1B2436] to-[#131B2B] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Balance</CardTitle>
                <CardDescription className="text-yellow-400">Deposit</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(miningStats?.total_mined)}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#1B2436] to-[#131B2B] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">Referral Bonus</CardTitle>
                <CardDescription className="text-yellow-400">My Referrals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatCurrency(referralBalance ?? profile?.referral_balance ?? 0)}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#1B2436] to-[#131B2B] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">BTC Mining</CardTitle>
                <CardDescription className="text-yellow-400">Start Mining</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-white/70">Start your Miner</p>
                <Button 
                  className="w-fit bg-yellow-500 text-black hover:bg-yellow-400"
                  onClick={() => navigate('/start-mining')}
                >
                  Start Mining
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 md:grid-cols-3">
            <Card className="border-white/5 bg-[#111B2D]/70">
              <CardHeader>
                <CardTitle className="text-white">Deposit</CardTitle>
                <CardDescription className="text-white/60">Secure Coinbase gateway</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                  onClick={() => navigate('/deposit')}
                >
                  {copy.depositCta}
                </Button>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-[#111B2D]/70">
              <CardHeader>
                <CardTitle className="text-white">Withdraw</CardTitle>
                <CardDescription className="text-white/60">Request payouts seamlessly</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400"
                  onClick={() => navigate('/withdraw')}
                >
                  {copy.withdrawCta}
                </Button>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6">
            <div className="rounded-2xl border border-white/5 bg-[#0F1A2B]/70 p-6">
              <h4 className="mb-4 text-xl font-semibold text-white">Account Information</h4>
              <div className="space-y-4 text-sm text-white/80">
                <div className="flex items-center justify-between rounded-xl bg-[#101B2C] p-3">
                  <p>Email</p>
                  <p>{profile?.email}</p>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#101B2C] p-3">
                  <p>Full Name</p>
                  <p>{profile?.full_name || 'Not set'}</p>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#101B2C] p-3 capitalize">
                  <p>Account Type</p>
                  <p>{profile?.role}</p>
                </div>
                <div className="flex items-center justify-between rounded-xl bg-[#101B2C] p-3">
                  <p>Member Since</p>
                  <p>{profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}</p>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-[#101B2C] p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/60">Need live help?</p>
                    <p className="text-white">VIP Customers Only</p>
                  </div>
                  <Button 
                    variant="outline" 
                    className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
                    onClick={() => setActiveView('support-new')}
                  >
                    <Headphones className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
                <p className="mt-4 text-sm text-white/50">support@btcminingbase.com</p>
                <p className="text-xs text-white/40">57 Kingfisher Grove, Willenhall, England, WV12 5HG (Company No. 15415402)</p>
              </div>
            </div>
          </section>

          <footer id="about-section" className="rounded-2xl border border-white/5 bg-[#0F1A2B]/70 p-6 text-sm text-white/70">
            <div className="grid gap-6 lg:grid-cols-3">
              <div>
                <h5 className="text-lg font-semibold text-white">BTCMining</h5>
                <p className="mt-2">
                  BTC Mining is one of the leading cryptocurrency mining platforms, offering capacities in every range for newcomers and pros.
                  Our mission is to make acquiring cryptocurrencies easy and fast for everyone.
                </p>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-white">Quick Links</h5>
                <ul className="mt-2 space-y-1">
                  <li>Team</li>
                  <li>AboutUs</li>
                  <li>Plans</li>
                </ul>
              </div>
              <div>
                <h5 className="text-lg font-semibold text-white">Useful Links</h5>
                <ul className="mt-2 space-y-1">
                  <li>Usage Policy</li>
                  <li>Cookie Policy</li>
                  <li>Privacy Policy</li>
                  <li>Terms of Service</li>
                </ul>
              </div>
            </div>
            <p className="mt-6 text-center text-xs text-white/40">Copyright © 2020–2026 BTC Mining All Rights Reserved</p>
          </footer>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

