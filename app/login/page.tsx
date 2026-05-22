'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';
import { validateLogin } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Mail, Lock } from 'lucide-react';
import { FleetIcon } from '@/components/icons/fleet-icon';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate credentials
    const user = validateLogin(email, password);

    if (user) {
      login(user);
      router.push('/dashboard');
    } else {
      setError('Invalid email or password');
      setPassword('');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="inline-flex items-center justify-center w-12 md:w-14 h-12 md:h-14 rounded-lg bg-primary mb-4">
            <div className="w-7 md:w-8 h-7 md:h-8 text-primary-foreground">
              <FleetIcon />
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Group 4 FVMS</h1>
          <p className="text-sm md:text-base text-muted-foreground">Fleet Vehicle Management System</p>
        </div>

        {/* Login Card */}
        <Card className="p-6 md:p-8 shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@group4fvms.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="pl-10"
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>

            {/* Demo Credentials */}
            <div className="border-t border-border pt-6">
              <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase">Demo Credentials</p>
              <div className="space-y-2 text-xs">
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <p className="text-secondary-foreground font-medium">Admin Account</p>
                  <p className="text-muted-foreground">admin@group4fvms.com</p>
                  <p className="text-muted-foreground">admin123</p>
                </div>
                <div className="bg-secondary/50 p-3 rounded-lg">
                  <p className="text-secondary-foreground font-medium">Fleet Manager</p>
                  <p className="text-muted-foreground">manager@group4fvms.com</p>
                  <p className="text-muted-foreground">manager123</p>
                </div>
              </div>
            </div>
          </form>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          © 2024 Group 4 FVMS. All rights reserved.
        </p>
      </div>
    </div>
  );
}
