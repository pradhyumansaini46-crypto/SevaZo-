import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  duration: 3000,

  showToast: (message: string, type: ToastType = 'info', duration = 3000) => {
    set({ visible: true, message, type, duration });
  },

  hideToast: () => {
    set({ visible: false, message: '' });
  },
}));
