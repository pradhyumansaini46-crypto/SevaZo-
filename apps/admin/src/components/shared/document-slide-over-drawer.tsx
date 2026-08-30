'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  QrCode,
  FileCheck2,
  Building2,
  Calendar,
  Stamp,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface SlideOverDocPayload {
  title: string;
  type: string; // 'gst' | 'fssai' | 'pan' | 'cheque' | 'license' | string
  number: string;
  storeName: string;
  ownerName?: string;
  address?: string;
  issueDate?: string;
  validUntil?: string;
  fileUrl?: string;
  verified?: boolean;
}

interface DocumentSlideOverDrawerProps {
  doc: SlideOverDocPayload | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DocumentSlideOverDrawer({ doc, isOpen, onClose }: DocumentSlideOverDrawerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !doc) return null;

  const docType = doc.type?.toLowerCase() || '';
  const isGst = docType.includes('gst');
  const isFssai = docType.includes('fssai');
  const isPan = docType.includes('pan');
  const isCheque = docType.includes('cheque') || docType.includes('bank');

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.15, 1.6));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.15, 0.7));
  const handleResetZoom = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleDownload = () => {
    // Generate text/blob download for simulation
    const content = `SevaZo VERIFIED DOCUMENT AUDIT\n---------------------------------\nDocument: ${doc.title}\nID Number: ${doc.number}\nStore: ${doc.storeName}\nOwner: ${doc.ownerName || 'Verified Partner'}\nStatus: Officially Verified\nTimestamp: ${new Date().toISOString()}\n`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${doc.type}_${doc.number || 'doc'}_verified.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-2xl bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-in slide-in-from-right duration-300">
          {/* 1. Drawer Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50/80 flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <FileCheck2 className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                  {doc.title}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span className="font-mono font-semibold text-gray-800">
                  Doc ID: {doc.number}
                </span>
                <span className="text-gray-300">•</span>
                <Badge variant="outline" className="border-emerald-300 bg-emerald-50 text-emerald-700 text-[11px] font-semibold gap-1 py-0.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified Legal Record
                </Badge>
              </div>
            </div>

            {/* Top Controls & Close */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-semibold border-gray-200 text-gray-700 hover:bg-gray-100"
                onClick={handleResetZoom}
                title="Reset View"
              >
                Reset
              </Button>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Close drawer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 2. Viewer Toolbar */}
          <div className="px-6 py-2.5 bg-white border-b border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              Verified Issuer: <span className="font-bold text-gray-900">{isGst ? 'Goods & Services Tax Network (GSTN)' : isFssai ? 'Food Safety & Standards Authority of India' : isPan ? 'Income Tax Department (Govt of India)' : 'Authorized Scheduled Commercial Bank'}</span>
            </span>

            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={handleZoomOut}
                title="Zoom Out"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-[11px] font-mono text-gray-600 min-w-[40px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={handleZoomIn}
                title="Zoom In"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                title="Rotate 90 deg"
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* 3. Document Canvas (Simulated Official Document) */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100/70 flex items-center justify-center">
            <div
              className="w-full max-w-lg transition-transform duration-200 ease-out select-none"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center',
              }}
            >
              {/* Simulated Government Document Paper */}
              <div className="bg-white rounded-lg border-2 border-gray-300 shadow-lg p-7 relative overflow-hidden text-gray-900">
                {/* Official Watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                  <Award className="w-96 h-96 text-black" />
                </div>

                {/* Top Seal / Emblem Area */}
                <div className="flex flex-col items-center text-center pb-5 border-b-2 border-gray-800">
                  <div className="h-12 w-12 rounded-full border border-gray-400 bg-amber-50 flex items-center justify-center mb-2 shadow-xs">
                    <ShieldCheck className="h-7 w-7 text-amber-700" />
                  </div>
                  <h3 className="text-xs font-mono uppercase tracking-widest text-gray-600 font-bold">
                    GOVERNMENT OF INDIA / STATUTORY COMPLIANCE
                  </h3>
                  <h4 className="text-base font-extrabold text-gray-950 uppercase tracking-tight mt-0.5">
                    {isGst
                      ? 'Form GST REG-06 • Certificate of Registration'
                      : isFssai
                      ? 'Food Safety and Standards Act, 2006 • Food License'
                      : isPan
                      ? 'Income Tax Department • Permanent Account Card'
                      : 'Bank Settlement & Account Verification Leaf'}
                  </h4>
                  <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                    Verification Audit Ref: SVZ-COMP-{doc.number?.replace(/[^a-zA-Z0-9]/g, '').slice(-8) || '2026-X1'}
                  </p>
                </div>

                {/* Core Document Data Grid */}
                <div className="py-6 space-y-4 text-xs">
                  <div className="grid grid-cols-2 gap-4 pb-3 border-b border-gray-100">
                    <div>
                      <span className="text-[11px] text-gray-500 font-semibold block uppercase">
                        Registration Number / Doc ID:
                      </span>
                      <span className="text-sm font-mono font-extrabold text-indigo-950 tracking-wider">
                        {doc.number}
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-semibold block uppercase">
                        Issuance / Verification Status:
                      </span>
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" /> ACTIVE & VALID
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] text-gray-500 font-semibold block uppercase">
                        Legal Business Name:
                      </span>
                      <span className="text-sm font-bold text-gray-900">
                        {doc.storeName}
                      </span>
                    </div>

                    {doc.ownerName && (
                      <div>
                        <span className="text-[11px] text-gray-500 font-semibold block uppercase">
                          Authorized Signatory / Proprietor:
                        </span>
                        <span className="text-sm font-medium text-gray-800">
                          {doc.ownerName}
                        </span>
                      </div>
                    )}

                    {doc.address && (
                      <div>
                        <span className="text-[11px] text-gray-500 font-semibold block uppercase">
                          Principal Place of Business:
                        </span>
                        <span className="text-xs text-gray-700 leading-relaxed">
                          {doc.address}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Stamp & Barcode Footer */}
                  <div className="pt-6 mt-4 border-t-2 border-dashed border-gray-200 flex items-end justify-between">
                    <div className="space-y-1">
                      <div className="p-1.5 bg-gray-50 border border-gray-300 rounded inline-block">
                        <QrCode className="h-14 w-14 text-gray-800" />
                      </div>
                      <span className="block text-[9px] font-mono text-gray-500">
                        Digitally Signed & Validated
                      </span>
                    </div>

                    <div className="text-right space-y-1">
                      <div className="inline-block p-2 rounded-full border-2 border-emerald-600 text-emerald-700 font-serif text-[10px] font-extrabold rotate-[-8deg] uppercase tracking-wider bg-emerald-50/50">
                        OFFICIALLY VERIFIED
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        Date: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Drawer Action Footer */}
          <div className="px-6 py-4 border-t border-gray-200 bg-white flex items-center justify-between">
            <div className="text-xs text-gray-500 flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Full compliance verified against GSTN / FSSAI database</span>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="font-medium text-gray-700 hover:bg-gray-100"
              >
                Close Viewer
              </Button>
              <Button
                size="sm"
                onClick={handleDownload}
                className="bg-primary hover:bg-primary/90 text-white font-bold gap-1.5 shadow-sm"
              >
                <Download className="h-4 w-4" /> Download Certificate
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
