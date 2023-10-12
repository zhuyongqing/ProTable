import { type Ref } from 'vue';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
type ServiceRequestInterceptors = {
  // 请求拦截
  requestInterceptors?: (config: AxiosRequestConfig) => AxiosRequestConfig;
  requestInterceptorsCatch?: (err: any) => any;
  // 响应拦截
  responseInterceptors?: <T>(res: AxiosResponse<T>) => T;
  responseInterceptorsCatch?: (err: any) => any;
};

// 自定义 配置类型 增加 实例 拦截器
export interface ServiceRequestConfig extends AxiosRequestConfig {
  interceptors?: ServiceRequestInterceptors;
  noErrorTip?: boolean;
}

// 原始返回类型
export type BaseResonese<T> = {
  data: T;
  code: number;
  msg?: string;
};

// 后端返回普通类型嵌套了一层object
export type BaseResult<T> = {
  data: T;
};

// 列表返回类型
export type TableResponseType<T> = {
  list: T[];
  total: number;
};

export type RunFuncType = (params: any) => Promise<[any, any]>;

export type LoadingResultType<T> = {
  run: RunFuncType;
  data: Ref<T>;
  loading: Ref<boolean>;
  err: any;
};

export type PromiseResult<T> = Promise<[any, T | null]>;

// 普通请求返回
export type PromiseBaseResult<T> = PromiseResult<BaseResult<T>>;

// 列表请求返回
export type PromiseTableResult<T> = PromiseResult<TableResponseType<T>>;
