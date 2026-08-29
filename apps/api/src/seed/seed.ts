import { PrismaClient, UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Sevazo Admin RBAC & Database Seeder...');

  // 1. Define Granular Permissions
  console.log('1. Seeding system permissions...');
  const permissions = [
    // Users & RBAC
    { module: 'users', action: 'read', description: 'View customer, vendor and rider users' },
    { module: 'users', action: 'suspend', description: 'Suspend or block users' },
    { module: 'roles', action: 'read', description: 'View RBAC roles and permissions' },
    { module: 'roles', action: 'write', description: 'Manage RBAC roles and assign permissions' },
    { module: 'admins', action: 'read', description: 'View admin staff accounts' },
    { module: 'admins', action: 'write', description: 'Create and edit admin accounts' },

    // Customers, Vendors, Riders
    { module: 'customers', action: 'read', description: 'View customer accounts' },
    { module: 'customers', action: 'write', description: 'Manage customer accounts' },
    { module: 'vendors', action: 'read', description: 'View vendor stores and KYC' },
    { module: 'vendors', action: 'write', description: 'Approve, reject, or suspend vendor stores' },
    { module: 'riders', action: 'read', description: 'View rider fleet and live tracking' },
    { module: 'riders', action: 'write', description: 'Manage and approve riders' },

    // Catalog
    { module: 'catalog', action: 'read', description: 'View products, categories, brands' },
    { module: 'catalog', action: 'write', description: 'Create, edit, approve products and categories' },

    // Orders & Logistics
    { module: 'orders', action: 'read', description: 'View orders and lifecycle status' },
    { module: 'orders', action: 'write', description: 'Update, cancel, or reassign orders' },
    { module: 'logistics', action: 'read', description: 'View deliveries and delivery zones' },
    { module: 'logistics', action: 'write', description: 'Dispatch riders and manage delivery zones' },

    // Finance
    { module: 'finance', action: 'read', description: 'View payment transactions, commissions' },
    { module: 'finance', action: 'write', description: 'Process customer refunds and vendor settlements' },

    // Marketing & Support
    { module: 'marketing', action: 'read', description: 'View coupons and promotions' },
    { module: 'marketing', action: 'write', description: 'Manage coupons and banners' },
    { module: 'support', action: 'read', description: 'View support tickets and disputes' },
    { module: 'support', action: 'write', description: 'Reply to tickets and resolve disputes' },

    // Analytics & Settings
    { module: 'analytics', action: 'read', description: 'View executive telemetry and trends' },
    { module: 'settings', action: 'read', description: 'View platform configuration' },
    { module: 'settings', action: 'write', description: 'Modify global platform parameters' },
  ];

  const dbPermissions: Record<string, string> = {};
  for (const perm of permissions) {
    const created = await prisma.permission.upsert({
      where: { module_action: { module: perm.module, action: perm.action } },
      update: { description: perm.description },
      create: perm,
    });
    dbPermissions[`${perm.module}:${perm.action}`] = created.id;
  }

  // 2. Define the 7 Explicit Roles
  console.log('2. Seeding 7 RBAC roles...');
  const rolesConfig = [
    {
      name: 'Super Admin',
      slug: 'SUPER_ADMIN',
      description: 'Full unrestricted platform control. Manages roles, staff, and system settings.',
      isSystem: true,
      permissions: Object.keys(dbPermissions), // All permissions
    },
    {
      name: 'Admin',
      slug: 'ADMIN',
      description: 'General system administration across operations, catalog, and support.',
      isSystem: true,
      permissions: [
        'users:read', 'users:suspend', 'customers:read', 'customers:write',
        'vendors:read', 'vendors:write', 'riders:read', 'riders:write',
        'catalog:read', 'catalog:write', 'orders:read', 'orders:write',
        'logistics:read', 'logistics:write', 'finance:read', 'finance:write',
        'marketing:read', 'marketing:write', 'support:read', 'support:write',
        'analytics:read', 'settings:read',
      ],
    },
    {
      name: 'Operations Manager',
      slug: 'OPERATIONS_MANAGER',
      description: 'Monitors order fulfillment, vendor catalog quality, and rider operations.',
      isSystem: true,
      permissions: [
        'users:read', 'customers:read', 'vendors:read', 'riders:read', 'riders:write',
        'catalog:read', 'catalog:write', 'orders:read', 'orders:write',
        'logistics:read', 'logistics:write', 'analytics:read',
      ],
    },
    {
      name: 'Catalog Manager',
      slug: 'CATALOG_MANAGER',
      description: 'Manages products, categories, brands, and vendor catalog approvals.',
      isSystem: true,
      permissions: [
        'users:read', 'vendors:read', 'catalog:read', 'catalog:write',
      ],
    },
    {
      name: 'Finance Manager',
      slug: 'FINANCE_MANAGER',
      description: 'Manages payment reconciliations, refunds, settlements, and commission payouts.',
      isSystem: true,
      permissions: [
        'finance:read', 'finance:write', 'orders:read', 'analytics:read',
      ],
    },
    {
      name: 'Logistics Manager',
      slug: 'LOGISTICS_MANAGER',
      description: 'Oversees rider fleet, live delivery tracking, and delivery zones.',
      isSystem: true,
      permissions: [
        'users:read', 'riders:read', 'riders:write', 'logistics:read', 'logistics:write',
        'orders:read', 'analytics:read',
      ],
    },
    {
      name: 'Support Agent',
      slug: 'SUPPORT_AGENT',
      description: 'Handles customer support tickets, disputes, and rider fleet coordination.',
      isSystem: true,
      permissions: [
        'users:read', 'customers:read', 'riders:read', 'riders:write',
        'orders:read', 'support:read', 'support:write',
      ],
    },
  ];

  const roleMap: Record<string, string> = {};
  for (const r of rolesConfig) {
    const role = await prisma.role.upsert({
      where: { slug: r.slug },
      update: { name: r.name, description: r.description },
      create: {
        name: r.name,
        slug: r.slug,
        description: r.description,
        isSystem: r.isSystem,
      },
    });
    roleMap[r.slug] = role.id;

    // Clear existing permissions and map new ones
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const permKey of r.permissions) {
      const permId = dbPermissions[permKey];
      if (permId) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: permId },
        });
      }
    }
  }

  // 3. Seed Demo Admin Accounts for Each Role
  console.log('3. Seeding admin users for each role...');
  const defaultPassword = await bcrypt.hash('Admin@123456', 10);

  const demoAdmins = [
    { email: 'admin@sevazo.com', name: 'Alex Vance (Super Admin)', roleSlug: 'SUPER_ADMIN' },
    { email: 'general.admin@sevazo.com', name: 'Sarah Connor (Admin)', roleSlug: 'ADMIN' },
    { email: 'ops@sevazo.com', name: 'Marcus Brody (Operations)', roleSlug: 'OPERATIONS_MANAGER' },
    { email: 'catalog@sevazo.com', name: 'Elena Rostova (Catalog)', roleSlug: 'CATALOG_MANAGER' },
    { email: 'finance@sevazo.com', name: 'Gordon Gekko (Finance)', roleSlug: 'FINANCE_MANAGER' },
    { email: 'logistics@sevazo.com', name: 'Dom Toretto (Logistics)', roleSlug: 'LOGISTICS_MANAGER' },
    { email: 'support@sevazo.com', name: 'Clara Oswald (Support)', roleSlug: 'SUPPORT_AGENT' },
  ];

  for (const admin of demoAdmins) {
    await prisma.adminUser.upsert({
      where: { email: admin.email },
      update: {
        name: admin.name,
        roleId: roleMap[admin.roleSlug],
        status: UserStatus.ACTIVE,
      },
      create: {
        email: admin.email,
        passwordHash: defaultPassword,
        name: admin.name,
        roleId: roleMap[admin.roleSlug],
        status: UserStatus.ACTIVE,
      },
    });
  }

  // 4. Default Categories
  console.log('4. Seeding categories...');
  const grocery = await prisma.category.upsert({
    where: { slug: 'grocery' },
    update: {},
    create: {
      name: 'Grocery & Essentials',
      slug: 'grocery',
      description: 'Daily fresh groceries, dairy and staples',
      status: UserStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'fruits-vegetables' },
    update: {},
    create: {
      name: 'Fruits & Vegetables',
      slug: 'fruits-vegetables',
      parentId: grocery.id,
      status: UserStatus.ACTIVE,
      sortOrder: 1,
    },
  });

  await prisma.category.upsert({
    where: { slug: 'electronics' },
    update: {},
    create: {
      name: 'Electronics & Mobiles',
      slug: 'electronics',
      description: 'Smartphones, gadgets and accessories',
      status: UserStatus.ACTIVE,
      sortOrder: 2,
    },
  });

  // 5. System Settings
  console.log('5. Seeding platform settings...');
  const settings = [
    { key: 'PLATFORM_COMMISSION_DEFAULT', value: '12.0', description: 'Default percentage commission rate', group: 'FINANCE' },
    { key: 'DELIVERY_BASE_FEE', value: '30.0', description: 'Base delivery fee per order (INR)', group: 'LOGISTICS' },
    { key: 'MAX_DELIVERY_RADIUS_KM', value: '15.0', description: 'Maximum delivery radius per store in KM', group: 'LOGISTICS' },
    { key: 'AUTO_ASSIGN_RIDERS', value: 'true', description: 'Automatically dispatch closest rider on order ready', group: 'LOGISTICS' },
    { key: 'GST_TAX_RATE', value: '18.0', description: 'Applicable GST rate on platform services', group: 'FINANCE' },
  ];

  for (const s of settings) {
    await prisma.systemSetting.upsert({
      where: { key: s.key },
      update: { value: s.value, description: s.description, group: s.group },
      create: s,
    });
  }

  console.log('✅ RBAC & System Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
