import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { AuthLayout } from '../layouts/AuthLayout';
import api from '../services/api';

export const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '', company_name: '', role: 'ADMIN' });
  const [error, setError] = useState('');

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await api.post('/auth/signup', data);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
      }
      return res.data;
    },
    onSuccess: () => navigate('/dashboard'),
    onError: (err: any) => setError(err.response?.data?.detail || 'Signup failed.'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    signupMutation.mutate(formData);
  };

  return (
    <AuthLayout>
      <Card className="animate-slide-up">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            Create Account
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <div className="p-3 bg-red-500/10 text-red-500 text-sm rounded-lg">{error}</div>}
          <Input 
            label="Company Name" 
            required 
            value={formData.company_name}
            onChange={(e) => setFormData({...formData, company_name: e.target.value})} 
          />
          <Input 
            label="Email" 
            type="email" 
            required 
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})} 
          />
          <Input 
            label="Password" 
            type="password" 
            required 
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})} 
          />
          <Button type="submit" className="w-full mt-4" disabled={signupMutation.isPending}>
            {signupMutation.isPending ? 'Creating...' : 'Sign Up'}
          </Button>
        </form>
        <div className="mt-6 text-center text-sm text-textMuted">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Sign in</Link>
        </div>
      </Card>
    </AuthLayout>
  );
};
