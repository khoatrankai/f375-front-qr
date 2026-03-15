/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/dashboard.service.ts

import { getAuthHeaders } from "./auth.service";

const ENDPOINT = "https://f375-back-qr.onrender.com/api/dashboard"; // Đổi port cho đúng với Backend của bạn

export const dashboardService = {
  // Lấy dữ liệu tổng quan cho trang Dashboard
  getOverviewDashboard: async (): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tong-quan`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải dữ liệu Dashboard");

      const data = await response.json();
      return data.data; // Trả về object chứa tong_quan, phan_bo_trang_thai...
    } catch (error) {
      console.error("dashboardService.getOverviewDashboard error:", error);
      throw error;
    }
  },
};
