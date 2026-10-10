import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCheck,
  Sparkles,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Code2,
  Trash2,
  Eye,
  FileSpreadsheet,
  BookOpen,
  Terminal,
  Play,
  RotateCw,
  Layers,
  ArrowRight,
  AlertCircle,
  Sliders,
  Check,
  Copy,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  LayoutGrid,
  Table,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import { api } from '../services/api';
import { TestCase, ImplementationGuide, AdaptiveTestExecutionResponse, AdaptedTestCaseItem } from '../types';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Tabs } from '../components/ui/Tabs';
import { CodeBlock } from '../components/ui/CodeBlock';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

const SAMPLE_IMPLEMENTED_CODE = `# Implemented according to Implementation Guide specifications
class StudentService:
    def __init__(self, db_session=None):
        self.db = db_session

    def create_student(self, first_name: str, last_name: str, email: str, department: str, enrollment_number: str) -> dict:
        """
        Handles student registration lifecycle with validation checks.
        """
        if not email or "@" not in email:
            raise ValueError("Valid university email address required")
        if not first_name or not last_name:
            raise ValueError("Student name fields cannot be blank")

        return {
            "id": 101,
            "enrollment_number": enrollment_number,
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "department": department,
            "status": "active",
            "gpa": 0.0
        }

    def validate_gpa_limits(self, gpa: float) -> bool:
        """
        Boundary validation ensuring GPA complies strictly with 0.0 - 4.0 scale.
        """
        if gpa < 0.0 or gpa > 4.0:
            raise ValueError(f"GPA {gpa} exceeds boundary range [0.0 - 4.0]")
        return True
`;

