import { useState, useEffect } from 'react';
import { GitBranch, Plus, Printer, ChevronDown, ChevronRight, Package } from 'lucide-react';
import { PageHeader, StatusBadge, Spinner, EmptyState, Btn, Modal, FormField } from '../../components/common';
import api from '../../api/client';

const MOCK = [
  {
    id: '1', manifestNo: 'MNF-PTL-20250411-001', date: '2025-04-11', route: 'Mumbai → Pune → Nashik',
    vendor: 'Delhivery', vehicle: 'MH-12-AB-9876', driver: 'Ramesh Patil',
    totalAwbs: 14, totalWeight: 842, status: 'IN_TRANSIT',
    awbs: [
      { awb: 'AWB-PTL-20250411', consignee: 'Reliance Retail, Pune', weight: 45, status: 'IN_TRANSIT' },
      { awb: 'AWB-PTL-20250405', consignee: 'Big Bazaar, Nashik', weight: 120, status: 'DELIVERED' },
      { awb: 'AWB-PTL-20250402', consignee: 'DMart, Pune', weight: 78, status: 'OUT_FOR_DEL' },
    ],
  },
  {
    id: '2', manifestNo: 'MNF-PTL-20250410-002', date: '2025-04-10', route: 'Delhi → Gurgaon → Faridabad',
    vendor: 'Xpressbees', vehicle: 'DL-01-CD-3421', driver: 'Suresh Kumar',
    totalAwbs: 22, totalWeight: 1340, status: 'DELIVERED',
    awbs: [
      { awb: 'AWB-PTL-20250403', consignee: 'Amazon FC, Gurgaon', weight: 210, status: 'DELIVERED' },
      { awb: 'AWB-PTL-20250401', consignee: 'Flipkart WH, Faridabad', weight: 180, status: 'DELIVERED' },
    ],
  },
  {
    id: '3', manifestNo: 'MNF-PTL-20250411-003', date: '2025-04-11', route: 'Bangalore → Mysore → Mangalore',
    vendor: 'BlueDart', vehicle: 'KA-05-EF-7712', driver: 'Anand Gowda',
    totalAwbs: 9, totalWeight: 490, status: 'MANIFESTED',
    awbs: [
      { awb: 'AWB-PTL-20250409', consignee: 'Shoppers Stop, Mysore', weight: 67, status: 'MANIFESTED' },
      { awb: 'AWB-PTL-20250408', consignee: 'Lifestyle, Mangalore', weight: 90, status: 'MANIFESTED' },
    ],
  },
];

const STATUSES = ['ALL', 'MANIFESTED', 'IN_TRANSIT', 'DELIVERED'];
const VENDORS = ['Delhivery', 'BlueDart', 'Xpressbees', 'DTDC', 'Ecom Express'];

