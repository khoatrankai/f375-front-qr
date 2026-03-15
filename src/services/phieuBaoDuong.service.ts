/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/phieuBaoDuong.service.ts

import { getAuthHeaders } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
const ENDPOINT = `${API_BASE_URL}/pbd`;

// ============================================================================
// INTERFACES
// ============================================================================
// export interface ChiTietBaoDuong {
//   id?: number;
//   phieu_bao_duong_id?: number;
//   trang_bi_thuc_te_id: number;
//   noi_dung_thuc_hien?: string;
//   cap_chat_luong_truoc?: number;
//   cap_chat_luong_sau?: number;

//   // Virtual fields do backend JOIN trả về
//   ma_qr?: string;
//   so_serial?: string;
//   ten_san_pham?: string;
// }

// export interface PhieuBaoDuong {
//   id?: number;
//   ma_phieu: string;
//   loai_cong_viec_id: number;
//   nguoi_phu_trach_id?: number | null;
//   ngay_bat_dau: string;
//   ngay_hoan_thanh?: string | null;
//   trang_thai: "DANG_XU_LY" | "HOAN_THANH";
//   created_at?: string;
//   updated_at?: string;

//   chi_tiet?: ChiTietBaoDuong[];

//   // Virtual fields
//   ten_loai_cv?: string;
//   nguoi_phu_trach_ten?: string;
//   so_luong_trang_bi?: number;
// }

// ============================================================================
// SERVICE METHODS
// ============================================================================
export const phieuBaoDuongService = {
  // Lấy danh sách tất cả các phiếu bảo dưỡng
  getDanhSachPhieu: async (): Promise<any[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Lỗi khi tải danh sách phiếu bảo dưỡng");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBaoDuongService.getDanhSachPhieu error:", error);
      throw error;
    }
  },

  // Lấy chi tiết 1 phiếu bảo dưỡng (kèm danh sách thiết bị)
  getChiTietPhieu: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Không tìm thấy thông tin phiếu bảo dưỡng");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBaoDuongService.getChiTietPhieu error:", error);
      throw error;
    }
  },

  // Tạo phiếu bảo dưỡng mới
  createPhieu: async (
    data: Partial<any> & { danh_sach_thiet_bi_ids: number[] },
  ): Promise<any> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo phiếu bảo dưỡng");
      return await response.json();
    } catch (error) {
      console.error("phieuBaoDuongService.createPhieu error:", error);
      throw error;
    }
  },
  // Cập nhật trạng thái hoàn thành (Truyền lên mảng chi tiết chứa cấp chất lượng sau và nội dung)
  completeBaoDuong: async (
    id: number,
    data: { chi_tiet: any[]; ngay_hoan_thanh: string },
  ): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}/hoan-thanh`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi hoàn thành phiếu bảo dưỡng");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBaoDuongService.completeBaoDuong error:", error);
      throw error;
    }
  },
};
