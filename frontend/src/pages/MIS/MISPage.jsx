import { useState, useEffect } from 'react';
import { FileText, Download, Play, Clock, CheckCircle, RefreshCw, Plus } from 'lucide-react';
import { PageHeader, Spinner, EmptyState, Btn, Modal, FormField } from '../../components/common';
import api from '../../api/client';

const MOCK_REPORTS = [
  { id: '1', name: 'Daily PTL Booking Summary', type: 'DAILY', format: 'EXCEL', lastRun: '2025-04-11 06:00', nextRun: '2025-04-12 06:00', status: 'COMPLETED', recipients: 3, size: '84 KB' },
  { id: '2', name: 'Weekly Vendor Scorecard', type: 'WEEKLY', format: 'PDF', lastRun: '2025-04-07 07:00', nextRun: '2025-04-14 07:00', status: 'COMPLETED', recipients: 5, size: '210 KB' },
  { id: '3', name: 'Monthly Cost Analytics', type: 'MONTHLY', format: 'EXCEL', lastRun: '2025-04-01 08:00', nextRun: '2025-05-01 08:00', status: 'COMPLETED', recipients: 4, size: '342 KB' },
  { id: '4', name: 'ePOD Compliance Report', type: 'DAILY', format: 'PDF', lastRun: '2025-04-11 07:30', nextRun: '2025-04-12 07:30', status: 'RUNNING', recipients: 2, size: '—' },
  { id: '5', name: 'RTO & Reverse Logistics MIS', type: 'WEEKLY', format: 'EXCEL', lastRun: '2025-04-07 08:00', nextRun: '2025-04-14 08:00', status: 'COMPLETED', recipients: 3, size: '128 KB' },
  { id: '6', name: 'Lane-wise OTP Summary', type: 'MONTHLY', format: 'PDF', lastRun: '2025-04-01 09:00', nextRun: '2025-05-01 09:00', status: 'FAILED', recipients: 4, size: '—' },
];

const REPORT_TYPES = [
  { key: 'booking_summary', label: 'Booking Summary', desc: 'Total bookings, weight, freight by date/vendor' },
  { key: 'vendor_scorecard', label: 'Vendor Scorecard', desc: 'OTP, RTO, POD rates by carrier' },
  { key: 'cost_analytics', label: 'Cost Analytics', desc: 'Lane-wise freight cost, cost/kg trends' },
  { key: 'epod_compliance', label: 'ePOD Compliance', desc: 'POD capture rates, pending & verified' },
  { key: 'rto_mis', label: 'RTO & Reverse MIS', desc: 'RTO reasons, count, and aging' },
  { key: 'lane_otp', label: 'Lane OTP', desc: 'On-time performance by origin-destination pair' },
];

