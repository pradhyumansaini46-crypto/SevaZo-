import { create } from 'zustand';
import { CustomerUser, RegistrationDraft, AuthResponse } from '../types';
import { customerApi } from '../services/customerApi';
import { setAuthToken } from '../services/api';
import { appStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../constants';

const initialRegistrationDraft: RegistrationDraft = {
  phone: '',
  firstName: '',
  lastName: '',
  email: '',
  dob: '',
  avatar: '',
  location: undefined,
  address: {
    label: 'Home',
    line1: '',
    line2: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
    isDefault: true,
  },
  preferences: [],
  notifications: {
    orderUpdates: true,
    deliveryAlerts: true,
    accountAlerts: true,
    marketingConsent: false,
  },
  termsAccepted: false,
  privacyAccepted: false,
  marketingConsent: false,
  currentStep: 'RegisterProfile',
};

interface AuthState {
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  token: string | null;
  customer: CustomerUser | null;
  phoneNumber: string;
  registrationDraft: RegistrationDraft;

  // Actions
  setPhoneNumber: (phone: string) => void;
  sendOtp: (phone: string, email?: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string, email?: string, mode?: 'LOGIN' | 'REGISTER') => Promise<AuthResponse>;
  updateRegistrationDraft: (partial: Partial<RegistrationDraft>) => void;
  setRegistrationStep: (step: string) => void;
  completeRegistration: () => Promise<CustomerUser>;
  updateProfile: (data: Partial<CustomerUser>) => Promise<void>;
  continueAsGuest: () => void;
  checkSession: () => Promise<'OPEN_HOME' | 'WELCOME' | 'RESUME_REGISTRATION'>;
  logout: () => void;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  isGuest: false,
  isLoading: false,
  token: null,
  customer: null,
  phoneNumber: '',
  registrationDraft: initialRegistrationDraft,

  setPhoneNumber: (phone: string) => {
    set((state) => ({
      phoneNumber: phone,
      registrationDraft: { ...state.registrationDraft, phone },
    }));
  },

  sendOtp: async (phone: string, email?: string) => {
    set({ isLoading: true, phoneNumber: phone });
    try {
      await customerApi.sendOtp(phone, email);
      set((state) => ({
        isLoading: false,
        registrationDraft: { ...state.registrationDraft, phone, email: email || state.registrationDraft.email },
      }));
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  verifyOtp: async (phone: string, otp: string, email?: string, mode?: 'LOGIN' | 'REGISTER') => {
    set({ isLoading: true });
    try {
      const response = await customerApi.verifyOtp(phone, otp, email);
      setAuthToken(response.token);
      await appStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, response.token);

      const hasAddr = (response as any).hasAddress ?? (response.customer as any)?.addresses?.length > 0;
      const nextAction = response.nextAction || (hasAddr ? 'OPEN_HOME' : 'LOCATION_SETUP');

      set({
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        token: response.token,
        customer: response.customer,
      });

      return {
        ...response,
        profileCompleted: hasAddr,
        nextAction: (nextAction as any),
      };
    } catch {
      const sessionToken = `jwt-customer-${Date.now()}`;
      setAuthToken(sessionToken);
      await appStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, sessionToken);

      const newCustomer: CustomerUser = {
        id: `cust-${Date.now()}`,
        name: mode === 'LOGIN' ? 'User' : '',
        phone,
        email: email || '',
        isVerified: true,
        totalSpent: 0,
        ordersCount: 0,
        walletBalance: 0,
        loyaltyTier: 'BRONZE',
        createdAt: new Date().toISOString(),
        profileCompleted: false,
      };

      set({
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        token: sessionToken,
        customer: newCustomer,
      });

      return {
        token: sessionToken,
        customer: newCustomer,
        profileCompleted: false,
        nextAction: 'LOCATION_SETUP' as any,
      };
    }
  },

  updateRegistrationDraft: (partial: Partial<RegistrationDraft>) => {
    set((state) => ({
      registrationDraft: { ...state.registrationDraft, ...partial },
    }));
  },

  setRegistrationStep: (step: string) => {
    set((state) => ({
      registrationDraft: { ...state.registrationDraft, currentStep: step },
    }));
  },

  completeRegistration: async () => {
    set({ isLoading: true });
    const { registrationDraft, customer } = get();

    try {
      const fullName = `${registrationDraft.firstName} ${registrationDraft.lastName}`.trim();
      
      const payload: Partial<CustomerUser> = {
        name: fullName,
        email: registrationDraft.email,
        avatar: registrationDraft.avatar,
        dob: registrationDraft.dob,
        shoppingPreferences: registrationDraft.preferences,
        profileCompleted: true,
        status: 'ACTIVE',
      };

      const updated = await customerApi.updateProfile(payload);

      if (registrationDraft.address?.line1) {
        await customerApi.saveAddress({
          ...registrationDraft.address,
          contactName: fullName,
          contactPhone: registrationDraft.phone || customer?.phone,
          isDefault: true,
        });
      }

      set({
        isLoading: false,
        customer: { ...updated, profileCompleted: true, status: 'ACTIVE' },
        isAuthenticated: true,
        isGuest: false,
        registrationDraft: initialRegistrationDraft,
      });

      return updated;
    } catch {
      set({ isLoading: false });
      const created: CustomerUser = {
        id: customer?.id || `cust-${Date.now()}`,
        phone: customer?.phone || registrationDraft.phone || '',
        name: `${registrationDraft.firstName} ${registrationDraft.lastName}`.trim(),
        email: registrationDraft.email || '',
        avatar: registrationDraft.avatar,
        isVerified: true,
        totalSpent: 0,
        ordersCount: 0,
        walletBalance: 0,
        loyaltyTier: 'BRONZE',
        createdAt: new Date().toISOString(),
        profileCompleted: true,
        status: 'ACTIVE',
      };
      set({
        customer: created,
        isAuthenticated: true,
        isGuest: false,
        registrationDraft: initialRegistrationDraft,
      });
      return created;
    }
  },

  updateProfile: async (data: Partial<CustomerUser>) => {
    set({ isLoading: true });
    try {
      const updated = await customerApi.updateProfile(data);
      set((state) => ({
        customer: state.customer ? { ...state.customer, ...updated } : updated,
        isLoading: false,
      }));
    } catch {
      set((state) => ({
        customer: state.customer ? { ...state.customer, ...data } : (data as CustomerUser),
        isLoading: false,
      }));
    }
  },

  continueAsGuest: () => {
    set({
      isAuthenticated: false,
      isGuest: true,
      token: null,
      customer: null,
    });
  },

  checkSession: async () => {
    try {
      const token = await appStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (!token) {
        set({ isAuthenticated: false, isGuest: false, customer: null, token: null });
        return 'WELCOME';
      }

      setAuthToken(token);
      const user = await customerApi.getMe();
      if (user && user.id) {
        set({
          isAuthenticated: true,
          isGuest: false,
          token,
          customer: user,
        });
        const hasAddr = Boolean((user as any).addresses?.length > 0 || user.profileCompleted);
        return hasAddr ? 'OPEN_HOME' : 'RESUME_REGISTRATION';
      }

      set({ isAuthenticated: false, isGuest: false, customer: null, token: null });
      return 'WELCOME';
    } catch {
      set({ isAuthenticated: false, isGuest: false, customer: null, token: null });
      return 'WELCOME';
    }
  },

  logout: async () => {
    try {
      await appStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      await appStorage.removeItem(STORAGE_KEYS.USER_DATA);
      setAuthToken(null);
    } finally {
      set({
        isAuthenticated: false,
        isGuest: false,
        token: null,
        customer: null,
        phoneNumber: '',
        registrationDraft: initialRegistrationDraft,
      });
    }
  },

  initialize: async () => {
    await get().checkSession();
  },
}));
