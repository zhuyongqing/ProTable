import { BaseRequest } from '@/service/request';
import { PromiseTableResult } from '@/service/types';

export type User = {
  name: string;
  phone: string;
  age: number;
  statusStr: string;
  status: number;
};

/**
 *
 * @param data
 * @returns
 */
export function getUserList(): PromiseTableResult<User> {
  return BaseRequest({
    url: '/user/userList',
    method: 'get'
  });
}
