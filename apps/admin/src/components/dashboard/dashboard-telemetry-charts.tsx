'use client';

import * as React from 'react';
import {
  DollarSign,
  ShoppingCart,
  Users,
  Store,
  Bike,
  AlertTriangle,
  CheckCircle2,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  revenueTrendData,
  ordersTrendData,
  newUsersTrendData,
  vendorGrowthData,
  riderGrowthData,
  cancellationRateData,
  deliverySuccessData,
} from '@/lib/mock-data';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function EmptyTelemetryCard({
  title,
  description,
  icon: Icon,
  badge = 'Live Telemetry',
}: {
  title: string;
  description: string;
  icon: any;
  badge?: string;
}) {
  return (
    <Card className="bg-white/90 backdrop-blur-md border border-white/90 shadow-xs overflow-hidden min-w-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2 font-semibold text-slate-900">
              <Icon className="h-4 w-4 text-slate-500 shrink-0" /> {title}
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">{description}</CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs font-medium">{badge}</Badge>
        </div>
      </CardHeader>
      <CardContent className="w-full min-w-0 px-6 py-14 flex flex-col items-center justify-center text-center">
        <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          <Activity className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-slate-700">No telemetry recorded yet</p>
        <p className="text-xs text-slate-400 mt-1 max-w-xs">
          Real-time analytics and trend graphs will populate automatically as customer activity occurs.
        </p>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// 1. REVENUE TREND
// ----------------------------------------------------
export function RevenueTrendChart() {
  const [hoveredIdx, setHoveredIdx] = React.useState<number | null>(null);

  if (!revenueTrendData || revenueTrendData.length === 0) {
    return (
      <EmptyTelemetryCard
        title="Revenue Trend"
        description="Daily gross revenue vs sales target benchmark"
        icon={DollarSign}
      />
    );
  }

  const width = 500;
  const height = 220;
  const padding = { top: 20, right: 20, bottom: 30, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const maxVal = 350000;
  const minVal = 150000;

  const getX = (index: number) => padding.left + (index / (revenueTrendData.length - 1)) * chartW;
  const getY = (val: number) => padding.top + chartH - ((val - minVal) / (maxVal - minVal)) * chartH;

  const points = revenueTrendData.map((d, i) => ({ x: getX(i), y: getY(d.revenue) }));
  let linePath = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    linePath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  const targetPoints = revenueTrendData.map((d, i) => ({ x: getX(i), y: getY(d.target) }));
  let targetPath = `M ${targetPoints[0].x} ${targetPoints[0].y}`;
  for (let i = 0; i < targetPoints.length - 1; i++) {
    const p0 = targetPoints[i];
    const p1 = targetPoints[i + 1];
    const cpX = (p0.x + p1.x) / 2;
    targetPath += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
  }

  return (
    <Card className="bg-white/90 backdrop-blur-md border border-white/90 shadow-xs overflow-hidden min-w-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-base flex items-center gap-2 font-semibold text-slate-900">
              <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" /> Revenue Trend
            </CardTitle>
            <CardDescription className="text-sm text-slate-500">Daily gross revenue vs sales target benchmark</CardDescription>
          </div>
          <Badge variant="secondary" className="font-mono text-xs font-medium">Last 7 Days</Badge>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium pt-1">
          <div className="flex items-center gap-1.5 text-slate-700">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-600" />
            <span>Actual Revenue</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500">
            <span className="h-0.5 w-3 bg-slate-400 border-b border-dashed border-slate-400" />
            <span>Daily Target</span>
          </div>
          {hoveredIdx !== null && (
            <span className="ml-auto font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {revenueTrendData[hoveredIdx].date}: {formatCurrency(revenueTrendData[hoveredIdx].revenue)}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="w-full min-w-0 px-2 sm:px-6 pb-4">
        <div className="w-full h-[260px] sm:h-[280px] relative">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible select-none" preserveAspectRatio="none">
            <defs>
              <linearGradient id="revenueTealGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {[150000, 200000, 250000, 300000, 350000].map((val) => {
              const y = getY(val);
              return (
                <g key={val}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="#F1F5F9" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={padding.left - 8} y={y + 3.5} textAnchor="end" className="text-[10px] fill-slate-400 font-sans">₹{val / 1000}k</text>
                </g>
              );
            })}
            <path d={areaPath} fill="url(#revenueTealGradient)" />
            <path d={targetPath} fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeDasharray="4 4" />
            <path d={linePath} fill="none" stroke="#0D9488" strokeWidth="2.5" />
            {points.map((p, idx) => (
              <g key={idx} className="cursor-pointer" onMouseEnter={() => setHoveredIdx(idx)} onClick={() => setHoveredIdx(idx)}>
                <circle cx={p.x} cy={p.y} r={hoveredIdx === idx ? 6 : 4} fill="#0D9488" stroke="#FFFFFF" strokeWidth="2" />
                <text x={p.x} y={height - 8} textAnchor="middle" className={`text-[10.5px] font-sans ${hoveredIdx === idx ? 'fill-slate-900 font-bold' : 'fill-slate-500'}`}>{revenueTrendData[idx].date}</text>
              </g>
            ))}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------
// 2. ORDERS TREND
// ----------------------------------------------------
export function OrdersTrendChart() {
  if (!ordersTrendData || ordersTrendData.length === 0) {
    return (
      <EmptyTelemetryCard
        title="Order Volume & Fulfillment"
        description="Total daily orders placed vs completed vs cancelled"
        icon={ShoppingCart}
      />
    );
  }
  return null;
}

// ----------------------------------------------------
// 3. CUSTOMER SIGNUPS
// ----------------------------------------------------
export function CustomerSignupsChart() {
  if (!newUsersTrendData || newUsersTrendData.length === 0) {
    return (
      <EmptyTelemetryCard
        title="Customer Signups"
        description="Daily active customer signups & acquisition"
        icon={Users}
      />
    );
  }
  return null;
}

// ----------------------------------------------------
// 4. VENDOR GROWTH
// ----------------------------------------------------
export function VendorGrowthChart() {
  if (!vendorGrowthData || vendorGrowthData.length === 0) {
    return (
      <EmptyTelemetryCard
        title="Vendor Network Growth"
        description="Monthly cumulative onboarded merchant stores"
        icon={Store}
      />
    );
  }
  return null;
}

// ----------------------------------------------------
// 5. RIDER GROWTH
// ----------------------------------------------------
export function RiderGrowthChart() {
  if (!riderGrowthData || riderGrowthData.length === 0) {
    return (
      <EmptyTelemetryCard
        title="Fleet Strength Growth"
        description="Monthly registered & active delivery riders"
        icon={Bike}
      />
    );
  }
  return null;
}

// ----------------------------------------------------
// 6. CANCELLATION RATE
// ----------------------------------------------------
export function CancellationRateChart() {
  if (!cancellationRateData || cancellationRateData.length === 0) {
    return (
      <EmptyTelemetryCard
        title="Order Cancellation Rate"
        description="7-day rolling order cancellation percentage"
        icon={AlertTriangle}
      />
    );
  }
  return null;
}

// ----------------------------------------------------
// 7. DELIVERY SUCCESS
// ----------------------------------------------------
export function DeliverySuccessChart() {
  if (!deliverySuccessData || deliverySuccessData.length === 0) {
    return (
      <EmptyTelemetryCard
        title="Delivery SLA Fulfillment"
        description="On-time 30-minute delivery compliance"
        icon={CheckCircle2}
      />
    );
  }
  return null;
}
