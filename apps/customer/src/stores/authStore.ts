import { create } from 'zustand';
import { CustomerUser, RegistrationDraft, AuthResponse } from '../types';
import { customerApi } from '../services/customerApi';
import { setAuthToken } from '../services/api';
import { mockCustomer } from '../services/mockData';

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
    city: 'Bengaluru',
    state: 'Karnataka',
    pincode: '',
    isDefault: true,
  },
  preferences: ['Grocery', 'Dairy & Breakfast'],
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
  sendOtp: (phone: string) => Promise<boolean>;
  verifyOtp: (phone: string, otp: string, mode?: 'LOGIN' | 'REGISTER') => Promise<AuthResponse>;
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
  isAuthenticated: false, // Starts false so user experiences complete journey or guest mode
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

  sendOtp: async (phone: string) => {
    set({ isLoading: true, phoneNumber: phone });
    try {
      await customerApi.sendOtp(phone);
      set((state) => ({
        isLoading: false,
        registrationDraft: { ...state.registrationDraft, phone },
      }));
      return true;
    } catch {
      set({ isLoading: false });
      return false;
    }
  },

  verifyOtp: async (phone: string, otp: string, mode?: 'LOGIN' | 'REGISTER') => {
    set({ isLoading: true });
    try {
      const response = await customerApi.verifyOtp(phone, otp);
      setAuthToken(response.token);

      const isProfileDone = response.profileCompleted ?? (mode === 'LOGIN');

      set({
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        token: response.token,
        customer: response.customer,
      });

      return {
        ...response,
        profileCompleted: isProfileDone,
        nextAction: isProfileDone ? 'OPEN_HOME' : 'RESUME_REGISTRATION',
      };
    } catch {
      // Offline / fallback dev mode
      const mockToken = `jwt-customer-${Date.now()}`;
      setAuthToken(mockToken);

      const fallbackCustomer: CustomerUser = {
        ...mockCustomer,
        phone,
        profileCompleted: mode === 'LOGIN',
      };

      set({
        isAuthenticated: true,
        isGuest: false,
        isLoading: false,
        token: mockToken,
        customer: fallbackCustomer,
      });

      return {
        token: mockToken,
        customer: fallbackCustomer,
        profileCompleted: mode === 'LOGIN',
        nextAction: mode === 'LOGIN' ? 'OPEN_HOME' : 'RESUME_REGISTRATION',
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
    const { registrationDraft, customer, token } = get();

    try {
      const fullName = `${registrationDraft.firstName} ${registrationDraft.lastName}`.trim() || 'Valued Customer';
      
      const payload: Partial<CustomerUser> = {
        name: fullName,
        email: registrationDraft.email || `customer_${registrationDraft.phone.slice(-4)}@sevazo.in`,
        avatar: registrationDraft.avatar,
        dob: registrationDraft.dob,
        shoppingPreferences: registrationDraft.preferences,
        profileCompleted: true,
        status: 'ACTIVE',
      };

      const updated = await customerApi.updateProfile(payload);

      // Save initial delivery address
      if (registrationDraft.address?.line1) {
        await customerApi.saveAddress({
          ...registrationDraft.address,
          contactName: fullName,
          contactPhone: registrationDraft.phone || customer?.phone || '+91 9876543210',
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
    } catch (e) {
      set({ isLoading: false });
      const fallback: CustomerUser = {
        ...(customer || mockCustomer),
        name: `${registrationDraft.firstName} ${registrationDraft.lastName}`.trim() || 'Valued Customer',
        email: registrationDraft.email || 'customer@sevazo.in',
        profileCompleted: true,
        status: 'ACTIVE',
      };
      set({
        customer: fallback,
        isAuthenticated: true,
        isGuest: false,
      });
      return fallback;
    }
  },

  updateProfile: async (data: Partial<CustomerUser>) => {
    try {
      const updated = await customerApi.updateProfile(data);
      set({ customer: updated });
    } catch (e) {
      console.error(e);
    }
  },

  continueAsGuest: () => {
    set({
      isGuest: true,
      isAuthenticated: false,
      customer: {
        id: 'guest-user',
        name: 'Guest Explorer',
        phone: '',
        email: 'guest@sevazo.in',
        isVerified: false,
        profileCompleted: false,
        totalSpent: 0,
        ordersCount: 0,
        walletBalance: 0,
      },
    });
  },

  checkSession: async () => {
    const { token, customer } = get();

    if (!token && !customer) {
      return 'WELCOME';
    }

    try {
      const me = await customerApi.getMe();
      if (me) {
        set({ customer: me, isAuthenticated: true, isGuest: false });
        if (me.profileCompleted === false) {
          return 'RESUME_REGISTRATION';
        }
        return 'OPEN_HOME';
      }
      return 'WELCOME';
    } catch {
      if (token) {
        return 'OPEN_HOME';
      }
      return 'WELCOME';
    }
  },

  logout: () => {
    setAuthToken(null);
    set({
      isAuthenticated: false,
      isGuest: false,
      token: null,
      customer: null,
      registrationDraft: initialRegistrationDraft,
    });
  },

  initialize: async () => {
    const result = await get().checkSession();
    if (result === 'WELCOME') {
      set({ isAuthenticated: false, isGuest: false });
    }
  },
}));
