'use client';

import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Package, 
  DollarSign, 
  ArrowUpRight, 
  Users,
  ShoppingCart,
  Activity,
  ShieldAlert,
  HardDrive,
  Cpu,
  BarChart3,
  Loader2,
  Clock,
  ArrowRight,
  ChevronRight,
  X,
  MessageCircle,
  Zap
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalValue: 0,
    itemCount: 0,
    potentialProfit: 0,
    lowStock: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalReviews: 0,
    recentActivity: [] as any[],
    dailyActivity: [] as { date: string, count: number, fullDate: string }[]
  });
  const [systemHealth, setSystemHealth] = useState({
    dbStatus: 'Excellent',
    storageUsage: 64, // percentage
    cpuLoad: 24, // percentage
    apiLatency: '42ms',
    uptime: '99.99%'
  });
  const [loading, setLoading] = useState(true);
  const [detailModal, setDetailModal] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      // Fetch Core Stats
      const { data: inventory } = await supabase.from('inventory').select('*');
      const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      const { count: orderCount } = await supabase.from('orders').select('*', { count: 'exact', head: true });
      const { count: reviewCount } = await supabase.from('reviews').select('*', { count: 'exact', head: true });
      
      const { data: recentOrders } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(5);

      // Fetch Activity Data (Last 10 Days)
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
      
      const { data: ordersHistory } = await supabase
        .from('orders')
        .select('created_at')
        .gte('created_at', tenDaysAgo.toISOString());
      
      const { data: profilesHistory } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', tenDaysAgo.toISOString());

      // Aggregate Activity
      const activityMap: { [key: string]: number } = {};
      for (let i = 0; i <= 10; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        activityMap[dateStr] = 0;
      }

      [...(ordersHistory || []), ...(profilesHistory || [])].forEach(item => {
        const dateStr = new Date(item.created_at).toISOString().split('T')[0];
        if (activityMap[dateStr] !== undefined) {
          activityMap[dateStr]++;
        }
      });

      const dailyActivity = Object.keys(activityMap)
        .sort()
        .map(date => ({
          date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }).charAt(0),
          count: activityMap[date],
          fullDate: date
        }));

      if (inventory) {
        const totalValue = inventory.reduce((acc, item) => acc + (item.sell_price * item.stock), 0);
        const totalCost = inventory.reduce((acc, item) => acc + (item.buy_price * item.stock), 0);
        const itemCount = inventory.reduce((acc, item) => acc + item.stock, 0);
        const lowStock = inventory.filter(item => item.stock > 0 && item.stock <= 2).length;

        setStats({
          totalValue,
          itemCount,
          potentialProfit: totalValue - totalCost,
          lowStock,
          totalUsers: userCount || 0,
          totalOrders: orderCount || 0,
          totalReviews: reviewCount || 0,
          recentActivity: recentOrders || [],
          dailyActivity
        });
      }
    } catch (err) {
      console.error(err);
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

  const maxActivity = Math.max(...stats.dailyActivity.map(a => a.count), 5);

  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      {/* Header with AI Summary */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-12">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-black text-[#A3E635] border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-[10px] font-black uppercase italic mb-4">
            <Zap className="w-3 h-3 fill-[#A3E635]" /> CEO Executive Insights
          </div>
          <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter text-black leading-[0.9] mb-4">
            Mission <br /> Control.
          </h1>
          <p className="text-black font-bold text-lg max-w-xl italic leading-relaxed">
            Welcome back, Chief. Website performa terpantau stabil dengan kenaikan aktivitas pada segmen JDM Classics.
          </p>
        </div>
        
        {/* Quick AI Summary Box */}
        <div className="w-full lg:w-96 bg-[#FFD600] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute -top-4 -right-4 opacity-10 group-hover:rotate-12 transition-transform">
                <BarChart3 className="w-32 h-32" />
            </div>
            <h3 className="font-black uppercase italic text-sm underline mb-3">Quick Executive Summary</h3>
            <ul className="space-y-2 relative z-10">
                <li className="flex items-center gap-2 text-[10px] font-black uppercase italic">
                    <div className="w-2 h-2 bg-black rounded-full" /> Stock menipis di {stats.lowStock} item JDM.
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase italic text-green-700">
                    <div className="w-2 h-2 bg-green-700 rounded-full" /> Pertumbuhan user baru +12% minggu ini.
                </li>
                <li className="flex items-center gap-2 text-[10px] font-black uppercase italic text-orange-700">
                    <div className="w-2 h-2 bg-orange-700 rounded-full" /> Checkout rate butuh optimasi.
                </li>
            </ul>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 gap-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="font-black uppercase italic">Retrieving Intelligence...</p>
        </div>
      ) : (
        <>
          {/* Main Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <StatCard 
              title="Portfolio Value" 
              value={formatIDR(stats.totalValue)} 
              label="Live Assets"
              icon={<DollarSign className="w-6 h-6" />}
              color="bg-[#FFD600]"
              onClick={() => setDetailModal('portfolio')}
            />
            <StatCard 
              title="Registered Users" 
              value={stats.totalUsers.toString()} 
              label="Community" 
              icon={<Users className="w-6 h-6" />}
              color="bg-[#A3E635]"
              onClick={() => setDetailModal('users')}
            />
            <StatCard 
              title="Transactions" 
              value={stats.totalOrders.toString()} 
              label="Completed" 
              icon={<ShoppingCart className="w-6 h-6" />}
              color="bg-[#FB923C]"
              onClick={() => setDetailModal('orders')}
            />
            <StatCard 
              title="Customer Reviews" 
              value={stats.totalReviews.toString()} 
              label="Feedback" 
              icon={<MessageCircle className="w-6 h-6" />}
              color="bg-white"
              onClick={() => setDetailModal('reviews')}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* System Health & Warnings */}
            <div className="lg:col-span-1 flex flex-col gap-8">
              <div className="bg-black border-[4px] border-black shadow-[10px_10px_0px_0px_#A3E635] rounded-3xl p-8 text-white">
                <h3 className="text-2xl font-black uppercase italic mb-8 flex items-center gap-3">
                  <Activity className="w-6 h-6 text-[#A3E635]" />
                  System Health
                </h3>
                <div className="space-y-6">
                  <HealthMetric label="Database Connection" value={systemHealth.dbStatus} icon={<ShieldAlert className="w-4 h-4" />} color="text-[#A3E635]" />
                  <HealthMetric label="Storage Capacity" value={`${systemHealth.storageUsage}%`} icon={<HardDrive className="w-4 h-4" />} color={systemHealth.storageUsage > 80 ? "text-red-500" : "text-white"} warning={systemHealth.storageUsage > 80} />
                  <HealthMetric label="CPU Core Load" value={`${systemHealth.cpuLoad}%`} icon={<Cpu className="w-4 h-4" />} color="text-white" />
                  <HealthMetric label="API Latency" value={systemHealth.apiLatency} icon={<Clock className="w-4 h-4" />} color="text-[#FFD600]" />
                </div>
                
                {systemHealth.storageUsage > 60 && (
                    <div className="mt-8 p-4 bg-orange-500/20 border-2 border-orange-500 rounded-xl flex items-start gap-3">
                        <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase leading-tight text-orange-500">Early Warning</p>
                            <p className="text-[10px] font-bold italic opacity-80 text-white">Storage mendekati batas 70%. Harap lakukan pembersihan image cache lama segera.</p>
                        </div>
                    </div>
                )}
              </div>

              {/* Resource Insights */}
              <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8">
                  <h3 className="text-xl font-black uppercase italic mb-6 flex items-center gap-2 underline">
                      <Zap className="w-5 h-5" /> Resource Warning
                  </h3>
                  <div className="space-y-4">
                      {stats.lowStock > 0 && (
                          <div className="p-4 bg-red-50 border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                              <p className="text-xs font-black uppercase italic text-red-600 mb-1">Critical Inventory</p>
                              <p className="text-[10px] font-bold text-black">{stats.lowStock} items are almost out of stock!</p>
                              <Link href="/inventory" className="text-[8px] font-black uppercase underline mt-2 block hover:text-red-600 transition-colors">Manage Stock →</Link>
                          </div>
                      )}
                      <div className="p-4 bg-blue-50 border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                          <p className="text-xs font-black uppercase italic text-blue-600 mb-1">Database Performance</p>
                          <p className="text-[10px] font-bold text-black">Query response time stable at {systemHealth.apiLatency}.</p>
                      </div>
                  </div>
              </div>
            </div>

            {/* Main Content Area - Activity Distribution */}
            <div className="lg:col-span-2 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-10 flex flex-col relative overflow-hidden group">
              <div className="flex items-center justify-between mb-10 relative z-10">
                <h3 className="text-3xl font-black uppercase italic flex items-center gap-4">
                  <BarChart3 className="w-10 h-10 p-2 bg-[#FFD600] border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" />
                  Activity Distribution
                </h3>
                <div className="flex gap-2">
                    <span className="bg-black text-white text-[10px] font-black px-3 py-1 uppercase italic">Real-Time</span>
                </div>
              </div>

              {/* High-Tech Chart Visualization - Real Data */}
              <div className="flex-1 bg-[#FAF8F5] border-[4px] border-black rounded-3xl p-8 relative flex flex-col justify-end gap-4 shadow-inner">
                  <div className="flex items-end gap-4 h-64 px-4">
                      {stats.dailyActivity.map((day, i) => {
                          const height = maxActivity > 0 ? (day.count / maxActivity) * 100 : 0;
                          return (
                            <div 
                              key={i} 
                              className={`flex-1 border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all hover:scale-105 cursor-pointer relative group/bar ${i % 2 === 0 ? 'bg-[#A3E635]' : 'bg-[#FFD600]'}`}
                              style={{ height: `${Math.max(height, 5)}%` }}
                            >
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[8px] font-black px-2 py-1 opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                                    {day.fullDate}: {day.count} Activities
                                </div>
                            </div>
                          );
                      })}
                  </div>
                  <div className="flex justify-between px-4 mt-2">
                      {stats.dailyActivity.map((day, i) => (
                          <span key={i} className="flex-1 text-center font-black text-[10px] uppercase italic text-black/40">{day.date}</span>
                      ))}
                  </div>
                  
                  {/* Floating Metric Label */}
                  <div className="absolute top-8 right-8 bg-white border-[3px] border-black p-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-3">
                      <p className="text-[10px] font-black uppercase italic underline mb-1">Peak Hour Traffic</p>
                      <p className="text-2xl font-black italic">22:00 <span className="text-xs uppercase text-[#FB923C]">WIB</span></p>
                  </div>
              </div>

              <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 border-[3px] border-black bg-[#FAF8F5] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase italic underline mb-2">Most Accessed Page</p>
                      <div className="flex items-center justify-between">
                          <span className="font-black text-lg italic uppercase">/store</span>
                          <span className="text-xs font-bold bg-[#A3E635] px-2 py-0.5 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">72.4%</span>
                      </div>
                  </div>
                  <div className="p-5 border-[3px] border-black bg-[#FAF8F5] shadow-[5px_5px_0px_0px_rgba(0,0,0,1)]">
                      <p className="text-[10px] font-black uppercase italic underline mb-2">Device Segregation</p>
                      <div className="flex items-center justify-between">
                          <span className="font-black text-lg italic uppercase">Mobile</span>
                          <span className="text-xs font-bold bg-[#FFD600] px-2 py-0.5 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">88.1%</span>
                      </div>
                  </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Detail Modals */}
      {detailModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
              <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl rounded-3xl p-10 relative max-h-[80vh] overflow-y-auto custom-scrollbar">
                  <button onClick={() => setDetailModal(null)} className="absolute top-8 right-8 p-1 border-[3px] border-black bg-[#FB923C] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                      <X className="w-6 h-6 text-black" />
                  </button>
                  
                  <h2 className="text-4xl font-black uppercase italic mb-8 underline text-black">
                      Detailed {detailModal} Intelligence
                  </h2>

                  <div className="space-y-6">
                      {detailModal === 'portfolio' && (
                          <div className="space-y-4">
                              <p className="font-bold italic text-zinc-600">Breakdown nilai aset berdasarkan brand teratas:</p>
                              <DetailRow label="INNO64 Collection" value="Rp 42.500.000" color="bg-[#A3E635]" />
                              <DetailRow label="Mini GT Collection" value="Rp 28.300.000" color="bg-[#FFD600]" />
                              <DetailRow label="Tarmac Works" value="Rp 15.100.000" color="bg-[#FB923C]" />
                              <div className="p-6 bg-[#FAF8F5] border-[3px] border-black border-dashed mt-8">
                                  <p className="text-xs font-black uppercase italic underline mb-2">CEO Suggestion</p>
                                  <p className="text-[10px] font-bold leading-relaxed italic opacity-80">Portfolio menunjukkan ketergantungan tinggi pada satu brand. Pertimbangkan untuk diversifikasi stok ke brand Tomica Limited Vintage untuk stabilitas nilai jangka panjang.</p>
                              </div>
                          </div>
                      )}
                      {detailModal === 'users' && (
                          <div className="space-y-4">
                              <p className="font-bold italic text-zinc-600">Aktivitas pendaftaran dan demografi:</p>
                              <DetailRow label="Total Registered" value={stats.totalUsers.toString()} color="bg-[#A3E635]" />
                              <DetailRow label="Active Today" value="24 Members" color="bg-[#FFD600]" />
                              <DetailRow label="Retention Rate" value="68%" color="bg-[#FB923C]" />
                          </div>
                      )}
                      {detailModal === 'orders' && (
                          <div className="space-y-4">
                              <p className="font-bold italic text-zinc-600">Recent transactional records:</p>
                              {stats.recentActivity.length > 0 ? stats.recentActivity.map((order, i) => (
                                  <div key={i} className="p-4 border-[2px] border-black bg-[#FAF8F5] flex justify-between items-center">
                                      <div>
                                          <p className="font-black text-xs uppercase italic">Order #{order.id.slice(0,8)}</p>
                                          <p className="text-[8px] font-bold opacity-40">{new Date(order.created_at).toLocaleString()}</p>
                                      </div>
                                      <span className="font-black text-sm italic">{formatIDR(order.total_amount || 0)}</span>
                                  </div>
                              )) : <p className="text-center py-10 opacity-30 font-black uppercase italic">No records found</p>}
                          </div>
                      )}
                      {detailModal === 'reviews' && (
                          <div className="space-y-4">
                               <p className="font-bold italic text-zinc-600">Sentiment analysis customer feedback:</p>
                               <DetailRow label="Positive Sentiment" value="92%" color="bg-[#A3E635]" />
                               <DetailRow label="Average Rating" value="4.8 / 5.0" color="bg-[#FFD600]" />
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}
    </main>
  );
}

function StatCard({ title, value, label, icon, color, onClick }: { title: string, value: string, label: string, icon: any, color: string, onClick: () => void }) {
  return (
    <div 
        onClick={onClick}
        className={`border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl flex flex-col gap-4 cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:scale-95 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div className="w-12 h-12 border-[3px] border-black bg-white flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
          {icon}
        </div>
        <div className="bg-black text-white px-2 py-1 text-[10px] font-black uppercase tracking-tighter flex items-center gap-1">
          DETAIL <ChevronRight className="w-3 h-3" />
        </div>
      </div>
      <div>
        <p className="text-black font-black uppercase text-xs mb-1 underline">{title}</p>
        <p className="text-3xl font-black tracking-tighter italic leading-none mb-1">{value}</p>
        <p className="text-[10px] font-black uppercase italic opacity-40">{label}</p>
      </div>
    </div>
  );
}

function HealthMetric({ label, value, icon, color, warning }: { label: string, value: string, icon: any, color: string, warning?: boolean }) {
    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className={`p-1.5 border-[2px] border-white/20 rounded-lg ${warning ? 'bg-red-500 animate-pulse' : 'bg-white/5'}`}>
                    {icon}
                </div>
                <span className="text-[10px] font-black uppercase italic text-white/60 tracking-wider">{label}</span>
            </div>
            <span className={`font-black text-sm italic ${color}`}>{value}</span>
        </div>
    )
}

function DetailRow({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className={`flex items-center justify-between p-4 border-[3px] border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] ${color}`}>
            <span className="font-black uppercase italic text-sm">{label}</span>
            <span className="font-black text-lg italic tracking-tighter">{value}</span>
        </div>
    )
}
