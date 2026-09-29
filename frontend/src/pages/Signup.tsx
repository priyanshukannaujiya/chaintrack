import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthLayout } from '../layouts/AuthLayout';
import api from '../services/api';
import { Mail, Lock, Building2, AlertCircle, Zap } from 'lucide-react';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    company_name: '',
    role: 'ADMIN',
  });
  const [error, setError] = useState('');

  const signupMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await api.post('/auth/signup', data);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user_email', data.email);
      }
      return res.data;
    },
    onSuccess: () => navigate('/dashboard'),
    onError: (err: any) => setError(err.response?.data?.detail || 'Signup failed. Try again.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    signupMutation.mutate(formData);
  };

  const update = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

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
          <h1 className="text-2xl font-bold text-textMain tracking-tight">Create your workspace</h1>
          <p className="text-textMuted text-sm mt-1.5">Get started — it only takes a minute</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-danger/8 border border-danger/25 text-danger text-sm animate-slide-up">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Company name"
            placeholder="Acme Logistics Co."
            value={formData.company_name}
            icon={<Building2 size={15} />}
            onChange={update('company_name')}
            required
          />
          <Input
            label="Work email"
            type="email"
            placeholder="you@company.com"
            value={formData.email}
            icon={<Mail size={15} />}
            onChange={update('email')}
            required
            autoComplete="email"
          />
          <Input
            label="Password"
            type="password"
            placeholder="Min. 8 characters"
            value={formData.password}
            icon={<Lock size={15} />}
            onChange={update('password')}
            required
            hint="Use a strong, unique password"
          />

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2"
            disabled={signupMutation.isPending}
          >
            {signupMutation.isPending ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Creating workspace...
              </>
            ) : (
              'Create workspace'
            )}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-textMuted">
          Already have an account?{' '}
          <Link to="/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};
