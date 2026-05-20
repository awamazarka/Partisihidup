'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  ReceiptText, Package, Truck, CheckCircle2, 
  Search, ExternalLink, Plus, MessageCircle, 
  Trash2, Loader2, Calendar, User, ShoppingBag,
  Hash, MapPin, Send, X, Clock, AlertCircle
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const STATUS_CONFIG: Record<string, { color: string, icon: any, label: string }> = {
  'Process': { color: 'bg-[#FB923C]', icon: Clock, label: 'Processing' },
  'Packed': { color: 'bg-[#3B82F6]', icon: Package, label: 'Packed' },
  'Shipped': { color: 'bg-[#A855F7]', icon: Truck, label: 'Shipped' },
  'Delivered': { color: 'bg-[#22C55E]', icon: CheckCircle2, label: 'Delivered' },
  'Canceled': { color: 'bg-[#EF4444]', icon: X, label: 'Canceled' }
};

const SALES_CHANNELS = ["WhatsApp", "Tokopedia", "Shopee", "Instagram", "Offline", "Other"];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customer_name: '',
    product_id: '',
    whatsapp_number: '',
    quantity: 1,
    unit_price: 0,
    sales_channel: 'WhatsApp',
    address: '',
    tracking_number: '-'
  });

  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setDbError(null);

    // Fetch Inventory for dropdown
    const { data: invData, error: invError } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    
    if (invError) {
      console.error('Error fetching inventory:', invError);
    } else {
      setInventory(invData || []);
    }

    // Fetch Orders
    const { data: ordData, error: ordError } = await supabase
      .from('orders')
      .select('*, inventory(name, brand)')
      .order('created_at', { ascending: false });
    
    if (ordError) {
      console.error('Detailed Order Fetch Error:', ordError);
      
      if (ordError.code === 'PGRST116' || ordError.code === '42P01' || ordError.message.includes('relationship') || ordError.message.includes('column')) {
        setDbError(ordError.message.includes('relationship') || ordError.message.includes('column')
          ? "Database schema mismatch. The 'orders' table structure doesn't match the app requirements." 
          : "Table 'orders' does not exist.");
      } else {
        setDbError(ordError.message || "Unknown database error occurred.");
      }
    } else {
      setOrders(ordData || []);
    }
    setLoading(false);
  }

  const selectedProduct = useMemo(() => {
    return inventory.find(item => item.id === formData.product_id);
  }, [formData.product_id, inventory]);

  const totalPrice = useMemo(() => {
    return (formData.unit_price || 0) * (formData.quantity || 0);
  }, [formData.unit_price, formData.quantity]);

  useEffect(() => {
    if (selectedProduct) {
      setFormData(prev => ({ 
        ...prev, 
        unit_price: selectedProduct.sell_price,
        // Reset qty if it exceeds new product stock
        quantity: Math.min(prev.quantity, selectedProduct.stock || 1)
      }));
    }
  }, [selectedProduct]);

  function generateOrderID() {
    const now = new Date();
    const datePart = now.toISOString().slice(2, 10).replace(/-/g, '');
    const timePart = now.toTimeString().slice(0, 5).replace(/:/g, '');
    return `AB-${datePart}${timePart}`;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.product_id) return alert("Pilih produk dulu kak!");
    if (!selectedProduct || formData.quantity > selectedProduct.stock) {
      return alert("Stok tidak mencukupi!");
    }

    setSubmitting(true);
    const orderId = generateOrderID();

    try {
      // 1. Create Order
      const { error: orderError } = await supabase.from('orders').insert([{
        id: orderId,
        customer_name: formData.customer_name,
        product_id: formData.product_id,
        whatsapp_number: formData.whatsapp_number,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        sales_channel: formData.sales_channel,
        total_price: totalPrice,
        address: formData.address,
        tracking_number: formData.tracking_number,
        status: 'Process'
      }]);

      if (orderError) throw orderError;

      // 2. Deduct Stock
      const { error: stockError } = await supabase
        .from('inventory')
        .update({ stock: selectedProduct.stock - formData.quantity })
        .eq('id', formData.product_id);

      if (stockError) throw stockError;

      // Reset & Refresh
      setIsFormOpen(false);
      setFormData({
        customer_name: '',
        product_id: '',
        whatsapp_number: '',
        quantity: 1,
        unit_price: 0,
        sales_channel: 'WhatsApp',
        address: '',
        tracking_number: '-'
      });
      fetchData();
      alert(`Pesanan ${orderId} berhasil dibuat!`);
    } catch (error: any) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(id: string, newStatus: string) {
    const { error } = await supabase
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) alert(error.message);
    else fetchData();
  }

  async function deleteOrder(id: string) {
    if (!confirm("Hapus pesanan ini? Stok tidak akan dikembalikan otomatis.")) return;
    
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) alert(error.message);
    else fetchData();
  }

  function generateWALink(order: any) {
    const productName = order.inventory?.name || 'Item';
    const message = `Halo kak ${order.customer_name}, update kiriman ${productName} dengan No Resi ${order.tracking_number} saat ini berstatus: ${order.status}`;
    const encoded = encodeURIComponent(message);
    return `https://wa.me/${order.whatsapp_number.replace(/\D/g, '')}?text=${encoded}`;
  }

  const filteredOrders = orders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.tracking_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = {
    process: orders.filter(o => o.status === 'Process').length,
    packed: orders.filter(o => o.status === 'Packed').length,
    shipped: orders.filter(o => o.status === 'Shipped').length,
    delivered: orders.filter(o => o.status === 'Delivered').length,
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

    if (dbError) {
    return (
      <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="bg-red-50 border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-12 rounded-3xl text-center">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-black uppercase italic mb-4">Database Schema Sync Required</h2>
          <p className="font-bold text-black mb-8">{dbError}</p>
          <div className="bg-black text-[#FFD600] p-6 rounded-2xl text-left font-mono text-sm overflow-x-auto">
            <p className="mb-2 text-white/50">-- Run this to force-recreate the table with dependencies handled --</p>
            <pre>{`DROP TABLE IF EXISTS orders CASCADE;

CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  product_id UUID REFERENCES inventory(id) ON DELETE SET NULL,
  whatsapp_number TEXT,
  quantity INTEGER DEFAULT 1,
  unit_price NUMERIC,
  total_price NUMERIC,
  sales_channel TEXT,
  status TEXT DEFAULT 'Process',
  tracking_number TEXT DEFAULT '-',
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Re-enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all access" ON orders FOR ALL USING (true) WITH CHECK (true);`}</pre>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="mt-8 neo-brutal-btn-yellow"
          >
            I've Updated the Database
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
            <div className="p-3 bg-[#FB923C] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <ReceiptText className="w-10 h-10" />
            </div>
            Order Tracker
          </h1>
          <p className="text-black font-bold mt-2 uppercase italic">Manage and track your sales across all platforms.</p>
        </div>
        <button 
          onClick={() => setIsFormOpen(true)}
          className="neo-brutal-btn-yellow flex items-center gap-3 text-lg w-full md:w-auto justify-center"
        >
          <Plus className="w-6 h-6" /> New Order
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatusSummary count={stats.process} label="Processing" status="Process" />
        <StatusSummary count={stats.packed} label="Packed" status="Packed" />
        <StatusSummary count={stats.shipped} label="Shipped" status="Shipped" />
        <StatusSummary count={stats.delivered} label="Delivered" status="Delivered" />
      </div>

      {/* Search Bar */}
      <div className="relative w-full mb-12">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-black" />
        <input 
          type="text" 
          placeholder="Cari No. Resi atau Nama Customer..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-14 pr-6 py-5 bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] font-black text-lg outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all"
        />
      </div>

      {/* Order List (Timeline Cards) */}
      <div className="space-y-8">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-black animate-spin" />
            <p className="font-black uppercase italic text-black">Loading Orders...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <OrderCard 
              key={order.id} 
              order={order} 
              onUpdateStatus={updateStatus} 
              onDelete={deleteOrder}
              onChatWA={() => window.open(generateWALink(order), '_blank')}
            />
          ))
        ) : (
          <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] p-20 text-center rounded-3xl">
            <ShoppingBag className="w-16 h-16 text-black/10 mx-auto mb-4" />
            <p className="text-2xl font-black uppercase italic text-black/20">No orders found</p>
          </div>
        )}
      </div>

      {/* New Order Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/20 backdrop-blur-md">
          <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl rounded-3xl p-10 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setIsFormOpen(false)} className="absolute top-8 right-8 p-1 border-[3px] border-black bg-[#FB923C] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              <X className="w-6 h-6 text-black" />
            </button>
            
            <h2 className="text-4xl font-black uppercase italic mb-8 underline text-black">
                🚀 Buat Pesanan Baru
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase italic text-black">Nama Customer</label>
                  <input 
                    required 
                    value={formData.customer_name} 
                    onChange={e => setFormData({...formData, customer_name: e.target.value})} 
                    placeholder="Masukkan nama..."
                    className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase italic text-black">Nomor WhatsApp</label>
                  <input 
                    required 
                    value={formData.whatsapp_number} 
                    onChange={e => setFormData({...formData, whatsapp_number: e.target.value})} 
                    placeholder="628123456789"
                    className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" 
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-black uppercase italic text-black">Pilih Produk</label>
                <select 
                  required
                  value={formData.product_id}
                  onChange={e => setFormData({...formData, product_id: e.target.value})}
                  className="border-[3px] border-black p-3 font-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black appearance-none cursor-pointer"
                >
                  <option value="">-- Pilih Diecast --</option>
                  {inventory.map(item => (
                    <option key={item.id} value={item.id} disabled={item.stock <= 0}>
                      {item.name} ({item.brand}) - Stok: {item.stock}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase italic text-black">Quantity</label>
                  <input 
                    type="number" 
                    min="1"
                    max={selectedProduct?.stock || 1}
                    value={formData.quantity} 
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} 
                    className="border-[3px] border-black p-3 font-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase italic text-black">Harga Satuan</label>
                  <input 
                    type="number" 
                    value={formData.unit_price} 
                    onChange={e => setFormData({...formData, unit_price: parseInt(e.target.value)})} 
                    className="border-[3px] border-black p-3 font-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" 
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase italic text-black">Channel</label>
                  <select 
                    value={formData.sales_channel}
                    onChange={e => setFormData({...formData, sales_channel: e.target.value})}
                    className="border-[3px] border-black p-3 font-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black appearance-none cursor-pointer"
                  >
                    {SALES_CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase italic text-black">Alamat Pengiriman</label>
                  <textarea 
                    value={formData.address} 
                    onChange={e => setFormData({...formData, address: e.target.value})} 
                    placeholder="Masukkan alamat lengkap..."
                    rows={2}
                    className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black resize-none" 
                  />
              </div>

              <div className="bg-[#FFD600] border-[4px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex justify-between items-center">
                  <span className="font-black uppercase italic text-lg">Total Bayar</span>
                  <span className="text-3xl font-black italic">{formatIDR(totalPrice)}</span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={submitting}
                className="neo-brutal-btn-mint w-full text-xl mt-4 flex items-center justify-center gap-3"
              >
                {submitting ? <Loader2 className="animate-spin" /> : "🚀 Buat Pesanan & Potong Stok"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function StatusSummary({ count, label, status }: { count: number, label: string, status: string }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <div className={`border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl flex items-center gap-6 ${config.color}`}>
      <div className="w-14 h-14 border-[3px] border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <Icon className="w-8 h-8 text-black" />
      </div>
      <div>
        <p className="text-3xl font-black italic tracking-tighter text-black">{count}</p>
        <p className="font-black uppercase text-[10px] italic tracking-widest underline text-black">{label}</p>
      </div>
    </div>
  );
}

function OrderCard({ order, onUpdateStatus, onDelete, onChatWA }: { 
  order: any, 
  onUpdateStatus: (id: string, s: string) => void,
  onDelete: (id: string) => void,
  onChatWA: () => void
}) {
  const config = STATUS_CONFIG[order.status] || STATUS_CONFIG['Process'];
  const StatusIcon = config.icon;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className={`flex flex-col md:flex-row bg-white border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all`}>
      {/* Status Side Indicator */}
      <div className={`w-full md:w-3 ${config.color} border-b-[4px] md:border-b-0 md:border-r-[4px] border-black`} />
      
      <div className="flex-1 p-6 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className={`p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${config.color}`}>
              <StatusIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase italic leading-none">{order.id}</h3>
              <p className="text-xs font-bold uppercase opacity-50 flex items-center gap-1 mt-1">
                <Calendar className="w-3 h-3" /> {new Date(order.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>
          <div className={`px-4 py-1.5 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-xs ${config.color}`}>
            {order.status}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          <div className="space-y-4">
            <InfoItem icon={<User />} label="Customer" value={order.customer_name} />
            <InfoItem icon={<ShoppingBag />} label="Item" value={`${order.inventory?.name || 'Unknown'} x${order.quantity}`} />
          </div>
          <div className="space-y-4">
            <InfoItem icon={<Hash />} label="Resi" value={order.tracking_number} />
            <InfoItem icon={<Send />} label="Channel" value={order.sales_channel} />
          </div>
          <div className="lg:col-span-1 flex flex-col justify-end items-start lg:items-end">
            <p className="text-[10px] font-black uppercase italic underline opacity-50">Total Pembayaran</p>
            <p className="text-3xl font-black italic">{formatIDR(order.total_price)}</p>
          </div>
        </div>

        {order.address && (
          <div className="bg-[#FAF8F5] border-[3px] border-black p-4 mb-8 flex gap-3">
            <MapPin className="w-5 h-5 text-black shrink-0" />
            <p className="text-xs font-bold text-black">{order.address}</p>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t-[3px] border-dashed border-black">
          <ActionButton onClick={() => onUpdateStatus(order.id, 'Packed')} label="📦 Packed" color="bg-blue-400" />
          <ActionButton onClick={() => onUpdateStatus(order.id, 'Shipped')} label="🚚 Shipped" color="bg-purple-400" />
          <ActionButton onClick={() => onUpdateStatus(order.id, 'Delivered')} label="✅ Delivered" color="bg-green-400" />
          
          <div className="flex-1" />
          
          <button 
            onClick={onChatWA}
            className="flex items-center gap-2 px-4 py-2 bg-[#25D366] border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-xs hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
          >
            <MessageCircle className="w-4 h-4" /> Chat WA
          </button>
          
          <button 
            onClick={() => onDelete(order.id)}
            className="p-2 bg-red-400 border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 transition-all"
          >
            <Trash2 className="w-4 h-4 text-black" />
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-[#FAF8F5] border-[2px] border-black shrink-0">
        {icon && <span className="w-4 h-4 block">{icon}</span>}
      </div>
      <div>
        <p className="text-[10px] font-black uppercase italic opacity-40 leading-none mb-1">{label}</p>
        <p className="text-sm font-black uppercase italic leading-none">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ onClick, label, color }: { onClick: () => void, label: string, color: string }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 ${color} border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-[10px] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all`}
    >
      {label}
    </button>
  );
}
