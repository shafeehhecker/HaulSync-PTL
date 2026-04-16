import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Layers, ArrowRight, AlertCircle, Package, Barcode, FileBarChart, Truck } from 'lucide-react';

const FEATURES = [
  { icon: Package,      label: 'Booking & Manifestation' },
  { icon: Barcode,      label: 'Auto Label Generation' },
  { icon: Truck,        label: 'Forward & Reverse Logistics' },
  { icon: FileBarChart, label: 'ePOD & MIS Reports' },
];

export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const { login, loading }      = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      if (!err.response) {
        setError('Cannot reach the server. Make sure the backend is running on port 5002.');
      } else if (err.response.status === 401) {
        setError('Invalid email or password. Check the demo credentials below.');
      } else if (err.response.status === 500) {
        setError('Server error. Check that DATABASE_URL and JWT_SECRET are set in your .env file.');
      } else {
        setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      <div className="flex-1 hidden lg:flex flex-col justify-between p-12 bg-zinc-900 border-r border-zinc-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'linear-gradient(#6366F1 1px, transparent 1px), linear-gradient(90deg, #6366F1 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center">
              <Layers size={20} className="text-zinc-950" />
            </div>
            <div>
              <span className="font-display text-xl font-bold text-zinc-100 block leading-none">HaulSync</span>
              <span className="text-[11px] text-indigo-400/70 font-medium tracking-widest uppercase">TOS · PTL</span>
            </div>
          </div>
        </div>
        <div className="relative space-y-8">
          <div>
            <h2 className="font-display text-5xl font-bold text-zinc-100 leading-tight">
              Part Truck Load.<br />
              <span className="text-indigo-400">Fully connected.</span>
            </h2>
            <p className="text-zinc-400 text-lg mt-4 max-w-sm leading-relaxed">
              End-to-end PTL transport operating system. Multi-stop manifests, ePOD, and automated MIS — all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 max-w-sm">
            {FEATURES.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5 text-sm text-zinc-400">
                <div className="w-6 h-6 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                  <Icon size={12} className="text-indigo-400" />
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
        <p className="relative text-zinc-600 text-sm">Open source · Self-hostable · MIT License</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Layers size={16} className="text-zinc-950" />
            </div>
            <div>
              <span className="font-display text-lg font-bold text-zinc-100 block leading-none">HaulSync</span>
              <span className="text-[10px] text-indigo-400/70 font-medium tracking-widest">TOS · PTL</span>
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold text-zinc-100 mb-1">Sign in</h1>
          <p className="text-zinc-400 text-sm mb-8">Access your PTL operations dashboard</p>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm mb-6">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="input-field" placeholder="you@company.com" required autoFocus />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                className="input-field" placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading}
              className="ptl-btn-primary w-full flex items-center justify-center gap-2 py-2.5 px-4 font-semibold rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed mt-2">
              {loading
                ? <div className="w-4 h-4 border-2 border-zinc-950/30 border-t-zinc-950 rounded-full animate-spin" />
                : <><span>Sign in</span><ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="mt-8 p-4 rounded-lg bg-zinc-900 border border-zinc-800">
            <p className="text-xs font-medium text-zinc-400 mb-2">Demo credentials</p>
            <div className="space-y-1.5 text-xs font-mono">
              {[
                ['admin@haulsync.local',       'Admin@1234',    'SUPER_ADMIN'],
                ['manager@haulsync.local',     'Mgr@1234',      'MANAGER'],
                ['finance@haulsync.local',     'Finance@1234',  'FINANCE'],
                ['transporter@haulsync.local', 'Trans@1234',    'TRANSPORTER'],
              ].map(([em, pass, role]) => (
                <div key={em} className="flex items-center justify-between gap-2">
                  <span className="text-zinc-400 truncate">{em}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-zinc-600">{pass}</span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded">{role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
