export interface DashboardMetrics {
  totalCustomers: number;
  totalVendors: number;
  activeVendors: number;
  totalRiders: number;
  onlineRiders: number;
  todayOrders: number;
  todayRevenue: number;
  pendingOrders: number;
  pendingVendorApprovals: number;
  pendingRiderApprovals: number;
  pendingRefunds: number;
  pendingSettlements: number;
  pendingRefundsAmount: number;
  pendingSettlementsAmount: number;
  customersGrowth: number;
  ordersGrowth: number;
  revenueGrowth: number;
}

export const dashboardStats: DashboardMetrics = {
  totalCustomers: 0,
  totalVendors: 0,
  activeVendors: 0,
  totalRiders: 0,
  onlineRiders: 0,
  todayOrders: 0,
  todayRevenue: 0,
  pendingOrders: 0,
  pendingVendorApprovals: 0,
  pendingRiderApprovals: 0,
  pendingRefunds: 0,
  pendingSettlements: 0,
  pendingRefundsAmount: 0,
  pendingSettlementsAmount: 0,
  customersGrowth: 0,
  ordersGrowth: 0,
  revenueGrowth: 0,
};

// Zero-initialized datasets for live platform telemetry (no dummy data)
export const revenueTrendData: { date: string; revenue: number; target: number }[] = [];
export const ordersTrendData: { date: string; orders: number; delivered: number; cancelled: number }[] = [];
export const newUsersTrendData: { date: string; newCustomers: number; organic: number; referral: number }[] = [];
export const vendorGrowthData: { month: string; totalVendors: number; active: number; newOnboarded: number }[] = [];
export const riderGrowthData: { month: string; totalRiders: number; activeFleet: number; recruited: number }[] = [];
export const cancellationRateData: { date: string; rate: number; benchmark: number }[] = [];
export const deliverySuccessData: { date: string; successRate: number; benchmark: number; onTime: number }[] = [];
export const revenueData: { date: string; revenue: number; orders: number }[] = [];
export const orderStatusDistribution: { name: string; value: number; fill: string }[] = [];
export const topProducts: { name: string; sales: number; revenue: number }[] = [];
