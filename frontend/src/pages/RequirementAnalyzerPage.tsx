import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch,
  Sparkles,
  ArrowRight,
  KanbanSquare,
  BookOpen,
  CheckCheck,
  RotateCcw,
  History,
  Layers,
  AlertTriangle,
  Users,
  Shield,
  HelpCircle,
  Clock,
  ListTodo,
} from 'lucide-react';
import { api } from '../services/api';
import { Requirement } from '../types';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Tabs } from '../components/ui/Tabs';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';

const SAMPLE_REQUIREMENT = {
  title: 'Student Management & Grading System',
  raw: `Build a production-grade student management system featuring student registration, secure multi-role login (Admins, Faculty, Students), full CRUD operations on student profiles, course enrollment tracking, input validation, and an executive KPI dashboard.`,
  constraints: 'Enforce MySQL ACID transactions for grading updates. Use Argon2 for password hashing.',
  acceptanceCriteria: 'Passwords must contain at least 8 characters. Students must never be able to mutate peer records.',
};

export const RequirementAnalyzerPage: React.FC = () => {
  const { activeProject, projects, selectProjectById } = useProject();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [rawRequirement, setRawRequirement] = useState('');
  const [constraints, setConstraints] = useState('');
  const [acceptanceCriteria, setAcceptanceCriteria] = useState('');
  const [useDemoMode, setUseDemoMode] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [currentAnalysis, setCurrentAnalysis] = useState<Requirement | null>(null);
  const [historyList, setHistoryList] = useState<Requirement[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchHistory = async () => {
    if (!activeProject) return;
    setIsLoadingHistory(true);
    try {
      const data = await api.getProjectRequirements(activeProject.id);
      setHistoryList(data);
      if (data.length > 0 && !currentAnalysis) {
        setCurrentAnalysis(data[0]);
      }
    } catch {
      setHistoryList([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [activeProject?.id]);

  const handlePreloadDemo = () => {
    setTitle(SAMPLE_REQUIREMENT.title);
    setRawRequirement(SAMPLE_REQUIREMENT.raw);
    setConstraints(SAMPLE_REQUIREMENT.constraints);
    setAcceptanceCriteria(SAMPLE_REQUIREMENT.acceptanceCriteria);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeProject) {
      error('No Active Project', 'Please select or create a project before analyzing requirements.');
      return;
    }
    if (!title.trim() || !rawRequirement.trim()) {
      error('Missing Inputs', 'Please supply both a requirement title and detailed description.');
      return;
    }

    setIsAnalyzing(true);
    try {
      const result = await api.analyzeRequirement({
        project_id: activeProject.id,
        title: title.trim(),
        raw_requirement: rawRequirement.trim(),
        constraints: constraints.trim() || undefined,
        acceptance_criteria: acceptanceCriteria.trim() || undefined,
        demo_mode: useDemoMode,
      });
      setCurrentAnalysis(result);
      await fetchHistory();
      success('Analysis Complete', `Requirement "${result.title}" analyzed and persisted to MySQL.`);
    } catch (err: any) {
      error('Analysis Failed', err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analysisTabs = [
    { id: 'overview', label: 'Summary & Problem' },
    { id: 'functional', label: 'Functional Req.', badge: currentAnalysis?.functional_requirements?.length },
    { id: 'roles', label: 'Roles & Security', badge: currentAnalysis?.user_roles?.length },
    { id: 'architecture', label: 'Architecture & Phases', badge: currentAnalysis?.suggested_phases?.length },
    { id: 'risks', label: 'Assumptions & Risks' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            AI Requirement Analyzer
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Transform natural-language specs into validated architectural deliverables with Gemini 2.0.
          </p>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2 text-xs bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-xs">
            <span className="text-slate-400">Target Stack:</span>
            <span className="font-semibold text-slate-800">
              {activeProject.programming_language} • {activeProject.framework} • {activeProject.database_preference}
            </span>
          </div>
        )}
      </div>

      {/* Main Grid: Input Form (Left) & Analyzed Results (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Submit Specification</CardTitle>
                  <CardDescription>Enter requirements or load the Elite Minds student sample</CardDescription>
                </div>
                <button
                  type="button"
                  onClick={handlePreloadDemo}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline underline-offset-4 cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleAnalyze} className="space-y-4">
                <Input
                  label="Requirement Title"
                  placeholder="e.g. Student Registration & Grading Lifecycle"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />

                <Textarea
                  label="Detailed Requirement"
                  placeholder="Describe the desired system features, business logic, endpoints, and behaviors..."
                  rows={6}
                  required
                  value={rawRequirement}
                  onChange={(e) => setRawRequirement(e.target.value)}
                />

                <Textarea
                  label="Technical Constraints (Optional)"
                  placeholder="e.g. MySQL 8.x InnoDB, strict RBAC, Argon2 hashing"
                  rows={2}
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                />

                <Textarea
                  label="Acceptance Criteria (Optional)"
                  placeholder="e.g. Reject duplicate roll numbers, passwords >= 8 chars"
                  rows={2}
                  value={acceptanceCriteria}
                  onChange={(e) => setAcceptanceCriteria(e.target.value)}
                />

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-xs">
                    <span className="font-semibold text-slate-800 block">Demonstration Fixture Mode</span>
                    <span className="text-slate-500">Enable to test deterministic responses</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={useDemoMode}
                    onChange={(e) => setUseDemoMode(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500 cursor-pointer"
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  isLoading={isAnalyzing}
                  leftIcon={<Sparkles className="w-4 h-4" />}
                >
                  Analyze Requirements
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Past Analyses History for this project */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Previous Analyses</CardTitle>
                  <CardDescription>Saved requirement records in MySQL</CardDescription>
                </div>
                <History className="w-4 h-4 text-slate-400" />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingHistory ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : historyList.length > 0 ? (
                <div className="divide-y divide-slate-100 max-h-[260px] overflow-y-auto">
                  {historyList.map((req) => (
                    <div
                      key={req.id}
                      onClick={() => setCurrentAnalysis(req)}
                      className={`p-3.5 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between ${
                        currentAnalysis?.id === req.id ? 'bg-indigo-50/60 border-l-4 border-indigo-600' : ''
                      }`}
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <h4 className="text-xs font-semibold text-slate-900 truncate">{req.title}</h4>
                        <span className="text-[10px] text-slate-400">
                          {new Date(req.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <Badge variant="outline" size="sm">
                        {req.functional_requirements?.length || 0} FRs
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  No previous requirements found for this project.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Structured Results Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {isAnalyzing ? (
            <Card className="p-8 space-y-6 text-center">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto animate-pulse">
                <Sparkles className="w-6 h-6 animate-spin" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Synthesizing Architectural Analysis...
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Extracting functional constraints, user access levels, technical dependencies, and phasing
                  strategy.
                </p>
              </div>
              <div className="space-y-3 pt-4 max-w-sm mx-auto">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5 mx-auto" />
                <Skeleton className="h-3 w-3/4 mx-auto" />
              </div>
            </Card>
          ) : currentAnalysis ? (
            <Card>
              <CardHeader className="bg-slate-50/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-xl">{currentAnalysis.title}</CardTitle>
                      <Badge variant="success" size="sm">
                        Analyzed & Saved
                      </Badge>
                    </div>
                    <CardDescription>
                      Generated on {new Date(currentAnalysis.created_at).toLocaleString()}
                    </CardDescription>
                  </div>

                  {/* Connected Workflow Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      leftIcon={<KanbanSquare className="w-3.5 h-3.5" />}
                      onClick={() => navigate('/tasks', { state: { projectId: activeProject?.id, requirementId: currentAnalysis.id } })}
                    >
                      Plan Tasks →
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<CheckCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      onClick={() => navigate('/testing')}
                    >
                      Generate Tests
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      leftIcon={<BookOpen className="w-3.5 h-3.5 text-indigo-600" />}
                      onClick={() => navigate('/guidance')}
                    >
                      Guidance
                    </Button>
                  </div>
                </div>

                {/* Workflow Transition Callout */}
                <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-indigo-50/90 to-purple-50/90 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <KanbanSquare className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Module Ready for Task Planning</p>
                      <p className="text-[11px] text-slate-600">
                        Proceed to Task Planner to decompose this requirement into development tasks.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="primary"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    onClick={() => navigate('/tasks', { state: { projectId: activeProject?.id, requirementId: currentAnalysis.id } })}
                  >
                    Open in Task Planner
                  </Button>
                </div>

                <div className="mt-4">
                  <Tabs tabs={analysisTabs} activeTab={activeTab} onChange={setActiveTab} />
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {/* Tab 1: Overview */}
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Executive Summary
                      </h4>
                      <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {currentAnalysis.summary}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                        Problem Statement
                      </h4>
                      <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {currentAnalysis.problem_statement}
                      </p>
                    </div>

                    {currentAnalysis.non_functional_requirements && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Non-Functional Requirements (Performance & Security)
                        </h4>
                        <ul className="space-y-2">
                          {currentAnalysis.non_functional_requirements.map((nfr, i) => (
                            <li
                              key={i}
                              className="text-xs text-slate-700 flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-100"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                              <span>{nfr}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Functional Requirements */}
                {activeTab === 'functional' && (
                  <div className="space-y-3">
                    {currentAnalysis.functional_requirements?.map((fr, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-indigo-700">{fr.id}: {fr.feature}</span>
                          <Badge
                            variant={fr.priority === 'Critical' ? 'danger' : fr.priority === 'High' ? 'warning' : 'default'}
                            size="sm"
                          >
                            {fr.priority}
                          </Badge>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{fr.description}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: User Roles & Permissions */}
                {activeTab === 'roles' && (
                  <div className="space-y-4">
                    {currentAnalysis.user_roles?.map((roleItem, idx) => (
                      <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-indigo-600" />
                          <h4 className="text-sm font-bold text-slate-900">{roleItem.role}</h4>
                        </div>
                        <p className="text-xs text-slate-600 mb-3">{roleItem.description}</p>
                        <div className="flex flex-wrap gap-1.5">
                          {roleItem.permissions.map((perm, pIdx) => (
                            <Badge key={pIdx} variant="outline" size="sm">
                              {perm}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 4: Architecture & Phases */}
                {activeTab === 'architecture' && (
                  <div className="space-y-6">
                    {currentAnalysis.suggested_architecture && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Architectural Foundations
                        </h4>
                        <div className="space-y-2">
                          {currentAnalysis.suggested_architecture.map((arch, i) => (
                            <div key={i} className="text-xs text-slate-700 p-3 rounded-lg bg-indigo-50/40 border border-indigo-100 flex items-start gap-2">
                              <Layers className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                              <span>{arch}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentAnalysis.suggested_phases && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Implementation Phases & Milestones
                        </h4>
                        <div className="space-y-3">
                          {currentAnalysis.suggested_phases.map((phase) => (
                            <div key={phase.phase_number} className="p-4 rounded-xl border border-slate-200 bg-white">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-900">
                                  Phase {phase.phase_number}: {phase.title}
                                </span>
                                {phase.estimated_duration && (
                                  <Badge variant="purple" size="sm">
                                    {phase.estimated_duration}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed mb-3">{phase.description}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {phase.key_deliverables.map((del, dIdx) => (
                                  <Badge key={dIdx} variant="default" size="sm">
                                    ✓ {del}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 5: Risks & Assumptions */}
                {activeTab === 'risks' && (
                  <div className="space-y-6">
                    {currentAnalysis.potential_risks && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 mb-2 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4" />
                          Potential Risks & Bottlenecks
                        </h4>
                        <div className="space-y-2">
                          {currentAnalysis.potential_risks.map((risk, i) => (
                            <div key={i} className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-900">
                              {risk}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentAnalysis.assumptions && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          Operational Assumptions
                        </h4>
                        <div className="space-y-1.5">
                          {currentAnalysis.assumptions.map((assump, i) => (
                            <div key={i} className="text-xs text-slate-700 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                              • {assump}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {currentAnalysis.clarification_questions && (
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-700 mb-2 flex items-center gap-1.5">
                          <HelpCircle className="w-4 h-4" />
                          Clarification Questions for Stakeholders
                        </h4>
                        <div className="space-y-1.5">
                          {currentAnalysis.clarification_questions.map((q, i) => (
                            <div key={i} className="text-xs text-slate-800 p-2.5 rounded-lg bg-amber-50/60 border border-amber-200">
                              ? {q}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <EmptyState
              icon={<FileSearch className="w-8 h-8" />}
              title="No requirement analyzed yet"
              description="Fill out the form on the left or click 'Load Sample' to generate a full architectural breakdown with functional requirements, roles, and implementation phases."
            />
          )}
        </div>
      </div>
    </div>
  );
};
