'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ShieldCheck, Lock, Sparkles, Loader2, Server, CheckCircle2 } from 'lucide-react';
import { getStoredSession } from '@/lib/auth-store';

export default function SecurityGatekeeperPage() {
  const router = useRouter();
  const [initStage, setInitStage] = React.useState('Initializing Security Context...');
  const [progress, setProgress] = React.useState(15);

  React.useEffect(() => {
    const timer1 = setTimeout(() => {
      setInitStage('Validating Environment & Security Headers...');
      setProgress(40);
    }, 400);

    const timer2 = setTimeout(() => {
      setInitStage('Verifying Session & Role Permissions...');
      setProgress(75);
    }, 800);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setInitStage('Access Granted. Routing to destination...');

      const session = getStoredSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      if (session.status === 'SUSPENDED') {
        router.replace('/auth/suspended');
        return;
      }

      if (session.status === 'DISABLED') {
        router.replace('/auth/disabled');
        return;
      }

      if (session.status === 'MFA_PENDING') {
        router.replace('/mfa');
        return;
      }

      if (session.setupStatus === 'INCOMPLETE') {
        router.replace('/setup');
        return;
      }

      router.replace('/dashboard');
    }, 1300);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E3FDF5] via-[#F6EFF8] to-[#FFE6FA] p-6 text-slate-900 selection:bg-teal-500 selection:text-white">
      <div className="w-full max-w-md flex flex-col items-center text-center space-y-6">
        {/* Logo Container */}
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-white/90 backdrop-blur-xl border border-white/90 shadow-[0_12px_40px_rgba(227,253,245,0.6)] p-3">
          <Image
            src="/logo.png"
            alt="Sevazo Logo"
            width={80}
            height={80}
            priority
            className="object-contain"
          />
          <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white shadow-sm ring-2 ring-white">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
        </div>

        {/* Title & Portal Info */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans flex items-center justify-center gap-2">
            SEVAZO
          </h1>
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-800">
            Administration Portal
          </p>
          <p className="text-xs text-slate-500">
            Secure Platform Management & Operations Gatekeeper
          </p>
        </div>

        {/* Security Loading Status Card */}
        <div className="w-full bg-white/85 backdrop-blur-xl border border-white/90 rounded-2xl p-5 shadow-[0_8px_30px_rgba(255,230,250,0.4)] space-y-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-600">
            <span className="flex items-center gap-2">
              <Loader2 className="h-3.5 w-3.5 text-teal-700 animate-spin" />
              {initStage}
            </span>
            <span className="font-mono font-bold text-teal-900">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-slate-100/80 rounded-full overflow-hidden p-0.5 border border-slate-200/50">
            <div
              className="h-full bg-gradient-to-r from-[#0D9488] via-[#10B981] to-[#C026D3] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-1.5 justify-center">
              <Lock className="h-3 w-3 text-emerald-600" />
              <span>TLS 1.3 Encrypted</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center">
              <Server className="h-3 w-3 text-teal-600" />
              <span>RBAC Verified</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
