'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Box, ArrowUpRight, Tag, Star, Truck, Flame } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setIsMounted(true);
    async function fetchFeatured() {
      const { data } = await supabase
        .from('car_collection')
        .select('*')
        .eq('is_featured', true)
        .limit(4);
      
      if (data) setFeaturedItems(data);
    }
    fetchFeatured();
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col bg-zinc-950 overflow-hidden text-white selection:bg-[#FFD600] selection:text-black font-sans">
      
      <main className="flex-1 flex flex-col items-center pt-24 md:pt-32 relative z-10 w-full">
        {/* Hero Section with Contained JDM Background & Rainy Night Effects */}
        <section className="w-[95%] max-w-6xl flex flex-col items-center text-center gap-5 md:gap-8 pt-12 pb-24 md:py-24 px-6 md:px-10 relative overflow-hidden bg-black mx-auto rounded-2xl md:rounded-3xl group mb-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] cursor-default">
          
          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <img 
              src="/JDM silhouette.png" 
              alt="JDM Background" 
              className="w-full h-full object-cover opacity-70 scale-100 group-hover:scale-110 group-hover:opacity-90 transition-all duration-1000 ease-in-out"
            />
            {/* Dark inner shadow for seamless blend within the black box */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/80" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60" />
          </div>

          {/* Intensified Rain Layer */}
          <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden">
            {isMounted && [...Array(60)].map((_, i) => (
              <div 
                key={i} 
                className="absolute w-[1px] md:w-[2px] h-20 md:h-32 bg-white/40 animate-rain" 
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${0.6 + Math.random() * 0.4}s`,
                  filter: 'blur(0.5px)'
                }}
              />
            ))}
          </div>

          {/* Neon Light Streaks (Motion Blur) */}
          <div className="absolute inset-0 z-20 pointer-events-none overflow-hidden">
            {isMounted && [...Array(12)].map((_, i) => (
              <div 
                key={i} 
                className="absolute h-[2px] w-[400px] animate-neon-streak group-hover:h-[3px] group-hover:w-[600px] group-hover:brightness-150 transition-all duration-500 blur-[1px]" 
                style={{
                  top: `${10 + Math.random() * 80}%`,
                  backgroundColor: i % 3 === 0 ? '#00FFFF' : i % 3 === 1 ? '#FF007A' : '#FFDE03',
                  boxShadow: `0 0 25px ${i % 3 === 0 ? '#00FFFF' : i % 3 === 1 ? '#FF007A' : '#FFDE03'}`,
                  animationDelay: `${Math.random() * 4}s`,
                  animationDuration: `${1.2 + Math.random() * 1.5}s`
                }}
              />
            ))}
          </div>

          <div className="inline-flex items-center gap-2 px-4 md:px-5 py-1.5 md:py-2 bg-[#A3E635] border-[2px] md:border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black text-[9px] md:text-[10px] font-black tracking-widest uppercase rounded-full relative z-30">
            <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4" />
            MARKETPLACE JUALAN DIECAST
          </div>
          
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.9] md:leading-[0.85] uppercase italic text-white drop-shadow-[0_4px_10px_rgba(0,0,0,1)] md:drop-shadow-[0_8px_25px_rgba(0,0,0,1)] relative z-30">
            BUILD YOUR OWN <br />
            <span className="bg-[#FFDE03] px-3 md:px-5 py-1 border-[3px] md:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(163,230,53,1)] md:shadow-[10px_10px_0px_0px_rgba(163,230,53,1)] text-black inline-block transform -rotate-1 my-2 md:my-3">EMPIRE</span> <br />
            OF DIECAST.
          </h1>
          
          <div className="flex flex-col items-center gap-4 mt-2 md:mt-6 relative z-30 px-2">
            <div className="bg-[#A3E635] border-[3px] md:border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 md:p-5 transform -rotate-1">
              <p className="text-xs sm:text-base md:text-lg text-black font-bold italic leading-tight md:leading-relaxed">
                Marketplace jualan diecast & miniscale Only Diecaster Santuy
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10 w-full sm:w-auto relative z-30 px-4 md:px-0">
            <Link href="/login" className="bg-[#FFDE03] border-[3px] md:border-[4px] border-black px-8 md:px-12 py-3.5 md:py-5 font-black uppercase italic text-base md:text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-black flex items-center justify-center gap-3">
              GET STARTED <ArrowRight className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
            <Link href="/collection" className="bg-white border-[3px] md:border-[4px] border-black px-8 md:px-12 py-3.5 md:py-5 font-black uppercase italic text-base md:text-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-black flex items-center justify-center gap-3">
              SHOWCASE <ArrowUpRight className="w-5 h-5 md:w-6 md:h-6" />
            </Link>
          </div>
        </section>

        {/* Brand Marquee - Yellow Bar */}
        <div className="w-full py-6 md:py-10 bg-[#FFDE03] border-y-[4px] border-black mt-8 md:mt-24 transform -rotate-1 relative z-20 overflow-hidden">
            <div className="flex animate-scroll gap-10 md:gap-24 items-center whitespace-nowrap px-10">
                {[
                    'INNO64', 'KAIDOHOUSE', 'HOT WHEELS', 'MATCHBOX', 'TOMICA', 'MINI GT', 'TARMAC WORKS',
                    'INNO64', 'KAIDOHOUSE', 'HOT WHEELS', 'MATCHBOX', 'TOMICA', 'MINI GT', 'TARMAC WORKS',
                    'INNO64', 'KAIDOHOUSE', 'HOT WHEELS', 'MATCHBOX', 'TOMICA', 'MINI GT', 'TARMAC WORKS'
                ].map((brand, i) => (
                    <span key={i} className="text-2xl md:text-5xl font-black italic uppercase tracking-tighter text-black">
                        {brand}
                    </span>
                ))}
            </div>
        </div>

        {/* Section: Why Diecaster Santuy - Light Background */}
        <section className="w-full bg-[#FAF8F5] border-t-[4px] border-black -mt-12 md:-mt-24 relative z-10 transform -rotate-1 scale-105">
            <div className="w-full max-w-7xl mx-auto flex flex-col items-center pt-24 md:pt-48 pb-20 md:pb-24 px-12 md:px-6 transform rotate-1">
                <div className="bg-black text-[#A3E635] px-4 py-1 border-[2px] border-black mb-4 shadow-[3px_3px_0px_0px_#FFDE03]">
                    <span className="font-black uppercase italic text-[10px] tracking-widest">WHY DIECASTER SANTUY?</span>
                </div>
                
                <div className="text-center mb-8">
                    <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none text-black">
                        BUKAN SEKEDAR
                    </h3>
                    <div className="inline-block bg-[#FF007A] border-[4px] border-black px-6 md:px-10 py-3 md:py-5 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transform rotate-1 mt-1">
                        <h3 className="text-xl sm:text-2xl md:text-4xl font-black uppercase italic text-white tracking-tighter leading-none">
                            JUAL BELI BIASA.
                        </h3>
                    </div>
                </div>


                {/* Blue HOT DEAL Box */}
                <div className="mb-12 w-full max-w-4xl mx-auto">
                    <div className="bg-[#0066FF] border-[4px] border-black p-6 md:p-10 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] md:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row items-center md:justify-between gap-6 md:gap-8 transform -rotate-1">
                        <div className="space-y-3 text-center md:text-left">
                            <div className="inline-block bg-white border-[2px] border-black px-3 py-1 text-black font-black text-[10px] md:text-xs uppercase">🔥 HOT DEAL</div>
                            <h4 className="text-3xl md:text-5xl font-black text-white italic leading-none tracking-tighter">
                                KOLEKSI LANGKA <br />
                                HARGA MIRING.
                            </h4>
                            <p className="text-white font-bold italic text-xs md:text-sm opacity-90 max-w-md mx-auto md:mx-0">
                                Temukan Hot Wheels, Mini GT, Tomica edisi terbatas sebelum kehabisan — langsung dari kolektor ke kolektor.
                            </p>
                        </div>
                        <Link href="/store" className="w-full md:w-auto bg-[#FFDE03] border-[4px] border-black px-8 py-4 font-black text-black text-lg md:text-xl italic shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex justify-center items-center">
                            GASKEUN!
                        </Link>
                    </div>
                </div>

                {/* Reference Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mx-auto">
                    <FeatureCard 
                        icon={<Tag className="w-6 h-6 text-black" />}
                        title="HARGA TRANSPARAN."
                        description="Gak ada harga gelap. Semua koleksi dipajang dengan harga jujur, no drama."
                        btnLabel="CEK STORE ->"
                        href="/store"
                        color="bg-[#00FF94]"
                    />
                    <FeatureCard 
                        icon={<Star className="w-6 h-6 text-black" />}
                        title="KOMUNITAS."
                        description="Dibuat dari kolektor untuk kolektor. Kita ngebangun ekosistem diecast."
                        btnLabel="JOIN ->"
                        href="/login"
                        color="bg-[#FFDE03]"
                    />
                    <FeatureCard 
                        icon={<Truck className="w-6 h-6 text-black" />}
                        title="AMAN."
                        description="Packing double layer + bubble wrap. Blister utuh sampai tujuan."
                        btnLabel="ORDER ->"
                        href="/collection"
                        color="bg-[#FF007A]"
                        textColor="text-white"
                    />
                </div>

                {/* Dynamic Showcase */}
                <div className="w-full max-w-6xl mt-20 md:mt-32 mx-auto">
                    <div className="bg-[#FAF8F5] border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] md:shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] rounded-2xl md:rounded-3xl p-6 md:p-12 relative overflow-hidden group">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 md:gap-10 mb-10 relative z-10">
                            <div className="flex flex-col items-start gap-3 text-left">
                                <div className="bg-[#FF007A] text-white px-4 py-1 border-[2px] border-black font-black uppercase italic text-[10px] md:text-xs inline-block">SPEED FORCE!!</div>
                                <div className="inline-block bg-[#0066FF] border-[4px] border-black px-6 py-3 md:px-8 md:py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transform -rotate-1">
                                    <h2 className="text-3xl sm:text-4xl md:text-6xl font-black uppercase italic text-white tracking-tighter leading-none">CEKIDOT!</h2>
                                </div>
                            </div>
                            <Link href="/collection" className="w-full md:w-auto bg-[#FFDE03] text-black font-black uppercase px-6 py-3 border-[4px] border-black shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center text-base md:text-lg italic mb-2">
                                EXPLORE ALL <ArrowRight className="inline-block ml-3 w-5 h-5" />
                            </Link>
                        </div>
                        
                        <p className="text-zinc-600 font-bold max-w-lg text-sm md:text-base italic mb-12 md:mb-20 relative z-10 text-left">
                            Eksplorasi lebih lanjut AditBunta's collection. Dikurasi khusus untuk diecaster yang menghargai hobby diecast dan miniscale.
                        </p>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 relative z-10">
                            {featuredItems.length > 0 ? featuredItems.map((item, i) => (
                                <Link href="/collection" key={item.id} className="group bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-xl overflow-hidden hover:border-[#FFDE03] transition-all flex flex-col aspect-[3/4]">
                                    <div className="flex-1 relative overflow-hidden">
                                        {item.images && item.images[0] ? (
                                            <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-10"><Box className="w-16 h-16" /></div>
                                        )}
                                        <span className="absolute top-4 right-4 bg-black text-[#FFDE03] font-black text-2xl italic px-3 border-[2px] border-[#FFDE03]">#0{i+1}</span>
                                    </div>
                                    <div className="p-6 bg-white border-t-[4px] border-black group-hover:border-[#FFDE03] transition-colors text-left">
                                        <p className="text-[10px] font-black uppercase italic text-[#A3E635] leading-none mb-2">{item.brand}</p>
                                        <h4 className="text-base font-black uppercase italic text-black leading-tight truncate">{item.name}</h4>
                                    </div>
                                </Link>
                            )) : (
                                [1,2,3,4].map((_, i) => (
                                    <div key={i} className="aspect-[3/4] bg-zinc-100 border-[4px] border-black border-dashed flex items-center justify-center opacity-40">
                                        <Box className="w-16 h-16" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
      </main>

    </div>
  );
}

function FeatureCard({ icon, title, description, btnLabel, href, color, textColor = "text-black" }: { icon: any, title: string, description: string, btnLabel: string, href: string, color: string, textColor?: string }) {
  return (
    <div className={`${color} border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-6 flex flex-col h-full group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[14px_14px_0px_0px_rgba(0,0,0,1)] transition-all`}>
      <div className={`w-12 h-12 border-[4px] border-black bg-white flex items-center justify-center mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className={`text-xl font-black uppercase italic mb-2 leading-[0.9] ${textColor}`}>{title}</h3>
      <p className={`text-xs font-bold italic mb-4 leading-relaxed opacity-80 ${textColor}`}>{description}</p>
      <Link href={href} className={`mt-auto font-black uppercase italic text-xs underline decoration-[4px] underline-offset-[10px] hover:opacity-70 transition-opacity ${textColor}`}>
        {btnLabel}
      </Link>
    </div>
  );
}
