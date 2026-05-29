'use client';

import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Tag, Heart, ShoppingCart, Loader2, X, MessageCircle, QrCode, ArrowRight, Info, ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function StorePage() {
  const [items, setItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Master LOV States
  const [brands, setBrands] = useState<string[]>([]);
  const [conditions, setConditions] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [selectedCondition, setSelectedCondition] = useState('All Conditions');
  const [sortBy, setSortBy] = useState('newest');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'reviews'>('details');
  const [role, setRole] = useState<string | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [reviews, setReviews] = useState<any[]>([]);
  const [userReview, setUserReview] = useState({ rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    fetchMasterData();
    fetchStoreItems();
    
    // Initial check from localStorage for fast UI
    const savedRole = localStorage.getItem('user-role');
    if (savedRole) setRole(savedRole);

    // Reliable check using Supabase Auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        const currentRole = localStorage.getItem('user-role') || 'user';
        setRole(currentRole);
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchMasterData() {
    const { data } = await supabase
      .from('master_lov')
      .select('category, value')
      .eq('is_active', true);
    
    if (data) {
      const b = data.filter(i => i.category === 'brand').map(i => i.value).sort();
      const c = data.filter(i => i.category === 'condition').map(i => i.value);
      
      setBrands(["All Brands", ...b]);
      setConditions(["All Conditions", ...c]);
    }
  }

  useEffect(() => {
    if (selectedItem) {
        fetchReviews(selectedItem.id);
    }
  }, [selectedItem]);

  async function fetchReviews(itemId: string) {
    const { data, error } = await supabase
        .from('reviews')
        .select('*, profiles(username)')
        .eq('item_id', itemId)
        .order('created_at', { ascending: false });
    
    if (data) setReviews(data);
  }

  async function submitReview() {
    if (!userReview.comment.trim()) return;
    setIsSubmittingReview(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("Please login to review!");

    const { error } = await supabase.from('reviews').insert({
        item_id: selectedItem.id,
        user_id: user.id,
        rating: userReview.rating,
        comment: userReview.comment
    });

    if (!error) {
        setUserReview({ rating: 5, comment: '' });
        fetchReviews(selectedItem.id);
    } else {
        alert(error.message);
    }
    setIsSubmittingReview(false);
  }

  async function fetchStoreItems() {
    setLoading(true);
    const { data } = await supabase
      .from('inventory')
      .select('*')
      .eq('is_for_sale', true)
      .gt('stock', 0)
      .order('created_at', { ascending: false });
    
    if (data) {
      // Normalize images into array
      const normalizedData = data.map(item => ({
        ...item,
        displayImages: Array.isArray(item.images) && item.images.length > 0 ? item.images : (item.image_url ? [item.image_url] : [])
      }));
      setItems(normalizedData);
      setFilteredItems(normalizedData);
    }
    setLoading(false);
  }

  useEffect(() => {
    let result = [...items];

    // Filter by Search Query
    if (searchQuery) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.scale && item.scale.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by Brand
    if (selectedBrand !== 'All Brands') {
      result = result.filter(item => item.brand === selectedBrand);
    }

    // Filter by Condition
    if (selectedCondition !== 'All Conditions') {
        result = result.filter(item => item.condition === selectedCondition);
    }

    // Sort Logic
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.sell_price - b.sell_price);
        break;
      case 'price-high':
        result.sort((a, b) => b.sell_price - a.sell_price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
    }

    setFilteredItems(result);
  }, [searchQuery, selectedBrand, selectedCondition, sortBy, items]);

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
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10 mb-16">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#A3E635] border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black text-[10px] font-black uppercase tracking-widest rounded-full italic">
            <Tag className="w-3 h-3" /> Exclusive Stock
          </div>
          <h1 className="text-5xl md:text-7xl font-black uppercase italic tracking-tighter text-black leading-none">
            Garasi <span className="text-white drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] [-webkit-text-stroke:2px_black]">Premium</span>
          </h1>
          <p className="text-black font-bold italic text-sm md:text-lg max-w-xl opacity-80 leading-relaxed">
            Cek koleksi pilihan kita dan lengkapin isi garasimu sekarang sebelum kehabisan!
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full lg:w-auto">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-black group-focus-within:text-[#FB923C] transition-colors" />
            <input 
              type="text" 
              placeholder="Cari diecast impian..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-bold outline-none focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all rounded-xl"
            />
          </div>

          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <select 
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="flex-1 md:w-44 px-5 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-xs uppercase italic outline-none cursor-pointer rounded-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none text-center"
            >
              <option value="All Brands">All Brands</option>
              {brands.filter(b => b !== 'All Brands').map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>

            <select 
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="flex-1 md:w-44 px-5 py-4 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-xs uppercase italic outline-none cursor-pointer rounded-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none text-center"
            >
                {conditions.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 md:w-52 px-5 py-4 bg-[#FFD600] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] font-black text-xs uppercase italic outline-none cursor-pointer rounded-xl hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all appearance-none text-center"
            >
              <option value="newest">Latest Added</option>
              <option value="oldest">Oldest Entry</option>
              <option value="price-low">Lowest Price</option>
              <option value="price-high">Highest Price</option>
            </select>
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
            <div key={item.id} onClick={() => {setSelectedItem(item); setActiveImg(0);}} className="neo-brutal-card group flex flex-col p-4 rounded-2xl cursor-pointer">
              <div className="aspect-square bg-[#FAF8F5] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden mb-4 group-hover:bg-[#FFD600] transition-colors">
                {item.displayImages.length > 0 ? (
                  <img 
                    src={`${item.displayImages[0]}?width=400&quality=75`} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                  />
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
              <div className="bg-white border-[4px] border-black shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] w-full max-w-5xl rounded-3xl overflow-hidden relative flex flex-col md:flex-row max-h-[90vh]">
                  <button onClick={() => {setSelectedItem(null); setCheckoutStep('details');}} className="absolute top-6 right-6 z-50 p-1 border-[3px] border-black bg-[#FB923C] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                      <X className="w-6 h-6 text-black" />
                  </button>

                  {/* Image Column */}
                  <div className="md:w-1/2 bg-[#FAF8F5] border-r-[4px] border-black flex flex-col max-h-full">
                      <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative group">
                          {/* Navigation Arrows */}
                          {selectedItem.displayImages.length > 1 && (
                              <>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => (prev > 0 ? prev - 1 : selectedItem.displayImages.length - 1)); }}
                                    className="absolute left-10 z-10 bg-white border-[3px] border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
                                >
                                    <ChevronLeft className="w-6 h-6 text-black" />
                                </button>
                                <button 
                                    onClick={(e) => { e.stopPropagation(); setActiveImg(prev => (prev < selectedItem.displayImages.length - 1 ? prev + 1 : 0)); }}
                                    className="absolute right-10 z-10 bg-white border-[3px] border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all active:scale-95"
                                >
                                    <ChevronRight className="w-6 h-6 text-black" />
                                </button>
                              </>
                          )}

                          <div className="w-full aspect-square border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] bg-white overflow-hidden relative">
                              {selectedItem.displayImages.length > 0 ? (
                                  <img 
                                    src={selectedItem.displayImages[activeImg]} 
                                    className="w-full h-full object-cover" 
                                    alt={selectedItem.name} 
                                  />
                              ) : (
                                  <div className="w-full h-full flex items-center justify-center opacity-20"><ShoppingBag className="w-32 h-32" /></div>
                              )}
                              
                              <div className="absolute top-4 left-4 flex gap-2">
                                  {selectedItem.displayImages.map((_: any, i: number) => (
                                      <div key={i} className={`h-1.5 w-6 border-[1px] border-black ${activeImg === i ? 'bg-[#FFD600]' : 'bg-white/40'}`} />
                                  ))}
                              </div>

                              <div className="absolute bottom-4 right-4 bg-black text-[#FFD600] px-3 py-1 font-black text-[12px] border-[2px] border-[#FFD600] italic">
                                  {selectedItem.brand}
                              </div>
                          </div>
                      </div>
                      
                      {selectedItem.displayImages.length > 1 && (
                        <div className="flex gap-2 p-6 border-t-[4px] border-black overflow-x-auto bg-white custom-scrollbar">
                            {selectedItem.displayImages.map((img: string, idx: number) => (
                                <button 
                                    key={idx} 
                                    onClick={() => setActiveImg(idx)}
                                    className={`w-20 h-20 border-[3px] border-black shrink-0 transition-all ${activeImg === idx ? 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] scale-105' : 'opacity-30 grayscale hover:opacity-100 hover:grayscale-0'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                      )}
                  </div>

                  {/* Info Column */}
                  <div className="md:w-1/2 flex flex-col bg-white overflow-y-auto custom-scrollbar">
                      {/* Modal Nav Tabs */}
                      <div className="flex border-b-[4px] border-black sticky top-0 bg-white z-20 md:pr-20">
                          <button onClick={() => setCheckoutStep('details')} className={`flex-1 py-4 font-black uppercase italic text-xs transition-colors ${checkoutStep === 'details' ? 'bg-[#FFD600]' : 'hover:bg-zinc-50'}`}>Details</button>
                          <button onClick={() => setCheckoutStep('reviews')} className={`flex-1 py-4 font-black uppercase italic text-xs border-x-[3px] border-black transition-colors ${checkoutStep === 'reviews' ? 'bg-[#A3E635]' : 'hover:bg-zinc-50'}`}>Reviews ({reviews.length})</button>
                          <button onClick={() => setCheckoutStep('payment')} className={`flex-1 py-4 font-black uppercase italic text-xs transition-colors ${checkoutStep === 'payment' ? 'bg-[#FB923C]' : 'hover:bg-zinc-50'}`}>Purchase</button>
                      </div>

                      <div className="p-10 flex-1 flex flex-col">
                      {checkoutStep === 'details' && (
                          <>
                            <div className="mb-8">
                                <div className="inline-block bg-[#FFD600] border-[2px] border-black px-3 py-1 font-black text-xs uppercase italic shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] mb-4">
                                    {selectedItem.brand} - {selectedItem.scale}
                                </div>
                                <h2 className="text-4xl font-black uppercase italic leading-none text-black underline mb-2 break-words">{selectedItem.name}</h2>
                                <p className="text-2xl font-black text-[#05ffa1] drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] italic">{formatIDR(selectedItem.sell_price)}</p>
                            </div>

                            <div className="bg-[#FAF8F5] border-[3px] border-black p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                                <span className="block text-[10px] font-black uppercase italic underline mb-2">Item Description</span>
                                <p className="text-sm font-bold text-black leading-relaxed whitespace-pre-wrap">
                                    {selectedItem.description || "Premium quality diecast scale model. Perfect for your curated garage showcase. Mint condition guaranteed unless specified."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <DetailBox label="Condition" value={selectedItem.condition || 'MINT'} color="bg-[#A3E635]" />
                                <DetailBox label="Color" value={selectedItem.color || 'STANDARD'} color="bg-[#FB923C]" />
                                <DetailBox label="Availability" value={`${selectedItem.stock} UNITS`} color="bg-[#FFD600]" />
                                <DetailBox label="ID" value={selectedItem.id.slice(0,8).toUpperCase()} color="bg-white" />
                            </div>

                            <div className="mt-auto space-y-4 pt-4 border-t-[3px] border-black border-dashed">
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
                      )}

                      {checkoutStep === 'reviews' && (
                          <div className="space-y-8">
                              <h2 className="text-3xl font-black uppercase italic underline text-black">Customer Reviews</h2>
                              
                              {/* Submit Review Form */}
                              {role ? (
                                <div className="bg-[#FAF8F5] border-[3px] border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <label className="block text-[10px] font-black uppercase italic mb-3">Leave a rating & comment</label>
                                    <div className="flex gap-2 mb-4">
                                        {[1,2,3,4,5].map(star => (
                                            <button 
                                                key={star} 
                                                onClick={() => setUserReview({...userReview, rating: star})}
                                                className={`w-8 h-8 border-[2px] border-black flex items-center justify-center transition-all ${userReview.rating >= star ? 'bg-[#FFD600] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]' : 'bg-white opacity-40'}`}
                                            >
                                                <Heart className={`w-4 h-4 ${userReview.rating >= star ? 'fill-black' : ''}`} />
                                            </button>
                                        ))}
                                    </div>
                                    <textarea 
                                        value={userReview.comment}
                                        onChange={e => setUserReview({...userReview, comment: e.target.value})}
                                        placeholder="What do you think about this unit?"
                                        className="w-full border-[2px] border-black p-3 font-bold text-xs bg-white outline-none mb-4 focus:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all resize-none"
                                        rows={3}
                                    />
                                    <button 
                                        onClick={submitReview}
                                        disabled={isSubmittingReview || !userReview.comment.trim()}
                                        className="bg-[#A3E635] border-[3px] border-black px-6 py-2 font-black uppercase italic text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1.5px] hover:translate-y-[1.5px] hover:shadow-none transition-all flex items-center gap-2 disabled:opacity-30"
                                    >
                                        {isSubmittingReview ? <Loader2 className="w-3 h-3 animate-spin" /> : <MessageCircle className="w-3 h-3" />}
                                        POST REVIEW
                                    </button>
                                </div>
                              ) : (
                                <Link href="/login" className="block p-4 border-[2px] border-black border-dashed text-center font-black uppercase italic text-xs opacity-60 hover:opacity-100 transition-opacity">
                                    Login to leave a review
                                </Link>
                              )}

                              {/* Review List */}
                              <div className="space-y-4">
                                  {reviews.length > 0 ? reviews.map((rev, idx) => (
                                      <div key={idx} className="border-l-[4px] border-black pl-6 py-2">
                                          <div className="flex items-center gap-3 mb-2">
                                              <span className="font-black uppercase italic text-[10px] text-[#FB923C]">@{rev.profiles?.username || 'Member'}</span>
                                              <div className="flex gap-1">
                                                  {[...Array(rev.rating)].map((_, i) => <Heart key={i} className="w-2.5 h-2.5 fill-black" />)}
                                              </div>
                                          </div>
                                          <p className="font-bold text-sm text-zinc-600 leading-relaxed italic">"{rev.comment}"</p>
                                          <span className="block text-[8px] font-bold opacity-30 mt-2">{new Date(rev.created_at).toLocaleDateString()}</span>
                                      </div>
                                  )) : (
                                      <p className="text-center py-10 font-black uppercase italic text-black/20">No reviews yet. Be the first!</p>
                                  )}
                              </div>
                          </div>
                      )}

                      {checkoutStep === 'payment' && (
                          <>
                            <h2 className="text-3xl font-black uppercase italic mb-8 underline text-black">Checkout Options</h2>
                            
                            <div className="space-y-4">
                                {/* Marketplace Links Section */}
                                {selectedItem.marketplace_links && Object.values(selectedItem.marketplace_links).some(v => v) && (
                                    <div className="grid grid-cols-1 gap-3 mb-4">
                                        {selectedItem.marketplace_links.tokopedia && (
                                            <a href={selectedItem.marketplace_links.tokopedia} target="_blank" className="bg-[#42b549] border-[3px] border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group">
                                                <span className="font-black text-white italic">TOKOPEDIA</span>
                                                <ArrowRight className="w-5 h-5 text-white" />
                                            </a>
                                        )}
                                        {selectedItem.marketplace_links.shopee && (
                                            <a href={selectedItem.marketplace_links.shopee} target="_blank" className="bg-[#ee4d2d] border-[3px] border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group">
                                                <span className="font-black text-white italic">SHOPEE</span>
                                                <ArrowRight className="w-5 h-5 text-white" />
                                            </a>
                                        )}
                                        {selectedItem.marketplace_links.tiktok && (
                                            <a href={selectedItem.marketplace_links.tiktok} target="_blank" className="bg-black border-[3px] border-black p-4 flex items-center justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group">
                                                <span className="font-black text-white italic">TIKTOK SHOP</span>
                                                <ArrowRight className="w-5 h-5 text-white" />
                                            </a>
                                        )}
                                    </div>
                                )}

                                <button 
                                    onClick={() => openWhatsApp(selectedItem)}
                                    className="w-full bg-[#25D366] border-[3px] border-black p-5 flex items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all group"
                                >
                                    <MessageCircle className="w-6 h-6 text-white" />
                                    <div className="text-left">
                                        <span className="block font-black uppercase text-base italic text-white leading-none">ORDER VIA WHATSAPP</span>
                                        <span className="text-[8px] font-bold uppercase text-white/70">Directly connect with AditBunta</span>
                                    </div>
                                </button>

                                <div className="w-full bg-white border-[3px] border-black p-5 flex flex-col items-center gap-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                                    <div className="flex items-center gap-4 w-full">
                                        <QrCode className="w-6 h-6 text-black" />
                                        <div className="text-left">
                                            <span className="block font-black uppercase text-base italic text-black leading-none">QRIS / TRANSFER</span>
                                            <span className="text-[8px] font-bold uppercase text-black opacity-40">Scan & Pay securely</span>
                                        </div>
                                    </div>
                                    <div className="w-32 h-32 border-[2px] border-black bg-[#FAF8F5] flex items-center justify-center relative group">
                                        <div className="text-[8px] font-black uppercase italic opacity-20 text-center p-2">QR CODE</div>
                                    </div>
                                </div>
                            </div>

                            <button 
                                onClick={() => setCheckoutStep('details')}
                                className="mt-8 text-black font-black uppercase italic underline text-xs hover:text-[#FB923C] transition-colors"
                            >
                                ← BACK TO DETAILS
                            </button>
                          </>
                      )}

                      {/* Suggestions Section */}
                      {selectedItem && (
                          <div className="mt-12 pt-10 border-t-[3px] border-black border-dashed">
                              <h3 className="text-xl font-black uppercase italic mb-6 text-black">Mungkin kamu juga akan suka</h3>
                              <div className="grid grid-cols-2 gap-4">
                                  {items
                                      .filter(item => item.id !== selectedItem.id && (item.brand === selectedItem.brand || item.scale === selectedItem.scale))
                                      .slice(0, 4)
                                      .map((suggested) => (
                                          <div 
                                              key={suggested.id} 
                                              onClick={() => {setSelectedItem(suggested); setActiveImg(0); setCheckoutStep('details');}}
                                              className="border-[3px] border-black p-2 bg-[#FAF8F5] hover:bg-[#FFD600] transition-colors cursor-pointer group"
                                          >
                                              <div className="aspect-square border-[2px] border-black bg-white mb-2 overflow-hidden">
                                                  <img 
                                                      src={suggested.displayImages[0]} 
                                                      alt={suggested.name}
                                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                  />
                                              </div>
                                              <p className="font-black text-[10px] uppercase italic truncate text-black leading-tight">{suggested.name}</p>
                                              <p className="font-bold text-[9px] text-[#FB923C] italic">{formatIDR(suggested.sell_price)}</p>
                                          </div>
                                      ))
                                  }
                              </div>
                          </div>
                      )}
                      </div>
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
