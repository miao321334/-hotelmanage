import axios from 'axios';
import { getToken } from './auth';
import { Reservation } from '../types';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * 用户登录。
 *
 * @param credentials 登录凭证（邮箱和密码）
 * @returns 登录后的用户和 token 数据
 */
export const login = (credentials: { email: string; password: string }) =>
  api.post('/api/auth/login', credentials).then(res => res.data);

/**
 * 用户注册。
 *
 * @param data 注册信息
 * @returns 注册结果
 */
export const register = (data: { email: string; password: string; name: string }) =>
  api.post('/api/auth/register', data).then(res => res.data);

// 酒店（商户）

/**
 * 获取当前商户名下的酒店列表。
 *
 * @returns 酒店列表数据
 */
export const getMyHotels = () => api.get('/api/hotels/merchant').then(res => res.data);

/**
 * 创建酒店。
 *
 * @param data 酒店创建数据
 * @returns 创建成功后的酒店数据
 */
export const createHotel = (data: any) => api.post('/api/hotels', data).then(res => res.data);

/**
 * 获取酒店详情。
 *
 * @param id 酒店 ID
 * @returns 酒店详情
 */
export const getHotel = (id: string) => api.get(`/api/hotels/${id}`).then(res => res.data);

/**
 * 更新酒店信息。
 *
 * @param id 酒店 ID
 * @param data 待更新数据
 * @returns 更新后的酒店信息
 */
export const updateHotel = (id: string, data: any) => api.put(`/api/hotels/${id}`, data).then(res => res.data);

/**
 * 删除酒店。
 *
 * @param id 酒店 ID
 * @returns 删除结果
 */
export const deleteHotel = (id: string) => api.delete(`/api/hotels/${id}`).then(res => res.data);

/**
 * 上传酒店图片。
 *
 * @param hotelId 酒店 ID
 * @param formData 图片表单数据
 * @returns 上传后的图片信息
 */
export const uploadHotelImage = (hotelId: string, formData: FormData) =>
  api.post(`/api/hotels/${hotelId}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(res => res.data);

/**
 * 更新酒店图片信息。
 *
 * @param hotelId 酒店 ID
 * @param imageId 图片 ID
 * @param data 更新数据
 * @returns 更新后的图片信息
 */
export const updateHotelImage = (hotelId: string, imageId: string, data: { description?: string; isMain?: boolean }) =>
  api.put(`/api/hotels/${hotelId}/images/${imageId}`, data).then(res => res.data);

/**
 * 删除酒店图片。
 *
 * @param hotelId 酒店 ID
 * @param imageId 图片 ID
 * @returns 删除结果
 */
export const deleteHotelImage = (hotelId: string, imageId: string) =>
  api.delete(`/api/hotels/${hotelId}/images/${imageId}`).then(res => res.data);

/**
 * 将后端返回的图片路径转换为完整可访问的 URL。
 *
 * @param path 图片路径
 * @returns 完整 URL
 */
export const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  return `${baseUrl}${path}`;
};

/**
 * 获取标签列表。
 *
 * @returns 标签数据
 */
export const getTags = () => api.get('/tags').then(res => res.data);

// 审核（管理员）

/**
 * 管理员获取酒店列表。
 *
 * @param params 查询参数
 * @returns 酒店列表
 */
export const getAllHotels = (params?: any) => api.get('/api/admin/hotels', { params }).then(res => res.data);

/**
 * 获取待审核酒店列表。
 *
 * @returns 待审核酒店
 */
export const getPendingHotels = () => api.get('/api/admin/hotels/pending').then(res => res.data);

/**
 * 审核通过酒店。
 *
 * @param id 酒店 ID
 * @returns 操作结果
 */
export const approveHotel = (id: string) => api.post(`/api/admin/hotels/${id}/approve`);

/**
 * 拒绝酒店审核。
 *
 * @param id 酒店 ID
 * @param reason 拒绝原因
 * @returns 操作结果
 */
export const rejectHotel = (id: string, reason: string) => api.post(`/api/admin/hotels/${id}/reject`, { reason });

/**
 * 下线酒店。
 *
 * @param id 酒店 ID
 * @returns 操作结果
 */
export const offlineHotel = (id: string) => api.post(`/api/admin/hotels/${id}/offline`);

/**
 * 上线酒店。
 *
 * @param id 酒店 ID
 * @returns 操作结果
 */
export const onlineHotel = (id: string) => api.post(`/api/admin/hotels/${id}/online`);

// 预订（预约）管理

/**
 * 获取所有预订记录列表。
 *
 * @returns 预订列表
 */
export const getReservations = () =>
  api.get<Reservation[]>('/api/reservations').then(res => res.data);

/**
 * 办理入住。
 *
 * @param id 预订 ID
 * @returns 更新后的预订数据
 */
export const checkInReservation = (id: string) =>
  api.put(`/api/reservations/${id}/check-in`).then(res => res.data);

/**
 * 办理退房。
 *
 * @param id 预订 ID
 * @returns 更新后的预订数据
 */
export const checkOutReservation = (id: string) =>
  api.put(`/api/reservations/${id}/check-out`).then(res => res.data);

/**
 * 取消预订。
 *
 * @param id 预订 ID
 * @returns 更新后的预订数据
 */
export const cancelReservation = (id: string) =>
  api.put(`/api/reservations/${id}/cancel`).then(res => res.data);