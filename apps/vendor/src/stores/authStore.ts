import { create } from 'zustand';
import { VendorUser, ApprovalStatus, VendorStatus } from '../types';
import { VendorApi } from '../services/vendorApi';
import { Storage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';
import { setAuthToken } from '../services/api';

interface SessionStatusResponse {
  isAuthenticated: boolean;
  status: VendorStatus | 'NO_VENDOR' | 'UNAUTHENTICATED';
  nextAction: string;
  currentStep: number;
  completionPercentage: number;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  vendor: VendorUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  approvalStatus: ApprovalStatus | null;
  vendorStatus: VendorStatus | 'NO_VENDOR' | 'UNAUTHENTICATED';
  nextAction: string | null;
  completionPercentage: number;
  currentStep: number;

  setAuth: (
    accessToken: string,
    refreshToken: string,
    vendor: VendorUser,
    nextAction?: string,
    completionPercentage?: number,
  ) => Promise<void>;
  updateVendor: (vendor: Partial<VendorUser>) => void;
  logout: () => Promise<void>;
  checkSession: () => Promise<SessionStatusResponse>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  refreshToken: null,
  vendor: null,
  isAuthenticated: false,
  isLoading: true,
  approvalStatus: null,
  vendorStatus: 'UNAUTHENTICATED',
  nextAction: null,
  completionPercentage: 0,
  currentStep: 1,

  setAuth: async (
    accessToken: string,
    refreshToken: string,
    vendor: VendorUser,
    nextAction?: string,
    completionPercentage?: number,
  ) => {
    await Storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    if (refreshToken) {
      await Storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
    await Storage.setItem(STORAGE_KEYS.VENDOR_USER, JSON.stringify(vendor));
    setAuthToken(accessToken);

    const resolvedNextAction =
      nextAction ||
      (vendor.status === 'APPROVED'
        ? 'GO_TO_DASHBOARD'
        : vendor.status === 'DRAFT'
        ? 'CONTINUE_ONBOARDING'
        : vendor.status === 'REJECTED'
        ? 'FIX_APPLICATION'
        : vendor.status === 'SUSPENDED'
        ? 'CONTACT_SUPPORT'
        : 'VIEW_STATUS');

    set({
      token: accessToken,
      refreshToken,
      vendor,
      isAuthenticated: true,
      isLoading: false,
      vendorStatus: vendor.status || 'DRAFT',
      approvalStatus: vendor.approvalStatus || (vendor.status === 'APPROVED' ? 'APPROVED' : 'PENDING'),
      nextAction: resolvedNextAction,
      completionPercentage: completionPercentage || vendor.completionPercentage || 15,
      currentStep: vendor.currentOnboardingStep || 1,
    });
  },

  updateVendor: (partial: Partial<VendorUser>) => {
    const current = get().vendor;
    if (current) {
      const updated = { ...current, ...partial };
      Storage.setItem(STORAGE_KEYS.VENDOR_USER, JSON.stringify(updated));
      set({
        vendor: updated,
        vendorStatus: updated.status || get().vendorStatus,
        approvalStatus: updated.approvalStatus || (updated.status === 'APPROVED' ? 'APPROVED' : 'PENDING'),
        completionPercentage: updated.completionPercentage || get().completionPercentage,
        currentStep: updated.currentOnboardingStep || get().currentStep,
      });
    }
  },

  logout: async () => {
    try {
      await VendorApi.logout();
    } catch {
      // Ignore network failure on logout
    }
    await Storage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    await Storage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    await Storage.removeItem(STORAGE_KEYS.VENDOR_USER);
    setAuthToken(null);

    set({
      token: null,
      refreshToken: null,
      vendor: null,
      isAuthenticated: false,
      isLoading: false,
      approvalStatus: null,
      vendorStatus: 'UNAUTHENTICATED',
      nextAction: null,
      completionPercentage: 0,
      currentStep: 1,
    });
  },

  checkSession: async (): Promise<SessionStatusResponse> => {
    try {
      set({ isLoading: true });
      const storedToken = await Storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const storedRefreshToken = await Storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);

      if (!storedToken) {
        set({
          isAuthenticated: false,
          isLoading: false,
          vendorStatus: 'UNAUTHENTICATED',
        });
        return {
          isAuthenticated: false,
          status: 'UNAUTHENTICATED',
          nextAction: 'SHOW_WELCOME',
          currentStep: 1,
          completionPercentage: 0,
        };
      }

      setAuthToken(storedToken);

      // Query Server for authoritative status
      const state = await VendorApi.getOnboardingState();
      const vendorData = state.data || state.vendor;

      if (!vendorData) {
        set({
          isAuthenticated: false,
          isLoading: false,
          vendorStatus: 'NO_VENDOR',
        });
        return {
          isAuthenticated: true,
          status: 'NO_VENDOR',
          nextAction: 'CREATE_VENDOR',
          currentStep: 1,
          completionPercentage: 0,
        };
      }

      const status: VendorStatus = state.status || vendorData.status || 'DRAFT';

      let nextAction = 'CONTINUE_ONBOARDING';
      if (status === 'APPROVED') nextAction = 'GO_TO_DASHBOARD';
      else if (status === 'SUBMITTED' || status === 'UNDER_REVIEW') nextAction = 'VIEW_STATUS';
      else if (status === 'REJECTED') nextAction = 'FIX_APPLICATION';
      else if (status === 'SUSPENDED') nextAction = 'CONTACT_SUPPORT';

      set({
        token: storedToken,
        refreshToken: storedRefreshToken,
        vendor: vendorData,
        isAuthenticated: true,
        isLoading: false,
        vendorStatus: status,
        approvalStatus: status === 'APPROVED' ? 'APPROVED' : 'PENDING',
        nextAction,
        currentStep: state.currentStep || vendorData.currentOnboardingStep || 1,
        completionPercentage: state.progress || state.completionPercentage || vendorData.completionPercentage || 15,
      });

      return {
        isAuthenticated: true,
        status,
        nextAction,
        currentStep: state.currentStep || vendorData.currentOnboardingStep || 1,
        completionPercentage: state.progress || state.completionPercentage || vendorData.completionPercentage || 15,
      };
    } catch {
      set({
        isAuthenticated: false,
        isLoading: false,
        vendorStatus: 'UNAUTHENTICATED',
      });
      return {
        isAuthenticated: false,
        status: 'UNAUTHENTICATED',
        nextAction: 'SHOW_WELCOME',
        currentStep: 1,
        completionPercentage: 0,
      };
    }
  },
}));
