'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Image as ImageIcon, X, Loader2, Upload, Save, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const BRANDS = ["Hot Wheels", "Mini GT", "INNO64", "MATCHBOX", "TARMAC", "Tomica", "Tren Hobby", "Almost Real", "Star Race", "TIME MICRO", "Other"];
const SCALES = ["1:18", "1:43", "1:64", "Other"];
const CONDITIONS = ["Mint in Sealed Box", "Open Box Good", "Not Good with Box", "Loose", "Damaged"];

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Hot Wheels',
    scale: '1:64',
    condition: 'Mint in Sealed Box',
    color: '',
    buy_price: 0,
    sell_price: 0,
    stock: 0,
    image_url: ''
  });

  const [bulkData, setBulkData] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
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
      (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.scale && item.scale.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredItems(filtered);
  }, [searchQuery, items]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('inventory')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('inventory')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
    } catch (error) {
      alert('Error uploading image!');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingId) {
        const { error } = await supabase.from('inventory').update(formData).eq('id', editingId);
        if (!error) {
            setEditingId(null);
            closeModal();
            fetchInventory();
        } else alert(error.message);
    } else {
        const { error } = await supabase.from('inventory').insert([formData]);
        if (!error) {
            closeModal();
            fetchInventory();
        } else alert(error.message);
    }
  }

  function closeModal() {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: '', brand: 'Hot Wheels', scale: '1:64', condition: 'Mint in Sealed Box', color: '', buy_price: 0, sell_price: 0, stock: 0, image_url: '' });
  }

  function handleEdit(item: any) {
      setEditingId(item.id);
      setFormData({
          name: item.name,
          brand: item.brand,
          scale: item.scale,
          condition: item.condition || 'Mint in Sealed Box',
          color: item.color || '',
          buy_price: item.buy_price,
          sell_price: item.sell_price,
          stock: item.stock,
          image_url: item.image_url || ''
      });
      setIsModalOpen(true);
  }

  async function handleDelete(id: string) {
      if (confirm("Are you sure you want to delete this asset?")) {
          const { error } = await supabase.from('inventory').delete().eq('id', id);
          if (!error) fetchInventory();
      }
  }

  async function handleBulkUpload() {
      try {
          const lines = bulkData.split('\n').filter(line => line.trim() !== "");
          const objects = lines.map(line => {
              const [name, brand, stock, buy, sell] = line.split(',').map(s => s.trim());
              return {
                  name,
                  brand: brand || 'Other',
                  stock: parseInt(stock) || 0,
                  buy_price: parseFloat(buy) || 0,
                  sell_price: parseFloat(sell) || 0,
                  scale: '1:64',
                  condition: 'Mint in Sealed Box'
              };
          });

          const { error } = await supabase.from('inventory').insert(objects);
          if (!error) {
              setIsBulkOpen(false);
              setBulkData("");
              fetchInventory();
          } else throw error;
      } catch (e: any) {
          alert("Error in bulk format: " + e.message);
      }
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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl md:text-5xl font-black uppercase italic tracking-tighter text-black">Inventory Manager</h1>
          <p className="text-black font-bold italic text-sm md:text-base">Total {items.length} assets synced with Supabase.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
                <input 
                  type="text" 
                  placeholder="Search assets..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-sm outline-none text-black"
                />
            </div>
            <div className="flex gap-4">
                <button 
                onClick={() => setIsBulkOpen(true)}
                className="flex-1 sm:flex-none bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase px-6 py-3 flex items-center justify-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all text-black"
                >
                <Upload className="w-5 h-5" /> Bulk
                </button>
                <button 
                onClick={() => setIsModalOpen(true)}
                className="flex-1 sm:flex-none neo-brutal-btn-yellow flex items-center justify-center gap-3 text-lg"
                >
                <Plus className="w-6 h-6" /> Add
                </button>
            </div>
        </div>
      </div>

      <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden">
        {loading ? (
          <div className="p-24 flex flex-col items-center justify-center gap-4">
            <Loader2 className="w-12 h-12 text-black animate-spin" />
            <p className="font-black uppercase italic text-black">Syncing Garage...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#FFD600] border-b-[4px] border-black text-black font-black uppercase italic text-sm">
                <tr>
                  <th className="px-6 py-5">Preview</th>
                  <th className="px-6 py-5">Item Name</th>
                  <th className="px-6 py-5">Brand / Color</th>
                  <th className="px-6 py-5">Condition</th>
                  <th className="px-6 py-5">Stock</th>
                  <th className="px-6 py-5">Price</th>
                  <th className="px-6 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[3px] divide-black bg-[#FAF8F5]">
                {filteredItems.length > 0 ? filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-[#A3E635] transition-colors group">
                    <td className="px-6 py-5">
                      <div className="w-16 h-16 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden relative">
                        {item.image_url ? (
                            <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 opacity-20" />
                            </div>
                        )}
                        <div className="absolute top-0 right-0 bg-black text-white text-[8px] font-black px-1">{item.scale}</div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-black uppercase text-sm italic text-black">{item.name}</td>
                    <td className="px-6 py-5 font-bold text-xs text-black">
                        {item.brand} <br />
                        <span className="opacity-50">{item.color || 'No Color'}</span>
                    </td>
                    <td className="px-6 py-5 text-black">
                        <span className="text-[10px] font-black uppercase border-[2px] border-black px-2 py-1 bg-white text-black">
                            {item.condition || 'New'}
                        </span>
                    </td>
                    <td className="px-6 py-5 font-black text-lg text-black">{item.stock}</td>
                    <td className="px-6 py-5 font-black text-lg italic text-black">{formatIDR(item.sell_price)}</td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <button onClick={() => handleEdit(item)} className="p-2 border-[2px] border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FFD600] transition-all">
                          <Edit className="w-5 h-5 text-black" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-2 border-[2px] border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-[#FB923C] transition-all">
                          <Trash2 className="w-5 h-5 text-black" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={7} className="px-6 py-20 text-center">
                            <p className="text-xl font-black uppercase italic text-black/20">No matching assets found</p>
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Manual Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/20 backdrop-blur-md">
          <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl rounded-3xl p-10 relative max-h-[90vh] overflow-y-auto">
            <button onClick={closeModal} className="absolute top-8 right-8 p-1 border-[3px] border-black bg-[#FB923C] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <X className="w-6 h-6 text-black" />
            </button>
            
            <h2 className="text-4xl font-black uppercase italic mb-8 underline text-black">
                {editingId ? 'Edit Asset' : 'Add New Asset'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black uppercase italic underline text-black">Image Upload</label>
                <div className="h-44 w-full border-[3px] border-black bg-[#FAF8F5] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center relative overflow-hidden group">
                  {formData.image_url ? (
                    <img src={formData.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-3">
                      <ImageIcon className="w-10 h-10 text-black" />
                      <span className="text-xs font-black uppercase italic text-black">Click to Upload</span>
                    </div>
                  )}
                  <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                  {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#FFD600] animate-spin" /></div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase italic text-black">Item Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase italic text-black">Diecast Color</label>
                      <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="e.g. Midnight Blue" className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" />
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                  <SelectField label="Brand" value={formData.brand} options={BRANDS} onChange={v => setFormData({...formData, brand: v})} />
                  <SelectField label="Scale" value={formData.scale} options={SCALES} onChange={v => setFormData({...formData, scale: v})} />
                  <SelectField label="Condition" value={formData.condition} options={CONDITIONS} onChange={v => setFormData({...formData, condition: v})} />
              </div>

              <div className="grid grid-cols-3 gap-6">
                <InputGroup label="Buy (IDR)" value={formData.buy_price} onChange={v => setFormData({...formData, buy_price: v})} />
                <InputGroup label="Sell (IDR)" value={formData.sell_price} onChange={v => setFormData({...formData, sell_price: v})} />
                <InputGroup label="Qty" value={formData.stock} onChange={v => setFormData({...formData, stock: v})} />
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="neo-brutal-btn-mint w-full text-xl mt-4"
              >
                {editingId ? 'UPDATE ASSET' : 'SAVE ASSET'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {isBulkOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/20 backdrop-blur-md">
              <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl rounded-3xl p-10 relative">
                  <button onClick={() => setIsBulkOpen(false)} className="absolute top-8 right-8 p-1 border-[3px] border-black bg-[#FB923C] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      <X className="w-6 h-6 text-black" />
                  </button>
                  <h2 className="text-4xl font-black uppercase italic mb-4 underline text-black">Bulk Upload</h2>
                  <p className="text-black font-bold mb-6 italic text-sm">Format: Name, Brand, Stock, BuyPrice, SellPrice (one per line)</p>
                  
                  <textarea 
                    value={bulkData}
                    onChange={(e) => setBulkData(e.target.value)}
                    placeholder="Skyline GT-R, Hot Wheels, 2, 85000, 150000"
                    className="w-full h-64 border-[3px] border-black bg-[#FAF8F5] p-6 font-mono text-sm shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black"
                  />
                  
                  <button 
                    onClick={handleBulkUpload}
                    className="neo-brutal-btn-yellow w-full text-xl mt-8"
                  >
                      START IMPORT
                  </button>
              </div>
          </div>
      )}
    </main>
  );
}

function InputGroup({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase italic text-black">{label}</label>
            <input type="number" value={value || ''} onChange={e => onChange(Number(e.target.value))} className="border-[3px] border-black p-3 font-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black text-sm" />
        </div>
    )
}

function SelectField({ label, value, options, onChange }: { label: string, value: string, options: string[], onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col gap-1">
            <label className="text-[10px] font-black uppercase italic text-black">{label}</label>
            <select 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                className="border-[3px] border-black p-3 font-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black text-sm appearance-none cursor-pointer"
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    )
}
