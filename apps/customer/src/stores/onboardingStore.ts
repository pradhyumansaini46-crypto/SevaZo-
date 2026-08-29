import { create } from 'zustand';
import { CustomerOnboardingState } from '../types';
import { customerApi } from '../services/customerApi';
import { useAuthStore } from './authStore';

interface OnboardingEngineState {
  currentSection: string;
  progress: number;
  completedSections: string[];
  isLoading: boolean;

  fetchServerOnboardingState: () => Promise<void>;
  updateSection: (section: string, data: any) => Promise<boolean>;
  skipSection: (section: string) => Promise<void>;
  saveAndExit: (navigation: any) => Promise<void>;
}

export const useOnboardingStore = create<OnboardingEngineState>((set, get) => ({
  currentSection: 'PROFILE',
  progress: 25,
  completedSections: ['ACCOUNT'],
  isLoading: false,

  fetchServerOnboardingState: async () => {
    set({ isLoading: true });
    try {
      const state = await customerApi.getOnboardingState();
      set({
        currentSection: state.currentStep,
        progress: state.progress,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  updateSection: async (section: string, data: any) => {
    set({ isLoading: true });
    const { updateRegistrationDraft } = useAuthStore.getState();

    try {
      updateRegistrationDraft(data);
      await customerApi.updateOnboardingStep({
        currentStep: section,
        progress: Math.min(100, get().progress + 15),
      });

      set((state) => ({
        isLoading: false,
        completedSections: [...state.completedSections, section],
        progress: Math.min(100, state.progress + 15),
      }));
      return true;
    } catch {
      set({ isLoading: false });
      return true;
    }
  },

  skipSection: async (section: string) => {
    try {
      await customerApi.updateOnboardingStep({
        currentStep: section,
        progress: Math.min(100, get().progress + 10),
      });
      set((state) => ({
        progress: Math.min(100, state.progress + 10),
      }));
    } catch (e) {
      console.error(e);
    }
  },

  saveAndExit: async (navigation: any) => {
    const { registrationDraft } = useAuthStore.getState();
    try {
      await customerApi.updateOnboardingStep({
        currentStep: registrationDraft.currentStep,
        status: 'DRAFT',
      });
    } catch {
      // Offline fallback
    }
    navigation.replace('Welcome');
  },
}));
