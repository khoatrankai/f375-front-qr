/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/sanPham.service.ts

import { getAuthHeaders } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
// Tùy thuộc vào file app.js/server.js của bạn map router này với path nào.
// Thường sẽ là /api/san-pham hoặc /api/thong-tin-san-pham
const ENDPOINT = `${API_BASE_URL}/sp`;

// Định nghĩa Interface cho dữ liệu Thống kê Dashboard (4 ô Card)
export interface DashboardStats {
  tong_trang_bi: number;
  trong_kho: number;
  dang_muon: number;
  dang_bao_duong: number;
  // Có thể thêm các trường xu hướng (trend) nếu backend có tính toán:
  // trend_tong: string, trend_muon: string, ...
}

export const sanPhamService = {
  // 1. Lấy dữ liệu thống kê cho Dashboard (4 ô Card)
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const response = await fetch(`${ENDPOINT}/thong-ke`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Lỗi khi lấy dữ liệu thống kê sản phẩm");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getDashboardStats error:", error);
      throw error;
    }
  },

  // Lấy dữ liệu tồn kho gom nhóm theo sản phẩm và kho (Dùng cho tab View Grouped)
  getTonKhoChiTiet: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/ton-kho-chi-tiet`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu tồn kho chi tiết");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getTonKhoChiTiet error:", error);
      throw error;
    }
  },

  // Lấy thông tin phân bổ kho của 1 sản phẩm cụ thể
  getPhanBoKhoBySanPham: async (id: number): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}/phan-bo-kho`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi lấy phân bổ kho của sản phẩm");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getPhanBoKhoBySanPham error:", error);
      throw error;
    }
  },

  // --------------------------------------------------------
  // NHÓM 2: QUẢN LÝ CÁ THỂ TRANG BỊ (TRANG BỊ THỰC TẾ)
  // --------------------------------------------------------

  // Lấy danh sách tất cả từng cái/cá thể vật lý (Dùng cho tab View Flat)
  getDanhSachTrangBiTungCai: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Lỗi khi lấy danh sách từng cá thể trang bị");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getDanhSachTrangBiTungCai error:", error);
      throw error;
    }
  },

  // Tạo 1 cá thể trang bị vật lý mới (Có nhập Serial riêng)
  createTrangBiThucTe: async (data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo cá thể trang bị");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.createTrangBiThucTe error:", error);
      throw error;
    }
  },

  // Tạo hàng loạt cá thể trang bị (Batch - Hệ thống tự sinh mã QR/Serial)
  createNhieuTrangBiThucTe: async (data: any): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai/batch`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok)
        throw new Error("Lỗi khi tạo hàng loạt cá thể trang bị");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.createNhieuTrangBiThucTe error:", error);
      throw error;
    }
  },

  // --------------------------------------------------------
  // NHÓM 3: QUẢN LÝ SẢN PHẨM GỐC (THÔNG TIN SẢN PHẨM)
  // --------------------------------------------------------

  // Lấy danh sách tất cả sản phẩm gốc
  getAll: async (): Promise<any[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách sản phẩm");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getAll error:", error);
      throw error;
    }
  },

  // Lấy thông tin 1 sản phẩm gốc theo ID
  getById: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy thông tin sản phẩm");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getById error:", error);
      throw error;
    }
  },

  // Tạo dòng sản phẩm gốc mới
  create: async (data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo sản phẩm mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.create error:", error);
      throw error;
    }
  },

  // Cập nhật thông tin sản phẩm gốc
  update: async (id: number, data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật sản phẩm");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.update error:", error);
      throw error;
    }
  },

  // Xóa sản phẩm gốc
  delete: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa sản phẩm");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.delete error:", error);
      throw error;
    }
  },

  updateTrangBiThucTe: async (id: number, data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật cá thể trang bị");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.updateTrangBiThucTe error:", error);
      throw error;
    }
  },

  // Xóa 1 cá thể trang bị khỏi hệ thống
  deleteTrangBiThucTe: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa cá thể trang bị");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.deleteTrangBiThucTe error:", error);
      throw error;
    }
  },
  getTrangBiThucTeTheoKho: async (khoId: number): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/kho/${khoId}/trang-bi`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Lỗi khi lấy danh sách trang bị trong kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getTrangBiThucTeTheoKho error:", error);
      throw error;
    }
  },
  getTrangBiByQR: async (id: string): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai/qr/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy thông tin sản phẩm");
      return (await response.json())?.data;
    } catch (error) {
      console.error("sanPhamService.getById error:", error);
      throw error;
    }
  },

  getChiTietVaLichSuByQR: async (maQR: string): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai/qr/${maQR}/full`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Không tìm thấy thông tin hoặc lịch sử sản phẩm");
      const res = await response.json();
      return res?.data;
    } catch (error) {
      console.error("sanPhamService.getChiTietVaLichSuByQR error:", error);
      throw error;
    }
  },

  decryptChiTietQR: async (
    cryptoString: string,
    secretKey: string,
  ): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai/qr/giai-ma`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          crypto_string: cryptoString,
          secret_key: secretKey,
        }),
      });
      if (!response.ok) throw new Error("Lỗi khi giải mã QR");
      const res = await response.json();
      return res?.data;
    } catch (error) {
      console.error("sanPhamService.decryptChiTietQR error:", error);
      throw error;
    }
  },

  // Mã hóa chi tiết QR Code
  encryptChiTietQR: async (maQR: string, secretKey: string): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/tung-cai/qr/${maQR}/ma-hoa`, {
        method: "POST",
        headers: getAuthHeaders(),
        // Truyền secret_key vào body theo đúng yêu cầu của BE
        body: JSON.stringify({ secret_key: secretKey }),
      });
      if (!response.ok) throw new Error("Lỗi khi mã hóa QR");
      const res = await response.json();
      return res?.data; // BE trả về: { crypto_string: "..." }
    } catch (error) {
      console.error("sanPhamService.encryptChiTietQR error:", error);
      throw error;
    }
  },
};
