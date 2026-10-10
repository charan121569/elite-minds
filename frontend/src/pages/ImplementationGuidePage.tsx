import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Sparkles,
  Layers,
  FolderTree,
  Database,
  Network,
  Code2,
  ShieldCheck,
  Zap,
  Server,
  FileCode,
  Copy,
  Check,
  Terminal,
} from 'lucide-react';
import { api } from '../services/api';
import { ImplementationGuide } from '../types';
import { useProject } from '../context/ProjectContext';
import { useToast } from '../context/ToastContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { Textarea } from '../components/ui/Textarea';
import { CodeBlock } from '../components/ui/CodeBlock';
import { EmptyState } from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';

export const ImplementationGuidePage: React.FC = () => {
  const { activeProject } = useProject();
  const { success, error } = useToast();

  const [guides, setGuides] = useState<ImplementationGuide[]>([]);
  const [currentGuide, setCurrentGuide] = useState<ImplementationGuide | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customFocus, setCustomFocus] = useState('');
  const [useDemoMode, setUseDemoMode] = useState(false);
  const [activeTab, setActiveTab] = useState('architecture');

  const fetchGuides = async () => {
    if (!activeProject) return;
    setIsLoading(true);
    try {
      const data = await api.getProjectGuidance(activeProject.id);
      setGuides(data);
      if (data.length > 0) setCurrentGuide(data[0]);
    } catch (err: any) {
      error('Failed to Load Guidance', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, [activeProject?.id]);

  const handleGenerate = async () => {
    if (!activeProject) return;
    setIsGenerating(true);
    try {
      const guide = await api.generateGuidance({
        project_id: activeProject.id,
        custom_focus: customFocus.trim() || undefined,
        demo_mode: useDemoMode,
      });
      setCurrentGuide(guide);
      await fetchGuides();
      success('Guidance Generated', `Technical architecture guide saved to MySQL.`);
    } catch (err: any) {
      error('Generation Failed', err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const tabs = [
    { id: 'architecture', label: 'Architecture & Structure' },
    { id: 'api_specs', label: 'API Specifications', badge: currentGuide?.api_specifications?.length },
    { id: 'code_examples', label: 'Code Snippets', badge: currentGuide?.code_examples?.length },
    { id: 'schema', label: 'Database Schema & Models' },
    { id: 'security', label: 'Security & Ops' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Technical Implementation Guide
            <BookOpen className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Stack-specific blueprints, database schemas, REST contracts, and production code snippets.
          </p>
        </div>

        {activeProject && (
          <div className="flex items-center gap-2">
            <Button
              variant="primary"
              leftIcon={<Sparkles className="w-4 h-4" />}
              onClick={handleGenerate}
              isLoading={isGenerating}
            >
              Generate Blueprint
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <CardSkeleton />
      ) : !currentGuide ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title="No implementation guide generated yet"
          description={`Generate tailored implementation guidance for ${activeProject?.name || 'your project'} matching ${activeProject?.programming_language || 'TypeScript'} & ${activeProject?.framework || 'React'}.`}
          actionText="Generate Technical Guide"
          onAction={handleGenerate}
        />
      ) : (
        <Card>
          <CardHeader className="bg-slate-50/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-xl">{currentGuide.title}</CardTitle>
                <CardDescription>
                  Tailored for {activeProject?.programming_language} • {activeProject?.framework} • {activeProject?.database_preference}
                </CardDescription>
              </div>
              <Badge variant="purple">Stack Tailored</Badge>
            </div>

            <div className="mt-4">
              <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />
            </div>
          </CardHeader>

          <CardContent className="p-6">
            {/* Tab 1: Architecture & Structure */}
            {activeTab === 'architecture' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Architectural Overview
                  </h4>
                  <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                    {currentGuide.architecture_overview}
                  </p>
                </div>

                {currentGuide.directory_structure && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <FolderTree className="w-4 h-4 text-indigo-600" />
                      Recommended Directory Structure
                    </h4>
                    <CodeBlock
                      code={currentGuide.directory_structure}
                      language="text"
                      filename="project_tree.txt"
                    />
                  </div>
                )}

                {currentGuide.dependencies && currentGuide.dependencies.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      Core Dependencies & Libraries
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {currentGuide.dependencies.map((dep, idx) => (
                        <code
                          key={idx}
                          className="px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-800"
                        >
                          {dep}
                        </code>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: API Specifications */}
            {activeTab === 'api_specs' && (
              <div className="space-y-4">
                {currentGuide.api_specifications && currentGuide.api_specifications.length > 0 ? (
                  currentGuide.api_specifications.map((api, idx) => {
                    const methodColors: Record<string, string> = {
                      GET: 'bg-blue-100 text-blue-700 border-blue-200',
                      POST: 'bg-emerald-100 text-emerald-700 border-emerald-200',
                      PUT: 'bg-amber-100 text-amber-700 border-amber-200',
                      DELETE: 'bg-rose-100 text-rose-700 border-rose-200',
                    };
                    const color = methodColors[api.method] || 'bg-slate-100 text-slate-700';

                    return (
                      <div key={idx} className="p-5 rounded-xl border border-slate-200 bg-white space-y-3">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-md border ${color}`}>
                            {api.method}
                          </span>
                          <span className="text-sm font-mono font-semibold text-slate-900">{api.endpoint}</span>
                        </div>

                        <p className="text-xs text-slate-600">{api.purpose}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-2">
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                            <span className="text-[10px] text-slate-400 font-sans block mb-1 font-semibold uppercase">
                              Request Body
                            </span>
                            <pre className="text-slate-800 whitespace-pre-wrap">{api.request_body || 'None'}</pre>
                          </div>
                          <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 font-mono">
                            <span className="text-[10px] text-slate-400 font-sans block mb-1 font-semibold uppercase">
                              Response Format
                            </span>
                            <pre className="text-slate-800 whitespace-pre-wrap">{api.response_format}</pre>
                          </div>
                        </div>

                        {api.validation_rules && api.validation_rules.length > 0 && (
                          <div className="pt-2 text-xs">
                            <span className="font-semibold text-slate-700 block mb-1">Validation Rules:</span>
                            <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                              {api.validation_rules.map((rule, rIdx) => (
                                <li key={rIdx}>{rule}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-xs text-slate-400 p-8">No API specifications defined.</div>
                )}
              </div>
            )}

            {/* Tab 3: Code Examples with Copy Buttons */}
            {activeTab === 'code_examples' && (
              <div className="space-y-6">
                {currentGuide.code_examples && currentGuide.code_examples.length > 0 ? (
                  currentGuide.code_examples.map((snippet, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{snippet.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{snippet.description}</p>
                        </div>
                      </div>
                      <CodeBlock
                        code={snippet.code}
                        language={snippet.language}
                        filename={snippet.filename}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center text-xs text-slate-400 p-8">No code examples generated.</div>
                )}
              </div>
            )}

            {/* Tab 4: Database Schema & Data Models */}
            {activeTab === 'schema' && (
              <div className="space-y-6">
                {currentGuide.database_schema && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <Database className="w-4 h-4 text-indigo-600" />
                      MySQL DDL Schema Definition
                    </h4>
                    <CodeBlock
                      code={currentGuide.database_schema}
                      language="sql"
                      filename="schema.sql"
                    />
                  </div>
                )}

                {currentGuide.data_models && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                      <FileCode className="w-4 h-4 text-indigo-600" />
                      ORM Data Models
                    </h4>
                    <CodeBlock
                      code={currentGuide.data_models}
                      language="python"
                      filename="models.py"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Tab 5: Security & Ops */}
            {activeTab === 'security' && (
              <div className="space-y-6">
                {currentGuide.security_recommendations && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-800 mb-2 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                      Security Recommendations
                    </h4>
                    <div className="space-y-2">
                      {currentGuide.security_recommendations.map((sec, i) => (
                        <div key={i} className="text-xs text-slate-800 p-3 rounded-lg bg-indigo-50/50 border border-indigo-100 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{sec}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentGuide.performance_considerations && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-amber-500" />
                      Performance Considerations
                    </h4>
                    <div className="space-y-2">
                      {currentGuide.performance_considerations.map((perf, i) => (
                        <div key={i} className="text-xs text-slate-800 p-3 rounded-lg bg-amber-50/40 border border-amber-200">
                          {perf}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {currentGuide.deployment_considerations && (
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                      <Server className="w-4 h-4 text-slate-600" />
                      Deployment & Containerization
                    </h4>
                    <div className="space-y-2">
                      {currentGuide.deployment_considerations.map((deploy, i) => (
                        <div key={i} className="text-xs text-slate-800 p-3 rounded-lg bg-slate-50 border border-slate-200">
                          {deploy}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
