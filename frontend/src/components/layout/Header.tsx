import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Plus, ChevronRight, FolderDot } from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { Button } from '../ui/Button';

interface HeaderProps {
  onMobileMenuToggle: () => void;
  onOpenNewProject: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle, onOpenNewProject }) => {
  const location = useLocation();
  const { projects, activeProject, selectProjectById } = useProject();

  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/projects') return 'Projects';
    if (path === '/requirements') return 'Requirement Analyzer';
    if (path === '/tasks') return 'Task Planner';
    if (path === '/guidance') return 'Implementation Guide';
    if (path === '/testing') return 'Test Case Generator';
    if (path === '/code-review') return 'Code Review';
    if (path === '/activity') return 'Activity History';
    if (path === '/settings') return 'Settings';
    return 'Workspace';
  };

  return (
    <header className="h-16 px-6 bg-white border-b border-slate-200/80 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      <div className="flex items-center gap-4">
        <button
          onClick={onMobileMenuToggle}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <Link to="/" className="hover:text-slate-800 transition-colors">
            AI Dev Agent
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-semibold">{getBreadcrumbs()}</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Active Project Selector */}
        {projects.length > 0 && (
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <FolderDot className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-slate-500 font-medium hidden sm:inline">Active Project:</span>
            <select
              value={activeProject?.id || ''}
              onChange={(e) => selectProjectById(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer max-w-[140px] sm:max-w-[180px] truncate"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Plus className="w-3.5 h-3.5 text-indigo-600" />}
          onClick={onOpenNewProject}
        >
          <span className="hidden sm:inline">New Project</span>
        </Button>
      </div>
    </header>
  );
};