export default function MISPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'DAILY', format: 'EXCEL', reportType: '', recipients: '' });

  useEffect(() => {
    api.get('/ptl/mis/reports').then(r => setReports(r.data)).catch(() => setReports(MOCK_REPORTS)).finally(() => setLoading(false));
  }, []);

  const runNow = (id) => {
    setReports(p => p.map(r => r.id === id ? { ...r, status: 'RUNNING' } : r));
    setTimeout(() => setReports(p => p.map(r => r.id === id ? { ...r, status: 'COMPLETED', lastRun: new Date().toISOString().slice(0, 16).replace('T', ' '), size: `${Math.round(Math.random() * 300 + 80)} KB` } : r)), 2000);
  };

  const handleCreate = () => {
    const nr = { id: String(Date.now()), name: form.name, type: form.type, format: form.format, lastRun: '—', nextRun: 'Scheduled', status: 'PENDING', recipients: parseInt(form.recipients) || 1, size: '—' };
    setReports(p => [...p, nr]);
    setShowModal(false);
    setForm({ name: '', type: 'DAILY', format: 'EXCEL', reportType: '', recipients: '' });
  };

  const statusIcon = (s) => {
    if (s === 'COMPLETED') return <CheckCircle size={14} className="text-green-400" />;
    if (s === 'RUNNING')   return <RefreshCw size={14} className="text-indigo-400 animate-spin" />;
    if (s === 'FAILED')    return <span className="w-3.5 h-3.5 rounded-full bg-red-500/20 text-red-400 text-[10px] flex items-center justify-center font-bold">!</span>;
    return <Clock size={14} className="text-zinc-500" />;
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader title="MIS Reports" subtitle="Automated scheduled report generation — booking, vendor, cost & compliance"
        actions={<Btn size="sm" onClick={() => setShowModal(true)}><Plus size={14} /> Schedule Report</Btn>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Scheduled Reports</p><p className="font-display text-2xl font-bold text-indigo-400 mt-1">{reports.length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Completed Today</p><p className="font-display text-2xl font-bold text-green-400 mt-1">{reports.filter(r => r.status === 'COMPLETED').length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Running Now</p><p className="font-display text-2xl font-bold text-blue-400 mt-1">{reports.filter(r => r.status === 'RUNNING').length}</p></div>
        <div className="card p-4"><p className="text-xs text-zinc-500 uppercase tracking-wider">Failed</p><p className="font-display text-2xl font-bold text-red-400 mt-1">{reports.filter(r => r.status === 'FAILED').length}</p></div>
      </div>

      {/* Available report templates */}
      <div className="card p-5">
        <p className="font-display font-semibold text-zinc-200 mb-3">Available Report Templates</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {REPORT_TYPES.map(rt => (
            <div key={rt.key} className="flex items-start gap-3 p-3 rounded-xl bg-zinc-800/40 border border-zinc-700/50 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer group"
              onClick={() => { setForm(p => ({ ...p, name: rt.label, reportType: rt.key })); setShowModal(true); }}>
              <div className="w-7 h-7 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-indigo-500/20 transition-colors">
                <FileText size={13} className="text-indigo-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-200">{rt.label}</p>
                <p className="text-xs text-zinc-500 mt-0.5">{rt.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scheduled reports list */}
      <div className="card">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h3 className="font-display font-semibold text-zinc-200">Scheduled Reports</h3>
        </div>
        {reports.length === 0 && <EmptyState icon={FileText} title="No reports scheduled" description="Schedule a report to start automating MIS" />}
        <div className="divide-y divide-zinc-800/60">
          {reports.map(r => (
            <div key={r.id} className="flex items-center gap-4 px-5 py-4">
              <div className="flex-shrink-0">{statusIcon(r.status)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200">{r.name}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${r.type === 'DAILY' ? 'badge-indigo' : r.type === 'WEEKLY' ? 'badge-blue' : 'badge-purple'}`}>{r.type}</span>
                  <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded font-mono">{r.format}</span>
                  <span className="text-xs text-zinc-500">{r.recipients} recipient{r.recipients !== 1 ? 's' : ''}</span>
                </div>
              </div>
              <div className="hidden sm:block text-xs text-zinc-500 text-right min-w-32">
                <p>Last: <span className="text-zinc-400">{r.lastRun}</span></p>
                <p>Next: <span className="text-zinc-400">{r.nextRun}</span></p>
              </div>
              {r.size !== '—' && <div className="text-xs font-mono text-zinc-500 w-16 text-right hidden sm:block">{r.size}</div>}
              <div className="flex items-center gap-2 flex-shrink-0">
                {r.status === 'COMPLETED' && <Btn variant="secondary" size="sm"><Download size={12} /></Btn>}
                {r.status !== 'RUNNING' && (
                  <Btn size="sm" variant={r.status === 'FAILED' ? 'primary' : 'secondary'} onClick={() => runNow(r.id)}>
                    {r.status === 'FAILED' ? <><RefreshCw size={12} /> Retry</> : <><Play size={12} /> Run Now</>}
                  </Btn>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Schedule MIS Report">
        <div className="space-y-4">
          <FormField label="Report Name" required>
            <input className="input-field" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Weekly Vendor Scorecard" />
          </FormField>
          <div className="grid grid-cols-2 gap-3">
            <FormField label="Frequency">
              <select className="input-field" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </FormField>
            <FormField label="Format">
              <select className="input-field" value={form.format} onChange={e => setForm(p => ({ ...p, format: e.target.value }))}>
                <option value="EXCEL">Excel (.xlsx)</option>
                <option value="PDF">PDF</option>
                <option value="CSV">CSV</option>
              </select>
            </FormField>
          </div>
          <FormField label="Email Recipients" hint="Number of email recipients to send to">
            <input type="number" className="input-field" value={form.recipients} onChange={e => setForm(p => ({ ...p, recipients: e.target.value }))} placeholder="3" />
          </FormField>
          <div className="flex justify-end gap-2 pt-2">
            <Btn variant="secondary" onClick={() => setShowModal(false)}>Cancel</Btn>
            <Btn onClick={handleCreate} disabled={!form.name}>Schedule Report</Btn>
          </div>
        </div>
      </Modal>
    </div>
  );
}
