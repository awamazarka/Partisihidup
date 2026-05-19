'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Tag, Heart, ShoppingCart, Loader2, X, MessageCircle, QrCode, ArrowRight, Info } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function StorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment'>('details');
  const [role, setRole] = useState<string | null>(null);

  const supabase = createClient();

  useEffect(() => {
    fetchStoreItems();
    setRole(localStorage.getItem('user-role'));
  }, []);

  async function fetchStoreItems() {
    setLoading(true);
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .gt('stock', 0)
      .order('created_at', { ascending: false });
    
    if (data) {
      setItems(data);
      setFilteredItems(data);
    }
    setLoading(false);
  }

  useEffect(() => {
    const filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.scale && item.scale.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const openWhatsApp = (item: any) => {
    const text = `Halo AditBunta! Saya ingin membeli:\n\n*${item.name}*\nBrand: ${item.brand}\nHarga: ${formatIDR(item.sell_price)}\n\nApakah barang masih tersedia?`;
    window.open(`https://wa.me/6281385157755?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 mb-12">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#A3E635] border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] text-black text-[10px] font-black uppercase tracking-widest">
            <Tag className="w-3 h-3" /> Live Inventory
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black">Garasi Premium</h1>
          <p className="text-black font-bold italic text-sm md:text-base">Cek koleksi pilihan kita dan lengkapin isi garasimu sekarang!</p>
        </div>
        
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <div className="relative flex-1 lg:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
            <input 
              type="text" 
              placeholder="Search items..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-sm outline-none text-black"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-24 gap-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="font-black uppercase italic text-black">Opening the Garage...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.length > 0 ? filteredItems.map((item) => (
            <div key={item.id} onClick={() => setSelectedItem(item)} className="neo-brutal-card group flex flex-col p-4 rounded-2xl cursor-pointer">
              <div className="aspect-square bg-[#FAF8F5] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-4 group-hover:bg-[#FFD600] transition-colors">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center opacity-10">
                    <ShoppingBag className="w-20 h-20" />
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <div className="bg-black text-white text-[8px] font-black px-2 py-1 uppercase">{item.scale}</div>
                </div>
                <div className="absolute bottom-3 left-3">
                  <span className="px-2 py-1 bg-black text-white text-[10px] font-black uppercase italic">
                    {item.brand}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4 flex-1 flex flex-col">
                <div>
                  <h3 className="font-black text-lg uppercase italic leading-tight group-hover:underline text-black">{item.name}</h3>
                  <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-black uppercase bg-[#A3E635] px-2 border-[2px] border-black italic text-black">Stock: {item.stock}</span>
                      <span className="text-[10px] font-black uppercase bg-white px-2 border-[2px] border-black italic text-black">{item.condition || 'Mint'}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-4 border-t-[2px] border-black border-dashed">
                  <span className="text-xl font-black italic text-black">{formatIDR(item.sell_price)}</span>
                  <button className="p-3 border-[3px] border-black bg-[#FFD600] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
                    <ShoppingCart className="w-5 h-5 text-black" />
                  </button>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-full py-20 text-center">
              <p className="text-2xl font-black uppercase italic text-black/20">No items found matching your search</p>
            </div>
          )}
        </div>
      )}

      {/* Item Detail & Checkout Modal */}
      {selectedItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
              <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-4xl rounded-3xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]">
                  <button onClick={() => {setSelectedItem(null); setCheckoutStep('details');}} className="absolute top-6 right-6 z-10 p-1 border-[3px] border-black bg-[#FB923C] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      <X className="w-6 h-6 text-black" />
                  </button>

                  {/* Image Column */}
                  <div className="md:w-1/2 bg-[#FAF8F5] border-r-[4px] border-black flex items-center justify-center p-8">
                      <div className="w-full aspect-square border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden">
                          {selectedItem.image_url ? (
                              <img src={selectedItem.image_url} className="w-full h-full object-cover" />
                          ) : (
                              <div className="w-full h-full flex items-center justify-center opacity-20"><ShoppingBag className="w-32 h-32" /></div>
                          )}
                      </div>
                  </div>

                  {/* Info Column */}
                  <div className="md:w-1/2 p-10 flex flex-col bg-white overflow-y-auto">
                      {checkoutStep === 'details' ? (
                          <>
                            <div className="mb-8">
                                <div className="inline-block bg-[#FFD600] border-[2px] border-black px-3 py-1 font-black text-xs uppercase italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-4">
                                    {selectedItem.brand} - {selectedItem.scale}
                                </div>
                                <h2 className="text-4xl font-black uppercase italic leading-none text-black underline mb-2">{selectedItem.name}</h2>
                                <p className="text-2xl font-black text-[#05ffa1] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] italic">{formatIDR(selectedItem.sell_price)}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <DetailBox label="Condition" value={selectedItem.condition || 'MINT'} color="bg-[#A3E635]" />
                                <DetailBox label="Color" value={selectedItem.color || 'STANDARD'} color="bg-[#FB923C]" />
                                <DetailBox label="Availability" value={`${selectedItem.stock} UNITS`} color="bg-[#FFD600]" />
                                <DetailBox label="SKU" value={`AB-${selectedItem.id.slice(0,5).toUpperCase()}`} color="bg-white" />
                            </div>

                            <div className="mt-auto space-y-4">
                                {role ? (
                                    <button 
                                        onClick={() => setCheckoutStep('payment')}
                                        className="neo-brutal-btn-yellow w-full text-xl flex items-center justify-center gap-3"
                                    >
                                        PROCEED TO CHECKOUT <ArrowRight />
                                    </button>
                                ) : (
                                    <Link href="/login" className="neo-brutal-btn-mint w-full text-xl flex items-center justify-center gap-3 text-center">
                                        LOGIN TO PURCHASE <ArrowRight />
                                    </Link>
                                )}
                            </div>
                          </>
                      ) : (
                          <>
                            <h2 className="text-3xl font-black uppercase italic mb-8 underline text-black">Payment Methods</h2>
                            
                            <div className="space-y-6">
                                <button 
                                    onClick={() => openWhatsApp(selectedItem)}
                                    className="w-full bg-[#25D366] border-[3px] border-black p-6 flex items-center gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                                >
                                    <div className="p-3 bg-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                        <MessageCircle className="w-8 h-8 text-[#25D366]" />
                                    </div>
                                    <div className="text-left">
                                        <span className="block font-black uppercase text-xl italic text-black">DIRECT WHATSAPP</span>
                                        <span className="text-[10px] font-bold uppercase text-black opacity-70">Order via +62 813-8515-7755</span>
                                    </div>
                                </button>

                                <div className="w-full bg-white border-[3px] border-black p-6 flex flex-col items-center gap-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="flex items-center gap-4 w-full">
                                        <div className="p-3 bg-[#FFD600] border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                                            <QrCode className="w-8 h-8 text-black" />
                                        </div>
                                        <div className="text-left">
                                            <span className="block font-black uppercase text-xl italic text-black">QRIS / BANK TRANSFER</span>
                                            <span className="text-[10px] font-bold uppercase text-black opacity-70">Scan & Pay securely</span>
                                        </div>
                                    </div>
                                    
                                    <div className="w-48 h-48 border-[3px] border-black bg-[#FAF8F5] flex items-center justify-center relative group">
                                        <div className="text-xs font-black uppercase italic opacity-20 text-center p-4">QR CODE PLACEHOLDER</div>
                                        <div className="absolute inset-0 border-4 border-dashed border-black/10 m-2" />
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setCheckoutStep('details')}
                                className="mt-8 text-black font-black uppercase italic underline text-sm"
                            >
                                ← BACK TO DETAILS
                            </button>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}
    </main>
  );
}

function DetailBox({ label, value, color }: { label: string, value: string, color: string }) {
    return (
        <div className={`p-4 border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color}`}>
            <span className="block text-[8px] font-black uppercase italic underline text-black mb-1">{label}</span>
            <span className="block font-black text-xs uppercase italic text-black truncate">{value}</span>
        </div>
    )
}
