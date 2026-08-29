'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, KeyRound, ArrowLeft, Loader2, Smartphone, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getStoredSession, setStoredSession } from '@/lib/auth-store';

export default function MfaPage() {
  const router = useRouter();
  const [digits, setDigits] = React.useState<string[]>(['', '', '', '', '', '']);
  const [useRecoveryCode, setUseRecoveryCode] = React.useState(false);
  const [recoveryCode, setRecoveryCode] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    inputRefs.current[0]?.focus();
  }, [useRecoveryCode]);

  function handleDigitChange(index: number, value: string) {
    if (value.length > 1) {
      // Handle paste of whole OTP
      const pasted = value.slice(0, 6).split('');
      const newDigits = [...digits];
      pasted.forEach((char, i) => {
        newDigits[i] = char;
      });
      setDigits(newDigits);
      inputRefs.current[Math.min(pasted.length, 5)]?.focus();
      return;
    }

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    // Auto advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleVerify() {
    setIsLoading(true);
    setError('');

    const session = getStoredSession();

    if (!session) {
      router.replace('/login');
      return;
    }

    await new Promise((resolve) => setTimeout(resolve, 600));

    const code = digits.join('');
    const isValidTotp = code === '123456' || code.length === 6;
    const isValidRecovery = recoveryCode.length >= 8;

    if ((!useRecoveryCode && isValidTotp) || (useRecoveryCode && isValidRecovery)) {
      // Update session status to ACTIVE
      const updatedSession = { ...session, status: 'ACTIVE' as const };
      setStoredSession(updatedSession);

      if (session.setupStatus === 'INCOMPLETE') {
        router.push('/setup');
      } else {
        router.push('/dashboard');
      }
    } else {
      setError(useRecoveryCode ? 'Invalid recovery backup code.' : 'Invalid 6-digit MFA code. (Try 123456)');
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3FDF5] via-[#F6EFF8] to-[#FFE6FA] p-4 text-slate-900">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_12px_45px_rgba(227,253,245,0.5)] rounded-2xl overflow-hidden">
        <CardHeader className="text-center space-y-2 pb-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 shadow-2xs">
            <Smartphone className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              Two-Step Verification
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              {useRecoveryCode
                ? 'Enter one of your emergency 8-character backup recovery codes'
                : 'Enter the 6-digit verification code from your authenticator app'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-medium text-rose-700 text-center">
              {error}
            </div>
          )}

          {!useRecoveryCode ? (
            <div className="space-y-4">
              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {digits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    className="h-12 w-11 sm:h-14 sm:w-13 text-center text-xl font-bold font-mono rounded-xl border border-slate-200 bg-white/90 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 focus:outline-none transition-all shadow-2xs text-slate-900"
                  />
                ))}
              </div>

              <div className="flex items-center justify-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setDigits(['1', '2', '3', '4', '5', '6'])}
                  className="text-xs text-teal-700 hover:text-teal-900 hover:bg-teal-50"
                >
                  Quick Fill Demo Code (123456)
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="text-xs font-semibold text-slate-700">Backup Recovery Code *</label>
              <Input
                type="text"
                placeholder="XXXX-XXXX"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                className="font-mono text-center tracking-widest text-base h-11 bg-white/90 border-slate-200"
              />
              <p className="text-[11px] text-slate-400 text-center">
                Demo code: <span className="font-mono font-bold text-slate-600">8F2A-9K3L</span>
              </p>
            </div>
          )}

          <Button
            type="button"
            onClick={handleVerify}
            className="w-full h-10 bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#C026D3] hover:opacity-95 text-white font-semibold shadow-md transition-all cursor-pointer"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Verify & Continue
          </Button>

          <div className="pt-2 flex flex-col items-center gap-2 text-xs">
            <button
              type="button"
              onClick={() => setUseRecoveryCode(!useRecoveryCode)}
              className="text-slate-600 hover:text-teal-800 font-medium hover:underline flex items-center gap-1.5"
            >
              <KeyRound className="h-3.5 w-3.5" />
              <span>{useRecoveryCode ? 'Use Authenticator App Code' : 'Use recovery code instead'}</span>
            </button>

            <button
              type="button"
              onClick={() => router.push('/login')}
              className="text-slate-400 hover:text-slate-600 flex items-center gap-1 mt-1"
            >
              <ArrowLeft className="h-3 w-3" />
              <span>Back to Login</span>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
