import { BarChart3, TrendingUp, PieChart, Calendar, ArrowUpRight, Zap } from 'lucide-react';

export default function AnalyticsPage() {
  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      <div className="mb-12">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
          <div className="p-3 bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <BarChart3 className="w-10 h-10" />
          </div>
          Advanced Analytics
        </h1>
        <p className="text-black font-bold mt-2 italic uppercase">Deep dive into your collection trends and market performance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Market Trend Card */}
        <div className="lg:col-span-2 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 flex flex-col min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black uppercase italic">Portfolio Growth</h3>
              <p className="text-black font-bold text-sm underline">Monthly value appreciation of your assets.</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-[#FFD600] border-[2px] border-black font-black uppercase text-xs italic">Value</span>
              <span className="px-3 py-1 bg-white border-[2px] border-black font-black uppercase text-xs italic">Volume</span>
            </div>
          </div>
          <div className="flex-1 bg-[#FAF8F5] border-[3px] border-dashed border-black rounded-3xl flex items-center justify-center relative overflow-hidden group">
             <TrendingUp className="w-20 h-20 text-black opacity-10 group-hover:opacity-20 transition-opacity" />
             <p className="absolute font-black uppercase italic opacity-40">Interactive Growth Chart</p>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 flex flex-col">
          <h3 className="text-2xl font-black uppercase italic mb-8 underline">Category Mix</h3>
          <div className="flex-1 flex flex-col justify-center gap-6">
            <CategoryBar label="JDM Classics" percentage={45} color="bg-[#A3E635]" />
            <CategoryBar label="Euro Exotics" percentage={30} color="bg-[#FFD600]" />
            <CategoryBar label="American Muscle" percentage={15} color="bg-[#FB923C]" />
            <CategoryBar label="Other" percentage={10} color="bg-white" />
          </div>
          <div className="mt-8 pt-6 border-t-[3px] border-black border-dashed">
            <div className="flex items-center justify-between font-black uppercase italic text-sm">
              <span>Total Items</span>
              <span className="bg-[#FFD600] px-2 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">482</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <InsightCard 
          title="Best ROI Brand" 
          value="Inno64" 
          detail="+124% avg return" 
          icon={<Zap className="w-6 h-6" />} 
          color="bg-[#FFD600]"
        />
        <InsightCard 
          title="Most Liquid Asset" 
          value="Skyline R34" 
          detail="2.4 days avg sale" 
          icon={<ArrowUpRight className="w-6 h-6" />} 
          color="bg-[#A3E635]"
        />
        <InsightCard 
          title="Inventory Turn" 
          value="4.2x" 
          detail="Last 12 months" 
          icon={<PieChart className="w-6 h-6" />} 
          color="bg-[#FB923C]"
        />
        <InsightCard 
          title="Peak Sales" 
          value="Weekends" 
          detail="18:00 - 22:00" 
          icon={<Calendar className="w-6 h-6" />} 
          color="bg-white"
        />
      </div>
    </main>
  );
}

function CategoryBar({ label, percentage, color }: { label: string, percentage: number, color: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between font-black uppercase italic text-xs">
        <span>{label}</span>
        <span>{percentage}%</span>
      </div>
      <div className="h-4 w-full bg-[#FAF8F5] border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        <div className={`h-full ${color} border-r-[2px] border-black`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

function InsightCard({ title, value, detail, icon, color }: { title: string, value: string, detail: string, icon: any, color: string }) {
  return (
    <div className={`border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${color}`}>
      <div className="w-12 h-12 border-[3px] border-black bg-white flex items-center justify-center mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <p className="font-black uppercase italic text-[10px] underline mb-1 tracking-widest">{title}</p>
      <h4 className="text-xl font-black uppercase italic mb-1">{value}</h4>
      <p className="text-[10px] font-bold uppercase opacity-60">{detail}</p>
    </div>
  );
}
