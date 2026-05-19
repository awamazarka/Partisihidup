'use client';

import Link from 'next/link';
import { LayoutDashboard, Box, ShoppingCart, Calculator, BarChart3, ReceiptText, Home, Menu, X, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import { signOut } from '@/app/auth/actions';

const adminItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Inventory', href: '/inventory', icon: Box },
  { name: 'Store', href: '/store', icon: ShoppingCart },
  { name: 'Profit', href: '/profit', icon: Calculator },
  { name: 'Orders', href: '/orders', icon: ReceiptText },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

const userItems = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Store', href: '/store', icon: ShoppingCart },
];

export default function Navbar({ initialRole }: { initialRole: string | null }) {
  const [role, setRole] = useState<string | null>(initialRole);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setRole(initialRole);
    if (initialRole) {
      localStorage.setItem('user-role', initialRole);
    } else {
      localStorage.removeItem('user-role');
    }
  }, [initialRole]);

  const navItems = role === 'admin' ? adminItems : userItems;

  const handleLogout = async () => {
    localStorage.removeItem('user-role');
    setIsMenuOpen(false);
    await signOut();
  };

  return (
    <>
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-[100] w-[95%] max-w-6xl">
        <div className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl md:rounded-2xl px-4 md:px-6 py-2 md:py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-[#FFD600] border-[2px] md:border-[3px] border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
              <span className="font-black text-black text-xl md:text-2xl italic">AB</span>
            </div>
            <span className="font-black text-sm md:text-lg tracking-tighter uppercase italic text-black">
              <span className="hidden sm:inline"></span>Only Diecaster Santuy
            </span>
          </Link>
          
          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="neo-brutal-nav-item text-[10px] font-black uppercase italic flex items-center gap-2 text-black px-3 py-1 hover:bg-zinc-100 transition-colors"
              >
                <item.icon className="w-4 h-4 text-black" />
                {item.name}
              </Link>
            ))}
            
            <div className="h-6 w-[2px] bg-black mx-2" />
            
            {role ? (
               <button onClick={handleLogout} className="bg-[#FB923C] border-[2px] border-black px-3 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-black">
                  Logout ({role})
               </button>
            ) : (
              <Link href="/login" className="bg-[#A3E635] border-[2px] border-black px-3 py-1 font-black text-[10px] uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all text-black">
                  Login
              </Link>
            )}
          </div>

          {/* Mobile Toggle */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden border-[2px] border-black p-1.5 bg-[#FFD600] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[1px] active:translate-y-[1px] transition-all text-black"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        <div className={`
          lg:hidden absolute top-full left-0 right-0 mt-4 bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden transition-all duration-300 transform
          ${isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}
        `}>
          <div className="p-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 border-[2px] border-black font-black uppercase italic text-sm hover:bg-[#FFD600] transition-colors text-black"
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
            
            <div className="h-[2px] bg-black my-2" />
            
            {role ? (
               <button 
                onClick={handleLogout}
                className="flex items-center gap-4 p-4 border-[2px] border-black bg-[#FB923C] font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-black"
               >
                  <LogOut className="w-5 h-5" /> Logout ({role})
               </button>
            ) : (
              <Link 
                href="/login" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-4 p-4 border-[2px] border-black bg-[#A3E635] font-black uppercase italic text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all text-black"
              >
                  <Home className="w-5 h-5" /> Login to Account
              </Link>
            )}
          </div>
        </div>
      </nav>
      
      {/* Overlay to close menu */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
