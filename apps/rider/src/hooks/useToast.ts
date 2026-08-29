import { useToastStore, ToastType } from '../store/toastStore';

export const useToast = () => {
  const { showToast, hideToast } = useToastStore();

  return {
    show: (message: string, type?: ToastType, duration?: number) => showToast(message, type, duration),
    success: (message: string, duration?: number) => showToast(message, 'success', duration),
    error: (message: string, duration?: number) => showToast(message, 'error', duration),
    warning: (message: string, duration?: number) => showToast(message, 'warning', duration),
    info: (message: string, duration?: number) => showToast(message, 'info', duration),
    hide: hideToast,
  };
};

export default useToast;
