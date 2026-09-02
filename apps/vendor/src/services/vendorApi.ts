import { apiClient } from './api';
import {
  VendorUser,
  Product,
  ProductVariant,
  Order,
  InventoryLog,
  Settlement,
  Commission,
  Coupon,
  NotificationItem,
  SupportTicket,
} from '../types';
import {
  mockVendor,
  blankDraftVendor,
  mockProducts,
  mockOrders,
  mockInventoryLogs,
  mockSettlements,
  mockNotifications,
} from './mockData';

// Simulated state for offline / preview demo mode
let localProducts = [...mockProducts];
let localOrders = [...mockOrders];
let localVendor = { ...blankDraftVendor };
let localLogs = [...mockInventoryLogs];

export const VendorApi = {
  // 1. Auth & Profile
  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post('/vendor/auth/send-otp', { phone });
    } catch {
      return { success: true, message: `OTP 123456 sent to ${phone}` };
    }
  },

  async verifyOtp(target: string, otp: string): Promise<{ accessToken: string; refreshToken?: string; vendor: VendorUser; status?: string; nextAction?: string }> {
    try {
      const isEmail = target.includes('@');
      const res: any = await apiClient.post('/vendor/auth/verify-otp', isEmail ? { email: target, otp } : { phone: target, otp });
      return res;
    } catch {
      let fallbackVendor: any = null;
      const isEmail = target.includes('@');
      const clean10 = target.replace(/\D/g, '').slice(-10);

      // Query Admin live sync on multiple host candidates
      const adminHosts = [
        'http://localhost:3000',
        'http://192.168.1.7:3000',
        'http://10.0.2.2:3000',
      ];

      for (const host of adminHosts) {
        try {
          const adminRes = await fetch(`${host}/api/applications/vendors`);
          const adminJson = await adminRes.json();
          if (adminJson?.data && Array.isArray(adminJson.data)) {
            const match = adminJson.data.find(
              (v: any) =>
                (isEmail && v.email && v.email.toLowerCase().trim() === target.toLowerCase().trim()) ||
                (!isEmail && (v.phone || '').replace(/\D/g, '').slice(-10) === clean10),
            );
            if (match) {
              fallbackVendor = match;
              break;
            }
          }
        } catch (e) {}
      }

      const isApproved =
        fallbackVendor?.approvalStatus === 'approved' ||
        fallbackVendor?.approvalStatus === 'APPROVED' ||
        fallbackVendor?.status === 'active' ||
        fallbackVendor?.status === 'ACTIVE';

      const isSubmitted =
        fallbackVendor?.approvalStatus === 'pending' ||
        fallbackVendor?.approvalStatus === 'under_review' ||
        fallbackVendor?.status === 'pending';

      const status = isApproved ? 'APPROVED' : isSubmitted ? 'UNDER_REVIEW' : (localVendor.status || 'DRAFT');
      const nextAction = isApproved ? 'GO_TO_DASHBOARD' : isSubmitted ? 'VIEW_STATUS' : 'CONTINUE_ONBOARDING';

      const resolvedVendor = {
        ...localVendor,
        ...(fallbackVendor || {}),
        phone: fallbackVendor?.phone || (!isEmail ? target : localVendor.phone || '9876543210'),
        email: fallbackVendor?.email || (isEmail ? target : localVendor.email || ''),
        status: status as any,
        approvalStatus: isApproved ? 'APPROVED' : isSubmitted ? 'PENDING' : 'PENDING',
      };
      localVendor = resolvedVendor;

      return {
        accessToken: 'mock-jwt-token-vnd-' + (fallbackVendor?.id || '001'),
        refreshToken: 'mock-refresh-token-vnd-' + (fallbackVendor?.id || '001'),
        vendor: resolvedVendor,
        status,
        nextAction,
      };
    }
  },

  async registerOtp(payload: { phone: string; email: string }): Promise<{ success: boolean; message: string }> {
    try {
      return await apiClient.post('/vendor/auth/register-otp', payload);
    } catch {
      return { success: true, message: `Registration OTP 123456 sent to ${payload.email || payload.phone}` };
    }
  },

  async verifyRegisterOtp(payload: { phone: string; email: string; otp: string }): Promise<{ accessToken: string; refreshToken?: string; vendor: VendorUser; status?: string; nextAction?: string }> {
    try {
      const res: any = await apiClient.post('/vendor/auth/verify-register-otp', payload);
      return res;
    } catch {
      const clean10 = payload.phone.replace(/\D/g, '').slice(-10);
      const isApproved = false;
      const isSubmitted = false;

      const status = 'DRAFT';
      const nextAction = 'CONTINUE_ONBOARDING';

      const resolvedVendor = {
        ...localVendor,
        phone: payload.phone,
        email: payload.email,
        status: status as any,
        approvalStatus: 'PENDING' as any,
        currentOnboardingStep: 1,
      };
      localVendor = resolvedVendor;

      return {
        accessToken: 'mock-jwt-token-vnd-' + (clean10 || 'new'),
        refreshToken: 'mock-refresh-token-vnd-' + (clean10 || 'new'),
        vendor: resolvedVendor,
        status,
        nextAction,
      };
    }
  },

  async login(identifier: string, password?: string, otp?: string): Promise<{ accessToken: string; vendor: VendorUser }> {
    try {
      const res: any = await apiClient.post('/vendor/auth/login', { identifier, password, otp });
      return res;
    } catch {
      return {
        accessToken: 'mock-jwt-token-vnd-001',
        vendor: localVendor,
      };
    }
  },

  async register(data: any): Promise<{ accessToken: string; vendor: VendorUser }> {
    try {
      const res: any = await apiClient.post('/vendor/auth/register', data);
      return res;
    } catch {
      localVendor = { ...localVendor, ...data, approvalStatus: 'PENDING' };
      return {
        accessToken: 'mock-jwt-token-vnd-001',
        vendor: localVendor,
      };
    }
  },

  async getProfile(): Promise<VendorUser> {
    try {
      const res: any = await apiClient.get('/vendor/auth/me');
      return res;
    } catch {
      return localVendor;
    }
  },

  async logout(): Promise<any> {
    try {
      return await apiClient.post('/vendor/auth/logout');
    } catch {
      return { success: true };
    }
  },

  // 2. Onboarding Engine
  async getBusinessInfo(): Promise<any> {
    try {
      const res: any = await apiClient.get('/vendor/onboarding/business');
      return res.data || res;
    } catch {
      return {
        businessName: localVendor.businessName || '',
        displayName: localVendor.displayName || localVendor.storeName || '',
        legalEntityType: localVendor.legalEntityType || 'PROPRIETORSHIP',
        businessType: localVendor.businessType || 'RETAIL',
        businessCategory: localVendor.businessCategory || 'GROCERY_RETAIL',
        yearEstablished: localVendor.yearEstablished || '2022',
        businessDescription: localVendor.businessDescription || '',
        businessPhone: localVendor.businessPhone || localVendor.phone || '',
        businessEmail: localVendor.businessEmail || localVendor.email || '',
        website: localVendor.website || '',
        gstin: localVendor.gstin || '',
        panNumber: localVendor.panNumber || '',
        tradeLicenseNumber: localVendor.tradeLicenseNumber || '',
        fssaiNumber: localVendor.fssaiNumber || '',
        foodCategory: localVendor.foodCategory || 'BOTH',
        kitchenType: localVendor.kitchenType || 'DINE_IN_RESTAURANT',
        drugLicenseNumber: localVendor.drugLicenseNumber || '',
        pharmacistName: localVendor.pharmacistName || '',
        pharmacistRegNumber: localVendor.pharmacistRegNumber || '',
      };
    }
  },

  async patchBusiness(payload: any): Promise<any> {
    try {
      return await apiClient.patch('/vendor/onboarding/business', payload);
    } catch {
      localVendor = { ...localVendor, ...payload, currentOnboardingStep: Math.max(localVendor.currentOnboardingStep || 1, 4) };
      return this.getOnboardingState();
    }
  },

  async getAddressInfo(): Promise<any> {
    try {
      const res: any = await apiClient.get('/vendor/onboarding/address');
      return res.data || res;
    } catch {
      return {
        line1: localVendor.address?.line1 || '',
        line2: localVendor.address?.line2 || '',
        area: localVendor.address?.area || localVendor.address?.locality || '',
        city: localVendor.address?.city || 'Mumbai',
        state: localVendor.address?.state || 'Maharashtra',
        pincode: localVendor.address?.pincode || '400050',
        country: localVendor.address?.country || 'India',
        latitude: localVendor.address?.latitude || 19.0596,
        longitude: localVendor.address?.longitude || 72.8295,
      };
    }
  },

  async patchAddress(payload: any): Promise<any> {
    try {
      return await apiClient.patch('/vendor/onboarding/address', payload);
    } catch {
      localVendor = { ...localVendor, address: payload, currentOnboardingStep: Math.max(localVendor.currentOnboardingStep || 1, 5) };
      return this.getOnboardingState();
    }
  },

  async listDocuments(): Promise<any> {
    try {
      const res: any = await apiClient.get('/vendor/documents');
      return res.data || res;
    } catch {
      return localVendor.documents || [];
    }
  },

  async deleteDocument(id: string): Promise<any> {
    try {
      return await apiClient.delete(`/vendor/documents/${id}`);
    } catch {
      if (localVendor.documents) {
        localVendor.documents = localVendor.documents.filter((d: any) => d.id !== id);
      }
      return { success: true };
    }
  },

  async getOnboardingState(): Promise<any> {
    try {
      return await apiClient.get('/vendor/onboarding/state');
    } catch {
      const hasBusinessType = Boolean(localVendor.businessType);
      const hasPersonal = Boolean(localVendor.ownerName && !localVendor.email?.includes('@sevazo.internal'));
      const hasBusiness = Boolean(localVendor.businessName);
      const hasAddress = Boolean(localVendor.address || (localVendor.addresses && localVendor.addresses.length > 0));
      const hasDocuments = Boolean(localVendor.documents && localVendor.documents.length >= 2);
      const hasBank = Boolean(localVendor.bankAccount || (localVendor.bankAccounts && localVendor.bankAccounts.length > 0));
      const hasStore = Boolean(localVendor.storeName || (localVendor.stores && localVendor.stores.length > 0));
      const hasDelivery = Boolean(localVendor.deliveryPreference);

      let completionScore = 0;
      if (hasBusinessType) completionScore += 15;
      if (hasPersonal) completionScore += 15;
      if (hasBusiness) completionScore += 15;
      if (hasAddress) completionScore += 15;
      if (hasDocuments) completionScore += 15;
      if (hasBank) completionScore += 15;
      if (hasStore) completionScore += 10;

      return {
        vendorId: localVendor.id,
        phone: localVendor.phone,
        email: localVendor.email,
        status: localVendor.status || 'DRAFT',
        currentStep: localVendor.currentOnboardingStep || 1,
        completionPercentage: Math.min(100, Math.max(10, completionScore)),
        rejectionReason: localVendor.rejectionReason,
        rejectionDetails: localVendor.rejectionDetails,
        checklist: {
          step1_businessType: hasBusinessType,
          step2_ownerDetails: hasPersonal,
          step3_businessDetails: hasBusiness,
          step4_businessAddress: hasAddress,
          step5_documents: hasDocuments,
          step6_bankAccount: hasBank,
          step7_storeDetails: hasStore,
          step8_deliveryPreferences: hasDelivery,
          step9_submitted: ['SUBMITTED', 'UNDER_REVIEW', 'APPROVED'].includes(localVendor.status),
        },
        data: localVendor,
      };
    }
  },

  async saveOnboardingStep(step: number, payload: any): Promise<any> {
    try {
      return await apiClient.post(`/vendor/onboarding/step/${step}`, payload);
    } catch {
      if (step === 1) {
        localVendor = { ...localVendor, businessType: payload.businessType, businessCategory: payload.businessCategory, currentOnboardingStep: 2 };
      } else if (step === 2) {
        localVendor = { ...localVendor, ownerName: payload.ownerName, email: payload.email, avatar: payload.avatar, currentOnboardingStep: 3 };
      } else if (step === 3) {
        localVendor = { ...localVendor, businessName: payload.businessName, legalEntityType: payload.legalEntityType, currentOnboardingStep: 4 };
      } else if (step === 4) {
        localVendor = { ...localVendor, address: payload, currentOnboardingStep: 5 };
      } else if (step === 5) {
        localVendor = { ...localVendor, documents: payload.documents, currentOnboardingStep: 6 };
      } else if (step === 6) {
        localVendor = { ...localVendor, bankAccount: payload, currentOnboardingStep: 7 };
      } else if (step === 7) {
        localVendor = { ...localVendor, storeName: payload.name, description: payload.description, logo: payload.logo, banner: payload.banner, prepTimeMinutes: payload.prepTimeMinutes, deliveryRadiusKm: payload.deliveryRadiusKm, currentOnboardingStep: 8 };
      } else if (step === 8) {
        localVendor = { ...localVendor, serviceAreaPincodes: payload.serviceAreaPincodes, deliveryPreference: payload.deliveryPreference, currentOnboardingStep: 9 };
      } else if (step === 9) {
        localVendor = { ...localVendor, status: 'SUBMITTED', currentOnboardingStep: 9 };
      }
      return this.getOnboardingState();
    }
  },

  async submitOnboarding(payload: any = {}): Promise<any> {
    const adminHosts = [
      process.env.EXPO_PUBLIC_ADMIN_URL,
      'http://localhost:3000',
      'http://192.168.1.7:3000',
      'http://10.0.2.2:3000',
    ].filter(Boolean);

    const syncToAdmin = async () => {
      for (const host of adminHosts) {
        try {
          const res = await fetch(`${host}/api/applications/vendor-submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          const json = await res.json();
          if (json.success) break;
        } catch (e) {}
      }
    };

    try {
      const res = await apiClient.post('/vendor/onboarding/submit', payload);
      await syncToAdmin();
      localVendor = { ...localVendor, ...payload, status: 'SUBMITTED', currentOnboardingStep: 11 };
      return res;
    } catch (err) {
      await syncToAdmin();
      localVendor = { ...localVendor, ...payload, status: 'SUBMITTED', currentOnboardingStep: 11 };
      return this.getOnboardingState();
    }
  },

  async completeDocumentUpload(payload: any): Promise<any> {
    try {
      return await apiClient.post('/vendor/onboarding/documents/complete', payload);
    } catch {
      return { success: true };
    }
  },

  async resubmitCorrections(payload: any): Promise<any> {
    try {
      return await apiClient.post('/vendor/onboarding/resubmit', payload);
    } catch {
      localVendor = { ...localVendor, status: 'UNDER_REVIEW', rejectionReason: null, rejectionDetails: null };
      return this.getOnboardingState();
    }
  },

  async requestPresignedUrl(documentType: string, fileName: string, mimeType: string): Promise<any> {
    try {
      return await apiClient.post('/vendor/onboarding/documents/presigned-url', {
        documentType,
        fileName,
        mimeType,
      });
    } catch {
      return {
        success: true,
        fileKey: `vendors/${localVendor.id}/kyc/${documentType.toLowerCase()}_${Date.now()}_${fileName}`,
        uploadUrl: `https://storage.sevazo.com/upload/${documentType.toLowerCase()}`,
        publicUrl: `https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600`,
      };
    }
  },

  async requestBankChangeOtp(): Promise<any> {
    try {
      return await apiClient.post('/vendor/onboarding/bank/request-otp');
    } catch {
      return { success: true, message: 'Security OTP 123456 sent to registered mobile number.' };
    }
  },

  async verifyBankChange(otp: string, payload: any): Promise<any> {
    try {
      return await apiClient.post('/vendor/onboarding/bank/verify-change', { otp, payload });
    } catch {
      localVendor = {
        ...localVendor,
        bankAccount: {
          ...payload,
          maskedAccountNumber: `XXXX XXXX ${payload.accountNumber.slice(-4)}`,
        },
      };
      return {
        success: true,
        message: 'Bank account updated successfully under 24h security cooldown.',
        maskedAccountNumber: `XXXX XXXX ${payload.accountNumber.slice(-4)}`,
      };
    }
  },

  // 3. Store & Profile
  async setupStore(data: any): Promise<VendorUser> {
    try {
      const res: any = await apiClient.post('/vendor/stores', data);
      return res.vendor || res;
    } catch {
      localVendor = {
        ...localVendor,
        storeName: data.storeName || localVendor.storeName,
        ownerName: data.ownerName || localVendor.ownerName,
        description: data.description,
        address: { ...localVendor.address, ...data },
      };
      return localVendor;
    }
  },

  async submitKyc(data: any): Promise<VendorUser> {
    try {
      const res: any = await apiClient.post('/vendor/onboarding/step/5', data);
      return res.vendor || res;
    } catch {
      localVendor = {
        ...localVendor,
        documents: data.documents,
        bankAccount: data.bankAccount,
        status: 'SUBMITTED',
      };
      return localVendor;
    }
  },

  async updateStoreProfile(data: any): Promise<VendorUser> {
    try {
      const res: any = await apiClient.patch('/vendor/stores/primary', data);
      return res.vendor || res;
    } catch {
      localVendor = { ...localVendor, ...data };
      return localVendor;
    }
  },

  async updateStoreHours(data: any): Promise<any> {
    try {
      return await apiClient.put('/vendor/stores/primary/hours', data);
    } catch {
      localVendor = { ...localVendor, ...data };
      return { success: true, storeHours: localVendor.storeHours };
    }
  },

  async updateStoreStatus(data: { isOpen: boolean; prepTimeMinutes?: number; deliveryRadiusKm?: number }): Promise<any> {
    try {
      return await apiClient.patch('/vendor/stores/primary', data);
    } catch {
      localVendor = { ...localVendor, ...data };
      return { success: true, isOpen: localVendor.isOpen };
    }
  },

  // 3. Products & Catalog
  async getProducts(params?: any): Promise<{ items: Product[]; total: number }> {
    try {
      const res: any = await apiClient.get('/vendor/products', { params });
      return res;
    } catch {
      let filtered = [...localProducts];
      if (params?.search) {
        filtered = filtered.filter((p) =>
          p.name.toLowerCase().includes(params.search.toLowerCase()) ||
          p.sku.toLowerCase().includes(params.search.toLowerCase())
        );
      }
      return { items: filtered, total: filtered.length };
    }
  },

  async getProduct(id: string): Promise<Product> {
    try {
      return await apiClient.get(`/vendor/products/${id}`);
    } catch {
      const found = localProducts.find((p) => p.id === id);
      if (!found) throw new Error('Product not found');
      return found;
    }
  },

  async createProduct(data: any): Promise<Product> {
    try {
      const res: any = await apiClient.post('/vendor/products', data);
      return res.product || res;
    } catch {
      const stock = Number(data.stock || 0);
      const newProd: Product = {
        id: `prd-${Date.now()}`,
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        description: data.description,
        categoryId: data.categoryId || 'cat-general',
        vendorId: localVendor.id,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        costPrice: data.costPrice ? Number(data.costPrice) : null,
        taxRate: data.taxRate ? Number(data.taxRate) : 0,
        hsnCode: data.hsnCode || null,
        weightGrams: data.weightGrams ? Number(data.weightGrams) : null,
        sku: data.sku || `SKU-${Date.now().toString().slice(-4)}`,
        stock,
        physicalStock: stock,
        reservedStock: 0,
        availableStock: stock,
        damagedStock: 0,
        soldStock: 0,
        unit: data.unit || 'piece',
        status: 'ACTIVE',
        approvalStatus: 'APPROVED',
        rating: 5.0,
        reviewsCount: 0,
        tags: data.tags || [],
        images: (data.images || []).map((url: string, i: number) => ({
          id: `img-${Date.now()}-${i}`,
          url,
          isPrimary: i === 0,
          sortOrder: i,
        })),
        variants: data.variants || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      localProducts = [newProd, ...localProducts];
      return newProd;
    }
  },

  async updateProduct(id: string, data: any): Promise<Product> {
    try {
      const res: any = await apiClient.patch(`/vendor/products/${id}`, data);
      return res.product || res;
    } catch {
      localProducts = localProducts.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p
      );
      return localProducts.find((p) => p.id === id)!;
    }
  },

  async deleteProduct(id: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete(`/vendor/products/${id}`);
    } catch {
      localProducts = localProducts.filter((p) => p.id !== id);
      return { success: true };
    }
  },

  async createVariant(productId: string, data: any): Promise<ProductVariant> {
    try {
      const res: any = await apiClient.post(`/vendor/products/${productId}/variants`, data);
      return res.variant || res;
    } catch {
      const newVar: ProductVariant = {
        id: `var-${Date.now()}`,
        productId,
        name: data.name,
        sku: data.sku,
        price: Number(data.price),
        compareAtPrice: data.compareAtPrice ? Number(data.compareAtPrice) : null,
        costPrice: data.costPrice ? Number(data.costPrice) : null,
        weightGrams: data.weightGrams ? Number(data.weightGrams) : null,
        stock: Number(data.stock || 0),
        attributes: data.attributes || {},
      };
      const p = localProducts.find((item) => item.id === productId);
      if (p) {
        p.variants = [...(p.variants || []), newVar];
      }
      return newVar;
    }
  },

  async deleteVariant(variantId: string): Promise<{ success: boolean }> {
    try {
      return await apiClient.delete(`/vendor/product-variants/${variantId}`);
    } catch {
      localProducts.forEach((p) => {
        if (p.variants) {
          p.variants = p.variants.filter((v) => v.id !== variantId);
        }
      });
      return { success: true };
    }
  },

  // 4. Inventory
  async getInventory(params?: any): Promise<{ products: Product[]; metrics: any }> {
    try {
      return await apiClient.get('/vendor/inventory', { params });
    } catch {
      const lowStockCount = localProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
      const outOfStockCount = localProducts.filter((p) => p.stock <= 0).length;
      return {
        products: localProducts,
        metrics: {
          totalProducts: localProducts.length,
          lowStockCount,
          outOfStockCount,
          inStockCount: localProducts.length - (lowStockCount + outOfStockCount),
        },
      };
    }
  },

  async adjustStock(data: { productId: string; variantId?: string; changeQty: number; reason: string; notes?: string }): Promise<any> {
    try {
      return await apiClient.post('/vendor/inventory/adjust', {
        productId: data.productId,
        variantId: data.variantId,
        quantityChange: data.changeQty,
        type: data.reason,
        notes: data.notes,
      });
    } catch {
      const target = localProducts.find((p) => p.id === data.productId);
      if (target) {
        const prev = target.stock;
        let next = prev;
        if (data.reason === 'PURCHASE' || data.reason === 'RETURN') {
          target.physicalStock = (target.physicalStock || prev) + data.changeQty;
        } else if (data.reason === 'DAMAGE') {
          target.damagedStock = (target.damagedStock || 0) + data.changeQty;
        } else {
          target.physicalStock = (target.physicalStock || prev) + data.changeQty;
        }
        next = Math.max(0, (target.physicalStock || prev) - (target.reservedStock || 0) - (target.damagedStock || 0));
        target.stock = next;
        target.availableStock = next;

        localLogs = [
          {
            id: `log-${Date.now()}`,
            vendorId: localVendor.id,
            productId: target.id,
            product: { id: target.id, name: target.name, sku: target.sku, images: target.images },
            changeQty: data.changeQty,
            previousStock: prev,
            newStock: next,
            reason: data.reason,
            notes: data.notes,
            createdAt: new Date().toISOString(),
          },
          ...localLogs,
        ];
      }
      return { success: true, message: 'Stock quantity updated successfully' };
    }
  },

  async getInventoryLogs(): Promise<{ logs: InventoryLog[]; total: number }> {
    try {
      return await apiClient.get('/vendor/inventory/logs');
    } catch {
      return { logs: localLogs, total: localLogs.length };
    }
  },

  // 5. Orders
  async getOrders(params?: { tab?: string; page?: number }): Promise<{ items: Order[]; total: number }> {
    try {
      return await apiClient.get('/vendor/orders', { params });
    } catch {
      const tab = (params?.tab || 'NEW').toUpperCase();
      let filtered = localOrders;
      if (tab === 'NEW') filtered = localOrders.filter((o) => o.status === 'PENDING');
      else if (tab === 'ACCEPTED') filtered = localOrders.filter((o) => o.status === 'CONFIRMED');
      else if (tab === 'PREPARING') filtered = localOrders.filter((o) => o.status === 'PREPARING');
      else if (tab === 'READY') filtered = localOrders.filter((o) => o.status === 'READY_FOR_PICKUP');
      else if (tab === 'HISTORY') filtered = localOrders.filter((o) => ['DELIVERED', 'CANCELLED', 'RETURNED'].includes(o.status));

      return { items: filtered, total: filtered.length };
    }
  },

  async getOrderById(id: string): Promise<Order> {
    try {
      return await apiClient.get(`/vendor/orders/${id}`);
    } catch {
      const found = localOrders.find((o) => o.id === id);
      if (!found) throw new Error('Order not found');
      return found;
    }
  },

  async acceptOrder(id: string, prepTimeMinutes = 15): Promise<Order> {
    try {
      const res: any = await apiClient.patch(`/vendor/orders/${id}/accept`, { prepTimeMinutes });
      return res.order || res;
    } catch {
      localOrders = localOrders.map((o) => (o.id === id ? { ...o, status: 'CONFIRMED' } : o));
      return localOrders.find((o) => o.id === id)!;
    }
  },

  async rejectOrder(id: string, reason: string): Promise<Order> {
    try {
      const res: any = await apiClient.patch(`/vendor/orders/${id}/reject`, { reason });
      return res.order || res;
    } catch {
      localOrders = localOrders.map((o) => (o.id === id ? { ...o, status: 'CANCELLED', cancellationReason: reason } : o));
      return localOrders.find((o) => o.id === id)!;
    }
  },

  async markPreparing(id: string): Promise<Order> {
    try {
      const res: any = await apiClient.patch(`/vendor/orders/${id}/preparing`);
      return res.order || res;
    } catch {
      localOrders = localOrders.map((o) => (o.id === id ? { ...o, status: 'PREPARING' } : o));
      return localOrders.find((o) => o.id === id)!;
    }
  },

  async markReady(id: string): Promise<Order> {
    try {
      const res: any = await apiClient.patch(`/vendor/orders/${id}/ready`);
      return res.order || res;
    } catch {
      localOrders = localOrders.map((o) => (o.id === id ? { ...o, status: 'READY_FOR_PICKUP' } : o));
      return localOrders.find((o) => o.id === id)!;
    }
  },

  async getLiveStats(): Promise<any> {
    try {
      return await apiClient.get('/vendor/orders/live-stats');
    } catch {
      const newOrders = localOrders.filter((o) => o.status === 'PENDING').length;
      const acceptedOrders = localOrders.filter((o) => o.status === 'CONFIRMED').length;
      const preparingOrders = localOrders.filter((o) => o.status === 'PREPARING').length;
      const readyOrders = localOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
      return {
        newOrders,
        acceptedOrders,
        preparingOrders,
        readyOrders,
        activePipeline: newOrders + acceptedOrders + preparingOrders + readyOrders,
        todaySales: 12450.0,
        todayOrderCount: 14,
      };
    }
  },

  // 6. Finance
  async getFinanceSummary(): Promise<any> {
    try {
      return await apiClient.get('/vendor/finance/summary');
    } catch {
      return {
        totalGrossSales: 284500.0,
        totalPlatformFee: 28450.0,
        totalEarnedPayout: 256050.0,
        settledAmount: 198000.0,
        pendingPayout: 58050.0,
        commissionRate: 10.0,
        bankAccount: localVendor.bankAccount,
        recentSettlements: mockSettlements,
      };
    }
  },

  async getTransactions(params?: any): Promise<{ items: Commission[]; total: number }> {
    try {
      return await apiClient.get('/vendor/finance/transactions', { params });
    } catch {
      const commissions: Commission[] = localOrders.map((o) => ({
        id: `com-${o.id}`,
        orderId: o.id,
        orderAmount: o.total,
        ratePercent: 10.0,
        commissionFee: o.total * 0.1,
        vendorPayout: o.total * 0.9,
        createdAt: o.createdAt,
        order: {
          id: o.id,
          orderNumber: o.orderNumber,
          status: o.status,
          paymentStatus: o.paymentStatus,
          paymentMethod: o.paymentMethod,
          createdAt: o.createdAt,
        },
      }));
      return { items: commissions, total: commissions.length };
    }
  },

  async getSettlements(): Promise<Settlement[]> {
    try {
      return await apiClient.get('/vendor/finance/settlements');
    } catch {
      return mockSettlements;
    }
  },

  // 7. Dashboard & Analytics
  async getDashboardStats(): Promise<any> {
    try {
      return await apiClient.get('/vendor/dashboard/stats');
    } catch {
      const newOrders = localOrders.filter((o) => o.status === 'PENDING').length;
      const activeOrders = localOrders.filter((o) => ['CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'].includes(o.status)).length;
      const lowStockCount = localProducts.filter((p) => p.stock > 0 && p.stock <= 5).length;
      const outOfStockCount = localProducts.filter((p) => p.stock <= 0).length;
      return {
        isOpen: localVendor.isOpen,
        approvalStatus: localVendor.approvalStatus,
        rating: localVendor.rating,
        todaySales: 14820.0,
        todayOrdersCount: 16,
        avgOrderValue: 926.25,
        newOrders,
        activeOrders,
        lowStockCount,
        outOfStockCount,
      };
    }
  },

  async getAnalytics(): Promise<any> {
    try {
      return await apiClient.get('/vendor/analytics');
    } catch {
      return {
        salesTrend: [
          { date: 'Mon', sales: 12400, orders: 14 },
          { date: 'Tue', sales: 15800, orders: 18 },
          { date: 'Wed', sales: 14200, orders: 15 },
          { date: 'Thu', sales: 18900, orders: 21 },
          { date: 'Fri', sales: 24500, orders: 28 },
          { date: 'Sat', sales: 31200, orders: 36 },
          { date: 'Sun', sales: 28400, orders: 32 },
        ],
        topProducts: [
          { name: 'Organic Ratnagiri Alphonso Mangoes', quantity: 94, revenue: 32806 },
          { name: 'Farm Fresh Organic Whole Milk', quantity: 142, revenue: 11076 },
          { name: 'Cold Pressed Extra Virgin Olive Oil', quantity: 18, revenue: 16020 },
          { name: 'Artisanal Sourdough Country Loaf', quantity: 38, revenue: 6840 },
        ],
        fulfillmentRate: 98.4,
        cancellationRate: 1.6,
        averagePrepTimeMinutes: 12,
      };
    }
  },

  // 8. Promotions
  async getPromotions(): Promise<{ coupons: Coupon[]; banners: any[] }> {
    try {
      return await apiClient.get('/vendor/promotions');
    } catch {
      return {
        coupons: [
          {
            id: 'c-1',
            code: 'FRESH20',
            description: '20% off on all organic fruits & veggies',
            discountType: 'PERCENTAGE',
            discountValue: 20,
            minOrderAmount: 299,
            maxDiscount: 100,
            validFrom: '2026-08-01',
            validUntil: '2026-08-31',
            isActive: true,
          },
          {
            id: 'c-2',
            code: 'MANGO50',
            description: 'Flat ₹50 off on Mango special packs',
            discountType: 'FLAT_AMOUNT',
            discountValue: 50,
            minOrderAmount: 499,
            validFrom: '2026-08-01',
            validUntil: '2026-08-31',
            isActive: true,
          },
        ],
        banners: [
          {
            id: 'b-1',
            title: 'Summer Mango Festival 🥭',
            subtitle: 'Direct from Ratnagiri orchards',
            bannerUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
            isActive: true,
          },
        ],
      };
    }
  },

  async createCoupon(data: any): Promise<{ success: boolean; coupon: Coupon }> {
    try {
      return await apiClient.post('/vendor/promotions/coupons', data);
    } catch {
      const newCoupon: Coupon = {
        id: `c-${Date.now()}`,
        code: data.code,
        description: data.description,
        discountType: data.discountType,
        discountValue: data.discountValue,
        minOrderAmount: data.minOrderAmount || 0,
        maxDiscount: data.maxDiscount,
        validFrom: data.validFrom,
        validUntil: data.validUntil,
        isActive: true,
      };
      return { success: true, coupon: newCoupon };
    }
  },

  // 9. Support & Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await apiClient.get('/vendor/notifications');
    } catch {
      return mockNotifications;
    }
  },

  async getTickets(): Promise<SupportTicket[]> {
    try {
      return await apiClient.get('/vendor/support/tickets');
    } catch {
      return [
        {
          id: 'tkt-1',
          ticketNumber: 'TKT-VND-48192',
          subject: 'Question regarding weekly GST invoice settlement',
          status: 'RESOLVED',
          priority: 'LOW',
          messages: [
            {
              id: 'm-1',
              senderType: 'VENDOR',
              senderId: 'vnd-001-sevazo',
              message: 'Can you please clarify how GST input credit is calculated on the platform commission invoice?',
              createdAt: '2026-08-15T10:00:00Z',
            },
            {
              id: 'm-2',
              senderType: 'ADMIN',
              senderId: 'admin-1',
              message: 'Hello Vikram! The 18% GST on the 10% platform fee is highlighted with full Tax Invoice HSN code in your monthly settlement sheet.',
              createdAt: '2026-08-15T11:30:00Z',
            },
          ],
          createdAt: '2026-08-15T10:00:00Z',
        },
      ];
    }
  },

  async createTicket(subject: string, message: string): Promise<any> {
    try {
      return await apiClient.post('/vendor/support/tickets', { subject, message });
    } catch {
      return {
        success: true,
        message: 'Support ticket submitted. Partner desk will reply within 2 business hours.',
      };
    }
  },
};
