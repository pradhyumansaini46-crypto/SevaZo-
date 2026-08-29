import { useToastStore, ToastType } from '../stores/toastStore';

export const useToast = () => {
  const { showToast, hideToast, clearToasts, toasts } = useToastStore();

  return {
    toasts,
    toast: (message: string, type: ToastType = 'info', duration?: number) =>
      showToast(message, type, duration),
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
    hide: hideToast,
    clear: clearToasts,
  };
};
