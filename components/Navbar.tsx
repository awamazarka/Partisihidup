'use client';

import Link from 'next/link';
import { LayoutDashboard, Box, ShoppingCart, Calculator, BarChart3, ReceiptText, Home, Menu, X, LogOut, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { signOut } from '@/app/auth/actions';
import { createClient } from '@/utils/supabase/client';

const adminItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Showcase', href: '/collection', icon: Sparkles },
  { name: 'Store', href: '/store', icon: ShoppingCart },
  { name: 'Profit', href: '/profit', icon: Calculator },
  { name: 'Orders', href: '/orders', icon: ReceiptText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const userItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Showcase', href: '/collection', icon: Sparkles },
  { name: 'Store', href: '/store', icon: ShoppingCart },
];

export default function Navbar({ initialRole }: { initialRole: string | null }) {
  const [role, setRole] = useState<string | null>(initialRole);
  const [username, setUsername] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    // Function to get cookie value
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const currentRole = getCookie('user-role');
    setRole(currentRole);

    const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            setUsername(session.user.email?.split('@')[0] || 'Member');
            // If logged in via Supabase but no role cookie, default to user
            if (!currentRole) setRole('user');
        } else if (currentRole === 'admin') {
            setUsername('Admin');
        } else {
            setUsername(null);
        }
    };
    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const updatedRole = getCookie('user-role');
      if (session?.user) {
        setUsername(session.user.email?.split('@')[0] || 'Member');
        setRole(updatedRole || 'user');
      } else if (updatedRole === 'admin') {
        setUsername('Admin');
        setRole('admin');
      } else {
        setUsername(null);
        setRole(null);
      }
    });

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
        window.removeEventListener('scroll', handleScroll);
        subscription.unsubscribe();
    };
  }, [initialRole]);

  const navItems = role === 'admin' ? adminItems : userItems;

  const handleLogout = async () => {
    localStorage.removeItem('user-role');
    setIsMenuOpen(false);
    await signOut();
  };

  return (
    <>
      <nav 
        className={`
          fixed z-[100] top-0 left-0 w-full transition-all duration-700 ease-in-out
          ${isScrolled ? 'pt-4 md:pt-6' : 'pt-0'}
        `}
      >
        <div 
          className={`
            bg-white/90 backdrop-blur-md border-black transition-all duration-700 ease-in-out flex items-center justify-between mx-auto
            ${isScrolled 
              ? 'w-[90%] max-w-7xl border-[3px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl md:rounded-3xl px-6 py-3' 
              : 'w-full border-b-[4px] border-x-0 border-t-0 shadow-none rounded-none px-8 md:px-16 py-6 md:py-10'
            }
          `}
        >
          <Link href="/" className="flex items-center gap-3 group">
            <div className={`
              bg-[#FFD600] border-black flex items-center justify-center transition-all duration-500
              ${isScrolled 
                ? 'w-10 h-10 border-[3px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' 
                : 'w-12 h-12 md:w-14 md:h-14 border-[4px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }
            `}>
              <span className={`font-black text-black italic transition-all ${isScrolled ? 'text-xl' : 'text-3xl'}`}>AB</span>
            </div>
            <div className="flex flex-col">
              <span className={`font-black tracking-tighter uppercase italic text-black leading-none transition-all ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
                Only Diecaster
              </span>
              <span className={`font-bold text-[10px] uppercase tracking-widest text-[#FB923C] transition-all ${isScrolled ? 'opacity-0 h-0' : 'opacity-100 mt-1'}`}>
                Santuy & Premium
              </span>
            </div>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="neo-brutal-nav-item text-[11px] font-black uppercase italic flex items-center gap-1.5 text-black px-3 py-1.5 hover:bg-[#FFD600] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all whitespace-nowrap"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            
            <div className="h-6 w-[2px] bg-black mx-2 opacity-20" />
            
            {role ? (
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end shrink-0">
                      <span className="text-[7px] font-black uppercase italic text-[#FB923C] leading-none">Logged in as</span>
                      <span className="text-[9px] font-black uppercase italic text-black leading-none truncate max-w-[80px]">{username || 'Loading...'}</span>
                  </div>
                  <button onClick={handleLogout} className="bg-[#FB923C] border-[2px] border-black px-3 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-black whitespace-nowrap">
                     Logout
                  </button>
               </div>
            ) : (
              <Link href="/login" className="bg-[#A3E635] border-[3px] border-black px-4 py-2 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-black whitespace-nowrap">
                  Sign In
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden border-[3px] border-black p-2 bg-[#FFD600] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-black"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`
          lg:hidden absolute top-full left-1/2 -translate-x-1/2 w-[90%] mt-4 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden transition-all duration-500 transform
          ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 pointer-events-none'}
        `}>
          <div className="p-6 flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-5 border-[3px] border-black font-black uppercase italic text-lg hover:bg-[#FFD600] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-black"
              >
                <item.icon className="w-6 h-6" />
                {item.name}
              </Link>
            ))}
            
            <div className="h-[3px] bg-black my-4 opacity-10" />
            
            {role ? (
               <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-4 bg-zinc-50 border-[2px] border-black">
                      <span className="text-[10px] font-black uppercase italic text-black/40">Active Session:</span>
                      <span className="text-sm font-black uppercase italic text-[#FB923C]">{username || 'User'}</span>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-4 p-5 border-[3px] border-black bg-[#FB923C] font-black uppercase italic text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all text-black"
                  >
                      <LogOut className="w-6 h-6" /> Logout
                  </button>
               </div>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center gap-4 p-5 border-[3px] border-black bg-[#A3E635] font-black uppercase italic text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all text-black"
              >
                  <Home className="w-6 h-6" /> Login to Account
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Overlay to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-md lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
