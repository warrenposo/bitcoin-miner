import { useState, useEffect } from 'react';
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
  Home,
  Wallet,
  ChevronRight,
  Pickaxe,
  Gift,
  MessageSquare,
  User,
  CircleDollarSign,
  MinusCircle,
  List,
  LogOut,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Withdraw = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  // Check if there's a view preference from navigation
  const initialView = (sessionStorage.getItem('/withdraw_view') as 'withdraw' | 'log') || 'withdraw';
  const [activeView, setActiveView] = useState<'withdraw' | 'log'>(initialView);
  
  // Clear the view preference after using it
  useEffect(() => {
    if (initialView) {
      sessionStorage.removeItem('/withdraw_view');
    }
  }, []);
  const [gateway, setGateway] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchBalance();
      if (activeView === 'log') {
        fetchWithdrawals();
      }
    }
  }, [user, activeView]);

  const fetchBalance = async () => {
    if (!user) return;
    
    try {
      const { data: stats } = await supabase
        .from('mining_stats')
        .select('total_mined')
        .eq('user_id', user.id)
        .single();

      if (stats) {
        setAvailableBalance(stats.total_mined || 0);
      }
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  const fetchWithdrawals = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // TODO: Replace with actual withdrawals table when created
      // For now, using empty array
      setWithdrawals([]);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load withdrawal history',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!gateway) {
      toast({
        title: 'Error',
        description: 'Please select a payment gateway',
        variant: 'destructive',
      });
      return;
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Error',
        description: 'Please enter a valid amount',
        variant: 'destructive',
      });
      return;
    }
    
    const withdrawAmount = parseFloat(amount);
    
    if (withdrawAmount > availableBalance) {
      toast({
        title: 'Error',
        description: 'Insufficient balance',
        variant: 'destructive',
      });
      return;
    }
    
    if (!walletAddress || walletAddress.trim() === '') {
      toast({
        title: 'Error',
        description: 'Please enter your wallet address',
        variant: 'destructive',
      });
      return;
    }
    
    // TODO: Implement actual withdrawal logic
    // This would typically:
    // 1. Create a withdrawal record in the database
    // 2. Deduct from user balance
    // 3. Process the withdrawal through the selected gateway
    
    toast({
      title: 'Success',
      description: 'Withdrawal request submitted successfully',
    });
    
    // Reset form
    setAmount('');
    setWalletAddress('');
    setGateway('');
    
    // Refresh balance
    fetchBalance();
  };

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { label: 'Deposit', icon: Wallet, path: '/deposit' },
    { 
      label: 'Withdraw', 
      icon: CircleDollarSign, 
      subItems: [
        { label: 'Withdraw Now', path: '/withdraw', view: 'withdraw' },
        { label: 'Withdraw Log', path: '/withdraw', view: 'log' },
      ]
    },
    { label: 'Start Mining', icon: Pickaxe },
    { label: 'Referral', icon: Gift },
    { label: 'Support Ticket', icon: MessageSquare },
    { label: 'My Account', icon: User },
  ];

  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 min-h-screen bg-[#0F1A2B] border-r border-white/5 p-4">
          <div className="space-y-2">
            {menuItems.map((item) => (
              <div key={item.label}>
                {item.subItems ? (
                  <div>
                    <div className={`flex items-center justify-between px-4 py-3 font-medium ${
                      item.label === 'Withdraw' ? 'text-yellow-400' : 'text-white/70'
                    }`}>
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
                              setActiveView(subItem.view as 'withdraw' | 'log');
                            } else {
                              navigate(subItem.path);
                            }
                          }}
                          className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                            (subItem.view === 'withdraw' && activeView === 'withdraw') ||
                            (subItem.view === 'log' && activeView === 'log')
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'text-white/70 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          {subItem.view === 'withdraw' ? (
                            <MinusCircle className="h-4 w-4" />
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
                    onClick={() => item.path && navigate(item.path)}
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
        <main className="flex-1 p-6">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {activeView === 'withdraw' ? 'Withdraw Now' : 'Withdraw Log'}
              </h1>
            </div>
            <Button
              variant="outline"
              className="border-rose-500 text-rose-400 hover:bg-rose-500/10"
              onClick={handleSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </header>

          {activeView === 'withdraw' ? (
            /* Withdraw Now View */
            <div className="bg-[#111B2D] border border-white/5 rounded-lg p-6 max-w-2xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Amount Input */}
                <div>
                  <Label htmlFor="amount" className="text-white/80 mb-2 block">
                    Enter Amount (USD) *
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount"
                    className="bg-white text-black border-white/10 h-12"
                    min="0"
                    step="0.01"
                  />
                  <p className="text-white/60 text-sm mt-2">
                    Available Balance: {availableBalance.toFixed(2)} USD
                  </p>
                </div>

                {/* Gateway Selection */}
                <div>
                  <Label htmlFor="gateway" className="text-white/80 mb-2 block">
                    Select Gateway *
                  </Label>
                  <Select value={gateway} onValueChange={setGateway}>
                    <SelectTrigger 
                      id="gateway"
                      className="bg-[#0B1421] border-white/10 text-white h-12"
                    >
                      <SelectValue placeholder="Select One" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B1421] border-white/10">
                      <SelectItem value="btc" className="text-white hover:bg-white/10 focus:bg-yellow-500/20">
                        BTC
                      </SelectItem>
                      <SelectItem value="usdt-trc20" className="text-white hover:bg-white/10 focus:bg-yellow-500/20">
                        USDT.TRC20
                      </SelectItem>
                      <SelectItem value="usdt-erc20" className="text-white hover:bg-white/10 focus:bg-yellow-500/20">
                        USDT.ERC20
                      </SelectItem>
                      <SelectItem value="usdc" className="text-white hover:bg-white/10 focus:bg-yellow-500/20">
                        USDC
                      </SelectItem>
                      <SelectItem value="eth" className="text-white hover:bg-white/10 focus:bg-yellow-500/20">
                        ETH
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Wallet Address */}
                <div>
                  <Label htmlFor="wallet" className="text-white/80 mb-2 block">
                    Wallet Address *
                  </Label>
                  <Input
                    id="wallet"
                    type="text"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    placeholder="Enter your wallet address"
                    className="bg-white text-black border-white/10 h-12"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400 h-12 text-lg font-semibold"
                >
                  Submit Withdrawal
                </Button>
              </form>
            </div>
          ) : (
            /* Withdraw Log View */
            <div className="bg-[#111B2D] border border-white/5 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0B1421] border-b border-white/10">
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Time</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Transaction ID</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Wallet</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Amount</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Status</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
                          </div>
                        </td>
                      </tr>
                    ) : withdrawals.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <p className="text-white/60 text-lg">No Data Found!</p>
                        </td>
                      </tr>
                    ) : (
                      withdrawals.map((withdrawal: any) => (
                        <tr key={withdrawal.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-4 px-4 text-white/80">
                            {new Date(withdrawal.created_at).toLocaleString()}
                          </td>
                          <td className="py-4 px-4 text-white/80 font-mono text-sm">
                            {withdrawal.transaction_id || withdrawal.id}
                          </td>
                          <td className="py-4 px-4 text-white/80 font-mono text-sm">
                            {withdrawal.wallet_address?.slice(0, 10)}...{withdrawal.wallet_address?.slice(-8)}
                          </td>
                          <td className="py-4 px-4 text-white/80">
                            {withdrawal.amount?.toFixed(2)} USD
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              withdrawal.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400'
                                : withdrawal.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : withdrawal.status === 'rejected'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}>
                              {withdrawal.status || 'pending'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
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

export default Withdraw;

