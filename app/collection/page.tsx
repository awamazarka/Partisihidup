'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, LayoutGrid, List, 
  ArrowUpDown, Loader2, Sparkles, Box, 
  ChevronRight, ExternalLink, Image as ImageIcon,
  Plus, X, Upload, ChevronLeft, Maximize2
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import Link from 'next/link';

const BRANDS = ["All Brands", "Hot Wheels", "Mini GT", "INNO64", "MATCHBOX", "TARMAC", "Tomica", "Other"];

export default function CollectionPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbError, setDbError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [sortBy, setSortBy] = useState('newest');
  const [role, setRole] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [activeLightboxImg, setActiveLightboxImg] = useState(0);

  // Form State for Admin
  const [formData, setFormData] = useState({
    name: '',
    brand: 'Hot Wheels',
    description: '',
    images: [] as string[],
    is_featured: false
  });
  const [uploading, setUploading] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    const getCookie = (name: string): string | null => {
      if (typeof document === 'undefined') return null;
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
          return parts.pop()?.split(';').shift() || null;
      }
      return null;
    };

    setRole(getCookie('user-role'));
    fetchCollection();
  }, []);

  async function fetchCollection() {
    setLoading(true);
    setDbError(false);
    const { data, error } = await supabase
      .from('car_collection')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Collection fetch error:', error);
      setDbError(true);
    } else if (data) {
      setItems(data);
    }
    setLoading(false);
  }

  const filteredItems = useMemo(() => {
    let result = items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedBrand !== 'All Brands') {
      result = result.filter(item => item.brand === selectedBrand);
    }

    if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return result;
  }, [searchQuery, selectedBrand, sortBy, items]);

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setFormData({
        name: item.name,
        brand: item.brand,
        description: item.description || '',
        images: item.images || [],
        is_featured: item.is_featured || false
    });
    setIsModalOpen(true);
  };

  const closeFormModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({ name: '', brand: 'Hot Wheels', description: '', images: [], is_featured: false });
  };

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      if (!e.target.files || e.target.files.length === 0) return;
      
      const files = Array.from(e.target.files);
      const newImages = [...formData.images];

      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
          .from('collections')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('collections')
          .getPublicUrl(fileName);
        
        newImages.push(publicUrl);
      }

      setFormData({ ...formData, images: newImages });
    } catch (error: any) {
      alert(`Upload Gagal: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formData.images.length === 0) return alert("Pilih minimal 1 foto koleksi kak!");

    if (editingItem) {
        const { error } = await supabase
            .from('car_collection')
            .update(formData)
            .eq('id', editingItem.id);
        
        if (!error) {
            closeFormModal();
            fetchCollection();
        } else alert(error.message);
    } else {
        const { error } = await supabase.from('car_collection').insert([formData]);
        if (!error) {
            closeFormModal();
            fetchCollection();
        } else alert(error.message);
    }
  }

  const openLightbox = (itemIdx: number, imgIdx: number) => {
    setSelectedItemIndex(itemIdx);
    setActiveLightboxImg(imgIdx);
  };

  const nextLightboxImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIndex === null) return;
    const currentItem = filteredItems[selectedItemIndex];
    setActiveLightboxImg((prev) => (prev + 1) % currentItem.images.length);
  };

  const prevLightboxImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedItemIndex === null) return;
    const currentItem = filteredItems[selectedItemIndex];
    setActiveLightboxImg((prev) => (prev - 1 + currentItem.images.length) % currentItem.images.length);
  };

  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
      {/* DB Setup Check - Only show if there is an error */}
      {dbError && (
         <div className="mb-12 p-6 bg-black text-[#FFD600] border-[4px] border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-2xl font-mono text-sm">
            <p className="font-bold mb-2">-- Database Upgrade Required --</p>
            <p className="mb-4 text-white/70">Error: Column 'is_featured' not found. Silakan jalankan query ini di SQL Editor Supabase:</p>
            <pre className="bg-white/10 p-4 rounded-xl overflow-x-auto whitespace-pre mb-6">
{`ALTER TABLE car_collection ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;`}
            </pre>
            <div className="p-4 border-[2px] border-dashed border-[#FFD600]/30 rounded-xl">
                <p className="font-bold text-xs uppercase mb-2">Penting:</p>
                <p className="text-xs text-white/50 leading-relaxed">
                    Jika query sudah dijalankan tapi tetap error, ini karena **Schema Cache** Supabase belum update. <br />
                    Buka **Supabase Dashboard** &rarr; **Settings** &rarr; **API** &rarr; Klik tombol **"Reload PostgREST schema"**.
                </p>
            </div>
         </div>
      )}

      {/* Hero Section */}
      <div className="mb-16 text-center md:text-left flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#A3E635] border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full mb-2">
            <Sparkles className="w-4 h-4 text-black" />
            <span className="text-[10px] font-black uppercase tracking-widest italic text-black">Master Showcase</span>
          </div>
          <h1 className="text-6xl md:text-6xl font-black uppercase italic tracking-tighter text-black leading-none">
            My <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] [-webkit-text-stroke:2px_black]">Collections</span>
          </h1>
          <p className="text-black font-bold italic text-lg max-w-xl">
            A high-definition visual gallery of my personal diecast masterpieces.
          </p>
        </div>
        <div className="flex flex-col items-end gap-4">
            {role === 'admin' && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="neo-brutal-btn-yellow flex items-center gap-3"
                >
                  <Plus className="w-6 h-6" /> Add Collection
                </button>
            )}
            <div className="flex flex-col items-end">
                <p className="font-black text-5xl italic tracking-tighter leading-none">{items.length}</p>
                <p className="font-black uppercase italic text-xs underline">Personal Assets</p>
            </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col lg:flex-row gap-6 mb-12 items-center">
        <div className="relative flex-1 w-full lg:w-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black" />
          <input 
            type="text" 
            placeholder="Search my collection..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-bold outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          />
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 w-full lg:w-auto">
          <select 
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-6 py-4 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-sm outline-none cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            {BRANDS.map(brand => <option key={brand} value={brand}>{brand}</option>)}
          </select>

          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-6 py-4 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-sm outline-none cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            <option value="newest">Latest Added</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {/* Grid Display */}
      {loading ? (
        <div className="py-32 flex flex-col items-center justify-center gap-4">
          <Loader2 className="w-12 h-12 text-black animate-spin" />
          <p className="font-black uppercase italic text-black">Unlocking the vault...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {filteredItems.map((item, idx) => (
            <CollectionCard 
                key={item.id} 
                item={item} 
                onImageClick={(imgIdx) => openLightbox(idx, imgIdx)} 
                isAdmin={role === 'admin'}
                onEdit={() => openEditModal(item)}
            />
          ))}
          
          {filteredItems.length === 0 && !dbError && (
            <div className="col-span-full py-20 text-center">
                <Box className="w-16 h-16 text-black/10 mx-auto mb-4" />
                <p className="text-2xl font-black uppercase italic text-black/20">Garage is currently empty</p>
            </div>
          )}
        </div>
      )}

      {/* Lightbox with Navigation */}
      {selectedItemIndex !== null && (
        <div 
          className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 md:p-12 cursor-zoom-out"
          onClick={() => setSelectedItemIndex(null)}
        >
          <button className="absolute top-8 right-8 text-white p-2 border-[2px] border-white/20 rounded-full hover:bg-white/10 transition-all z-[210]">
            <X className="w-8 h-8" />
          </button>

          {filteredItems[selectedItemIndex].images.length > 1 && (
            <>
                <button 
                    onClick={prevLightboxImg}
                    className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 text-white p-4 bg-white/5 border-[2px] border-white/10 rounded-2xl hover:bg-white/20 transition-all z-[210]"
                >
                    <ChevronLeft className="w-10 h-10" />
                </button>
                <button 
                    onClick={nextLightboxImg}
                    className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 text-white p-4 bg-white/5 border-[2px] border-white/10 rounded-2xl hover:bg-white/20 transition-all z-[210]"
                >
                    <ChevronRight className="w-10 h-10" />
                </button>
            </>
          )}

          <div className="relative max-w-full max-h-full flex flex-col items-center gap-6">
            <img 
                src={filteredItems[selectedItemIndex].images[activeLightboxImg]} 
                className="max-w-full max-h-[80vh] object-contain shadow-[0_0_50px_rgba(0,0,0,1)] animate-in zoom-in-95 duration-300" 
                alt="Enlarged Collection" 
            />
            <div className="bg-white/10 backdrop-blur-md px-6 py-3 border-[2px] border-white/20 text-white rounded-2xl text-center">
                <p className="font-black uppercase italic text-xl tracking-tighter">{filteredItems[selectedItemIndex].name}</p>
                <p className="text-xs font-bold opacity-60">Image {activeLightboxImg + 1} of {filteredItems[selectedItemIndex].images.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Admin Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-white/20 backdrop-blur-md">
          <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-xl rounded-3xl p-10 relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button onClick={closeFormModal} className="absolute top-8 right-8 p-1 border-[3px] border-black bg-[#FB923C] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <X className="w-6 h-6 text-black" />
            </button>
            <h2 className="text-4xl font-black uppercase italic mb-8 underline text-black">
                {editingItem ? 'Edit Collection' : 'Add Collection'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                    <label className="text-xs font-black uppercase italic underline text-black">Multi-Image Upload</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <input 
                            type="checkbox" 
                            checked={formData.is_featured} 
                            onChange={e => setFormData({...formData, is_featured: e.target.checked})}
                            className="w-5 h-5 border-[3px] border-black bg-[#FAF8F5] checked:bg-[#A3E635] appearance-none transition-colors cursor-pointer"
                        />
                        <span className="text-[10px] font-black uppercase italic text-black group-hover:text-[#A3E635]">Featured on Landing</span>
                    </label>
                </div>
                <div className="min-h-44 w-full border-[3px] border-black bg-[#FAF8F5] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-4 flex flex-wrap gap-4 relative overflow-hidden group">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="w-20 h-20 border-[2px] border-black relative">
                        <img src={img} className="w-full h-full object-cover" />
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, images: formData.images.filter((_, i) => i !== idx)})}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-0.5 border-[1px] border-black rounded-full"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                  ))}
                  <div className="w-20 h-20 border-[2px] border-dashed border-black flex items-center justify-center relative cursor-pointer hover:bg-black/5">
                      <Plus className="w-6 h-6" />
                      <input type="file" multiple onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" disabled={uploading} />
                  </div>
                  {uploading && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><Loader2 className="w-10 h-10 text-[#FFD600] animate-spin" /></div>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase italic text-black">Item Name</label>
                      <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none text-black" />
                  </div>
                  <div className="flex flex-col gap-1">
                      <label className="text-xs font-black uppercase italic text-black">Brand</label>
                      <select value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none text-black">
                        {BRANDS.filter(b => b !== 'All Brands').map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                  </div>
              </div>

              <div className="flex flex-col gap-1">
                  <label className="text-xs font-black uppercase italic text-black">Description / Notes</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} className="border-[3px] border-black p-3 font-bold bg-[#FAF8F5] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] outline-none text-black resize-none" />
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="neo-brutal-btn-mint w-full text-xl mt-4"
              >
                {editingItem ? 'UPDATE VAULT' : 'SAVE TO VAULT'}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function CollectionCard({ item, onImageClick, isAdmin, onEdit }: { 
    item: any, 
    onImageClick: (imgIdx: number) => void,
    isAdmin: boolean,
    onEdit: () => void 
}) {
  const [activeImg, setActiveImg] = useState(0);

  return (
    <div className="group bg-white border-[4px] border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden hover:translate-x-[4px] hover:translate-y-[4px] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full relative">
      {/* Visual Header */}
      <div className="p-4 flex items-center justify-between border-b-[3px] border-black bg-[#FAF8F5]">
        <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-black text-[#FFD600] font-black uppercase italic text-[10px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                {item.brand}
            </span>
            {item.is_featured && (
                <Sparkles className="w-4 h-4 text-[#FB923C] fill-[#FB923C]" />
            )}
        </div>
        <div className="flex gap-1">
            {isAdmin && (
                <button 
                    onClick={(e) => { e.stopPropagation(); onEdit(); }}
                    className="p-1 border-[2px] border-black bg-[#FFD600] mr-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
                >
                    <Plus className="w-3 h-3 text-black rotate-45 scale-125" />
                </button>
            )}
            <div className="w-2 h-2 rounded-full bg-red-400 border-[1px] border-black" />
            <div className="w-2 h-2 rounded-full bg-[#FFD600] border-[1px] border-black" />
            <div className="w-2 h-2 rounded-full bg-[#A3E635] border-[1px] border-black" />
        </div>
      </div>

      {/* Main Image View */}
      <div className="h-80 bg-zinc-100 relative overflow-hidden flex items-center justify-center">
        {item.images && item.images.length > 0 ? (
          <>
            <img 
              src={item.images[activeImg]} 
              alt={item.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-zoom-in"
              onClick={() => onImageClick(activeImg)}
            />
            {/* Image Counter Overlay */}
            <div className="absolute bottom-4 right-4 px-2 py-1 bg-white/90 backdrop-blur-sm border-[2px] border-black font-black text-[10px] flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {activeImg + 1} / {item.images.length}
            </div>
          </>
        ) : (
          <ImageIcon className="w-16 h-16 text-black/5" />
        )}
      </div>

      {/* Thumbnails if multiple */}
      {item.images?.length > 1 && (
          <div className="flex gap-2 p-3 bg-white border-b-[3px] border-black overflow-x-auto scrollbar-hide">
              {item.images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImg(idx)}
                    className={`w-12 h-12 border-[2px] border-black shrink-0 transition-all ${activeImg === idx ? 'opacity-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'opacity-40'}`}
                  >
                      <img src={img} className="w-full h-full object-cover" />
                  </button>
              ))}
          </div>
      )}

      {/* Text Info */}
      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-3xl font-black uppercase italic tracking-tighter leading-[0.9] mb-4 group-hover:text-[#FB923C] transition-colors text-black">
          {item.name}
        </h3>
        
        {item.description && (
            <div className="bg-[#FAF8F5] border-[2px] border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-black font-bold text-sm italic whitespace-pre-wrap">
                    {item.description}
                </p>
            </div>
        )}

        <div className="mt-auto pt-6 flex justify-between items-center border-t-[3px] border-black border-dashed">
            <button 
                onClick={() => onImageClick(activeImg)}
                className="flex items-center gap-2 font-black uppercase italic text-xs underline hover:text-[#A3E635] transition-colors text-black"
            >
                <Maximize2 className="w-4 h-4" /> Full Visual
            </button>
            <div className="w-10 h-10 rounded-full border-[3px] border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Box className="w-5 h-5 text-black" />
            </div>
        </div>
      </div>
    </div>
  );
}
