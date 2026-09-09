import { createClient, Client } from '@libsql/client/web';
import { mockCategories, mockProducts } from './mockData';
import { BLINKIT_GROUPED_CATEGORIES, GroupedCategorySection, SubCategoryItem } from './categoryCatalogData';
import { Category, Product, Address, Order } from '../types';

/**
 * Environment variable resolution supporting:
 * - Vercel Expo/Web: EXPO_PUBLIC_TURSO_DATABASE_URL / EXPO_PUBLIC_TURSO_AUTH_TOKEN
 * - Vercel Serverless / Node: TURSO_DATABASE_URL / TURSO_AUTH_TOKEN
 * - Common aliases: EXPO_PUBLIC_TURSO_URL / EXPO_PUBLIC_TURSO_KEY / TURSO_URL / TURSO_KEY / TURSO_API_KEY
 */
function getTursoCredentials(): { url: string; authToken: string } {
  const env = typeof process !== 'undefined' && process.env ? process.env : ({} as Record<string, string | undefined>);

  const url =
    env.EXPO_PUBLIC_TURSO_DATABASE_URL ||
    env.EXPO_PUBLIC_TURSO_URL ||
    env.TURSO_DATABASE_URL ||
    env.TURSO_URL ||
    '';

  const authToken =
    env.EXPO_PUBLIC_TURSO_AUTH_TOKEN ||
    env.EXPO_PUBLIC_TURSO_KEY ||
    env.EXPO_PUBLIC_TURSO_API_KEY ||
    env.TURSO_AUTH_TOKEN ||
    env.TURSO_KEY ||
    env.TURSO_API_KEY ||
    '';

  // Normalize libsql:// to https:// for HTTP transport compatibility
  const normalizedUrl = (url || '').trim().replace(/^libsql:\/\//i, 'https://');

  return { url: normalizedUrl, authToken: (authToken || '').trim() };
}

class TursoDatabaseService {
  private client: Client | null = null;
  private isInitialized = false;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const { url, authToken } = getTursoCredentials();
    if (url) {
      try {
        this.client = createClient({
          url,
          authToken: authToken || undefined,
        });
        console.log('[Turso] Initialized client for:', url);
      } catch (err) {
        console.warn('[Turso] Failed to initialize client:', err);
        this.client = null;
      }
    }
  }

  public isConfigured(): boolean {
    const { url } = getTursoCredentials();
    return Boolean(url && url.length > 0);
  }

  public getClient(): Client | null {
    if (!this.client && this.isConfigured()) {
      this.initClient();
    }
    return this.client;
  }

  /**
   * Universal SQL query returning typed objects
   */
  public async query<T = any>(sql: string, args: any[] = []): Promise<T[]> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Turso Database is not configured. Please set TURSO_DATABASE_URL & TURSO_AUTH_TOKEN.');
    }

    const result = await client.execute({ sql, args });
    return result.rows as unknown as T[];
  }

  /**
   * Universal SQL execution for INSERT, UPDATE, DELETE
   */
  public async execute(sql: string, args: any[] = []): Promise<{ rowsAffected: number; lastInsertRowid?: any }> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Turso Database is not configured. Please set TURSO_DATABASE_URL & TURSO_AUTH_TOKEN.');
    }

    const result = await client.execute({ sql, args });
    return {
      rowsAffected: result.rowsAffected,
      lastInsertRowid: result.lastInsertRowid,
    };
  }

  /**
   * Execute multiple statements in a batch transaction
   */
  public async batch(statements: Array<{ sql: string; args?: any[] }>): Promise<any[]> {
    const client = this.getClient();
    if (!client) {
      throw new Error('Turso Database is not configured.');
    }

    const results = await client.batch(statements.map((s) => ({ sql: s.sql, args: s.args || [] })));
    return results;
  }

  /**
   * Health check / ping test
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.isConfigured()) {
        return {
          success: false,
          message: 'TURSO_DATABASE_URL / EXPO_PUBLIC_TURSO_DATABASE_URL is not set in environment variables.',
        };
      }

      const client = this.getClient();
      if (!client) {
        return { success: false, message: 'Could not create Turso client.' };
      }

      const result = await client.execute('SELECT 1 AS ping');
      if (result && result.rows.length > 0) {
        return { success: true, message: 'Connected to Turso Database successfully!' };
      }
      return { success: false, message: 'Unexpected response from Turso.' };
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Failed to connect to Turso Database.',
      };
    }
  }

  /**
   * Initialize SevaZo schema tables in Turso SQLite
   */
  public async ensureSchema(): Promise<void> {
    if (this.isInitialized || !this.isConfigured()) return;

    try {
      const client = this.getClient();
      if (!client) return;

      console.log('[Turso] Verifying database schema tables...');

      await client.batch([
        // Categories
        {
          sql: `CREATE TABLE IF NOT EXISTS categories (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            icon TEXT,
            image_url TEXT,
            item_count INTEGER DEFAULT 0,
            section_title TEXT
          );`,
        },
        // Subcategories
        {
          sql: `CREATE TABLE IF NOT EXISTS subcategories (
            id TEXT PRIMARY KEY,
            category_id TEXT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL,
            image_url TEXT,
            query TEXT
          );`,
        },
        // Products
        {
          sql: `CREATE TABLE IF NOT EXISTS products (
            id TEXT PRIMARY KEY,
            category_id TEXT,
            name TEXT NOT NULL,
            description TEXT,
            price REAL NOT NULL,
            compare_at_price REAL,
            discount_badge TEXT,
            image_url TEXT,
            unit TEXT,
            in_stock INTEGER DEFAULT 1,
            rating REAL DEFAULT 4.8,
            delivery_eta_minutes INTEGER DEFAULT 10
          );`,
        },
        // Customer Addresses
        {
          sql: `CREATE TABLE IF NOT EXISTS addresses (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            label TEXT,
            line1 TEXT NOT NULL,
            line2 TEXT,
            landmark TEXT,
            city TEXT,
            state TEXT,
            pincode TEXT,
            is_default INTEGER DEFAULT 0,
            contact_name TEXT,
            contact_phone TEXT
          );`,
        },
        // Orders
        {
          sql: `CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            order_number TEXT NOT NULL,
            user_id TEXT,
            vendor_id TEXT DEFAULT 'vnd-001',
            store_id TEXT DEFAULT 'store-1',
            store_name TEXT DEFAULT 'SevaZo Dark Store',
            customer_name TEXT,
            customer_phone TEXT,
            status TEXT NOT NULL,
            payment_status TEXT DEFAULT 'PAID',
            payment_method TEXT,
            total_amount REAL NOT NULL,
            delivery_address TEXT,
            items_json TEXT NOT NULL,
            created_at TEXT NOT NULL
          );`,
        },
        // Vendor Notifications & Order Requests
        {
          sql: `CREATE TABLE IF NOT EXISTS vendor_notifications (
            id TEXT PRIMARY KEY,
            vendor_id TEXT NOT NULL,
            order_id TEXT NOT NULL,
            order_number TEXT NOT NULL,
            type TEXT NOT NULL,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            total_amount REAL NOT NULL,
            items_count INTEGER NOT NULL,
            customer_name TEXT,
            customer_phone TEXT,
            delivery_address TEXT,
            status TEXT DEFAULT 'PENDING',
            created_at TEXT NOT NULL
          );`,
        },
        // Cart Items
        {
          sql: `CREATE TABLE IF NOT EXISTS cart_items (
            id TEXT PRIMARY KEY,
            user_id TEXT,
            product_id TEXT NOT NULL,
            quantity INTEGER NOT NULL,
            updated_at TEXT NOT NULL
          );`,
        },
      ]);

      // Safe column migration for existing orders table
      const tryAddCol = async (colDef: string) => {
        try {
          await client.execute(`ALTER TABLE orders ADD COLUMN ${colDef}`);
        } catch {}
      };
      await tryAddCol("vendor_id TEXT DEFAULT 'vnd-001'");
      await tryAddCol("store_id TEXT DEFAULT 'store-1'");
      await tryAddCol("store_name TEXT DEFAULT 'SevaZo Dark Store'");
      await tryAddCol('customer_name TEXT');
      await tryAddCol('customer_phone TEXT');

      this.isInitialized = true;
      console.log('[Turso] Database schema is ready.');

      // Auto-seed initial catalog if categories are empty
      await this.seedIfEmpty();
    } catch (err) {
      console.warn('[Turso] Schema initialization failed:', err);
    }
  }

  /**
   * Automatically populate categories & products if database is fresh
   */
  private async seedIfEmpty(): Promise<void> {
    try {
      const client = this.getClient();
      if (!client) return;

      const check = await client.execute('SELECT COUNT(*) as count FROM categories');
      const count = Number(check.rows[0]?.count || 0);

      if (count === 0) {
        console.log('[Turso] Seeding initial catalog data into Turso...');

        const statements: Array<{ sql: string; args: any[] }> = [];

        // Seed Grouped categories and subcategories
        for (const grp of BLINKIT_GROUPED_CATEGORIES) {
          statements.push({
            sql: `INSERT OR IGNORE INTO categories (id, name, slug, image_url, section_title) VALUES (?, ?, ?, ?, ?)`,
            args: [grp.id, grp.title, grp.slug, grp.subcategories[0]?.imageUrl || '', grp.title],
          });

          for (const sub of grp.subcategories) {
            statements.push({
              sql: `INSERT OR IGNORE INTO subcategories (id, category_id, name, slug, image_url, query) VALUES (?, ?, ?, ?, ?, ?)`,
              args: [sub.id, grp.id, sub.name, sub.slug, sub.imageUrl, sub.query || sub.name],
            });
          }
        }

        // Seed Products
        for (const p of mockProducts) {
          statements.push({
            sql: `INSERT OR IGNORE INTO products (
              id, category_id, name, description, price, compare_at_price, discount_badge, image_url, unit, in_stock, rating, delivery_eta_minutes
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            args: [
              p.id,
              p.categoryId || 'cat-grocery',
              p.name,
              p.description || '',
              p.price,
              p.compareAtPrice || null,
              p.discountBadge || '',
              p.images?.[0] || '',
              p.unit || '1 unit',
              p.inStock ? 1 : 0,
              p.rating || 4.8,
              p.deliveryEtaMinutes || 10,
            ],
          });
        }

        // Execute batch insertion
        if (statements.length > 0) {
          await client.batch(statements);
          console.log(`[Turso] Successfully seeded ${statements.length} items into Turso!`);
        }
      }
    } catch (err) {
      console.warn('[Turso] Seeding failed:', err);
    }
  }

  // ==================== REPOSITORY METHODS ====================

  /**
   * Fetch all categories with their subcategories
   */
  public async getCategories(): Promise<Category[]> {
    await this.ensureSchema();
    const catRows = await this.query<any>('SELECT * FROM categories');
    if (!catRows || catRows.length === 0) return mockCategories;

    const subRows = await this.query<any>('SELECT * FROM subcategories');

    return catRows.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      imageUrl: cat.image_url,
      itemCount: cat.item_count || 0,
      subcategories: subRows
        .filter((sub) => sub.category_id === cat.id)
        .map((sub) => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          imageUrl: sub.image_url,
        })),
    }));
  }

  /**
   * Fetch grouped sections compatible with BlinkitGroupedCategoryGrid
   */
  public async getGroupedCategories(): Promise<GroupedCategorySection[]> {
    if (!this.isConfigured()) return BLINKIT_GROUPED_CATEGORIES;

    try {
      await this.ensureSchema();
      const categories = await this.query<any>('SELECT * FROM categories');
      const subcategories = await this.query<any>('SELECT * FROM subcategories');

      if (!categories || categories.length === 0) {
        return BLINKIT_GROUPED_CATEGORIES;
      }

      return categories.map((cat) => ({
        id: cat.id,
        title: cat.name,
        slug: cat.slug,
        subcategories: subcategories
          .filter((sub) => sub.category_id === cat.id)
          .map((sub) => ({
            id: sub.id,
            name: sub.name,
            slug: sub.slug,
            imageUrl: sub.image_url,
            query: sub.query || sub.name,
          })),
      }));
    } catch (err) {
      console.warn('[Turso] getGroupedCategories error, fallback:', err);
      return BLINKIT_GROUPED_CATEGORIES;
    }
  }

  /**
   * Fetch products with optional filters
   */
  public async getProducts(params?: {
    categoryId?: string;
    query?: string;
    minPrice?: number;
    maxPrice?: number;
    inStockOnly?: boolean;
    sortBy?: 'popular' | 'price_asc' | 'price_desc' | 'rating';
  }): Promise<Product[]> {
    await this.ensureSchema();

    let sql = 'SELECT * FROM products WHERE 1=1';
    const args: any[] = [];

    if (params?.categoryId) {
      sql += ' AND category_id = ?';
      args.push(params.categoryId);
    }
    if (params?.query) {
      sql += ' AND (name LIKE ? OR description LIKE ?)';
      args.push(`%${params.query}%`, `%${params.query}%`);
    }
    if (params?.minPrice !== undefined) {
      sql += ' AND price >= ?';
      args.push(params.minPrice);
    }
    if (params?.maxPrice !== undefined) {
      sql += ' AND price <= ?';
      args.push(params.maxPrice);
    }
    if (params?.inStockOnly) {
      sql += ' AND in_stock = 1';
    }

    if (params?.sortBy === 'price_asc') {
      sql += ' ORDER BY price ASC';
    } else if (params?.sortBy === 'price_desc') {
      sql += ' ORDER BY price DESC';
    } else if (params?.sortBy === 'rating') {
      sql += ' ORDER BY rating DESC';
    }

    const rows = await this.query<any>(sql, args);
    if (!rows || rows.length === 0) return [];

    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: (r.name || '').toLowerCase().replace(/\s+/g, '-'),
      description: r.description || '',
      categoryId: r.category_id || '',
      vendorId: 'vendor-turso',
      price: Number(r.price),
      compareAtPrice: r.compare_at_price ? Number(r.compare_at_price) : undefined,
      discountBadge: r.discount_badge || undefined,
      stock: 50,
      unit: r.unit || '1 unit',
      rating: Number(r.rating || 4.8),
      reviewsCount: 120,
      images: [r.image_url || ''],
      tags: ['turso', 'instant-delivery'],
      inStock: Boolean(r.in_stock),
      deliveryEtaMinutes: Number(r.delivery_eta_minutes || 10),
    }));
  }

  /**
   * Fetch single product by id
   */
  public async getProductById(id: string): Promise<Product | null> {
    await this.ensureSchema();
    const rows = await this.query<any>('SELECT * FROM products WHERE id = ?', [id]);
    if (!rows || rows.length === 0) return null;

    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      slug: (r.name || '').toLowerCase().replace(/\s+/g, '-'),
      description: r.description || '',
      categoryId: r.category_id || '',
      vendorId: 'vendor-turso',
      price: Number(r.price),
      compareAtPrice: r.compare_at_price ? Number(r.compare_at_price) : undefined,
      discountBadge: r.discount_badge || undefined,
      stock: 50,
      unit: r.unit || '1 unit',
      rating: Number(r.rating || 4.8),
      reviewsCount: 120,
      images: [r.image_url || ''],
      tags: ['turso', 'instant-delivery'],
      inStock: Boolean(r.in_stock),
      deliveryEtaMinutes: Number(r.delivery_eta_minutes || 10),
    };
  }

  /**
   * Customer addresses
   */
  public async getAddresses(userId?: string): Promise<Address[]> {
    await this.ensureSchema();
    const sql = userId
      ? 'SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC'
      : 'SELECT * FROM addresses ORDER BY is_default DESC';
    const args = userId ? [userId] : [];

    const rows = await this.query<any>(sql, args);
    return rows.map((r) => ({
      id: r.id,
      customerId: r.user_id || '',
      label: r.label || 'Home',
      line1: r.line1,
      line2: r.line2 || undefined,
      landmark: r.landmark || undefined,
      city: r.city || '',
      state: r.state || '',
      pincode: r.pincode || '',
      isDefault: Boolean(r.is_default),
      contactName: r.contact_name || undefined,
      contactPhone: r.contact_phone || undefined,
    }));
  }

  public async saveAddress(address: Partial<Address>): Promise<Address> {
    await this.ensureSchema();
    const newAddress: Address = {
      id: address.id || `addr-${Date.now()}`,
      customerId: address.customerId || 'default-user',
      label: address.label || 'Home',
      line1: address.line1 || '',
      line2: address.line2,
      landmark: address.landmark,
      city: address.city || '',
      state: address.state || '',
      pincode: address.pincode || '',
      isDefault: !!address.isDefault,
      contactName: address.contactName || '',
      contactPhone: address.contactPhone || '',
    };

    if (newAddress.isDefault) {
      await this.execute('UPDATE addresses SET is_default = 0');
    }

    await this.execute(
      `INSERT OR REPLACE INTO addresses (id, user_id, label, line1, line2, landmark, city, state, pincode, is_default, contact_name, contact_phone)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newAddress.id,
        newAddress.customerId,
        newAddress.label,
        newAddress.line1,
        newAddress.line2 || '',
        newAddress.landmark || '',
        newAddress.city,
        newAddress.state,
        newAddress.pincode,
        newAddress.isDefault ? 1 : 0,
        newAddress.contactName || '',
        newAddress.contactPhone || '',
      ]
    );

    return newAddress;
  }

  public async deleteAddress(id: string): Promise<boolean> {
    await this.ensureSchema();
    const result = await this.execute('DELETE FROM addresses WHERE id = ?', [id]);
    return result.rowsAffected > 0;
  }

  /**
   * Orders
   */
  public async getOrders(userId?: string): Promise<Order[]> {
    await this.ensureSchema();
    const sql = userId
      ? 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC'
      : 'SELECT * FROM orders ORDER BY created_at DESC';
    const args = userId ? [userId] : [];

    const rows = await this.query<any>(sql, args);
    return rows.map((r) => {
      let items: any[] = [];
      try {
        items = JSON.parse(r.items_json);
      } catch {}

      let deliveryAddress: any = r.delivery_address;
      try {
        if (typeof r.delivery_address === 'string' && r.delivery_address.startsWith('{')) {
          deliveryAddress = JSON.parse(r.delivery_address);
        }
      } catch {}

      return {
        id: r.id,
        orderNumber: r.order_number,
        createdAt: r.created_at,
        status: r.status as any,
        paymentStatus: (r.payment_status || 'PAID') as any,
        paymentMethod: (r.payment_method || 'UPI') as any,
        items,
        subtotal: Number(r.total_amount),
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        totalAmount: Number(r.total_amount),
        deliveryAddress,
        store: { id: 'store-1', businessName: 'SevaZo Dark Store' },
        canCancel: r.status === 'CONFIRMED' || r.status === 'PENDING',
        canReturn: r.status === 'DELIVERED',
      };
    });
  }

  public async saveOrder(
    order: Order,
    userId = 'default-user',
    extra?: {
      vendorId?: string;
      storeId?: string;
      storeName?: string;
      customerName?: string;
      customerPhone?: string;
    }
  ): Promise<Order> {
    await this.ensureSchema();
    const vendorId = extra?.vendorId || (order as any).vendorId || order.store?.id || 'vnd-001';
    const storeId = extra?.storeId || (order as any).storeId || order.store?.id || 'store-1';
    const storeName = extra?.storeName || (order as any).storeName || order.store?.businessName || 'SevaZo Dark Store';
    const customerName = extra?.customerName || (order as any).customerName || 'Customer';
    const customerPhone = extra?.customerPhone || (order as any).customerPhone || '';

    await this.execute(
      `INSERT INTO orders (
        id, order_number, user_id, vendor_id, store_id, store_name, customer_name, customer_phone,
        status, payment_status, payment_method, total_amount, delivery_address, items_json, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.id,
        order.orderNumber,
        userId,
        vendorId,
        storeId,
        storeName,
        customerName,
        customerPhone,
        order.status,
        order.paymentStatus || 'PAID',
        order.paymentMethod || 'UPI',
        order.totalAmount,
        typeof order.deliveryAddress === 'string'
          ? order.deliveryAddress
          : JSON.stringify(order.deliveryAddress || {}),
        JSON.stringify(order.items || []),
        order.createdAt,
      ]
    );

    return order;
  }

  /**
   * Save a vendor notification / order request
   */
  public async createVendorNotification(notification: {
    vendorId: string;
    orderId: string;
    orderNumber: string;
    type?: string;
    title: string;
    message: string;
    totalAmount: number;
    itemsCount: number;
    customerName?: string;
    customerPhone?: string;
    deliveryAddress?: string;
  }): Promise<any> {
    await this.ensureSchema();
    const id = `vnotif-${Date.now()}`;
    const createdAt = new Date().toISOString();
    await this.execute(
      `INSERT INTO vendor_notifications (
        id, vendor_id, order_id, order_number, type, title, message, total_amount, items_count,
        customer_name, customer_phone, delivery_address, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?)`,
      [
        id,
        notification.vendorId,
        notification.orderId,
        notification.orderNumber,
        notification.type || 'NEW_ORDER_REQUEST',
        notification.title,
        notification.message,
        notification.totalAmount,
        notification.itemsCount,
        notification.customerName || 'Customer',
        notification.customerPhone || '',
        notification.deliveryAddress || '',
        createdAt,
      ]
    );
    return { id, ...notification, createdAt, status: 'PENDING' };
  }

  /**
   * Fetch vendor notifications / requests
   */
  public async getVendorNotifications(vendorId = 'vnd-001'): Promise<any[]> {
    await this.ensureSchema();
    const rows = await this.query<any>(
      'SELECT * FROM vendor_notifications WHERE vendor_id = ? ORDER BY created_at DESC',
      [vendorId]
    );
    return rows;
  }

  /**
   * Fetch orders for vendor by tab ('NEW' / 'ACCEPTED' / 'PREPARING' / 'READY' / 'HISTORY')
   */
  public async getVendorOrders(vendorId = 'vnd-001', tab?: string): Promise<Order[]> {
    await this.ensureSchema();
    let sql = 'SELECT * FROM orders WHERE (vendor_id = ? OR vendor_id IS NULL)';
    const args: any[] = [vendorId];

    if (tab === 'NEW') {
      sql += " AND status = 'PENDING'";
    } else if (tab === 'ACCEPTED') {
      sql += " AND status = 'CONFIRMED'";
    } else if (tab === 'PREPARING') {
      sql += " AND status = 'PREPARING'";
    } else if (tab === 'READY') {
      sql += " AND status = 'READY_FOR_PICKUP'";
    } else if (tab === 'HISTORY') {
      sql += " AND status IN ('DELIVERED', 'CANCELLED', 'RETURNED')";
    }
    sql += ' ORDER BY created_at DESC';

    const rows = await this.query<any>(sql, args);
    return rows.map((r) => {
      let items: any[] = [];
      try {
        items = JSON.parse(r.items_json);
      } catch {}

      let deliveryAddress: any = r.delivery_address;
      try {
        if (typeof r.delivery_address === 'string' && r.delivery_address.startsWith('{')) {
          deliveryAddress = JSON.parse(r.delivery_address);
        }
      } catch {}

      return {
        id: r.id,
        orderNumber: r.order_number,
        createdAt: r.created_at,
        status: r.status as any,
        paymentStatus: (r.payment_status || 'PAID') as any,
        paymentMethod: (r.payment_method || 'UPI') as any,
        items,
        subtotal: Number(r.total_amount),
        deliveryFee: 0,
        tax: 0,
        discount: 0,
        totalAmount: Number(r.total_amount),
        deliveryAddress,
        store: { id: r.store_id || 'store-1', businessName: r.store_name || 'SevaZo Dark Store' },
        canCancel: r.status === 'CONFIRMED' || r.status === 'PENDING',
        canReturn: r.status === 'DELIVERED',
      };
    });
  }

  /**
   * Update order status (used when vendor accepts or updates order)
   */
  public async updateOrderStatus(orderId: string, status: string): Promise<boolean> {
    await this.ensureSchema();
    const res = await this.execute(
      'UPDATE orders SET status = ? WHERE id = ? OR order_number = ?',
      [status, orderId, orderId]
    );
    await this.execute(
      'UPDATE vendor_notifications SET status = ? WHERE order_id = ? OR order_number = ?',
      [status === 'CONFIRMED' ? 'ACCEPTED' : status, orderId, orderId]
    );
    return res.rowsAffected > 0;
  }
}

export const tursoDb = new TursoDatabaseService();
