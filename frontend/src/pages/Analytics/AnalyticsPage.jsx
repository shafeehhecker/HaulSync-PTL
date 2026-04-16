import { useState, useEffect } from 'react';
import { BarChart2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, CartesianGrid,
} from 'recharts';
import { PageHeader, Spinner } from '../../components/common';
import api from '../../api/client';

const COLORS = ['#6366F1', '#60A5FA', '#4ADE80', '#F87171', '#FBBF24', '#A78BFA'];

const MOCK = {
  monthlyCost: [
    { month: 'Nov', cost: 184000, bookings: 182 }, { month: 'Dec', cost: 201000, bookings: 198 },
    { month: 'Jan', cost: 178000, bookings: 172 }, { month: 'Feb', cost: 196000, bookings: 191 },
    { month: 'Mar', cost: 222000, bookings: 217 }, { month: 'Apr', cost: 158000, bookings: 154 },
  ],
  vendorShare: [
    { name: 'Delhivery', value: 38 }, { name: 'BlueDart', value: 27 },
    { name: 'Xpressbees', value: 19 }, { name: 'DTDC', value: 10 }, { name: 'Others', value: 6 },
  ],
  otpTrend: [
    { month: 'Nov', delhivery: 88, bluedart: 93, xpressbees: 83 },
    { month: 'Dec', delhivery: 90, bluedart: 94, xpressbees: 85 },
    { month: 'Jan', delhivery: 89, bluedart: 95, xpressbees: 84 },
    { month: 'Feb', delhivery: 91, bluedart: 95, xpressbees: 86 },
    { month: 'Mar', delhivery: 92, bluedart: 96, xpressbees: 87 },
    { month: 'Apr', delhivery: 91, bluedart: 95, xpressbees: 86 },
  ],
  lanePerformance: [
    { lane: 'MUM→DEL', bookings: 312, avgCost: 14.2, otp: 89 },
    { lane: 'DEL→BLR', bookings: 241, avgCost: 16.8, otp: 91 },
    { lane: 'BLR→CHN', bookings: 189, avgCost: 10.4, otp: 88 },
    { lane: 'MUM→PUN', bookings: 178, avgCost: 7.8, otp: 94 },
    { lane: 'DEL→KOL', bookings: 142, avgCost: 13.1, otp: 85 },
  ],
  rtoByReason: [
    { reason: 'Customer Refused', count: 42 }, { reason: 'Not Available', count: 28 },
    { reason: 'Wrong Address', count: 17 }, { reason: 'Damaged', count: 11 }, { reason: 'Others', count: 8 },
  ],
};

const TTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-zinc-400 mb-1">{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>)}
    </div>
  );
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('6M');

  useEffect(() => {
    api.get('/ptl/analytics').then(r => setData(r.data)).catch(() => setData(MOCK)).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  const { monthlyCost, vendorShare, otpTrend, lanePerformance, rtoByReason } = data || MOCK;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-zinc-100">Analytics</h1>
          <p className="text-zinc-400 text-sm mt-1">PTL cost trends, carrier OTP, lane analysis & RTO insights</p>
        </div>
        <div className="flex gap-1.5">
          {['1M', '3M', '6M', '1Y'].map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${period === p ? 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30' : 'text-zinc-400 border-zinc-700 hover:border-zinc-600'}`}>{p}</button>
          ))}
        </div>
      </div>

      {/* KPI summary row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Freight Spend', val: `₹${(monthlyCost.reduce((s, m) => s + m.cost, 0) / 100000).toFixed(1)}L`, color: 'text-zinc-100' },
          { label: 'Total Bookings', val: monthlyCost.reduce((s, m) => s + m.bookings, 0).toLocaleString(), color: 'text-indigo-400' },
          { label: 'Avg OTP', val: `${((MOCK.otpTrend.reduce((s, m) => s + m.delhivery, 0) / MOCK.otpTrend.length)).toFixed(1)}%`, color: 'text-green-400' },
          { label: 'Avg Cost/Booking', val: `₹${Math.round(monthlyCost.reduce((s, m) => s + m.cost, 0) / monthlyCost.reduce((s, m) => s + m.bookings, 0))}`, color: 'text-amber-400' },
        ].map(k => (
          <div key={k.label} className="card p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">{k.label}</p>
            <p className={`font-display text-xl font-bold mt-1 ${k.color}`}>{k.val}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Monthly Cost & Volume */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-zinc-200 mb-4">Monthly Freight Cost vs Bookings</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyCost}>
              <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="cost" orientation="left" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <YAxis yAxisId="bkgs" orientation="right" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<TTip />} />
              <Bar yAxisId="cost" dataKey="cost" fill="#6366F1" radius={[4, 4, 0, 0]} barSize={18} name="Cost (₹)" />
              <Bar yAxisId="bkgs" dataKey="bookings" fill="#60A5FA" radius={[4, 4, 0, 0]} barSize={12} name="Bookings" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Vendor share pie */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-zinc-200 mb-4">Volume by Carrier</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={vendorShare} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                {vendorShare.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#FAFAFA', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
            {vendorShare.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value}%)
              </div>
            ))}
          </div>
        </div>

        {/* OTP trend */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-zinc-200 mb-4">Carrier OTP Trend (%)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={otpTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
              <XAxis dataKey="month" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[75, 100]} tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#FAFAFA', fontSize: '12px' }} />
              <Line type="monotone" dataKey="delhivery" stroke="#6366F1" strokeWidth={2} dot={false} name="Delhivery" />
              <Line type="monotone" dataKey="bluedart" stroke="#4ADE80" strokeWidth={2} dot={false} name="BlueDart" />
              <Line type="monotone" dataKey="xpressbees" stroke="#60A5FA" strokeWidth={2} dot={false} name="Xpressbees" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* RTO reasons */}
        <div className="card p-5">
          <h3 className="font-display font-semibold text-zinc-200 mb-4">RTO Reason Breakdown</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={rtoByReason} layout="vertical" barSize={16}>
              <XAxis type="number" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="reason" tick={{ fill: '#71717A', fontSize: 10 }} axisLine={false} tickLine={false} width={110} />
              <Tooltip contentStyle={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#FAFAFA', fontSize: '12px' }} />
              <Bar dataKey="count" fill="#F87171" radius={[0, 4, 4, 0]} name="Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Lane Performance table */}
      <div className="card">
        <div className="px-5 py-4 border-b border-zinc-800">
          <h3 className="font-display font-semibold text-zinc-200">Top Lane Performance</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Lane', 'Bookings', 'Avg Cost/Kg (₹)', 'OTP %'].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {lanePerformance.map(l => (
                <tr key={l.lane} className="hover:bg-zinc-800/20 transition-colors">
                  <td className="px-5 py-3 font-mono text-sm text-indigo-400">{l.lane}</td>
                  <td className="px-5 py-3 text-zinc-300">{l.bookings.toLocaleString()}</td>
                  <td className="px-5 py-3 font-mono text-zinc-300">₹{l.avgCost}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${l.otp >= 90 ? 'bg-green-500' : l.otp >= 85 ? 'bg-indigo-500' : 'bg-amber-500'}`} style={{ width: `${l.otp}%` }} />
                      </div>
                      <span className={`text-xs font-mono ${l.otp >= 90 ? 'text-green-400' : l.otp >= 85 ? 'text-indigo-400' : 'text-amber-400'}`}>{l.otp}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
