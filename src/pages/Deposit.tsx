import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ArrowLeft,
  ChevronRight,
  CircleDollarSign,
  Copy,
  CreditCard,
  Gift,
  Home,
  List,
  LogOut,
  MessageSquare,
  Menu,
  Pickaxe,
  Plus,
  Shield,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

type DepositView = 'deposit' | 'log';
type DepositStage = 'form' | 'preview' | 'payment';
type GatewayValue = 'btc' | 'usdt-trc20' | 'usdt-erc20' | 'usdc' | 'eth';

interface GatewayOption {
  value: GatewayValue;
  label: string;
  currency: 'BTC' | 'USDT' | 'USDC' | 'ETH';
  network: string;
  min: number;
  max: number;
  coingeckoId?: string;
  description: string;
}

interface PreviewData {
  gateway: GatewayValue;
  gatewayLabel: string;
  amount: number;
  charge: number;
  payable: number;
  currency: 'BTC' | 'USDT' | 'USDC' | 'ETH';
  network: string;
  conversionRate: number;
  cryptoAmount: number;
}

const gatewayOptions: GatewayOption[] = [
  {
    value: 'btc',
    label: 'BTC',
    currency: 'BTC',
    network: 'Bitcoin',
    min: 100,
    max: 500000,
    coingeckoId: 'bitcoin',
    description: 'Instant confirmation on Bitcoin network',
  },
  {
    value: 'usdt-trc20',
    label: 'USDT.TRC20',
    currency: 'USDT',
    network: 'TRC20',
    min: 50,
    max: 250000,
    description: 'Fast & low cost payments on Tron network',
  },
  {
    value: 'usdt-erc20',
    label: 'USDT.ERC20',
    currency: 'USDT',
    network: 'ERC20',
    min: 100,
    max: 250000,
    description: 'USDT payments on Ethereum network',
  },
  {
    value: 'usdc',
    label: 'USDC',
    currency: 'USDC',
    network: 'ERC20',
    min: 100,
    max: 250000,
    description: 'USD Coin payments (1:1 USD)',
  },
  {
    value: 'eth',
    label: 'ETH',
    currency: 'ETH',
    network: 'Ethereum',
    min: 150,
    max: 500000,
    coingeckoId: 'ethereum',
    description: 'Native Ethereum deposits',
  },
];

const fallbackAddresses: Record<GatewayValue, string> = {
  btc: '163JAZy3CEz8YoNGDDtu9KxpXgnm5Kn9Rs',
  'usdt-trc20': 'THaAnBqAvQ3YY751nXqNDzCoczYVQtBKnP',
  'usdt-erc20': '0x8c0fd3fdc6f56e658fb1bffa8f5ddd65388ba690',
  usdc: '0x8c0fd3fdc6f56e658fb1bffa8f5ddd65388ba690',
  eth: '0x8c0fd3fdc6f56e658fb1bffa8f5ddd65388ba690',
};

const formatUSD = (value: number) =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

const formatCrypto = (value: number, decimals = 8) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

const getPaymentURI = (gateway: GatewayValue, address: string, amount: number) => {
  const formattedAmount = Number(amount || 0).toFixed(8);

  switch (gateway) {
    case 'btc':
      return `bitcoin:${address}?amount=${formattedAmount}`;
    case 'eth':
      return `ethereum:${address}?value=${formattedAmount}`;
    case 'usdt-trc20':
      return `tron:${address}?amount=${formattedAmount}`;
    case 'usdt-erc20':
    case 'usdc':
      return `ethereum:${address}?value=${formattedAmount}`;
    default:
      return address;
  }
};

