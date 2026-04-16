import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Search, MapPin, AlertTriangle } from 'lucide-react';
import { PageHeader, StatusBadge, Spinner, EmptyState, Btn, Table, Modal, FormField } from '../../components/common';
import api from '../../api/client';

const MOCK = [
  { id: '1', rtoNo: 'RTO-PTL-20250411-001', awb: 'AWB-PTL-20250401', customer: 'Rajesh Kumar, Mumbai', reason: 'REFUSED', originalVendor: 'Delhivery', returnVendor: 'Delhivery', pickupDate: '2025-04-11', expectedReturn: '2025-04-13', status: 'RTO_INITIATED', weight: 18 },
  { id: '2', rtoNo: 'RTO-PTL-20250410-002', awb: 'AWB-PTL-20250399', customer: 'Priya Sharma, Delhi', reason: 'NOT_AVAILABLE', originalVendor: 'BlueDart', returnVendor: 'BlueDart', pickupDate: '2025-04-10', expectedReturn: '2025-04-12', status: 'PICKED_UP', weight: 33 },
  { id: '3', rtoNo: 'RTO-PTL-20250409-003', awb: 'AWB-PTL-20250395', customer: 'Mohan Industries, Pune', reason: 'DAMAGED', originalVendor: 'Xpressbees', returnVendor: 'Xpressbees', pickupDate: '2025-04-09', expectedReturn: '2025-04-11', status: 'RTO_DELIVERED', weight: 55 },
  { id: '4', rtoNo: 'RTO-PTL-20250408-004', awb: 'AWB-PTL-20250390', customer: 'Anita Desai, Bangalore', reason: 'WRONG_ADDRESS', originalVendor: 'DTDC', returnVendor: 'DTDC', pickupDate: '2025-04-08', expectedReturn: '2025-04-10', status: 'RTO_DELIVERED', weight: 12 },
  { id: '5', rtoNo: 'RTO-PTL-20250407-005', awb: 'AWB-PTL-20250385', customer: 'Suresh Traders, Chennai', reason: 'REFUSED', originalVendor: 'Ecom Express', returnVendor: 'Shadowfax', pickupDate: '2025-04-07', expectedReturn: '2025-04-10', status: 'RTO_INITIATED', weight: 72 },
];

const REASONS = { REFUSED: 'Customer Refused', NOT_AVAILABLE: 'Not Available', DAMAGED: 'Damaged in Transit', WRONG_ADDRESS: 'Wrong Address', OTHERS: 'Others' };
const STATUSES = ['ALL', 'RTO_INITIATED', 'PICKED_UP', 'RTO_DELIVERED'];
const VENDORS = ['Delhivery', 'BlueDart', 'Xpressbees', 'DTDC', 'Ecom Express', 'Shadowfax'];

