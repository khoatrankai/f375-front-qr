/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/donVi.service.ts

import { getAuthHeaders } from "./auth.service";

// Đổi cổng 5000 thành cổng backend của bạn đang chạy (hoặc dùng biến môi trường)
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
const ENDPOINT = `${API_BASE_URL}/dv`;

// Định nghĩa Interface dựa trên cấu trúc bảng don_vi trong Database
// export interface DonVi {
//   id?: number;
//   ma_don_vi: string;
//   ten_don_vi: string;
//   cap_tren_id?: number | null;
//   created_at?: string;
//   updated_at?: string;
//   soTB?: number; // Cột ảo tính số lượng trang bị (nếu API backend có trả về)
// }

export const donViService = {
  // Lấy danh sách tất cả đơn vị
  getAll: async (): Promise<any[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
        // Thêm header Authorization nếu dùng JWT:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách đơn vị");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Lấy thông tin 1 đơn vị theo ID
  getById: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy đơn vị");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Thêm mới đơn vị
  create: async (data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo đơn vị mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Cập nhật đơn vị
  update: async (id: number, data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật đơn vị");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Xóa đơn vị
  delete: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa đơn vị");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  getTree: async (): Promise<any[]> => {
    try {
      // Gọi đúng route /tree như backend đã định nghĩa
      const response = await fetch(`${ENDPOINT}/tree`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải sơ đồ cây đơn vị");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
