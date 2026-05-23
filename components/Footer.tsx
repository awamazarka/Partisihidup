'use client';

import { Car, Send, Camera, Globe, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function Footer() {
  const [role, setRole] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    setRole(localStorage.getItem('user-role'));
    const handleStorageChange = () => setRole(localStorage.getItem('user-role'));
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const adminNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Orders', href: '/orders' },
    { name: 'Store', href: '/store' },
    { name: 'Showcase', href: '/collection' },
    { name: 'Analytics', href: '/analytics' },
    { name: 'Profit Calc', href: '/profit' },
  ];

  const userNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Online Store', href: '/store' },
    { name: 'Showcase', href: '/collection' },
    { name: 'Privacy Policy', href: '#' },
  ];

  const navLinks = role === 'admin' ? adminNavLinks : userNavLinks;

  return (
    <footer className="mt-auto border-t-[4px] border-black bg-white">
      {/* Single Animated Car Lane - Moving Left */}
      <div className="h-12 bg-[#FAF8F5] border-b-[3px] border-black relative overflow-hidden flex items-center">
        <div className="absolute inset-0 flex items-center justify-around opacity-10 pointer-events-none">
           {[...Array(20)].map((_, i) => (
             <div key={i} className="w-8 h-[2px] bg-black/20" />
           ))}
        </div>
        <div className="animate-drive-left absolute w-full flex justify-end">
          <div className="flex flex-col items-center">
             <Car className="w-8 h-8 text-black scale-x-[-1]" />
             <div className="w-10 h-1 bg-black/10 blur-[2px] mt-[-4px]" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Brand Section */}
          <div className="md:col-span-1 space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 flex items-center justify-center">
                <Image 
                  src="/logo_yellow.png" 
                  alt="AditBunta Logo" 
                  width={48} 
                  height={48} 
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-black text-xl tracking-tighter uppercase italic text-black">
                Only Diecaster
              </span>
            </Link>
            <p className="text-black font-bold italic max-w-sm leading-relaxed">
              Tempat kumpulnya kolektor diecast buat pantau stok dan cari barang incaran dengan gampang. Santuy, rapi, dan makin asik koleksinya!
            </p>
            <div className="flex gap-4">
              <SocialBtn icon={<Camera className="w-5 h-5" />} href="#" />
              <SocialBtn icon={<Send className="w-5 h-5" />} href="#" />
              <SocialBtn icon={<Globe className="w-5 h-5" />} href="#" />
              <SocialBtn icon={<Mail className="w-5 h-5" />} href="#" />
            </div>
          </div>

          {/* Dynamic Navigation Links */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
            {role === 'admin' ? (
              <>
                <div className="space-y-4">
                  <h4 className="font-black uppercase italic text-sm underline decoration-[3px] decoration-[#A3E635]">Management</h4>
                  <ul className="space-y-2">
                    {adminNavLinks.slice(0, 4).map((link) => (
                      <FooterLink key={link.href} href={link.href}>{link.name}</FooterLink>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black uppercase italic text-sm underline decoration-[3px] decoration-[#FB923C]">Business Intel</h4>
                  <ul className="space-y-2">
                    {adminNavLinks.slice(4).map((link) => (
                      <FooterLink key={link.href} href={link.href}>{link.name}</FooterLink>
                    ))}
                    <FooterLink href="#">Privacy Policy</FooterLink>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-4">
                  <h4 className="font-black uppercase italic text-sm underline decoration-[3px] decoration-[#A3E635]">Navigation</h4>
                  <ul className="space-y-2">
                    {userNavLinks.slice(0, 2).map((link) => (
                      <FooterLink key={link.href} href={link.href}>{link.name}</FooterLink>
                    ))}
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="font-black uppercase italic text-sm underline decoration-[3px] decoration-[#FB923C]">Explore</h4>
                  <ul className="space-y-2">
                    {userNavLinks.slice(2).map((link) => (
                      <FooterLink key={link.href} href={link.href}>{link.name}</FooterLink>
                    ))}
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-12 pt-8 border-t-[3px] border-black border-dashed flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="font-black uppercase italic text-xs text-black/60">
            &copy; {currentYear} AditBunta. NO DRAMA, JUST DIECAST.
          </p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[#A3E635] animate-pulse rounded-full border-[1px] border-black" />
            <span className="font-black uppercase italic text-[10px] tracking-widest text-black/40">
              {role === 'admin' ? 'Admin Portal Online' : 'Collector Diecast Gateway'}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ icon, href }: { icon: any, href: string }) {
  return (
    <Link 
      href={href} 
      className="p-2 border-[2px] border-black bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all hover:bg-[#FFD600]"
    >
      {icon}
    </Link>
  );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
  return (
    <li>
      <Link 
        href={href} 
        className="font-bold text-sm uppercase italic text-black/60 hover:text-black hover:underline decoration-2 underline-offset-4 transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
