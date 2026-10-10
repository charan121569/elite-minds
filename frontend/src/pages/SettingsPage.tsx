import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Database, Cpu, User, ShieldCheck, RefreshCw } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { HealthStatus } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const data = await api.getHealth();
      setHealth(data);
      success('System Diagnostic', 'Health check queried successfully.');
    } catch (err: any) {
      error('Health Check Failed', err.message);
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            Workspace Settings & System Health
            <SettingsIcon className="w-5 h-5 text-indigo-600" />
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            System configuration, database connectivity, and AI provider runtime parameters.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          leftIcon={<RefreshCw className="w-3.5 h-3.5 text-slate-600" />}
          onClick={checkHealth}
          isLoading={isChecking}
        >
          Refresh Status
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Profile Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-600" />
              <CardTitle>User Profile</CardTitle>
            </div>
            <CardDescription>Authenticated developer credentials and permissions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Full Name</span>
              <span className="font-semibold text-slate-900">{user?.full_name}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Email Address</span>
              <span className="font-mono font-medium text-slate-900">{user?.email}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Account Status</span>
              <Badge variant="success" size="sm">
                Active & Authorized
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 text-xs">
              <span className="text-slate-500">Password Hashing</span>
              <Badge variant="outline" size="sm">
                Argon2id (Salted)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Database & System Diagnostic Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-indigo-600" />
              <CardTitle>MySQL Database Connectivity</CardTitle>
            </div>
            <CardDescription>Primary storage engine and migration status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">MySQL Connection Status</span>
              <Badge variant={health?.database_connected ? 'success' : 'danger'} size="sm">
                {health?.database_connected ? 'Connected' : 'Disconnected'}
              </Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">Target Database</span>
              <span className="font-mono font-semibold text-slate-900">ai_dev_agent</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 text-xs">
              <span className="text-slate-500">ORM & Drivers</span>
              <span className="font-medium text-slate-700">SQLAlchemy 2.0 • PyMySQL • Alembic</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
              <span className="font-bold block text-slate-700 mb-0.5">Connection Message:</span>
              <p className="font-mono text-[11px]">{health?.database_message || 'Checking status...'}</p>
            </div>
          </CardContent>
        </Card>

        {/* AI Provider Runtime Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-indigo-600" />
              <CardTitle>AI Provider Integration</CardTitle>
            </div>
            <CardDescription>Model hyperparameters and fail-safe demo adapter</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">AI Provider</span>
                <span className="text-sm font-bold text-slate-900 uppercase mt-1 block">
                  {health?.ai_provider || 'gemini'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Model Target</span>
                <span className="text-sm font-mono font-bold text-slate-900 mt-1 block">
                  {health?.ai_model || 'gemini-2.0-flash'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block">Runtime Mode</span>
                <span className="text-sm font-bold mt-1 block text-indigo-700">
                  {health?.ai_configured ? 'Live Gemini 2.0' : 'High-Fidelity Demo Fixture'}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              <h4 className="font-bold text-slate-800 mb-1">Configuring Live Gemini Credentials:</h4>
              <p>
                Add your Gemini API Key in <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">backend/.env</code> as{' '}
                <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-900 font-mono">GEMINI_API_KEY=your_key_here</code> and restart the backend. The application automatically detects your key and promotes the badge from Demo to Live mode.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