export const TestCaseGeneratorPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject } = useProject();
  const { success, error, info } = useToast();


  // Active Tab: 'matrix' (standard table) or 'adaptive' (code-driven execution & modification)
  const [activeTab, setActiveTab] = useState<'matrix' | 'adaptive'>('matrix');

  // Test Suite State
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected Test Modal
  const [selectedTest, setSelectedTest] = useState<TestCase | null>(null);

  // View Layout: horizontal cards (default) vs detailed table
  const [viewLayout, setViewLayout] = useState<'horizontal' | 'table'>('horizontal');
  const horizontalSuiteRef = useRef<HTMLDivElement>(null);
  const horizontalAdaptedRef = useRef<HTMLDivElement>(null);

  const scrollSuite = (offset: number) => {
    if (horizontalSuiteRef.current) {
      horizontalSuiteRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const scrollAdapted = (offset: number) => {
    if (horizontalAdaptedRef.current) {
      horizontalAdaptedRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // --- Adaptive Execution Module State ---
  const [guides, setGuides] = useState<ImplementationGuide[]>([]);
  const [selectedGuideId, setSelectedGuideId] = useState<number | ''>('');
  const [implementedCode, setImplementedCode] = useState(SAMPLE_IMPLEMENTED_CODE);
  const [codeLanguage, setCodeLanguage] = useState('python');
  const [targetTestCaseId, setTargetTestCaseId] = useState<string>('all');
  const [autoApplyToDb, setAutoApplyToDb] = useState(true);
  const [useDemoMode, setUseDemoMode] = useState(false);
  const [isAdapting, setIsAdapting] = useState(false);
  const [isApplying, setIsApplying] = useState(false);
  const [adaptiveResult, setAdaptiveResult] = useState<AdaptiveTestExecutionResponse | null>(null);
  const [showExecutionLogs, setShowExecutionLogs] = useState(true);

  const fetchTests = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const data = await api.getProjectTests(activeProject.id, {
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined,
        execution_status: statusFilter || undefined,
        search: search || undefined,
      });
      setTestCases(data);
    } catch (err: any) {
      error('Failed to Load Test Cases', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGuides = async () => {
    if (!activeProject) return;
    try {
      const guideData = await api.getProjectGuidance(activeProject.id);
      setGuides(guideData);
      if (guideData.length > 0 && selectedGuideId === '') {
        setSelectedGuideId(guideData[0].id);
      }
    } catch {
      setGuides([]);
    }
  };

  useEffect(() => {
    fetchTests();
    fetchGuides();
  }, [activeProject?.id, categoryFilter, priorityFilter, statusFilter, search]);

  useEffect(() => {
    if (activeProject?.programming_language) {
      setCodeLanguage(activeProject.programming_language.toLowerCase());
    }
  }, [activeProject?.programming_language]);

  const handleGenerate = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    try {
      const result = await api.generateTests({
        project_id: activeProject.id,
      });
      success('Test Cases Generated', `Created ${result.length} test cases with positive, boundary, and negative vectors.`);
      await fetchTests();
    } catch (err: any) {
      error('Generation Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleStatusChange = async (testId: number, newStatus: string) => {
    try {
      const updated = await api.updateTest(testId, { execution_status: newStatus });
      setTestCases((prev) => prev.map((t) => (t.id === testId ? updated : t)));
      if (selectedTest?.id === testId) setSelectedTest(updated);
      success('Execution Logged', `Status set to ${newStatus}`);
    } catch (err: any) {
      error('Update Failed', err.message);
    }
  };

  const handleDelete = async (testId: number) => {
    try {
      await api.deleteTest(testId);
      setTestCases((prev) => prev.filter((t) => t.id !== testId));
      if (selectedTest?.id === testId) setSelectedTest(null);
      success('Test Deleted', 'Test case deleted from MySQL.');
    } catch (err: any) {
      error('Delete Failed', err.message);
    }
  };

  const handleExportCsv = async () => {
    if (!activeProject) return;
    setIsExporting(true);
    try {
      let exportList = testCases;
      if (!exportList || exportList.length === 0) {
        try {
          exportList = await api.getProjectTests(activeProject.id);
        } catch {
          // fallback to empty
        }
      }

      if (!exportList || exportList.length === 0) {
        error('Export Unavailable', 'No test cases exist for this project yet. Generate test cases first.');
        return;
      }

      // Professional QA Test Specification headers
      const headers = [
        'Test Case ID',
        'Test Title / Scenario',
        'Description & Objective',
        'Target Requirement',
        'Category / Test Type',
        'Priority',
        'Execution Status',
        'Preconditions',
        'Step-by-Step Test Instructions',
        'Test Input Data / Parameters',
        'Expected Result',
        'Actual Result / Execution Notes',
        'Automation Approach',
        'Date Created',
      ];

      const escapeCsv = (val: any) => {
        if (val === null || val === undefined) return '""';
        let str = typeof val === 'object' ? JSON.stringify(val) : String(val);
        return `"${str.replace(/"/g, '""')}"`;
      };

      const rows = exportList.map((t) => {
        let stepsStr = '';
        if (Array.isArray(t.test_steps)) {
          stepsStr = t.test_steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n');
        } else if (t.test_steps) {
          stepsStr = String(t.test_steps);
        }

        let inputStr = '';
        if (typeof t.input_data === 'object' && t.input_data !== null) {
          inputStr = Object.entries(t.input_data)
            .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
            .join('; ');
        } else if (t.input_data) {
          inputStr = String(t.input_data).trim();
        }

        return [
          escapeCsv(t.test_key),
          escapeCsv(t.title),
          escapeCsv(t.description || ''),
          escapeCsv(t.related_requirement || 'General'),
          escapeCsv(t.category),
          escapeCsv(t.priority),
          escapeCsv(t.execution_status),
          escapeCsv(t.preconditions || 'None specified'),
          escapeCsv(stepsStr),
          escapeCsv(inputStr || 'N/A'),
          escapeCsv(t.expected_result),
          escapeCsv(t.execution_notes || 'Pending execution verification'),
          escapeCsv(t.automation_approach),
          escapeCsv(t.created_at ? new Date(t.created_at).toLocaleString() : new Date().toLocaleDateString()),
        ].join(',');
      });

      // Include UTF-8 BOM so spreadsheet viewers render accents and characters cleanly
      const csvContent = '\uFEFF' + [headers.map((h) => `"${h}"`).join(','), ...rows].join('\r\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeProject.name.toLowerCase().replace(/\s+/g, '_')}_test_cases.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Export Successful', `Exported ${exportList.length} complete test cases to CSV with all steps, inputs, descriptions, and expected results.`);
    } catch (err: any) {
      error('Export Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };


  // --- Adaptive Execution Handlers ---
  const handleLoadFromGuide = () => {
    if (!selectedGuideId) {
      info('No Guide Selected', 'Please select an implementation guide first.');
      return;
    }
    const guide = guides.find((g) => g.id === Number(selectedGuideId));
    if (!guide) return;

    if (guide.code_examples && guide.code_examples.length > 0) {
      const snippet = guide.code_examples[0];
      setImplementedCode(snippet.code);
      if (snippet.language) setCodeLanguage(snippet.language.toLowerCase());
      success('Loaded Guide Code', `Populated code snippet from '${snippet.title}' (${snippet.filename || 'Guide'}).`);
    } else if (guide.api_specifications && guide.api_specifications.length > 0) {
      const apiSpec = guide.api_specifications[0];
      const skeleton = `# Implemented from Guide API Specification: ${apiSpec.endpoint}
def handle_${apiSpec.method.toLowerCase()}_request(payload: dict) -> dict:
    # Validation rules: ${apiSpec.validation_rules?.join(', ') || 'Standard'}
    if not payload:
        raise ValueError("Payload missing")
    return {
        "status": "success",
        "endpoint": "${apiSpec.endpoint}",
        "result": payload
    }
`;
      setImplementedCode(skeleton);
      success('Generated Starter Code', `Built handler skeleton matching ${apiSpec.method} ${apiSpec.endpoint}.`);
    } else {
      info('Guide Info', 'Guide has no code snippets. Using template.');
    }
  };

  const handleLoadSampleCode = () => {
    setImplementedCode(SAMPLE_IMPLEMENTED_CODE);
    setCodeLanguage('python');
    success('Sample Loaded', 'Preloaded StudentService implementation.');
  };

  const handleExecuteAndAdapt = async () => {
    if (!activeProject) {
      error('No Active Project', 'Please select a project first.');
      return;
    }
    if (!implementedCode.trim()) {
      error('Code Missing', 'Please enter or load implemented code to evaluate.');
      return;
    }

    setIsAdapting(true);
    try {
      const res = await api.adaptTestsFromCode({
        project_id: activeProject.id,
        test_case_id: targetTestCaseId === 'all' ? undefined : Number(targetTestCaseId),
        implemented_code: implementedCode,
        language: codeLanguage,
        guide_id: selectedGuideId ? Number(selectedGuideId) : undefined,
        auto_apply: autoApplyToDb,
        demo_mode: useDemoMode,
      });

      setAdaptiveResult(res);
      const reviewMsg = res.generated_review_id ? ` and Code Review #${res.generated_review_id} generated directly in Code Review module` : '';
      if (autoApplyToDb) {
        success('Test Cases Adapted & Code Review Generated', `Updated ${res.adapted_tests.length} test cases in MySQL${reviewMsg}.`);
        await fetchTests();
      } else {
        success('Execution Complete', `Evaluated code. ${res.adapted_tests.length} test cases ready${reviewMsg}.`);
      }

    } catch (err: any) {
      error('Adaptive Execution Failed', err.message);
    } finally {
      setIsAdapting(false);
    }
  };

  const handleApplyAdaptedTests = async () => {
    if (!activeProject || !adaptiveResult?.adapted_tests) return;
    setIsApplying(true);
    try {
      await api.applyAdaptedTests({
        project_id: activeProject.id,
        adapted_tests: adaptiveResult.adapted_tests,
      });
      setAdaptiveResult((prev) => (prev ? { ...prev, applied_to_db: true } : null));
      success('Applied to Test Suite', 'All modified test cases saved to MySQL database.');
      await fetchTests();
    } catch (err: any) {
      error('Failed to Apply Changes', err.message);
    } finally {
      setIsApplying(false);
    }
  };

  const getPriorityVariant = (priority: string) => {
    if (priority === 'Critical') return 'danger';
    if (priority === 'High') return 'warning';
    if (priority === 'Medium') return 'info';
    return 'default';
  };

  const getCategoryVariant = (cat: string) => {
    if (cat === 'Positive') return 'success';
    if (cat === 'Negative') return 'danger';
    if (cat === 'Boundary') return 'warning';
    if (cat === 'Security') return 'purple';
    return 'default';
  };

  const tabs = [
    {
      id: 'matrix',
      label: 'Test Suite & Matrix',
      icon: <Layers className="w-4 h-4" />,
      badge: testCases.length,
    },
    {
      id: 'adaptive',
      label: 'Code Execution & Adaptive Refinement',
      icon: <Sparkles className="w-4 h-4 text-indigo-500" />,
      badge: adaptiveResult ? `${adaptiveResult.adapted_tests.length} Adapted` : 'Active',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Automated Test Case Generator
            <CheckCheck className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Generate and execute positive, negative, and boundary test suites that self-adapt based on implemented code.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'matrix' && testCases.length > 0 && (
            <Button
              variant="outline"
              leftIcon={<Download className="w-4 h-4 text-slate-600" />}
              onClick={handleExportCsv}
              isLoading={isExporting}
            >
              Export CSV
            </Button>
          )}

          <Button
            variant="primary"
            leftIcon={<Sparkles className="w-4 h-4" />}
            onClick={handleGenerate}
            isLoading={isGenerating}
          >
            Generate Test Cases
          </Button>
        </div>
      </div>

      {/* Main Tab Navigation */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as 'matrix' | 'adaptive')}
      />

      {/* TAB 1: TEST SUITE & MATRIX */}
      {activeTab === 'matrix' && (
        <div className="space-y-4">
          {/* Filter and Search Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search test cases by key, title, or criteria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 bg-white text-slate-700 cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="Positive">Positive</option>
                <option value="Negative">Negative</option>
                <option value="Boundary">Boundary</option>
                <option value="Security">Security</option>
              </select>

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
                <option value="Not Run">Not Run</option>
                <option value="Passed">Passed</option>
                <option value="Failed">Failed</option>
              </select>

              {/* View Layout Toggle */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 ml-auto sm:ml-0">
                <button
                  type="button"
                  onClick={() => setViewLayout('horizontal')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    viewLayout === 'horizontal'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View test cases horizontally"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Horizontal</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewLayout('table')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                    viewLayout === 'table'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="View test cases in table"
                >
                  <Table className="w-3.5 h-3.5" />
                  <span>Table</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Cases Display */}
          {isLoading ? (
            <CardSkeleton />
          ) : testCases.length === 0 ? (
            <EmptyState
              icon={<CheckCheck className="w-8 h-8" />}
              title="No test cases generated yet"
              description="Click 'Generate Test Cases' or switch to 'Code Execution & Adaptive Refinement' to self-adapt tests to your code."
              actionText="Generate Test Cases"
              onAction={handleGenerate}
            />
          ) : viewLayout === 'horizontal' ? (
            /* HORIZONTAL TEST CASES STRIP */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Generated Test Cases ({testCases.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    • Scroll horizontally to inspect each test case
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollSuite(-360)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition-colors"
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollSuite(360)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition-colors"
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Horizontal Scrollable Container */}
              <div
                ref={horizontalSuiteRef}
                className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x dark-scroll"
              >
                {testCases.map((tc) => {
                  const isSelected = selectedTest?.id === tc.id;
                  return (
                    <div
                      key={tc.id}
                      onClick={() => setSelectedTest(tc)}
                      className={`min-w-[320px] max-w-[360px] shrink-0 snap-start bg-white rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between p-4 group ${
                        isSelected
                          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/15'
                          : 'border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md'
                      }`}
                    >
                      <div>
                        {/* Header metadata */}
                        <div className="flex items-center justify-between gap-2 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                              {tc.test_key}
                            </span>
                            {tc.related_requirement && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                {tc.related_requirement}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <Badge variant={getCategoryVariant(tc.category)} size="sm">
                              {tc.category}
                            </Badge>
                            <Badge variant={getPriorityVariant(tc.priority)} size="sm">
                              {tc.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                          {tc.title}
                        </h4>

                        {/* Description */}
                        <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                          {tc.description}
                        </p>

                        {/* Details chip box */}
                        <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-[11px] mb-3">
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Automation:</span>
                            <span className="font-mono font-semibold text-slate-700 truncate max-w-[170px]">
                              {tc.automation_approach || 'Automated'}
                            </span>
                          </div>
                          {tc.preconditions && (
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Preconditions:</span>
                              <span className="font-medium text-slate-700 truncate max-w-[170px]" title={tc.preconditions}>
                                {tc.preconditions}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-slate-500">
                            <span>Steps:</span>
                            <span className="font-semibold text-indigo-600">
                              {Array.isArray(tc.test_steps) ? `${tc.test_steps.length} Steps` : 'Detailed steps'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div
                        className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={tc.execution_status}
                          onChange={(e) => handleStatusChange(tc.id, e.target.value)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border focus:outline-none cursor-pointer ${
                            tc.execution_status === 'Passed'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : tc.execution_status === 'Failed'
                              ? 'bg-rose-50 text-rose-700 border-rose-300'
                              : 'bg-slate-50 text-slate-600 border-slate-300'
                          }`}
                        >
                          <option value="Not Run">⚪ Not Run</option>
                          <option value="Passed">✓ Passed</option>
                          <option value="Failed">✕ Failed</option>
                        </select>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedTest(tc)}
                            className="px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            title="Inspect Test Case"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
                          </button>
                          <button
                            onClick={() => handleDelete(tc.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer transition-colors"
                            title="Delete Test Case"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* DETAILED TABLE VIEW */
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        <th className="py-3 px-4">Key</th>
                        <th className="py-3 px-4">Title & Context</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Priority</th>
                        <th className="py-3 px-4">Automation</th>
                        <th className="py-3 px-4">Execution Status</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {testCases.map((tc) => (
                        <tr
                          key={tc.id}
                          onClick={() => setSelectedTest(tc)}
                          className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                        >
                          <td className="py-3.5 px-4 font-mono font-bold text-indigo-700">
                            {tc.test_key}
                          </td>
                          <td className="py-3.5 px-4 max-w-sm">
                            <span className="font-semibold text-slate-900 group-hover:text-indigo-600 block transition-colors truncate">
                              {tc.title}
                            </span>
                            <span className="text-[11px] text-slate-500 truncate block mt-0.5">
                              {tc.description}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={getCategoryVariant(tc.category)} size="sm">
                              {tc.category}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={getPriorityVariant(tc.priority)} size="sm">
                              {tc.priority}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                            {tc.automation_approach}
                          </td>
                          <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                            <select
                              value={tc.execution_status}
                              onChange={(e) => handleStatusChange(tc.id, e.target.value)}
                              className={`px-2.5 py-1 text-xs font-semibold rounded-lg border focus:outline-none cursor-pointer ${
                                tc.execution_status === 'Passed'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : tc.execution_status === 'Failed'
                                  ? 'bg-rose-50 text-rose-700 border-rose-300'
                                  : 'bg-slate-50 text-slate-600 border-slate-300'
                              }`}
                            >
                              <option value="Not Run">⚪ Not Run</option>
                              <option value="Passed">✓ Passed</option>
                              <option value="Failed">✕ Failed</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedTest(tc)}
                                className="p-1 text-slate-400 hover:text-indigo-600 rounded cursor-pointer"
                                title="Inspect Test"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(tc.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded cursor-pointer"
                                title="Delete"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB 2: CODE EXECUTION & ADAPTIVE TEST REFINEMENT */}
      {activeTab === 'adaptive' && (
        <div className="space-y-6">
          {/* Informational Guidance Banner */}
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-8">
              <Code2 className="w-64 h-64 text-white" />
            </div>
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  Self-Adapting QA Engine
                </span>
                <span className="text-xs text-indigo-200">Execution-Driven Calibration</span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white">
                Code-Driven Test Case Adaptive Refinement
              </h2>
              <p className="text-xs text-indigo-100/90 leading-relaxed">
                Provide your code implemented according to Technical Implementation Guides. The system compiles and evaluates the implementation, detects actual method signatures and return contracts, and automatically modifies test steps, assertions, and test scripts to align with execution results.
              </p>
            </div>
          </div>

          {/* TOP: Full-Width Implemented Code Input Box */}
          <Card className="w-full shadow-sm border-slate-200">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-600" />
                        Implemented Code Input
                      </CardTitle>
                      <CardDescription className="text-xs">
                        Enter code built using technical guides or load directly from project blueprints.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        leftIcon={<BookOpen className="w-3.5 h-3.5 text-indigo-600" />}
                        onClick={handleLoadFromGuide}
                        disabled={guides.length === 0}
                      >
                        Load Guide Snippet
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLoadSampleCode}
                        className="text-xs text-slate-600 hover:text-indigo-600"
                      >
                        Sample Code
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Guide Selection & Configuration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                        Associated Implementation Guide
                      </label>
                      <select
                        value={selectedGuideId}
                        onChange={(e) => setSelectedGuideId(e.target.value ? Number(e.target.value) : '')}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        {guides.length === 0 ? (
                          <option value="">No guides found (Generating from prompt)</option>
                        ) : (
                          guides.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title} ({g.code_examples?.length || 0} code snippets)
                            </option>
                          ))
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Language & Runtime
                      </label>
                      <select
                        value={codeLanguage}
                        onChange={(e) => setCodeLanguage(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 uppercase font-mono"
                      >
                        <option value="python">Python</option>
                        <option value="typescript">TypeScript</option>
                        <option value="javascript">JavaScript</option>
                        <option value="go">Go</option>
                        <option value="java">Java</option>
                        <option value="csharp">C#</option>
                      </select>
                    </div>
                  </div>

                  {/* Code Textarea Editor */}
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                      <span className="font-mono text-[11px] font-semibold text-slate-700">
                        Source Code / Implementation Handler:
                      </span>
                      <span className="text-[11px]">
                        {implementedCode.split('\n').length} lines
                      </span>
                    </div>
                    <div className="relative rounded-xl border border-slate-800 bg-[#0b1329] overflow-hidden shadow-inner">
                      <div className="flex items-center justify-between px-3 py-2 bg-[#070d1e] border-b border-slate-800/80 text-[11px] font-mono text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                          <span className="ml-2 text-slate-300 font-medium">{codeLanguage}.source</span>
                        </div>
                        <span className="text-indigo-400 uppercase text-[10px] font-bold">Editable Code</span>
                      </div>
                      <textarea
                        value={implementedCode}
                        onChange={(e) => setImplementedCode(e.target.value)}
                        rows={16}
                        placeholder="Paste implemented code here or load from an implementation guide..."
                        className="w-full p-4 bg-transparent text-xs font-mono text-slate-100 leading-relaxed resize-y focus:outline-none focus:ring-0 placeholder:text-slate-600 dark-scroll selection:bg-indigo-700 selection:text-white"
                        spellCheck={false}
                      />
                    </div>
                  </div>

                  {/* Execution Target & Auto Apply Controls */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Test Scope to Calibrate
                        </label>
                        <select
                          value={targetTestCaseId}
                          onChange={(e) => setTargetTestCaseId(e.target.value)}
                          className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none"
                        >
                          <option value="all">All Project Test Cases ({testCases.length})</option>
                          {testCases.map((tc) => (
                            <option key={tc.id} value={tc.id}>
                              {tc.test_key}: {tc.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="pt-4 sm:pt-0">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={autoApplyToDb}
                            onChange={(e) => setAutoApplyToDb(e.target.checked)}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          <span className="text-xs font-medium text-slate-700">
                            Auto-apply modified test cases directly to MySQL database
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                      <div className="flex items-center gap-2">
                        <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useDemoMode}
                            onChange={(e) => setUseDemoMode(e.target.checked)}
                            className="w-3.5 h-3.5 rounded text-indigo-600"
                          />
                          <span>Offline AST Analysis Mode</span>
                        </label>
                      </div>

                      <Button
                        variant="primary"
                        leftIcon={<Play className="w-4 h-4" />}
                        onClick={handleExecuteAndAdapt}
                        isLoading={isAdapting}
                        className="w-full sm:w-auto shadow-md shadow-indigo-600/20"
                      >
                        Execute & Adapt Test Cases
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
          {/* Below Code Box: Horizontal Test Cases Section */}
          {adaptiveResult ? (
            <div className="space-y-4">
              {/* Direct Code Review Module Integration Banner */}
              {adaptiveResult.generated_review_id && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/40 text-white shadow-lg space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-8 h-8 rounded-lg bg-purple-500/30 text-purple-300 flex items-center justify-center border border-purple-400/40 shrink-0 mt-0.5">
                        <ShieldCheck className="w-4 h-4 text-purple-300" />
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white tracking-wide">
                            Code Review Generated Automatically
                          </h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-500 text-white">
                            Review #{adaptiveResult.generated_review_id}
                          </span>
                        </div>
                        <p className="text-[11px] text-purple-200 mt-0.5 leading-relaxed">
                          {adaptiveResult.generated_review_summary || 'Synchronized quality, security, and edge-case assessment available directly in the Code Review module.'}
                        </p>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate('/code-review')}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="bg-purple-600 hover:bg-purple-500 text-xs shadow-md shadow-purple-900/30 shrink-0"
                    >
                      Open in Code Review
                    </Button>
                  </div>
                </div>
              )}

              {/* Verdict & Summary Card */}
              <Card className="overflow-hidden border-indigo-200 shadow-md">
                <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    {adaptiveResult.verdict === 'PASS' ? (
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    ) : adaptiveResult.verdict === 'ADAPTED' ? (
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-300 flex items-center justify-center border border-indigo-400/30">
                        <Sparkles className="w-5 h-5" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/30">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">Execution Verdict:</h3>
                        <span
                          className={`text-xs font-extrabold px-2 py-0.5 rounded ${
                            adaptiveResult.verdict === 'PASS'
                              ? 'bg-emerald-500 text-white'
                              : adaptiveResult.verdict === 'ADAPTED'
                              ? 'bg-indigo-600 text-white'
                              : 'bg-rose-600 text-white'
                          }`}
                        >
                          {adaptiveResult.verdict}
                        </span>
                      </div>
                      <span className="text-[11px] text-indigo-200">
                        {adaptiveResult.adapted_tests.length} test cases recalibrated
                      </span>
                    </div>
                  </div>

                  {adaptiveResult.applied_to_db ? (
                    <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      <Check className="w-3 h-3" /> Saved to DB
                    </span>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleApplyAdaptedTests}
                      isLoading={isApplying}
                      className="text-xs"
                    >
                      Apply to DB
                    </Button>
                  )}
                </div>

                <CardContent className="p-4 space-y-3 text-xs">
                  <div>
                    <h4 className="font-semibold text-slate-800 mb-1">Execution Summary:</h4>
                    <p className="text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      {adaptiveResult.summary}
                    </p>
                  </div>

                  {/* Gaps / Findings */}
                  {adaptiveResult.gaps_found && adaptiveResult.gaps_found.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-1 flex items-center gap-1 text-amber-700">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Behavioral Findings & Gaps:
                      </h4>
                      <ul className="space-y-1">
                        {adaptiveResult.gaps_found.map((gap, i) => (
                          <li key={i} className="text-slate-700 bg-amber-50/70 p-2 rounded border border-amber-200/80 flex items-start gap-1.5">
                            <span className="font-bold text-amber-800">•</span>
                            <span>{gap}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Collapsible Execution Logs */}
                  <div>
                    <button
                      onClick={() => setShowExecutionLogs(!showExecutionLogs)}
                      className="flex items-center justify-between w-full text-slate-700 font-semibold p-2 rounded hover:bg-slate-100 transition-colors"
                    >
                      <span className="flex items-center gap-1.5">
                        <Terminal className="w-3.5 h-3.5 text-slate-600" />
                        Execution Trace & AST Log
                      </span>
                      {showExecutionLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {showExecutionLogs && (
                      <pre className="mt-1 p-3 rounded-lg bg-slate-900 text-slate-200 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap max-h-36 dark-scroll">
                        {adaptiveResult.execution_output}
                      </pre>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Modified Test Cases - Horizontal Strip */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Calibrated Test Cases ({adaptiveResult.adapted_tests.length})
                    </h3>
                    <span className="text-xs text-slate-400">
                      • Synchronized automatically below code
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => scrollAdapted(-360)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition-colors"
                      title="Scroll Left"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => scrollAdapted(360)}
                      className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition-colors"
                      title="Scroll Right"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div
                  ref={horizontalAdaptedRef}
                  className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x dark-scroll"
                >
                  {adaptiveResult.adapted_tests.map((adapted, idx) => (
                    <div
                      key={idx}
                      className="min-w-[340px] max-w-[380px] shrink-0 snap-start bg-white rounded-xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-colors flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-3.5 pb-2 bg-slate-50/70 border-b border-slate-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-indigo-700 text-xs">
                              {adapted.test_key}
                            </span>
                            <span className="font-semibold text-slate-900 text-xs truncate max-w-[200px]">
                              {adapted.title}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              adapted.execution_status === 'Passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-indigo-100 text-indigo-800'
                            }`}
                          >
                            ✓ {adapted.execution_status}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 space-y-3 text-xs flex-1">
                        {/* Modifications Summary */}
                        {adapted.modifications_summary && adapted.modifications_summary.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                              Automatic Refinements Made:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {adapted.modifications_summary.map((mod, mi) => (
                                <span
                                  key={mi}
                                  className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[11px] font-medium border border-indigo-200/60"
                                >
                                  {mod}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Before vs After Expected Result */}
                        <div className="space-y-1.5 pt-1">
                          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block">
                            Expected Result (Self-Modified):
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            <div className="p-2 rounded bg-rose-50/40 border border-rose-200 text-rose-950 text-[11px]">
                              <span className="font-bold text-rose-800 block text-[10px] uppercase">
                                Previous Expectation:
                              </span>
                              <span className="line-through text-slate-500">{adapted.old_expected_result}</span>
                            </div>
                            <div className="p-2 rounded bg-emerald-50/60 border border-emerald-300 text-emerald-950 text-[11px]">
                              <span className="font-bold text-emerald-800 block text-[10px] uppercase">
                                Calibrated to Implemented Code:
                              </span>
                              <span className="font-medium">{adapted.new_expected_result}</span>
                            </div>
                          </div>
                        </div>

                        {/* Refined Test Steps */}
                        {adapted.new_test_steps && adapted.new_test_steps.length > 0 && (
                          <div>
                            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px] block mb-1">
                              Synchronized Test Steps:
                            </span>
                            <ol className="space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200 max-h-28 overflow-y-auto">
                              {adapted.new_test_steps.map((st, si) => (
                                <li key={si} className="text-slate-800 text-[11px] flex items-start gap-1.5">
                                  <span className="font-mono font-bold text-indigo-600">{si + 1}.</span>
                                  <span>{st}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Current Test Cases Horizontally (Shown below code box before running execution) */
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Test Cases to Calibrate ({testCases.length})
                  </h3>
                  <span className="text-xs text-slate-400">
                    • These test cases will be self-adapted when you click Execute & Adapt above
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => scrollSuite(-360)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition-colors"
                    title="Scroll Left"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollSuite(360)}
                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 shadow-xs cursor-pointer transition-colors"
                    title="Scroll Right"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {testCases.length === 0 ? (
                <Card className="p-8 text-center bg-slate-50/60 border-dashed">
                  <p className="text-xs text-slate-500">
                    No test cases in this project yet. Put your code above and click <strong>"Execute & Adapt Test Cases"</strong> to calibrate and generate test cases.
                  </p>
                </Card>
              ) : (
                <div
                  ref={horizontalSuiteRef}
                  className="flex items-stretch gap-4 overflow-x-auto pb-4 pt-1 snap-x dark-scroll"
                >
                  {testCases.map((tc) => {
                    const isSelected = selectedTest?.id === tc.id;
                    return (
                      <div
                        key={tc.id}
                        onClick={() => setSelectedTest(tc)}
                        className={`min-w-[320px] max-w-[360px] shrink-0 snap-start bg-white rounded-xl border transition-all duration-200 cursor-pointer flex flex-col justify-between p-4 group ${
                          isSelected
                            ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md bg-indigo-50/15'
                            : 'border-slate-200/90 hover:border-indigo-300 shadow-xs hover:shadow-md'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                                {tc.test_key}
                              </span>
                              {tc.related_requirement && (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                                  {tc.related_requirement}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Badge variant={getCategoryVariant(tc.category)} size="sm">
                                {tc.category}
                              </Badge>
                              <Badge variant={getPriorityVariant(tc.priority)} size="sm">
                                {tc.priority}
                              </Badge>
                            </div>
                          </div>

                          <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-1.5 leading-snug">
                            {tc.title}
                          </h4>

                          <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                            {tc.description}
                          </p>

                          <div className="space-y-1.5 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 text-[11px] mb-3">
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Automation:</span>
                              <span className="font-mono font-semibold text-slate-700 truncate max-w-[170px]">
                                {tc.automation_approach || 'Automated'}
                              </span>
                            </div>
                            {tc.preconditions && (
                              <div className="flex items-center justify-between text-slate-500">
                                <span>Preconditions:</span>
                                <span className="font-medium text-slate-700 truncate max-w-[170px]" title={tc.preconditions}>
                                  {tc.preconditions}
                                </span>
                              </div>
                            )}
                            <div className="flex items-center justify-between text-slate-500">
                              <span>Steps:</span>
                              <span className="font-semibold text-indigo-600">
                                {Array.isArray(tc.test_steps) ? `${tc.test_steps.length} Steps` : 'Detailed steps'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div
                          className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                              tc.execution_status === 'Passed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : tc.execution_status === 'Failed'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {tc.execution_status}
                          </span>

                          <button
                            onClick={() => setSelectedTest(tc)}
                            className="px-2.5 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded flex items-center gap-1 cursor-pointer transition-colors"
                            title="Inspect Test Case"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Inspect
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Test Detail Modal */}
      {selectedTest && (
        <Modal
          isOpen={!!selectedTest}
          onClose={() => setSelectedTest(null)}
          title={`${selectedTest.test_key}: ${selectedTest.title}`}
          maxWidth="2xl"
          footer={
            <div className="flex items-center justify-between w-full">
              <Button
                variant="danger"
                size="sm"
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                onClick={() => handleDelete(selectedTest.id)}
              >
                Delete Test
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Execution Status:</span>
                <select
                  value={selectedTest.execution_status}
                  onChange={(e) => handleStatusChange(selectedTest.id, e.target.value)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 cursor-pointer"
                >
                  <option value="Not Run">Not Run</option>
                  <option value="Passed">Passed</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>
          }
        >
          <div className="space-y-5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={getCategoryVariant(selectedTest.category)}>
                Category: {selectedTest.category}
              </Badge>
              <Badge variant={getPriorityVariant(selectedTest.priority)}>
                Priority: {selectedTest.priority}
              </Badge>
              <Badge variant="outline">Approach: {selectedTest.automation_approach}</Badge>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-1">Description</h4>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
                {selectedTest.description}
              </p>
            </div>

            {selectedTest.preconditions && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-1">Preconditions</h4>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {selectedTest.preconditions}
                </p>
              </div>
            )}

            {selectedTest.test_steps && selectedTest.test_steps.length > 0 && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-1.5">Test Steps</h4>
                <ol className="space-y-1.5">
                  {selectedTest.test_steps.map((step: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-800">
                      <span className="font-mono font-bold text-indigo-600">{idx + 1}.</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Input Data
                </span>
                <pre className="font-mono text-slate-700 whitespace-pre-wrap">{selectedTest.input_data || 'None specified'}</pre>
              </div>

              <div className="p-3 rounded-lg bg-emerald-50/60 border border-emerald-200">
                <span className="font-bold uppercase tracking-wider text-emerald-800 block mb-1">
                  Expected Result
                </span>
                <p className="text-emerald-950 font-medium leading-relaxed">{selectedTest.expected_result}</p>
              </div>
            </div>

            {selectedTest.execution_notes && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-1">Execution / Adaptation Notes</h4>
                <p className="text-slate-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-200/80 leading-relaxed">
                  {selectedTest.execution_notes}
                </p>
              </div>
            )}

            {selectedTest.test_code_snippet && (
              <div>
                <h4 className="font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-indigo-600" />
                  Suggested Test Code Snippet
                </h4>
                <CodeBlock
                  code={selectedTest.test_code_snippet}
                  language="python"
                  filename="test_case.py"
                />
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
