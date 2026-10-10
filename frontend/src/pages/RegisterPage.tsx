import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cpu, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    if (password !== confirmPassword) {
      error('Password Mismatch', 'Password and confirm password must match.');
      return;
    }

    if (password.length < 6) {
      error('Weak Password', 'Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(email, password, fullName);
      success('Account Created', 'Welcome to AI Dev Agent. Your workspace is ready.');
      navigate('/');
    } catch (err: any) {
      error('Registration Failed', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
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
          <p className="text-sm text-slate-400 mt-1.5">Create your developer productivity account</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl">
          <h2 className="text-lg font-semibold text-white mb-6">Create Account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="developer@company.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Minimum 6 characters"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-slate-950/80 border-slate-800 text-white placeholder:text-slate-500 focus:border-indigo-500"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Get Started
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-800/80 text-center text-xs text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold ml-1">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
