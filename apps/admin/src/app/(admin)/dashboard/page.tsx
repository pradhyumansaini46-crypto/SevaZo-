'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  Store,
  Bike,
  ShoppingCart,
  DollarSign,
  Clock,
  UserCheck,
  ShieldAlert,
  Receipt,
  Landmark,
  Radio,
  ArrowUpRight,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/shared/stat-card';
import { StatusBadge } from '@/components/shared/status-badge';
import { PageHeader } from '@/components/shared/page-header';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  dashboardStats,
  topProducts,
  mockOrders,
} from '@/lib/mock-data';
import { useDashboardTelemetry } from '@/hooks/use-admin-api';
import {
  RevenueTrendChart,
  OrdersTrendChart,
  CustomerSignupsChart,
  VendorGrowthChart,
  RiderGrowthChart,
  CancellationRateChart,
  DeliverySuccessChart,
} from '@/components/dashboard/dashboard-telemetry-charts';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function DashboardPage() {
  const [chartTab, setChartTab] = React.useState('business');
  const [riders, setRiders] = React.useState<any[]>([]);
  const [vendors, setVendors] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch('/api/applications/riders')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setRiders(d.data);
      })
      .catch(() => {});

    fetch('/api/applications/vendors')
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.data)) setVendors(d.data);
      })
      .catch(() => {});
  }, []);

  const { data: telemetry } = useDashboardTelemetry();

  const totalRiders = telemetry?.kpis?.activeRiders ?? riders.length;
  const onlineRiders = riders.filter((r) => r.isOnline).length || (totalRiders > 0 ? Math.ceil(totalRiders * 0.7) : 0);
  const pendingRiderApprovals =
    telemetry?.kpis?.pendingRiderApprovals ??
    riders.filter(
      (r) => r.approvalStatus === 'PENDING' || (r.approvalStatus as string) === 'under_review'
    ).length;

  const totalVendors = telemetry?.kpis?.activeVendors ?? vendors.length;
  const activeVendors = vendors.filter((v) => v.status === 'active').length || totalVendors;
  const pendingVendorApprovals =
    telemetry?.kpis?.pendingVendorApprovals ??
    vendors.filter(
      (v) => v.approvalStatus === 'pending' || (v.approvalStatus as string) === 'under_review'
    ).length;

  const todayRevenue = telemetry?.kpis?.todayRevenue ?? dashboardStats.todayRevenue;
  const todayOrders = telemetry?.kpis?.todayOrders ?? dashboardStats.todayOrders;
  const totalCustomers = telemetry?.kpis?.totalCustomers ?? dashboardStats.totalCustomers;

  return (
    <div className="space-y-10 pb-12 w-full min-w-0 overflow-x-hidden">
      {/* Page Header */}
      <PageHeader
        title="Admin Command Center"
        description="Real-time ecosystem metrics, commerce performance & operations monitoring."
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1 text-xs gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-700 font-medium">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live System Active
          </Badge>
        </div>
      </PageHeader>

      {/* LIVE ACTION REQUIRED ALERT: PENDING ONBOARDING & DOCUMENTS (Only shown if pending exist) */}
      {(pendingRiderApprovals > 0 || pendingVendorApprovals > 0) && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-4 shadow-sm backdrop-blur-sm transition-all animate-pulse duration-1000">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start md:items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs">
                <ShieldAlert className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-200/80 px-2.5 py-0.5 text-xs font-bold text-amber-900">
                    <span className="h-2 w-2 rounded-full bg-red-600 animate-ping" />
                    ACTION REQUIRED
                  </span>
                  <span className="text-xs font-semibold text-amber-800">
                    Instant Verification Alert
                  </span>
                </div>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {pendingRiderApprovals > 0 && pendingVendorApprovals > 0
                    ? `${pendingRiderApprovals} Rider and ${pendingVendorApprovals} Vendor application(s) awaiting KYC & document verification.`
                    : pendingRiderApprovals > 0
                    ? `${pendingRiderApprovals} Delivery Partner application(s) submitted — KYC, License & Vehicle documents awaiting Admin Action.`
                    : `${pendingVendorApprovals} Merchant Store application(s) submitted — GST, FSSAI & Business documents awaiting Admin Action.`}
                </p>
              </div>
            </div>
            <Link href={pendingRiderApprovals > 0 ? "/users/riders" : "/users/vendors"} prefetch={true} className="shrink-0">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-bold gap-1.5 shadow-xs">
                <UserCheck className="h-4 w-4" />
                Review Documents & Take Action
                <ArrowUpRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* SECTION 1: TODAY'S HIGHLIGHTS & FINANCIALS */}
      <section className="space-y-4 w-full min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Activity className="h-4 w-4 text-teal-700" /> Today&apos;s Highlights & Financials
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
          <StatCard
            title="Today's Revenue"
            value={formatCurrency(todayRevenue)}
            icon={DollarSign}
            description="gross order revenue"
          />
          <StatCard
            title="Today's Orders"
            value={todayOrders.toLocaleString()}
            icon={ShoppingCart}
            description="total completed orders"
          />
          <StatCard
            title="Total Customers"
            value={totalCustomers.toLocaleString()}
            icon={Users}
            description="registered platform users"
          />
          <StatCard
            title="Active Fleet (Online)"
            value={`${onlineRiders} / ${totalRiders}`}
            icon={Radio}
            description="riders currently delivering"
          />
        </div>
      </section>

      {/* SECTION 2: PLATFORM ECOSYSTEM & FLEET */}
      <section className="space-y-4 w-full min-w-0">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Store className="h-4 w-4 text-teal-700" /> Platform Ecosystem & Fleet
        </h2>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 min-w-0">
          <StatCard
            title="Total Vendors"
            value={totalVendors}
            icon={Store}
            description="registered merchant stores"
          />
          <StatCard
            title="Active Vendors"
            value={activeVendors}
            icon={CheckCircle2}
            description={`${totalVendors > 0 ? Math.round((activeVendors / totalVendors) * 100) : 0}% active store rate`}
          />
          <StatCard
            title="Total Riders"
            value={totalRiders}
            icon={Bike}
            description="onboarded delivery partners"
          />
          <StatCard
            title="Online Riders"
            value={onlineRiders}
            icon={Radio}
            description={`${totalRiders > 0 ? Math.round((onlineRiders / totalRiders) * 100) : 0}% online fleet capacity`}
          />
        </div>
      </section>

      {/* SECTION 3: PENDING ACTION QUEUES */}
      <section className="space-y-4 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Pending Action Queues
          </h2>
          <span className="text-xs font-medium text-slate-500">Click any card to resolve</span>
        </div>
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 min-w-0">
          {/* Card 8: Pending Orders */}
          <Link href="/orders?status=pending" prefetch={true} className="group transition-transform hover:-translate-y-0.5 min-w-0">
            <Card className="h-full bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_20px_rgba(227,253,245,0.2)] group-hover:shadow-[0_6px_24px_rgba(255,230,250,0.4)] group-hover:border-[#E3FDF5] transition-all duration-200 min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending Orders</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] border border-white/80 flex items-center justify-center shadow-2xs">
                  <Clock className="h-4 w-4 text-amber-700" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-amber-700 font-sans">
                  {dashboardStats.pendingOrders}
                </div>
                <p className="text-sm font-medium text-slate-500 flex items-center justify-between">
                  <span>Needs dispatch</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card 9: Pending Vendor Approvals */}
          <Link href="/users/vendors" prefetch={true} className="group transition-transform hover:-translate-y-0.5 min-w-0">
            <Card className="h-full bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_20px_rgba(227,253,245,0.2)] group-hover:shadow-[0_6px_24px_rgba(255,230,250,0.4)] group-hover:border-[#E3FDF5] transition-all duration-200 min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Vendor Approvals</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] border border-white/80 flex items-center justify-center shadow-2xs">
                  <UserCheck className="h-4 w-4 text-teal-800" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-teal-800 font-sans">
                  {pendingVendorApprovals}
                </div>
                <p className="text-sm font-medium text-slate-500 flex items-center justify-between">
                  <span>Pending KYC</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-teal-700 transition-colors" />
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card 10: Pending Rider Approvals */}
          <Link href="/users/riders" prefetch={true} className="group transition-transform hover:-translate-y-0.5 min-w-0">
            <Card className="h-full bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_20px_rgba(227,253,245,0.2)] group-hover:shadow-[0_6px_24px_rgba(255,230,250,0.4)] group-hover:border-[#E3FDF5] transition-all duration-200 min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Rider Approvals</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] border border-white/80 flex items-center justify-center shadow-2xs">
                  <ShieldAlert className="h-4 w-4 text-blue-700" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-blue-700 font-sans">
                  {pendingRiderApprovals}
                </div>
                <p className="text-sm font-medium text-slate-500 flex items-center justify-between">
                  <span>License checks</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card 11: Pending Refunds */}
          <Link href="/finance/refunds" prefetch={true} className="group transition-transform hover:-translate-y-0.5 min-w-0">
            <Card className="h-full bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_20px_rgba(227,253,245,0.2)] group-hover:shadow-[0_6px_24px_rgba(255,230,250,0.4)] group-hover:border-[#E3FDF5] transition-all duration-200 min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending Refunds</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] border border-white/80 flex items-center justify-center shadow-2xs">
                  <Receipt className="h-4 w-4 text-rose-700" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-rose-700 font-sans">
                  {dashboardStats.pendingRefunds}
                </div>
                <p className="text-sm font-medium text-slate-500 flex items-center justify-between">
                  <span>{formatCurrency(dashboardStats.pendingRefundsAmount)}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-rose-600 transition-colors" />
                </p>
              </CardContent>
            </Card>
          </Link>

          {/* Card 12: Pending Settlements */}
          <Link href="/finance/settlements" prefetch={true} className="group transition-transform hover:-translate-y-0.5 min-w-0">
            <Card className="h-full bg-white/90 backdrop-blur-md border border-white/90 shadow-[0_4px_20px_rgba(227,253,245,0.2)] group-hover:shadow-[0_6px_24px_rgba(255,230,250,0.4)] group-hover:border-[#E3FDF5] transition-all duration-200 min-w-0">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Pending Settlements</CardTitle>
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#E3FDF5] to-[#FFE6FA] border border-white/80 flex items-center justify-center shadow-2xs">
                  <Landmark className="h-4 w-4 text-fuchsia-700" />
                </div>
              </CardHeader>
              <CardContent className="space-y-1">
                <div className="text-2xl font-bold tracking-tight text-fuchsia-700 font-sans">
                  {dashboardStats.pendingSettlements}
                </div>
                <p className="text-sm font-medium text-slate-500 flex items-center justify-between">
                  <span>{formatCurrency(dashboardStats.pendingSettlementsAmount)}</span>
                  <ArrowUpRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-fuchsia-600 transition-colors" />
                </p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* SECTION 4: 7 COMPREHENSIVE CHARTS */}
      <section className="space-y-4 pt-2 w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-900">Analytics & Trends</h2>
            <p className="text-sm text-slate-500">Detailed time-series telemetry across commerce, growth and logistics.</p>
          </div>
          <div className="w-full sm:w-auto p-1 rounded-xl bg-white/90 backdrop-blur-md border border-white/90 shadow-2xs relative z-10">
            <div className="grid grid-cols-3 sm:flex sm:items-center gap-1 w-full" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={chartTab === 'business'}
                onClick={() => setChartTab('business')}
                onPointerDown={() => setChartTab('business')}
                className={`min-h-[36px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                  chartTab === 'business'
                    ? 'bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] text-teal-950 font-bold shadow-2xs border border-white/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="sm:hidden">Commerce</span>
                <span className="hidden sm:inline">Commerce & Revenue</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={chartTab === 'growth'}
                onClick={() => setChartTab('growth')}
                onPointerDown={() => setChartTab('growth')}
                className={`min-h-[36px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                  chartTab === 'growth'
                    ? 'bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] text-teal-950 font-bold shadow-2xs border border-white/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="sm:hidden">Growth</span>
                <span className="hidden sm:inline">Growth & Onboarding</span>
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={chartTab === 'quality'}
                onClick={() => setChartTab('quality')}
                onPointerDown={() => setChartTab('quality')}
                className={`min-h-[36px] px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all text-center whitespace-nowrap cursor-pointer select-none active:scale-95 ${
                  chartTab === 'quality'
                    ? 'bg-gradient-to-r from-[#E3FDF5] to-[#FFE6FA] text-teal-950 font-bold shadow-2xs border border-white/90'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="sm:hidden">Reliability</span>
                <span className="hidden sm:inline">Quality & Reliability</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: COMMERCE & REVENUE CHARTS (Chart 1 & Chart 2) */}
        <div className={chartTab === 'business' ? 'grid gap-6 grid-cols-1 md:grid-cols-2 w-full min-w-0' : 'hidden'}>
          <RevenueTrendChart />
          <OrdersTrendChart />
        </div>

        {/* TAB 2: GROWTH & ONBOARDING CHARTS (Chart 3, 4, 5) */}
        <div className={chartTab === 'growth' ? 'grid gap-6 grid-cols-1 md:grid-cols-3 w-full min-w-0' : 'hidden'}>
          <CustomerSignupsChart />
          <VendorGrowthChart />
          <RiderGrowthChart />
        </div>

        {/* TAB 3: QUALITY & RELIABILITY CHARTS (Chart 6 & Chart 7) */}
        <div className={chartTab === 'quality' ? 'grid gap-6 grid-cols-1 md:grid-cols-2 w-full min-w-0' : 'hidden'}>
          <CancellationRateChart />
          <DeliverySuccessChart />
        </div>
      </section>

      {/* SECTION 5: LIVE ORDERS & TOP PRODUCTS TABLES */}
      <section className="grid gap-6 grid-cols-1 lg:grid-cols-7 pt-2 w-full min-w-0">
        {/* Recent Orders (4 cols) */}
        <Card className="lg:col-span-4 bg-white/90 backdrop-blur-md border border-white/90 shadow-xs overflow-hidden min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Recent Platform Orders</CardTitle>
              <CardDescription className="text-sm text-slate-500">Latest active dispatches across all zones</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/orders" prefetch={true}>View All Orders</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-slate-100 hover:bg-transparent bg-slate-50/50">
                  <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Order #</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Customer</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Vendor</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Amount</TableHead>
                  <TableHead className="text-xs font-semibold text-slate-700 whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-12 text-center text-sm text-slate-500">
                      No orders placed yet. As customers place orders on Sevazo, they will appear here in real-time.
                    </TableCell>
                  </TableRow>
                ) : (
                  mockOrders.slice(0, 5).map((order) => (
                    <TableRow key={order.id} className="border-slate-100 hover:bg-slate-50/80">
                      <TableCell className="font-mono text-xs font-semibold text-slate-900 whitespace-nowrap">
                        <Link href={`/orders/${order.id}`} prefetch={true} className="hover:underline text-teal-800 font-semibold">
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm font-medium whitespace-nowrap">{order.customer.name}</TableCell>
                      <TableCell className="text-sm text-slate-600 whitespace-nowrap">{order.vendor.storeName}</TableCell>
                      <TableCell className="text-sm font-bold whitespace-nowrap">{formatCurrency(order.total)}</TableCell>
                      <TableCell className="whitespace-nowrap">
                        <StatusBadge status={order.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Top Products (3 cols) */}
        <Card className="lg:col-span-3 bg-white/90 backdrop-blur-md border border-white/90 shadow-xs overflow-hidden min-w-0">
          <CardHeader className="flex flex-row items-center justify-between pb-3 flex-wrap gap-2">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900">Top Moving SKUs</CardTitle>
              <CardDescription className="text-sm text-slate-500">Highest volume items today</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/products" prefetch={true}>All Products</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              {topProducts.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500">
                  No moving SKUs recorded yet. Products added by verified merchants will appear here.
                </div>
              ) : (
                topProducts.map((product, index) => (
                  <div key={product.name} className="flex items-center justify-between p-4 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800 shrink-0">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-semibold leading-tight text-slate-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{product.sales} units ordered</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-slate-900">{formatCurrency(product.revenue)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
