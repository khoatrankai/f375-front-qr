/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/kho.service.ts

import { getAuthHeaders } from "./auth.service";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
const ENDPOINT = `${API_BASE_URL}/kho`;

// Định nghĩa Interface dựa trên bảng 'kho' trong Database
// export interface Kho {
//   id?: number;
//   ma_kho: string;
//   ten_kho: string;
//   don_vi_id?: number | null;
//   vi_tri?: string;
//   created_at?: string;
//   updated_at?: string;

//   // Các trường ảo (Virtual fields) do backend JOIN trả về để phục vụ UI
//   ten_don_vi?: string; // Tên đơn vị quản lý lấy từ bảng don_vi
//   tongSP?: number; // Tổng số sản phẩm đang có trong kho (Backend đếm từ bảng ton_kho)
//   tongMuc?: number; // Sức chứa tối đa của kho (nếu có logic quy định riêng)
// }

export const khoService = {
  // Lấy danh sách tất cả các kho

  getThongKeTheKho: async (): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/thong-ke-the`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu thống kê thẻ kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getThongKeTheKho error:", error);
      throw error;
    }
  },

  // Lấy lịch sử giao dịch (Danh sách Phiếu Nhập/Xuất Kho)
  getLichSuPhieuKho: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/phieu-giao-dich`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok)
        throw new Error("Lỗi khi lấy danh sách phiếu giao dịch");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getLichSuPhieuKho error:", error);
      throw error;
    }
  },

  // --------------------------------------------------------
  // NHÓM 2: DỮ LIỆU TỒN KHO (MỚI)
  // --------------------------------------------------------

  // Lấy danh sách tồn kho tổng hợp
  getDanhSachTonKho: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/ton-kho`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi lấy danh sách tồn kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getDanhSachTonKho error:", error);
      throw error;
    }
  },

  // Lấy chi tiết tồn kho (Phân loại theo Cấp 1, 2, 3, 4)
  getTonKhoChiTiet: async (): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/ton-kho/chi-tiet`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi lấy chi tiết tồn kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getTonKhoChiTiet error:", error);
      throw error;
    }
  },

  // Lấy tồn kho theo một sản phẩm cụ thể
  getTonKhoTheoSanPham: async (spId: number): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/ton-kho/san-pham/${spId}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi lấy tồn kho của sản phẩm này");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getTonKhoTheoSanPham error:", error);
      throw error;
    }
  },

  getAll: async (): Promise<any[]> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getAll error:", error);
      throw error;
    }
  },
  getAllByDonVi: async (id: number): Promise<any[]> => {
    try {
      const response = await fetch(`${ENDPOINT}/dv/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi tải danh sách kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getAll error:", error);
      throw error;
    }
  },

  // Lấy thông tin 1 kho cụ thể theo ID
  getById: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Không tìm thấy thông tin kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getById error:", error);
      throw error;
    }
  },

  // Thêm mới kho
  create: async (data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(ENDPOINT, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo kho mới");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.create error:", error);
      throw error;
    }
  },

  // Cập nhật thông tin kho
  update: async (id: number, data: Partial<any>): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi cập nhật thông tin kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.update error:", error);
      throw error;
    }
  },

  // Xóa kho
  delete: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi xóa kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.delete error:", error);
      throw error;
    }
  },

  getChiTietPhieuKho: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/phieu-giao-dich/${id}`, {
        method: "GET",
        headers: getAuthHeaders(),
      });
      if (!response.ok) throw new Error("Lỗi khi lấy chi tiết phiếu kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.getChiTietPhieuKho error:", error);
      throw error;
    }
  },

  // ==========================================================
  // NHÓM 4: NHẬP/XUẤT KHO VÀ EXCEL (MỚI)
  // ==========================================================

  // Tạo phiếu nhập kho (Nhập tay thông thường hoặc dùng cho Upload Excel)
  createPhieuNhapKho: async (data: any): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/nhap-kho`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo phiếu nhập kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.createPhieuNhapKho error:", error);
      throw error;
    }
  },

  createPhieuXuatKho: async (data: any): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/xuat-kho`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Lỗi khi tạo phiếu xuất kho");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.createPhieuNhapKho error:", error);
      throw error;
    }
  },

  // (Tùy chọn) Hàm gọi API upload file Excel trực tiếp nếu Backend hỗ trợ Multer/FormData
  // Nếu BE dùng JSON, bạn sẽ cần parse Excel ở Frontend rồi gọi createPhieuNhapKho
  uploadExcelNhapKho: async (
    file: File,
    khoId: number,
    nguoiLapId: number,
  ): Promise<any> => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("kho_id", khoId.toString());
      formData.append("nguoi_lap_id", nguoiLapId.toString());

      const response = await fetch(`${ENDPOINT}/nhap-kho/excel`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData, // Không set Content-Type, trình duyệt sẽ tự set multipart/form-data
      });

      if (!response.ok) throw new Error("Lỗi khi import Excel");
      return (await response.json())?.data;
    } catch (error) {
      console.error("khoService.uploadExcelNhapKho error:", error);
      throw error;
    }
  },

  decryptPhieuKho: async (
    cryptoString: string,
    secretKey: string,
  ): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/phieu/giai-ma`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          crypto_string: cryptoString,
          secret_key: secretKey,
        }),
      });
      const res = await response.json();
      return res?.data;
    } catch (error) {
      console.error("khoService.decryptPhieuKho error:", error);
      throw error;
    }
  },

  // Mã hóa Phiếu Kho (Dựa theo ID của phiếu)
  encryptPhieuKho: async (id: number, secretKey: string): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/phieu/${id}/ma-hoa`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ secret_key: secretKey }),
      });
      if (!response.ok) throw new Error("Lỗi khi mã hóa phiếu kho");
      const res = await response.json();
      return res?.data;
    } catch (error) {
      console.error("khoService.encryptPhieuKho error:", error);
      throw error;
    }
  },

  importKhoByQR: async (payload: {
    crypto_string: string;
    secret_key: string;
    kho_nhan_id: number;
    nguoi_lap_id: number | null;
  }): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/nhap-kho/qr`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi nhập kho bằng mã QR");
      }
      return await response.json();
    } catch (error) {
      console.error("khoService.importKhoByQR error:", error);
      throw error;
    }
  },

  exportExcelKhoByID: async (id: number): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/xuat-excel/${id}`, {
        method: "POST", // Gọi POST theo đúng router BE của bạn
        headers: getAuthHeaders(),
      });

      if (!response.ok) throw new Error("Lỗi khi lấy dữ liệu xuất Excel");

      const res = await response.json();
      return res?.data || res; // Trả về block data chứa thong_tin_phieu và danh_sach_thiet_bi
    } catch (error) {
      console.error("khoService.exportExcelKhoByID error:", error);
      throw error;
    }
  },

  importKhoExcel: async (payload: any): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/nhap-kho-excel`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Lỗi khi nhập kho từ file Excel");
      }
      return await response.json();
    } catch (error) {
      console.error("khoService.importKhoExcel error:", error);
      throw error;
    }
  },
};
