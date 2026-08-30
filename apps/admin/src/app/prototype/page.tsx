'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  FileText,
  Lock,
  ArrowRight,
  RefreshCw,
  Eye,
  Check,
  X,
  Smartphone,
  Laptop,
  Columns,
  Sparkles,
  AlertTriangle,
  LogOut,
  Package,
} from 'lucide-react';

// ==========================================
// 1. MOCK DATABASE (Shared Simulated State)
// ==========================================
interface DocumentItem {
  id: string;
  name: string;
  category: string;
  docId: string;
  status: 'Attached & Valid';
}

interface ApplicationData {
  id: string;
  name: string;
  mobile: string;
  email: string;
  vehicle: string;
  zone: string;
  isVerified: boolean;
  submittedAt: string;
  documents: DocumentItem[];
}

const DEFAULT_APPLICATION: ApplicationData = {
  id: 'SVZ-RID-98765',
  name: 'Rahul Sharma',
  mobile: '+91 98765 43210',
  email: 'rahul.sharma@sevazo.in',
  vehicle: 'Hero Splendor Plus (RJ 14 AB 1234)',
  zone: 'Jaipur Central / Vaishali Nagar',
  isVerified: false,
  submittedAt: 'Today at 10:45 AM',
  documents: [
    {
      id: 'doc-1',
      name: 'ID Proof (Aadhaar Card)',
      category: 'Government KYC',
      docId: 'Doc ID: XXXX-8921',
      status: 'Attached & Valid',
    },
    {
      id: 'doc-2',
      name: 'PAN Card',
      category: 'Tax & Identity',
      docId: 'Doc ID: XXXX-4321',
      status: 'Attached & Valid',
    },
    {
      id: 'doc-3',
      name: 'Driving License',
      category: 'Commercial DL',
      docId: 'Doc ID: XXXX-7654',
      status: 'Attached & Valid',
    },
    {
      id: 'doc-4',
      name: 'Vehicle RC',
      category: 'Registration Certificate',
      docId: 'Doc ID: XXXX-1234',
      status: 'Attached & Valid',
    },
  ],
};

