/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/phieuMuonTra.service.ts

import { getAuthHeaders } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
// Tùy thuộc vào file app.js/server.js của bạn cấu hình router này là gì, thường là /api/phieu-muon-tra
const ENDPOINT = `${API_BASE_URL}/pmt`;

// ============================================================================
// INTERFACES
// ============================================================================

// export interface ThongKeMuonTra {
//   tong_dang_muon: number;
//   tong_da_tra: number;
//   tong_qua_han: number;
// }

// export interface PhieuMuonTraChiTiet {
//   id?: number;
//   phieu_muon_id?: number;
//   trang_bi_thuc_te_id: number;
//   tinh_trang_khi_muon?: string;
//   tinh_trang_khi_tra?: string;

//   // Virtual fields do backend JOIN trả về để hiển thị UI
//   ma_qr?: string;
//   so_serial?: string;
//   ten_san_pham?: string;
// }

// export interface PhieuMuonTra {
//   id?: number;
//   ma_phieu: string;
//   nguoi_muon_id?: number | null;
//   nguoi_cho_muon_id?: number | null;
//   don_vi_muon_id?: number | null; // Nếu mượn cho đơn vị
//   ngay_muon: string;
//   ngay_hen_tra?: string;
//   ngay_tra_thuc_te?: string | null;
//   muc_dich?: string;
//   trang_thai: "DANG_MUON" | "DA_TRA" | "QUA_HAN";
//   created_at?: string;
//   updated_at?: string;

//   // Thuộc tính mảng chứa các thiết bị được mượn
//   chi_tiet?: PhieuMuonTraChiTiet[];

//   // Virtual fields do backend JOIN trả về
//   nguoi_muon_ten?: string;
//   nguoi_cho_muon_ten?: string;
//   don_vi_muon_ten?: string;
//   so_luong_trang_bi?: number;
// }

// ============================================================================
// SERVICE METHODS
// ============================================================================

export const phieuMuonTraService = {
  // 1. Lấy thống kê cho 3 ô Card trên đầu trang
  getThongKe: async (): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/thong-ke`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Lỗi khi lấy dữ liệu thống kê mượn/trả");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuMuonTraService.getThongKe error:", error);
      throw error;
    }
  },

  // 2. Lấy danh sách tất cả các phiếu mượn/trả
  getDanhSachPhieu: async (): Promise<any[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách phiếu mượn/trả");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuMuonTraService.getDanhSachPhieu error:", error);
      throw error;
    }
  },

  // 3. Lấy thông tin chi tiết 1 phiếu (Bao gồm danh sách thiết bị)
  getChiTietPhieu: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy thông tin phiếu");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuMuonTraService.getChiTietPhieu error:", error);
      throw error;
    }
  },

  // 4. Tạo phiếu mượn mới (Kèm danh sách thiết bị)
  createPhieu: async (
    data: Partial<any> & { danh_sach_thiet_bi_ids: number[] },
  ): Promise<any> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo phiếu mượn mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuMuonTraService.createPhieu error:", error);
      throw error;
    }
  },

  // 5. Xác nhận TRẢ thiết bị
  returnThietBi: async (
    id: number,
    data?: { ghi_chu_tinh_trang?: string; ngay_tra_thuc_te?: string },
  ): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}/tra`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data || {}), // Có thể gửi kèm ghi chú tình trạng lúc trả nếu backend hỗ trợ
      });
      if (!response.ok)
        throw new Error("Lỗi khi cập nhật trạng thái trả thiết bị");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuMuonTraService.returnThietBi error:", error);
      throw error;
    }
  },
};
