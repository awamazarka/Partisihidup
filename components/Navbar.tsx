'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Box, ShoppingCart, Calculator, BarChart3, ReceiptText, Home, Menu, X, LogOut, Sparkles, UserCircle, Gamepad2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { signOut } from '@/app/auth/actions';
import { createClient } from '@/utils/supabase/client';

const adminItems = [
  { name: 'Dash', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inv', href: '/inventory', icon: Box },
  { name: 'Vault', href: '/collection', icon: Sparkles },
  { name: 'Store', href: '/store', icon: ShoppingCart },
  { name: 'Game', href: '/game', icon: Gamepad2 },
  { name: 'Profit', href: '/profit', icon: Calculator },
  { name: 'Orders', href: '/orders', icon: ReceiptText },
  { name: 'Stats', href: '/analytics', icon: BarChart3 },
];

const userItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Vault', href: '/collection', icon: Sparkles },
  { name: 'Store', href: '/store', icon: ShoppingCart },
  { name: 'Game', href: '/game', icon: Gamepad2 },
];

export default function Navbar({ initialRole }: { initialRole: string | null }) {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(initialRole);
  const [username, setUsername] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isGameActive, setIsGameActive] = useState(false);

  const isHomePage = pathname === '/';
  const isGamePage = pathname === '/game';
  const textColor = isScrolled ? 'text-black' : ((isHomePage || isGamePage) ? 'text-white' : 'text-black');

  const supabase = createClient();

  useEffect(() => {
    // Listen for game activity to hide navbar
    const handleGameActive = (e: any) => setIsGameActive(e.detail);
    window.addEventListener('game-active', handleGameActive);

    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
          return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    const currentRole = getCookie('user-role');
    setRole(currentRole);

    const getUser = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            // Fetch username directly from profiles table
            const { data: profile } = await supabase
                .from('profiles')
                .select('username')
                .eq('id', session.user.id)
                .single();
            
            setUsername(profile?.username || 'Member');
            if (!currentRole) setRole('user');
        } else if (currentRole === 'admin') {
            setUsername('Admin');
        } else {
            setUsername(null);
        }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const updatedRole = getCookie('user-role');
      if (session?.user) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', session.user.id)
            .single();
            
        setUsername(profile?.username || 'Member');
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
      setIsScrolled(window.scrollY > 30);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('game-active', handleGameActive);
        subscription.unsubscribe();
    };
  }, [initialRole, supabase.auth]);

  const navItems = role === 'admin' ? adminItems : userItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('user-role');
    document.cookie = "user-role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    setRole(null);
    setUsername(null);
    setIsMenuOpen(false);
    window.location.href = '/login';
  };

  return (
    <>
      <nav 
        className={`
          fixed z-[100] top-0 left-0 w-full transition-all duration-500 ease-in-out pointer-events-none
          ${isScrolled ? 'pt-3 md:pt-6' : 'pt-0'}
          ${isGameActive ? 'opacity-0' : 'opacity-100'}
        `}
      >
        <div 
          className={`
            transition-all duration-500 ease-in-out flex items-center justify-between mx-auto pointer-events-none
            ${isScrolled 
              ? 'w-[94%] max-w-7xl bg-white/95 backdrop-blur-md border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-xl md:rounded-2xl px-4 md:px-8 py-2 md:py-3' 
              : 'w-full bg-transparent border-none shadow-none rounded-none px-6 md:px-16 py-4 md:py-8'
            }
          `}
        >
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 md:gap-6 group shrink-0 pointer-events-auto">
            <div className={`
              flex items-center justify-center transition-all duration-500
              ${isScrolled 
                ? 'w-14 h-14 md:w-20 md:h-20' 
                : 'w-20 h-20 md:w-44 md:h-44'
              }
            `}>
              <Image 
                src="/logo_yellow.png" 
                alt="AditBunta Logo" 
                width={256} 
                height={256} 
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className={`font-black tracking-tighter uppercase italic leading-none transition-all ${textColor} ${isScrolled ? 'text-lg md:text-2xl' : 'text-2xl md:text-4xl'}`}>
                Only Diecaster
              </span>
              {!isScrolled && (
                <span className={`hidden md:block font-bold text-[10px] uppercase tracking-widest mt-1 ${isHomePage ? 'text-[#FFD600]' : 'text-[#FB923C]'}`}>
                  Santuy & Premium
                </span>
              )}
            </div>
          </Link>

          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1 xl:gap-2 pointer-events-auto">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`neo-brutal-nav-item text-[11px] xl:text-xs font-black uppercase italic flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-[#FFD600] hover:text-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all whitespace-nowrap ${textColor}`}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
            
            <div className={`h-6 w-[2px] mx-2 opacity-20 ${isScrolled || !isHomePage ? 'bg-black' : 'bg-white'}`} />
            
            {role ? (
               <div className="flex items-center gap-3">
                  <div className="flex flex-col items-end shrink-0 leading-tight">
                      <span className={`text-[7px] font-black uppercase italic ${isScrolled || !isHomePage ? 'text-[#FB923C]' : 'text-[#A3E635]'}`}>Active</span>
                      <span className={`text-[10px] font-black uppercase italic truncate max-w-[90px] ${textColor}`}>{username || 'User'}</span>
                  </div>
                  <button onClick={handleLogout} className="bg-[#FB923C] border-[2px] border-black px-4 py-2 font-black text-[10px] uppercase shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none transition-all text-black whitespace-nowrap">
                     Logout
                  </button>
               </div>
            ) : (
              <Link href="/login" className="bg-[#A3E635] border-[3px] border-black px-6 py-2.5 font-black text-xs uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-black whitespace-nowrap">
                  Sign In
              </Link>
            )}
          </div>

          {/* Mobile Right Controls */}
          <div className="flex lg:hidden items-center gap-3 pointer-events-auto">
            <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`border-[2.5px] border-black p-2 bg-[#FFD600] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all text-black`}
            >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown - FULLY OPTIMIZED */}
        <div className={`
          lg:hidden absolute top-full left-1/2 -translate-x-1/2 w-[94%] mt-3 bg-white border-[3px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden transition-all duration-500 transform origin-top pointer-events-auto
          ${isMenuOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95 !pointer-events-none'}
        `}>
          <div className="max-h-[80vh] overflow-y-auto p-4 flex flex-col gap-2">
            {/* User Info on Mobile Header */}
            {role && (
               <div className="flex items-center gap-3 p-4 bg-zinc-50 border-[2px] border-black mb-2">
                   <div className="p-2 bg-[#FFD600] border-[2px] border-black rounded-lg">
                       <UserCircle className="w-6 h-6 text-black" />
                   </div>
                   <div className="flex flex-col">
                       <span className="text-[9px] font-black uppercase italic text-black/40 leading-none mb-1">Session Active as</span>
                       <span className="text-sm font-black uppercase italic text-[#FB923C] leading-none">{username}</span>
                   </div>
               </div>
            )}

            <div className="grid grid-cols-2 gap-2">
                {navItems.map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-4 border-[2px] border-black bg-[#FAF8F5] font-black uppercase italic text-xs hover:bg-[#FFD600] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all text-black"
                >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.name}
                </Link>
                ))}
            </div>
            
            <div className="h-[2px] bg-black my-4 opacity-10" />
            
            {role ? (
               <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-4 p-5 border-[3px] border-black bg-[#FB923C] font-black uppercase italic text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all text-black"
               >
                  <LogOut className="w-6 h-6" /> SIGN OUT NOW
               </button>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="w-full flex items-center justify-center gap-4 p-5 border-[3px] border-black bg-[#A3E635] font-black uppercase italic text-base shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[3px] active:translate-y-[3px] transition-all text-black"
              >
                  <UserCircle className="w-6 h-6" /> LOGIN TO ACCOUNT
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Overlay to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
