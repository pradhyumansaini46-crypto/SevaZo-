'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import {
  UserCheck,
  Building2,
  Palette,
  ShieldCheck,
  KeyRound,
  Globe2,
  MapPin,
  ShoppingBag,
  Percent,
  Receipt,
  Truck,
  Bike,
  Navigation,
  CreditCard,
  RotateCcw,
  Landmark,
  Bell,
  Send,
  Scale,
  Headphones,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Download,
  Copy,
  Plus,
  Trash2,
  Lock,
  Sparkles,
  Loader2,
  Crown,
  Clock,
  Edit,
  AlertCircle,
  FileCheck,
  Activity,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  getStoredPlatformConfig,
  setStoredPlatformConfig,
  getStoredSession,
  setStoredSession,
  PlatformConfig,
  PlatformLifecycle,
} from '@/lib/auth-store';
import { BrandingPreview } from '@/components/setup/branding-preview';
import {
  validateAllSections,
  testPaymentGatewayConnection,
  sendTestNotification,
  activatePlatformSystem,
} from '@/services/setup-service';

const STEPS = [
  { id: 1, title: 'Owner Profile', subtitle: 'Platform Founder & Super Admin', icon: Crown },
  { id: 2, title: 'Platform & Legal', subtitle: 'Company entity & contacts', icon: Building2 },
  { id: 3, title: 'Branding & Apps', subtitle: 'Brand colors & multi-app preview', icon: Palette },
  { id: 4, title: 'Security & Keys', subtitle: 'MFA, audit & 8 recovery codes', icon: ShieldCheck },
  { id: 5, title: 'Operating Region', subtitle: 'Country, currency & delivery zones', icon: Globe2 },
  { id: 6, title: 'Commerce & Tax', subtitle: 'Marketplace model, commissions, GST', icon: ShoppingBag },
  { id: 7, title: 'Logistics & Fleet', subtitle: 'Delivery pricing, vehicles & dispatch', icon: Truck },
  { id: 8, title: 'Finance & Payouts', subtitle: 'Payment gateways, refunds, payouts', icon: CreditCard },
  { id: 9, title: 'Notifications & Legal', subtitle: 'Alerts, terms, agreements & SLAs', icon: Bell },
  { id: 10, title: 'Business Hours', subtitle: 'Marketplace & logistics schedules', icon: Clock },
  { id: 11, title: 'Review & Activate', subtitle: 'Review all domains & launch platform', icon: FileCheck },
];

