import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Headphones,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Pencil,
  Search,
  Shield,
  Users,
  X,
  Zap,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  referral_balance?: number;
}

interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  created_at: string;
  admin_response: string | null;
  user_email?: string;
}

interface MiningStats {
  user_id: string;
  hash_rate: number;
  total_mined: number;
  daily_earnings: number;
  available_balance?: number;
  user_email?: string;
}

const AdminDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [allStats, setAllStats] = useState<MiningStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [ticketStatus, setTicketStatus] = useState('');
  const [activeView, setActiveView] = useState<'overview' | 'users' | 'tickets' | 'analytics'>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [balanceEditUser, setBalanceEditUser] = useState<User | null>(null);
  const [balanceEditValue, setBalanceEditValue] = useState('');
  const [balanceEditSaving, setBalanceEditSaving] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [referralEditUser, setReferralEditUser] = useState<User | null>(null);
  const [referralEditValue, setReferralEditValue] = useState('');
  const [referralEditSaving, setReferralEditSaving] = useState(false);

  useEffect(() => {
    if (profile?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [profile, navigate]);

  const fetchData = async () => {
    try {
      console.log('Admin Dashboard: Fetching data...', { userId: user?.id, profileRole: profile?.role });

      // Fetch all users
      const { data: allUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersError) {
        console.error('Error fetching users:', usersError);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive',
        });
      } else {
        console.log('Users fetched:', allUsers?.length);
        setUsers(allUsers || []);
      }

      // Fetch all support tickets
      const { data: allTickets, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false });

      if (ticketsError) {
        console.error('Error fetching tickets:', ticketsError);
        toast({
          title: 'Error',
          description: `Failed to load tickets: ${ticketsError.message}`,
          variant: 'destructive',
        });
      } else {
        console.log('Tickets fetched:', allTickets?.length);
        
        if (allTickets && allTickets.length > 0) {
          // Get user emails for tickets
          const ticketsWithEmails = await Promise.all(
            allTickets.map(async (ticket) => {
              const { data: userProfile } = await supabase
                .from('profiles')
                .select('email')
                .eq('user_id', ticket.user_id)
                .single();
              return {
                ...ticket,
                user_email: userProfile?.email || 'Unknown',
              };
            })
          );
          setTickets(ticketsWithEmails);
        } else {
          setTickets([]);
        }
      }

      // Fetch all mining stats
      const { data: stats, error: statsError } = await supabase
        .from('mining_stats')
        .select('*')
        .order('total_mined', { ascending: false });

      if (statsError) {
        console.error('Error fetching mining stats:', statsError);
        // Don't show toast for RLS errors, just log and continue
        // The 403 error is likely due to RLS policies - this is expected if admin doesn't have access
        setAllStats([]);
      } else if (stats) {
        // Get user emails for stats
        const statsWithEmails = await Promise.all(
          stats.map(async (stat) => {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('email')
              .eq('user_id', stat.user_id)
              .single();
            return {
              ...stat,
              user_email: userProfile?.email || 'Unknown',
            };
          })
        );
        setAllStats(statsWithEmails);
      } else {
        setAllStats([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = useMemo(() => {
    const q = userSearchQuery.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.email || '').toLowerCase().includes(q) ||
        (u.full_name || '').toLowerCase().includes(q)
    );
  }, [users, userSearchQuery]);

  const getBalanceForUser = (userId: string) => {
    const stat = allStats.find((s) => s.user_id === userId);
    return stat ? Number(stat.total_mined ?? 0) : 0;
  };

  const getReferralBalanceForUser = (u: User) => Number(u.referral_balance ?? 0);

  const handleOpenBalanceEdit = (u: User) => {
    setBalanceEditUser(u);
    setBalanceEditValue(String(getBalanceForUser(u.user_id)));
  };

  const handleSaveBalance = async () => {
    if (!balanceEditUser) return;
    const newBalance = parseFloat(balanceEditValue);
    if (Number.isNaN(newBalance) || newBalance < 0) {
      toast({ title: 'Invalid amount', description: 'Enter a valid balance (number ≥ 0).', variant: 'destructive' });
      return;
    }
    setBalanceEditSaving(true);
    try {
      const userId = balanceEditUser.user_id;
      const oldBalance = getBalanceForUser(userId);
      const creditAmount = newBalance - oldBalance;

      const { data: existingStat } = await supabase
        .from('mining_stats')
        .select('id, hash_rate, daily_earnings')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingStat) {
        const { error: updateError } = await supabase
          .from('mining_stats')
          .update({
            total_mined: newBalance,
            available_balance: newBalance,
            last_updated: new Date().toISOString(),
          })
          .eq('user_id', userId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('mining_stats')
          .insert({
            user_id: userId,
            hash_rate: 0,
            total_mined: newBalance,
            daily_earnings: 0,
            available_balance: newBalance,
            last_updated: new Date().toISOString(),
          });
        if (insertError) throw insertError;
      }

      if (creditAmount > 0) {
        const txId = `ADMIN-ADJ-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
        const { error: depositError } = await supabase.from('deposits').insert({
          user_id: userId,
          transaction_id: txId,
          gateway: 'btc',
          amount: creditAmount,
          charge: 0,
          payable: creditAmount,
          status: 'completed',
          currency: 'USD',
          completed_at: new Date().toISOString(),
        });
        if (depositError) throw depositError;

        const { data: referralRow } = await supabase
          .from('referrals')
          .select('referrer_id')
          .eq('referred_id', userId)
          .maybeSingle();
        if (referralRow?.referrer_id) {
          const refBonus = Math.round(creditAmount * 0.05 * 100) / 100;
          if (refBonus > 0) {
            await supabase.from('referral_commissions').insert({
              referrer_id: referralRow.referrer_id,
              referred_id: userId,
              commission_type: 'deposit',
              amount: refBonus,
              percentage: 5,
              status: 'pending',
            });
          }
        }
      }

      toast({ title: 'Balance updated', description: creditAmount > 0 ? 'Deposit log entry created for the user.' : 'User balance updated.' });
      setBalanceEditUser(null);
      setBalanceEditValue('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update balance', variant: 'destructive' });
    } finally {
      setBalanceEditSaving(false);
    }
  };

  const handleOpenReferralEdit = (u: User) => {
    setReferralEditUser(u);
    setReferralEditValue(String(getReferralBalanceForUser(u)));
  };

  const handleSaveReferralBalance = async () => {
    if (!referralEditUser) return;
    const value = parseFloat(referralEditValue);
    if (Number.isNaN(value) || value < 0) {
      toast({ title: 'Invalid amount', description: 'Enter a valid referral balance (number ≥ 0).', variant: 'destructive' });
      return;
    }
    setReferralEditSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ referral_balance: value, updated_at: new Date().toISOString() })
        .eq('user_id', referralEditUser.user_id);
      if (error) throw error;
      toast({ title: 'Referral balance updated', description: `Set to ${value.toFixed(2)} USD for ${referralEditUser.email}.` });
      setReferralEditUser(null);
      setReferralEditValue('');
      fetchData();
    } catch (err: any) {
      toast({ title: 'Error', description: err?.message || 'Failed to update referral balance', variant: 'destructive' });
    } finally {
      setReferralEditSaving(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (!selectedTicket) return;

    try {
      const updateData: any = {};
      if (ticketResponse) updateData.admin_response = ticketResponse;
      if (ticketStatus) updateData.status = ticketStatus;
      if (ticketStatus === 'resolved') updateData.resolved_at = new Date().toISOString();

      const { error } = await supabase
        .from('support_tickets')
        .update(updateData)
        .eq('id', selectedTicket.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Ticket updated successfully',
      });

      setSelectedTicket(null);
      setTicketResponse('');
      setTicketStatus('');
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update ticket',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050C1A] text-white">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-400"></div>
          <p className="text-white/70">Preparing admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050C1A] text-white">
      <header className="border-b border-white/5 bg-[#091328]/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-400" />
            <div>
              <p className="text-xs sm:text-sm text-white/50">BTC Mining Base</p>
              <p className="text-base sm:text-lg font-semibold">Admin Control Center</p>
            </div>
          </div>
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-white/10"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          
          <nav className={`${mobileMenuOpen ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row absolute lg:static top-full left-0 right-0 lg:top-auto lg:left-auto lg:right-auto bg-[#091328] lg:bg-transparent border-t lg:border-t-0 border-white/5 lg:border-0 p-4 lg:p-0 gap-4 lg:gap-6 text-sm font-medium z-50`}>
            <button 
              onClick={() => {
                setActiveView('overview');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 transition-colors py-2 lg:py-0 ${
                activeView === 'overview' ? 'text-yellow-400' : 'text-white/70 hover:text-white'
              }`}
            >
              <Home className="h-4 w-4" /> Overview
            </button>
            <button 
              onClick={() => {
                setActiveView('users');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 transition-colors py-2 lg:py-0 ${
                activeView === 'users' ? 'text-yellow-400' : 'text-white/70 hover:text-white'
              }`}
            >
              <Users className="h-4 w-4" /> Users
            </button>
            <button 
              onClick={() => {
                setActiveView('tickets');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 transition-colors py-2 lg:py-0 ${
                activeView === 'tickets' ? 'text-yellow-400' : 'text-white/70 hover:text-white'
              }`}
            >
              <MessageSquare className="h-4 w-4" /> Tickets
            </button>
            <button 
              onClick={() => {
                setActiveView('analytics');
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 transition-colors py-2 lg:py-0 ${
                activeView === 'analytics' ? 'text-yellow-400' : 'text-white/70 hover:text-white'
              }`}
            >
              <BarChart3 className="h-4 w-4" /> Analytics
            </button>
          </nav>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden text-right text-xs text-white/60 sm:block">
              <p className="font-semibold text-white">{profile?.full_name || profile?.email}</p>
              <p>System Administrator</p>
            </div>
            <Button variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10 text-sm px-3 lg:px-4" onClick={handleSignOut}>
              <LogOut className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-7xl flex-col gap-4 sm:gap-6 px-4 sm:px-6 py-4 sm:py-8 lg:flex-row">
        <aside className="w-full rounded-2xl border border-white/5 bg-[#0B152F]/80 p-4 sm:p-6 lg:w-72">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-white/50">Quick Metrics</h2>
          <div className="mt-4 space-y-4 text-sm">
            <div className="rounded-xl bg-[#0F1F3F] p-4">
              <p className="text-white/50">Total Users</p>
              <p className="text-3xl font-semibold text-yellow-400">{users.length}</p>
              <p className="text-xs text-white/40">{users.filter((u) => u.role === 'admin').length} admins / {users.length} accounts</p>
            </div>
            <div className="rounded-xl bg-[#0F1F3F] p-4">
              <p className="text-white/50">Open Tickets</p>
              <p className="text-3xl font-semibold text-yellow-400">
                {tickets.filter((t) => t.status !== 'resolved' && t.status !== 'closed').length}
              </p>
              <p className="text-xs text-white/40">Total tickets: {tickets.length}</p>
            </div>
            <div className="rounded-xl bg-[#0F1F3F] p-4">
              <p className="text-white/50">Total Mined</p>
              <p className="text-3xl font-semibold text-yellow-400">{allStats.reduce((sum, stat) => sum + stat.total_mined, 0).toFixed(2)} BTC</p>
              <p className="text-xs text-white/40">Across all users</p>
            </div>
            <div className="rounded-xl bg-[#0F1F3F] p-4">
              <p className="text-white/50">Hash Power</p>
              <p className="text-3xl font-semibold text-yellow-400">
                {allStats.reduce((sum, stat) => sum + stat.hash_rate, 0).toFixed(2)} TH/s
              </p>
              <p className="text-xs text-white/40">Global hash rate</p>
            </div>
          </div>
        </aside>

        <section className="flex-1 space-y-4 sm:space-y-6 overflow-x-hidden">
          {/* Overview View */}
          {activeView === 'overview' && (
            <>
          <div className="grid gap-6 rounded-2xl border border-white/5 bg-[#0B152F]/80 p-6 sm:grid-cols-2">
            <div>
              <h1 className="text-2xl font-semibold">Welcome back, {profile?.full_name || profile?.email}</h1>
              <p className="mt-2 text-white/60">
                Monitor global operations, manage customer support, and keep an eye on system security from one place. All stats are refreshed
                every few minutes.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-[#0F1F3F] p-4 text-sm text-white/70">
              <p className="text-white/50">System status</p>
              <div className="mt-2 flex items-center gap-3 text-sm font-medium text-green-400">
                <CheckCircle className="h-5 w-5" />
                Operational
              </div>
              <p className="mt-3 text-xs text-white/40">Last sync: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-white/5 bg-[#0B152F]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare className="h-5 w-5 text-yellow-400" />
                      Recent Tickets
                    </CardTitle>
                    <CardDescription className="text-white/50">Latest support tickets</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                    {tickets.slice(0, 5).length === 0 ? (
                      <p className="text-center text-white/50">No tickets yet</p>
                    ) : (
                      tickets.slice(0, 5).map((ticket) => (
                        <div
                          key={ticket.id}
                          className="cursor-pointer rounded-xl border border-white/10 p-4 transition hover:border-yellow-500"
                          onClick={() => {
                            setActiveView('tickets');
                            setSelectedTicket(ticket);
                            setTicketResponse(ticket.admin_response || '');
                            setTicketStatus(ticket.status);
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{ticket.subject}</p>
                              <p className="text-xs text-white/50">From: {ticket.user_email}</p>
                            </div>
                            <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/60">{ticket.status}</span>
                          </div>
                          <p className="mt-2 text-sm text-white/70 line-clamp-2">{ticket.message}</p>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

                <Card className="border-white/5 bg-[#0B152F]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-yellow-400" />
                      Recent Users
                    </CardTitle>
                    <CardDescription className="text-white/50">Latest registered users</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
                    {users.slice(0, 5).length === 0 ? (
                      <p className="text-center text-white/50">No users yet</p>
                    ) : (
                      users.slice(0, 5).map((user) => (
                        <div
                          key={user.id}
                          className="cursor-pointer rounded-xl border border-white/10 p-4 transition hover:border-yellow-500"
                          onClick={() => setActiveView('users')}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-white">{user.email}</p>
                              <p className="text-xs text-white/50">{user.full_name || 'No name'}</p>
                            </div>
                            <span
                              className={`rounded-full px-3 py-1 text-xs ${
                                user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60'
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Users View */}
          {activeView === 'users' && (
            <Card className="border-white/5 bg-[#0B152F]">
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle className="text-white">User Directory</CardTitle>
                  <CardDescription className="text-white/50">Full list of all registered users and roles</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      placeholder="Search by email or name..."
                      value={userSearchQuery}
                      onChange={(e) => setUserSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-56 bg-[#0F1F3F] border-white/10 text-white placeholder:text-white/40"
                    />
                  </div>
                  <Button variant="outline" className="border-white/10 text-white hover:bg-white/10">
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="text-white/60">
                    <tr>
                      <th className="pb-3">Email</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Balance (USD)</th>
                      <th>Referral (USD)</th>
                      <th>Joined</th>
                      <th className="text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="text-white/70">
                        <td className="py-3">{user.email}</td>
                        <td>{user.full_name || 'N/A'}</td>
                        <td>
                          <span
                            className={`rounded-full px-3 py-1 text-xs ${
                              user.role === 'admin' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-white/10 text-white/60'
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>{getBalanceForUser(user.user_id).toFixed(2)}</td>
                        <td>{getReferralBalanceForUser(user).toFixed(2)}</td>
                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        <td className="text-right whitespace-nowrap">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 mr-1"
                            onClick={() => handleOpenBalanceEdit(user)}
                          >
                            <Pencil className="h-4 w-4 mr-1 inline" />
                            Balance
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-400 hover:text-green-300 hover:bg-green-500/10"
                            onClick={() => handleOpenReferralEdit(user)}
                          >
                            <Pencil className="h-4 w-4 mr-1 inline" />
                            Referral
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {filteredUsers.length === 0 && (
                  <p className="text-center text-white/50 py-6">
                    {userSearchQuery.trim() ? 'No users match your search.' : 'No users yet.'}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Edit Balance Dialog */}
          <Dialog open={!!balanceEditUser} onOpenChange={(open) => !open && setBalanceEditUser(null)}>
            <DialogContent className="border-white/10 bg-[#0B152F] text-white">
              <DialogHeader>
                <DialogTitle>Edit user balance</DialogTitle>
                <DialogDescription className="text-white/60">
                  {balanceEditUser?.email}. Changes apply to mining balance. A credit will appear in the user&apos;s Deposit Log and may create referral bonus for their referrer.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="balance-edit" className="text-white/80">New balance (USD)</Label>
                  <Input
                    id="balance-edit"
                    type="number"
                    min={0}
                    step="0.01"
                    value={balanceEditValue}
                    onChange={(e) => setBalanceEditValue(e.target.value)}
                    className="bg-[#0F1F3F] border-white/10 text-white"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" className="border-white/10 text-white" onClick={() => setBalanceEditUser(null)} disabled={balanceEditSaving}>
                  Cancel
                </Button>
                <Button className="bg-yellow-500 text-black hover:bg-yellow-400" onClick={handleSaveBalance} disabled={balanceEditSaving}>
                  {balanceEditSaving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Referral Balance Dialog */}
          <Dialog open={!!referralEditUser} onOpenChange={(open) => !open && setReferralEditUser(null)}>
            <DialogContent className="border-white/10 bg-[#0B152F] text-white">
              <DialogHeader>
                <DialogTitle>Edit referral balance</DialogTitle>
                <DialogDescription className="text-white/60">
                  {referralEditUser?.email}. Set the referral earnings balance for this user (as referrer). This is separate from mining balance.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="referral-edit" className="text-white/80">Referral balance (USD)</Label>
                  <Input
                    id="referral-edit"
                    type="number"
                    min={0}
                    step="0.01"
                    value={referralEditValue}
                    onChange={(e) => setReferralEditValue(e.target.value)}
                    className="bg-[#0F1F3F] border-white/10 text-white"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2 sm:gap-0">
                <Button variant="outline" className="border-white/10 text-white" onClick={() => setReferralEditUser(null)} disabled={referralEditSaving}>
                  Cancel
                </Button>
                <Button className="bg-green-600 text-white hover:bg-green-500" onClick={handleSaveReferralBalance} disabled={referralEditSaving}>
                  {referralEditSaving ? 'Saving...' : 'Save'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Tickets View */}
          {activeView === 'tickets' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="border-white/5 bg-[#0B152F]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-yellow-400" />
                  Support Tickets
                </CardTitle>
                <CardDescription className="text-white/50">Review customer issues and respond quickly</CardDescription>
              </CardHeader>
                <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
                {tickets.length === 0 ? (
                  <p className="text-center text-white/50">No tickets yet</p>
                ) : (
                  tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`cursor-pointer rounded-xl border border-white/10 p-4 transition hover:border-yellow-500 ${
                        selectedTicket?.id === ticket.id ? 'border-yellow-500' : ''
                      }`}
                      onClick={() => {
                        setSelectedTicket(ticket);
                        setTicketResponse(ticket.admin_response || '');
                        setTicketStatus(ticket.status);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-white">{ticket.subject}</p>
                          <p className="text-xs text-white/50">From: {ticket.user_email}</p>
                        </div>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/60">{ticket.status}</span>
                      </div>
                      <div className="mt-2 space-y-1">
                        {/* Show original message preview */}
                        <p className="text-sm text-white/70 line-clamp-2">
                          {ticket.message?.split(/\n\n--- User Reply/)[0]?.trim() || ticket.message}
                        </p>
                        {/* Show reply count if there are user replies */}
                        {ticket.message?.includes('--- User Reply') && (
                          <p className="text-xs text-yellow-400/70">
                            {ticket.message.split(/\n\n--- User Reply/).length - 1} user reply{ticket.message.split(/\n\n--- User Reply/).length - 1 !== 1 ? 's' : ''}
                          </p>
                        )}
                        {/* Show if admin has responded */}
                        {ticket.admin_response && (
                          <p className="text-xs text-green-400/70">✓ Admin responded</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card className="border-white/5 bg-[#0B152F]">
              <CardHeader>
                <CardTitle>Ticket Response</CardTitle>
                <CardDescription className="text-white/50">
                  {selectedTicket ? `Replying to ${selectedTicket.user_email}` : 'Select a ticket to start responding'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTicket ? (
                  <div className="space-y-4">
                    {/* Conversation History */}
                    <div>
                      <Label className="text-white/70 mb-2 block">Conversation History</Label>
                      <div className="bg-[#0F1F3F] rounded-lg p-4 max-h-[300px] overflow-y-auto space-y-4">
                        {/* Parse and display the full message with replies */}
                        {(() => {
                          const messageText = selectedTicket.message || '';
                          const parts = messageText.split(/\n\n--- User Reply \(/);
                          
                          return (
                            <>
                              {/* Original Message */}
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-yellow-400 font-semibold">
                                    {selectedTicket.user_email || 'User'}
                                  </span>
                                  <span className="text-xs text-white/40">
                                    {new Date(selectedTicket.created_at).toLocaleString()}
                                  </span>
                                </div>
                                <div className="bg-[#0B1421] rounded-lg p-3 text-sm text-white/90 whitespace-pre-wrap">
                                  {parts[0].trim()}
                                </div>
                              </div>

                              {/* User Replies */}
                              {parts.slice(1).map((part, index) => {
                                const match = part.match(/^([^)]+)\) ---\s*(.+)$/s);
                                if (match) {
                                  const timestamp = match[1];
                                  const replyText = match[2].trim();
                                  return (
                                    <div key={index} className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <span className="text-xs text-yellow-400 font-semibold">
                                          {selectedTicket.user_email || 'User'}
                                        </span>
                                        <span className="text-xs text-white/40">
                                          {timestamp}
                                        </span>
                                      </div>
                                      <div className="bg-[#0B1421] rounded-lg p-3 text-sm text-white/90 whitespace-pre-wrap">
                                        {replyText}
                                      </div>
                                    </div>
                                  );
                                }
                                return null;
                              })}

                              {/* Admin Response */}
                              {selectedTicket.admin_response && (
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs text-yellow-400 font-semibold">
                                      Admin
                                    </span>
                                    <span className="text-xs text-white/40">
                                      Response
                                    </span>
                                  </div>
                                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 text-sm text-white/90 whitespace-pre-wrap">
                                    {selectedTicket.admin_response}
                                  </div>
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </div>

                    <div>
                      <Label className="text-white/70">Status</Label>
                      <Select value={ticketStatus} onValueChange={setTicketStatus}>
                        <SelectTrigger className="bg-[#0F1F3F] text-white">
                          <SelectValue placeholder="Choose status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-white/70">Response</Label>
                      <Textarea
                        className="bg-[#0F1F3F] text-white"
                        rows={6}
                        value={ticketResponse}
                        onChange={(e) => setTicketResponse(e.target.value)}
                        placeholder="Write your detailed response..."
                      />
                    </div>
                    <Button className="w-full bg-yellow-500 text-black hover:bg-yellow-400" onClick={handleUpdateTicket}>
                      Send Response
                    </Button>
                  </div>
                ) : (
                  <div className="flex h-48 flex-col items-center justify-center text-sm text-white/50">
                    <Headphones className="mb-3 h-8 w-8 text-white/30" />
                    Select a ticket from the list to review and respond.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          )}

          {/* Analytics View */}
          {activeView === 'analytics' && (
            <div className="space-y-6">
          <Card className="border-white/5 bg-[#0B152F]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-yellow-400" />
                    Platform Analytics
                  </CardTitle>
                  <CardDescription className="text-white/50">Comprehensive platform statistics and insights</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="rounded-xl bg-[#0F1F3F] p-4">
                      <p className="text-white/50 text-sm">Total Users</p>
                      <p className="text-3xl font-semibold text-yellow-400 mt-2">{users.length}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {users.filter((u) => u.role === 'admin').length} admins
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#0F1F3F] p-4">
                      <p className="text-white/50 text-sm">Total Tickets</p>
                      <p className="text-3xl font-semibold text-yellow-400 mt-2">{tickets.length}</p>
                      <p className="text-xs text-white/40 mt-1">
                        {tickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length} active
                      </p>
                    </div>
                    <div className="rounded-xl bg-[#0F1F3F] p-4">
                      <p className="text-white/50 text-sm">Total Mined</p>
                      <p className="text-3xl font-semibold text-yellow-400 mt-2">
                        {allStats.reduce((sum, stat) => sum + stat.total_mined, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-white/40 mt-1">BTC</p>
                    </div>
                    <div className="rounded-xl bg-[#0F1F3F] p-4">
                      <p className="text-white/50 text-sm">Hash Power</p>
                      <p className="text-3xl font-semibold text-yellow-400 mt-2">
                        {allStats.reduce((sum, stat) => sum + stat.hash_rate, 0).toFixed(2)}
                      </p>
                      <p className="text-xs text-white/40 mt-1">TH/s</p>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="rounded-xl bg-[#0F1F3F] p-4">
                      <p className="text-white/50 text-sm mb-4">Ticket Status Distribution</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Open</span>
                          <span className="text-yellow-400 font-semibold">
                            {tickets.filter((t) => t.status === 'open').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">In Progress</span>
                          <span className="text-yellow-400 font-semibold">
                            {tickets.filter((t) => t.status === 'in_progress').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Resolved</span>
                          <span className="text-yellow-400 font-semibold">
                            {tickets.filter((t) => t.status === 'resolved').length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Closed</span>
                          <span className="text-yellow-400 font-semibold">
                            {tickets.filter((t) => t.status === 'closed').length}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-xl bg-[#0F1F3F] p-4">
                      <p className="text-white/50 text-sm mb-4">User Activity</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">New Users (Last 7 days)</span>
                          <span className="text-yellow-400 font-semibold">
                            {users.filter((u) => {
                              const weekAgo = new Date();
                              weekAgo.setDate(weekAgo.getDate() - 7);
                              return new Date(u.created_at) > weekAgo;
                            }).length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Active Miners</span>
                          <span className="text-yellow-400 font-semibold">
                            {allStats.filter((s) => s.total_mined > 0).length}
                          </span>
              </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-sm">Average Daily Earnings</span>
                          <span className="text-yellow-400 font-semibold">
                            {allStats.length > 0
                              ? (allStats.reduce((sum, s) => sum + s.daily_earnings, 0) / allStats.length).toFixed(4)
                              : '0.0000'}{' '}
                            BTC
                        </span>
                        </div>
                      </div>
                    </div>
                  </div>
            </CardContent>
          </Card>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AdminDashboard;

