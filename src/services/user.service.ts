/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/user.service.ts

import { authService } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
const ENDPOINT = `${API_BASE_URL}/user`;

// Định nghĩa Interface dựa trên bảng 'users' trong Database
const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};
export const userService = {
  // Lấy danh sách tất cả tài khoản
  getAll: async (): Promise<any[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
        // Thêm header Authorization nếu đã bật JWT middleware ở Backend:
        // "Authorization": `Bearer ${localStorage.getItem("token")}`
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách tài khoản");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Lấy thông tin 1 tài khoản theo ID
  getById: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy thông tin tài khoản");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Thêm mới tài khoản
  create: async (data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo tài khoản mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Cập nhật thông tin tài khoản
  update: async (id: number, data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật tài khoản");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  // Xóa tài khoản
  delete: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa tài khoản");
      return (await response.json())?.data;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  updateProfile: async (payload: {
    full_name: string;
    profile_data: string;
  }): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const res = await response.json();
      if (!response.ok || !res.success)
        throw new Error(res.message || "Cập nhật hồ sơ thất bại");
      return res?.data || res;
    } catch (error) {
      console.error("userService.updateProfile error:", error);
      throw error;
    }
  },

  // 2. Đổi mật khẩu
  changePassword: async (
    old_password: string,
    new_password: string,
  ): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/change-password`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ old_password, new_password }), // Tùy thuộc vào BE mà bạn đặt key là oldPassword hay old_password nhé
      });
      const res = await response.json();
      if (!response.ok || !res.success)
        throw new Error(res.message || "Đổi mật khẩu thất bại");
      return res?.data || res;
    } catch (error) {
      console.error("userService.changePassword error:", error);
      throw error;
    }
  },
};
