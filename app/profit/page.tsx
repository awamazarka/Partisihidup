'use client';

import { useState } from 'react';
import { Calculator, DollarSign, Percent, TrendingUp, Info } from 'lucide-react';

export default function ProfitCalculatorPage() {
  const [buyPrice, setBuyPrice] = useState<number>(0);
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [shippingCost, setShippingCost] = useState<number>(0);
  const [platformFee, setPlatformFee] = useState<number>(10); // Percentage

  const totalCost = buyPrice + shippingCost;
  const fees = sellPrice * (platformFee / 100);
  const netProfit = sellPrice - totalCost - fees;
  const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;
  const margin = sellPrice > 0 ? (netProfit / sellPrice) * 100 : 0;

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-5xl mx-auto w-full">
      <div className="mb-12">
        <h1 className="text-5xl font-black uppercase italic tracking-tighter flex items-center gap-4">
          <div className="p-3 bg-[#FFD600] border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Calculator className="w-10 h-10" />
          </div>
          Profit Calculator
        </h1>
        <p className="text-black font-bold mt-2">Calculate your margins and ROI with high-contrast precision.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Input Section */}
        <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8 space-y-8">
          <h2 className="text-2xl font-black uppercase italic underline">Transaction Details</h2>
          
          <div className="space-y-6">
            <InputField 
              label="Purchase Price (IDR)" 
              value={buyPrice} 
              onChange={setBuyPrice} 
              icon={<DollarSign className="w-5 h-5" />} 
            />
            <InputField 
              label="Selling Price (IDR)" 
              value={sellPrice} 
              onChange={setSellPrice} 
              icon={<DollarSign className="w-5 h-5" />} 
            />
            <InputField 
              label="Shipping / Other Costs" 
              value={shippingCost} 
              onChange={setShippingCost} 
              icon={<TrendingUp className="w-5 h-5" />} 
            />
            <InputField 
              label="Platform Fee (%)" 
              value={platformFee} 
              onChange={setPlatformFee} 
              icon={<Percent className="w-5 h-5" />} 
            />
          </div>

          <div className="pt-6 border-t-[3px] border-black border-dashed">
            <div className="flex items-start gap-3 bg-[#FFD600] p-4 border-[2px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Info className="w-5 h-5 shrink-0 mt-0.5" />
              <span className="text-xs font-bold uppercase leading-tight">Platform fees vary by marketplace (e.g., eBay: 13.25%, Tokopedia: 2-6%).</span>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#A3E635] border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl p-8">
            <h2 className="text-2xl font-black uppercase italic mb-8 underline">Profit Breakdown</h2>
            
            <div className="space-y-8">
              <div className="flex justify-between items-end border-b-[3px] border-black border-dashed pb-6">
                <span className="font-black uppercase italic">Net Profit</span>
                <span className={`text-4xl font-black italic ${netProfit >= 0 ? 'text-black' : 'text-rose-600 underline'}`}>
                  {formatIDR(netProfit)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black uppercase italic text-xs block mb-2 underline tracking-widest">ROI</span>
                  <span className={`text-3xl font-black italic ${roi >= 0 ? 'text-black' : 'text-rose-600'}`}>
                    {roi.toFixed(1)}%
                  </span>
                </div>
                <div className="p-6 bg-white border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <span className="font-black uppercase italic text-xs block mb-2 underline tracking-widest">Margin</span>
                  <span className={`text-3xl font-black italic ${margin >= 0 ? 'text-black' : 'text-rose-600'}`}>
                    {margin.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="pt-6 space-y-4">
                <div className="flex justify-between font-black uppercase italic text-sm">
                  <span>Total Costs</span>
                  <span className="bg-white px-2 border-[2px] border-black">{formatIDR(totalCost)}</span>
                </div>
                <div className="flex justify-between font-black uppercase italic text-sm">
                  <span>Marketplace Fees</span>
                  <span className="bg-white px-2 border-[2px] border-black text-rose-600">-{formatIDR(fees)}</span>
                </div>
              </div>
            </div>
          </div>

          <button className="neo-brutal-btn-yellow text-2xl py-6">
            SAVE TO HISTORY
          </button>
        </div>
      </div>
    </main>
  );
}

function InputField({ label, value, onChange, icon }: { label: string, value: number, onChange: (v: number) => void, icon: any }) {
  return (
    <div className="space-y-2">
      <label className="text-xs font-black uppercase italic underline">{label}</label>
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-black">
          {icon}
        </div>
        <input 
          type="number" 
          value={value === 0 ? '' : value}
          onChange={(e) => onChange(Number(e.target.value))}
          placeholder="0.00"
          className="w-full pl-12 pr-4 py-4 bg-[#FAF8F5] border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none font-black text-xl italic"
        />
      </div>
    </div>
  );
}
