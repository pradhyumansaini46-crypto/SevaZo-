'use client';

import * as React from 'react';
import Link from 'next/link';
import { Lock, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AccessDisabledPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#E3FDF5] via-[#F6EFF8] to-[#FFE6FA] p-4 text-slate-900">
      <Card className="w-full max-w-md bg-white/95 backdrop-blur-xl border border-slate-200 shadow-[0_12px_45px_rgba(100,116,139,0.15)] rounded-2xl overflow-hidden text-center">
        <CardHeader className="space-y-2 pb-3">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 border border-slate-200 text-slate-600 shadow-2xs">
            <Lock className="h-8 w-8" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold tracking-tight text-slate-900 font-sans">
              Admin Access Disabled
            </CardTitle>
            <CardDescription className="text-xs text-slate-500 mt-1">
              This administrator profile has been disabled or deactivated by the platform owner.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-1">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs text-slate-600 space-y-1.5">
            <p className="font-semibold text-slate-800">Status Information:</p>
            <p>• Your role assignments have been revoked.</p>
            <p>• If you believe this is an error, contact your Organization Owner.</p>
          </div>

          <div className="space-y-2 pt-2 text-xs text-slate-600 text-left border-t border-slate-100">
            <p className="font-semibold text-slate-700">Contact Organization Administrator:</p>
            <p className="flex items-center gap-2">
              <Mail className="h-3.5 w-3.5 text-teal-700" />
              <span>owner@sevazo.com</span>
            </p>
          </div>

          <Button asChild variant="outline" className="w-full bg-white border-slate-200 text-xs">
            <Link href="/login" className="flex items-center justify-center gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Return to Login</span>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
