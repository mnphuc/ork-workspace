"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validation
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      setLoading(false);
      return;
    }

    if (!formData.email.trim()) {
      setError('Email is required');
      setLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Password is required');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch('/auth/register', {
        method: 'POST',
        skipAuth: true,
        body: {
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password
        }
      });

      if (response.message) {
        // Registration successful
        router.push('/login?message=Registration successful. Please login.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100">
            <span className="text-2xl">O</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('auth.register.title')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {t('auth.register.hasAccount')}{' '}
            <button
              onClick={() => router.push('/login')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              {t('auth.register.signIn')}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label={t('auth.register.fullName')}
              type="text"
              value={formData.fullName}
              onChange={(value) => setFormData(prev => ({ ...prev, fullName: value }))}
              placeholder="Enter your full name"
              required
            />
            
            <Input
              label={t('auth.register.email')}
              type="email"
              value={formData.email}
              onChange={(value) => setFormData(prev => ({ ...prev, email: value }))}
              placeholder="Enter your email"
              required
            />
            
            <Input
              label={t('auth.register.password')}
              type="password"
              value={formData.password}
              onChange={(value) => setFormData(prev => ({ ...prev, password: value }))}
              placeholder="Enter your password"
              required
            />
            
            <Input
              label={t('auth.register.confirmPassword')}
              type="password"
              value={formData.confirmPassword}
              onChange={(value) => setFormData(prev => ({ ...prev, confirmPassword: value }))}
              placeholder="Confirm your password"
              required
            />
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Registering...' : t('auth.register.registerButton')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
