import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { authStorage } from './authStorage';
import { RiderUser, OnboardingStatus, NextAction } from '../types';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  phone?: string;
  debugOtp?: string;
}

export interface VerifyOtpResponse {
  accessToken: string;
  refreshToken?: string;
  isNewUser: boolean;
  riderId: string;
  applicationId?: string;
  status: OnboardingStatus;
  nextAction: NextAction;
  message?: string;
  operationalStatus?: string;
  rejectionReason?: string;
  correctionItems?: any[];
  rider: RiderUser;
}

export interface SessionCheckResponse {
  isAuthenticated: boolean;
  status: OnboardingStatus;
  nextAction: NextAction;
  rejectionReason?: string;
  rider?: RiderUser;
}

/**
 * Authentication API Service for Sevazo Rider
 */
export const authService = {
  async sendOtp(phone: string, email?: string): Promise<SendOtpResponse> {
    const res = await apiClient.post(ENDPOINTS.AUTH.SEND_OTP, {
      phone,
      email,
    });
    return (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
  },

  async register(phone: string, email?: string): Promise<SendOtpResponse> {
    const res = await apiClient.post(ENDPOINTS.AUTH.REGISTER, {
      phone,
      email,
    });
    return (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
  },

  async verifyOtp(phone: string, otp: string): Promise<VerifyOtpResponse> {
    const res = await apiClient.post(ENDPOINTS.AUTH.VERIFY_OTP, {
      phone,
      otp,
    });

    const payload: VerifyOtpResponse =
      (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;

    if (payload?.accessToken) {
      await authStorage.setAccessToken(payload.accessToken);
      if (payload.refreshToken) {
        await authStorage.setRefreshToken(payload.refreshToken);
      }
    }

    return payload;
  },

  async sessionCheck(): Promise<SessionCheckResponse> {
    const res = await apiClient.get(ENDPOINTS.AUTH.SESSION_CHECK);
    return (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      // Proceed with local logout even if network fails
    } finally {
      await authStorage.clearAuthTokens();
    }
  },

  async getMe(): Promise<RiderUser> {
    const res = await apiClient.get(ENDPOINTS.AUTH.ME);
    return (res.data as any)?.data !== undefined ? (res.data as any).data : res.data;
  },
};

export default authService;
