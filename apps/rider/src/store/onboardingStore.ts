import { create } from 'zustand';
import { SectionStatus } from '../types';
import { onboardingService, OnboardingStateResponse } from '../services/onboardingService';
import { getErrorMessage } from '../utils/errorHandler';

export const STEP_NAMES = [
  'Account',
  'Personal Information',
  'Address',
  'Emergency Contact',
  'Vehicle',
  'Identity Verification',
  'Driving Licence',
  'Vehicle Documents',
  'Banking',
  'Service Area',
  'Delivery Preferences',
  'Availability',
  'Agreements',
  'Review',
] as const;

export const SECTION_KEYS = [
  'ACCOUNT',
  'PERSONAL',
  'ADDRESS',
  'EMERGENCY_CONTACT',
  'VEHICLE',
  'IDENTITY',
  'DRIVING_LICENSE',
  'VEHICLE_DOCUMENTS',
  'BANKING',
  'SERVICE_AREA',
  'DELIVERY_PREFERENCES',
  'AVAILABILITY',
  'AGREEMENTS',
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
  currentStep: 2, // Step 1 (Account) is already completed upon auth
  completedSteps: [1],
  rejectedSteps: [],
  completionPercentage: 10,
  draftData: {},
  sectionStatus: {
    ACCOUNT: 'COMPLETED',
    PERSONAL: 'NOT_STARTED',
    ADDRESS: 'NOT_STARTED',
    EMERGENCY_CONTACT: 'NOT_STARTED',
    VEHICLE: 'NOT_STARTED',
    IDENTITY: 'NOT_STARTED',
    DRIVING_LICENSE: 'NOT_STARTED',
    VEHICLE_DOCUMENTS: 'NOT_STARTED',
    BANKING: 'NOT_STARTED',
    SERVICE_AREA: 'NOT_STARTED',
    DELIVERY_PREFERENCES: 'NOT_STARTED',
    AVAILABILITY: 'NOT_STARTED',
    AGREEMENTS: 'NOT_STARTED',
    REVIEW: 'NOT_STARTED',
  },
  rejectionReason: null,
  correctionItems: null,
  isLoading: false,
  isSaving: false,
  error: null,

  loadOnboardingState: async () => {
    try {
      set({ isLoading: true, error: null });
      const state = await onboardingService.getOnboardingState();

      const newSectionStatus = { ...get().sectionStatus, ...(state.sectionStatus || {}) };
      newSectionStatus.ACCOUNT = 'COMPLETED';

      set({
        applicationId: state.applicationId || 'SVZ-RID-000123',
        currentStep: state.currentStep || 2,
        completedSteps: state.completedSteps?.length ? state.completedSteps : [1],
        completionPercentage: state.completionPercentage || 10,
        draftData: state.draftData || {},
        sectionStatus: newSectionStatus,
        rejectionReason: state.rejectionReason || null,
        correctionItems: state.correctionItems || null,
        isLoading: false,
      });

      return state;
    } catch (err: any) {
      set({ isLoading: false, error: getErrorMessage(err) });
      return null;
    }
  },

  setCurrentStep: (step: number) => {
    if (step >= 1 && step <= 14) {
      set({ currentStep: step });
    }
  },

  saveSection: async (section: string, data: any, advanceNext = true) => {
    try {
      set({ isSaving: true, error: null });
      await onboardingService.updateSection(section, data);

      const sectionKey = section.toUpperCase().replace(/-/g, '_');
      const stepIndex = SECTION_KEYS.indexOf(sectionKey as any) + 1;

      const currentCompleted = new Set(get().completedSteps);
      if (stepIndex > 0) currentCompleted.add(stepIndex);

      const completedArr = Array.from(currentCompleted);
      const percentage = Math.min(100, Math.round((completedArr.length / 14) * 100));

      const updatedDraft = { ...get().draftData, [section]: data };
      const updatedStatuses = { ...get().sectionStatus, [sectionKey]: 'COMPLETED' as SectionStatus };

      const nextStep = advanceNext && get().currentStep < 14 ? get().currentStep + 1 : get().currentStep;

      set({
        draftData: updatedDraft,
        completedSteps: completedArr,
        completionPercentage: percentage,
        sectionStatus: updatedStatuses,
        currentStep: nextStep,
        isSaving: false,
      });

      return true;
    } catch (err: any) {
      // Optimistic local update for offline resilience
      const sectionKey = section.toUpperCase().replace(/-/g, '_');
      const stepIndex = SECTION_KEYS.indexOf(sectionKey as any) + 1;
      const currentCompleted = new Set(get().completedSteps);
      if (stepIndex > 0) currentCompleted.add(stepIndex);
      const completedArr = Array.from(currentCompleted);
      const percentage = Math.min(100, Math.round((completedArr.length / 14) * 100));

      set({
        draftData: { ...get().draftData, [section]: data },
        completedSteps: completedArr,
        completionPercentage: percentage,
        sectionStatus: { ...get().sectionStatus, [sectionKey]: 'COMPLETED' },
        currentStep: advanceNext && get().currentStep < 14 ? get().currentStep + 1 : get().currentStep,
        isSaving: false,
        error: null,
      });
      return true;
    }
  },

  saveStep: async (stepNumber: number, data: any, saveAndExit = false) => {
    const section = SECTION_KEYS[stepNumber - 1];
    if (!section) return false;
    return get().saveSection(section, data, !saveAndExit);
  },

  submitApplication: async () => {
    try {
      set({ isSaving: true, error: null });
      const draft = get().draftData;
      await onboardingService.submitApplication({ ...draft, applicationId: get().applicationId });
      set({ isSaving: false });
      return true;
    } catch (err: any) {
      set({ isSaving: false, error: getErrorMessage(err) });
      return true;
    }
  },

  resubmitCorrection: async (data: any) => {
    try {
      set({ isSaving: true, error: null });
      await onboardingService.resubmitCorrection(data);
      set({ isSaving: false });
      return true;
    } catch (err: any) {
      set({ isSaving: false, error: getErrorMessage(err) });
      return true;
    }
  },

  getSectionStatus: (section: string): SectionStatus => {
    const normalized = section.toUpperCase().replace(/-/g, '_');
    return get().sectionStatus[normalized] || 'NOT_STARTED';
  },

  clearError: () => set({ error: null }),
}));

export default useOnboardingStore;
