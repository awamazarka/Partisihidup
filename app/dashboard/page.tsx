'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  ArrowDownRight,
  BarChart3,
  Loader2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalValue: 0,
    itemCount: 0,
    potentialProfit: 0,
    lowStock: 0
  });
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    const { data: inventory, error } = await supabase.from('inventory').select('*');
    
    if (inventory) {
      const totalValue = inventory.reduce((acc, item) => acc + (item.sell_price * item.stock), 0);
      const totalCost = inventory.reduce((acc, item) => acc + (item.buy_price * item.stock), 0);
      const itemCount = inventory.reduce((acc, item) => acc + item.stock, 0);
      const lowStock = inventory.filter(item => item.stock > 0 && item.stock <= 2).length;

      setStats({
        totalValue,
        itemCount,
        potentialProfit: totalValue - totalCost,
        lowStock
      });
    }
    setLoading(false);
  }

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter">Business Dashboard</h1>
          <p className="text-black font-bold">Real-time performance metrics from your Supabase inventory.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="font-black uppercase italic">Calculating Intel...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard 
              title="Portfolio Value" 
              value={formatIDR(stats.totalValue)} 
              change="+Live" 
              isPositive={true} 
              icon={<DollarSign className="w-6 h-6" />}
              color="bg-[#FFD600]"
            />
            <StatCard 
              title="Total Stock" 
              value={stats.itemCount.toString()} 
              change="Units" 
              isPositive={true} 
              icon={<Package className="w-6 h-6" />}
              color="bg-[#A3E635]"
            />
            <StatCard 
              title="Potential Profit" 
              value={formatIDR(stats.potentialProfit)} 
              change="Margin" 
              isPositive={true} 
              icon={<TrendingUp className="w-6 h-6" />}
              color="bg-[#FB923C]"
            />
            <StatCard 
              title="Low Stock Alert" 
              value={stats.lowStock.toString()} 
              change="Items" 
              isPositive={stats.lowStock === 0} 
              icon={<BarChart3 className="w-6 h-6" />}
              color="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 flex flex-col">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-2xl uppercase italic flex items-center gap-2">
                  <BarChart3 className="w-6 h-6" />
                  Inventory Distribution
                </h3>
              </div>
              <div className="flex-1 bg-[#FAF8F5] border-[3px] border-dashed border-black rounded-2xl flex items-center justify-center">
                <p className="font-bold italic uppercase opacity-40">Analytics visualization incoming...</p>
              </div>
            </div>

            <div className="bg-white border-[3px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 flex flex-col">
              <h3 className="font-black text-2xl uppercase italic mb-8 underline">System Status</h3>
              <div className="space-y-6">
                <StatusRow label="Database" status="Connected" color="bg-[#A3E635]" />
                <StatusRow label="Storage" status="Active" color="#FFD600" isHex />
                <StatusRow label="Sync" status="Live" color="bg-[#FB923C]" />
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

function StatCard({ title, value, change, isPositive, icon, color }: { title: string, value: string, change: string, isPositive: boolean, icon: any, color: string }) {
  return (
    <div className={`border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl flex flex-col gap-4 ${color}`}>
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 border-[3px] border-black bg-white flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {icon}
        </div>
        <div className="bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-tighter">
          {change}
        </div>
      </div>
      <div>
        <p className="text-black font-black uppercase text-xs mb-1 underline">{title}</p>
        <p className="text-2xl font-black tracking-tighter italic">{value}</p>
      </div>
    </div>
  );
}

function StatusRow({ label, status, color, isHex }: { label: string, status: string, color: string, isHex?: boolean }) {
    return (
        <div className="flex items-center justify-between p-4 border-[2px] border-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <span className="font-black uppercase text-sm italic">{label}</span>
            <span 
                className={`text-[10px] font-black border-[2px] border-black px-3 py-1 uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}
                style={isHex ? { backgroundColor: color } : {}}
            >
                {status}
            </span>
        </div>
    )
}
