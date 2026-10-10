import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  KanbanSquare,
  List,
  Plus,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Trash2,
  Edit,
  ArrowRight,
  Layers,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  BookOpen,
  FileSearch,
  FolderKanban,
  CheckCheck,
  Cpu,
} from 'lucide-react';
import { api } from '../services/api';
import { DevelopmentTask, Project, Requirement } from '../types';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

export const TaskPlannerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeProject } = useProject();
  const { success, error } = useToast();

  const [tasks, setTasks] = useState<DevelopmentTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');

  // Requirement & Project Module state
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isLoadingRequirements, setIsLoadingRequirements] = useState(false);
  const [isModuleExpanded, setIsModuleExpanded] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Generation Modal
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [useDemoMode, setUseDemoMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Selected Task Detail Modal
  const [selectedTask, setSelectedTask] = useState<DevelopmentTask | null>(null);

  const fetchTasks = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const data = await api.getProjectTasks(activeProject.id, {
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
      });
      setTasks(data);
    } catch (err: any) {
      error('Failed to Load Tasks', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRequirements = async () => {
    if (!activeProject) {
      setRequirements([]);
      setSelectedRequirement(null);
      return;
    }
    setIsLoadingRequirements(true);
    try {
      const data = await api.getProjectRequirements(activeProject.id);
      setRequirements(data);
      const passedReqId = location.state?.requirementId;
      if (passedReqId) {
        const found = data.find((r) => r.id === passedReqId);
        if (found) {
          setSelectedRequirement(found);
          return;
        }
      }
      if (data.length > 0) {
        setSelectedRequirement((prev) => (prev && data.some((r) => r.id === prev.id) ? prev : data[0]));
      } else {
        setSelectedRequirement(null);
      }
    } catch {
      setRequirements([]);
      setSelectedRequirement(null);
    } finally {
      setIsLoadingRequirements(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeProject?.id, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchRequirements();
  }, [activeProject?.id, location.state]);

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeProject) return;

    setIsGenerating(true);
    try {
      const generated = await api.generateTasks({
        project_id: activeProject.id,
        requirement_id: selectedRequirement?.id,
        replace_existing: replaceExisting,
        custom_instructions: customInstructions.trim() || undefined,
        demo_mode: useDemoMode,
      });
      success('Tasks Generated', `Generated ${generated.length} actionable engineering tasks for ${activeProject.name}.`);
      setIsGenerateModalOpen(false);
      await fetchTasks();
    } catch (err: any) {
      error('Task Generation Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (task: DevelopmentTask, newStatus: string) => {
    try {
      const updated = await api.updateTask(task.id, { status: newStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      if (selectedTask?.id === task.id) setSelectedTask(updated);
      success('Status Updated', `${task.task_key} is now ${newStatus}`);
    } catch (err: any) {
      error('Failed to Update Status', err.message);
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await api.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      if (selectedTask?.id === taskId) setSelectedTask(null);
      success('Task Deleted', 'Task removed from MySQL.');
    } catch (err: any) {
      error('Failed to Delete Task', err.message);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (!search) return true;
    const query = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.task_key.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
    );
  });

  const todoTasks = filteredTasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  const getPriorityBadgeVariant = (priority: string) => {
    if (priority === 'Critical') return 'danger';
    if (priority === 'High') return 'warning';
    if (priority === 'Medium') return 'info';
    return 'default';
  };

  const renderTaskCard = (task: DevelopmentTask) => (
    <div
      key={task.id}
      onClick={() => setSelectedTask(task)}
      className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all duration-200 cursor-pointer space-y-3 group"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
          {task.task_key}
        </span>
        <div className="flex items-center gap-1.5">
          <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
            {task.priority}
          </Badge>
          <Badge variant="outline" size="sm">
            {task.complexity}
          </Badge>
        </div>
      </div>

      <h4 className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
        {task.title}
      </h4>

      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
        {task.description}
      </p>

      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span className="font-medium text-slate-600">{task.category}</span>
        {task.estimated_duration && <span>{task.estimated_duration}</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Development Task Planner
            <KanbanSquare className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Structured task decomposition with dependencies and state persistence in MySQL.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex items-center bg-slate-200/60 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kanban Board View"
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Detailed List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button
            variant="primary"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={() => setIsGenerateModalOpen(true)}
          >
            Generate Tasks
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search tasks by title, ID, category, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Main Board or List Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<KanbanSquare className="w-8 h-8" />}
          title="No tasks planned yet"
          description="Generate structured tasks from your analyzed software requirements or custom instructions."
          actionText="Generate Tasks Now"
          onAction={() => setIsGenerateModalOpen(true)}
        />
      ) : viewMode === 'kanban' ? (
        /* Kanban 3-Column Board */
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {/* To Do Column */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">To Do</h3>
              </div>
              <Badge variant="default" size="sm">
                {todoTasks.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {todoTasks.map(renderTaskCard)}
              {todoTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl">
                  No tasks in To Do
                </div>
              )}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-indigo-50/40 p-4 rounded-2xl border border-indigo-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-900">In Progress</h3>
              </div>
              <Badge variant="purple" size="sm">
                {inProgressTasks.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {inProgressTasks.map(renderTaskCard)}
              {inProgressTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-indigo-300 border border-dashed border-indigo-200 rounded-xl">
                  No active tasks
                </div>
              )}
            </div>
          </div>

          {/* Completed Column */}
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">Completed</h3>
              </div>
              <Badge variant="success" size="sm">
                {completedTasks.length}
              </Badge>
            </div>
            <div className="space-y-3">
              {completedTasks.map(renderTaskCard)}
              {completedTasks.length === 0 && (
                <div className="p-6 text-center text-xs text-emerald-300 border border-dashed border-emerald-200 rounded-xl">
                  No completed tasks yet
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* List View */
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTask(task)}
                  className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-1 rounded shrink-0">
                      {task.task_key}
                    </span>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-slate-900 truncate hover:text-indigo-600 transition-colors">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-slate-500">{task.category}</span>
                        <span className="text-slate-300">•</span>
                        <Badge variant={getPriorityBadgeVariant(task.priority)} size="sm">
                          {task.priority}
                        </Badge>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-400">{task.estimated_duration}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={task.status}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => handleStatusChange(task, e.target.value)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg border border-slate-300 bg-white text-slate-700 focus:outline-none cursor-pointer"
                    >
                      <option value="To Do">To Do</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Task Generation Modal */}
      <Modal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
        title="Generate Development Tasks"
        description="Decompose your requirements into prioritized, actionable engineering work items."
        maxWidth="lg"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsGenerateModalOpen(false)} disabled={isGenerating}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleGenerate} isLoading={isGenerating}>
              Generate Tasks
            </Button>
          </>
        }
      >
        <form onSubmit={handleGenerate} className="space-y-4">
          <Textarea
            label="Custom Deconstruction Directives (Optional)"
            placeholder="e.g. Focus specifically on database transaction management and JWT auth guards..."
            rows={3}
            value={customInstructions}
            onChange={(e) => setCustomInstructions(e.target.value)}
          />

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-slate-800 block">Replace Existing Tasks</span>
                <span className="text-slate-500">Overwrites prior generated tasks for this project</span>
              </div>
              <input
                type="checkbox"
                checked={replaceExisting}
                onChange={(e) => setReplaceExisting(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
              <div>
                <span className="font-semibold text-slate-800 block">Demonstration Fixture Mode</span>
                <span className="text-slate-500">Load calibrated student management system tasks</span>
              </div>
              <input
                type="checkbox"
                checked={useDemoMode}
                onChange={(e) => setUseDemoMode(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Modal
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
          title={`${selectedTask.task_key}: ${selectedTask.title}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => handleDeleteTask(selectedTask.id)}
              >
                Delete Task
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Status:</span>
                <select
                  value={selectedTask.status}
                  onChange={(e) => handleStatusChange(selectedTask, e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 cursor-pointer"
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            {/* Metadata Pills */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getPriorityBadgeVariant(selectedTask.priority)}>
                Priority: {selectedTask.priority}
              </Badge>
              <Badge variant="purple">Complexity: {selectedTask.complexity}</Badge>
              <Badge variant="info">Category: {selectedTask.category}</Badge>
              {selectedTask.estimated_duration && (
                <Badge variant="default">Estimate: {selectedTask.estimated_duration}</Badge>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-1.5">Description</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                {selectedTask.description}
              </p>
            </div>

            {/* Implementation Steps */}
            {selectedTask.implementation_steps && selectedTask.implementation_steps.length > 0 && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Implementation Sequence
                </h4>
                <ol className="space-y-1.5">
                  {selectedTask.implementation_steps.map((step, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                      <span className="font-mono font-bold text-indigo-600">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Expected Deliverables */}
            {selectedTask.expected_deliverables && selectedTask.expected_deliverables.length > 0 && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Expected Deliverables
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedTask.expected_deliverables.map((del, idx) => (
                    <Badge key={idx} variant="default" size="md">
                      📦 {del}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Acceptance Criteria */}
            {selectedTask.acceptance_criteria && selectedTask.acceptance_criteria.length > 0 && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Verification & Acceptance Criteria
                </h4>
                <ul className="space-y-1.5">
                  {selectedTask.acceptance_criteria.map((crit, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-emerald-50/60 border border-emerald-100 text-emerald-900">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{crit}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
