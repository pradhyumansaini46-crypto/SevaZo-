'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Loader2,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Sparkles,
  UserCheck,
  Crown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { setStoredSession, AdminUser } from '@/lib/auth-store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid work email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberDevice: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState('');

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberDevice: true,
    },
  });

  async function handleLogin(userType: 'SUPER_ADMIN' | 'FIRST_TIME_OWNER' | 'CUSTOM', customValues?: LoginFormValues) {
    setIsLoading(true);
    setError('');

    // Simulate backend verification
    await new Promise((resolve) => setTimeout(resolve, 600));

    let sessionData: AdminUser;

    if (userType === 'SUPER_ADMIN' || (customValues?.email === 'admin@sevazo.com' && customValues?.password === 'Admin@123456')) {
      sessionData = {
        id: 'adm_super_01',
        firstName: 'Pradhyuman',
        lastName: 'Saini',
        email: 'admin@sevazo.com',
        phone: '+91 98765 43210',
        jobTitle: 'Super Administrator',
        role: 'SUPER_ADMIN',
        status: 'MFA_PENDING',
        setupStatus: 'COMPLETED',
        currentStep: 10,
      };
    } else if (userType === 'FIRST_TIME_OWNER' || (customValues?.email === 'owner@sevazo.com' && customValues?.password === 'Owner@123456')) {
      sessionData = {
        id: 'adm_owner_01',
        firstName: 'Pradhyuman',
        lastName: 'Saini',
        email: 'owner@sevazo.com',
        phone: '+91 98765 43210',
        jobTitle: 'Platform Owner',
        role: 'SUPER_ADMIN',
        status: 'MFA_PENDING',
        setupStatus: 'INCOMPLETE',
        currentStep: 1,
      };
    } else {
      setError('Invalid credentials. Use one of the demo buttons below or check your login details.');
      setIsLoading(false);
      return;
    }

    setStoredSession(sessionData);
    router.push('/mfa');
  }

  function onSubmit(values: LoginFormValues) {
    handleLogin('CUSTOM', values);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3FDF5] via-[#F6EFF8] to-[#FFE6FA] p-4 text-slate-900">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_12px_45px_rgba(227,253,245,0.5)] rounded-2xl overflow-hidden">
        <CardHeader className="text-center space-y-2 pb-3">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl overflow-hidden shadow-sm border border-white bg-white p-2">
            <Image
              src="/logo.png"
              alt="Sevazo Logo"
              width={75}
              height={75}
              priority
              className="object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight text-slate-900 font-sans">
              SEVAZO ADMIN
            </CardTitle>
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-800 mt-0.5">
              Platform Administration Portal
            </p>
          </div>
          <CardDescription className="text-xs text-slate-500">
            Sign in with your verified work credentials to access operations
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700">
              {error}
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3.5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-semibold text-slate-700">Work Email *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          type="email"
                          placeholder="owner@sevazo.com"
                          className="pl-9 bg-white/80 border-slate-200 focus-visible:ring-teal-500 text-sm h-10"
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-semibold text-slate-700">Password *</FormLabel>
                      <Link
                        href="/forgot-password"
                        className="text-xs font-medium text-teal-700 hover:text-teal-900 hover:underline"
                      >
                        Forgot Password?
                      </Link>
                    </div>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                        <Input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="••••••••"
                          className="pl-9 pr-10 bg-white/80 border-slate-200 focus-visible:ring-teal-500 text-sm h-10"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 h-3.5 w-3.5"
                  />
                  <span>Remember this device</span>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-10 bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#C026D3] hover:opacity-95 text-white font-semibold shadow-md transition-all cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Sign In to Portal
              </Button>
            </form>
          </Form>

          {/* Quick Demo Evaluation Switcher */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
              Quick One-Click Test Logins
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue('email', 'admin@sevazo.com');
                  form.setValue('password', 'Admin@123456');
                  handleLogin('SUPER_ADMIN');
                }}
                className="text-xs h-9 bg-white border-slate-200 hover:bg-slate-50 text-slate-700 flex items-center justify-center gap-1.5 shadow-2xs"
                disabled={isLoading}
              >
                <UserCheck className="h-3.5 w-3.5 text-teal-700" />
                <span>Super Admin</span>
              </Button>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  form.setValue('email', 'owner@sevazo.com');
                  form.setValue('password', 'Owner@123456');
                  handleLogin('FIRST_TIME_OWNER');
                }}
                className="text-xs h-9 bg-gradient-to-r from-[#E3FDF5]/50 to-[#FFE6FA]/50 border-teal-200/80 hover:bg-teal-50 text-teal-950 font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
                disabled={isLoading}
              >
                <Crown className="h-3.5 w-3.5 text-purple-700" />
                <span>First-Time Owner</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
