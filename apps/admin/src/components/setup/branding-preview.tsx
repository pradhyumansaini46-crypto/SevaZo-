'use client';

import * as React from 'react';
import Image from 'next/image';
import { Smartphone, Store, Bike, LayoutDashboard, ShoppingBag, CheckCircle, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface BrandingPreviewProps {
  primaryColor: string;
  secondaryColor: string;
  platformName: string;
}

export function BrandingPreview({
  primaryColor = '#0D9488',
  secondaryColor = '#C026D3',
  platformName = 'Sevazo',
}: BrandingPreviewProps) {
  const [activeTab, setActiveTab] = React.useState<'CUSTOMER' | 'VENDOR' | 'RIDER' | 'ADMIN'>('CUSTOMER');

  return (
    <div className="space-y-4">
      {/* App Selector Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('CUSTOMER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'CUSTOMER'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Smartphone className="h-3.5 w-3.5" />
          <span>Customer App</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('VENDOR')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'VENDOR'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Store className="h-3.5 w-3.5" />
          <span>Vendor App</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('RIDER')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'RIDER'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Bike className="h-3.5 w-3.5" />
          <span>Rider App</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('ADMIN')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
            activeTab === 'ADMIN'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" />
          <span>Admin Portal</span>
        </button>
      </div>

      {/* Mock Device Preview Frame */}
      <div className="relative mx-auto w-full max-w-[340px] rounded-3xl border-4 border-slate-800 bg-slate-900 p-2 shadow-xl">
        {/* Phone Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 h-3.5 w-20 bg-slate-800 rounded-full z-20" />

        {/* Screen Container */}
        <div className="h-[380px] w-full rounded-2xl bg-white overflow-hidden flex flex-col text-slate-900 text-xs">
          {/* CUSTOMER APP VIEW */}
          {activeTab === 'CUSTOMER' && (
            <div className="flex-1 flex flex-col">
              {/* Header */}
              <div
                className="p-3 pt-6 text-white flex items-center justify-between shadow-xs transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <div>
                  <p className="text-[10px] opacity-80">Deliver to</p>
                  <p className="text-xs font-bold leading-tight">Mansarovar, Jaipur</p>
                </div>
                <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center font-bold">
                  P
                </div>
              </div>

              {/* Body */}
              <div className="p-3 space-y-3 flex-1 overflow-y-auto bg-slate-50">
                {/* Search Bar */}
                <div className="h-8 rounded-xl bg-white border border-slate-200 px-3 flex items-center text-slate-400 text-[11px] shadow-2xs">
                  Search &quot;Organic Mangoes&quot;...
                </div>

                {/* Banner */}
                <div
                  className="rounded-xl p-3 text-white shadow-xs transition-colors flex items-center justify-between"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <div>
                    <p className="font-bold text-xs">Super Instant 30M</p>
                    <p className="text-[10px] opacity-90">Flat 20% OFF your first order</p>
                  </div>
                  <span className="h-6 px-2 rounded-full bg-white text-slate-900 text-[10px] font-bold flex items-center">
                    SHOP
                  </span>
                </div>

                {/* Categories */}
                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-medium text-slate-700">
                  <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">🥦 Grocery</div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">🍕 Food</div>
                  <div className="p-2 bg-white rounded-xl border border-slate-100 shadow-2xs">💊 Pharma</div>
                </div>
              </div>
            </div>
          )}

          {/* VENDOR APP VIEW */}
          {activeTab === 'VENDOR' && (
            <div className="flex-1 flex flex-col bg-slate-50">
              <div
                className="p-3 pt-6 text-white flex items-center justify-between transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <div>
                  <p className="text-[10px] opacity-80">{platformName} Merchant</p>
                  <p className="text-xs font-bold">Green Valley Organics</p>
                </div>
                <span className="h-5 px-2 rounded-full bg-emerald-400 text-emerald-950 text-[9px] font-bold flex items-center">
                  STORE OPEN
                </span>
              </div>

              <div className="p-3 space-y-2 flex-1">
                <div className="p-3 bg-white rounded-xl border border-slate-100 shadow-2xs space-y-1">
                  <p className="text-[10px] text-slate-500">Today&apos;s Store Revenue</p>
                  <p className="text-base font-bold" style={{ color: primaryColor }}>₹14,850</p>
                  <p className="text-[10px] text-emerald-600 font-medium">32 orders fulfilled</p>
                </div>

                <div className="p-2.5 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[11px]">Order #SV-9812</p>
                    <p className="text-[10px] text-slate-500">2x Fresh Milk, 1x Bread</p>
                  </div>
                  <span
                    className="px-2 py-1 rounded-md text-white text-[10px] font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    READY
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* RIDER APP VIEW */}
          {activeTab === 'RIDER' && (
            <div className="flex-1 flex flex-col bg-slate-50">
              <div
                className="p-3 pt-6 text-white flex items-center justify-between transition-colors"
                style={{ backgroundColor: primaryColor }}
              >
                <div>
                  <p className="text-[10px] opacity-80">{platformName} Fleet Partner</p>
                  <p className="text-xs font-bold">Rider Amit (Active)</p>
                </div>
                <span className="h-5 px-2 rounded-full bg-cyan-400 text-cyan-950 text-[9px] font-bold flex items-center">
                  ONLINE
                </span>
              </div>

              <div className="p-3 space-y-2 flex-1">
                <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[11px] text-slate-900">New Delivery Offer</span>
                    <span className="font-bold text-xs" style={{ color: secondaryColor }}>₹55.00</span>
                  </div>
                  <p className="text-[10px] text-slate-500">Pickup: Fresh Mart (1.2 km) • Drop: Vaishali (2.4 km)</p>
                  <button
                    type="button"
                    className="w-full py-1.5 rounded-lg text-white font-bold text-center text-[11px] shadow-xs"
                    style={{ backgroundColor: primaryColor }}
                  >
                    ACCEPT DELIVERY (24s)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ADMIN PORTAL PREVIEW */}
          {activeTab === 'ADMIN' && (
            <div className="flex-1 flex flex-col bg-slate-50">
              <div className="p-3 pt-6 bg-white border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs" style={{ color: primaryColor }}>{platformName} Admin</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  SUPER_ADMIN
                </span>
              </div>
              <div className="p-3 space-y-2">
                <div
                  className="p-3 rounded-xl text-white shadow-xs"
                  style={{
                    background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                  }}
                >
                  <p className="text-[10px] opacity-80">Ecosystem Status</p>
                  <p className="text-sm font-bold">100% Operational</p>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] space-y-1">
                  <p className="text-slate-500 text-[10px]">Active Theme Preset</p>
                  <p className="font-mono text-slate-900 font-semibold">{primaryColor} → {secondaryColor}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
