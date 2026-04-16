import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Layers, LayoutDashboard, Package, GitBranch, Barcode,
  CheckSquare, BarChart2, FileText, LogOut, Menu, X, ChevronRight,
  Users, RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/',          label: 'Dashboard',    icon: LayoutDashboard, exact: true },
  { to: '/bookings',  label: 'Bookings',     icon: Package },
  { to: '/manifests', label: 'Manifests',    icon: GitBranch },
  { to: '/labels',    label: 'Labels',       icon: Barcode },
  { to: '/epod',      label: 'ePOD',         icon: CheckSquare },
  { to: '/reverse',   label: 'Reverse',      icon: RefreshCw },
  { to: '/vendors',   label: 'Vendors',      icon: Users },
  { to: '/analytics', label: 'Analytics',    icon: BarChart2 },
  { to: '/mis',       label: 'MIS Reports',  icon: FileText },
];

function NavItem({ to, label, icon: Icon, exact, onClick }) {
  return (
    <NavLink
      to={to}
      end={exact}
      onClick={onClick}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
         ${isActive
           ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/25'
           : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60'}`
      }
    >
      <Icon size={16} className="flex-shrink-0" />
      <span className="flex-1">{label}</span>
      <ChevronRight size={12} className="opacity-0 group-hover:opacity-40 transition-opacity" />
    </NavLink>
  );
}

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };

  const Sidebar = ({ onNav }) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-800/60">
        <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <Layers size={16} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-zinc-100 text-sm leading-none">HaulSync</p>
          <p className="text-[10px] text-indigo-400/80 font-medium tracking-wider mt-0.5">TOS · PTL</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => (
          <NavItem key={item.to} {...item} onClick={onNav} />
        ))}
      </nav>

      <div className="px-3 py-4 border-t border-zinc-800/60">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-800/40">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-400 text-xs font-bold">
              {user?.name?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-zinc-300 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.role || 'OPERATOR'}</p>
          </div>
          <button onClick={handleLogout} title="Sign out"
            className="w-6 h-6 rounded-lg hover:bg-zinc-700 flex items-center justify-center text-zinc-500 hover:text-red-400 transition-colors">
            <LogOut size={12} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-full bg-zinc-950">
      <aside className="hidden lg:flex flex-col w-56 flex-shrink-0 bg-zinc-900 border-r border-zinc-800/60">
        <Sidebar />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-zinc-950/80" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-56 bg-zinc-900 border-r border-zinc-800/60 z-50 animate-slide-in">
            <div className="flex items-center justify-end p-3 border-b border-zinc-800/60">
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <X size={16} />
              </button>
            </div>
            <Sidebar onNav={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-zinc-900 border-b border-zinc-800/60">
          <button onClick={() => setMobileOpen(true)} className="w-8 h-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400">
            <Menu size={18} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-500 rounded-lg flex items-center justify-center">
              <Layers size={12} className="text-white" />
            </div>
            <span className="font-display font-bold text-zinc-100 text-sm">HaulSync PTL</span>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
