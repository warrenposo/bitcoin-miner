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
  MinusCircle,
  List,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { UserSidebar } from '@/components/UserSidebar';

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

  // Listen for view changes from menu when already on this page
  useEffect(() => {
    const checkView = () => {
      const storedView = sessionStorage.getItem('/withdraw_view');
      if (storedView && (storedView === 'withdraw' || storedView === 'log')) {
        setActiveView(storedView as 'withdraw' | 'log');
        sessionStorage.removeItem('/withdraw_view');
      }
    };
    
    // Check immediately
    checkView();
    
    // Also listen for storage events (when navigating from same page)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === '/withdraw_view' && e.newValue) {
        if (e.newValue === 'withdraw' || e.newValue === 'log') {
          setActiveView(e.newValue as 'withdraw' | 'log');
        }
      }
    };
    
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
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
      const { data, error } = await supabase
        .from('withdrawals')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setWithdrawals(data || []);
    } catch (error: any) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to load withdrawal history',
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
    
    try {
      // Generate transaction ID
      const transactionId = `WD${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
      
      // Create withdrawal record
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user!.id,
          transaction_id: transactionId,
          gateway: gateway,
          amount: withdrawAmount,
          wallet_address: walletAddress,
          status: 'pending',
        });
      
      if (error) throw error;
      
      // Note: In a real system, you would also deduct from user balance here
      // For now, we'll just create the withdrawal record
      
      toast({
        title: 'Success',
        description: 'Withdrawal request submitted successfully',
      });
      
      // Reset form
      setAmount('');
      setWalletAddress('');
      setGateway('');
      
      // Refresh balance and withdrawals
      fetchBalance();
      if (activeView === 'log') {
        fetchWithdrawals();
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit withdrawal request',
        variant: 'destructive',
      });
    }
  };

  const handleViewChange = (view: string) => {
    if (view === 'withdraw' || view === 'log') {
      setActiveView(view as 'withdraw' | 'log');
      // Clear sessionStorage if it was set
      sessionStorage.removeItem('/withdraw_view');
    }
  };

  // Listen for custom viewchange events
  useEffect(() => {
    const handleViewChangeEvent = (e: CustomEvent) => {
      const view = e.detail?.view;
      if (view === 'withdraw' || view === 'log') {
        setActiveView(view as 'withdraw' | 'log');
      }
    };
    
    window.addEventListener('viewchange', handleViewChangeEvent as EventListener);
    return () => window.removeEventListener('viewchange', handleViewChangeEvent as EventListener);
  }, []);

  return (
    <div className="min-h-screen bg-[#0B1421] text-white">
      <div className="flex">
        <UserSidebar 
          activeView={activeView === 'withdraw' ? 'withdraw' : activeView === 'log' ? 'log' : undefined}
          onViewChange={handleViewChange}
          onSignOut={handleSignOut}
        />

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <header className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">
                {activeView === 'withdraw' ? 'Withdraw Now' : 'Withdraw Log'}
              </h1>
            </div>
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

