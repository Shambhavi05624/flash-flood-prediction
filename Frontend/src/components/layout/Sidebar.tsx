import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ShieldAlert,
  Map,
  History,
  Bell,
  ListTree,
  Cpu,
  Database,
  Settings,
  Info,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Risk Prediction', path: '/predict', icon: ShieldAlert },
  { name: 'Live GIS Map', path: '/map', icon: Map },
  { name: 'Historical Analysis', path: '/historical', icon: History },
  { name: 'Alerts & Warnings', path: '/alerts', icon: Bell },
  { name: 'Prediction History', path: '/history', icon: ListTree },
  { name: 'Model Information', path: '/model-info', icon: Cpu },
  { name: 'Data Sources', path: '/data-sources', icon: Database },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Sidebar Top: Project Brand / Problem Statement */}
          <div className="p-4 border-b border-slate-800/80">
            <div className="text-[11px] font-mono tracking-wider text-cyan-400 font-semibold uppercase">
              SIH Project PS 26192
            </div>
            <div className="text-xs font-semibold text-slate-200 mt-1">
              Flash Flood Early Warning System
            </div>
            <div className="text-[11px] text-slate-400">
              Multi-Source Remote Sensing & ML
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 text-xs font-medium rounded transition-colors ${
                      isActive
                        ? 'bg-cyan-950/70 text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                        : 'text-slate-300 hover:text-slate-100 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Institutional Credential Footer */}
          <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 bg-slate-950/40">
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-500 mb-1">
              <span>TEAM ID: 134501</span>
              <span>CODEORBIT</span>
            </div>
            <div className="text-slate-300 font-medium">Amity University Jharkhand</div>
            <div className="text-slate-500 text-[10px] mt-0.5">Hilly Watershed Intelligence</div>
          </div>
        </div>
      </aside>
    </>
  );
};