export default function OwnerSetupWizardPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [config, setConfig] = React.useState<PlatformConfig>(() => getStoredPlatformConfig());
  const [isCopied, setIsCopied] = React.useState(false);
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);
  const [lifecycleState, setLifecycleState] = React.useState<PlatformLifecycle>('SETUP');
  const [isActivating, setIsActivating] = React.useState(false);
  const [activationError, setActivationError] = React.useState('');

  // Interactive Test State
  const [gatewayTestResult, setGatewayTestResult] = React.useState<string | null>(null);
  const [isTestingGateway, setIsTestingGateway] = React.useState(false);
  const [notificationTestResult, setNotificationTestResult] = React.useState<string | null>(null);
  const [isTestingNotification, setIsTestingNotification] = React.useState(false);

  // New Zone State
  const [newZoneName, setNewZoneName] = React.useState('');
  const [newZonePostal, setNewZonePostal] = React.useState('');

  const validations = React.useMemo(() => validateAllSections(config), [config]);

  function updateConfig<K extends keyof PlatformConfig>(section: K, updates: Partial<PlatformConfig[K]>) {
    const updated = {
      ...config,
      [section]: {
        ...config[section],
        ...updates,
      },
    };
    setConfig(updated);
    setStoredPlatformConfig(updated);
  }

  function handleCopyCodes() {
    navigator.clipboard.writeText(config.security.recoveryCodes.join('\n'));
    setIsCopied(true);
    updateConfig('security', { codesDownloaded: true });
    setTimeout(() => setIsCopied(false), 2000);
  }

  function handleDownloadCodes() {
    const text = `SevaZo ADMINISTRATION RECOVERY CODES\nGenerated: ${new Date().toISOString()}\nOwner: ${config.owner.email}\n\n` +
      config.security.recoveryCodes.map((c, i) => `${i + 1}. ${c}`).join('\n') +
      `\n\nKEEP THESE RECOVERY CODES SECURE. EACH CODE CAN BE USED ONCE.`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sevazo-admin-recovery-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
    updateConfig('security', { codesDownloaded: true });
  }

  function handleAddZone() {
    if (!newZoneName) return;
    const newZone = {
      id: `zn-${Date.now()}`,
      name: newZoneName,
      postalCodes: newZonePostal || '302001',
      active: true,
    };
    updateConfig('region', {
      zones: [...config.region.zones, newZone],
    });
    setNewZoneName('');
    setNewZonePostal('');
  }

  function handleRemoveZone(id: string) {
    updateConfig('region', {
      zones: config.region.zones.filter((z) => z.id !== id),
    });
  }

  async function handleTestGateway() {
    setIsTestingGateway(true);
    setGatewayTestResult(null);
    const res = await testPaymentGatewayConnection('Razorpay (UPI / Cards)');
    setIsTestingGateway(false);
    setGatewayTestResult(`✓ ${res.message} (${res.latencyMs}ms latency)`);
  }

  async function handleTestNotification() {
    setIsTestingNotification(true);
    setNotificationTestResult(null);
    const res = await sendTestNotification('PUSH', config.owner.email);
    setIsTestingNotification(false);
    setNotificationTestResult(`✓ ${res.message}`);
  }

  async function executeActivation() {
    setIsActivating(true);
    setActivationError('');
    setLifecycleState('READY');

    try {
      await new Promise((r) => setTimeout(r, 800));
      setLifecycleState('ACTIVE');
      await activatePlatformSystem();
      await new Promise((r) => setTimeout(r, 800));
      router.push('/dashboard');
    } catch (err: unknown) {
      setActivationError((err as Error).message || 'Failed to activate platform.');
      setIsActivating(false);
      setLifecycleState('SETUP');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E3FDF5] via-[#F6EFF8] to-[#FFE6FA] p-4 sm:p-6 lg:p-8 text-slate-900 pb-20">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* TOP WIZARD HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/90 backdrop-blur-xl border border-white/90 p-4 sm:p-5 rounded-2xl shadow-[0_8px_30px_rgba(227,253,245,0.45)]">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-100 p-1.5 shadow-2xs flex items-center justify-center">
              <Image src="/logo.png" alt="SevaZo Logo" width={40} height={40} className="object-contain" priority />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 font-sans">SevaZo Administration Setup</h1>
                <Badge className="bg-gradient-to-r from-[#0D9488] to-[#C026D3] text-white text-[10px] font-semibold border-0">
                  Owner Control Plane
                </Badge>
              </div>
              <p className="text-xs text-slate-500">Configure your complete commerce & logistics ecosystem</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-900 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
              Step {currentStep} of 11
            </span>
          </div>
        </div>

        {/* STEP PROGRESS BAR & ICONS (Scrollable on phone) */}
        <div className="bg-white/80 backdrop-blur-md border border-white/90 p-3 rounded-2xl shadow-2xs overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-[850px] justify-between px-2">
            {STEPS.map((step) => {
              const isCompleted = step.id < currentStep;
              const isCurrent = step.id === currentStep;

              return (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setCurrentStep(step.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] text-teal-950 font-bold shadow-2xs border border-white/90'
                      : isCompleted
                      ? 'text-teal-700 bg-teal-50/70 hover:bg-teal-100/60'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div
                    className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-teal-700 text-white'
                        : isCompleted
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.id}
                  </div>
                  <span className="whitespace-nowrap">{step.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* MAIN STEP CONTENT CARD */}
        <Card className="bg-white/95 backdrop-blur-xl border border-white/90 shadow-[0_12px_45px_rgba(227,253,245,0.45)] rounded-2xl overflow-hidden min-w-0">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] border border-white/80 flex items-center justify-center shadow-2xs">
                {React.createElement(STEPS[currentStep - 1].icon, { className: 'h-5 w-5 text-teal-800' })}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 font-sans">
                  {STEPS[currentStep - 1].title}
                </CardTitle>
                <CardDescription className="text-xs text-slate-500">
                  {STEPS[currentStep - 1].subtitle}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* STEP 1: OWNER PROFILE */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-2.5">
                  <ShieldCheck className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Root Master Authority</p>
                    <p>
                      The platform founder account is permanently assigned <span className="font-mono font-bold">SUPER_ADMIN</span>. This account holds master governance over all sub-admins, roles, and financial policies.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">First Name *</label>
                    <Input
                      value={config.owner.firstName}
                      onChange={(e) => updateConfig('owner', { firstName: e.target.value })}
                      placeholder="Pradhyuman"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Last Name *</label>
                    <Input
                      value={config.owner.lastName}
                      onChange={(e) => updateConfig('owner', { lastName: e.target.value })}
                      placeholder="Saini"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Work Email *</label>
                    <Input
                      type="email"
                      value={config.owner.email}
                      onChange={(e) => updateConfig('owner', { email: e.target.value })}
                      placeholder="owner@sevazo.com"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Phone Number *</label>
                    <Input
                      value={config.owner.phone}
                      onChange={(e) => updateConfig('owner', { phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Job Title</label>
                    <Input
                      value={config.owner.jobTitle}
                      onChange={(e) => updateConfig('owner', { jobTitle: e.target.value })}
                      placeholder="Founder & Chief Executive"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Privilege Level</label>
                    <Input
                      value="SUPER_ADMIN (Root Control Plane)"
                      disabled
                      className="bg-slate-100 border-slate-200 text-slate-500 font-mono text-xs cursor-not-allowed font-semibold"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: PLATFORM & LEGAL */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                  Legal entity records and corporate identifiers are segregated from individual user accounts for institutional compliance.
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Platform Brand Name *</label>
                    <Input
                      value={config.platform.name}
                      onChange={(e) => updateConfig('platform', { name: e.target.value })}
                      placeholder="SevaZo"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Legal Business Entity Name *</label>
                    <Input
                      value={config.platform.legalName}
                      onChange={(e) => updateConfig('platform', { legalName: e.target.value })}
                      placeholder="SevaZo Technologies Private Limited"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Official Business Email *</label>
                    <Input
                      type="email"
                      value={config.platform.businessEmail}
                      onChange={(e) => updateConfig('platform', { businessEmail: e.target.value })}
                      placeholder="contact@sevazo.com"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Official Support Email *</label>
                    <Input
                      type="email"
                      value={config.platform.supportEmail}
                      onChange={(e) => updateConfig('platform', { supportEmail: e.target.value })}
                      placeholder="support@sevazo.com"
                      className="bg-white border-slate-200"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Corporate CIN / Reg Number</label>
                    <Input
                      value={config.platform.cinNumber}
                      onChange={(e) => updateConfig('platform', { cinNumber: e.target.value })}
                      placeholder="U72900RJ2026PTC089123"
                      className="bg-white border-slate-200 font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">GSTIN / Tax Registration ID</label>
                    <Input
                      value={config.platform.gstinNumber}
                      onChange={(e) => updateConfig('platform', { gstinNumber: e.target.value })}
                      placeholder="08AAACS1234F1Z5"
                      className="bg-white border-slate-200 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: BRANDING & APPS */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Primary Brand Color (Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.branding.primaryColor}
                        onChange={(e) => updateConfig('branding', { primaryColor: e.target.value })}
                        className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                      />
                      <Input
                        value={config.branding.primaryColor}
                        onChange={(e) => updateConfig('branding', { primaryColor: e.target.value })}
                        className="bg-white font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Secondary Accent Color (Hex)</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={config.branding.secondaryColor}
                        onChange={(e) => updateConfig('branding', { secondaryColor: e.target.value })}
                        className="h-10 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5 bg-white"
                      />
                      <Input
                        value={config.branding.secondaryColor}
                        onChange={(e) => updateConfig('branding', { secondaryColor: e.target.value })}
                        className="bg-white font-mono text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Live Multi-App Preview */}
                <div className="pt-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Live Multi-App Branding Simulation
                  </h3>
                  <BrandingPreview
                    primaryColor={config.branding.primaryColor}
                    secondaryColor={config.branding.secondaryColor}
                    platformName={config.platform.name}
                  />
                </div>
              </div>
            )}

            {/* STEP 4: SECURITY & KEYS (PROMPT 06) */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">MFA Policy</span>
                      <Badge className="bg-emerald-600 text-white text-[9px]">ENFORCED</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">Required for Super Admin and all operational staff.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Session Lock</span>
                      <span className="text-xs font-mono font-bold text-teal-800">30 Mins</span>
                    </div>
                    <p className="text-[11px] text-slate-500">Auto-lock idle admin terminals.</p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Audit Logging</span>
                      <Badge className="bg-teal-700 text-white text-[9px]">ENABLED</Badge>
                    </div>
                    <p className="text-[11px] text-slate-500">Request IDs & state transformation diffs tracked.</p>
                  </div>
                </div>

                {/* RECOVERY CODES VAULT */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-[#E3FDF5]/50 to-[#FFE6FA]/50 border border-teal-200/80 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <KeyRound className="h-4 w-4 text-teal-700" />
                        8 Emergency Backup Recovery Codes
                      </h4>
                      <p className="text-xs text-slate-500">
                        Store these single-use recovery codes offline in your password manager.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleCopyCodes}
                        className="text-xs h-8 bg-white border-slate-200"
                      >
                        <Copy className="h-3.5 w-3.5 mr-1" />
                        {isCopied ? 'Copied!' : 'Copy'}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        onClick={handleDownloadCodes}
                        className="text-xs h-8 bg-teal-700 hover:bg-teal-800 text-white"
                      >
                        <Download className="h-3.5 w-3.5 mr-1" />
                        Download .TXT
                      </Button>
                    </div>
                  </div>

                  {/* 8 Codes Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                    {config.security.recoveryCodes.map((code, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-white/95 rounded-xl border border-slate-200/80 text-center font-mono font-bold text-xs tracking-wider text-slate-800 shadow-2xs"
                      >
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: OPERATING REGION (PROMPT 07) */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Country</label>
                    <Input value={config.region.country} disabled className="bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Currency & Symbol</label>
                    <Input value="INR (₹)" disabled className="bg-slate-50 border-slate-200" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Operating Timezone</label>
                    <Input value="Asia/Kolkata (IST)" disabled className="bg-slate-50 border-slate-200" />
                  </div>
                </div>

                {/* Service Area Zones */}
                <div className="space-y-3 pt-2">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Active Delivery Zones in {config.region.primaryCity} ({config.region.zones.length})
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {config.region.zones.map((zone) => (
                      <div
                        key={zone.id}
                        className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <MapPin className="h-4 w-4 text-teal-700 shrink-0" />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{zone.name}</p>
                            <p className="text-[11px] text-slate-500 font-mono">PIN: {zone.postalCodes}</p>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveZone(zone.id)}
                          className="h-7 w-7 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>

                  {/* Add New Zone */}
                  <div className="flex flex-col sm:flex-row items-center gap-2 pt-2">
                    <Input
                      placeholder="e.g. C-Scheme / Civil Lines Zone"
                      value={newZoneName}
                      onChange={(e) => setNewZoneName(e.target.value)}
                      className="bg-white border-slate-200 text-xs h-9"
                    />
                    <Input
                      placeholder="PIN code (e.g. 302006)"
                      value={newZonePostal}
                      onChange={(e) => setNewZonePostal(e.target.value)}
                      className="bg-white border-slate-200 text-xs h-9 sm:w-44"
                    />
                    <Button
                      type="button"
                      onClick={handleAddZone}
                      className="w-full sm:w-auto h-9 bg-teal-700 hover:bg-teal-800 text-white text-xs whitespace-nowrap cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1" /> Add Zone
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: COMMERCE & TAX (PROMPT 08) */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Marketplace Model</label>
                    <Input value={config.commerce.marketplaceModel} disabled className="bg-slate-50 border-slate-200 font-medium" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Minimum Order Basket Value (₹)</label>
                    <Input
                      type="number"
                      value={config.commerce.minOrderValue}
                      onChange={(e) => updateConfig('commerce', { minOrderValue: Number(e.target.value) })}
                      className="bg-white border-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Commission Hierarchy Rules */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Commission Rule Hierarchy
                    </h4>
                    <span className="text-[11px] text-slate-400 font-mono">Product → Vendor → Category → Default</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <p className="text-xs font-bold text-slate-700">Platform Default</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.commerce.defaultCommissionRate}
                          onChange={(e) => updateConfig('commerce', { defaultCommissionRate: Number(e.target.value) })}
                          className="bg-white border-slate-200 font-bold text-sm h-8"
                        />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <p className="text-xs font-bold text-slate-700">Food & Grocery</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.commerce.foodCommissionRate}
                          onChange={(e) => updateConfig('commerce', { foodCommissionRate: Number(e.target.value) })}
                          className="bg-white border-slate-200 font-bold text-sm h-8"
                        />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                      <p className="text-xs font-bold text-slate-700">Electronics & Devices</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={config.commerce.electronicsCommissionRate}
                          onChange={(e) => updateConfig('commerce', { electronicsCommissionRate: Number(e.target.value) })}
                          className="bg-white border-slate-200 font-bold text-sm h-8"
                        />
                        <span className="text-xs font-bold text-slate-500">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 7: LOGISTICS & FLEET (PROMPT 09 & 10) */}
            {currentStep === 7 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Base Delivery Fee (₹)</label>
                    <Input
                      type="number"
                      value={config.logistics.baseDeliveryFee}
                      onChange={(e) => updateConfig('logistics', { baseDeliveryFee: Number(e.target.value) })}
                      className="bg-white border-slate-200 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Distance Fee (₹ / KM)</label>
                    <Input
                      type="number"
                      value={config.logistics.perKmDistanceFee}
                      onChange={(e) => updateConfig('logistics', { perKmDistanceFee: Number(e.target.value) })}
                      className="bg-white border-slate-200 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">Free Delivery Over (₹)</label>
                    <Input
                      type="number"
                      value={config.logistics.freeDeliveryThreshold}
                      onChange={(e) => updateConfig('logistics', { freeDeliveryThreshold: Number(e.target.value) })}
                      className="bg-white border-slate-200 font-mono"
                    />
                  </div>
                </div>

                {/* Allowed Vehicle Types (Prompt 10) */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Allowed Rider Vehicle Types</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {['Motorcycle', 'Scooter', 'Electric Vehicle', 'Bicycle'].map((vehicle) => (
                      <div
                        key={vehicle}
                        className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs font-medium"
                      >
                        <span className="flex items-center gap-1.5">
                          <Bike className="h-3.5 w-3.5 text-teal-700" />
                          {vehicle}
                        </span>
                        <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dispatch Algorithm Settings */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <Navigation className="h-4 w-4 text-teal-700" />
                    Automated Rider Assignment Parameters
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500">Dispatch Mode</p>
                      <p className="font-bold text-slate-800">Hybrid (Auto + Admin Override)</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Rider Offer Timeout</p>
                      <p className="font-mono font-bold text-teal-800">{config.logistics.offerTimeoutSeconds} seconds</p>
                    </div>
                    <div>
                      <p className="text-slate-500">Max Auto-Reassignments</p>
                      <p className="font-mono font-bold text-teal-800">{config.logistics.maxReassignmentAttempts} attempts</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: FINANCE & PAYMENTS (PROMPT 11 & 12) */}
            {currentStep === 8 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Payment Gateway Mode</span>
                      <Badge className="bg-amber-600 text-white text-[10px]">SANDBOX TEST</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Razorpay & Cashfree keys are stored in encrypted vaults.
                    </p>
                    <p className="text-xs font-mono text-slate-400">Secret: ••••••••••••••••••</p>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestGateway}
                      disabled={isTestingGateway}
                      className="w-full text-xs h-8 bg-white border-slate-200 text-teal-800 font-semibold"
                    >
                      {isTestingGateway ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Zap className="h-3.5 w-3.5 mr-1.5 text-amber-500" />}
                      Test Gateway Handshake
                    </Button>
                    {gatewayTestResult && (
                      <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        {gatewayTestResult}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900">Settlement Schedules</span>
                      <Badge className="bg-teal-700 text-white text-[10px]">T+1 CYCLES</Badge>
                    </div>
                    <p className="text-xs text-slate-500">
                      Vendor Payouts: <span className="font-bold text-slate-700">Weekly (Tuesdays)</span> • Rider Payouts: <span className="font-bold text-slate-700">Weekly (Mondays)</span>
                    </p>
                    <p className="text-xs text-slate-500">
                      Escrow Settlement Hold: <span className="font-bold text-slate-700">24 Hours post-delivery</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9: NOTIFICATIONS & LEGAL (PROMPT 13, 14, 15) */}
            {currentStep === 9 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Bell className="h-4 w-4 text-teal-700" />
                      Active Notification Channels
                    </h4>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>✓ Firebase Cloud Messaging (Push)</p>
                      <p>✓ Twilio / MSG91 Transactional SMS</p>
                      <p>✓ SendGrid / AWS SES Transactional Email</p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleTestNotification}
                      disabled={isTestingNotification}
                      className="w-full text-xs h-8 bg-white border-slate-200 text-teal-800 font-semibold"
                    >
                      {isTestingNotification ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Send className="h-3.5 w-3.5 mr-1.5" />}
                      Send Test Alert to Owner
                    </Button>
                    {notificationTestResult && (
                      <p className="text-[11px] font-mono text-emerald-700 bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                        {notificationTestResult}
                      </p>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Headphones className="h-4 w-4 text-teal-700" />
                      Support SLA Benchmarks
                    </h4>
                    <div className="space-y-1 text-xs text-slate-600">
                      <p>• Critical Escalation SLA: <span className="font-bold text-rose-600">15 minutes</span></p>
                      <p>• Standard Inquiry SLA: <span className="font-bold text-slate-800">2 hours</span></p>
                      <p>• Operating Window: <span className="font-bold text-emerald-700">24x7 Priority Desk</span></p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: BUSINESS & OPERATING HOURS (PROMPT 21) */}
            {currentStep === 10 && (
              <div className="space-y-6">
                <div className="p-4 rounded-xl bg-teal-50/70 border border-teal-200/80 text-xs text-teal-900 flex items-start gap-2.5">
                  <Clock className="h-4 w-4 text-teal-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Operational Hours Segregation</p>
                    <p>
                      Marketplace browsing and logistics delivery windows are configured independently to ensure rider safety and store availability.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Marketplace Hours */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <ShoppingBag className="h-4 w-4 text-teal-700" />
                        Marketplace Storefront Hours
                      </h4>
                      <Badge variant="outline" className="text-[10px] text-teal-800 border-teal-300">
                        Customer Orders
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Opens At</label>
                        <Input
                          type="time"
                          value={config.businessHours.marketplaceOpen}
                          onChange={(e) =>
                            updateConfig('businessHours', { marketplaceOpen: e.target.value })
                          }
                          className="bg-white border-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Closes At</label>
                        <Input
                          type="time"
                          value={config.businessHours.marketplaceClose}
                          onChange={(e) =>
                            updateConfig('businessHours', { marketplaceClose: e.target.value })
                          }
                          className="bg-white border-slate-200 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logistics Hours */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <Truck className="h-4 w-4 text-purple-700" />
                        Logistics & Delivery Fleet Hours
                      </h4>
                      <Badge variant="outline" className="text-[10px] text-purple-800 border-purple-300">
                        Rider Dispatches
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Fleet Online</label>
                        <Input
                          type="time"
                          value={config.businessHours.logisticsOpen}
                          onChange={(e) =>
                            updateConfig('businessHours', { logisticsOpen: e.target.value })
                          }
                          className="bg-white border-slate-200 font-mono text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-600">Fleet Offline</label>
                        <Input
                          type="time"
                          value={config.businessHours.logisticsClose}
                          onChange={(e) =>
                            updateConfig('businessHours', { logisticsClose: e.target.value })
                          }
                          className="bg-white border-slate-200 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 11: REVIEW SevaZo CONFIGURATION (PROMPT 16 & 22) */}
            {currentStep === 11 && (
              <div className="space-y-6">
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] border border-white p-5 space-y-2 text-center">
                  <Sparkles className="h-8 w-8 text-teal-700 mx-auto" />
                  <h3 className="text-lg font-bold text-slate-900 font-sans">
                    Review SevaZo Platform Configuration
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xl mx-auto">
                    Verify all operational parameters before initial system activation. Click [Edit] next to any module to make instant adjustments.
                  </p>
                </div>

                {activationError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-medium text-rose-700">
                    {activationError}
                  </div>
                )}

                {/* 13 MODULES AUDIT GRID WITH [EDIT] & [COMPLETED] STATUS BADGES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* 1. Owner Profile */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Owner Profile
                      </p>
                      <p className="text-[11px] text-slate-500">{config.owner.firstName} {config.owner.lastName} ({config.owner.email})</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(1)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 2. Platform Profile */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Platform & Legal Profile
                      </p>
                      <p className="text-[11px] text-slate-500">{config.platform.legalName} ({config.platform.gstinNumber})</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(2)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 3. Branding */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Branding & Theme
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">Primary: {config.branding.primaryColor} • Accent: {config.branding.secondaryColor}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(3)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 4. Security */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Security & 8 Recovery Codes
                      </p>
                      <p className="text-[11px] text-slate-500">MFA Enforced • 30m Session Timeout • Audit Active</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(4)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 5. Operating Region */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Operating Region & Zones
                      </p>
                      <p className="text-[11px] text-slate-500">{config.region.primaryCity}, {config.region.country} ({config.region.zones.length} Active Zones)</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(5)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 6. Commerce */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Commerce & Marketplace
                      </p>
                      <p className="text-[11px] text-slate-500">Min Order: ₹{config.commerce.minOrderValue} • Max: ₹{config.commerce.maxOrderValue.toLocaleString()}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(6)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 7. Taxes & Commission */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Commission & Taxes
                      </p>
                      <p className="text-[11px] text-slate-500">Default: {config.commerce.defaultCommissionRate}% • Food: {config.commerce.foodCommissionRate}% • GST: {config.commerce.defaultGstRate}%</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(6)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 8. Logistics */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Logistics & Delivery
                      </p>
                      <p className="text-[11px] text-slate-500">Base: ₹{config.logistics.baseDeliveryFee} • Distance: ₹{config.logistics.perKmDistanceFee}/km • Free over ₹{config.logistics.freeDeliveryThreshold}</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(7)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 9. Rider Rules */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Rider Fleet & Dispatch
                      </p>
                      <p className="text-[11px] text-slate-500">Hybrid Dispatch • {config.logistics.offerTimeoutSeconds}s Timeout • Max {config.logistics.maxReassignmentAttempts} Retries</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(7)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 10. Payments & Settlements */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Payments & Settlements
                      </p>
                      <p className="text-[11px] text-slate-500">Razorpay / COD (Sandbox) • Weekly Payouts</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(8)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 11. Notifications */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Notifications & Channels
                      </p>
                      <p className="text-[11px] text-slate-500">FCM Push • MSG91 SMS • SendGrid Email</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(9)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 12. Policies & Support */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Policies & SLAs
                      </p>
                      <p className="text-[11px] text-slate-500">Terms & Privacy v1.0 • 15m Critical SLA • 24x7 Desk</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(9)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>

                  {/* 13. Business Hours */}
                  <div className="p-3.5 bg-slate-50/90 rounded-xl border border-slate-200/80 flex items-center justify-between sm:col-span-2">
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Platform Operating Hours
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Marketplace: {config.businessHours.marketplaceOpen} - {config.businessHours.marketplaceClose} • Logistics Fleet: {config.businessHours.logisticsOpen} - {config.businessHours.logisticsClose} (7 Days Active)
                      </p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setCurrentStep(10)} className="text-xs text-teal-800 hover:text-teal-950 font-semibold h-7">
                      <Edit className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  </div>
                </div>

                {/* ACTIVATION TRIGGER BUTTON */}
                <Button
                  type="button"
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full h-12 bg-gradient-to-r from-[#0D9488] via-[#059669] to-[#C026D3] hover:opacity-95 text-white font-bold text-sm shadow-lg transition-all cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  Activate SevaZo Platform
                </Button>
              </div>
            )}

            {/* STEP NAVIGATION BUTTONS */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1 || isActivating}
                className="text-xs h-9 bg-white border-slate-200 text-slate-700"
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1" />
                Previous Step
              </Button>

              {currentStep < 11 ? (
                <Button
                  type="button"
                  onClick={() => setCurrentStep(Math.min(11, currentStep + 1))}
                  className="text-xs h-9 bg-teal-700 hover:bg-teal-800 text-white font-semibold cursor-pointer"
                >
                  <span>Continue to Step {currentStep + 1}</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* STEP 23: SYSTEM ACTIVATION CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white/98 backdrop-blur-xl border border-white/90 shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-teal-50 border border-teal-100 text-teal-700 mb-2">
                <Sparkles className="h-7 w-7" />
              </div>
              <CardTitle className="text-lg font-bold text-slate-900 font-sans">
                Activate SevaZo Platform?
              </CardTitle>
              <CardDescription className="text-xs text-slate-500">
                Once activated, these settings will become the operational defaults for SevaZo. Some changes may require additional permissions later.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 pt-2">
              {/* Lifecycle State Visualizer */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-mono">
                <span className={`px-2 py-0.5 rounded font-bold ${lifecycleState === 'SETUP' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                  1. SETUP
                </span>
                <span className="text-slate-400">→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${lifecycleState === 'READY' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'}`}>
                  2. READY
                </span>
                <span className="text-slate-400">→</span>
                <span className={`px-2 py-0.5 rounded font-bold ${lifecycleState === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  3. ACTIVE
                </span>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isActivating}
                  className="flex-1 h-10 text-xs border-slate-200 text-slate-700 bg-white"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={executeActivation}
                  disabled={isActivating}
                  className="flex-1 h-10 text-xs bg-gradient-to-r from-[#0D9488] to-[#C026D3] text-white font-bold shadow-md cursor-pointer"
                >
                  {isActivating ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : null}
                  Activate Platform
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