const Deposit = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const initialView = (sessionStorage.getItem('/deposit_view') as DepositView) || 'deposit';
  const [activeView, setActiveView] = useState<DepositView>(initialView);

  useEffect(() => {
    if (initialView) {
      sessionStorage.removeItem('/deposit_view');
    }
  }, [initialView]);

  const [gateway, setGateway] = useState<GatewayValue | ''>('');
  const [amount, setAmount] = useState('');
  const [limit, setLimit] = useState({ min: 0, max: 0 });
  const [charge, setCharge] = useState(0);
  const [payable, setPayable] = useState(0);
  const [depositStage, setDepositStage] = useState<DepositStage>('form');
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [activeDeposit, setActiveDeposit] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const selectedGatewayOption = useMemo(
    () => gatewayOptions.find((option) => option.value === gateway),
    [gateway]
  );

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numericAmount = parseFloat(value) || 0;
    const calculatedCharge = numericAmount * 0.02;
    setCharge(calculatedCharge);
    setPayable(numericAmount + calculatedCharge);
  };

  const handleGatewayChange = (value: GatewayValue) => {
    setGateway(value);
    const config = gatewayOptions.find((option) => option.value === value);
    setLimit(config ? { min: config.min, max: config.max } : { min: 0, max: 0 });
    setAmount('');
    setCharge(0);
    setPayable(0);
    setDepositStage('form');
    setPreviewData(null);
    setActiveDeposit(null);
  };

  const fetchConversionRate = async (option: GatewayOption) => {
    if (option.currency === 'USDT' || option.currency === 'USDC') {
      return 1;
    }

    if (!option.coingeckoId) return 0;

    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${option.coingeckoId}&vs_currencies=usd`
      );
      const data = await response.json();
      return data?.[option.coingeckoId]?.usd || 0;
    } catch (error) {
      console.error('Conversion rate error:', error);
      return 0;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGatewayOption) {
      toast({
        title: 'Gateway required',
        description: 'Please select a payment method',
        variant: 'destructive',
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Enter a deposit amount greater than 0',
        variant: 'destructive',
      });
      return;
    }

    if (
      parseFloat(amount) < selectedGatewayOption.min ||
      parseFloat(amount) > selectedGatewayOption.max
    ) {
      toast({
        title: 'Amount outside limits',
        description: `Enter between ${formatUSD(selectedGatewayOption.min)} and ${formatUSD(
          selectedGatewayOption.max
        )}`,
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const conversionRate = await fetchConversionRate(selectedGatewayOption);
      if (!conversionRate) throw new Error('Unable to fetch live conversion rate');

      const cryptoAmount = payable / conversionRate;

      setPreviewData({
        gateway: selectedGatewayOption.value,
        gatewayLabel: selectedGatewayOption.label,
        amount: parseFloat(amount),
        charge,
        payable,
        currency: selectedGatewayOption.currency,
        network: selectedGatewayOption.network,
        conversionRate,
        cryptoAmount,
      });
      setDepositStage('preview');
    } catch (error: any) {
      toast({
        title: 'Preview unavailable',
        description: error.message || 'Failed to prepare payment preview',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    {
      label: 'Deposit',
      icon: Wallet,
      subItems: [
        { label: 'Deposit Now', path: '/deposit', view: 'deposit' },
        { label: 'Deposit Log', path: '/deposit', view: 'log' },
      ],
    },
    { label: 'Withdraw', icon: CircleDollarSign },
    { label: 'Start Mining', icon: Pickaxe },
    { label: 'Referral', icon: Gift },
    { label: 'Support Ticket', icon: MessageSquare },
    { label: 'My Account', icon: User },
  ];

  useEffect(() => {
    if (user && activeView === 'log') {
      fetchDeposits();
    }
  }, [user, activeView]);

  useEffect(() => {
    if (activeView === 'log') {
      setDepositStage('form');
      setPreviewData(null);
      setActiveDeposit(null);
    }
  }, [activeView]);

  const fetchDeposits = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('deposits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const handleConfirmPayment = async () => {
    if (!previewData || !user) return;
    setIsConfirming(true);

    try {
      const transactionId = `DEP${Date.now()}${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      const { data: addressRecord } = await supabase
        .from('deposit_addresses')
        .select('address')
        .eq('gateway', previewData.gateway)
        .eq('is_active', true)
        .single();

      const depositAddress =
        addressRecord?.address || fallbackAddresses[previewData.gateway] || 'N/A';

      const { data: createdDeposit, error } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          transaction_id: transactionId,
          gateway: previewData.gateway,
          amount: previewData.amount,
          charge: previewData.charge,
          payable: previewData.payable,
          status: 'pending',
          deposit_address: depositAddress,
          currency: previewData.currency,
          conversion_rate: previewData.conversionRate,
          crypto_amount: previewData.cryptoAmount,
        })
        .select('*')
        .single();

      if (error) throw error;

      setActiveDeposit({
        ...createdDeposit,
        gatewayLabel: previewData.gatewayLabel,
        network: previewData.network,
        currency: previewData.currency,
      });
      setDepositStage('payment');
      fetchDeposits();
    } catch (error: any) {
      toast({
        title: 'Unable to create payment',
        description: error.message || 'Please try again shortly.',
        variant: 'destructive',
      });
    } finally {
      setIsConfirming(false);
    }
  };

  const handleBackToForm = () => {
    setDepositStage('form');
    setPreviewData(null);
    setActiveDeposit(null);
  };

  const handleStartNewDeposit = () => {
    setDepositStage('form');
    setPreviewData(null);
    setActiveDeposit(null);
    setGateway('');
    setAmount('');
    setCharge(0);
    setPayable(0);
  };

  const copyToClipboard = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast({ title: 'Copied', description: 'Address copied to clipboard' });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Unable to copy address on this device',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <div className="flex">
        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
        
        {/* Sidebar - Hidden on mobile, shown as drawer */}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-64 min-h-screen bg-[#0F1A2B] border-r border-white/5 p-4 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          {/* Close button for mobile */}
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <span className="text-yellow-400 font-semibold">Menu</span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.subItems ? (
                  <div>
                    <div className="flex items-center justify-between px-4 py-3 text-yellow-400 font-medium">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </div>
                    </div>
                    <div className="ml-4 space-y-1">
                      {item.subItems.map((subItem) => (
                        <button
                          key={subItem.label}
                          onClick={() => {
                            if (subItem.view) {
                              setActiveView(subItem.view as 'deposit' | 'log');
                            } else {
                              navigate(subItem.path);
                            }
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                            (subItem.view === 'deposit' && activeView === 'deposit') ||
                            (subItem.view === 'log' && activeView === 'log')
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {subItem.view === 'deposit' ? (
                            <Plus className="h-4 w-4" />
                          ) : (
                            <List className="h-4 w-4" />
                          )}
                          {subItem.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      if (item.path) navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/5 transition"
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    <ChevronRight className="h-4 w-4 text-white/40" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {/* Header */}
          <header className="mb-4 sm:mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden text-white hover:bg-white/10"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              <h1 className="text-xl sm:text-2xl font-semibold">
                {activeView === 'deposit'
                  ? depositStage === 'preview'
                    ? 'Payment Preview'
                    : depositStage === 'payment'
                    ? 'Scan & Pay'
                    : 'Deposit Now'
                  : 'Deposit Log'}
              </h1>
            </div>
            <Button
              variant="outline"
              className="border-rose-500 text-rose-400 hover:bg-rose-500/10 text-sm px-3 lg:px-4"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </header>

          {activeView === 'deposit' ? (
            <div className="space-y-6">
              <div className="rounded-xl border border-[#1F3A52] bg-[#112035] p-6">
                <p className="text-sm uppercase tracking-[0.3em] text-white/60">Offer Only For Today</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#AEE6FF]">Boost every large deposit</h2>
                <ul className="mt-4 space-y-2 text-white/80">
                  <li>1. Deposits over 2,000 USD earn +3% bonus mining power</li>
                  <li>2. Deposits over 5,000 USD earn +5% bonus mining power</li>
                  <li>3. Deposits over 50,000 USD earn +10% bonus mining power</li>
                </ul>
              </div>

              {depositStage === 'form' && (
                <div className="rounded-xl border border-white/5 bg-[#111B2D] p-6">
                  <div className="mb-6 flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold">Deposit on Your USD Wallet</h2>
                      <p className="text-sm text-white/50">
                        Select a crypto gateway and enter the amount you want to add
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-white/60">
                      <Shield className="h-4 w-4 text-yellow-400" />
                      SSL encrypted payment instructions
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <Label className="mb-2 block text-white/80">Select Gateway *</Label>
                      <Select
                        value={gateway || undefined}
                        onValueChange={(value) => handleGatewayChange(value as GatewayValue)}
                      >
                        <SelectTrigger className="h-12 border-white/10 bg-[#0B1421] text-white">
                          <SelectValue placeholder="Select One" />
                        </SelectTrigger>
                        <SelectContent className="border-white/10 bg-[#0B1421] text-white">
                          {gatewayOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              <div>
                                <p className="font-medium">{option.label}</p>
                                <p className="text-xs text-white/50">{option.description}</p>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="mb-2 block text-white/80">Amount</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => handleAmountChange(e.target.value)}
                          placeholder="Enter amount"
                          className="h-12 flex-1 border-white/10 bg-[#0B1421] text-white"
                          min={limit.min}
                          max={limit.max}
                          step="0.01"
                        />
                        <Button type="button" className="h-12 bg-yellow-500 px-6 text-black hover:bg-yellow-400">
                          USD
                        </Button>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                      <div className="rounded-lg border border-white/10 bg-[#0B1421] p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">Limit</p>
                        <p className="mt-2 text-lg font-semibold">
                          {limit.min > 0 ? `${formatUSD(limit.min)} - ${formatUSD(limit.max)}` : 'Select gateway'}
                        </p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-[#0B1421] p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">Charge</p>
                        <p className="mt-2 text-lg font-semibold">{charge > 0 ? formatUSD(charge) : '$0.00'}</p>
                      </div>
                      <div className="rounded-lg border border-white/10 bg-[#0B1421] p-4">
                        <p className="text-xs uppercase tracking-wide text-white/50">Payable</p>
                        <p className="mt-2 text-lg font-semibold">{payable > 0 ? formatUSD(payable) : '$0.00'}</p>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 w-full bg-yellow-500 text-lg font-semibold text-black hover:bg-yellow-400"
                    >
                      {isSubmitting ? 'Preparing...' : 'Submit'}
                    </Button>
                  </form>
                </div>
              )}

              {depositStage === 'preview' && previewData && (
                <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-white/5 bg-[#111B2D] p-6">
                    <button
                      onClick={handleBackToForm}
                      className="mb-4 flex items-center gap-2 text-sm text-white/60 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" /> Edit amount
                    </button>
                    <h3 className="text-xl font-semibold text-white">Deposit Summary</h3>
                    <p className="text-sm text-white/60">Confirm the details before proceeding</p>
                    <div className="mt-6 space-y-3 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Gateway</span>
                        <span className="font-medium">{`${previewData.gatewayLabel} (${previewData.network})`}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Amount</span>
                        <span className="font-medium">{formatUSD(previewData.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Charge</span>
                        <span>{formatUSD(previewData.charge)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">Payable</span>
                        <span className="text-lg font-semibold text-yellow-400">{formatUSD(previewData.payable)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-white/5 bg-[#111B2D] p-6">
                    <div className="mb-4 flex items-center gap-2 text-sm text-white/60">
                      <CreditCard className="h-4 w-4 text-yellow-400" />
                      Payment Preview
                    </div>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-white/60">Amount</span>
                        <span className="font-medium">{formatUSD(previewData.amount)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-white/60">Charge</span>
                        <span className="font-medium">{formatUSD(previewData.charge)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-white/60">Payable</span>
                        <span className="font-semibold">{formatUSD(previewData.payable)}</span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-white/60">Conversion Rate</span>
                        <span>1 {previewData.currency} = {formatUSD(previewData.conversionRate)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/60">In {previewData.currency}</span>
                        <span className="text-lg font-semibold text-emerald-400">
                          {formatCrypto(previewData.cryptoAmount)} {previewData.currency}
                        </span>
                      </div>
                      <p className="mt-4 text-xs text-white/40">
                        Conversion is pulled live. Final crypto amount will be locked on the next step.
                      </p>
                      <Button
                        onClick={handleConfirmPayment}
                        disabled={isConfirming}
                        className="mt-4 h-12 w-full bg-yellow-500 text-black hover:bg-yellow-400"
                      >
                        {isConfirming ? 'Reserving address...' : 'Pay Now'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {depositStage === 'payment' && activeDeposit && (
                <div className="space-y-6">
                  <div className="rounded-xl border border-white/5 bg-[#111B2D] p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/60">Transaction ID</p>
                        <p className="font-mono text-lg text-yellow-400">{activeDeposit.transaction_id}</p>
                      </div>
                      <Button variant="outline" onClick={handleStartNewDeposit}>
                        Start new deposit
                      </Button>
                    </div>
                    <div className="mt-6 rounded-xl border border-white/10 bg-[#0D1727] p-6 text-center">
                      <p className="text-sm text-white/50">PLEASE SEND EXACTLY</p>
                      <p className="mt-2 text-3xl font-semibold text-emerald-400">
                        {formatCrypto(
                          typeof activeDeposit.crypto_amount === 'string'
                            ? parseFloat(activeDeposit.crypto_amount)
                            : activeDeposit.crypto_amount || 0
                        )}{' '}
                        {activeDeposit.currency || 'BTC'}
                      </p>
                      <p className="text-sm text-white/50">TO</p>
                      <div className="mt-4 flex items-center justify-center gap-2 text-sm">
                        <span className="font-mono text-[#FF7B7B]">{activeDeposit.deposit_address}</span>
                        <button
                          onClick={() => copyToClipboard(activeDeposit.deposit_address)}
                          className="rounded-md bg-yellow-500/20 p-2 text-yellow-400 transition hover:bg-yellow-500/30"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-6 flex flex-col items-center gap-4">
                        <div className="rounded-xl border border-white/10 bg-white p-4">
                          <img
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                              getPaymentURI(
                                activeDeposit.gateway as GatewayValue,
                                activeDeposit.deposit_address,
                                typeof activeDeposit.crypto_amount === 'string'
                                  ? parseFloat(activeDeposit.crypto_amount)
                                  : activeDeposit.crypto_amount || 0
                              )
                            )}`}
                            alt="Payment QR"
                            className="h-48 w-48 object-contain"
                          />
                        </div>
                        <p className="text-sm text-white/60">
                          Amount: {formatUSD(activeDeposit.payable)} | Network: {activeDeposit.network}
                        </p>
                      </div>
                      <p className="mt-4 text-xs text-white/40">
                        Scan the QR code or copy the address. The deposit will appear in your log once the payment is
                        detected on-chain.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-lg border border-white/5 bg-[#111B2D] p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="px-4 py-4 text-left font-semibold text-white/80">Transaction ID</th>
                      <th className="px-4 py-4 text-left font-semibold text-white/80">Gateway</th>
                      <th className="px-4 py-4 text-left font-semibold text-white/80">Amount</th>
                      <th className="px-4 py-4 text-left font-semibold text-white/80">Crypto</th>
                      <th className="px-4 py-4 text-left font-semibold text-white/80">Status</th>
                      <th className="px-4 py-4 text-left font-semibold text-white/80">Time</th>
                      <th className="px-4 py-4 text-left font-semibold text-white/80">More</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <p className="text-white/60 text-lg">
                            No wallet found yet?{' '}
                            <span
                              className="cursor-pointer text-yellow-400 hover:underline"
                              onClick={() => setActiveView('deposit')}
                            >
                              Deposit
                            </span>
                          </p>
                        </td>
                      </tr>
                    ) : (
                      deposits.map((deposit: any) => (
                        <tr key={deposit.id} className="border-b border-white/5">
                          <td className="px-4 py-4 font-mono text-sm text-white/80">{deposit.transaction_id}</td>
                          <td className="px-4 py-4 capitalize text-white/80">{deposit.gateway}</td>
                          <td className="px-4 py-4 text-white/80">
                            {formatUSD(
                              typeof deposit.amount === 'string'
                                ? parseFloat(deposit.amount)
                                : deposit.amount || 0
                            )}
                          </td>
                          <td className="px-4 py-4 text-white/80">
                            {deposit.crypto_amount
                              ? `${formatCrypto(
                                  typeof deposit.crypto_amount === 'string'
                                    ? parseFloat(deposit.crypto_amount)
                                    : deposit.crypto_amount,
                                  6
                                )} ${deposit.currency || ''}`
                              : '—'}
                          </td>
                          <td className="px-4 py-4">
                            <span
                              className={`rounded-full px-3 py-1 text-xs capitalize ${
                                deposit.status === 'completed'
                                  ? 'bg-green-500/20 text-green-400'
                                  : deposit.status === 'pending' || deposit.status === 'processing'
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-red-500/20 text-red-400'
                              }`}
                            >
                              {deposit.status}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-white/80">
                            {new Date(deposit.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-4">
                            <Button variant="ghost" className="text-yellow-400 hover:text-yellow-300">
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
          )}
        </main>
      </div>
    </div>
  );
};

export default Deposit;

