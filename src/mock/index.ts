import Mock from 'mockjs';
import userApi from './user';

Mock.mock('/user/userList', userApi.getUserList);
