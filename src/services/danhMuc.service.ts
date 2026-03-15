/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/danhMuc.service.ts

import { getAuthHeaders } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
const ENDPOINT = `${API_BASE_URL}/dm`;

// Định nghĩa Interface cơ bản dựa trên bảng 'danh_muc' trong Database
export interface DanhMuc {
  id?: number;
  ma_danh_muc: string;
  ten_danh_muc: string;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;

  // Trường ảo do backend JOIN trả về (tùy chọn để hiển thị trên bảng dễ hơn)
  parent_ten?: string;
  so_luong_san_pham?: number;
}

// Định nghĩa Interface cho cấu trúc Cây (Tree)
export interface DanhMucNode extends DanhMuc {
  children?: DanhMucNode[];
}

export const danhMucService = {
  // Lấy danh sách tất cả danh mục (Dạng phẳng - Flat list)
  getAll: async (): Promise<DanhMuc[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách danh mục");
      return (await response.json())?.data;
    } catch (error) {
      console.error("danhMucService.getAll error:", error);
      throw error;
    }
  },

  // Lấy danh sách danh mục dạng Cây (Tree)
  getTree: async (): Promise<DanhMucNode[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/tree`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải sơ đồ cây danh mục");
      return (await response.json())?.data;
    } catch (error) {
      console.error("danhMucService.getTree error:", error);
      throw error;
    }
  },

  // Lấy thông tin 1 danh mục theo ID
  getById: async (id: number): Promise<DanhMuc> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy thông tin danh mục");
      return (await response.json())?.data;
    } catch (error) {
      console.error("danhMucService.getById error:", error);
      throw error;
    }
  },

  // Thêm mới danh mục
  create: async (data: Partial<DanhMuc>): Promise<DanhMuc> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo danh mục mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error("danhMucService.create error:", error);
      throw error;
    }
  },

  // Cập nhật danh mục
  update: async (id: number, data: Partial<DanhMuc>): Promise<DanhMuc> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật danh mục");
      return (await response.json())?.data;
    } catch (error) {
      console.error("danhMucService.update error:", error);
      throw error;
    }
  },

  // Xóa danh mục
  delete: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa danh mục");
      return (await response.json())?.data;
    } catch (error) {
      console.error("danhMucService.delete error:", error);
      throw error;
    }
  },
};
