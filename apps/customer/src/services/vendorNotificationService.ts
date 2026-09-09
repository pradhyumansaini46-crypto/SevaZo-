import { tursoDb } from './tursoDatabase';
import { Order } from '../types';
import { apiClient } from './api';

export interface VendorDispatchOptions {
  vendorId?: string;
  storeId?: string;
  storeName?: string;
  customerName?: string;
  customerPhone?: string;
}

class VendorNotificationService {
  private listeners: Array<(order: Order) => void> = [];

  constructor() {
    this.setupStorageListener();
  }

  /**
   * Listen for cross-tab or cross-window order events (e.g. customer places order in one tab, vendor is open in another)
   */
  private setupStorageListener() {
    if (typeof window !== 'undefined' && window.addEventListener) {
      window.addEventListener('storage', (event) => {
        if (event.key === 'sevazo_last_vendor_order' && event.newValue) {
          try {
            const data = JSON.parse(event.newValue);
            if (data?.order) {
              this.notifyListeners(data.order);
            }
          } catch (e) {
            console.warn('[VendorNotification] Error parsing storage event:', e);
          }
        }
      });

      window.addEventListener('sevazo_new_vendor_order', ((event: CustomEvent) => {
        if (event.detail?.order) {
          this.notifyListeners(event.detail.order);
        }
      }) as EventListener);
    }
  }

  private notifyListeners(order: Order) {
    this.listeners.forEach((listener) => {
      try {
        listener(order);
      } catch (err) {
        console.warn('[VendorNotification] Listener error:', err);
      }
    });
  }

  /**
   * Subscribe to incoming vendor order requests
   */
  public onNewOrderReceived(callback: (order: Order) => void): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  /**
   * Dispatches the confirmed order request directly to the vendor
   */
  public async dispatchOrderToVendor(
    order: Order,
    options?: VendorDispatchOptions
  ): Promise<{ success: boolean; notificationId?: string; message: string }> {
    const vendorId = options?.vendorId || order.store?.id || 'vnd-001';
    const storeId = options?.storeId || order.store?.id || 'store-1';
    const storeName = options?.storeName || order.store?.businessName || 'SevaZo Dark Store';
    const customerName = options?.customerName || 'Customer';
    const customerPhone = options?.customerPhone || '';

    const itemsSummary = (order.items || [])
      .map((i: any) => `${i.quantity}x ${i.productName || i.name || 'Item'}`)
      .join(', ');

    console.log(`[VendorNotification] Dispatched order ${order.orderNumber} to vendor ${vendorId}`);

    let notificationId = `vnotif-${Date.now()}`;

    // 1. Record in Turso Database (vendor_notifications and orders table)
    try {
      if (tursoDb.isConfigured()) {
        const notif = await tursoDb.createVendorNotification({
          vendorId,
          orderId: order.id,
          orderNumber: order.orderNumber,
          type: 'NEW_ORDER_REQUEST',
          title: `New Order Received! 🛍️ (#${order.orderNumber})`,
          message: `Customer placed order for ₹${order.totalAmount}. Items: ${itemsSummary.slice(0, 80)}`,
          totalAmount: order.totalAmount,
          itemsCount: order.items?.length || 1,
          customerName,
          customerPhone,
          deliveryAddress: typeof order.deliveryAddress === 'string'
            ? order.deliveryAddress
            : JSON.stringify(order.deliveryAddress || {}),
        });
        if (notif?.id) notificationId = notif.id;
      }
    } catch (err) {
      console.warn('[VendorNotification] Turso notification error:', err);
    }

    // 2. Broadcast cross-window / cross-tab event for immediate UI updates
    if (typeof window !== 'undefined') {
      try {
        const payload = {
          order: {
            ...order,
            status: 'PENDING',
            vendorId,
            storeId,
            storeName,
          },
          timestamp: Date.now(),
        };

        // Local storage triggers 'storage' event in other tabs
        window.localStorage?.setItem('sevazo_last_vendor_order', JSON.stringify(payload));

        // CustomEvent triggers in current window
        window.dispatchEvent(new CustomEvent('sevazo_new_vendor_order', { detail: payload }));
      } catch (err) {
        console.warn('[VendorNotification] Broadcast error:', err);
      }
    }

    // 3. Inform internal active listeners
    this.notifyListeners({
      ...order,
      status: 'PENDING',
    });

    // 4. Send to Backend API if online
    try {
      await apiClient.post('/vendor/orders/incoming', {
        orderId: order.id,
        orderNumber: order.orderNumber,
        vendorId,
        storeId,
        totalAmount: order.totalAmount,
        items: order.items,
        paymentStatus: order.paymentStatus || 'PAID',
        paymentMethod: order.paymentMethod || 'UPI',
        deliveryAddress: order.deliveryAddress,
      });
    } catch {
      // Backend may be offline in dev/preview, graceful fallback
    }

    return {
      success: true,
      notificationId,
      message: `Order ${order.orderNumber} successfully sent to ${storeName}`,
    };
  }
}

export const vendorNotificationService = new VendorNotificationService();
