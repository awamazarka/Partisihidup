import { ArrowRight, Sparkles, Zap, ShieldCheck, Box } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-[#FAF8F5] overflow-hidden">
      <main className="flex-1 flex flex-col items-center pt-24 px-6 relative z-20">
        {/* Hero Section */}
        <section className="w-full max-w-5xl flex flex-col items-center text-center gap-6 py-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-xs font-black tracking-widest uppercase">
            <Sparkles className="w-4 h-4" />
            Next Generation Diecast Management
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-tight uppercase italic text-black">
            Manage Your <br />
            <span className="bg-[#FFD600] px-4 border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">EMPIRE</span> <br />
            of Miniature.
          </h1>
          
          <p className="max-w-2xl text-base md:text-lg text-black font-bold leading-relaxed mt-4">
            The ultimate inventory management & business intelligence dashboard 
            built specifically for professional diecast collectors and resellers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mt-6 w-full sm:w-auto">
            <Link href="/login" className="neo-brutal-btn-yellow text-lg md:text-xl px-10 py-5 inline-flex items-center justify-center">
              Get Started Free <ArrowRight className="ml-2 w-6 h-6" />
            </Link>
            <button className="bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase tracking-wider px-10 py-5 transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black text-lg md:text-xl">
              View Showcase
            </button>
          </div>
        </section>

        {/* Brand Carousel */}
        <div className="w-full py-8 md:py-12 overflow-hidden border-y-[4px] border-black bg-white my-10">
            <div className="flex animate-scroll gap-10 md:gap-20 items-center min-w-[200%]">
                {[
                    'HOT WHEELS', 'MATCHBOX', 'TOMICA', 'MINI GT', 'TARMAC WORKS', 'INNO64', 'MAJORETTE', 'AUTOART',
                    'HOT WHEELS', 'MATCHBOX', 'TOMICA', 'MINI GT', 'TARMAC WORKS', 'INNO64', 'MAJORETTE', 'AUTOART'
                ].map((brand, i) => (
                    <span key={i} className="text-2xl md:text-4xl font-black italic uppercase tracking-tighter whitespace-nowrap text-black">
                        {brand}
                    </span>
                ))}
            </div>
        </div>

        {/* Feature Grid */}
        <section className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8 py-20">
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Real-time Analytics"
            description="Monitor your portfolio value and profit margins with live data synchronization."
            color="bg-[#A3E635]"
          />
          <FeatureCard 
            icon={<ShieldCheck className="w-8 h-8" />}
            title="Inventory Shield"
            description="Track every single asset with detailed history and condition reports."
            color="bg-[#FFD600]"
          />
          <FeatureCard 
            icon={<Box className="w-8 h-8" />}
            title="Smart Store"
            description="Seamlessly list your items for sale across multiple channels from one dashboard."
            color="bg-[#FB923C]"
          />
        </section>

        {/* Showcase Preview */}
        <section className="w-full max-w-5xl py-20">
          <div className="bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 md:p-12 relative overflow-hidden group">
            <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-12">
              <div className="space-y-4">
                <h2 className="text-4xl font-black uppercase italic">Featured Collection</h2>
                <p className="text-black font-bold max-w-md">
                  Explore the most rare and high-value diecast models currently in our global network.
                </p>
              </div>
              <button className="bg-black text-white font-black uppercase px-6 py-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(255,214,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                Explore All Items <ArrowRight className="inline-block ml-2 w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square bg-[#FAF8F5] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-hidden group/item hover:bg-[#FFD600] transition-colors">
                  <span className="text-black font-black text-6xl italic opacity-20">#0{i}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative py-12 border-t-[4px] border-black bg-[#FFD600] text-center overflow-hidden">
        {/* Road and Car Animation */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
           <div className="absolute top-1/2 left-0 w-full h-[2px] bg-black border-dashed border-b-[2px]" />
        </div>
        
        <div className="w-full h-24 md:h-32 mb-4 relative overflow-hidden flex items-center">
          <div className="flex gap-20 md:gap-40 animate-scroll-fast whitespace-nowrap min-w-max px-10 md:px-20">
            <NeoBrutalCar type="porsche" color="bg-white" />
            <NeoBrutalCar type="ferrari" color="bg-red-600" />
            <NeoBrutalCar type="lambo" color="bg-[#A3E635]" />
            <NeoBrutalCar type="supra" color="bg-[#FB923C]" />
            <NeoBrutalCar type="skyline" color="bg-blue-600" />
            <NeoBrutalCar type="rwb" color="bg-zinc-800" />
            {/* Duplicate for infinite loop */}
            <NeoBrutalCar type="porsche" color="bg-white" />
            <NeoBrutalCar type="ferrari" color="bg-red-600" />
            <NeoBrutalCar type="lambo" color="bg-[#A3E635]" />
            <NeoBrutalCar type="supra" color="bg-[#FB923C]" />
            <NeoBrutalCar type="skyline" color="bg-blue-600" />
            <NeoBrutalCar type="rwb" color="bg-zinc-800" />
          </div>
        </div>

        <p className="relative z-10 font-black uppercase tracking-tighter text-xl italic text-black">
          © 2026 ONLYDIECAST. Built for the elite collectors.
        </p>
      </footer>
    </div>
  );
}

function NeoBrutalCar({ type, color }: { type: 'porsche' | 'ferrari' | 'lambo' | 'supra' | 'skyline' | 'rwb', color: string }) {
  const configs = {
    porsche: { bodyW: 'w-20', cabinW: 'w-10', cabinPos: 'left-4', spoiler: 'w-6 h-2 -top-1 left-0' },
    ferrari: { bodyW: 'w-24', cabinW: 'w-12', cabinPos: 'left-6', spoiler: 'w-4 h-1 -top-1 left-2' },
    lambo: { bodyW: 'w-24', cabinW: 'w-14', cabinPos: 'left-4', spoiler: 'w-8 h-2 -top-2 left-1' },
    supra: { bodyW: 'w-22', cabinW: 'w-11', cabinPos: 'left-5', spoiler: 'w-5 h-4 -top-3 left-1 rounded-t-lg' },
    skyline: { bodyW: 'w-22', cabinW: 'w-12', cabinPos: 'left-4', spoiler: 'w-6 h-2 -top-2 left-0' },
    rwb: { bodyW: 'w-20', cabinW: 'w-10', cabinPos: 'left-4', spoiler: 'w-10 h-4 -top-3 -left-2' },
  };

  const config = configs[type];

  return (
    <div className={`relative ${config.bodyW} h-10 flex flex-col items-center group scale-75`}>
      {/* Spoiler */}
      <div className={`absolute ${config.spoiler} bg-black border-[2px] border-black shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] z-0`} />
      
      {/* Cabin/Windows */}
      <div className={`${config.cabinW} h-5 bg-white border-[2px] border-black relative z-10 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex overflow-hidden`}>
        <div className="flex-1 border-r-[1px] border-black bg-cyan-200/50" />
        <div className="flex-1 bg-cyan-200/50" />
      </div>
      
      {/* Main Body */}
      <div className={`${config.bodyW} h-4 ${color} border-[2px] border-black mt-[-2px] relative z-20 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] flex justify-between px-2`}>
        {/* Lights */}
        <div className="w-2 h-1.5 bg-[#FFD600] border-[1px] border-black self-center rounded-sm" />
        <div className="w-1.5 h-1.5 bg-red-600 border-[1px] border-black self-center rounded-sm" />
        
        {/* Wheels */}
        <div className="absolute -bottom-2 left-2 w-4 h-4 bg-black border-[2px] border-white rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
        </div>
        <div className="absolute -bottom-2 right-2 w-4 h-4 bg-black border-[2px] border-white rounded-full shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full" />
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, description, color }: { icon: any, title: string, description: string, color: string }) {
  return (
    <div className={`neo-brutal-card p-8 group`}>
      <div className={`w-16 h-16 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color} flex items-center justify-center mb-6 group-hover:translate-x-[-2px] group-hover:translate-y-[-2px] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all`}>
        {icon}
      </div>
      <h3 className="text-2xl font-black uppercase mb-3">{title}</h3>
      <p className="text-black font-bold text-sm leading-relaxed">{description}</p>
    </div>
  );
}
