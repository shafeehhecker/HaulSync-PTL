import { useState, useEffect } from 'react';
import { Users, Star, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { PageHeader, Spinner, EmptyState, Btn, Modal, FormField } from '../../components/common';
import api from '../../api/client';

const MOCK = [
  { id: '1', name: 'Delhivery', type: '3PL', regions: ['North', 'West', 'South'], totalShipments: 842, onTimeRate: 91.2, avgTransitDays: 2.1, podRate: 98.4, rtoRate: 3.8, costPerKg: 11.2, status: 'ACTIVE', scorecard: { q1: 88, q2: 91, q3: 92, q4: 91 } },
  { id: '2', name: 'BlueDart', type: '3PL', regions: ['All India'], totalShipments: 614, onTimeRate: 94.7, avgTransitDays: 1.8, podRate: 99.1, rtoRate: 2.1, costPerKg: 18.5, status: 'ACTIVE', scorecard: { q1: 93, q2: 95, q3: 94, q4: 95 } },
  { id: '3', name: 'Xpressbees', type: '3PL', regions: ['North', 'West'], totalShipments: 432, onTimeRate: 86.3, avgTransitDays: 2.8, podRate: 95.2, rtoRate: 6.4, costPerKg: 9.8, status: 'ACTIVE', scorecard: { q1: 82, q2: 86, q3: 85, q4: 87 } },
  { id: '4', name: 'DTDC', type: '3PL', regions: ['South', 'East'], totalShipments: 310, onTimeRate: 79.8, avgTransitDays: 3.2, podRate: 92.4, rtoRate: 8.9, costPerKg: 8.4, status: 'ACTIVE', scorecard: { q1: 77, q2: 80, q3: 79, q4: 80 } },
  { id: '5', name: 'Ecom Express', type: '3PL', regions: ['North', 'East'], totalShipments: 198, onTimeRate: 83.1, avgTransitDays: 2.6, podRate: 94.1, rtoRate: 5.7, costPerKg: 10.1, status: 'INACTIVE', scorecard: { q1: 84, q2: 83, q3: 82, q4: 83 } },
];

function ScoreBar({ value, max = 100 }) {
  const color = value >= 90 ? 'bg-green-500' : value >= 80 ? 'bg-indigo-500' : value >= 70 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${(value / max) * 100}%` }} />
      </div>
      <span className="text-xs font-mono text-zinc-300 w-8 text-right">{value}%</span>
    </div>
  );
}

function StarScore({ value }) {
  const stars = Math.round(value / 20);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} size={12} className={i < stars ? 'text-indigo-400 fill-indigo-400' : 'text-zinc-700'} />
      ))}
      <span className="text-xs text-zinc-400 ml-1">{value}%</span>
    </div>
  );
}

export default function VendorsPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: '3PL', regions: '' });
  const [sortBy, setSortBy] = useState('onTimeRate');

  useEffect(() => {
    api.get('/ptl/vendors').then(r => setVendors(r.data)).catch(() => setVendors(MOCK)).finally(() => setLoading(false));
  }, []);

  const sorted = [...vendors].sort((a, b) => b[sortBy] - a[sortBy]);
  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const handleCreate = () => {
    const nv = { id: String(Date.now()), name: form.name, type: form.type, regions: form.regions.split(',').map(r => r.trim()), totalShipments: 0, onTimeRate: 0, avgTransitDays: 0, podRate: 0, rtoRate: 0, costPerKg: 0, status: 'ACTIVE', scorecard: { q1: 0, q2: 0, q3: 0, q4: 0 } };
    setVendors(p => [...p, nv]);
    setShowModal(false);
    setForm({ name: '', type: '3PL', regions: '' });
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Vendor Performance" subtitle="Carrier scorecard — on-time, cost, POD & RTO metrics"
        actions={<Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Add Carrier</Btn>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Active Carriers</p><p className="font-display text-2xl font-bold text-indigo-400 mt-1">{vendors.filter(v => v.status === 'ACTIVE').length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Best OTP</p><p className="font-display text-2xl font-bold text-green-400 mt-1">{Math.max(...vendors.map(v => v.onTimeRate))}%</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Avg Cost/Kg</p><p className="font-display text-2xl font-bold text-zinc-300 mt-1">₹{(vendors.reduce((s, v) => s + v.costPerKg, 0) / vendors.length).toFixed(1)}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Total Shipments</p><p className="font-display text-2xl font-bold text-zinc-300 mt-1">{vendors.reduce((s, v) => s + v.totalShipments, 0).toLocaleString()}</p></div>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-xs text-zinc-500">Sort by:</span>
        {[{ key: 'onTimeRate', label: 'On-Time %' }, { key: 'podRate', label: 'POD Rate' }, { key: 'totalShipments', label: 'Volume' }].map(s => (
          <button key={s.key} onClick={() => setSortBy(s.key)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${sortBy === s.key ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>{s.label}</button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map((v, i) => (
          <div key={v.id} className="card overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-zinc-800/20 transition-colors" onClick={() => toggle(v.id)}>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0 text-xs font-bold text-indigo-400">#{i + 1}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-display font-semibold text-zinc-100">{v.name}</p>
                  {v.status === 'INACTIVE' && <span className="badge-zinc text-[10px] px-1.5 py-0.5 rounded">Inactive</span>}
                </div>
                <p className="text-xs text-zinc-500">{v.type} · {v.regions.join(', ')}</p>
              </div>
              <div className="hidden sm:grid grid-cols-4 gap-8 text-center">
                {[
                  { label: 'OTP', val: `${v.onTimeRate}%`, color: v.onTimeRate >= 90 ? 'text-green-400' : v.onTimeRate >= 80 ? 'text-indigo-400' : 'text-amber-400' },
                  { label: 'POD', val: `${v.podRate}%`, color: 'text-zinc-300' },
                  { label: 'RTO', val: `${v.rtoRate}%`, color: v.rtoRate <= 4 ? 'text-green-400' : 'text-red-400' },
                  { label: '₹/kg', val: `₹${v.costPerKg}`, color: 'text-zinc-300' },
                ].map(m => (
                  <div key={m.label}>
                    <p className={`font-mono font-semibold text-sm ${m.color}`}>{m.val}</p>
                    <p className="text-[10px] text-zinc-600 uppercase tracking-wider mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">{v.totalShipments.toLocaleString()} shipments</span>
                {expanded[v.id] ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronRight size={16} className="text-zinc-500" />}
              </div>
            </div>

            {expanded[v.id] && (
              <div className="border-t border-zinc-800 px-5 py-4 space-y-4 bg-zinc-900/30">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Performance Metrics</p>
                    <div className="space-y-2.5">
                      <div><div className="flex justify-between text-xs text-zinc-400 mb-1"><span>On-Time Delivery</span></div><ScoreBar value={v.onTimeRate} /></div>
                      <div><div className="flex justify-between text-xs text-zinc-400 mb-1"><span>ePOD Capture Rate</span></div><ScoreBar value={v.podRate} /></div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Quarterly Trend</p>
                    <div className="space-y-2">
                      {Object.entries(v.scorecard).map(([q, score]) => (
                        <div key={q} className="flex items-center gap-3">
                          <span className="text-xs text-zinc-500 uppercase w-6">{q}</span>
                          <StarScore value={score} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 justify-end pt-2 border-t border-zinc-800/60">
                  <Btn variant="secondary" size="sm">View Full Report</Btn>
                  {v.status === 'ACTIVE'
                    ? <Btn variant="danger" size="sm" onClick={() => setVendors(p => p.map(x => x.id === v.id ? { ...x, status: 'INACTIVE' } : x))}>Deactivate</Btn>
                    : <Btn size="sm" onClick={() => setVendors(p => p.map(x => x.id === v.id ? { ...x, status: 'ACTIVE' } : x))}>Activate</Btn>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Carrier">
        <div className="space-y-4">
          <FormField label="Carrier Name" required><input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Delhivery" /></FormField>
          <FormField label="Regions (comma separated)"><input className="input-field" value={form.regions} onChange={e => setForm(p => ({ ...p, regions: e.target.value }))} placeholder="North, South, West" /></FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.name}>Add Carrier</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
