import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Cpu, Sparkles, Lock, Mail, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    try {
      await login(email, password);
      success('Welcome Back!', 'Logged into your AI Dev Agent workspace.');
      navigate(from, { replace: true });
    } catch (err: any) {
      error('Login Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('developer@eliteminds.ai');
    setPassword('SecurePassword123!');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
      {/* Background Glow Accents */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-xl shadow-indigo-600/30 mb-4">
            <Cpu className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            AI Dev Agent
            <Sparkles className="w-4 h-4 text-indigo-400" />
          </h1>
          <p className="text-sm text-slate-400 mt-1.5">
            Elite Minds Hackathon • Autonomous Developer Workspace
          </p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Sign In</h2>
            <button
              type="button"
              onClick={handleDemoFill}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium underline underline-offset-4 cursor-pointer"
            >
              Fill Demo User
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Input
                label="Email Address"
                type="email"
                placeholder="developer@eliteminds.ai"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <Input
                label="Password"
                type="password"
                placeholder="••••••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Agent
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">
              Create account
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-500">
          Powered by Google Gemini 2.0 & MySQL 8.x
        </div>
      </div>
    </div>
  );
};
