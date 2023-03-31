import axios, {AxiosRequestConfig, AxiosResponse} from 'axios';
import {environment} from '../../environments/environment';
import {CONFIG} from './constants';

export const axiosInstance = axios.create({
  baseURL: environment.apiUrl,
  timeout: 30000,
});

axiosInstance.interceptors.request.use(
  (config: AxiosRequestConfig) => {
    const token = localStorage.getItem(CONFIG.KEY.TOKEN);
    config.headers.language = localStorage.getItem(CONFIG.KEY.LOCALIZATION) || environment.defaultLanguage;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    throw error;
  },
);

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    if (response.status && response.data?.status) {
      return response.data;
    }
    throw new Error(response.data?.message || 'Error');
  }, (error) => {
    throw error;
  },
);
