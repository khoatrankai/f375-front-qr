/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/phieuBanGiao.service.ts

import { getAuthHeaders } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
// Điều chỉnh endpoint tương ứng với router trong backend của bạn (VD: /api/phieu-ban-giao)
const ENDPOINT = `${API_BASE_URL}/pbg`;

// ============================================================================
// INTERFACES
// ============================================================================

// Interface chi tiết từng thiết bị trong phiếu
export interface PhieuBanGiaoChiTiet {
  id?: number;
  phieu_id?: number;
  trang_bi_thuc_te_id: number;
  ghi_chu_tinh_trang?: string;

  // Virtual fields do backend JOIN trả về (để hiển thị UI)
  ma_qr?: string;
  so_serial?: string;
  ten_san_pham?: string;
}

// Interface thông tin Phiếu Bàn Giao
export interface PhieuBanGiao {
  id?: number;
  ma_phieu: string;
  loai_phieu: "BAN_GIAO" | "CHUYEN_KHO";
  tu_don_vi_id?: number | null;
  den_don_vi_id?: number | null;
  tu_kho_id?: number | null;
  den_kho_id?: number | null;
  nguoi_giao_id?: number | null;
  nguoi_nhan_id?: number | null;
  ngay_thuc_hien: string;
  ghi_chu?: string;
  trang_thai: "CHO_DUYET" | "DANG_XU_LY" | "HOAN_THANH" | "TU_CHOI";
  created_at?: string;
  updated_at?: string;

  // Thuộc tính mảng chứa các thiết bị luân chuyển
  chi_tiet?: PhieuBanGiaoChiTiet[];

  // Virtual fields do backend JOIN trả về
  tu_don_vi_ten?: string;
  den_don_vi_ten?: string;
  tu_kho_ten?: string;
  den_kho_ten?: string;
  nguoi_giao_ten?: string;
  nguoi_nhan_ten?: string;
  so_luong_trang_bi?: number; // Đếm số lượng từ bảng chi tiết
}

// ============================================================================
// SERVICE METHODS
// ============================================================================

export const phieuBanGiaoService = {
  // Lấy danh sách tất cả các phiếu (phục vụ màn hình Table)
  getDanhSachPhieu: async (): Promise<PhieuBanGiao[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách phiếu bàn giao");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBanGiaoService.getDanhSachPhieu error:", error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết 1 phiếu (Bao gồm cả danh sách thiết bị bên trong)
  getChiTietPhieu: async (id: number): Promise<PhieuBanGiao> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy thông tin phiếu");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBanGiaoService.getChiTietPhieu error:", error);
      throw error;
    }
  },

  // Tạo phiếu bàn giao/chuyển kho mới (Bao gồm dữ liệu phiếu và mảng chi tiết thiết bị)
  createPhieu: async (data: Partial<PhieuBanGiao>): Promise<PhieuBanGiao> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo phiếu luân chuyển mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBanGiaoService.createPhieu error:", error);
      throw error;
    }
  },

  // Cập nhật thông tin phiếu (Thường dùng để cập nhật TRẠNG THÁI: Phê duyệt, Từ chối, Hoàn thành)
  updatePhieu: async (
    id: number,
    data: Partial<PhieuBanGiao>,
  ): Promise<PhieuBanGiao> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật phiếu");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBanGiaoService.updatePhieu error:", error);
      throw error;
    }
  },

  // Xóa phiếu (Thường chỉ cho phép xóa khi đang ở trạng thái CHO_DUYET hoặc TU_CHOI)
  deletePhieu: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa phiếu");
      return (await response.json())?.data;
    } catch (error) {
      console.error("phieuBanGiaoService.deletePhieu error:", error);
      throw error;
    }
  },
};
