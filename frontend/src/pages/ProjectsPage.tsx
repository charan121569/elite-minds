import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  Plus,
  Search,
  MoreVertical,
  Trash2,
  Edit2,
  ArrowRight,
  Database,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { Project } from '../types';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import { NewProjectModal } from '../components/projects/NewProjectModal';

export const ProjectsPage: React.FC = () => {
  const [projectsList, setProjectsList] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [languageFilter, setLanguageFilter] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { setActiveProject, refreshProjects } = useProject();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const data = await api.getProjects({
        search: search || undefined,
        language: languageFilter || undefined,
      });
      setProjectsList(data);
    } catch (err: any) {
      error('Failed to Load Projects', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [search, languageFilter]);

  const handleDelete = async () => {
    if (!projectToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteProject(projectToDelete.id);
      success('Project Deleted', `Project "${projectToDelete.name}" has been removed.`);
      setProjectToDelete(null);
      await fetchProjects();
      await refreshProjects();
    } catch (err: any) {
      error('Failed to Delete Project', err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenWorkspace = (project: Project) => {
    setActiveProject(project);
    navigate('/requirements');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Project Workspaces</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your applications, tech stacks, and autonomous development pipelines.
          </p>
        </div>
        <Button
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => setIsNewModalOpen(true)}
        >
          Create Project
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search projects by name, description, framework..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={languageFilter}
            onChange={(e) => setLanguageFilter(e.target.value)}
            className="w-full px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 cursor-pointer"
          >
            <option value="">All Languages</option>
            <option value="TypeScript">TypeScript</option>
            <option value="JavaScript">JavaScript</option>
            <option value="Python">Python</option>
            <option value="Java">Java</option>
            <option value="Go">Go</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : projectsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projectsList.map((project) => (
            <div
              key={project.id}
              className="bg-white rounded-xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors truncate max-w-[180px]">
                        {project.name}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        Updated {new Date(project.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setProjectToDelete(project)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed min-h-[32px]">
                  {project.description || 'No description provided for this project.'}
                </p>

                {/* Tech Stack Pills */}
                <div className="flex flex-wrap items-center gap-1.5 mt-4 pt-3 border-t border-slate-100">
                  <Badge variant="purple" size="sm">
                    {project.programming_language}
                  </Badge>
                  <Badge variant="info" size="sm">
                    {project.framework}
                  </Badge>
                  <Badge variant="default" size="sm">
                    {project.database_preference}
                  </Badge>
                </div>
              </div>

              {/* Card Action Footer */}
              <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Status: <span className="text-emerald-600 font-semibold">{project.status}</span>
                </span>
                <button
                  onClick={() => handleOpenWorkspace(project)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                >
                  <span>Open Pipeline</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={<FolderGit2 className="w-6 h-6" />}
          title="No projects match your criteria"
          description="Try adjusting your search query or language filter, or create a brand new development project."
          actionText="Create Project"
          onAction={() => setIsNewModalOpen(true)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Modal
        isOpen={!!projectToDelete}
        onClose={() => setProjectToDelete(null)}
        title="Delete Project"
        description="Are you sure you want to delete this project? This will permanently remove all associated requirements, tasks, test cases, and reviews from MySQL."
        footer={
          <>
            <Button variant="ghost" onClick={() => setProjectToDelete(null)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete} isLoading={isDeleting}>
              Confirm Delete
            </Button>
          </>
        }
      >
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed">
          <p className="font-semibold">Destructive Action Notice:</p>
          <p className="mt-1">
            Project: <span className="font-bold">{projectToDelete?.name}</span>
          </p>
          <p className="mt-1">
            All relational entities cascading from this project in MySQL will be deleted immediately.
          </p>
        </div>
      </Modal>

      <NewProjectModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={fetchProjects}
      />
    </div>
  );
};
