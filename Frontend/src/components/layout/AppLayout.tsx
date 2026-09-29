import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Menu, X, AlertTriangle } from 'lucide-react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { useBackendHealth } from '../../hooks/useBackendHealth';

export const AppLayout: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { isConnected, isModelLoaded, isChecking, error } = useBackendHealth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <Header />

      {/* Backend Unavailable Warning Banner if down */}
      {!isChecking && (!isConnected || !isModelLoaded) && (
        <div className="bg-rose-950/80 border-b border-rose-800/80 px-4 py-2 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span className="font-semibold">SYSTEM STATUS: Unavailable</span>
            <span className="hidden sm:inline text-rose-300">
              — The prediction service is currently unavailable. Please verify the FastAPI backend status in Settings.
            </span>
          </div>
          <a
            href="/settings"
            className="text-[11px] underline font-mono hover:text-white shrink-0 ml-2"
          >
            Configure Endpoint →
          </a>
        </div>
      )}

      {/* Mobile Sidebar Toggle Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs">
        <button
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="flex items-center gap-2 text-slate-300 hover:text-white"
        >
          {isMobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span className="font-medium">Navigation Menu</span>
        </button>
        <span className="text-slate-400 font-mono text-[11px] capitalize">
          {location.pathname.replace('/', '') || 'Dashboard'}
        </span>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={isMobileSidebarOpen}
          onClose={() => setIsMobileSidebarOpen(false)}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
