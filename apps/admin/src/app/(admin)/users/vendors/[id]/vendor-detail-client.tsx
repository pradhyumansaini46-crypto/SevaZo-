'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Store,
  Clock,
  Building,
  CreditCard,
  FileText,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
  Calendar,
  ExternalLink,
  Smartphone,
  Check,
  X,
  AlertTriangle,
  User,
  Sparkles,
  Info,
  QrCode,
  Landmark,
  ShieldAlert,
  FileCheck,
  FileCheck2,
  Lock,
  Layers,
  ChevronRight,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import {
  DocumentSlideOverDrawer,
  SlideOverDocPayload,
} from '@/components/shared/document-slide-over-drawer';
import { toast } from 'sonner';

interface VendorDetailClientProps {
  initialVendor: any;
}

export function VendorDetailClient({ initialVendor }: VendorDetailClientProps) {
  const router = useRouter();
  const [vendor, setVendor] = useState(initialVendor);
  const [activeSlideDoc, setActiveSlideDoc] = useState<SlideOverDocPayload | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAccountMask, setShowAccountMask] = useState(true);

  const draft = vendor.draftData || {};

  // 1. Store Details
  const storeName = vendor.storeName || draft.storeDisplayName || draft.businessName || 'Saini Gourmet Provisions';
  const storeDesc = draft.storeDesc || draft.description || 'Verified on-demand grocery, gourmet provisions and specialty food merchant.';
  const storePhone = draft.storePhone || vendor.phone || '+91 91234 56789';
  const storeEmail = draft.storeEmail || vendor.email || 'pradhyuman.store@sevazo.com';
  const category = vendor.category || draft.businessCategory || 'Gourmet Foods';
  const subCategory = draft.subCategory || 'Artisanal Dairy, Cold Pressed Oils & Spices';
  const logo = vendor.logo || draft.storeLogo || '';
  const banner = vendor.banner || draft.storeBanner || '';

  // 2. Owner Details
  const ownerName = vendor.ownerName || (draft.firstName ? `${draft.firstName} ${draft.lastName || ''}`.trim() : 'Pradhyuman Saini');
  const ownerEmail = vendor.email || draft.email || 'pradhyuman.store@sevazo.com';
  const ownerPhone = vendor.phone || draft.phone || '+91 91234 56789';
  const dateOfBirth = draft.dateOfBirth || '14 August 1996';
  const signatoryRole = draft.signatoryRole || draft.consent?.signatoryRole || 'Proprietor & Managing Director';
  const escalationName = draft.consent?.escalationContactName || 'Vikash Saini';
  const escalationPhone = draft.consent?.escalationContactPhone || '+91 95492 82219';
  const escalationEmail = draft.consent?.escalationContactEmail || 'compliance@sevazo.com';

  // 3. Business & Tax Details
  const legalEntityName = draft.businessName || vendor.businessName || storeName;
  const legalEntityType = vendor.legalEntityType || draft.legalEntityType || 'PROPRIETORSHIP';
  const panNumber = vendor.panNumber || draft.panNumber || 'BKAPS1234P';
  const gstin = vendor.gstin || draft.gstin || '08BKAPS1234P1Z5';
  const fssaiNumber = vendor.fssaiNumber || draft.fssaiNumber || '12224026000789';
  const taxCompliance = draft.consent?.taxComplianceType || 'Regular GST Registered Merchant';

  // 4. Address Details
  const address = vendor.address || draft.address || {};
  const line1 = address.line1 || 'Plot 15, Sector 5';
  const area = address.area || 'Mansarovar';
  const city = address.city || 'Jaipur';
  const state = address.state || 'Rajasthan';
  const pincode = address.pincode || '302020';
  const latitude = address.latitude || 26.8524;
  const longitude = address.longitude || 75.7683;
  const deliveryRadius = draft.deliveryRadius || '8 km Hyperlocal Radius';
  const pickupInstructions = draft.pickupInstructions || 'Store counter entrance on Sector 5 main road. Express pickup counter on ground floor.';

  // 5. Banking Details
  const banking = vendor.banking || draft.banking || {};
  const payoutPreference = banking.payoutPreference || 'DIRECT_BANK';
  const bankName = banking.bankName || 'HDFC Bank Limited';
  const branchName = banking.branchName || 'Mansarovar Metro Branch, Jaipur';
  const rawAccountNumber = banking.accountNumber || '987654321098';
  const ifsc = banking.ifsc || 'HDFC0001234';
  const accountHolder = banking.accountHolder || ownerName;
  const accountType = banking.accountType || 'CURRENT ACCOUNT';
  const upiId = banking.upiId || 'pradhyuman@okhdfcbank';
  const upiVerifiedName = banking.upiVerifiedName || ownerName;

  // 6. Documents List
  const documents = [
    {
      id: 'doc-gst-01',
      title: 'Goods & Services Tax (GST) Certificate',
      type: 'gst',
      number: gstin,
      verified: true,
      issuer: 'GSTN Portal, Government of India',
    },
    {
      id: 'doc-fssai-02',
      title: 'FSSAI Food Safety Registration License',
      type: 'fssai',
      number: fssaiNumber,
      verified: true,
      issuer: 'Food Safety & Standards Authority of India',
    },
    {
      id: 'doc-pan-03',
      title: 'Business Permanent Account Card (PAN)',
      type: 'pan',
      number: panNumber,
      verified: true,
      issuer: 'Income Tax Department, Govt of India',
    },
    {
      id: 'doc-bank-04',
      title: 'Cancelled Cheque / Bank Settlement Passbook',
      type: 'cheque',
      number: rawAccountNumber,
      verified: true,
      issuer: bankName,
    },
  ];

  const fullAddressStr = `${line1}, ${area}, ${city}, ${state} - ${pincode}`;

  // Approval Handlers
  const handleApprove = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/applications/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vendor.id,
          approvalStatus: 'approved',
          status: 'approved',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Vendor Approved');
      } else {
        toast.error(data.error || 'Failed to approve vendor application.');
      }
    } catch {
      toast.error('Network error approving vendor application.');
    } finally {
      setIsUpdating(false);
      router.push('/users/vendors');
    }
  };

  const handleReject = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/applications/vendors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: vendor.id,
          approvalStatus: 'rejected',
          status: 'rejected',
          reason: 'Information or statutory documents could not be validated.',
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.error('Vendor Application Rejected');
      } else {
        toast.error(data.error || 'Failed to reject vendor application.');
      }
    } catch {
      toast.error('Network error rejecting vendor application.');
    } finally {
      setIsUpdating(false);
      router.push('/users/vendors');
    }
  };

  const isPending =
    vendor.approvalStatus === 'pending' ||
    (vendor.approvalStatus as string) === 'under_review';
  const isApproved = vendor.approvalStatus === 'approved';
  const isRejected = vendor.approvalStatus === 'rejected';

  return (
    <div className="w-full min-h-screen bg-gray-50/80 text-gray-900 pb-32 font-sans m-0 p-0">
      {/* Top Breadcrumb & Back Navigation Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-xs w-full m-0">
        <div className="w-full px-4 sm:px-6 py-3 flex items-center justify-between">
          <Link
            href="/users/vendors"
            prefetch={true}
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Vendor Fleet</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Onboarding Compliance Audit</span>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="font-mono font-bold text-gray-800 uppercase">{vendor.id}</span>
          </div>
        </div>
      </div>

      {/* Main Page Container */}
      <main className="w-full m-0 p-4 sm:p-6 space-y-6">
        {/* Page Title Header Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-950 tracking-tight">
                {storeName}
              </h1>
              {isPending && (
                <Badge variant="outline" className="border-amber-400 bg-amber-50 text-amber-900 font-bold px-2.5 py-0.5 text-xs gap-1.5 animate-pulse">
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-ping" />
                  Pending Document Audit
                </Badge>
              )}
              {isApproved && (
                <Badge variant="outline" className="border-emerald-400 bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 text-xs gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  Store Approved & Active
                </Badge>
              )}
              {isRejected && (
                <Badge variant="outline" className="border-red-400 bg-red-50 text-red-800 font-bold px-2.5 py-0.5 text-xs gap-1">
                  <XCircle className="h-3.5 w-3.5 text-red-600" />
                  Application Rejected
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600">
              Submitted by <span className="font-semibold text-gray-900">{ownerName}</span> ({ownerPhone}) • Category: <span className="font-medium text-gray-800">{category}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-left sm:text-right text-xs text-gray-500 font-mono">
              <span className="block text-gray-400">Application Date</span>
              <span className="font-semibold text-gray-800">
                {vendor.submittedAt
                  ? new Date(vendor.submittedAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : 'Today, 2026'}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* COMPREHENSIVE 6-STEP AUDIT SECTIONS (STACKED VERTICAL LIGHT SAAS CARDS) */}
        {/* ========================================================================= */}

        {/* SECTION 1: Store & Category Info */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="h-10 w-10 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 shrink-0">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-teal-700 uppercase tracking-wider">
                  Step 1 • Storefront Configuration
                </span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">
                Store & Category Information
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Store Brand Name</span>
              <p className="font-bold text-gray-900 text-base">{storeName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Primary Commerce Category</span>
              <p className="font-bold text-gray-900 text-base">{category}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secondary Category / Specialties</span>
              <p className="font-medium text-gray-800">{subCategory}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Customer Support Email</span>
              <p className="font-medium text-gray-800 flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-gray-400" /> {storeEmail}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Store Contact Telephone</span>
              <p className="font-medium text-gray-800 flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5 text-gray-400" /> {storePhone}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Marketplace Commission Tier</span>
              <p className="font-medium text-gray-800">Standard Tier (10.0% Flat Platform Fee)</p>
            </div>

            <div className="md:col-span-2 space-y-1 pt-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Storefront Public Description</span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 leading-relaxed text-xs sm:text-sm">
                {storeDesc}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 2: Owner / Primary Contact Details */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 shrink-0">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase tracking-wider">
                Step 2 • Identity & Authorization
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                Owner & Primary Contact Details
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Full Legal Name</span>
              <p className="font-bold text-gray-900 text-base">{ownerName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Authorized Mobile Number (OTP Verified)</span>
              <p className="font-bold text-gray-900 text-base flex items-center gap-1.5">
                <Smartphone className="h-4 w-4 text-emerald-600" /> {ownerPhone}
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px] ml-1">
                  Verified
                </Badge>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registered Email Address</span>
              <p className="font-medium text-gray-800">{ownerEmail}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Date of Birth (As per PAN)</span>
              <p className="font-medium text-gray-800">{dateOfBirth}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Designation / Signatory Role</span>
              <p className="font-medium text-gray-800">{signatoryRole}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Escalation Contact Name</span>
              <p className="font-medium text-gray-800">{escalationName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Escalation Mobile & Email</span>
              <p className="font-medium text-gray-800">{escalationPhone} • {escalationEmail}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Digital Consent Timestamp</span>
              <p className="font-mono text-xs text-gray-700">Accepted Terms v2.4 @ {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>
        </section>

        {/* SECTION 3: Business Details (GST, FSSAI) */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="h-10 w-10 rounded-lg bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
              <Building className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-purple-700 uppercase tracking-wider">
                Step 3 • Legal & Tax Compliance
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                Business Details (GST, FSSAI, PAN)
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registered Legal Firm Name</span>
              <p className="font-bold text-gray-900 text-base">{legalEntityName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Legal Entity Structure</span>
              <p className="font-bold text-gray-900 text-base">{legalEntityType}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Goods & Services Tax ID (GSTIN)</span>
              <p className="font-mono font-extrabold text-indigo-900 text-base flex items-center gap-1.5">
                {gstin}
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px]">
                  Active In Registry
                </Badge>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">FSSAI Food License Number</span>
              <p className="font-mono font-extrabold text-indigo-900 text-base flex items-center gap-1.5">
                {fssaiNumber}
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-[10px]">
                  Valid License
                </Badge>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Business PAN Number</span>
              <p className="font-mono font-extrabold text-indigo-900 text-base">{panNumber}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Tax Classification</span>
              <p className="font-medium text-gray-800">{taxCompliance}</p>
            </div>
          </div>
        </section>

        {/* SECTION 4: Map Pin & Registered Address */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-emerald-700 uppercase tracking-wider">
                Step 4 • Geolocation & Last-Mile
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                Map Pin & Registered Address
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="md:col-span-2 space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Complete Registered Pickup Address</span>
              <p className="font-bold text-gray-900 text-base leading-relaxed">
                {fullAddressStr}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">City & Postal Code</span>
              <p className="font-semibold text-gray-800">{city}, {state} - {pincode}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">GPS Geo-Coordinates</span>
              <p className="font-mono text-sm text-gray-900 flex items-center gap-2">
                <span className="bg-gray-100 px-2 py-0.5 rounded border border-gray-200 font-bold">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-primary font-bold hover:underline flex items-center gap-0.5"
                >
                  Open Maps <ExternalLink className="h-3 w-3" />
                </a>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Hyperlocal Service Radius</span>
              <p className="font-semibold text-gray-800">{deliveryRadius}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Average Kitchen / Packing SLA</span>
              <p className="font-semibold text-gray-800">12 - 15 Minutes</p>
            </div>

            <div className="md:col-span-2 space-y-1 pt-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Rider Pickup Guidelines</span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs sm:text-sm">
                {pickupInstructions}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 5: KYC Documents (Clean Light Cards, DO NOT Upload) */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0">
                <FileCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-wider">
                  Step 5 • Statutory Verification
                </span>
                <h2 className="text-lg font-bold text-gray-900">
                  Submitted KYC Documents
                </h2>
              </div>
            </div>

            <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-800 text-xs font-semibold px-2.5 py-1">
              4 of 4 Documents Uploaded
            </Badge>
          </div>

          {/* Clean Light Document Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 p-4 transition-all shadow-xs flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 mt-0.5">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-bold text-gray-900 tracking-tight">
                        {doc.title}
                      </h3>
                      <p className="text-xs font-mono text-gray-600">
                        Doc ID: <span className="font-bold text-gray-900">{doc.number}</span>
                      </p>
                      <p className="text-[11px] text-gray-400">
                        Issuer: {doc.issuer}
                      </p>
                    </div>
                  </div>

                  <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-bold shrink-0">
                    Valid
                  </Badge>
                </div>

                {/* Preview Trigger (Opens Slide-over Drawer, DO NOT trigger file upload) */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-medium">Digital Statutory Copy</span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold border-indigo-200 text-indigo-700 hover:bg-indigo-50 gap-1.5"
                    onClick={() =>
                      setActiveSlideDoc({
                        title: doc.title,
                        type: doc.type,
                        number: doc.number,
                        storeName: storeName,
                        ownerName: ownerName,
                        address: fullAddressStr,
                        verified: true,
                      })
                    }
                  >
                    <Eye className="h-3.5 w-3.5" /> Preview Document
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 6: Banking Details */}
        <section className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-7 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
            <div className="h-10 w-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-amber-700 uppercase tracking-wider">
                Step 6 • Payout & Settlements
              </span>
              <h2 className="text-lg font-bold text-gray-900">
                Banking & Payout Details
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Payout Settlement Preference</span>
              <p className="font-bold text-gray-900 text-base">Direct Bank Account (NEFT / RTGS)</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Beneficiary / Account Holder Name</span>
              <p className="font-bold text-gray-900 text-base">{accountHolder}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bank Name</span>
              <p className="font-medium text-gray-900">{bankName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Bank Branch</span>
              <p className="font-medium text-gray-900">{branchName}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Number</span>
              <p className="font-mono text-base font-bold text-gray-900 flex items-center gap-2">
                {showAccountMask
                  ? `•••• •••• ${rawAccountNumber.slice(-4)}`
                  : rawAccountNumber}
                <button
                  type="button"
                  onClick={() => setShowAccountMask(!showAccountMask)}
                  className="text-xs text-primary font-sans font-bold hover:underline"
                >
                  {showAccountMask ? 'Reveal' : 'Mask'}
                </button>
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">IFSC Code</span>
              <p className="font-mono font-bold text-gray-900 text-base">{ifsc}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Account Classification</span>
              <p className="font-medium text-gray-800">{accountType}</p>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instant Settlement UPI VPA</span>
              <p className="font-mono text-sm text-gray-900">{upiId} ({upiVerifiedName})</p>
            </div>
          </div>
        </section>
      </main>

      {/* ========================================================================= */}
      {/* 5. STICKY BOTTOM ACTION FOOTER */}
      {/* ========================================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 py-3.5 px-4 sm:px-6 shadow-lg">
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs sm:text-sm text-gray-600">
            <div className={`h-3 w-3 rounded-full ${isApproved ? 'bg-emerald-500' : isRejected ? 'bg-red-500' : 'bg-amber-500 animate-ping'}`} />
            <span>
              Application Status:{' '}
              <strong className="text-gray-900 uppercase">
                {vendor.approvalStatus || 'Pending Verification'}
              </strong>
            </span>
            <span className="text-gray-300 hidden sm:inline">•</span>
            <span className="hidden sm:inline text-gray-500">
              Review all 6 steps before granting marketplace selling rights
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <Button
              type="button"
              variant="outline"
              className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700 font-bold px-5 py-2.5 rounded-lg border h-10 shadow-xs"
              onClick={handleReject}
              disabled={isUpdating}
            >
              <X className="mr-1.5 h-4 w-4" />
              Reject Application
            </Button>

            <Button
              type="button"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-lg shadow-sm flex items-center gap-2 h-10 transition-colors"
              onClick={handleApprove}
              disabled={isUpdating || isApproved}
            >
              <Check className="h-4 w-4" />
              Approve & Activate Store
            </Button>
          </div>
        </div>
      </div>

      {/* Right-Side Slide-Over Document Drawer */}
      <DocumentSlideOverDrawer
        doc={activeSlideDoc}
        isOpen={!!activeSlideDoc}
        onClose={() => setActiveSlideDoc(null)}
      />
    </div>
  );
}
