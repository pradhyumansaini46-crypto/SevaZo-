'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  KeyRound,
  Mail,
  Lock,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  ShieldCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { setStoredSession } from '@/lib/auth-store';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<'EMAIL' | 'OTP' | 'NEW_PASSWORD' | 'SUCCESS'>('EMAIL');
  const [email, setEmail] = React.useState('');
  const [otp, setOtp] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered work email.');
      return;
    }
    setIsLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setStep('OTP');
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter the verification code sent to your email.');
      return;
    }
    setIsLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 600));
    setIsLoading(false);
    setStep('NEW_PASSWORD');
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters with letters, numbers, and symbols.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setIsLoading(true);
    setError('');
    await new Promise((r) => setTimeout(r, 800));

    // Force session revocation
    setStoredSession(null);
    setIsLoading(false);
    setStep('SUCCESS');
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3FDF5] via-[#F6EFF8] to-[#FFE6FA] p-4 text-slate-900">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_12px_45px_rgba(227,253,245,0.5)] rounded-2xl overflow-hidden">
        <CardHeader className="text-center space-y-2 pb-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 shadow-2xs">
            <KeyRound className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              {step === 'EMAIL' && 'Reset Admin Password'}
              {step === 'OTP' && 'Verify Email Code'}
              {step === 'NEW_PASSWORD' && 'Set New Strong Password'}
              {step === 'SUCCESS' && 'Password Reset Complete'}
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              {step === 'EMAIL' && 'Enter your verified work email to receive password recovery instructions'}
              {step === 'OTP' && `We sent a security verification code to ${email || 'your email'}`}
              {step === 'NEW_PASSWORD' && 'Create a compliant strong password for your administrator account'}
              {step === 'SUCCESS' && 'Your password has been updated. All active sessions have been revoked.'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700 text-center">
              {error}
            </div>
          )}

          {/* STEP 1: EMAIL */}
          {step === 'EMAIL' && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Work Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    placeholder="admin@sevazo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 bg-white/90 border-slate-200"
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#C026D3] text-white font-semibold shadow-md cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send Recovery Code
              </Button>
            </form>
          )}

          {/* STEP 2: OTP */}
          {step === 'OTP' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">6-Digit Verification Code *</label>
                <Input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="font-mono text-center tracking-widest text-lg bg-white/90 border-slate-200"
                  maxLength={6}
                  required
                />
                <p className="text-[11px] text-slate-400 text-center">Demo code: <span className="font-bold text-slate-600">123456</span></p>
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#C026D3] text-white font-semibold shadow-md cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Verify Code
              </Button>
            </form>
          )}

          {/* STEP 3: NEW PASSWORD */}
          {step === 'NEW_PASSWORD' && (
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">New Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pl-9 pr-10 bg-white/90 border-slate-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">Confirm Password *</label>
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/90 border-slate-200"
                  required
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 text-[11px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Password Policy Requirements:</p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Minimum 8 characters
                </p>
                <p className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> At least 1 number and 1 special symbol
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#C026D3] text-white font-semibold shadow-md cursor-pointer"
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Update Password & Revoke Sessions
              </Button>
            </form>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'SUCCESS' && (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <p className="text-xs text-slate-600">
                You can now log in securely using your new administrator credentials.
              </p>
              <Button
                type="button"
                onClick={() => router.push('/login')}
                className="w-full bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#C026D3] text-white font-semibold shadow-md cursor-pointer"
              >
                Go to Login Screen
              </Button>
            </div>
          )}

          {step !== 'SUCCESS' && (
            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3 w-3" />
                <span>Return to Login</span>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
