import apiClient from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import { SectionStatus } from '../types';

export interface OnboardingStateResponse {
  riderId: string;
  applicationId: string;
  phone: string;
  name: string;
  status: string;
  approvalStatus: string;
  rejectionReason?: string;
  correctionItems?: any[];
  currentStep: number;
  completedSteps: number[];
  completionPercentage: number;
  draftData: any;
  sections?: Array<{ section: string; status: SectionStatus; rejectionReason?: string }>;
  sectionStatus?: Record<string, SectionStatus>;
  submittedAt?: string;
}

export const onboardingService = {
  async getOnboardingState(): Promise<OnboardingStateResponse> {
    const res = await apiClient.get<OnboardingStateResponse>(ENDPOINTS.ONBOARDING.STATE);
    return res.data;
  },

  async updateSection(section: string, data: any): Promise<{ success: boolean; message: string; completionPercentage?: number }> {
    const res = await apiClient.patch(`/rider/onboarding/${section.toLowerCase().replace(/_/g, '-')}`, data);
    return res.data;
  },

  async getPersonal(): Promise<any> {
    const res = await apiClient.get('/rider/onboarding/personal');
    return res.data;
  },

  async savePersonal(data: any): Promise<any> {
    const res = await apiClient.patch('/rider/onboarding/personal', data);
    return res.data;
  },

  async getAddress(): Promise<any> {
    const res = await apiClient.get('/rider/onboarding/address');
    return res.data;
  },

  async saveAddress(data: any): Promise<any> {
    const res = await apiClient.patch('/rider/onboarding/address', data);
    return res.data;
  },

  async getEmergencyContact(): Promise<any> {
    const res = await apiClient.get('/rider/onboarding/emergency-contact');
    return res.data;
  },

  async saveEmergencyContact(data: any): Promise<any> {
    const res = await apiClient.patch('/rider/onboarding/emergency-contact', data);
    return res.data;
  },

  async saveStep(stepNumber: number, data: any, saveAndExit = false): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.ONBOARDING.SAVE_STEP, {
      stepNumber,
      data,
      saveAndExit,
    });
    return res.data;
  },

  async submitApplication(payload?: any): Promise<any> {
    try {
      const res = await apiClient.post(ENDPOINTS.ONBOARDING.SUBMIT, payload);
      try {
        await fetch('http://192.168.1.7:3000/api/applications/rider-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
      return res.data;
    } catch (err) {
      try {
        await fetch('http://192.168.1.7:3000/api/applications/rider-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } catch (e) {}
      throw err;
    }
  },

  async resubmitCorrection(correctedData: any): Promise<any> {
    const res = await apiClient.post(ENDPOINTS.ONBOARDING.RESUBMIT, { correctedData });
    return res.data;
  },
};

export default onboardingService;
