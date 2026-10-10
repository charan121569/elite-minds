import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Sparkles,
  Download,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Clock,
  Code2,
  Search,
  Check,
} from 'lucide-react';
import { api } from '../services/api';
import { CodeReview } from '../types';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { CodeBlock } from '../components/ui/CodeBlock';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

export const CodeReviewPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProject } = useProject();
  const { success, error } = useToast();

  const [reviewsList, setReviewsList] = useState<CodeReview[]>([]);
  const [currentReview, setCurrentReview] = useState<CodeReview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [showSourceCode, setShowSourceCode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Findings Filter
  const [severityFilter, setSeverityFilter] = useState('');

  const fetchReviews = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const data = await api.getProjectReviews(activeProject.id);
      setReviewsList(data);
      if (data.length > 0) {
        // Default to newest review if current isn't in list
        if (!currentReview || !data.some((r) => r.id === currentReview.id)) {
          setCurrentReview(data[0]);
        }
      } else {
        setCurrentReview(null);
      }
    } catch (err: any) {
      error('Failed to Load Reviews', err.message);
      setReviewsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [activeProject?.id]);

  const generateMarkdownReport = (rev: CodeReview) => {
    const critCount = (rev.findings || []).filter((f) => f.severity.toLowerCase() === 'critical').length;
    const highCount = (rev.findings || []).filter((f) => f.severity.toLowerCase() === 'high').length;
    const medCount = (rev.findings || []).filter((f) => f.severity.toLowerCase() === 'medium').length;
    const lowCount = (rev.findings || []).filter((f) => ['low', 'informational'].includes(f.severity.toLowerCase())).length;
    const totalFindings = (rev.findings || []).length;
    const qualityScore = Math.max(20, 100 - (critCount * 25 + highCount * 15 + medCount * 5 + lowCount * 2));

    const lines = [
      `# AI Code Review & Quality Audit Report`,
      `**Elite Minds Autonomous Engineering Platform** | Generated: ${new Date(rev.created_at).toLocaleString()}`,
      ``,
      `## 1. Audit Overview & Metadata`,
      ``,
      `| Field | Value |`,
      `| :--- | :--- |`,
      `| **Target Component** | \`${rev.file_name || 'Source Code'}\` |`,
      `| **Language / Framework** | ${rev.language} / ${rev.framework || 'N/A'} |`,
      `| **Overall Assessment** | **${rev.overall_assessment}** |`,
      `| **Quality Health Rating** | **${qualityScore} / 100** |`,
      `| **Audit Focus Area** | ${rev.focus_area || 'Functional conformance, error handling, and security'} |`,
      `| **Verification Context** | ${rev.context_description || 'Automated QA & test case execution audit'} |`,
      ``,
      `## 2. Quality Metrics & Findings Summary`,
      ``,
      `| Severity Level | Detected Issues | Recommended Action |`,
      `| :--- | :--- | :--- |`,
      `| **CRITICAL** | ${critCount} | Immediate fix required prior to deployment |`,
      `| **HIGH** | ${highCount} | High priority fix before next release |`,
      `| **MEDIUM** | ${medCount} | Refactor or address in regular sprint |`,
      `| **LOW / INFO** | ${lowCount} | Best practice improvement / style note |`,
      `| **TOTAL FINDINGS** | **${totalFindings}** | Overall Quality Score: **${qualityScore}%** |`,
      ``,
      `## 3. Executive Summary`,
      rev.summary,
      ``,
      `## 4. Positive Observations & Conformance`,
    ];

    if (rev.positive_observations && rev.positive_observations.length > 0) {
      rev.positive_observations.forEach((obs) => lines.push(`- [x] ${obs}`));
    } else {
      lines.push(`- No specific positive observations noted.`);
    }

    lines.push(``, `## 5. Detailed Audit Findings & Root Cause Analysis`);
    if (rev.findings && rev.findings.length > 0) {
      rev.findings.forEach((f, idx) => {
        lines.push(`### ${idx + 1}. [${f.severity.toUpperCase()}] ${f.title}`);
        lines.push(`- **Category:** \`${f.category}\``);
        if (f.code_location) lines.push(`- **Code Location:** \`${f.code_location}\``);
        lines.push(`- **Impact & Business Risk:** ${f.impact_explanation}`);
        lines.push(`- **Root Cause Analysis:** ${f.description}`);
        lines.push(`- **Actionable Remediation:** ${f.recommended_fix}`);
        if (f.suggested_code) {
          lines.push(``, `**Suggested Remediation:**`, `\`\`\`${rev.language.toLowerCase()}`, f.suggested_code, `\`\`\``);
        }
        lines.push(``);
      });
    } else {
      lines.push(`✅ **No critical issues or bugs detected across tested components.**`);
    }

    lines.push(``, `## 6. Action Priorities & Remediation Roadmap`);
    if (rev.recommended_priorities && rev.recommended_priorities.length > 0) {
      rev.recommended_priorities.forEach((p, idx) => lines.push(`${idx + 1}. ${p}`));
    } else {
      lines.push(`- Maintain regular regression testing and test case synchronization.`);
    }

    if (rev.suggested_tests && rev.suggested_tests.length > 0) {
      lines.push(``, `## 7. Recommended Test Verifications`);
      rev.suggested_tests.forEach((st) => lines.push(`- \`[Verified]\` ${st}`));
    }

    if (rev.submitted_code) {
      lines.push(
        ``,
        `## 8. Evaluated Code Reference`,
        `<details>`,
        `<summary><b>Click to inspect evaluated ${rev.language} source implementation (${rev.submitted_code.split('\n').length} lines)</b></summary>`,
        ``,
        `\`\`\`${rev.language.toLowerCase()}`,
        rev.submitted_code,
        `\`\`\``,
        `</details>`
      );
    }

    lines.push(
      ``,
      `---`,
      `> **Audit Verification:** Generated automatically by Elite Minds AI Development Agent. Report ID: #${rev.id}.`
    );
    return lines.join('\n');
  };

  const handleExportMarkdown = async () => {
    if (!currentReview) return;
    setIsExporting(true);
    try {
      // Generate comprehensive client audit report with complete details and data
      let mdData = generateMarkdownReport(currentReview);

      // Verify if server has pre-rendered version
      try {
        const serverMd = await api.exportReviewMarkdown(currentReview.id);
        if (serverMd && serverMd.length > 100) {
          mdData = serverMd;
        }
      } catch {
        // use generated client report
      }

      const blob = new Blob([mdData], { type: 'text/markdown;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${(currentReview.file_name || 'code_review').replace(/\.[^/.]+$/, '')}_review_report.md`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      success('Exported Markdown', 'Complete audit report downloaded with all findings, root causes, metrics, and remediation details.');
    } catch (err: any) {
      error('Export Failed', err.message);
    } finally {
      setIsExporting(false);
    }
  };


  const getSeverityBadge = (sev: string) => {
    if (sev === 'Critical') return <Badge variant="danger">{sev}</Badge>;
    if (sev === 'High') return <Badge variant="warning">{sev}</Badge>;
    if (sev === 'Medium') return <Badge variant="info">{sev}</Badge>;
    return <Badge variant="default">{sev}</Badge>;
  };

  const filteredFindings = (currentReview?.findings || []).filter((f) => {
    if (!severityFilter) return true;
    return f.severity === severityFilter;
  });

  const filteredReviewsList = reviewsList.filter((r) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      (r.file_name && r.file_name.toLowerCase().includes(term)) ||
      r.summary.toLowerCase().includes(term) ||
      r.overall_assessment.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            AI Code Review & Quality Audit
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Automated quality, security, and logic audits generated directly from test case executions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<Code2 className="w-4 h-4 text-indigo-600" />}
            onClick={() => navigate('/test-cases')}
          >
            Test Case Generator
          </Button>

          {currentReview && (
            <Button
              variant="primary"
              leftIcon={<Download className="w-4 h-4" />}
              onClick={handleExportMarkdown}
              isLoading={isExporting}
            >
              Export Markdown
            </Button>
          )}
        </div>
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : reviewsList.length === 0 ? (
        <EmptyState
          icon={<ShieldAlert className="w-8 h-8 text-indigo-600" />}
          title="No Code Reviews Generated Yet"
          description="Submit and execute code in the Test Case Generator. The system will automatically adapt your tests and generate a complete architectural and security review directly here."
          actionText="Execute Code in Test Case Generator"
          onAction={() => navigate('/test-cases')}
        />
      ) : (
        <div className="space-y-6">
          {/* HORIZONTAL REVIEW BOXES STRIP */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900 tracking-wide">
                  Generated Code Reviews ({reviewsList.length})
                </h3>
                <span className="text-xs text-slate-400">Select a review box to inspect</span>
              </div>

              {/* Quick Search filter */}
              <div className="relative w-56">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Filter reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-7 pr-3 py-1 text-xs rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Horizontal Scrollable Row of Review Boxes */}
            <div className="flex items-stretch gap-4 overflow-x-auto pb-3 pt-1 dark-scroll snap-x">
              {filteredReviewsList.map((rev) => {
                const isSelected = currentReview?.id === rev.id;
                const isPositive =
                  rev.overall_assessment.includes('Production Ready') ||
                  rev.overall_assessment.includes('Good');
                const isAdapted = rev.overall_assessment.includes('Functional');

                return (
                  <div
                    key={rev.id}
                    onClick={() => setCurrentReview(rev)}
                    className={`min-w-[280px] max-w-[320px] shrink-0 p-4 rounded-xl border transition-all cursor-pointer text-xs snap-start flex flex-col justify-between ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-50/90 to-white border-indigo-600 shadow-md ring-2 ring-indigo-500/20'
                        : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs hover:bg-slate-50/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="font-mono font-bold text-slate-900 truncate text-xs flex items-center gap-1.5">
                          <FileCode className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          {rev.file_name || `Review #${rev.id}`}
                        </span>
                        {isSelected && (
                          <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0">
                            <Check className="w-2.5 h-2.5" />
                          </span>
                        )}
                      </div>

                      <div className="mb-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : isAdapted
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rev.overall_assessment}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed mb-3">
                        {rev.summary}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-2 border-t border-slate-100">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {new Date(rev.created_at).toLocaleDateString()}
                      </span>
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {rev.findings?.length || 0} findings • {rev.language}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACTIVE REVIEW CONTENT (Full Width) */}
          {currentReview && (
            <div className="space-y-6">
              {/* Review Overview Banner */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-indigo-400" />
                      {currentReview.file_name || `Code Review #${currentReview.id}`}
                    </h2>
                    <Badge
                      variant={
                        currentReview.overall_assessment.includes('Needs Work') ||
                        currentReview.overall_assessment.includes('Critical')
                          ? 'danger'
                          : currentReview.overall_assessment.includes('Functional')
                          ? 'info'
                          : 'success'
                      }
                    >
                      {currentReview.overall_assessment}
                    </Badge>
                  </div>
                  <p className="text-xs text-indigo-200">
                    Language: <span className="font-semibold text-white uppercase">{currentReview.language}</span> • Generated directly from test execution verification
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300 font-medium">Filter Severity:</span>
                    <select
                      value={severityFilter}
                      onChange={(e) => setSeverityFilter(e.target.value)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-700 bg-slate-800 text-slate-200 cursor-pointer focus:outline-none"
                    >
                      <option value="">All Severities ({currentReview.findings?.length || 0})</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Informational">Informational</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* HORIZONTAL TRI-COLUMN METRICS BOXES */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Box 1: Executive Summary */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-2 bg-slate-50/60 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      Executive Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 flex-1">
                    <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                      {currentReview.summary}
                    </p>
                  </CardContent>
                </Card>

                {/* Box 2: Positive Observations */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-2 bg-slate-50/60 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Positive Observations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 flex-1">
                    {currentReview.positive_observations && currentReview.positive_observations.length > 0 ? (
                      <ul className="space-y-1.5">
                        {currentReview.positive_observations.map((obs, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 flex items-start gap-1.5 bg-emerald-50/40 p-2 rounded-lg border border-emerald-100/70"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{obs}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No specific positive notes recorded.</span>
                    )}
                  </CardContent>
                </Card>

                {/* Box 3: Recommended Priorities */}
                <Card className="flex flex-col">
                  <CardHeader className="pb-2 bg-slate-50/60 border-b border-slate-100">
                    <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      Recommended Action Items
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 flex-1">
                    {currentReview.recommended_priorities && currentReview.recommended_priorities.length > 0 ? (
                      <ol className="space-y-1.5">
                        {currentReview.recommended_priorities.map((p, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-700 flex items-start gap-1.5 bg-slate-50 p-2 rounded-lg border border-slate-200"
                          >
                            <span className="font-bold text-indigo-600 font-mono">{idx + 1}.</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No action items required.</span>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* DETAILED FINDINGS BOXES (2-Column Horizontal Grid) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-indigo-600" />
                    Audit Findings & Remediations ({filteredFindings.length})
                  </h3>
                  <span className="text-xs text-slate-500">
                    Showing {filteredFindings.length} of {currentReview.findings?.length || 0}
                  </span>
                </div>

                {filteredFindings.length === 0 ? (
                  <div className="p-8 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No findings match the selected severity filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {filteredFindings.map((finding) => (
                      <Card
                        key={finding.id}
                        className={`flex flex-col justify-between border-l-4 shadow-xs ${
                          finding.severity === 'Critical'
                            ? 'border-l-rose-500'
                            : finding.severity === 'High'
                            ? 'border-l-amber-500'
                            : finding.severity === 'Medium'
                            ? 'border-l-indigo-500'
                            : 'border-l-slate-400'
                        }`}
                      >
                        <CardHeader className="py-3.5 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                {getSeverityBadge(finding.severity)}
                                <Badge variant="outline">{finding.category}</Badge>
                              </div>
                              <h4 className="text-sm font-bold text-slate-900 mt-2">{finding.title}</h4>
                              {finding.code_location && (
                                <span className="text-[11px] font-mono text-indigo-600 font-semibold block mt-0.5">
                                  {finding.code_location}
                                </span>
                              )}
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-2 text-xs flex-1">
                          <div className="p-2.5 rounded-lg bg-rose-50/60 border border-rose-100 text-rose-950">
                            <span className="font-bold block mb-0.5 text-rose-800 text-[11px] uppercase">
                              Impact:
                            </span>
                            <p className="leading-relaxed">{finding.impact_explanation}</p>
                          </div>

                          <div className="leading-relaxed text-slate-700">
                            <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1 text-[11px]">
                              Analysis:
                            </span>
                            <p>{finding.description}</p>
                          </div>

                          <div className="leading-relaxed text-slate-700">
                            <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1 text-[11px]">
                              Recommended Fix:
                            </span>
                            <p className="bg-slate-50 p-2 rounded border border-slate-200">
                              {finding.recommended_fix}
                            </p>
                          </div>

                          {finding.suggested_code && (
                            <div className="pt-2">
                              <span className="font-bold uppercase tracking-wider text-slate-500 block mb-1 text-[11px]">
                                Corrected Code Snippet:
                              </span>
                              <CodeBlock
                                code={finding.suggested_code}
                                language={currentReview.language.toLowerCase()}
                                filename="remediation_snippet"
                              />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* EVALUATED IMPLEMENTATION SOURCE CODE VIEWER (Full Width Collapsible) */}
              {currentReview.submitted_code && (
                <Card>
                  <CardHeader className="py-3 px-4 bg-slate-50/80 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowSourceCode(!showSourceCode)}
                      className="flex items-center justify-between w-full text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <FileCode className="w-4 h-4 text-indigo-600" />
                        Inspect Evaluated Source Code ({currentReview.file_name || 'source'})
                      </span>
                      {showSourceCode ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </CardHeader>
                  {showSourceCode && (
                    <CardContent className="p-4">
                      <CodeBlock
                        code={currentReview.submitted_code}
                        language={currentReview.language.toLowerCase()}
                        filename={currentReview.file_name || 'implemented_source.py'}
                      />
                    </CardContent>
                  )}
                </Card>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
