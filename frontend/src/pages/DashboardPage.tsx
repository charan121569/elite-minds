import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FolderGit2,
  FileSearch,
  KanbanSquare,
  CheckCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Activity,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardStats, Project } from '../types';
import { useProject } from '../context/ProjectContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Skeleton, CardSkeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { NewProjectModal } from '../components/projects/NewProjectModal';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

  const { activeProject, setActiveProject } = useProject();
  const navigate = useNavigate();

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch {
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const workflowSteps = [
    {
      title: '1. Requirements',
      desc: 'AI systems analysis & decomposition',
      path: '/requirements',
      icon: FileSearch,
      count: stats?.total_requirements || 0,
    },
    {
      title: '2. Task Planner',
      desc: 'Agile breakdown with dependencies',
      path: '/tasks',
      icon: KanbanSquare,
      count: stats?.total_tasks || 0,
    },
    {
      title: '3. Guidance',
      desc: 'Stack-tailored architecture & APIs',
      path: '/guidance',
      icon: Layers,
      count: stats ? (stats.total_projects > 0 ? 1 : 0) : 0,
    },
    {
      title: '4. Test Cases',
      desc: 'Positive, boundary & security suites',
      path: '/testing',
      icon: CheckCheck,
      count: stats?.total_test_cases || 0,
    },
    {
      title: '5. Code Review',
      desc: 'Static vulnerability & logic audit',
      path: '/code-review',
      icon: ShieldAlert,
      count: stats?.total_code_reviews || 0,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const hasAnyData =
    stats &&
    (stats.total_projects > 0 ||
      stats.total_requirements > 0 ||
      stats.total_tasks > 0 ||
      stats.total_test_cases > 0 ||
      stats.total_code_reviews > 0);

  return (
    <div className="space-y-8">
      {/* Top Banner & Contextual Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Engineering Dashboard
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time MySQL metrics tracking your AI-assisted software lifecycle.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/code-review')}
            leftIcon={<ShieldAlert className="w-4 h-4 text-slate-600" />}
          >
            Review Code
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewProjectModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Project
          </Button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Projects</span>
            <FolderGit2 className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">{stats?.total_projects || 0}</span>
            <span className="text-xs text-slate-400 block mt-1">MySQL verified</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Requirements</span>
            <FileSearch className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">{stats?.total_requirements || 0}</span>
            <span className="text-xs text-slate-400 block mt-1">Decomposed specifications</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Planned Tasks</span>
            <KanbanSquare className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">{stats?.total_tasks || 0}</span>
            <span className="text-xs text-slate-400 block mt-1">Structured work items</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Test Cases</span>
            <CheckCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">{stats?.total_test_cases || 0}</span>
            <span className="text-xs text-slate-400 block mt-1">Positive & edge validations</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Code Reviews</span>
            <ShieldAlert className="w-4 h-4 text-rose-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-slate-900">{stats?.total_code_reviews || 0}</span>
            <span className="text-xs text-slate-400 block mt-1">Static security audits</span>
          </div>
        </div>
      </div>

      {/* Development Workflow Progression Visualization */}
      <Card className="border-indigo-100 bg-gradient-to-r from-white via-indigo-50/20 to-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Autonomous Development Pipeline</CardTitle>
              <CardDescription>
                Progress through end-to-end development phases or jump directly to any specialized tool.
              </CardDescription>
            </div>
            <Badge variant="purple">Connected Pipeline</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  onClick={() => navigate(step.path)}
                  className="group relative p-4 rounded-xl bg-white border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-600">
                        {step.count} items
                      </span>
                    </div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 group-hover:text-indigo-600 transition-colors">
                      {step.title}
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="mt-4 flex items-center gap-1 text-[11px] font-semibold text-indigo-600 opacity-80 group-hover:opacity-100">
                    <span>Open Step</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Main Two-Column Analytics Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects Table (2 Cols) */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Projects</CardTitle>
                  <CardDescription>Active workspaces and configured technology stacks</CardDescription>
                </div>
                <Button size="sm" variant="ghost" onClick={() => navigate('/projects')}>
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recent_projects && stats.recent_projects.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {stats.recent_projects.map((project) => (
                    <div
                      key={project.id}
                      onClick={() => {
                        setActiveProject(project);
                        navigate('/requirements');
                      }}
                      className="p-4 sm:px-6 hover:bg-slate-50/80 transition-colors cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs shrink-0">
                          {project.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                            {project.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-500 font-medium">
                              {project.programming_language} • {project.framework}
                            </span>
                            <span className="text-slate-300">•</span>
                            <Badge variant="default" size="sm">
                              {project.database_preference}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge
                          variant={project.status === 'active' ? 'success' : 'default'}
                          size="sm"
                        >
                          {project.status}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400 hover:text-slate-700" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<FolderGit2 className="w-6 h-6" />}
                  title="No projects created yet"
                  description="Create your first software development project to begin analyzing requirements and generating tasks."
                  actionText="Create First Project"
                  onAction={() => setIsNewProjectModalOpen(true)}
                />
              )}
            </CardContent>
          </Card>

          {/* Task Status Distribution Breakdown */}
          {stats?.task_status_distribution && (
            <Card>
              <CardHeader>
                <CardTitle>Task Planning Breakdown</CardTitle>
                <CardDescription>Distribution of generated development tasks across execution states</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-center">
                    <span className="text-xs font-semibold uppercase text-slate-500 tracking-wider">To Do</span>
                    <span className="text-2xl font-bold text-slate-800 block mt-2">
                      {stats.task_status_distribution['To Do'] || 0}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 text-center">
                    <span className="text-xs font-semibold uppercase text-indigo-600 tracking-wider">In Progress</span>
                    <span className="text-2xl font-bold text-indigo-700 block mt-2">
                      {stats.task_status_distribution['In Progress'] || 0}
                    </span>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
                    <span className="text-xs font-semibold uppercase text-emerald-600 tracking-wider">Completed</span>
                    <span className="text-2xl font-bold text-emerald-700 block mt-2">
                      {stats.task_status_distribution['Completed'] || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Code Review Severity & Chronological Activity Log */}
        <div className="space-y-6">
          {/* Code Review Severity Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Code Review Findings</CardTitle>
              <CardDescription>Identified security & quality findings by severity</CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.review_severity_distribution && Object.values(stats.review_severity_distribution).some((v) => v > 0) ? (
                <div className="space-y-3">
                  {Object.entries(stats.review_severity_distribution).map(([sev, count]) => {
                    const sevColors: Record<string, { bg: string; text: string }> = {
                      Critical: { bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700' },
                      High: { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700' },
                      Medium: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700' },
                      Low: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700' },
                      Informational: { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' },
                    };
                    const color = sevColors[sev] || { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700' };
                    return (
                      <div
                        key={sev}
                        className={`flex items-center justify-between p-3 rounded-lg border ${color.bg}`}
                      >
                        <span className={`text-xs font-semibold ${color.text}`}>{sev}</span>
                        <span className={`text-sm font-bold ${color.text}`}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  <ShieldAlert className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  No code review audits performed yet. Submit code to generate finding metrics.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chronological Activity Feed */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Audit Activity Feed</CardTitle>
                  <CardDescription>Chronological events logged in MySQL</CardDescription>
                </div>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {stats?.recent_activities && stats.recent_activities.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
                  {stats.recent_activities.map((act) => (
                    <div key={act.id} className="p-4 hover:bg-slate-50/70 transition-colors flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-slate-800 font-medium leading-relaxed">{act.description}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" size="sm">
                            {act.entity_type}
                          </Badge>
                          <span className="text-[10px] text-slate-400">
                            {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No activity recorded yet. Start interacting with projects to record events.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <NewProjectModal
        isOpen={isNewProjectModalOpen}
        onClose={() => setIsNewProjectModalOpen(false)}
        onSuccess={loadStats}
      />
    </div>
  );
};
