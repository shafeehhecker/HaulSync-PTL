import { useState, useEffect } from 'react';
import { Barcode, Printer, Download, RefreshCw, Search, CheckSquare } from 'lucide-react';
import { PageHeader, StatusBadge, Spinner, EmptyState, Btn } from '../../components/common';
import api from '../../api/client';

const MOCK = [
  { id: '1', awb: 'AWB-PTL-20250411', consignor: 'Zara India, Mumbai', consignee: 'Reliance Retail, Delhi', weight: 45, pieces: 3, vendor: 'Delhivery', labelGenerated: true, labelUrl: '#', status: 'BOOKED' },
  { id: '2', awb: 'AWB-PTL-20250410', consignor: 'Myntra WH, Bangalore', consignee: 'Amazon FC, Pune', weight: 120, pieces: 8, vendor: 'BlueDart', labelGenerated: true, labelUrl: '#', status: 'MANIFESTED' },
  { id: '3', awb: 'AWB-PTL-20250409', consignor: 'H&M Store, Delhi', consignee: 'Flipkart WH, Delhi', weight: 78, pieces: 5, vendor: 'Xpressbees', labelGenerated: false, labelUrl: null, status: 'BOOKED' },
  { id: '4', awb: 'AWB-PTL-20250408', consignor: 'Nike WH, Pune', consignee: 'Snapdeal FC, Mumbai', weight: 210, pieces: 14, vendor: 'Ecom Express', labelGenerated: false, labelUrl: null, status: 'BOOKED' },
  { id: '5', awb: 'AWB-PTL-20250407', consignor: 'Adidas WH, Gurgaon', consignee: 'DTDC Hub, Chennai', weight: 18, pieces: 1, vendor: 'DTDC', labelGenerated: true, labelUrl: '#', status: 'IN_TRANSIT' },
];

// Mini label preview component
function LabelPreview({ booking }) {
  return (
    <div className="bg-white text-black rounded-lg p-4 w-full text-xs font-mono border-2 border-zinc-300" style={{ aspectRatio: '2/1', maxWidth: 320 }}>
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-bold text-sm">HaulSync PTL</p>
          <p className="text-zinc-500 text-[10px]">TOS · Part Truck Load</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-xs">{booking.vendor}</p>
        </div>
      </div>
      <div className="border-t border-b border-zinc-200 py-1.5 my-1.5">
        <p className="font-bold text-sm tracking-widest">{booking.awb}</p>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: 40 }).map((_, i) => (
            <div key={i} className={`w-0.5 bg-black ${Math.random() > 0.4 ? 'h-6' : 'h-4'}`} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-1.5">
        <div>
          <p className="text-[9px] text-zinc-500 uppercase">From</p>
          <p className="text-[10px] font-semibold leading-tight">{booking.consignor}</p>
        </div>
        <div>
          <p className="text-[9px] text-zinc-500 uppercase">To</p>
          <p className="text-[10px] font-semibold leading-tight">{booking.consignee}</p>
        </div>
      </div>
      <div className="flex justify-between mt-1.5 text-[9px] text-zinc-500">
        <span>Wt: {booking.weight}kg</span>
        <span>Pcs: {booking.pieces}</span>
      </div>
    </div>
  );
}

export default function LabelsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState({});
  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    api.get('/ptl/bookings').then(r => setBookings(r.data)).catch(() => setBookings(MOCK)).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const matchSearch = !search || b.awb.includes(search.toUpperCase()) || b.consignee?.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || (filter === 'GENERATED' && b.labelGenerated) || (filter === 'PENDING' && !b.labelGenerated);
    return matchSearch && matchFilter;
  });

  const toggleSelect = (id) => setSelected(p => ({ ...p, [id]: !p[id] }));
  const selectAll = () => {
    const newSel = {};
    filtered.forEach(b => { newSel[b.id] = true; });
    setSelected(newSel);
  };

  const generateLabels = (ids) => {
    setBookings(p => p.map(b => ids.includes(b.id) ? { ...b, labelGenerated: true, labelUrl: '#' } : b));
    setSelected({});
  };

  const selectedIds = Object.keys(selected).filter(k => selected[k]);
  const pendingSelected = selectedIds.filter(id => !bookings.find(b => b.id === id)?.labelGenerated);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Label Generation" subtitle="Auto-generate, print, and download shipment labels"
        actions={
          <>
            {pendingSelected.length > 0 && <Btn size="sm" onClick={() => generateLabels(pendingSelected)}><RefreshCw size={14} /> Generate {pendingSelected.length} Labels</Btn>}
            {selectedIds.length > 0 && <Btn variant="secondary" size="sm"><Printer size={14} /> Print {selectedIds.length}</Btn>}
            <Btn variant="secondary" size="sm"><Download size={14} /> Bulk Download</Btn>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Total AWBs</p><p className="font-display text-2xl font-bold text-zinc-300 mt-1">{bookings.length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Labels Generated</p><p className="font-display text-2xl font-bold text-green-400 mt-1">{bookings.filter(b => b.labelGenerated).length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Pending</p><p className="font-display text-2xl font-bold text-amber-400 mt-1">{bookings.filter(b => !b.labelGenerated).length}</p></div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AWB…" className="input-field pl-8" />
        </div>
        {['ALL','GENERATED','PENDING'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === f ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>{f}</button>
        ))}
        <button onClick={selectAll} className="px-3 py-1.5 rounded-lg text-xs font-medium border text-zinc-400 border-zinc-700 hover:border-zinc-600 flex items-center gap-1.5 transition-all">
          <CheckSquare size={12} /> Select All
        </button>
      </div>

      <div className="card divide-y divide-zinc-800/60">
        {filtered.length === 0 && <EmptyState icon={Barcode} title="No labels found" description="Adjust your filters or create bookings" />}
        {filtered.map(b => (
          <div key={b.id} className="flex items-center gap-4 px-5 py-3.5">
            <input type="checkbox" checked={!!selected[b.id]} onChange={() => toggleSelect(b.id)}
              className="w-4 h-4 rounded border-zinc-600 bg-zinc-800 accent-indigo-500 flex-shrink-0" />
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Barcode size={14} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-sm text-indigo-400">{b.awb}</p>
              <p className="text-xs text-zinc-500">{b.consignee} · {b.vendor}</p>
            </div>
            <div className="text-xs text-zinc-500 hidden sm:block font-mono">{b.weight} kg · {b.pieces} pcs</div>
            <StatusBadge status={b.status} />
            <div className="flex items-center gap-2">
              {b.labelGenerated ? (
                <>
                  <span className="text-[11px] text-green-400 font-medium">✓ Generated</span>
                  <Btn variant="ghost" size="sm" onClick={() => setPreview(b)}><Barcode size={12} /> Preview</Btn>
                  <Btn variant="secondary" size="sm"><Printer size={12} /></Btn>
                </>
              ) : (
                <Btn size="sm" onClick={() => generateLabels([b.id])}><RefreshCw size={12} /> Generate</Btn>
              )}
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm" onClick={() => setPreview(null)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full animate-fade-in">
            <p className="font-display font-semibold text-zinc-100 mb-4">Label Preview</p>
            <LabelPreview booking={preview} />
            <div className="flex gap-2 mt-4 justify-end">
              <Btn variant="secondary" onClick={() => setPreview(null)}>Close</Btn>
              <Btn><Printer size={14} /> Print</Btn>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
