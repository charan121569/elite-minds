import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderGit2,
  FileSearch,
  KanbanSquare,
  BookOpen,
  CheckCheck,
  ShieldAlert,
  History,
  Settings as SettingsIcon,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { HealthStatus } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(() => null);
  }, []);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderGit2 },
    { name: 'Requirement Analyzer', path: '/requirements', icon: FileSearch },
    { name: 'Task Planner', path: '/tasks', icon: KanbanSquare },
    { name: 'Implementation Guide', path: '/guidance', icon: BookOpen },
    { name: 'Test Case Generator', path: '/testing', icon: CheckCheck },
    { name: 'Code Review', path: '/code-review', icon: ShieldAlert },
    { name: 'Activity History', path: '/activity', icon: History },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isLiveAI = health?.ai_configured;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#0f172a] text-slate-100 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-600/30 shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-bold text-sm tracking-tight text-white flex items-center gap-1.5">
                AI Dev Agent
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              </span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                Elite Minds Studio
              </span>
            </div>
          )}
        </div>
        <button
          onClick={onToggle}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* AI Health Indicator Badge */}
      {!isCollapsed && (
        <div className="px-4 pt-3 pb-1">
          <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 border border-slate-800/80 text-xs">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isLiveAI ? 'bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              <span className="text-slate-300 text-[11px] font-medium">
                {isLiveAI ? 'Gemini 2.0 Live' : 'Demo Fixture Mode'}
              </span>
            </div>
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ${
                isLiveAI ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'
              }`}
            >
              {isLiveAI ? 'Live' : 'Demo'}
            </span>
          </div>
        </div>
      )}

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto dark-scroll">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className="w-4 h-4 shrink-0 text-slate-300" />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center justify-center font-bold text-xs shrink-0">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-semibold text-white truncate">{user?.full_name || 'User'}</span>
                <span className="text-[10px] text-slate-400 truncate">{user?.email}</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col shrink-0 border-r border-slate-800 transition-all duration-200 z-30 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onMobileClose} />
          <div className="relative w-64 max-w-[80vw] h-full shadow-2xl z-50 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
