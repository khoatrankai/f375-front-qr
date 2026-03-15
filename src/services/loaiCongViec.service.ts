/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/loaiCongViec.service.ts

import { getAuthHeaders } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
const ENDPOINT = `${API_BASE_URL}/lcv `;

// Định nghĩa Interface dựa trên bảng 'loai_cong_viec'
// export interface LoaiCongViec {
//   id?: number;
//   ma_loai_cv: string;
//   ten_loai_cv: string;
//   mo_ta?: string | null;
//   created_at?: string;
//   updated_at?: string;
// }

export const loaiCongViecService = {
  // Lấy danh sách tất cả loại công việc
  getAll: async (): Promise<any[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách loại công việc");
      return (await response.json())?.data;
    } catch (error) {
      console.error("loaiCongViecService.getAll error:", error);
      throw error;
    }
  },

  // Lấy thông tin 1 loại công việc theo ID
  getById: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy loại công việc");
      return (await response.json())?.data;
    } catch (error) {
      console.error("loaiCongViecService.getById error:", error);
      throw error;
    }
  },

  // Thêm mới
  create: async (data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo loại công việc mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error("loaiCongViecService.create error:", error);
      throw error;
    }
  },

  // Cập nhật
  update: async (id: number, data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật loại công việc");
      return (await response.json())?.data;
    } catch (error) {
      console.error("loaiCongViecService.update error:", error);
      throw error;
    }
  },

  // Xóa
  delete: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa loại công việc");
      return (await response.json())?.data;
    } catch (error) {
      console.error("loaiCongViecService.delete error:", error);
      throw error;
    }
  },
};
