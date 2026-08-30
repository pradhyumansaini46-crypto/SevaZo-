import { create } from 'zustand';
import { SectionStatus } from '../types';
import { onboardingService, OnboardingStateResponse } from '../services/onboardingService';
import { getErrorMessage } from '../utils/errorHandler';

export const STEP_NAMES = [
  'Personal Information',
  'Residential Address',
  'Identity & Driving Licence',
  'Vehicle & Documents',
  'Bank & Payouts',
  'Service Area & Preferences',
  'Working Hours & Availability',
  'Consent & Undertaking',
  'Review & Submit',
] as const;

export const SECTION_KEYS = [
  'PERSONAL',
  'ADDRESS',
  'IDENTITY',
  'VEHICLE',
  'BANKING',
  'DELIVERY_PREFERENCES',
  'AVAILABILITY',
  'CONSENT',
  'REVIEW',
] as const;

export interface OnboardingStoreState {
  applicationId: string;
  currentStep: number;
  completedSteps: number[];
  rejectedSteps: number[];
  completionPercentage: number;
  draftData: Record<string, any>;
  sectionStatus: Record<string, SectionStatus>;
  rejectionReason: string | null;
  correctionItems: any[] | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  // Actions
  loadOnboardingState: () => Promise<OnboardingStateResponse | null>;
  resetOnboarding: (phone?: string, email?: string) => void;
  setCurrentStep: (step: number) => void;
  saveSection: (section: string, data: any, advanceNext?: boolean) => Promise<boolean>;
  saveStep: (stepNumber: number, data: any, saveAndExit?: boolean) => Promise<boolean>;
  submitApplication: () => Promise<boolean>;
  resubmitCorrection: (data: any) => Promise<boolean>;
  getSectionStatus: (section: string) => SectionStatus;
  clearError: () => void;
}

export const useOnboardingStore = create<OnboardingStoreState>((set, get) => ({
  applicationId: 'SVZ-RID-000123',
  currentStep: 1, // Start directly at Step 1 (Personal Information)
  completedSteps: [],
  rejectedSteps: [],
  completionPercentage: 12,
  draftData: {},
  sectionStatus: {
    PERSONAL: 'NOT_STARTED',
    ADDRESS: 'NOT_STARTED',
    IDENTITY: 'NOT_STARTED',
    VEHICLE: 'NOT_STARTED',
    BANKING: 'NOT_STARTED',
    DELIVERY_PREFERENCES: 'NOT_STARTED',
    AVAILABILITY: 'NOT_STARTED',
    CONSENT: 'NOT_STARTED',
    REVIEW: 'NOT_STARTED',
  },
  rejectionReason: null,
  correctionItems: null,
  isLoading: false,
  isSaving: false,
  error: null,

  resetOnboarding: (phone?: string, email?: string) => {
    set({
      applicationId: `SVZ-RID-${Math.floor(100000 + Math.random() * 900000)}`,
      currentStep: 1,
      completedSteps: [],
      rejectedSteps: [],
      completionPercentage: 12,
      draftData: {
        personal: {
          phone: phone || '',
          email: email || '',
        },
      },
      sectionStatus: {
        PERSONAL: 'NOT_STARTED',
        ADDRESS: 'NOT_STARTED',
        IDENTITY: 'NOT_STARTED',
        VEHICLE: 'NOT_STARTED',
        BANKING: 'NOT_STARTED',
        DELIVERY_PREFERENCES: 'NOT_STARTED',
        AVAILABILITY: 'NOT_STARTED',
        CONSENT: 'NOT_STARTED',
        REVIEW: 'NOT_STARTED',
      },
      rejectionReason: null,
      correctionItems: null,
      error: null,
    });
  },

  loadOnboardingState: async () => {
    try {
      set({ isLoading: true, error: null });
      const state = await onboardingService.getOnboardingState();

      const newSectionStatus = { ...get().sectionStatus, ...(state.sectionStatus || {}) };

      set({
        applicationId: state.applicationId || 'SVZ-RID-000123',
        currentStep: Math.max(1, state.currentStep || 1),
        completedSteps: state.completedSteps || [],
        rejectedSteps: (state as any).rejectedSteps || [],
        completionPercentage: Math.max(12, state.completionPercentage || 12),
        draftData: state.draftData || {},
        sectionStatus: newSectionStatus,
        rejectionReason: state.rejectionReason || null,
        correctionItems: state.correctionItems || null,
        isLoading: false,
      });

      return state;
    } catch (err: any) {
      set({
        error: getErrorMessage(err),
        isLoading: false,
      });
      return null;
    }
  },

  setCurrentStep: (step: number) => {
    const total = 8;
    const clamped = Math.max(1, Math.min(step, total));
    set({
      currentStep: clamped,
      completionPercentage: Math.round((clamped / total) * 100),
    });
  },

  saveSection: async (section: string, data: any, advanceNext: boolean = true) => {
    try {
      set({ isSaving: true, error: null });

      const updatedDraft = {
        ...get().draftData,
        [section]: {
          ...(get().draftData[section] || {}),
          ...data,
        },
      };

      const sectionKeyUpper = section.toUpperCase();
      const updatedSectionStatus = {
        ...get().sectionStatus,
        [sectionKeyUpper]: 'COMPLETED' as SectionStatus,
      };

      const current = get().currentStep;
      const next = advanceNext ? Math.min(current + 1, 8) : current;
      const total = 8;

      const completed = Array.from(new Set([...get().completedSteps, current]));

      set({
        draftData: updatedDraft,
        sectionStatus: updatedSectionStatus,
        completedSteps: completed,
        currentStep: next,
        completionPercentage: Math.round((completed.length / total) * 100),
        isSaving: false,
      });

      // Async sync with backend
      onboardingService
        .updateSection(section, data)
        .catch((err: any) => console.warn('Background sync failed:', err));

      return true;
    } catch (err: any) {
      set({
        error: getErrorMessage(err),
        isSaving: false,
      });
      return false;
    }
  },

  saveStep: async (stepNumber: number, data: any, saveAndExit: boolean = false) => {
    const sectionKey = SECTION_KEYS[stepNumber - 1]?.toLowerCase() || `step_${stepNumber}`;
    return get().saveSection(sectionKey, data, !saveAndExit);
  },

  submitApplication: async () => {
    try {
      set({ isSaving: true, error: null });
      const result = await onboardingService.submitApplication();
      if (result.success) {
        set({
          sectionStatus: {
            ...get().sectionStatus,
            REVIEW: 'COMPLETED',
          },
          completionPercentage: 100,
          isSaving: false,
        });
        return true;
      }
      set({
        error: result.message || 'Submission failed. Please check all steps.',
        isSaving: false,
      });
      return false;
    } catch (err: any) {
      set({
        error: getErrorMessage(err),
        isSaving: false,
      });
      return false;
    }
  },

  resubmitCorrection: async (data: any) => {
    try {
      set({ isSaving: true, error: null });
      const result = await onboardingService.resubmitCorrection(data);
      if (result.success) {
        set({
          rejectionReason: null,
          correctionItems: null,
          isSaving: false,
        });
        return true;
      }
      set({
        error: result.message || 'Correction resubmission failed.',
        isSaving: false,
      });
      return false;
    } catch (err: any) {
      set({
        error: getErrorMessage(err),
        isSaving: false,
      });
      return false;
    }
  },

  getSectionStatus: (section: string) => {
    const key = section.toUpperCase();
    return get().sectionStatus[key] || 'NOT_STARTED';
  },

  clearError: () => set({ error: null }),
}));

export default useOnboardingStore;
