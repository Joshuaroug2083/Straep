'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Logo } from '../../components/Logo';
import Link from 'next/link';
import { 
  Home, 
  Compass, 
  LayoutDashboard, 
  Inbox, 
  Settings, 
  LogOut,
  Menu,
  X,
  CreditCard
} from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, fetchMe } = useAuth();
  
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Hydrate user profile details if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchMe().catch(() => {
        // Token expired/failed
        router.push('/login');
      });
    } else {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  const navItems = [
    { label: 'Home Feed', href: '/home', icon: <Home className="w-5 h-5" /> },
    { label: 'Discover', href: '/discover', icon: <Compass className="w-5 h-5" /> },
  ];

  // Show business/dashboard options if user has a brand or is creator/business
  if (user && user.account_type !== 'personal') {
    navItems.push(
      { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
      { label: 'Leads Inbox', href: '/dashboard/leads', icon: <Inbox className="w-5 h-5" /> },
      { label: 'Billing', href: '/dashboard/billing', icon: <CreditCard className="w-5 h-5" /> }
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-dark-900 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex md:w-64 flex-col bg-slate-950 border-r border-white/5 flex-shrink-0 p-6">
        <Logo size="sm" className="mb-8" />
        
        <nav className="flex-1 flex flex-col gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 font-outfit
                  ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }
                `}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User profile section at the bottom of the sidebar */}
        <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
          {user && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-sm text-white uppercase shadow-md shadow-primary-500/10">
                {user.email.charAt(0)}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-slate-300 truncate">{user.email}</span>
                <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">
                  {user.plan} PLAN
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 font-outfit text-left cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Header - Mobile */}
      <header className="md:hidden flex items-center justify-between p-4 bg-slate-950 border-b border-white/5 z-20">
        <Logo size="sm" />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="text-slate-300 hover:text-white focus:outline-none cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Drawer Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[61px] bg-slate-950 z-10 flex flex-col p-6 gap-6">
          <nav className="flex-1 flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 font-outfit
                    ${
                      isActive
                        ? 'bg-primary-600 text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                    }
                  `}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-primary-600 to-accent-500 flex items-center justify-center font-bold text-sm text-white uppercase">
                  {user.email.charAt(0)}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-semibold text-slate-300 truncate">{user.email}</span>
                  <span className="text-[10px] text-primary-400 font-bold uppercase tracking-wider">
                    {user.plan} PLAN
                  </span>
                </div>
              </div>
            )}
            
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleLogout();
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/5 transition-all duration-200 font-outfit text-left cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>
    </div>
  );
}
