import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  Plus,
  List,
  LogOut,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Deposit = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  // Check if there's a view preference from navigation
  const initialView = (sessionStorage.getItem('/deposit_view') as 'deposit' | 'log') || 'deposit';
  const [activeView, setActiveView] = useState<'deposit' | 'log'>(initialView);
  
  // Clear the view preference after using it
  useEffect(() => {
    if (initialView) {
      sessionStorage.removeItem('/deposit_view');
    }
  }, []);
  const [gateway, setGateway] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [limit, setLimit] = useState({ min: 0, max: 0 });
  const [charge, setCharge] = useState(0);
  const [payable, setPayable] = useState(0);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAmountChange = (value: string) => {
    setAmount(value);
    const numAmount = parseFloat(value) || 0;
    
    // Calculate charge (example: 2% fee)
    const calculatedCharge = numAmount * 0.02;
    setCharge(calculatedCharge);
    
    // Calculate payable (amount + charge)
    setPayable(numAmount + calculatedCharge);
    
    // Set limits based on gateway (example)
    if (gateway) {
      setLimit({ min: 10, max: 100000 });
    }
  };

  const handleGatewayChange = (value: string) => {
    setGateway(value);
    // Reset amount when gateway changes
    setAmount('');
    setCharge(0);
    setPayable(0);
    
    // Set limits based on gateway
    if (value === 'coinbase') {
      setLimit({ min: 10, max: 100000 });
    } else if (value === 'paypal') {
      setLimit({ min: 50, max: 50000 });
    } else {
      setLimit({ min: 0, max: 0 });
    }
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
    
    if (parseFloat(amount) < limit.min || parseFloat(amount) > limit.max) {
      toast({
        title: 'Error',
        description: `Amount must be between ${limit.min} and ${limit.max} USD`,
        variant: 'destructive',
      });
      return;
    }
    
    // TODO: Implement actual deposit logic
    toast({
      title: 'Success',
      description: 'Deposit request submitted successfully',
    });
    
    // Reset form
    setAmount('');
    setCharge(0);
    setPayable(0);
  };

  const menuItems = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    { 
      label: 'Deposit', 
      icon: Wallet, 
      subItems: [
        { label: 'Deposit Now', path: '/deposit', view: 'deposit' },
        { label: 'Deposit Log', path: '/deposit', view: 'log' },
      ]
    },
    { label: 'Withdraw', icon: CircleDollarSign },
    { label: 'Start Mining', icon: Pickaxe },
    { label: 'Referral', icon: Gift },
    { label: 'Support Ticket', icon: MessageSquare },
    { label: 'My Account', icon: User },
  ];

  const deposits = []; // Empty for now - will be populated from API

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
                {activeView === 'deposit' ? 'Deposit Now' : 'Deposit Log'}
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

          {activeView === 'deposit' ? (
            /* Deposit Now View */
            <div className="space-y-6">
              {/* Offer Box */}
              <div className="bg-[#1E3A5F] border border-[#2E5A8F] rounded-lg p-6">
                <h2 className="text-xl font-semibold text-[#87CEEB] mb-2">Offer Only For Today</h2>
                <h2 className="text-xl font-semibold text-[#87CEEB] mb-4">Offer Only For Today</h2>
                <div className="space-y-2 text-white/90">
                  <p>1. Every payment more than 2000 USD. Get extra 3%</p>
                  <p>2. Every payment more than 5000 USD. Get extra 5%</p>
                  <p>3. Every payment more than 50000 USD.Get extra 10%</p>
                </div>
              </div>

              {/* Deposit Form */}
              <div className="bg-[#111B2D] border border-white/5 rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-6">Deposit on Your USD Wallet</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Gateway Selection */}
                  <div>
                    <Label htmlFor="gateway" className="text-white/80 mb-2 block">
                      Select Gateway *
                    </Label>
                    <Select value={gateway} onValueChange={handleGatewayChange}>
                      <SelectTrigger 
                        id="gateway"
                        className="bg-[#0B1421] border-white/10 text-white h-12"
                      >
                        <SelectValue placeholder="Select One" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0B1421] border-white/10">
                        <SelectItem value="coinbase" className="text-white hover:bg-white/10">
                          Coinbase
                        </SelectItem>
                        <SelectItem value="paypal" className="text-white hover:bg-white/10">
                          PayPal
                        </SelectItem>
                        <SelectItem value="stripe" className="text-white hover:bg-white/10">
                          Stripe
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Amount Input */}
                  <div>
                    <Label htmlFor="amount" className="text-white/80 mb-2 block">
                      Amount
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id="amount"
                        type="number"
                        value={amount}
                        onChange={(e) => handleAmountChange(e.target.value)}
                        placeholder="0.00"
                        className="flex-1 bg-[#0B1421] border-white/10 text-white h-12"
                        min={limit.min}
                        max={limit.max}
                        step="0.01"
                      />
                      <Button
                        type="button"
                        className="bg-yellow-500 text-black hover:bg-yellow-400 h-12 px-6"
                      >
                        USD
                      </Button>
                    </div>
                  </div>

                  {/* Limit, Charge, Payable */}
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-white/60 text-sm mb-1 block">Limit</Label>
                      <div className="bg-[#0B1421] border border-white/10 rounded p-3 text-white">
                        {limit.min > 0 ? `${limit.min} USD - ${limit.max} USD` : '0 USD - 0 USD'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm mb-1 block">Charge</Label>
                      <div className="bg-[#0B1421] border border-white/10 rounded p-3 text-white">
                        {charge > 0 ? `${charge.toFixed(2)} USD` : '0 USD'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-white/60 text-sm mb-1 block">Payable</Label>
                      <div className="bg-[#0B1421] border border-white/10 rounded p-3 text-white">
                        {payable > 0 ? `${payable.toFixed(2)} USD` : '0 USD'}
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    className="w-full bg-yellow-500 text-black hover:bg-yellow-400 h-12 text-lg font-semibold"
                  >
                    Submit
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            /* Deposit Log View */
            <div className="bg-[#111B2D] border border-white/5 rounded-lg p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Transaction ID</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Gateway</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Amount</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Status</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">Time</th>
                      <th className="text-left py-4 px-4 text-white/80 font-semibold">MORE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deposits.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12">
                          <p className="text-white/60 text-lg">
                            No wallet found yet? <span className="text-yellow-400 cursor-pointer hover:underline" onClick={() => setActiveView('deposit')}>Deposit</span>
                          </p>
                        </td>
                      </tr>
                    ) : (
                      deposits.map((deposit: any) => (
                        <tr key={deposit.id} className="border-b border-white/5">
                          <td className="py-4 px-4 text-white/80">{deposit.transactionId}</td>
                          <td className="py-4 px-4 text-white/80">{deposit.gateway}</td>
                          <td className="py-4 px-4 text-white/80">{deposit.amount} USD</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs ${
                              deposit.status === 'completed' 
                                ? 'bg-green-500/20 text-green-400'
                                : deposit.status === 'pending'
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'bg-red-500/20 text-red-400'
                            }`}>
                              {deposit.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-white/80">{deposit.time}</td>
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

export default Deposit;

