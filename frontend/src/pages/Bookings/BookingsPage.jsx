import { useState, useEffect } from 'react';
import { Package, Plus, Upload, Search } from 'lucide-react';
import { PageHeader, StatusBadge, Spinner, EmptyState, Btn, Table, Modal, FormField } from '../../components/common';
import api from '../../api/client';

const MOCK = [
  { id: '1', awb: 'AWB-PTL-20250411', bookingDate: '2025-04-11', consignor: 'Zara India, Mumbai', consignee: 'Reliance Retail, Delhi', weight: 45, pieces: 3, type: 'FORWARD', vendor: 'Delhivery', status: 'IN_TRANSIT', freight: 558 },
  { id: '2', awb: 'AWB-PTL-20250410', bookingDate: '2025-04-10', consignor: 'Myntra WH, Bangalore', consignee: 'Amazon FC, Pune', weight: 120, pieces: 8, type: 'FORWARD', vendor: 'BlueDart', status: 'DELIVERED', freight: 1488 },
  { id: '3', awb: 'AWB-PTL-20250409', bookingDate: '2025-04-09', consignor: 'H&M Store, Delhi', consignee: 'Flipkart WH, Delhi', weight: 78, pieces: 5, type: 'FORWARD', vendor: 'Xpressbees', status: 'MANIFESTED', freight: 967 },
  { id: '4', awb: 'AWB-PTL-20250408', bookingDate: '2025-04-08', consignor: 'Customer Return, Chennai', consignee: 'DTDC Hub, Chennai', weight: 33, pieces: 2, type: 'REVERSE', vendor: 'DTDC', status: 'RTO_INITIATED', freight: 409 },
  { id: '5', awb: 'AWB-PTL-20250407', bookingDate: '2025-04-07', consignor: 'Nike WH, Pune', consignee: 'Snapdeal FC, Mumbai', weight: 210, pieces: 14, type: 'FORWARD', vendor: 'Ecom Express', status: 'DELIVERED', freight: 2604 },
  { id: '6', awb: 'AWB-PTL-20250406', bookingDate: '2025-04-06', consignor: 'Customer Return, Delhi', consignee: 'Adidas WH, Gurgaon', weight: 18, pieces: 1, type: 'REVERSE', vendor: 'Shadowfax', status: 'PICKED_UP', freight: 223 },
];

const VENDORS = ['Delhivery', 'BlueDart', 'Xpressbees', 'DTDC', 'Ecom Express', 'Shadowfax', 'Shiprocket'];
const STATUSES = ['ALL', 'BOOKED', 'MANIFESTED', 'IN_TRANSIT', 'DELIVERED', 'RTO_INITIATED'];

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ consignor: '', consignee: '', weight: '', pieces: '', type: 'FORWARD', vendor: '' });

  useEffect(() => {
    api.get('/ptl/bookings').then(r => setBookings(r.data)).catch(() => setBookings(MOCK)).finally(() => setLoading(false));
  }, []);

  const filtered = bookings.filter(b => {
    const matchStatus = filter === 'ALL' || b.status === filter;
    const matchType = typeFilter === 'ALL' || b.type === typeFilter;
    const matchSearch = !search || b.awb.includes(search.toUpperCase()) || b.consignee.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchType && matchSearch;
  });

  const handleCreate = () => {
    const nb = { id: String(Date.now()), awb: 'AWB-PTL-' + Date.now().toString().slice(-8), bookingDate: new Date().toISOString().slice(0, 10), consignor: form.consignor, consignee: form.consignee, weight: parseFloat(form.weight), pieces: parseInt(form.pieces), type: form.type, vendor: form.vendor, status: 'BOOKED', freight: Math.round(parseFloat(form.weight) * 12.4) };
    setBookings(p => [nb, ...p]);
    setShowModal(false);
    setForm({ consignor: '', consignee: '', weight: '', pieces: '', type: 'FORWARD', vendor: '' });
  };

  const columns = [
    { key: 'awb', label: 'AWB #', render: r => <span className="font-mono text-indigo-400 text-xs">{r.awb}</span> },
    { key: 'bookingDate', label: 'Date', render: r => <span className="text-xs text-zinc-500">{r.bookingDate}</span> },
    { key: 'consignor', label: 'Consignor', render: r => <span className="text-zinc-300 text-xs">{r.consignor}</span> },
    { key: 'consignee', label: 'Consignee', render: r => <span className="text-zinc-300 text-xs">{r.consignee}</span> },
    { key: 'weight', label: 'Weight', render: r => <span className="font-mono text-zinc-400">{r.weight} kg</span> },
    { key: 'pieces', label: 'Pcs', render: r => <span className="font-mono text-zinc-400">{r.pieces}</span> },
    { key: 'type', label: 'Type', render: r => <span className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${r.type === 'REVERSE' ? 'badge-amber' : 'badge-indigo'}`}>{r.type}</span> },
    { key: 'vendor', label: 'Carrier', render: r => <span className="text-zinc-400 text-xs">{r.vendor}</span> },
    { key: 'freight', label: 'Freight', render: r => <span className="font-mono text-zinc-300">₹{r.freight.toLocaleString()}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Bookings" subtitle="Manage PTL shipment bookings — forward & reverse"
        actions={<><Btn variant="secondary" size="sm"><Upload size={14} /> Bulk Upload</Btn><Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> New Booking</Btn></>}
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', count: bookings.length, color: 'text-zinc-300' },
          { label: 'In Transit', count: bookings.filter(b => b.status === 'IN_TRANSIT').length, color: 'text-blue-400' },
          { label: 'Delivered', count: bookings.filter(b => b.status === 'DELIVERED').length, color: 'text-green-400' },
          { label: 'Reverse', count: bookings.filter(b => b.type === 'REVERSE').length, color: 'text-amber-400' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className={`font-display text-2xl font-bold mt-1 ${s.color}`}>{s.count}</p>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search AWB or consignee…" className="input-field pl-8" />
        </div>
        <div className="flex gap-1.5">
          {['ALL', 'FORWARD', 'REVERSE'].map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${typeFilter === t ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>{t}</button>
          ))}
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {STATUSES.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === s ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>
              {s} {s !== 'ALL' && `(${bookings.filter(b => b.status === s).length})`}
            </button>
          ))}
        </div>
      </div>
      <div className="card">
        <Table columns={columns} rows={filtered} emptyState={<EmptyState icon={Package} title="No bookings found" description="Create a booking or adjust filters" />} />
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New PTL Booking">
        <div className="space-y-4">
          <FormField label="Consignor" required><input className="input-field" value={form.consignor} onChange={e => setForm(p => ({ ...p, consignor: e.target.value }))} placeholder="Shipper name & city" /></FormField>
          <FormField label="Consignee" required><input className="input-field" value={form.consignee} onChange={e => setForm(p => ({ ...p, consignee: e.target.value }))} placeholder="Recipient name & city" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Weight (kg)" required><input type="number" className="input-field" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="0.0" /></FormField>
            <FormField label="Pieces" required><input type="number" className="input-field" value={form.pieces} onChange={e => setForm(p => ({ ...p, pieces: e.target.value }))} placeholder="1" /></FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Type"><select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}><option value="FORWARD">Forward</option><option value="REVERSE">Reverse</option></select></FormField>
            <FormField label="Carrier"><select className="input-field" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}><option value="">Select carrier</option>{VENDORS.map(v => <option key={v} value={v}>{v}</option>)}</select></FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.consignor || !form.consignee || !form.weight}>Create Booking</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
