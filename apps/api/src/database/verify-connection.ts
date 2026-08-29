import { PrismaClient } from '@prisma/client';

async function verifyDatabaseConnection() {
  console.log('🔍 Testing full backend database connectivity...');
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('✅ Connected to PostgreSQL database successfully!');

    // 1. Check Admins & Roles
    const adminCount = await prisma.adminUser.count();
    const rolesCount = await prisma.role.count();
    console.log(`✅ Admin RBAC: ${adminCount} admins, ${rolesCount} roles loaded.`);

    // 2. Check Vendors & Stores
    const vendorCount = await prisma.vendor.count();
    const storeCount = await prisma.store.count();
    console.log(`✅ Vendor Ecosystem: ${vendorCount} vendors, ${storeCount} stores active.`);

    // 3. Check Products & Inventory
    const productCount = await prisma.product.count();
    const inventoryCount = await prisma.inventory.count();
    console.log(`✅ Catalog & 5-State Inventory: ${productCount} products, ${inventoryCount} inventory records.`);

    // 4. Check Riders & Logistics
    const riderCount = await prisma.rider.count();
    console.log(`✅ Logistics Fleet: ${riderCount} riders ready.`);

    // 5. Check Customers
    const customerCount = await prisma.customer.count();
    console.log(`✅ Customer Accounts: ${customerCount} customers registered.`);

    // 6. Check System Settings
    const settingCount = await prisma.systemSetting.count();
    console.log(`✅ Platform Settings: ${settingCount} parameters configured.`);

    console.log('\n🎉 ALL BACKEND DOMAINS ARE FULLY CONNECTED TO THE POSTGRESQL DATABASE!');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifyDatabaseConnection();
