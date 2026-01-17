import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Wallet,
  CircleDollarSign,
  Pickaxe,
  Gift,
  MessageSquare,
  User,
  Users,
  ChevronRight,
  ChevronDown,
  List,
  CirclePlus,
  Lock,
  Key,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface MenuItem {
  label: string;
  icon: any;
  path?: string;
  view?: string;
  subItems?: Array<{
    label: string;
    path?: string;
    view?: string;
  }>;
}

interface UserSidebarProps {
  activeView?: string;
  onViewChange?: (view: string) => void;
  onSignOut?: () => void;
}

export const UserSidebar = ({ activeView, onViewChange, onSignOut }: UserSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [referralExpanded, setReferralExpanded] = useState(false);
  const [supportTicketExpanded, setSupportTicketExpanded] = useState(false);
  const [accountExpanded, setAccountExpanded] = useState(false);
  const [depositExpanded, setDepositExpanded] = useState(false);
  const [withdrawExpanded, setWithdrawExpanded] = useState(false);
  const [startMiningExpanded, setStartMiningExpanded] = useState(false);

  // Auto-expand menus based on active view
  useEffect(() => {
    if (activeView === 'my-referrals' || activeView === 'referral-bonus-logs' || activeView === 'withdraw-logs') {
      setReferralExpanded(true);
    }
    if (activeView === 'create-tickets' || activeView === 'all-tickets') {
      setSupportTicketExpanded(true);
    }
    if (activeView === 'profile' || activeView === 'wallets' || activeView === 'change-password') {
      setAccountExpanded(true);
    }
    if (location.pathname === '/deposit') {
      setDepositExpanded(true);
    }
    if (location.pathname === '/withdraw') {
      setWithdrawExpanded(true);
    }
    if (location.pathname === '/start-mining') {
      setStartMiningExpanded(true);
    }
  }, [activeView, location.pathname]);

  const menuItems: MenuItem[] = [
    { label: 'Dashboard', icon: Home, path: '/dashboard' },
    {
      label: 'Deposit',
      icon: Wallet,
      subItems: [
        { label: 'Deposit Now', path: '/deposit', view: 'deposit' },
        { label: 'Deposit Log', path: '/deposit', view: 'log' },
      ],
    },
    {
      label: 'Withdraw',
      icon: CircleDollarSign,
      subItems: [
        { label: 'Withdraw Now', path: '/withdraw', view: 'withdraw' },
        { label: 'Withdraw Log', path: '/withdraw', view: 'log' },
      ],
    },
    {
      label: 'Start Mining',
      icon: Pickaxe,
      subItems: [
        { label: 'Buy Plan', path: '/start-mining', view: 'buy' },
        { label: 'Purchased Plans', path: '/start-mining', view: 'purchased' },
        { label: 'Mining', path: '/start-mining', view: 'mining' },
      ],
    },
    {
      label: 'Referral',
      icon: Gift,
      subItems: [
        { label: 'My Referrals', view: 'my-referrals' },
        { label: 'Referral Bonus Logs', view: 'referral-bonus-logs' },
        { label: 'Withdraw Logs', view: 'withdraw-logs' },
      ],
    },
    {
      label: 'Support Ticket',
      icon: MessageSquare,
      subItems: [
        { label: 'Create Tickets', view: 'create-tickets' },
        { label: 'All Tickets', view: 'all-tickets' },
      ],
    },
    {
      label: 'My Account',
      icon: User,
      subItems: [
        { label: 'Profile', view: 'profile' },
        { label: 'Wallets', view: 'wallets' },
        { label: 'Change Password', view: 'change-password' },
      ],
    },
  ];

  const handleMenuClick = (item: MenuItem) => {
    if (item.subItems) {
      // Toggle the appropriate expanded state
      if (item.label === 'Referral') {
        setSupportTicketExpanded(false);
        setAccountExpanded(false);
        setDepositExpanded(false);
        setWithdrawExpanded(false);
        setStartMiningExpanded(false);
        setReferralExpanded(!referralExpanded);
        if (!referralExpanded && item.subItems.length > 0) {
          onViewChange?.(item.subItems[0].view || '');
        }
      } else if (item.label === 'Support Ticket') {
        setReferralExpanded(false);
        setAccountExpanded(false);
        setDepositExpanded(false);
        setWithdrawExpanded(false);
        setStartMiningExpanded(false);
        setSupportTicketExpanded(!supportTicketExpanded);
        if (!supportTicketExpanded && item.subItems.length > 0) {
          onViewChange?.(item.subItems[0].view || '');
        }
      } else if (item.label === 'My Account') {
        setReferralExpanded(false);
        setSupportTicketExpanded(false);
        setDepositExpanded(false);
        setWithdrawExpanded(false);
        setStartMiningExpanded(false);
        setAccountExpanded(!accountExpanded);
        if (!accountExpanded && item.subItems.length > 0) {
          onViewChange?.(item.subItems[0].view || '');
        }
      } else if (item.label === 'Deposit') {
        setReferralExpanded(false);
        setSupportTicketExpanded(false);
        setAccountExpanded(false);
        setWithdrawExpanded(false);
        setStartMiningExpanded(false);
        setDepositExpanded(!depositExpanded);
      } else if (item.label === 'Withdraw') {
        setReferralExpanded(false);
        setSupportTicketExpanded(false);
        setAccountExpanded(false);
        setDepositExpanded(false);
        setStartMiningExpanded(false);
        setWithdrawExpanded(!withdrawExpanded);
      } else if (item.label === 'Start Mining') {
        setReferralExpanded(false);
        setSupportTicketExpanded(false);
        setAccountExpanded(false);
        setDepositExpanded(false);
        setWithdrawExpanded(false);
        setStartMiningExpanded(!startMiningExpanded);
      }
    } else if (item.path) {
      navigate(item.path);
      setMobileMenuOpen(false);
    }
  };

  const handleSubItemClick = (subItem: { path?: string; view?: string }) => {
    // If sub-item has a path, navigate to it first
    if (subItem.path) {
      // If it also has a view, store it in sessionStorage for the target page to read
      if (subItem.view) {
        sessionStorage.setItem(`${subItem.path}_view`, subItem.view);
      }
      // If we're already on this path, trigger the view change immediately
      if (location.pathname === subItem.path && subItem.view) {
        // Call onViewChange to update the view immediately
        onViewChange?.(subItem.view);
        // Also trigger a custom event to ensure the page updates
        window.dispatchEvent(new CustomEvent('viewchange', { detail: { view: subItem.view } }));
      } else {
        navigate(subItem.path);
      }
    } else if (subItem.view) {
      // If it only has a view (no path), it's a Dashboard view
      // Navigate to dashboard first if not already there
      if (location.pathname !== '/dashboard') {
        // Store the view in sessionStorage for Dashboard to read
        sessionStorage.setItem('dashboard_view', subItem.view);
        navigate('/dashboard');
        // Use a small delay to ensure navigation completes before setting view
        setTimeout(() => {
          onViewChange?.(subItem.view!);
        }, 150);
      } else {
        // Already on dashboard, just change the view immediately
        onViewChange?.(subItem.view);
      }
    }
    setMobileMenuOpen(false);
  };

  const getExpandedState = (label: string): boolean => {
    switch (label) {
      case 'Referral':
        return referralExpanded;
      case 'Support Ticket':
        return supportTicketExpanded;
      case 'My Account':
        return accountExpanded;
      case 'Deposit':
        return depositExpanded;
      case 'Withdraw':
        return withdrawExpanded;
      case 'Start Mining':
        return startMiningExpanded;
      default:
        return false;
    }
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden text-white hover:bg-white/10 fixed top-4 left-4 z-50"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 lg:z-auto w-64 min-h-screen bg-[#0F1A2B] border-r border-white/5 p-4 transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Close button for mobile */}
        {mobileMenuOpen && (
          <div className="flex justify-end mb-4 lg:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/10"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        )}

        <div className="space-y-2">
          {menuItems.map((item) => (
            <div key={item.label}>
              {item.subItems ? (
                <div>
                  <button
                    onClick={() => handleMenuClick(item)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm transition ${
                      getExpandedState(item.label)
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'text-white/70 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </div>
                    {getExpandedState(item.label) ? (
                      <ChevronDown className="h-4 w-4 text-white/40 transition-transform duration-200" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-white/40 transition-transform duration-200" />
                    )}
                  </button>
                  {/* Animated submenu */}
                  <div
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      getExpandedState(item.label) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="ml-4 space-y-1 mt-1">
                      {item.subItems.map((subItem: any) => {
                        const isActive =
                          (subItem.view && activeView === subItem.view) ||
                          (subItem.path && location.pathname === subItem.path && (!subItem.view || activeView === subItem.view));
                        return (
                          <button
                            key={subItem.label}
                            onClick={() => handleSubItemClick(subItem)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition ${
                              isActive
                                ? 'bg-yellow-500/20 text-yellow-400'
                                : 'text-white/70 hover:text-white hover:bg-white/5'
                            }`}
                          >
                            {subItem.view === 'my-referrals' && <Users className="h-4 w-4" />}
                            {subItem.view === 'referral-bonus-logs' && <List className="h-4 w-4" />}
                            {subItem.view === 'withdraw-logs' && <List className="h-4 w-4" />}
                            {subItem.view === 'create-tickets' && <CirclePlus className="h-4 w-4" />}
                            {subItem.view === 'all-tickets' && <List className="h-4 w-4" />}
                            {subItem.view === 'profile' && <User className="h-4 w-4" />}
                            {subItem.view === 'wallets' && <Wallet className="h-4 w-4" />}
                            {subItem.view === 'change-password' && <Key className="h-4 w-4" />}
                            {subItem.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => handleMenuClick(item)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
                    location.pathname === item.path
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        {onSignOut && (
          <div className="mt-8 pt-8 border-t border-white/10">
            <Button
              variant="outline"
              className="w-full border-rose-500 text-rose-400 hover:bg-rose-500/10"
              onClick={onSignOut}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
};

