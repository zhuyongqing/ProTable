import axios from 'axios';
import type { AxiosInstance, AxiosResponse } from 'axios';
import type { ServiceRequestConfig } from './types';
import { getToken } from '@/utils/auth';
import { ElMessage } from 'element-plus';

class Service {
  instance: AxiosInstance;
  constructor(config: ServiceRequestConfig) {
    this.instance = axios.create(config);

    this.instance.interceptors.request.use(
      (res: ServiceRequestConfig) => {
        if (!res.headers) {
          throw new Error(`Expected 'config' and 'config.headers' not to be undefined`);
        }
        (res.headers as any)['X-Token'] = getToken();
        (res.headers as any).Authorization = getToken();
        return res;
      },
      (err: any) => {
        return Promise.reject(err);
      }
    );

    // 使用自定义实例拦截器
    this.instance.interceptors.request.use(
      config.interceptors?.requestInterceptors,
      config.interceptors?.requestInterceptorsCatch
    );

    this.instance.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      (error) => {
        if (error.response.data) {
          console.log(error.response.status);
          if (error.response.status === 401) {
            // window.location.href = `${import.meta.env.VITE_APP_BASE_ROUTE}/login?redirect`;
          }
        }
        ElMessage({
          message: error.message || '系统出错',
          type: 'error'
        });
        return Promise.reject(error);
      }
    );

    this.instance.interceptors.response.use(
      config.interceptors?.responseInterceptors,
      config.interceptors?.responseInterceptorsCatch
    );
  }
  // request<T>(config: ServiceRequestConfig): Promise<T> {
  //   return new Promise((resolve, reject) => {
  //     // 接口拦截
  //     if (config.interceptors?.requestInterceptors) {
  //       config = config.interceptors.requestInterceptors(config);
  //     }
  //     this.instance.request<any, T>(config).then(
  //       res => {
  //         if (config.interceptors?.responseInterceptors) {
  //           res = config.interceptors.responseInterceptors(
  //             res as AxiosResponse
  //           );
  //         }
  //         resolve(res);
  //       },
  //       err => {
  //         reject(err);
  //       }
  //     );
  //   });
  // }
}

export default Service;