export default function SevazoPrototypePage() {
  // Shared backend state connecting both flows
  const [mockDatabase, setMockDatabase] = useState<ApplicationData>(DEFAULT_APPLICATION);

  // Admin Modal UI state
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminActionFeedback, setAdminActionFeedback] = useState<string | null>(null);

  // Rider App UI state
  const [riderStep, setRiderStep] = useState<'LOGIN' | 'OTP' | 'DASHBOARD'>('LOGIN');
  const [riderMobileInput, setRiderMobileInput] = useState('');
  const [riderLoginError, setRiderLoginError] = useState<string | null>(null);
  const [otpValue, setOtpValue] = useState(['', '', '', '']);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Layout View: 'split' | 'admin' | 'rider'
  const [activeLayout, setActiveLayout] = useState<'split' | 'admin' | 'rider'>('split');

  // Helper: Normalize phone numbers for comparison
  const normalizePhone = (num: string) => {
    return num.replace(/\D/g, '').slice(-10);
  };

  // ----------------------------------------------------
  // Admin Action Handlers
  // ----------------------------------------------------
  const handleApprovePartner = () => {
    // CRITICAL: Update mock database state: isVerified -> true
    setMockDatabase((prev) => ({
      ...prev,
      isVerified: true,
    }));
    setIsAdminModalOpen(false);
    setAdminActionFeedback('Partner successfully approved & activated in database!');
    setTimeout(() => setAdminActionFeedback(null), 4000);
  };

  const handleRejectPartner = () => {
    setMockDatabase((prev) => ({
      ...prev,
      isVerified: false,
    }));
    setIsAdminModalOpen(false);
    setAdminActionFeedback('Application marked as rejected.');
    setTimeout(() => setAdminActionFeedback(null), 4000);
  };

  const handleResetDatabase = () => {
    setMockDatabase(DEFAULT_APPLICATION);
    setRiderStep('LOGIN');
    setRiderMobileInput('');
    setRiderLoginError(null);
    setOtpValue(['', '', '', '']);
    setOtpError(null);
    setAdminActionFeedback('Database reset: isVerified is now FALSE.');
    setTimeout(() => setAdminActionFeedback(null), 3000);
  };

  // ----------------------------------------------------
  // Rider App Action Handlers
  // ----------------------------------------------------
  const handleGetOtp = () => {
    setRiderLoginError(null);
    const enteredClean = normalizePhone(riderMobileInput);
    const dbClean = normalizePhone(mockDatabase.mobile);

    // FAIL STATE: If number doesn't exist, OR if isVerified is false:
    // Block login and display exact error: "Number is not existed in SevaZo"
    if (enteredClean !== dbClean || !mockDatabase.isVerified) {
      setRiderLoginError('Number is not existed in SevaZo');
      return;
    }

    // SUCCESS STATE: Number matches AND isVerified === true
    setRiderStep('OTP');
  };

  const handleVerifyOtp = () => {
    setOtpError(null);
    const enteredOtp = otpValue.join('');
    if (enteredOtp.length < 4) {
      setOtpError('Please enter the complete 4-digit OTP');
      return;
    }
    // Simulate successful login and redirect to Rider Dashboard
    setRiderStep('DASHBOARD');
  };

  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const updated = [...otpValue];
    updated[index] = val;
    setOtpValue(updated);
    if (otpError) setOtpError(null);

    // Auto-focus next box simulation
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Top Banner / System Controller */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-orange-600/30">
              S
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold tracking-tight text-white">SevaZo</h1>
                <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 font-medium border border-orange-500/30">
                  State-Driven Prototype
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Shared Mock Database connecting Admin Verification & Rider Login
              </p>
            </div>
          </div>

          {/* Real-time State Inspector Badge */}
          <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="text-xs">
              <span className="text-slate-400">Mock DB Status: </span>
              <span className="font-semibold text-slate-200">Rahul Sharma</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-mono">isVerified:</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold uppercase transition-all duration-300 flex items-center gap-1 ${
                  mockDatabase.isVerified
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm shadow-emerald-500/20'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {mockDatabase.isVerified ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> TRUE
                  </>
                ) : (
                  <>
                    <Lock className="w-3 h-3 text-amber-400" /> FALSE
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Controls: Reset DB & View Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleResetDatabase}
              className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-700"
              title="Reset state to isVerified: false"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset DB
            </button>

            <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveLayout('split')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeLayout === 'split'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Split Screen View"
              >
                <Columns className="w-3.5 h-3.5" />
                Split View
              </button>
              <button
                onClick={() => setActiveLayout('admin')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeLayout === 'admin'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Admin View Only"
              >
                <Laptop className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                onClick={() => setActiveLayout('rider')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1 ${
                  activeLayout === 'rider'
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Rider App Only"
              >
                <Smartphone className="w-3.5 h-3.5" />
                Rider App
              </button>
            </div>
          </div>
        </div>

        {/* Global Feedback Banner if action performed */}
        {adminActionFeedback && (
          <div className="mt-2 py-1.5 px-3 bg-emerald-950/80 border border-emerald-700/50 rounded-lg text-emerald-300 text-xs flex items-center justify-center gap-2 animate-fadeIn">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{adminActionFeedback}</span>
          </div>
        )}
      </header>

      {/* Interactive Step-by-Step Testing Guide */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2 text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
            <span>💡 How to Test:</span>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                1
              </span>
              <span>
                Enter mobile <code className="text-orange-400 font-mono">9876543210</code> in Rider
                App &amp; click &apos;Get OTP&apos; &rarr; Observe error:
                <strong className="text-rose-400 font-medium"> &quot;Number is not existed in SevaZo&quot;</strong>
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                2
              </span>
              <span>
                Open Admin Modal &amp; click{' '}
                <strong className="text-emerald-400 font-medium">&apos;Approve &amp; Activate Partner&apos;</strong>
              </span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-[10px]">
                3
              </span>
              <span>
                Click &apos;Get OTP&apos; again &rarr; Transition to OTP screen &amp; land on Rider Dashboard!
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 lg:p-6">
        <div
          className={`grid gap-6 ${
            activeLayout === 'split'
              ? 'grid-cols-1 lg:grid-cols-12'
              : 'grid-cols-1'
          }`}
        >
          {/* ============================================================ */}
          {/* LEFT SIDE: ADMIN PANEL & PARTNER VERIFICATION               */}
          {/* ============================================================ */}
          {(activeLayout === 'split' || activeLayout === 'admin') && (
            <div
              className={`${
                activeLayout === 'split' ? 'lg:col-span-7' : 'max-w-4xl mx-auto w-full'
              } space-y-4`}
            >
              {/* Admin Panel Header Card */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                      <Laptop className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        Admin Portal
                        <span className="text-xs font-normal text-slate-400">
                          (Partner Onboarding &amp; KYC)
                        </span>
                      </h2>
                      <p className="text-xs text-slate-400">
                        Review pending delivery partner applications and verify identity documents
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                    Live Sync
                  </span>
                </div>

                {/* Dynamically Pulled Application Card */}
                <div className="mt-5 bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold text-sm">
                        RS
                      </div>
                      <div>
                        {/* Dynamically pulled from mockDatabase */}
                        <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                          {mockDatabase.name}
                          <span className="text-[11px] font-mono text-slate-500 font-normal">
                            ({mockDatabase.id})
                          </span>
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">{mockDatabase.mobile}</p>
                      </div>
                    </div>

                    {/* Verification Status Pill */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full font-semibold flex items-center gap-1.5 ${
                          mockDatabase.isVerified
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {mockDatabase.isVerified ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            Verified &amp; Active
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                            Pending Verification
                          </>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Summary Details Grid - Dynamically Pulled */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70">
                      <span className="text-slate-400 block text-[11px]">Vehicle Assigned</span>
                      <span className="font-medium text-slate-200 truncate block mt-0.5">
                        {mockDatabase.vehicle}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70">
                      <span className="text-slate-400 block text-[11px]">Service Zone</span>
                      <span className="font-medium text-slate-200 truncate block mt-0.5">
                        {mockDatabase.zone}
                      </span>
                    </div>
                    <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/70 col-span-2 sm:col-span-1">
                      <span className="text-slate-400 block text-[11px]">Documents Attached</span>
                      <span className="font-medium text-emerald-400 flex items-center gap-1 mt-0.5">
                        <Check className="w-3.5 h-3.5" /> 4 Documents Ready
                      </span>
                    </div>
                  </div>

                  {/* Trigger Verification Modal Button */}
                  <div className="pt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-slate-400 italic">
                      Click below to open the official partner document verification dialog.
                    </p>
                    <button
                      onClick={() => setIsAdminModalOpen(true)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-600/20 transition-all flex items-center gap-2 whitespace-nowrap"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      Review Documents
                    </button>
                  </div>
                </div>
              </div>

              {/* State Inspector Card for Clarity */}
              <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-300 font-semibold">
                  <span>Simulated Database State (Live JSON)</span>
                  <span className="font-mono text-[10px] text-slate-500">React state: mockDatabase</span>
                </div>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
{JSON.stringify(
  {
    name: mockDatabase.name,
    mobile: mockDatabase.mobile,
    vehicle: mockDatabase.vehicle,
    zone: mockDatabase.zone,
    isVerified: mockDatabase.isVerified,
  },
  null,
  2
)}
                </pre>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* RIGHT SIDE: RIDER APP MOBILE-FIRST LOGIN & DASHBOARD         */}
          {/* ============================================================ */}
          {(activeLayout === 'split' || activeLayout === 'rider') && (
            <div
              className={`${
                activeLayout === 'split' ? 'lg:col-span-5' : 'max-w-md mx-auto w-full'
              } flex flex-col items-center`}
            >
              {/* Mobile Phone Mockup Container */}
              <div className="w-full max-w-[370px] bg-slate-900 border-4 border-slate-800 rounded-[38px] p-3 shadow-2xl shadow-black/80 relative">
                {/* Mobile Camera Notch */}
                <div className="w-32 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-slate-950" />
                  <div className="w-3 h-1 rounded-full bg-slate-950" />
                </div>

                {/* Mobile Screen Body */}
                <div className="bg-slate-950 rounded-[28px] border border-slate-800/80 min-h-[580px] p-5 flex flex-col justify-between overflow-hidden relative">
                  {/* Rider View 1: LOGIN SCREEN */}
                  {riderStep === 'LOGIN' && (
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        {/* Header Branding */}
                        <div className="text-center pt-2 pb-6">
                          <div className="w-14 h-14 rounded-2xl bg-orange-500/10 border border-orange-500/30 mx-auto flex items-center justify-center text-orange-500 shadow-md shadow-orange-500/20 mb-3">
                            <span className="text-2xl font-black">🚴</span>
                          </div>
                          <h3 className="text-xl font-extrabold text-white tracking-tight">
                            SevaZo <span className="text-orange-500">RIDER</span>
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Deliver smarter. Earn with SevaZo.
                          </p>
                        </div>

                        {/* Input Box Container */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-300">
                              Mobile Number *
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                setRiderMobileInput('9876543210');
                                setRiderLoginError(null);
                              }}
                              className="text-[11px] text-orange-400 hover:text-orange-300 font-medium underline"
                            >
                              Fill Rahul&apos;s No.
                            </button>
                          </div>

                          <div className="flex items-center bg-slate-950 border border-slate-700 rounded-xl overflow-hidden focus-within:border-orange-500 transition-colors">
                            <span className="px-3 py-2.5 text-xs font-bold text-slate-300 bg-slate-900 border-r border-slate-800">
                              🇮🇳 +91
                            </span>
                            <input
                              type="tel"
                              placeholder="98765 43210"
                              value={riderMobileInput}
                              onChange={(e) => {
                                setRiderMobileInput(e.target.value);
                                if (riderLoginError) setRiderLoginError(null);
                              }}
                              className="w-full bg-transparent px-3 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none font-semibold"
                            />
                          </div>

                          {/* EXACT FAIL STATE ERROR MESSAGE IN RED */}
                          {riderLoginError && (
                            <div className="text-xs text-rose-500 font-medium flex items-center gap-1.5 pt-1">
                              <XCircle className="w-3.5 h-3.5 shrink-0" />
                              <span>{riderLoginError}</span>
                            </div>
                          )}

                          <p className="text-[11px] text-slate-500 leading-tight">
                            Note: Registration requires approval from the Admin panel before you can
                            request an OTP.
                          </p>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="pt-6 space-y-3">
                        <button
                          onClick={handleGetOtp}
                          disabled={!riderMobileInput.trim()}
                          className="w-full py-3 rounded-xl bg-orange-600 hover:bg-orange-500 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-lg shadow-orange-600/30 transition-all flex items-center justify-center gap-2"
                        >
                          <span>Get OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        <div className="text-center">
                          <span className="text-[11px] text-slate-500 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                            Official SevaZo Partner Platform
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Rider View 2: ENTER OTP SCREEN */}
                  {riderStep === 'OTP' && (
                    <div className="flex-1 flex flex-col justify-between py-2">
                      <div>
                        {/* Back navigation */}
                        <button
                          onClick={() => setRiderStep('LOGIN')}
                          className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 mb-3"
                        >
                          &larr; Back to Login
                        </button>

                        <div className="text-center pt-2 pb-6">
                          <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 mx-auto flex items-center justify-center text-emerald-400 mb-2">
                            <Lock className="w-6 h-6" />
                          </div>
                          <h3 className="text-lg font-bold text-white">Enter OTP</h3>
                          <p className="text-xs text-slate-400 mt-1">
                            Code sent to <span className="text-slate-200 font-semibold">{mockDatabase.mobile}</span>
                          </p>
                        </div>

                        {/* OTP Boxes */}
                        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
                          <div className="flex justify-center gap-2.5">
                            {otpValue.map((digit, idx) => (
                              <input
                                key={idx}
                                id={`otp-input-${idx}`}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleOtpChange(idx, e.target.value)}
                                className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-700 focus:border-orange-500 text-white text-center text-lg font-bold focus:outline-none transition-all"
                              />
                            ))}
                          </div>

                          {otpError && (
                            <p className="text-xs text-rose-500 text-center font-medium">
                              {otpError}
                            </p>
                          )}

                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => setOtpValue(['1', '2', '3', '4'])}
                              className="text-[11px] text-orange-400 hover:text-orange-300 font-medium"
                            >
                              Auto-fill Demo Code (1234)
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Verify Button */}
                      <div className="pt-6 space-y-2">
                        <button
                          onClick={handleVerifyOtp}
                          className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          <span>Verify &amp; Proceed</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Rider View 3: RIDER MAIN DASHBOARD */}
                  {riderStep === 'DASHBOARD' && (
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div className="space-y-3.5">
                        {/* Top App Bar with Online Switch */}
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-xs font-bold text-white">
                              RS
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{mockDatabase.name}</h4>
                              <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Verified Partner
                              </p>
                            </div>
                          </div>

                          {/* Online Toggle */}
                          <button
                            onClick={() => setIsOnline(!isOnline)}
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 ${
                              isOnline
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}
                          >
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                              }`}
                            />
                            {isOnline ? 'ONLINE' : 'OFFLINE'}
                          </button>
                        </div>

                        {/* Earnings Card */}
                        <div className="bg-gradient-to-br from-orange-600 to-amber-600 rounded-2xl p-3.5 text-white shadow-lg shadow-orange-600/20">
                          <div className="flex items-center justify-between text-xs text-orange-100">
                            <span>Today&apos;s Earnings</span>
                            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-semibold">
                              4 Trips Done
                            </span>
                          </div>
                          <div className="text-2xl font-black mt-1">&#8377; 840.50</div>
                          <div className="mt-2 flex items-center justify-between text-[11px] text-orange-100/90 pt-2 border-t border-white/20">
                            <span>Active Zone: {mockDatabase.zone.split('/')[0]}</span>
                            <span className="font-semibold">4.9 &#9733;</span>
                          </div>
                        </div>

                        {/* Active Order Alert */}
                        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1">
                              <Package className="w-3.5 h-3.5" /> Order #SVZ-9821
                            </span>
                            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                              Pickup in 1.2 km
                            </span>
                          </div>
                          <p className="text-xs text-white font-medium">Haldiram Sweets &bull; Vaishali Nagar</p>
                          <div className="flex items-center justify-between text-[11px] text-slate-400">
                            <span>Delivery to: Civil Lines</span>
                            <span className="font-bold text-orange-400">&#8377; 85.00 Payout</span>
                          </div>
                        </div>

                        {/* Partner Details Card */}
                        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3 text-xs space-y-1.5">
                          <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">
                            Partner Profile Details
                          </div>
                          <div className="text-slate-300">
                            <span className="text-slate-500">Phone:</span> {mockDatabase.mobile}
                          </div>
                          <div className="text-slate-300 truncate">
                            <span className="text-slate-500">Vehicle:</span> {mockDatabase.vehicle}
                          </div>
                        </div>
                      </div>

                      {/* Log Out & Re-test Button */}
                      <div className="pt-3">
                        <button
                          onClick={() => {
                            setRiderStep('LOGIN');
                            setOtpValue(['', '', '', '']);
                          }}
                          className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5 text-slate-400" />
                          Log Out (Test Again)
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============================================================ */}
      {/* 2. ADMIN PANEL: PARTNER DOCUMENT VERIFICATION MODAL          */}
      {/* ============================================================ */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-orange-600/20 text-orange-500 border border-orange-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Partner Document Verification
                  </h3>
                  <p className="text-xs text-slate-400">
                    Application ID: <span className="font-mono text-slate-300">{mockDatabase.id}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdminModalOpen(false)}
                className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Dynamically Pulled Partner Info Card */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800 space-y-2.5">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Partner Information (Dynamically Pulled)
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-slate-500 block">Full Name:</span>
                    <span className="font-bold text-white text-sm">{mockDatabase.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Mobile Number:</span>
                    <span className="font-semibold text-slate-200 font-mono">
                      {mockDatabase.mobile}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Assigned Vehicle:</span>
                    <span className="font-semibold text-slate-200">{mockDatabase.vehicle}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Service Zone:</span>
                    <span className="font-semibold text-slate-200">{mockDatabase.zone}</span>
                  </div>
                </div>
              </div>

              {/* 4 Submitted Documents List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300">
                    Submitted KYC &amp; Vehicle Documents (4)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> All Verified by OCR
                  </span>
                </div>

                <div className="space-y-2">
                  {mockDatabase.documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
                          <FileText className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-white">{doc.name}</h4>
                          <p className="text-[11px] text-slate-400 font-mono">{doc.docId}</p>
                        </div>
                      </div>

                      {/* Required Green "Attached & Valid" Badge */}
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                        <Check className="w-3 h-3" />
                        <span>Attached &amp; Valid</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Action Buttons Footer */}
            <div className="px-5 py-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
              {/* Red Outlined "Reject Application" Button */}
              <button
                onClick={handleRejectPartner}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 border border-rose-500/40 hover:bg-rose-500/10 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <X className="w-3.5 h-3.5" />
                Reject Application
              </button>

              {/* Green Solid "Approve & Activate Partner" Button */}
              <button
                onClick={handleApprovePartner}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                Approve &amp; Activate Partner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
