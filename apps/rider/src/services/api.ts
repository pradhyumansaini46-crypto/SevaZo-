import { apiClient, setAuthToken } from '../api/client';
import { ENV } from '../constants/env';

export const API_BASE_URL = ENV.API_BASE_URL;

export { apiClient, setAuthToken };
export default apiClient;
