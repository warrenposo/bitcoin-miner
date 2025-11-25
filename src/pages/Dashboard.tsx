import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Home,
  Wallet,
  ArrowRight,
  ChevronRight,
  Pickaxe,
  Gift,
  MessageSquare,
  Headphones,
  User,
  Send,
  Zap,
  CircleDollarSign,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface MiningStats {
  hash_rate: number;
  total_mined: number;
  daily_earnings: number;
}

interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  admin_response: string | null;
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

const Dashboard = () => {
  const { user, profile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [miningStats, setMiningStats] = useState<MiningStats | null>(null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [language, setLanguage] = useState<LanguageKey>('en');

  const copy = translations[language];

  useEffect(() => {
    const loadDashboard = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (isAdmin) {
        navigate('/admin', { replace: true });
        return;
      }

      await fetchData();
    };

    loadDashboard();
  }, [user, isAdmin, navigate]);

  const fetchData = async () => {
    try {
      // Fetch mining stats
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

      // Fetch support tickets
      const { data: userTickets } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (userTickets) setTickets(userTickets);
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

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          subject: ticketSubject,
          message: ticketMessage,
          status: 'open',
          priority: 'medium',
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Support ticket created successfully',
      });

      setTicketSubject('');
      setTicketMessage('');
      setShowTicketForm(false);
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create ticket',
        variant: 'destructive',
      });
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

  const menuItems = [
    { label: 'Dashboard', icon: Home, active: true },
    { label: 'Deposit', icon: Wallet },
    { label: 'Withdraw', icon: CircleDollarSign },
    { label: 'Start Mining', icon: Pickaxe },
    { label: 'Referral', icon: Gift },
    { label: 'Support Ticket', icon: MessageSquare },
    { label: 'My Account', icon: User },
  ];

  const latestPlans = [
    { order: '#00145', name: 'Starter Plan', totalDays: 15, remaining: 15, status: 'Pending' },
    { order: '#00112', name: 'Silver Plan', totalDays: 30, remaining: 7, status: 'Running' },
  ];

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
      <header className="border-b border-white/5 bg-[#0F1A2B]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-[#f97316] px-2 py-1 text-sm font-bold">BTC</span>
            <div className="text-xl font-semibold">BTCMining</div>
          </div>
          <nav className="hidden gap-8 text-sm font-medium md:flex">
            <button className="text-white/80 hover:text-white" onClick={handleHomeClick}>
              Home
            </button>
            <button className="text-white/80 hover:text-white" onClick={handleTeamClick}>
              Team
            </button>
            <button className="text-white/80 hover:text-white" onClick={handleAboutClick}>
              AboutUs
            </button>
          </nav>
          <div className="flex items-center gap-4">
            <select
              className="rounded-md bg-transparent px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10"
              value={language}
              onChange={(e) => setLanguage(e.target.value as LanguageKey)}
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
            <Button className="bg-rose-500 hover:bg-rose-600" onClick={handleSignOut}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 lg:flex-row">
        <aside className="w-full rounded-2xl border border-white/5 bg-[#0F1A2B]/80 p-6 lg:w-64">
          <div className="space-y-4">
            {menuItems.map((item) => (
              <button
                key={item.label}
                className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-medium transition ${
                  item.active ? 'bg-gradient-to-r from-yellow-500/20 to-transparent text-yellow-400' : 'text-white/70 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </span>
                <ChevronRight className="h-4 w-4 text-white/40" />
              </button>
            ))}
          </div>
        </aside>

        <main className="flex-1 space-y-6">
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
                <p className="text-3xl font-bold">0 USD</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-[#1B2436] to-[#131B2B] border-white/5">
              <CardHeader className="pb-2">
                <CardTitle className="text-white">BTC Mining</CardTitle>
                <CardDescription className="text-yellow-400">Start Mining</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-white/70">Start your Miner</p>
                <Button className="w-fit bg-yellow-500 text-black hover:bg-yellow-400">Start Mining</Button>
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
                <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400">{copy.depositCta}</Button>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-[#111B2D]/70">
              <CardHeader>
                <CardTitle className="text-white">Withdraw</CardTitle>
                <CardDescription className="text-white/60">Request payouts seamlessly</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400">{copy.withdrawCta}</Button>
              </CardContent>
            </Card>
            <Card className="border-white/5 bg-[#111B2D]/70">
              <CardHeader>
                <CardTitle className="text-white">Download App</CardTitle>
                <CardDescription className="text-white/60">Manage mining on mobile</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400">{copy.appDownload}</Button>
              </CardContent>
            </Card>
          </section>

          <section className="rounded-2xl border border-white/5 bg-[#111B2D]/70 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white">Latest Purchased Plans</h3>
              <Button variant="ghost" className="text-yellow-400">
                View All <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/80">
                <thead className="text-white/60">
                  <tr>
                    <th className="py-3">Order</th>
                    <th>Scheme Name</th>
                    <th>Total Days</th>
                    <th>Remaining Days</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {latestPlans.map((plan) => (
                    <tr key={plan.order} className="border-t border-white/5">
                      <td className="py-3">{plan.order}</td>
                      <td>{plan.name}</td>
                      <td>{plan.totalDays}</td>
                      <td>{plan.remaining}</td>
                      <td>
                        <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-xs text-yellow-400">{plan.status}</span>
                      </td>
                      <td>
                        <button className="text-yellow-400">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-8 rounded-xl border border-white/5 p-6">
              <div className="mb-4 flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">Active Miner</h4>
                <Button variant="ghost" className="text-yellow-400">
                  Start Mining
                </Button>
              </div>
              <div className="grid gap-4 text-sm text-white/70 md:grid-cols-4">
                <div>
                  <p className="text-white/50">Wallet Name</p>
                  <p>No miner connection</p>
                </div>
                <div>
                  <p className="text-white/50">Miner status</p>
                  <p>Disconnected</p>
                </div>
                <div>
                  <p className="text-white/50">Block Hash</p>
                  <p>—</p>
                </div>
                <div>
                  <p className="text-white/50">Balance</p>
                  <p>0.00 USD</p>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/5 bg-[#0F1A2B]/70 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Need help?</p>
                  <h4 className="text-xl font-semibold text-white">Support Ticket</h4>
                </div>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-400" onClick={() => setShowTicketForm(true)}>
                  <MessageSquare className="mr-2 h-4 w-4" />
                  New Ticket
                </Button>
              </div>
              {showTicketForm && (
                <form onSubmit={handleCreateTicket} className="space-y-3 rounded-xl bg-[#101B2C] p-4">
                  <div>
                    <Label className="text-white/70" htmlFor="subject">
                      Subject
                    </Label>
                    <Input
                      id="subject"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      required
                      className="bg-[#0B1421] text-white"
                      placeholder="Enter ticket subject"
                    />
                  </div>
                  <div>
                    <Label className="text-white/70" htmlFor="message">
                      Message
                    </Label>
                    <Textarea
                      id="message"
                      value={ticketMessage}
                      onChange={(e) => setTicketMessage(e.target.value)}
                      required
                      rows={4}
                      className="bg-[#0B1421] text-white"
                      placeholder="Describe your issue..."
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button type="submit" className="bg-yellow-500 text-black hover:bg-yellow-400">
                      Submit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="border-white/20 text-white/80 hover:bg-white/10"
                      onClick={() => {
                        setShowTicketForm(false);
                        setTicketSubject('');
                        setTicketMessage('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}

              <div className="space-y-3">
                {tickets.length === 0 ? (
                  <p className="text-center text-white/50">No support tickets yet</p>
                ) : (
                  tickets.map((ticket) => (
                    <div key={ticket.id} className="rounded-xl border border-white/5 bg-[#101B2C] p-4 text-sm">
                      <div className="mb-2 flex items-center justify-between">
                        <p className="font-semibold text-white">{ticket.subject}</p>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/70">{ticket.status}</span>
                      </div>
                      <p className="text-white/70">{ticket.message}</p>
                      <p className="mt-2 text-xs text-white/40">{new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

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
                  <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
                    <Headphones className="mr-2 h-4 w-4" />
                    Contact Support
                  </Button>
                </div>
                <p className="mt-4 text-sm text-white/50">[email protected]</p>
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
            <p className="mt-6 text-center text-xs text-white/40">Copyright © 2020–2025 BTC Mining All Rights Reserved</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

