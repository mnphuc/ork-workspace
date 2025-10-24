"use client";
import { useState, useEffect } from 'react';
import { login, register } from '@/lib/auth';
import { setTokens, clearTokens } from '@/lib/api';
import { useTranslation } from 'react-i18next';

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (isLogin) {
        const tokens = await login(email, password);
        setTokens(tokens.access_token, tokens.refresh_token);
        window.location.href = '/dashboard';
      } else {
        await register(email, password, name);
        setIsLogin(true);
        setError(t('auth.messages.registerSuccess'));
      }
    } catch (err: any) {
      setError(err.message || t('messages.error.general'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
            <span className="text-white font-bold text-xl">O</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">OKR Management</h1>
          <p className="mt-2 text-gray-600">{isLogin ? t('auth.login.title') : t('auth.register.title')}</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <form className="space-y-4 sm:space-y-6" onSubmit={onSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.register.fullName')}</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('auth.register.fullName')}
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.login.email')}</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.login.email')}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('auth.login.password')}</label>
              <input
                className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={t('auth.login.password')}
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium min-h-[44px]"
            >
              {loading ? t('common.loading') : (isLogin ? t('auth.login.loginButton') : t('auth.register.registerButton'))}
            </button>
            
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                {isLogin ? t('auth.login.noAccount') + ' ' + t('auth.login.signUp') : t('auth.register.hasAccount') + ' ' + t('auth.register.signIn')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}