import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthLayout } from '../layouts/AuthLayout';
import { login } from '../services/auth';
import { Mail, Lock, AlertCircle, Zap } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      localStorage.setItem('user_email', email);
      navigate('/dashboard');
    },
    onError: (err: any) => {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    loginMutation.mutate({ email, password });
  };

  return (
    <AuthLayout>
      <div className="animate-slide-up">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
            <Zap size={16} className="text-white fill-white" />
          </div>
          <span className="text-lg font-bold text-textMain">Chain<span className="gradient-text">Track</span></span>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Welcome back</h1>
          <p className="text-textMuted text-sm mt-1.5">Sign in to your workspace</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-danger/8 border border-danger/25 text-danger text-sm animate-slide-up">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <Input
            label="Email address"
            type="email"
            placeholder="you@company.com"
            value={email}
            icon={<Mail size={15} />}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            icon={<Lock size={15} />}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2"
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-textMuted">
          No account yet?{' '}
          <Link to="/signup" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