export default function ReversePage() {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ awb: '', customer: '', reason: 'REFUSED', returnVendor: '', pickupDate: '', expectedReturn: '', weight: '' });

  useEffect(() => {
    api.get('/ptl/reverse').then(r => setReturns(r.data)).catch(() => setReturns(MOCK)).finally(() => setLoading(false));
  }, []);

  const filtered = returns.filter(r => {
    const matchFilter = filter === 'ALL' || r.status === filter;
    const matchSearch = !search || r.rtoNo.includes(search.toUpperCase()) || r.awb.includes(search.toUpperCase()) || r.customer.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const handleCreate = () => {
    const nr = { id: String(Date.now()), rtoNo: 'RTO-PTL-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + String(returns.length+1).padStart(3,'0'), awb: form.awb, customer: form.customer, reason: form.reason, originalVendor: form.returnVendor, returnVendor: form.returnVendor, pickupDate: form.pickupDate, expectedReturn: form.expectedReturn, status: 'RTO_INITIATED', weight: parseFloat(form.weight) };
    setReturns(p => [nr, ...p]);
    setShowModal(false);
    setForm({ awb: '', customer: '', reason: 'REFUSED', returnVendor: '', pickupDate: '', expectedReturn: '', weight: '' });
  };

  const advance = (id) => setReturns(p => p.map(r => {
    if (r.id !== id) return r;
    return { ...r, status: r.status === 'RTO_INITIATED' ? 'PICKED_UP' : 'RTO_DELIVERED' };
  }));

  const columns = [
    { key: 'rtoNo', label: 'RTO #', render: r => <span className="font-mono text-indigo-400 text-xs">{r.rtoNo}</span> },
    { key: 'awb', label: 'AWB #', render: r => <span className="font-mono text-xs text-zinc-400">{r.awb}</span> },
    { key: 'customer', label: 'Customer', render: r => <span className="text-zinc-300 text-xs">{r.customer}</span> },
    { key: 'reason', label: 'Reason', render: r => (
      <div className="flex items-center gap-1.5">
        <AlertTriangle size={11} className="text-amber-400 flex-shrink-0" />
        <span className="text-xs text-amber-400">{REASONS[r.reason] || r.reason}</span>
      </div>
    )},
    { key: 'weight', label: 'Weight', render: r => <span className="font-mono text-zinc-400 text-xs">{r.weight} kg</span> },
    { key: 'returnVendor', label: 'Carrier', render: r => <span className="text-zinc-400 text-xs">{r.returnVendor}</span> },
    { key: 'pickupDate', label: 'Pickup', render: r => <span className="text-xs text-zinc-500">{r.pickupDate}</span> },
    { key: 'expectedReturn', label: 'Expected', render: r => <span className="text-xs text-zinc-500">{r.expectedReturn}</span> },
    { key: 'status', label: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'actions', label: '', render: r => r.status !== 'RTO_DELIVERED' && (
      <Btn size="sm" variant="secondary" onClick={() => advance(r.id)}>
        <RefreshCw size={11} /> {r.status === 'RTO_INITIATED' ? 'Mark Picked Up' : 'Mark Returned'}
      </Btn>
    )},
  ];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Reverse Logistics" subtitle="Manage RTO pickups and customer return shipments"
        actions={<Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Initiate RTO</Btn>}
      />

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">RTO Initiated</p><p className="font-display text-2xl font-bold text-amber-400 mt-1">{returns.filter(r => r.status === 'RTO_INITIATED').length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">In Transit Back</p><p className="font-display text-2xl font-bold text-blue-400 mt-1">{returns.filter(r => r.status === 'PICKED_UP').length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Returned</p><p className="font-display text-2xl font-bold text-green-400 mt-1">{returns.filter(r => r.status === 'RTO_DELIVERED').length}</p></div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search RTO, AWB or customer…" className="input-field pl-8" />
        </div>
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === s ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>
            {s.replace(/_/g, ' ')} {s !== 'ALL' && `(${returns.filter(r => r.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="card">
        <Table columns={columns} rows={filtered}
          emptyState={<EmptyState icon={RefreshCw} title="No returns found" description="Initiate an RTO or adjust your filters" />}
        />
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Initiate RTO / Reverse Pickup">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Original AWB #" required><input className="input-field" value={form.awb} onChange={e => setForm(p => ({ ...p, awb: e.target.value }))} placeholder="AWB-PTL-..." /></FormField>
            <FormField label="Weight (kg)"><input type="number" className="input-field" value={form.weight} onChange={e => setForm(p => ({ ...p, weight: e.target.value }))} placeholder="0.0" /></FormField>
          </div>
          <FormField label="Customer Name & Address" required><input className="input-field" value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))} placeholder="Customer, City" /></FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Return Reason">
              <select className="input-field" value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))}>
                {Object.entries(REASONS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </FormField>
            <FormField label="Return Carrier">
              <select className="input-field" value={form.returnVendor} onChange={e => setForm(p => ({ ...p, returnVendor: e.target.value }))}>
                <option value="">Select</option>
                {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </FormField>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Pickup Date"><input type="date" className="input-field" value={form.pickupDate} onChange={e => setForm(p => ({ ...p, pickupDate: e.target.value }))} /></FormField>
            <FormField label="Expected Return"><input type="date" className="input-field" value={form.expectedReturn} onChange={e => setForm(p => ({ ...p, expectedReturn: e.target.value }))} /></FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.awb || !form.customer}>Initiate RTO</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
