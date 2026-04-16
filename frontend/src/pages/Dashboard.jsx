import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, GitBranch, CheckSquare, BarChart2,
  TrendingUp, ArrowRight, RefreshCw, Users,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { StatCard, StatusBadge, Spinner } from '../components/common';
import api from '../api/client';

const COLORS = ['#6366F1', '#60A5FA', '#A78BFA', '#4ADE80', '#F87171', '#94A3B8'];

const MOCK = {
  summary: {
    totalBookings: 214, manifestsOpen: 18, pendingPOD: 31,
    deliveredToday: 47, reversePickups: 9, vendorCount: 24,
    onTimeRate: 88, avgCostPerKg: 12.4,
  },
  bookingsByStatus: [
    { status: 'BOOKED', _count: 42 }, { status: 'MANIFESTED', _count: 31 },
    { status: 'IN_TRANSIT', _count: 89 }, { status: 'DELIVERED', _count: 214 },
    { status: 'RTO_INITIATED', _count: 9 },
  ],
  weeklyBookings: [
    { day: 'Mon', bookings: 38 }, { day: 'Tue', bookings: 52 }, { day: 'Wed', bookings: 44 },
    { day: 'Thu', bookings: 61 }, { day: 'Fri', bookings: 55 }, { day: 'Sat', bookings: 29 }, { day: 'Sun', bookings: 14 },
  ],
  recentBookings: [
    { id: '1', awb: 'AWB-PTL-20250411', consignee: 'Reliance Retail, Mumbai', weight: '45 kg', status: 'IN_TRANSIT', vendor: 'Delhivery', eta: '4h' },
    { id: '2', awb: 'AWB-PTL-20250410', consignee: 'Amazon FC, Pune', weight: '120 kg', status: 'DELIVERED', vendor: 'BlueDart', eta: '—' },
    { id: '3', awb: 'AWB-PTL-20250409', consignee: 'Flipkart WH, Delhi', weight: '78 kg', status: 'MANIFESTED', vendor: 'Xpressbees', eta: '8h' },
    { id: '4', awb: 'AWB-PTL-20250408', consignee: 'DTDC Hub, Chennai', weight: '33 kg', status: 'RTO_INITIATED', vendor: 'DTDC', eta: '—' },
  ],
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/ptl/analytics/dashboard')
      .then(r => setData(r.data))
      .catch(() => setData(MOCK))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;

  const { summary, bookingsByStatus, weeklyBookings, recentBookings } = data || MOCK;
  const pieData = (bookingsByStatus || []).map(s => ({ name: s.status.replace(/_/g, ' '), value: s._count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-zinc-100">PTL Operations</h1>
        <p className="text-zinc-400 text-sm mt-1">Part Truck Load transport operating system overview</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Total Bookings"    value={summary.totalBookings}  icon={Package}     color="indigo" delta="This month" />
        <StatCard label="Open Manifests"   value={summary.manifestsOpen}  icon={GitBranch}   color="blue"   delta="Active runs" />
        <StatCard label="POD Pending"      value={summary.pendingPOD}     icon={CheckSquare} color="amber"  delta="Awaiting capture" />
        <StatCard label="Delivered Today"  value={summary.deliveredToday} icon={TrendingUp}  color="green"  delta="Confirmed" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger">
        <StatCard label="Reverse Pickups"  value={summary.reversePickups} icon={RefreshCw}   color="purple" delta="RTO / return" />
        <StatCard label="Active Vendors"   value={summary.vendorCount}    icon={Users}       color="teal"   delta="Carrier network" />
        <StatCard label="On-Time Rate"     value={`${summary.onTimeRate}%`} icon={BarChart2} color="green"  delta="Last 30 days" />
        <StatCard label="Avg Cost/Kg"      value={`₹${summary.avgCostPerKg}`} icon={Package} color="indigo" delta="Blended rate" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-display font-semibold text-zinc-200 mb-4">Weekly Booking Volume</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyBookings} barSize={26}>
              <XAxis dataKey="day" tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#71717A', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#FAFAFA', fontSize: '12px' }} />
              <Bar dataKey="bookings" fill="#6366F1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-5">
          <h3 className="font-display font-semibold text-zinc-200 mb-4">Booking Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#18181B', border: '1px solid #3F3F46', borderRadius: '8px', color: '#FAFAFA', fontSize: '12px' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2">
            {pieData.map((s, i) => (
              <div key={s.name} className="flex items-center gap-1.5 text-xs text-zinc-400">
                <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h3 className="font-display font-semibold text-zinc-200">Recent Bookings</h3>
          <Link to="/bookings" className="text-sm text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        <div className="divide-y divide-zinc-800/60">
          {recentBookings.map((b) => (
            <div key={b.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Package size={14} className="text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-200 font-mono">{b.awb}</p>
                <p className="text-xs text-zinc-500">{b.consignee}</p>
              </div>
              <div className="text-xs text-zinc-500 hidden sm:block">{b.vendor}</div>
              <div className="text-xs text-zinc-500 font-mono">{b.weight}</div>
              {b.eta !== '—' && <div className="text-xs text-indigo-400 font-mono">ETA {b.eta}</div>}
              <StatusBadge status={b.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