export default function ManifestsPage() {
  const [manifests, setManifests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ route: '', vendor: '', vehicle: '', driver: '' });

  useEffect(() => {
    api.get('/ptl/manifests').then(r => setManifests(r.data)).catch(() => setManifests(MOCK)).finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'ALL' ? manifests : manifests.filter(m => m.status === filter);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const handleCreate = () => {
    const nm = { id: String(Date.now()), manifestNo: 'MNF-PTL-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + String(manifests.length+1).padStart(3,'0'), date: new Date().toISOString().slice(0,10), route: form.route, vendor: form.vendor, vehicle: form.vehicle, driver: form.driver, totalAwbs: 0, totalWeight: 0, status: 'MANIFESTED', awbs: [] };
    setManifests(p => [nm, ...p]);
    setShowModal(false);
    setForm({ route: '', vendor: '', vehicle: '', driver: '' });
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="Manifests" subtitle="Run sheets — multi-stop PTL dispatch management"
        actions={<><Btn variant="secondary" size="sm"><Printer size={14} /> Print Selected</Btn><Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Create Manifest</Btn></>}
      />

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Manifests', val: manifests.length, color: 'text-zinc-300' },
          { label: 'Active Runs', val: manifests.filter(m => m.status === 'IN_TRANSIT').length, color: 'text-blue-400' },
          { label: 'Total AWBs', val: manifests.reduce((s, m) => s + m.totalAwbs, 0), color: 'text-indigo-400' },
        ].map(s => (
          <div key={s.label} className="card p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{s.label}</p>
            <p className={`font-display text-2xl font-bold mt-1 ${s.color}`}>{s.val}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${filter === s ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>
            {s} {s !== 'ALL' && `(${manifests.filter(m => m.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 && <EmptyState icon={GitBranch} title="No manifests found" description="Create a manifest to begin a dispatch run" />}
        {filtered.map((m) => (
          <div key={m.id} className="card overflow-hidden">
            <div className="flex items-center gap-4 px-5 py-4 cursor-pointer hover:bg-zinc-800/20 transition-colors" onClick={() => toggle(m.id)}>
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <GitBranch size={14} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <p className="font-mono text-sm font-medium text-indigo-400">{m.manifestNo}</p>
                  <StatusBadge status={m.status} />
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{m.route}</p>
              </div>
              <div className="hidden sm:flex items-center gap-6 text-xs text-zinc-500">
                <div><span className="text-zinc-300 font-medium">{m.totalAwbs}</span> AWBs</div>
                <div><span className="text-zinc-300 font-medium">{m.totalWeight}</span> kg</div>
                <div>{m.vendor}</div>
                <div className="font-mono">{m.vehicle}</div>
              </div>
              <div className="flex items-center gap-2">
                <Btn variant="secondary" size="sm" onClick={e => { e.stopPropagation(); }}><Printer size={12} /></Btn>
                {expanded[m.id] ? <ChevronDown size={16} className="text-zinc-500" /> : <ChevronRight size={16} className="text-zinc-500" />}
              </div>
            </div>

            {expanded[m.id] && (
              <div className="border-t border-zinc-800">
                <div className="px-5 py-3 bg-zinc-900/40 flex items-center gap-6 text-xs text-zinc-500">
                  <span>Driver: <span className="text-zinc-300">{m.driver}</span></span>
                  <span>Date: <span className="text-zinc-300">{m.date}</span></span>
                </div>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-5 py-2.5 text-xs text-zinc-500 font-medium uppercase tracking-wider">AWB #</th>
                      <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium uppercase tracking-wider">Consignee</th>
                      <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium uppercase tracking-wider">Weight</th>
                      <th className="text-left px-4 py-2.5 text-xs text-zinc-500 font-medium uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/40">
                    {m.awbs.map(a => (
                      <tr key={a.awb} className="hover:bg-zinc-800/20 transition-colors">
                        <td className="px-5 py-2.5 font-mono text-xs text-indigo-400">{a.awb}</td>
                        <td className="px-4 py-2.5 text-xs text-zinc-300">{a.consignee}</td>
                        <td className="px-4 py-2.5 text-xs font-mono text-zinc-400">{a.weight} kg</td>
                        <td className="px-4 py-2.5"><StatusBadge status={a.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-5 py-3 border-t border-zinc-800 flex justify-end gap-2">
                  <Btn variant="secondary" size="sm"><Package size={12} /> Add AWBs</Btn>
                  {m.status === 'MANIFESTED' && <Btn size="sm" onClick={() => setManifests(p => p.map(x => x.id === m.id ? { ...x, status: 'IN_TRANSIT' } : x))}>Dispatch Run</Btn>}
                  {m.status === 'IN_TRANSIT' && <Btn variant="secondary" size="sm" onClick={() => setManifests(p => p.map(x => x.id === m.id ? { ...x, status: 'DELIVERED' } : x))}>Mark Delivered</Btn>}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Create Manifest">
        <div className="space-y-4">
          <FormField label="Route" required><input className="input-field" value={form.route} onChange={e => setForm(p => ({ ...p, route: e.target.value }))} placeholder="e.g. Mumbai → Pune → Nashik" /></FormField>
          <FormField label="Carrier" required>
            <select className="input-field" value={form.vendor} onChange={e => setForm(p => ({ ...p, vendor: e.target.value }))}>
              <option value="">Select carrier</option>
              {VENDORS.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Vehicle No."><input className="input-field" value={form.vehicle} onChange={e => setForm(p => ({ ...p, vehicle: e.target.value }))} placeholder="MH-12-AB-1234" /></FormField>
            <FormField label="Driver Name"><input className="input-field" value={form.driver} onChange={e => setForm(p => ({ ...p, driver: e.target.value }))} placeholder="Driver name" /></FormField>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.route || !form.vendor}>Create Manifest</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
