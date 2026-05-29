'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, Image as ImageIcon, X, Loader2, Upload, Save, Check } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function InventoryPage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Master LOV States
  const [brands, setBrands] = useState<string[]>([]);
  const [scales, setScales] = useState<string[]>([]);
  const [conditionsList, setConditionsList] = useState<string[]>([]);
  const [conditionsFilter, setConditionsFilter] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [saleFilter, setSaleFilter] = useState<'all' | 'for_sale' | 'not_for_sale'>('all');
  const [brandFilter, setBrandFilter] = useState('All Brands');
  const [conditionFilter, setConditionFilter] = useState('All Conditions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBulkOpen, setIsBulkOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    brand: 'HotWheels',
    scale: '1:64',
    condition: 'Mint in Sealed Box',
    color: '',
    buy_price: 0,
    sell_price: 0,
    stock: 0,
    image_url: '',
    images: [] as string[],
    description: '',
    is_for_sale: false,
    marketplace_links: {
        tokopedia: '',
        shopee: '',
        tiktok: ''
    }
  });

  const [bulkData, setBulkData] = useState("");

  const supabase = createClient();

  useEffect(() => {
    fetchMasterData();
    fetchInventory();
  }, []);

  async function fetchMasterData() {
    const { data } = await supabase
      .from('master_lov')
      .select('category, value')
      .eq('is_active', true);
    
    if (data) {
      const b = data.filter(i => i.category === 'brand').map(i => i.value).sort();
      const s = data.filter(i => i.category === 'scale').map(i => i.value).sort();
      const c = data.filter(i => i.category === 'condition').map(i => i.value);
      
      setBrands(b);
      setScales(s);
      setConditionsList(c);
      setConditionsFilter(["All Conditions", ...c]);
    }
  }

  async function fetchInventory() {
    setLoading(true);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) {
      const normalizedData = data.map(item => ({
        ...item,
        images: Array.isArray(item.images) ? item.images : (item.image_url ? [item.image_url] : [])
      }));
      setItems(normalizedData);
      setFilteredItems(normalizedData);
    }
    setLoading(false);
  }

  useEffect(() => {
    let filtered = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.color && item.color.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.scale && item.scale.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (saleFilter === 'for_sale') {
      filtered = filtered.filter(item => item.is_for_sale === true);
    } else if (saleFilter === 'not_for_sale') {
      filtered = filtered.filter(item => !item.is_for_sale);
    }

    if (brandFilter !== 'All Brands') {
        filtered = filtered.filter(item => item.brand === brandFilter);
    }

    if (conditionFilter !== 'All Conditions') {
        filtered = filtered.filter(item => item.condition === conditionFilter);
    }

    setFilteredItems(filtered);
  }, [searchQuery, saleFilter, brandFilter, conditionFilter, items]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      if (!e.target.files || e.target.files.length === 0) return;
      setUploading(true);
      
      const newImages = [...formData.images];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
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
          
        newImages.push(publicUrl);
      }

      setFormData({ 
        ...formData, 
        images: newImages,
        image_url: newImages[0] // Set first image as primary for legacy support
      });
    } catch (error) {
      alert('Error uploading images!');
    } finally {
      setUploading(false);
    }
  }

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ 
        ...formData, 
        images: newImages,
        image_url: newImages[0] || '' 
    });
  };

  const generateAIDescription = (name: string, brand: string, scale: string, condition: string) => {
      return `Koleksi premium ${brand} ${name} skala ${scale} dengan kondisi ${condition}. Item dikurasi khusus untuk kolektor yang menghargai detail dan kualitas. Sangat layak masuk ke dalam barisan display utama di garasi Anda.`;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    let finalDescription = formData.description;
    if (!finalDescription.trim()) {
        finalDescription = generateAIDescription(formData.name, formData.brand, formData.scale, formData.condition);
    }

    const submitData = {
        ...formData,
        description: finalDescription,
        // Sync first image to legacy field
        image_url: formData.images[0] || ''
    };

    if (editingId) {
        const { error } = await supabase.from('inventory').update(submitData).eq('id', editingId);
        if (!error) {
            setEditingId(null);
            closeModal();
            fetchInventory();
        } else alert(error.message);
    } else {
        const { error } = await supabase.from('inventory').insert([submitData]);
        if (!error) {
            closeModal();
            fetchInventory();
        } else alert(error.message);
    }
  }

  function closeModal() {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ 
        name: '', brand: 'Hot Wheels', scale: '1:64', condition: 'Mint in Sealed Box', color: '', 
        buy_price: 0, sell_price: 0, stock: 0, image_url: '', images: [], description: '',
        is_for_sale: false,
        marketplace_links: { tokopedia: '', shopee: '', tiktok: '' }
      });
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
          image_url: item.image_url || '',
          images: Array.isArray(item.images) ? item.images : (item.image_url ? [item.image_url] : []),
          description: item.description || '',
          is_for_sale: !!item.is_for_sale,
          marketplace_links: item.marketplace_links || { tokopedia: '', shopee: '', tiktok: '' }
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
    <main className="flex-1 pt-48 md:pt-52 pb-20 px-4 md:px-6 max-w-7xl mx-auto w-full">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-12">
        <div className="space-y-1">
          <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-black leading-none">Inventory Manager</h1>
          <p className="text-black font-bold italic text-[10px] md:text-sm opacity-60">Total {items.length} assets synced with Supabase.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
            {/* Search & Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-2 flex-1 md:flex-none">
                <div className="relative flex-1 md:w-56 flex items-center">
                    <Search className="absolute left-3 w-3.5 h-3.5 text-black z-10" />
                    <input 
                    type="text" 
                    placeholder="Quick search..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-bold text-xs outline-none text-black focus:translate-x-[1px] focus:translate-y-[1px] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all h-[42px]"
                    />
                </div>
                
                <div className="flex border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden rounded-lg h-[42px]">
                    {(['all', 'for_sale', 'not_for_sale'] as const).map((f) => (
                        <button 
                            key={f}
                            onClick={() => setSaleFilter(f)}
                            className={`px-3 py-1 text-[8px] font-black uppercase italic transition-all border-r-[2px] last:border-r-0 border-black flex-1 ${saleFilter === f ? (f === 'for_sale' ? 'bg-[#A3E635]' : f === 'not_for_sale' ? 'bg-[#FB923C]' : 'bg-black text-[#FFD600]') : 'bg-white text-black hover:bg-zinc-100'}`}
                        >
                            {f === 'all' ? 'All' : f === 'for_sale' ? 'Store' : 'Inv'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Select Filters & Actions */}
            <div className="flex flex-wrap gap-2 items-center">
                <select 
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-[9px] outline-none cursor-pointer rounded-lg hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all h-[42px] min-w-[100px]"
                >
                    <option value="All Brands">All Brands</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select 
                    value={conditionFilter}
                    onChange={(e) => setConditionFilter(e.target.value)}
                    className="px-3 py-2.5 bg-white border-[2px] border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-[9px] outline-none cursor-pointer rounded-lg hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all h-[42px] min-w-[100px]"
                >
                    {conditionsFilter.map(c => <option key={c} value={c}>{c}</option>)}
                </select>

                <div className="flex gap-2 flex-1 sm:flex-none">
                    <button 
                    onClick={() => setIsBulkOpen(true)}
                    className="flex-1 sm:flex-none bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-xs px-6 py-4 flex items-center justify-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-black h-[52px] rounded-xl"
                    >
                    <Upload className="w-5 h-5" /> Bulk
                    </button>
                    <button 
                    onClick={() => setIsModalOpen(true)}
                    className="flex-1 sm:flex-none bg-[#FFD600] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black uppercase text-xs px-6 py-4 flex items-center justify-center gap-2 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all text-black h-[52px] rounded-xl"
                    >
                    <Plus className="w-5 h-5" /> Add
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-2xl overflow-hidden">
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/50 backdrop-blur-md">
          <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl rounded-3xl p-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={closeModal} className="absolute top-8 right-8 p-1 border-[3px] border-black bg-[#FB923C] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
              <X className="w-6 h-6 text-black" />
            </button>
            
            <h2 className="text-4xl font-black uppercase italic mb-8 underline text-black">
                {editingId ? 'Edit Asset' : 'Add New Asset'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Image Section */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase italic underline text-black">Product Photos (Multi-Upload)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                        <div key={idx} className="aspect-square border-[3px] border-black bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative group overflow-hidden">
                            <img src={img} className="w-full h-full object-cover" />
                            <button 
                                type="button"
                                onClick={() => removeImage(idx)}
                                className="absolute top-1 right-1 bg-[#FF007A] border-[2px] border-black p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-white" />
                            </button>
                        </div>
                    ))}
                    <label className="aspect-square border-[3px] border-black border-dashed bg-[#FAF8F5] hover:bg-[#A3E635] transition-colors flex flex-col items-center justify-center cursor-pointer gap-1 group">
                        <ImageIcon className="w-8 h-8 text-black/20 group-hover:scale-110 transition-transform" />
                        <span className="text-[8px] font-black uppercase text-black/40">Add Photo</span>
                        <input type="file" multiple onChange={handleFileUpload} className="hidden" disabled={uploading} />
                        {uploading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center"><Loader2 className="w-6 h-6 text-black animate-spin" /></div>}
                    </label>
                </div>
              </div>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase italic text-black">Item Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-black uppercase italic text-black">Diecast Color</label>
                      <input value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} placeholder="e.g. Midnight Blue" className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black" />
                  </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-3 gap-4">
                  <SelectField label="Brand" value={formData.brand} options={brands} onChange={v => setFormData({...formData, brand: v})} />
                  <SelectField label="Scale" value={formData.scale} options={scales} onChange={v => setFormData({...formData, scale: v})} />
                  <SelectField label="Condition" value={formData.condition} options={conditionsList} onChange={v => setFormData({...formData, condition: v})} />
              </div>

              {/* Description Section */}
              <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black uppercase italic text-black">Item Description</label>
                    <span className="text-[8px] font-bold italic text-[#FB923C] opacity-60">*Auto-AI if left blank</span>
                  </div>
                  <textarea 
                    value={formData.description} 
                    onChange={e => setFormData({...formData, description: e.target.value})} 
                    placeholder="Describe your asset..."
                    rows={4}
                    className="border-[3px] border-black p-4 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none text-black text-sm resize-none"
                  />
              </div>

              {/* Pricing & Stock */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <InputGroup label="Buy (IDR)" value={formData.buy_price} onChange={v => setFormData({...formData, buy_price: v})} />
                <InputGroup label="Sell (IDR)" value={formData.sell_price} onChange={v => setFormData({...formData, sell_price: v})} />
                <InputGroup label="Qty" value={formData.stock} onChange={v => setFormData({...formData, stock: v})} />
                
                {/* For Sale Flag */}
                <div 
                    onClick={() => setFormData({...formData, is_for_sale: !formData.is_for_sale})}
                    className={`flex items-center justify-between p-3 border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none ${formData.is_for_sale ? 'bg-[#A3E635]' : 'bg-white'}`}
                >
                    <span className="text-[10px] font-black uppercase italic text-black">Siap Jual</span>
                    <div className={`w-5 h-5 border-[2px] border-black flex items-center justify-center ${formData.is_for_sale ? 'bg-black' : 'bg-white'}`}>
                        {formData.is_for_sale && <Check className="w-3 h-3 text-[#A3E635]" />}
                    </div>
                </div>
              </div>

              {/* Marketplace Links */}
              <div className="bg-[#FAF8F5] border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] space-y-4">
                  <label className="text-[10px] font-black uppercase italic underline text-black">Marketplace Options (External URLs)</label>
                  <div className="space-y-3">
                      <MarketLinkInput label="Tokopedia" value={formData.marketplace_links.tokopedia} onChange={v => setFormData({...formData, marketplace_links: {...formData.marketplace_links, tokopedia: v}})} color="bg-emerald-50" />
                      <MarketLinkInput label="Shopee" value={formData.marketplace_links.shopee} onChange={v => setFormData({...formData, marketplace_links: {...formData.marketplace_links, shopee: v}})} color="bg-orange-50" />
                      <MarketLinkInput label="TikTok Shop" value={formData.marketplace_links.tiktok} onChange={v => setFormData({...formData, marketplace_links: {...formData.marketplace_links, tiktok: v}})} color="bg-zinc-50" />
                  </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="neo-brutal-btn-mint w-full text-xl mt-4 flex items-center justify-center gap-3"
              >
                {uploading ? <Loader2 className="animate-spin" /> : <Save />}
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

function MarketLinkInput({ label, value, onChange, color }: { label: string, value: string, onChange: (v: string) => void, color: string }) {
    return (
        <div className={`flex flex-col gap-1 p-3 border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${color}`}>
            <label className="text-[8px] font-black uppercase italic text-black/60">{label} Link</label>
            <input 
                type="url" 
                value={value} 
                onChange={e => onChange(e.target.value)} 
                placeholder={`https://${label.toLowerCase()}.com/...`}
                className="bg-transparent border-none font-bold text-xs outline-none text-black placeholder:text-black/20" 
            />
        </div>
    )
}
