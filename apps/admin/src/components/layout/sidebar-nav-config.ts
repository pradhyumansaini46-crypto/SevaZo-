import {
  LayoutDashboard,
  Users,
  Store,
  Bike,
  FolderTree,
  Tag,
  Package,
  ShieldCheck,
  ShoppingCart,
  Clock,
  Loader,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Truck,
  MapPin,
  Radio,
  Map,
  CreditCard,
  Receipt,
  Percent,
  Landmark,
  TicketPercent,
  Megaphone,
  Image,
  HeadphonesIcon,
  MessageSquare,
  BarChart3,
  UserCog,
  Shield,
  Key,
  ScrollText,
  Settings,
  LucideIcon,
} from 'lucide-react';

export interface NavItem {
  title: string;
  url?: string;
  icon?: LucideIcon;
  children?: NavItem[];
}

export interface NavGroup {
  title: string;
  items: NavItem[];
}

export const sidebarNavConfig: NavGroup[] = [
  {
    title: 'Overview',
    items: [
      { title: 'Dashboard', url: '/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    title: 'Users',
    items: [
      {
        title: 'Users',
        icon: Users,
        children: [
          { title: 'Customers', url: '/users/customers', icon: Users },
          { title: 'Vendors', url: '/users/vendors', icon: Store },
          { title: 'Riders', url: '/users/riders', icon: Bike },
        ],
      },
    ],
  },
  {
    title: 'Catalog',
    items: [
      {
        title: 'Catalog',
        icon: Package,
        children: [
          { title: 'Categories', url: '/categories', icon: FolderTree },
          { title: 'Brands', url: '/brands', icon: Tag },
          { title: 'Products', url: '/products', icon: Package },
          { title: 'Product Approval', url: '/products/approval', icon: ShieldCheck },
        ],
      },
    ],
  },
  {
    title: 'Orders',
    items: [
      {
        title: 'Orders',
        icon: ShoppingCart,
        children: [
          { title: 'All Orders', url: '/orders', icon: ShoppingCart },
          { title: 'Pending', url: '/orders?status=pending', icon: Clock },
          { title: 'Processing', url: '/orders?status=preparing', icon: Loader },
          { title: 'Delivered', url: '/orders?status=delivered', icon: CheckCircle2 },
          { title: 'Cancelled', url: '/orders?status=cancelled', icon: XCircle },
          { title: 'Returns', url: '/orders?status=returned', icon: RotateCcw },
        ],
      },
    ],
  },
  {
    title: 'Logistics',
    items: [
      {
        title: 'Logistics',
        icon: Truck,
        children: [
          { title: 'Deliveries', url: '/logistics/deliveries', icon: Truck },
          { title: 'Riders', url: '/logistics/riders', icon: Bike },
          { title: 'Live Tracking', url: '/logistics/tracking', icon: Radio },
          { title: 'Delivery Zones', url: '/logistics/zones', icon: Map },
        ],
      },
    ],
  },
  {
    title: 'Finance',
    items: [
      {
        title: 'Finance',
        icon: CreditCard,
        children: [
          { title: 'Payments', url: '/finance/payments', icon: CreditCard },
          { title: 'Refunds', url: '/finance/refunds', icon: Receipt },
          { title: 'Commissions', url: '/finance/commissions', icon: Percent },
          { title: 'Settlements', url: '/finance/settlements', icon: Landmark },
        ],
      },
    ],
  },
  {
    title: 'Marketing',
    items: [
      {
        title: 'Marketing',
        icon: Megaphone,
        children: [
          { title: 'Coupons', url: '/marketing/coupons', icon: TicketPercent },
          { title: 'Promotions', url: '/marketing/promotions', icon: Megaphone },
          { title: 'Banners', url: '/marketing/banners', icon: Image },
        ],
      },
    ],
  },
  {
    title: 'Support',
    items: [
      {
        title: 'Support',
        icon: HeadphonesIcon,
        children: [
          { title: 'Tickets', url: '/support/tickets', icon: HeadphonesIcon },
          { title: 'Disputes', url: '/support/disputes', icon: MessageSquare },
        ],
      },
    ],
  },
  {
    title: 'Analytics & Admin',
    items: [
      { title: 'Analytics', url: '/analytics', icon: BarChart3 },
      {
        title: 'Administration',
        icon: Shield,
        children: [
          { title: 'Admin Users', url: '/admins', icon: UserCog },
          { title: 'Roles', url: '/roles', icon: Shield },
          { title: 'Permissions', url: '/permissions', icon: Key },
          { title: 'Audit Logs', url: '/audit-logs', icon: ScrollText },
        ],
      },
      { title: 'Settings', url: '/settings', icon: Settings },
    ],
  },
];
