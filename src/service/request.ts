import { PromiseResult } from '@/service/types';
import { BaseResonese, ServiceRequestConfig } from './types';
import Service from './index';
import { ElMessage } from 'element-plus';

// 业务请求
const BaseService = new Service({
  baseURL: '',
  timeout: 50000,
  headers: { 'Content-Type': 'application/json;charset=utf-8' }
});

const mergeRequest = <T>(service: Service, config: ServiceRequestConfig): PromiseResult<T> => {
  return new Promise((resolve, reject) => {
    service.instance.request<BaseResonese<T>>(config).then(
      (res) => {
        const { code, msg, data } = res.data;
        if (code === 200) {
          resolve([null, data]);
        } else {
          if (!config.noErrorTip) {
            ElMessage({
              message: msg || '系统出错',
              type: 'error'
            });
          }
          resolve([msg || '系统出错', data]);
        }
      },
      (err) => {
        resolve([err, null]);
      }
    );
  });
};

// 基本请求
export const BaseRequest = <T>(config: ServiceRequestConfig): PromiseResult<T> => {
  return mergeRequest(BaseService, config);
};
