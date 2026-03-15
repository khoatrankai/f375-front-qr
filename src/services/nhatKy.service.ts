/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/nhatKy.service.ts

import { getAuthHeaders } from "./auth.service";

const ENDPOINT = "https://f375-back-qr.onrender.com/api/nk"; // Đổi port cho đúng với Backend của bạn

export const nhatKyService = {
  // Lấy danh sách nhật ký hệ thống
  getDanhSachNhatKy: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách nhật ký");
      const data = (await response.json())?.data;
      return data.data || data; // Trả về mảng dữ liệu (tuỳ thuộc cấu trúc response của BE)
    } catch (error) {
      console.error("nhatKyService.getDanhSachNhatKy error:", error);
      throw error;
    }
  },
};
