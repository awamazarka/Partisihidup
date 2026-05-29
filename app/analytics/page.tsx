'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  BarChart3, TrendingUp, PieChart, Calendar, 
  ArrowUpRight, Zap, Loader2, DollarSign, 
  Package, ShoppingCart, Target, AlertCircle,
  X, ExternalLink, ArrowRight, Filter
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

type TimeFilter = 'all' | 'today' | 'week' | 'month';

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'orders' | 'inventory' | 'channel'>('orders');
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [ordersRes, inventoryRes] = await Promise.all([
        supabase
          .from('orders')
          .select('id, total_price, quantity, sales_channel, created_at, customer_name, inventory(name, brand, buy_price)'),
        supabase
          .from('inventory')
          .select('id, name, brand, buy_price, sell_price, stock, created_at')
      ]);

      if (ordersRes.data) setOrders(ordersRes.data);
      if (inventoryRes.data) setInventory(inventoryRes.data);
    } catch (err) {
      console.error("Analytics fetch error:", err);
    } finally {
      setLoading(false);
    }
  }

  // Filter Logic
  const filteredOrders = useMemo(() => {
    if (timeFilter === 'all') return orders;
    
    const now = new Date();
    const startOfToday = new Date(now.setHours(0,0,0,0));
    const startOfWeek = new Date(now.setDate(now.getDate() - 7));
    const startOfMonth = new Date(now.setMonth(now.getMonth() - 1));

    return orders.filter(o => {
      const orderDate = new Date(o.created_at);
      if (timeFilter === 'today') return orderDate >= startOfToday;
      if (timeFilter === 'week') return orderDate >= startOfWeek;
      if (timeFilter === 'month') return orderDate >= startOfMonth;
      return true;
    });
  }, [orders, timeFilter]);

  // BI Calculations
  const stats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0);
    const totalCost = filteredOrders.reduce((acc, curr) => {
      const buyPrice = Number(curr.inventory?.buy_price) || 0;
      return acc + (buyPrice * (curr.quantity || 1));
    }, 0);
    const totalProfit = totalRevenue - totalCost;
    const avgOrderValue = filteredOrders.length > 0 ? totalRevenue / filteredOrders.length : 0;
    
    // Channel Distribution
    const channels: Record<string, number> = {};
    filteredOrders.forEach(o => {
      channels[o.sales_channel] = (channels[o.sales_channel] || 0) + 1;
    });
    
    // Top Brands by Sales
    const brandSales: Record<string, number> = {};
    filteredOrders.forEach(o => {
      const brand = o.inventory?.brand || 'Other';
      brandSales[brand] = (brandSales[brand] || 0) + (Number(o.total_price) || 0);
    });

    const sortedBrands = Object.entries(brandSales)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4);

    return {
      totalRevenue,
      totalProfit,
      totalCost,
      avgOrderValue,
      orderCount: filteredOrders.length,
      channels,
      topBrands: sortedBrands,
      totalInventoryValue: inventory.reduce((acc, curr) => acc + (Number(curr.buy_price) * Number(curr.stock) || 0), 0),
      potentialRevenue: inventory.reduce((acc, curr) => acc + (Number(curr.sell_price) * Number(curr.stock) || 0), 0)
    };
  }, [filteredOrders, inventory]);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const openModal = (type: 'orders' | 'inventory' | 'channel', channel?: string) => {
    setModalType(type);
    setSelectedChannel(channel || null);
    setIsModalOpen(true);
  };

  if (loading) {
    return (
      <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full space-y-12">
        <div className="space-y-4">
            <div className="h-4 w-32 skeleton-neon border-[1px] border-black" />
            <div className="h-16 w-1/2 skeleton-neon border-[3px] border-black" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-40 skeleton-neon border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-3xl" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 h-[450px] skeleton-neon border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl" />
            <div className="h-[450px] skeleton-neon border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl" />
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
                <span className="bg-black text-[#A3E635] px-3 py-1 text-[10px] font-black uppercase italic tracking-widest border-[2px] border-black">BI Module v2.0</span>
                <span className="text-[10px] font-bold uppercase italic opacity-40 tracking-widest">Real-time Data Sync</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-black uppercase italic tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-[#A3E635] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <TrendingUp className="w-10 h-10" />
            </div>
            Generative BI
            </h1>
            <p className="text-black font-bold mt-2 italic uppercase">The Ultimate Next-Gen Manager Intelligence Dashboard.</p>
        </div>

        {/* Time Range Filter */}
        <div className="flex border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden rounded-xl">
            {(['all', 'today', 'week', 'month'] as TimeFilter[]).map((range) => (
                <button 
                    key={range}
                    onClick={() => setTimeFilter(range)}
                    className={`px-4 py-2 text-[10px] font-black uppercase italic transition-all border-r-[3px] last:border-r-0 border-black ${timeFilter === range ? 'bg-black text-[#FFD600]' : 'bg-white text-black hover:bg-zinc-100'}`}
                >
                    {range}
                </button>
            ))}
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <KPICard 
            title="Total Revenue" 
            value={formatIDR(stats.totalRevenue)} 
            icon={<DollarSign />} 
            color="bg-white" 
            onClick={() => openModal('orders')}
        />
        <KPICard 
            title="Estimated Profit" 
            value={formatIDR(stats.totalProfit)} 
            icon={<Zap />} 
            color="bg-[#A3E635]" 
            onClick={() => openModal('orders')}
        />
        <KPICard 
            title="Total Orders" 
            value={stats.orderCount.toString()} 
            icon={<ShoppingCart />} 
            color="bg-[#FFD600]" 
            onClick={() => openModal('orders')}
        />
        <KPICard 
            title="Inv. Value (Cost)" 
            value={formatIDR(stats.totalInventoryValue)} 
            icon={<Package />} 
            color="bg-[#FB923C]" 
            onClick={() => openModal('inventory')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Revenue Streams Chart */}
        <div className="lg:col-span-2 bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-3xl font-black uppercase italic tracking-tight text-black">Revenue Streams</h3>
              <p className="text-black font-bold text-xs uppercase opacity-40">Click a bar to see channel details</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#FAF8F5] border-[2px] border-black rounded-lg">
                <Filter className="w-3 h-3 text-black" />
                <span className="text-[10px] font-black uppercase italic">{timeFilter}</span>
            </div>
          </div>
          
          <div className="flex-1 flex items-end gap-2 sm:gap-4 px-4 pb-4">
            {Object.entries(stats.channels).map(([channel, count], idx) => {
              const height = stats.orderCount > 0 ? (count / stats.orderCount) * 100 : 0;
              return (
                <div key={channel} className="flex-1 flex flex-col items-center gap-4 group cursor-pointer" onClick={() => openModal('channel', channel)}>
                  <div className="w-full bg-[#FAF8F5] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all min-h-[200px] flex items-end">
                    <div 
                        className={`w-full transition-all duration-1000 ease-out border-t-[3px] border-black ${idx % 2 === 0 ? 'bg-[#A3E635]' : 'bg-[#FFD600]'}`}
                        style={{ height: `${Math.max(height, 5)}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                        <span className="font-black text-xl italic">{count}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black uppercase italic tracking-tighter text-center group-hover:underline">{channel}</span>
                </div>
              );
            })}
            {Object.keys(stats.channels).length === 0 && (
                <div className="flex-1 h-full flex flex-col items-center justify-center opacity-10 gap-4">
                    <BarChart3 className="w-32 h-32" />
                    <p className="font-black uppercase italic">No sales data in this range</p>
                </div>
            )}
          </div>
        </div>

        {/* Brand Performance */}
        <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 flex flex-col">
          <h3 className="text-3xl font-black uppercase italic mb-8 tracking-tight text-black">Top Performers</h3>
          <div className="flex-1 space-y-8">
            {stats.topBrands.length > 0 ? stats.topBrands.map(([brand, revenue], idx) => (
                <div key={brand} className="space-y-2 group cursor-pointer" onClick={() => openModal('orders')}>
                    <div className="flex justify-between font-black uppercase italic text-xs group-hover:text-[#FB923C] transition-colors">
                        <span>{brand}</span>
                        <span>{formatIDR(revenue)}</span>
                    </div>
                    <div className="h-5 w-full bg-[#FAF8F5] border-[3px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                        <div 
                            className={`h-full border-r-[3px] border-black transition-all duration-1000 ${idx === 0 ? 'bg-[#A3E635]' : idx === 1 ? 'bg-[#FFD600]' : 'bg-white'}`} 
                            style={{ width: `${(revenue / stats.totalRevenue) * 100}%` }} 
                        />
                    </div>
                </div>
            )) : (
                <div className="h-full flex flex-col items-center justify-center opacity-10 gap-2">
                    <Target className="w-16 h-16" />
                    <p className="font-black uppercase italic text-[10px]">No sales data yet</p>
                </div>
            )}
          </div>
          
          <div className="mt-12 p-5 bg-black rounded-2xl group hover:scale-[1.02] transition-transform cursor-help">
            <div className="flex items-center justify-between text-[#A3E635] font-black uppercase italic text-[10px] mb-1">
              <span>Future Projection</span>
              <ArrowUpRight className="w-3 h-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>
            <p className="text-white font-black text-xl italic">{formatIDR(stats.potentialRevenue)}</p>
            <p className="text-white/40 font-bold text-[8px] uppercase tracking-widest mt-1">Potential Total Store Revenue</p>
          </div>
        </div>
      </div>

      {/* Advanced Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <InsightBox 
          title="Avg. Ticket Size" 
          value={formatIDR(stats.avgOrderValue)} 
          desc="Revenue generated per order" 
          icon={<Zap className="w-5 h-5" />} 
          color="bg-[#A3E635]"
        />
        <InsightBox 
          title="Profit Margin" 
          value={stats.totalRevenue > 0 ? `${((stats.totalProfit / stats.totalRevenue) * 100).toFixed(1)}%` : '0%'} 
          desc="Overall profitability ratio" 
          icon={<BarChart3 className="w-5 h-5" />} 
          color="bg-[#FFD600]"
        />
        <InsightBox 
          title="Inventory Health" 
          value={inventory.filter(i => i.stock < 3).length.toString()} 
          desc="Units with low stock (< 3)" 
          icon={<AlertCircle className="w-5 h-5" />} 
          color={inventory.filter(i => i.stock < 3).length > 0 ? 'bg-[#FB923C]' : 'bg-white'}
          onClick={() => openModal('inventory')}
        />
      </div>

      {/* Deep Dive Modal */}
      {isModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
              <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl rounded-3xl p-10 relative max-h-[85vh] overflow-hidden flex flex-col">
                  <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-1 border-[3px] border-black bg-[#FB923C] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                      <X className="w-6 h-6 text-black" />
                  </button>
                  
                  <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <span className="bg-[#A3E635] border-[2px] border-black px-3 py-1 text-[10px] font-black uppercase italic italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">Detail Analysis</span>
                    </div>
                    <h2 className="text-4xl font-black uppercase italic underline text-black">
                        {modalType === 'orders' ? 'Transaction History' : modalType === 'inventory' ? 'Inventory Health Check' : `Channel: ${selectedChannel}`}
                    </h2>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar border-[3px] border-black bg-[#FAF8F5] rounded-xl overflow-hidden shadow-inner">
                      <table className="w-full text-left">
                          <thead className="bg-black text-white text-[10px] font-black uppercase italic border-b-[3px] border-black sticky top-0">
                              {modalType === 'orders' || modalType === 'channel' ? (
                                  <tr>
                                      <th className="px-6 py-4">Date</th>
                                      <th className="px-6 py-4">Customer</th>
                                      <th className="px-6 py-4">Item</th>
                                      <th className="px-6 py-4">Channel</th>
                                      <th className="px-6 py-4 text-right">Value</th>
                                  </tr>
                              ) : (
                                  <tr>
                                      <th className="px-6 py-4">Item Name</th>
                                      <th className="px-6 py-4">Brand</th>
                                      <th className="px-6 py-4 text-center">Stock</th>
                                      <th className="px-6 py-4 text-right">Buy Price</th>
                                      <th className="px-6 py-4 text-right">Status</th>
                                  </tr>
                              )}
                          </thead>
                          <tbody className="divide-y-[1px] divide-black/10">
                              {(modalType === 'orders' || modalType === 'channel') ? (
                                  (modalType === 'channel' ? filteredOrders.filter(o => o.sales_channel === selectedChannel) : filteredOrders).map((order) => (
                                      <tr key={order.id} className="hover:bg-white transition-colors group">
                                          <td className="px-6 py-4 text-[10px] font-bold opacity-60">{new Date(order.created_at).toLocaleDateString()}</td>
                                          <td className="px-6 py-4 font-black uppercase italic text-xs text-black">{order.customer_name}</td>
                                          <td className="px-6 py-4 text-xs font-bold text-black">{order.inventory?.name}</td>
                                          <td className="px-6 py-4">
                                              <span className="text-[8px] font-black uppercase border-[1.5px] border-black px-2 py-0.5 bg-white">{order.sales_channel}</span>
                                          </td>
                                          <td className="px-6 py-4 text-right font-black italic text-black">{formatIDR(order.total_price)}</td>
                                      </tr>
                                  ))
                              ) : (
                                  inventory.filter(i => i.stock < 3).map((item) => (
                                      <tr key={item.id} className="hover:bg-white transition-colors">
                                          <td className="px-6 py-4 font-black uppercase italic text-xs text-black">{item.name}</td>
                                          <td className="px-6 py-4 text-xs font-bold opacity-60 uppercase">{item.brand}</td>
                                          <td className="px-6 py-4 text-center">
                                              <span className={`font-black ${item.stock === 0 ? 'text-red-500' : 'text-black'}`}>{item.stock}</span>
                                          </td>
                                          <td className="px-6 py-4 text-right text-xs font-bold">{formatIDR(item.buy_price)}</td>
                                          <td className="px-6 py-4 text-right">
                                              <span className={`text-[8px] font-black uppercase px-2 py-0.5 border-[1.5px] border-black ${item.stock === 0 ? 'bg-red-500 text-white' : 'bg-[#FFD600] text-black'}`}>
                                                  {item.stock === 0 ? 'Out of Stock' : 'Low Stock'}
                                              </span>
                                          </td>
                                      </tr>
                                  ))
                              )}
                          </tbody>
                      </table>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                      <button 
                        onClick={() => setIsModalOpen(false)}
                        className="neo-brutal-btn-mint text-sm py-3 px-8 flex items-center gap-2"
                      >
                        CLOSE REPORT <ArrowRight className="w-4 h-4" />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </main>
  );
}

function KPICard({ title, value, icon, color, onClick }: { title: string, value: string, icon: any, color: string, onClick?: () => void }) {
  return (
    <div 
        onClick={onClick}
        className={`border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 rounded-3xl ${color} relative overflow-hidden group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer`}
    >
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-black/5 rounded-full flex items-center justify-center group-hover:scale-150 transition-transform duration-700">
        <div className="opacity-20 transform -rotate-12">{icon}</div>
      </div>
      <p className="font-black uppercase italic text-[10px] text-black/40 mb-2 tracking-widest underline decoration-2">{title}</p>
      <h3 className="text-3xl font-black italic tracking-tighter text-black truncate mb-4">{value}</h3>
      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase italic underline opacity-0 group-hover:opacity-100 transition-opacity">
          View Detail Data <ArrowRight className="w-3 h-3" />
      </div>
    </div>
  );
}

function InsightBox({ title, value, desc, icon, color, onClick }: { title: string, value: string, desc: string, icon: any, color: string, onClick?: () => void }) {
  return (
    <div 
        onClick={onClick}
        className={`border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 rounded-3xl ${color} flex items-start gap-6 group hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="w-14 h-14 border-[3px] border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] shrink-0 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <p className="font-black uppercase italic text-[10px] underline mb-1 tracking-widest decoration-2">{title}</p>
        <h4 className="text-2xl font-black uppercase italic mb-1">{value}</h4>
        <p className="text-[10px] font-bold uppercase opacity-60 leading-tight">{desc}</p>
      </div>
    </div>
  );
}
