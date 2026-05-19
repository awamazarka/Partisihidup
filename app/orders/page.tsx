import { ReceiptText, Package, Truck, CheckCircle2, Clock, Search, ExternalLink } from 'lucide-react';

const ordersData = [
  { id: "ORD-7241", date: "May 18, 2026", customer: "John Doe", total: "Rp 165.000", status: "Shipped", tracking: "JX123456789" },
  { id: "ORD-7238", date: "May 17, 2026", customer: "Jane Smith", total: "Rp 42.500", status: "Pending", tracking: "-" },
  { id: "ORD-7235", date: "May 16, 2026", customer: "Mike Ross", total: "Rp 88.000", status: "Delivered", tracking: "JX987654321" },
  { id: "ORD-7230", date: "May 15, 2026", customer: "Harvey Specter", total: "Rp 240.000", status: "Processing", tracking: "-" },
];

export default function OrdersPage() {
  return (
    <main className="flex-1 pt-40 pb-20 px-6 max-w-7xl mx-auto w-full">
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
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
          <input 
            type="text" 
            placeholder="Find an order..." 
            className="w-full pl-10 pr-4 py-3 bg-white border-[3px] border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold text-sm focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-none transition-all outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        <StatusSummary count={3} label="Pending" icon={<Clock />} color="bg-white" />
        <StatusSummary count={12} label="Processing" icon={<Package />} color="bg-[#FFD600]" />
        <StatusSummary count={5} label="Shipped" icon={<Truck />} color="bg-[#A3E635]" />
        <StatusSummary count={142} label="Delivered" icon={<CheckCircle2 />} color="bg-[#FB923C]" />
      </div>

      <div className="bg-white border-[4px] border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] rounded-3xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-black border-b-[4px] border-black text-[#FFD600] font-black uppercase italic text-sm">
              <tr>
                <th className="px-6 py-5">Order ID</th>
                <th className="px-6 py-5">Date</th>
                <th className="px-6 py-5">Customer</th>
                <th className="px-6 py-5">Total</th>
                <th className="px-6 py-5">Status</th>
                <th className="px-6 py-5">Tracking</th>
                <th className="px-6 py-5">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y-[3px] divide-black bg-[#FAF8F5]">
              {ordersData.map((order) => (
                <tr key={order.id} className="hover:bg-[#FFD600] transition-colors group">
                  <td className="px-6 py-5 font-black uppercase text-sm italic underline">{order.id}</td>
                  <td className="px-6 py-5 font-bold text-xs">{order.date}</td>
                  <td className="px-6 py-5 font-black uppercase text-sm">{order.customer}</td>
                  <td className="px-6 py-5 font-black text-lg">{order.total}</td>
                  <td className="px-6 py-5">
                    <span className={`px-3 py-1 border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-black uppercase italic text-[10px] ${
                      order.status === 'Delivered' ? 'bg-[#A3E635]' :
                      order.status === 'Shipped' ? 'bg-[#FFD600]' :
                      order.status === 'Pending' ? 'bg-white' :
                      'bg-[#FB923C]'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-5 font-black text-xs opacity-50">{order.tracking}</td>
                  <td className="px-6 py-5">
                    <button className="p-2 border-[2px] border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all">
                      <ExternalLink className="w-4 h-4 text-black" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

function StatusSummary({ count, label, icon, color }: { count: number, label: string, icon: any, color: string }) {
  return (
    <div className={`border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 rounded-2xl flex items-center gap-6 ${color}`}>
      <div className="w-14 h-14 border-[3px] border-black bg-white flex items-center justify-center text-3xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        {icon}
      </div>
      <div>
        <p className="text-3xl font-black italic tracking-tighter">{count}</p>
        <p className="font-black uppercase text-[10px] italic tracking-widest underline">{label}</p>
      </div>
    </div>
  );
}
