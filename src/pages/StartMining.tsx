import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  ShoppingCart,
  List,
  LogOut,
  Copy,
  ArrowLeft,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { UserSidebar } from '@/components/UserSidebar';

interface MiningPlan {
  id: string;
  name: string;
  price: number;
  duration: number;
  hardware: string;
  dailyMining: { btc?: number; ltc?: number; usd: number };
  monthlyMining?: { btc?: number; ltc?: number; usd: number };
  totalMining?: { btc?: number; ltc?: number; usd: number };
  referralRewards?: number;
  available: number;
  sold: number;
  currency: 'BTC' | 'LTC';
}

interface PurchasedPlan {
  id: string;
  sn: number;
  planName: string;
  price: number;
  returnPerDay: { min: number; max: number; currency: string };
  totalDays: number;
  remainingDays: number;
  status: 'pending' | 'active' | 'completed' | 'expired';
  purchasedDate: string;
  miner: string;
  fixedReturn: number;
}

type PurchaseStage = 'form' | 'preview' | 'payment';
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
  plan: MiningPlan;
}

const StartMining = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  // Check if there's a view preference from navigation
  const initialView = (sessionStorage.getItem('/start-mining_view') as 'buy' | 'purchased') || 'buy';
  const [activeView, setActiveView] = useState<'buy' | 'purchased'>(initialView);
  
  // Clear the view preference after using it
  useEffect(() => {
    if (initialView) {
      sessionStorage.removeItem('/start-mining_view');
    }
  }, []);

  // Listen for view changes from menu when already on this page
  useEffect(() => {
    const checkView = () => {
      const storedView = sessionStorage.getItem('/start-mining_view');
      if (storedView && (storedView === 'buy' || storedView === 'purchased')) {
        setActiveView(storedView as 'buy' | 'purchased');
        sessionStorage.removeItem('/start-mining_view');
      }
    };
    
    // Check immediately
    checkView();
    
    // Also listen for storage events (when navigating from same page)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === '/start-mining_view' && e.newValue) {
        if (e.newValue === 'buy' || e.newValue === 'purchased') {
          setActiveView(e.newValue as 'buy' | 'purchased');
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);
  const [selectedCurrency, setSelectedCurrency] = useState<'BTC' | 'LTC'>('BTC');
  const [btcPrice, setBtcPrice] = useState(109122.76);
  const [ltcPrice, setLtcPrice] = useState(88.12);
  
  // Purchase flow state
  const [selectedPlan, setSelectedPlan] = useState<MiningPlan | null>(null);
  const [purchaseStage, setPurchaseStage] = useState<PurchaseStage>('form');
  const [gateway, setGateway] = useState<GatewayValue | ''>('');
  const [charge, setCharge] = useState(0);
  const [payable, setPayable] = useState(0);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [activePurchase, setActivePurchase] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  // BTC Plans
  const btcPlans: MiningPlan[] = [
    {
      id: 'promotions',
      name: 'PROMOTIONS',
      price: 50,
      duration: 1,
      hardware: 'Antminer S19',
      totalMining: { btc: 0.00190, usd: 225.00 },
      available: 4000,
      sold: 652,
      currency: 'BTC',
    },
    {
      id: 'new-beginner',
      name: 'NEW BEGINNER',
      price: 70,
      duration: 7,
      hardware: 'Antminer S19',
      totalMining: { btc: 0.001347, usd: 350.00 },
      available: 4000,
      sold: 652,
      currency: 'BTC',
    },
    {
      id: 'basic',
      name: 'BASIC',
      price: 200,
      duration: 90,
      hardware: 'Antminer S19',
      totalMining: { btc: 0.008938, usd: 650.30 },
      available: 4000,
      sold: 452,
      currency: 'BTC',
    },
    {
      id: 'economy',
      name: 'ECONOMY',
      price: 400,
      duration: 2,
      hardware: 'Antminer S19',
      totalMining: { btc: 0.030351, usd: 1200.00 },
      referralRewards: 72.8,
      available: 3000,
      sold: 2154,
      currency: 'BTC',
    },
    {
      id: 'standart',
      name: 'STANDARD',
      price: 2400,
      duration: 365,
      hardware: 'Antminer S19',
      dailyMining: { btc: 0.003734, usd: 407.50 },
      monthlyMining: { btc: 0.112030, usd: 12225.00 },
      referralRewards: 240,
      available: 2000,
      sold: 1096,
      currency: 'BTC',
    },
    {
      id: 'senior',
      name: 'SENIOR',
      price: 6500,
      duration: 365,
      hardware: 'Antminer S19',
      dailyMining: { btc: 0.015652, usd: 1708.00 },
      monthlyMining: { btc: 0.469563, usd: 51240.00 },
      referralRewards: 650,
      available: 1000,
      sold: 800,
      currency: 'BTC',
    },
    {
      id: 'advanced',
      name: 'ADVANCED',
      price: 12600,
      duration: 365,
      hardware: 'Antminer S19',
      dailyMining: { btc: 0.042764, usd: 4666.50 },
      monthlyMining: { btc: 1.282913, usd: 139995.00 },
      referralRewards: 1260,
      available: 800,
      sold: 461,
      currency: 'BTC',
    },
    {
      id: 'luxurious',
      name: 'LUXURIOUS',
      price: 32000,
      duration: 365,
      hardware: 'Antminer S19',
      dailyMining: { btc: 0.119498, usd: 13040.00 },
      monthlyMining: { btc: 3.584953, usd: 391200.00 },
      referralRewards: 3200,
      available: 300,
      sold: 177,
      currency: 'BTC',
    },
    {
      id: 'vip1',
      name: 'Vip 1',
      price: 72000,
      duration: 365,
      hardware: 'Antminer S19',
      dailyMining: { btc: 0.445645, usd: 48630.00 },
      monthlyMining: { btc: 13.3693, usd: 1458900.00 },
      referralRewards: 7200,
      available: 300,
      sold: 174,
      currency: 'BTC',
    },
    {
      id: 'vip3',
      name: 'VIP3',
      price: 169800,
      duration: 365,
      hardware: 'Antminer S19',
      dailyMining: { btc: 0.995393, usd: 108620.00 },
      monthlyMining: { btc: 29.8618, usd: 3258600.00 },
      referralRewards: 16980,
      available: 300,
      sold: 278,
      currency: 'BTC',
    },
  ];

  // LTC Plans
  const ltcPlans: MiningPlan[] = [
    {
      id: 'activity-award',
      name: 'Activity Award',
      price: 200,
      duration: 365,
      hardware: 'Antminer L3+',
      dailyMining: { ltc: 0.076033, usd: 6.70 },
      monthlyMining: { ltc: 2.280997, usd: 201.00 },
      available: 5000,
      sold: 1977,
      currency: 'LTC',
    },
    {
      id: 'basic-ltc',
      name: 'BASIC',
      price: 1000,
      duration: 365,
      hardware: 'Antminer L3+',
      dailyMining: { ltc: 0.465278, usd: 41.00 },
      monthlyMining: { ltc: 13.958343, usd: 1230.00 },
      available: 3000,
      sold: 2817,
      currency: 'LTC',
    },
    {
      id: 'standart-ltc',
      name: 'STANDARD',
      price: 3000,
      duration: 365,
      hardware: 'Antminer L3+',
      dailyMining: { ltc: 2.360435, usd: 208.00 },
      monthlyMining: { ltc: 70.813056, usd: 6240.00 },
      available: 1000,
      sold: 971,
      currency: 'LTC',
    },
    {
      id: 'luxurious-ltc',
      name: 'LUXURIOUS',
      price: 15000,
      duration: 365,
      hardware: 'Antminer L3+',
      dailyMining: { ltc: 18.384159, usd: 1620.00 },
      monthlyMining: { ltc: 551.524765, usd: 48600.00 },
      available: 500,
      sold: 470,
      currency: 'LTC',
    },
  ];

  const currentPlans = selectedCurrency === 'BTC' ? btcPlans : ltcPlans;
  const currentPrice = selectedCurrency === 'BTC' ? btcPrice : ltcPrice;

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

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

  const selectedGatewayOption = useMemo(
    () => gatewayOptions.find((option) => option.value === gateway),
    [gateway]
  );

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

  const handleBuyPlan = (plan: MiningPlan) => {
    setSelectedPlan(plan);
    setPurchaseStage('form');
    // Calculate charge (2% of plan price)
    const calculatedCharge = plan.price * 0.02;
    setCharge(calculatedCharge);
    setPayable(plan.price + calculatedCharge);
    setGateway('');
    setPreviewData(null);
    setActivePurchase(null);
  };

  const handleGatewayChange = (value: GatewayValue) => {
    setGateway(value);
    const config = gatewayOptions.find((option) => option.value === value);
    if (config && selectedPlan) {
      // Validate plan price is within limits
      if (selectedPlan.price < config.min || selectedPlan.price > config.max) {
        toast({
          title: 'Plan price outside limits',
          description: `This payment method requires amounts between ${formatUSD(config.min)} and ${formatUSD(config.max)}`,
          variant: 'destructive',
        });
        setGateway('');
        return;
      }
    }
  };

  const handleSubmitPurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPlan) {
      toast({
        title: 'No plan selected',
        description: 'Please select a plan first',
        variant: 'destructive',
      });
      return;
    }

    if (!selectedGatewayOption) {
      toast({
        title: 'Payment method required',
        description: 'Please select a payment method',
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
        amount: selectedPlan.price,
        charge,
        payable,
        currency: selectedGatewayOption.currency,
        network: selectedGatewayOption.network,
        conversionRate,
        cryptoAmount,
        plan: selectedPlan,
      });
      setPurchaseStage('preview');
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

  const handleConfirmPayment = async () => {
    if (!previewData || !user || !selectedPlan) return;
    setIsConfirming(true);

    try {
      const transactionId = `PLAN${Date.now()}${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      const { data: addressRecord } = await supabase
        .from('deposit_addresses')
        .select('address')
        .eq('gateway', previewData.gateway)
        .eq('is_active', true)
        .single();

      const paymentAddress =
        addressRecord?.address || fallbackAddresses[previewData.gateway] || 'N/A';

      // First, create a deposit record for the payment
      const { data: createdDeposit, error: depositError } = await supabase
        .from('deposits')
        .insert({
          user_id: user.id,
          transaction_id: transactionId,
          gateway: previewData.gateway,
          amount: previewData.amount,
          charge: previewData.charge,
          payable: previewData.payable,
          status: 'pending',
          deposit_address: paymentAddress,
          currency: previewData.currency,
          conversion_rate: previewData.conversionRate,
          crypto_amount: previewData.cryptoAmount,
        })
        .select('*')
        .single();

      if (depositError) throw depositError;

      // Find or create mining plan in database
      const { data: existingPlan } = await supabase
        .from('mining_plans')
        .select('id')
        .eq('name', selectedPlan.name)
        .eq('currency', selectedPlan.currency)
        .single();

      let planId = existingPlan?.id;

      // If plan doesn't exist, create it
      if (!planId) {
        const { data: newPlan, error: planError } = await supabase
          .from('mining_plans')
          .insert({
            name: selectedPlan.name,
            currency: selectedPlan.currency,
            price: selectedPlan.price,
            duration: selectedPlan.duration,
            hardware: selectedPlan.hardware,
            daily_mining_btc: selectedPlan.dailyMining?.btc,
            daily_mining_ltc: selectedPlan.dailyMining?.ltc,
            daily_mining_usd: selectedPlan.dailyMining?.usd,
            monthly_mining_btc: selectedPlan.monthlyMining?.btc,
            monthly_mining_ltc: selectedPlan.monthlyMining?.ltc,
            monthly_mining_usd: selectedPlan.monthlyMining?.usd,
            total_mining_btc: selectedPlan.totalMining?.btc,
            total_mining_ltc: selectedPlan.totalMining?.ltc,
            total_mining_usd: selectedPlan.totalMining?.usd,
            referral_rewards: selectedPlan.referralRewards,
            available: selectedPlan.available,
            sold: selectedPlan.sold,
            is_active: true,
          })
          .select('id')
          .single();

        if (planError) throw planError;
        planId = newPlan.id;
      }

      // Calculate return per day (min and max based on plan)
      const returnPerDayMin = selectedPlan.dailyMining?.btc || selectedPlan.dailyMining?.ltc || 0;
      const returnPerDayMax = returnPerDayMin * 1.5; // Assume 50% variance

      // Create user_plans record
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + selectedPlan.duration);

      const { data: createdUserPlan, error: planPurchaseError } = await supabase
        .from('user_plans')
        .insert({
          user_id: user.id,
          plan_id: planId,
          plan_name: selectedPlan.name,
          price: selectedPlan.price,
          currency: selectedPlan.currency,
          return_per_day_min: returnPerDayMin,
          return_per_day_max: returnPerDayMax,
          total_days: selectedPlan.duration,
          remaining_days: selectedPlan.duration,
          fixed_return: 0,
          status: 'pending',
          expires_at: expiresAt.toISOString(),
        })
        .select('*')
        .single();

      if (planPurchaseError) throw planPurchaseError;

      setActivePurchase({
        ...createdDeposit,
        gatewayLabel: previewData.gatewayLabel,
        network: previewData.network,
        currency: previewData.currency,
        userPlan: createdUserPlan,
      });
      setPurchaseStage('payment');
      
      toast({
        title: 'Payment created',
        description: 'Please complete the payment to activate your mining plan',
      });
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
    setPurchaseStage('form');
    setPreviewData(null);
    setActivePurchase(null);
  };

  const handleStartNewPurchase = () => {
    setPurchaseStage('form');
    setPreviewData(null);
    setActivePurchase(null);
    setSelectedPlan(null);
    setGateway('');
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


  const [selectedPurchasedPlan, setSelectedPurchasedPlan] = useState<PurchasedPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [purchasedPlans, setPurchasedPlans] = useState<PurchasedPlan[]>([]);

  // Fetch purchased plans from database
  useEffect(() => {
    if (user && activeView === 'purchased') {
      fetchPurchasedPlans();
    }
  }, [user, activeView]);

  const fetchPurchasedPlans = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('purchased_date', { ascending: false });

      if (error) throw error;

      // Transform database records to PurchasedPlan format
      const transformedPlans: PurchasedPlan[] = (data || []).map((plan, index) => ({
        id: plan.id,
        sn: index + 1,
        planName: plan.plan_name,
        price: parseFloat(plan.price),
        returnPerDay: {
          min: parseFloat(plan.return_per_day_min || 0),
          max: parseFloat(plan.return_per_day_max || 0),
          currency: plan.currency,
        },
        totalDays: plan.total_days,
        remainingDays: plan.remaining_days,
        status: plan.status as 'pending' | 'active' | 'completed' | 'expired',
        purchasedDate: new Date(plan.purchased_date).toLocaleDateString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        }),
        miner: plan.currency,
        fixedReturn: parseFloat(plan.fixed_return || 0),
      }));

      setPurchasedPlans(transformedPlans);
    } catch (error) {
      console.error('Error fetching purchased plans:', error);
      toast({
        title: 'Error',
        description: 'Failed to load purchased plans',
        variant: 'destructive',
      });
    }
  };

  const handleViewChange = (view: string) => {
    if (view === 'buy' || view === 'purchased') {
      setActiveView(view as 'buy' | 'purchased');
      // Clear sessionStorage if it was set
      sessionStorage.removeItem('/start-mining_view');
    }
  };

  // Listen for custom viewchange events
  useEffect(() => {
    const handleViewChangeEvent = (e: CustomEvent) => {
      const view = e.detail?.view;
      if (view === 'buy' || view === 'purchased') {
        setActiveView(view as 'buy' | 'purchased');
      }
    };
    
    window.addEventListener('viewchange', handleViewChangeEvent as EventListener);
    return () => window.removeEventListener('viewchange', handleViewChangeEvent as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <div className="flex">
        <UserSidebar 
          activeView={activeView === 'buy' ? 'buy' : activeView === 'purchased' ? 'purchased' : undefined}
          onViewChange={handleViewChange}
          onSignOut={handleSignOut}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          {/* Header */}
          <header className="mb-4 sm:mb-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-semibold">
                {activeView === 'buy' 
                  ? purchaseStage === 'preview'
                    ? 'Payment Preview'
                    : purchaseStage === 'payment'
                    ? 'Scan & Pay'
                    : 'Buy Plan'
                  : 'Purchased Plans'}
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

          {activeView === 'buy' ? (
            /* Buy Plan View */
            <div className="space-y-6">
              {/* Info Banner */}
              <div className="bg-[#1E3A5F] border border-[#2E5A8F] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#87CEEB] mb-4">
                  Your selected mining contract Is activated automatically once your payment Is confirmed.
                </h2>
                <div className="space-y-3 text-white/90 text-sm">
                  <p>
                    Mining income is released once a day. You can withdraw the output at any time (without waiting for the end of the contract) There is no limit to the number of withdrawals
                  </p>
                  <p>You can have the fastest bitcoin miner in 5 minutes:</p>
                  <ol className="list-decimal list-inside space-y-1 ml-4">
                    <li>Choose one of the below miners</li>
                    <li>Click on "Buy Now" button and pay the miner price</li>
                    <li>Your miner is launched and adds bitcoin to your balance every second (until 1 year)</li>
                    <li>Your bitcoin increase every minute and you can withdraw it or buy a new bigger miner</li>
                  </ol>
                  <p>
                    USDT. The profit of USDT Plans comes from intelligent quantitative trading strategies. Daily earnings may fluctuate based on Binance trading depth. The contract period is only one day, so you can withdraw all your funds the next day. There will be no automatic re-investment after the contract expires. If you need to re-invest, you need to manually purchase the plan again.
                  </p>
                </div>
              </div>

              {/* Currency Tabs */}
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => setSelectedCurrency('BTC')}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    selectedCurrency === 'BTC'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-[#0F1A2B] text-white/70 hover:text-white'
                  }`}
                >
                  BTC
                </button>
                <button
                  onClick={() => setSelectedCurrency('LTC')}
                  className={`px-6 py-3 rounded-lg font-semibold transition ${
                    selectedCurrency === 'LTC'
                      ? 'bg-yellow-500 text-black'
                      : 'bg-[#0F1A2B] text-white/70 hover:text-white'
                  }`}
                >
                  LTC
                </button>
                <div className="ml-4 text-lg font-semibold">
                  {selectedCurrency}≈${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Mining Plans Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {currentPlans.map((plan) => {
                  const progress = (plan.sold / plan.available) * 100;
                  const remaining = plan.available - plan.sold;

                  return (
                    <Card key={plan.id} className="bg-[#111B2D] border-white/5 overflow-hidden">
                      {/* Header */}
                      <div className="bg-yellow-500 p-4">
                        <div className="text-white text-sm font-semibold mb-2">{plan.name}</div>
                        <div className="text-white text-2xl font-bold">
                          ${plan.price.toLocaleString()}
                          <span className="text-lg font-normal"> / {plan.duration} {plan.duration === 1 ? 'Day' : 'Days'}</span>
                        </div>
                      </div>

                      {/* Body */}
                      <CardContent className="p-4 space-y-3">
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Hardware: {plan.hardware}</span>
                        </div>
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>Contract duration: {plan.duration} {plan.duration === 1 ? 'day' : 'days'}</span>
                        </div>
                        {plan.totalMining && (
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>
                              Total mining: {plan.totalMining.btc?.toFixed(6) || plan.totalMining.ltc?.toFixed(6)} {selectedCurrency}=${plan.totalMining.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {plan.dailyMining && (
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>
                              Daily mining: {plan.dailyMining.btc?.toFixed(6) || plan.dailyMining.ltc?.toFixed(6)} {selectedCurrency}=${plan.dailyMining.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {plan.monthlyMining && (
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>
                              Monthly mining: {plan.monthlyMining.btc?.toFixed(6) || plan.monthlyMining.ltc?.toFixed(6)} {selectedCurrency}=${plan.monthlyMining.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {plan.referralRewards && (
                          <div className="flex items-center gap-2 text-white/80 text-sm">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                            <span>Referral Rewards: {plan.referralRewards} USDT</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                          <span>
                            Purchase Agreement: <span className="text-red-400 cursor-pointer hover:underline">View all</span>
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-white/60">
                            <span>{plan.available} / {plan.sold} ({progress.toFixed(1)}%)</span>
                          </div>
                          <div className="relative h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 left-0 h-full bg-yellow-500 transition-all"
                              style={{ width: `${progress}%` }}
                            ></div>
                          </div>
                        </div>

                        {/* Buy Now Button */}
                        <Button
                          onClick={() => handleBuyPlan(plan)}
                          className="w-full bg-yellow-500 text-black hover:bg-yellow-400 font-semibold"
                        >
                          Buy Now
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* Our Partners Section */}
              {purchaseStage === 'form' && !selectedPlan && (
                <div className="mt-12">
                <h2 className="text-2xl font-bold text-center mb-8">Our Partners</h2>
                <div className="grid grid-cols-5 gap-4">
                  {[
                    { name: 'Google', logo: 'https://logo.clearbit.com/google.com', domain: 'google.com' },
                    { name: 'Forbes', logo: 'https://logo.clearbit.com/forbes.com', domain: 'forbes.com' },
                    { name: 'Yahoo!', logo: 'https://logo.clearbit.com/yahoo.com', domain: 'yahoo.com' },
                    { name: 'YouTube', logo: 'https://logo.clearbit.com/youtube.com', domain: 'youtube.com' },
                    { name: 'BINANCE', logo: 'https://logo.clearbit.com/binance.com', domain: 'binance.com' },
                    { name: 'Coinbase', logo: 'https://logo.clearbit.com/coinbase.com', domain: 'coinbase.com' },
                    { name: 'CoinPedia', logo: 'https://logo.clearbit.com/coinpedia.org', domain: 'coinpedia.org' },
                    { name: 'AMBCRYPTO', logo: 'https://logo.clearbit.com/ambcrypto.com', domain: 'ambcrypto.com' },
                    { name: 'BENZINGA', logo: 'https://logo.clearbit.com/benzinga.com', domain: 'benzinga.com' },
                    { name: 'CoinGape', logo: 'https://logo.clearbit.com/coingape.com', domain: 'coingape.com' },
                    { name: 'GlobeNewswire', logo: 'https://logo.clearbit.com/globenewswire.com', domain: 'globenewswire.com' },
                    { name: 'cryptonews', logo: 'https://logo.clearbit.com/cryptonews.com', domain: 'cryptonews.com' },
                    { name: 'Analytics Insight', logo: 'https://logo.clearbit.com/analyticsinsight.net', domain: 'analyticsinsight.net' },
                    { name: 'SOURCEFORGE', logo: 'https://logo.clearbit.com/sourceforge.net', domain: 'sourceforge.net' },
                    { name: 'MarketWatch', logo: 'https://logo.clearbit.com/marketwatch.com', domain: 'marketwatch.com' },
                  ].map((partner) => (
                    <div 
                      key={partner.name} 
                      className="bg-white rounded p-4 flex items-center justify-center h-20 hover:bg-gray-50 transition relative"
                    >
                      <img 
                        src={partner.logo} 
                        alt={partner.name}
                        className="max-w-full max-h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          // Fallback to text if image fails to load
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
              )}

              {/* Footer - Only show when not in purchase flow */}
              {purchaseStage === 'form' && !selectedPlan && (
                <footer className="mt-12 border-t border-white/10 pt-8">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="rounded-full bg-[#f97316] px-2 py-1 text-sm font-bold">BTC</span>
                        <span className="text-xl font-semibold">BTCMining</span>
                      </div>
                      <p className="text-white/70 text-sm">
                        Btc Mining is one of the leading cryptocurrency mining platforms, offering cryptocurrency mining capacities in every range - for newcomers. Our mission is to make acquiring cryptocurrencies easy and fast for everyone.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-4 border-b border-yellow-500 pb-2 inline-block">Quick Links</h3>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li><a href="#" className="hover:text-yellow-400">Team</a></li>
                        <li><a href="#" className="hover:text-yellow-400">AboutUs</a></li>
                        <li><a href="#" className="hover:text-yellow-400">Plans</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-4 border-b border-yellow-500 pb-2 inline-block">Useful Links</h3>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li><a href="#" className="hover:text-yellow-400">Usage Policy</a></li>
                        <li><a href="#" className="hover:text-yellow-400">Cookie Policy</a></li>
                        <li><a href="#" className="hover:text-yellow-400">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-yellow-400">Terms of Service</a></li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold mb-4 border-b border-yellow-500 pb-2 inline-block">Contact Info</h3>
                      <ul className="space-y-2 text-white/70 text-sm">
                        <li className="flex items-center gap-2">
                          <span>📞</span>
                          <span>VIP Customers Only</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span>✉️</span>
                          <span>[email protected]</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <span>📍</span>
                          <span>57 Kingfisher Grove, Willenhall, England, WV12 5HG (Company No. 15415402)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </footer>
              )}
            </div>
          ) : (
            /* Purchased Plans View */
            <div className="bg-[#111B2D] border border-white/5 rounded-lg overflow-hidden">
              {purchasedPlans.length === 0 ? (
                <div className="text-center py-12 p-6">
                  <p className="text-white/60 text-lg">No purchased plans yet</p>
                  <Button
                    onClick={() => setActiveView('buy')}
                    className="mt-4 bg-yellow-500 text-black hover:bg-yellow-400"
                  >
                    Browse Plans
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-[#0B1421] border-b border-white/10">
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">S.N.</th>
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">Plan</th>
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">Price</th>
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">Return/Day</th>
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">Total Days</th>
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">Remaining Days</th>
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">Status</th>
                        <th className="text-left py-4 px-4 text-white/80 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchasedPlans.map((plan) => (
                        <tr key={plan.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-4 px-4 text-white/80">{plan.sn}</td>
                          <td className="py-4 px-4 text-white/80">{plan.planName}</td>
                          <td className="py-4 px-4 text-white/80">{plan.price} USD</td>
                          <td className="py-4 px-4 text-white/80">
                            {plan.returnPerDay.min.toFixed(8)} - {plan.returnPerDay.max.toFixed(8)} {plan.returnPerDay.currency}
                          </td>
                          <td className="py-4 px-4 text-white/80">{plan.totalDays}</td>
                          <td className="py-4 px-4 text-white/80">{plan.remainingDays}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              plan.status === 'pending'
                                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                                : plan.status === 'active'
                                ? 'bg-green-500/20 text-green-400'
                                : plan.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <Button
                              onClick={() => {
                                setSelectedPlan(plan);
                                setIsDialogOpen(true);
                              }}
                              className="bg-yellow-500 text-black hover:bg-yellow-400"
                            >
                              View
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Plan Details Dialog */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="bg-[#111B2D] border-yellow-500/50 text-white max-w-md [&>button]:hidden">
              <DialogHeader className="relative">
                <DialogTitle className="text-white text-xl font-bold mb-4 pr-8">
                  Purchased Plan Details
                </DialogTitle>
                <button
                  onClick={() => setIsDialogOpen(false)}
                  className="absolute right-4 top-4 w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-white/90 transition"
                >
                  <span className="text-red-500 font-bold text-lg leading-none">×</span>
                </button>
              </DialogHeader>
              {selectedPurchasedPlan && (
                  <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Purchased Date:</span>
                    <span className="text-white font-medium">{selectedPurchasedPlan.purchasedDate}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Plan Title:</span>
                    <span className="text-white font-medium">{selectedPurchasedPlan.planName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Plan Price:</span>
                    <span className="text-white font-medium">{selectedPurchasedPlan.price} USD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Miner:</span>
                    <span className="text-white font-medium">{selectedPurchasedPlan.miner}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Return /Day:</span>
                    <span className="text-white font-medium">
                      {selectedPurchasedPlan.returnPerDay.min.toFixed(8)} - {selectedPurchasedPlan.returnPerDay.max.toFixed(8)} {selectedPurchasedPlan.returnPerDay.currency}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Total Days:</span>
                    <span className="text-white font-medium">{selectedPurchasedPlan.totalDays}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Fixed Return:</span>
                    <span className="text-white font-medium">{selectedPurchasedPlan.fixedReturn} {selectedPurchasedPlan.returnPerDay.currency}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70">Remaining Days:</span>
                    <span className="text-white font-medium">{selectedPurchasedPlan.remainingDays}</span>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
};

export default StartMining;

