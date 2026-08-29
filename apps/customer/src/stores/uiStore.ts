import { create } from 'zustand';

export interface ToastConfig {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  title?: string;
  duration?: number;
}

export interface ModalConfig {
  isOpen: boolean;
  title: string;
  message: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
  type?: 'default' | 'danger' | 'success';
}

interface UiState {
  toasts: ToastConfig[];
  modal: ModalConfig | null;

  showToast: (type: ToastConfig['type'], message: string, title?: string, duration?: number) => void;
  hideToast: (id: string) => void;
  showModal: (config: Omit<ModalConfig, 'isOpen'>) => void;
  hideModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  toasts: [],
  modal: null,

  showToast: (type, message, title, duration = 3500) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastConfig = { id, type, message, title, duration };

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  showModal: (config) => {
    set({
      modal: {
        ...config,
        isOpen: true,
      },
    });
  },

  hideModal: () => {
    set({ modal: null });
  },
}));
