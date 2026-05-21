'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck, Box, ArrowUpRight, Tag, Star, Truck, Flame } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function Home() {
  const [featuredItems, setFeaturedItems] = useState<any[]>([]);
  const supabase = createClient();

  useEffect(() => {
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
      
      {/* Background Image Grid */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-0 grayscale brightness-50 contrast-125">
           {[
             'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=800&auto=format&fit=crop',
             'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
             'https://images.unsplash.com/photo-1542282088-fe8426682b8f?q=80&w=800&auto=format&fit=crop',
             'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=800&auto=format&fit=crop',
             'https://images.unsplash.com/photo-1583121274602-3e2820c69888?q=80&w=800&auto=format&fit=crop',
             'https://images.unsplash.com/photo-1553440569-bcc63803a83d?q=80&w=800&auto=format&fit=crop',
           ].map((url, idx) => (
             <div key={idx} className="aspect-[4/3] relative overflow-hidden border-[0.5px] border-zinc-800">
                <img src={url} alt="Bkg" className="w-full h-full object-cover" />
             </div>
           ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-zinc-950/80 to-zinc-950" />
      </div>

      <main className="flex-1 flex flex-col items-center pt-24 md:pt-32 relative z-10">
        {/* Hero Section */}
        <section className="w-full max-w-5xl flex flex-col items-center text-center gap-6 md:gap-8 pt-8 pb-24 md:py-12 px-10">
          <div className="inline-flex items-center gap-2 px-5 py-2 bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] text-black text-[10px] font-black tracking-widest uppercase rounded-full">
            <Sparkles className="w-4 h-4" />
            MARKETPLACE JUALAN DIECAST
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black tracking-tighter leading-[0.85] uppercase italic text-white drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            BUILD YOUR OWN <br />
            <span className="bg-[#FFDE03] px-5 py-1 border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(163,230,53,1)] text-black inline-block transform -rotate-1 my-3">EMPIRE</span> <br />
            OF DIECAST.
          </h1>
          
          <div className="flex flex-col items-center gap-4 mt-4 md:mt-6">
            <div className="bg-[#A3E635] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-4 md:p-5 transform -rotate-1">
              <p className="text-sm sm:text-base md:text-lg text-black font-bold italic leading-relaxed">
                Marketplace jualan diecast & miniscale Only Diecaster Santuy
              </p>
            </div>
            <div className="bg-[#FF007A] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-4 md:p-5 transform rotate-1">
              <p className="text-sm sm:text-base md:text-lg text-white font-bold italic leading-relaxed">
                Next generation diecast management for true collectors.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 mt-8 md:mt-10 w-full sm:w-auto relative z-20">
            <Link href="/login" className="bg-[#FFDE03] border-[4px] border-black px-10 md:px-12 py-4 md:py-5 font-black uppercase italic text-lg md:text-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-black flex items-center justify-center gap-3">
              GET STARTED <ArrowRight className="w-6 h-6" />
            </Link>
            <Link href="/collection" className="bg-white border-[4px] border-black px-10 md:px-12 py-4 md:py-5 font-black uppercase italic text-lg md:text-xl shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px] text-black flex items-center justify-center gap-3">
              SHOWCASE <ArrowUpRight className="w-6 h-6" />
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
