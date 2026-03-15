/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef } from "react";
import { Icon } from "@/src/components/ui/Icon";
import {
  Modal,
  FormGroup,
  Input,
  Select,
  StatusBadge,
  QRPreviewButton,
  QRPhieuPreviewButton,
  QRScannerModal, // IMPORT COMPONENT QUÉT CAMERA
} from "@/src/components/ui/Shared";
import { khoService } from "@/src/services/kho.service";
import { donViService } from "@/src/services/donVi.service";
import { userService } from "@/src/services/user.service";
import { sanPhamService } from "@/src/services/sanPham.service";
import {
  exportPhieuToExcel,
  importPhieuFromExcel,
} from "@/src/lib/exportExcel";
// import * as XLSX from "xlsx";

export default function WarehousePage() {
  // ================= DATA STATE =================
  const [khos, setKhos] = useState<any[]>([]);
  const [donViTree, setDonViTree] = useState<any[]>([]);
  const [tonKhos, setTonKhos] = useState<any[]>([]);
  const [phieuKhos, setPhieuKhos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [sanPhams, setSanPhams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // ================= UI STATE =================
  const [tab, setTab] = useState("tonkho");
  const [selectedKho, setSelectedKho] = useState<number | null>(null);
  const [selectedSP, setSelectedSP] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  // ================= MODALS STATE =================
  const [isKhoModalOpen, setKhoModalOpen] = useState(false);
  const [editingKhoId, setEditingKhoId] = useState<number | null>(null);
  const [khoForm, setKhoForm] = useState({
    ma_kho: "",
    ten_kho: "",
    don_vi_id: "",
    vi_tri: "",
    suc_chua: "",
  });

  const [selectedPhieuDetail, setSelectedPhieuDetail] = useState<any>(null);
  const [isDetailModalOpen, setDetailModalOpen] = useState(false);

  // --- STATE CAMERA DÙNG CHUNG ---
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scannerTarget, setScannerTarget] = useState<
    "nhap_tay" | "nhap_phieu_qr" | "xuat_kho" | null
  >(null);

  // --- STATE MODAL NHẬP KHO ---
  const [isPhieuModalOpen, setPhieuModalOpen] = useState(false);
  // BỔ SUNG MODE "qr_phieu"
  const [importMode, setImportMode] = useState<"excel" | "manual" | "qr_phieu">(
    "manual",
  );
  const [phieuForm, setPhieuForm] = useState({
    ma_phieu: "",
    kho_id: "",
    nguoi_lap_id: "",
    ghi_chu: "",
    ngay_nhap: new Date().toISOString().split("T")[0],
  });

  // Dữ liệu cho nhập Excel
  const [excelData, setExcelData] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dữ liệu cho nhập Thủ công
  const [manualItems, setManualItems] = useState<any[]>([]);
  const [currentManualItem, setCurrentManualItem] = useState({
    thong_tin_sp_id: "",
    so_serial: "",
    ma_qr: `QR-${Date.now().toString().slice(-6)}`,
    cap_chat_luong: "1",
  });

  // BỔ SUNG: Dữ liệu cho nhập qua QR Phiếu (Liên kho)
  const [phieuQrInput, setPhieuQrInput] = useState("");
  const [phieuQrSecret, setPhieuQrSecret] = useState("");

  // --- STATE MODAL XUẤT KHO ---
  const [isPhieuXuatModalOpen, setPhieuXuatModalOpen] = useState(false);
  const [phieuXuatForm, setPhieuXuatForm] = useState({
    ma_phieu: "",
    kho_id: "",
    nguoi_lap_id: "",
    ghi_chu: "",
    ngay_xuat: new Date().toISOString().split("T")[0],
  });
  const [availableXuatEquipments, setAvailableXuatEquipments] = useState<any[]>(
    [],
  );
  const [selectedXuatEquipments, setSelectedXuatEquipments] = useState<any[]>(
    [],
  );
  const [tbXuatSearch, setTbXuatSearch] = useState("");

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [khoData, treeData, tonKhoData, phieuData, userData, spData] =
        await Promise.all([
          khoService.getAll(),
          donViService.getTree(),
          khoService.getTonKhoChiTiet(),
          khoService.getLichSuPhieuKho(),
          userService.getAll(),
          sanPhamService.getAll(),
        ]);
      setKhos(khoData || []);
      setDonViTree(treeData || []);
      setTonKhos(tonKhoData || []);
      setPhieuKhos(phieuData || []);
      setUsers(userData || []);
      setSanPhams(spData || []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== LỌC DỮ LIỆU BẢNG ====================
  const selectedKhoData = khos.find((k) => k.id === selectedKho);

  const spGroups = tonKhos.reduce((acc: any, row) => {
    const spId = row.thong_tin_sp_id;
    if (!acc[spId])
      acc[spId] = {
        spId: spId,
        tenSP: row.ten_san_pham || "Chưa xác định",
        loai: row.loai_trang_bi || "Trang bị",
        khos: [],
      };
    acc[spId].khos.push(row);
    return acc;
  }, {});

  const spList = Object.values(spGroups)
    .map((sp: any) => {
      const _khos = selectedKho
        ? sp.khos.filter((k: any) => k.kho_id === selectedKho)
        : sp.khos;
      return { ...sp, khos: _khos };
    })
    .filter(
      (sp: any) =>
        sp.khos.length > 0 &&
        sp.tenSP.toLowerCase().includes(search.toLowerCase()),
    ) as any[];

  const filteredTonKho = selectedKho
    ? tonKhos.filter((r) => r.kho_id === selectedKho)
    : tonKhos;
  const searchedTonKho = filteredTonKho.filter((r) =>
    (r.ten_san_pham || "").toLowerCase().includes(search.toLowerCase()),
  );
  const filteredDanhSachKho = selectedKho
    ? khos.filter((k) => k.id === selectedKho)
    : khos;
  const filteredPhieu = selectedKho
    ? phieuKhos.filter(
        (p) =>
          p.kho_id === selectedKho ||
          (selectedKhoData && p.ten_kho === selectedKhoData.ten_kho),
      )
    : phieuKhos;

  const CAP_COLORS = ["#00D4AA", "#3B82F6", "#F59E0B", "#EF4444"];

  // ==================== CRUD KHO ====================
  const handleOpenAddKho = () => {
    setEditingKhoId(null);
    setKhoForm({
      ma_kho: "",
      ten_kho: "",
      don_vi_id: "",
      vi_tri: "",
      suc_chua: "",
    });
    setKhoModalOpen(true);
  };
  const handleOpenEditKho = (kho: any) => {
    setEditingKhoId(kho.id!);
    setKhoForm({
      ma_kho: kho.ma_kho,
      ten_kho: kho.ten_kho,
      don_vi_id: kho.don_vi_id ? kho.don_vi_id.toString() : "",
      vi_tri: kho.vi_tri || "",
      suc_chua: kho.suc_chua ? kho.suc_chua.toString() : "0",
    });
    setKhoModalOpen(true);
  };
  const handleDeleteKho = async (id: number) => {
    if (confirm("Xóa kho này? Dữ liệu tồn kho liên quan có thể bị mất.")) {
      try {
        await khoService.delete(id);
        if (selectedKho === id) setSelectedKho(null);
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa kho!");
      }
    }
  };
  const handleSaveKho = async () => {
    if (!khoForm.ma_kho || !khoForm.ten_kho) {
      alert("Vui lòng nhập mã và tên kho!");
      return;
    }
    try {
      const payload: Partial<any> = {
        ma_kho: khoForm.ma_kho,
        ten_kho: khoForm.ten_kho,
        don_vi_id: khoForm.don_vi_id ? parseInt(khoForm.don_vi_id) : null,
        vi_tri: khoForm.vi_tri,
        suc_chua: parseFloat(khoForm.suc_chua) || 0,
      };
      if (editingKhoId) await khoService.update(editingKhoId, payload);
      else await khoService.create(payload);
      setKhoModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Lỗi khi lưu thông tin kho!");
    }
  };

  // ==================== TẠO PHIẾU NHẬP KHO ====================
  const handleOpenPhieuNhap = () => {
    setPhieuForm({
      ma_phieu: `NK-${Date.now()}`,
      kho_id: "",
      nguoi_lap_id: "",
      ghi_chu: "",
      ngay_nhap: new Date().toISOString().split("T")[0],
    });
    setExcelData([]);
    setManualItems([]);
    setPhieuQrInput("");
    setPhieuQrSecret("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setPhieuModalOpen(true);
  };

  // Xử lý khi chọn file Excel
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      // Dùng hàm importPhieuFromExcel đã viết để đọc file
      const parsedData = await importPhieuFromExcel(file);

      // Chúng ta CHỈ LẤY danh_sach_thiet_bi, bỏ qua thong_tin_phieu
      const thietBiList = parsedData.data.danh_sach_thiet_bi || [];

      if (thietBiList.length === 0) {
        alert("File Excel không có thiết bị nào hoặc sai định dạng!");
        return;
      }

      // Lưu vào state excelData
      setExcelData(thietBiList);
    } catch (error: any) {
      alert("Lỗi khi đọc file Excel: " + error.message);
    } finally {
      // Reset input để có thể chọn lại cùng 1 file
      // if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    // Có thể bỏ qua hoặc giữ lại nếu bạn vẫn muốn có nút tải form mẫu
  };

  const generateRandomQR = () => {
    setCurrentManualItem((prev) => ({
      ...prev,
      ma_qr: `QR-${Date.now().toString().slice(-6)}`,
    }));
  };

  const addManualItem = () => {
    if (!currentManualItem.thong_tin_sp_id || !currentManualItem.ma_qr) {
      alert("Vui lòng chọn Sản phẩm gốc và nhập mã QR!");
      return;
    }
    const sp = sanPhams.find(
      (s) => s.id.toString() === currentManualItem.thong_tin_sp_id,
    );

    setManualItems([
      ...manualItems,
      {
        ...currentManualItem,
        ten_san_pham: sp?.ten_san_pham,
        ma_san_pham: sp?.ma_san_pham,
      },
    ]);

    setCurrentManualItem({
      thong_tin_sp_id: currentManualItem.thong_tin_sp_id,
      so_serial: "",
      ma_qr: `QR-${Date.now().toString().slice(-6)}`,
      cap_chat_luong: "1",
    });
  };

  // Xử lý Lưu Phiếu Nhập
  const handleSavePhieuNhap = async () => {
    if (!phieuForm.kho_id) {
      alert("Vui lòng chọn Kho nhập tới!");
      return;
    }

    // =========================================================
    // NHÁNH 1: NHẬP QUA MÃ QR PHIẾU XUẤT (LIÊN KHO)
    // =========================================================
    if (importMode === "qr_phieu") {
      if (!phieuQrInput.trim() || !phieuQrSecret.trim()) {
        alert("Vui lòng quét mã QR phiếu và nhập khóa bảo mật!");
        return;
      }
      try {
        const result = await khoService.importKhoByQR({
          crypto_string: phieuQrInput,
          secret_key: phieuQrSecret,
          kho_nhan_id: parseInt(phieuForm.kho_id),
          nguoi_lap_id: phieuForm.nguoi_lap_id
            ? parseInt(phieuForm.nguoi_lap_id)
            : null,
        });
        alert(
          `Thành công! Đã nhập kho tự động cho ${result.data?.so_luong_nhap || 0} thiết bị.`,
        );
        setPhieuModalOpen(false);
        fetchData();
      } catch (error: any) {
        alert(error.message || "Lỗi khi nhập kho tự động bằng QR!");
      }
      return; // Kết thúc nhánh
    }

    // =========================================================
    // NHÁNH 2: NHẬP TỪ FILE EXCEL (Sử dụng API mới)
    // =========================================================
    if (importMode === "excel") {
      if (excelData.length === 0) {
        alert("Vui lòng tải lên file Excel chứa thiết bị hợp lệ!");
        return;
      }

      // Ánh xạ lại mảng excelData theo định dạng Backend cần
      const danh_sach_trang_bi = excelData.map((row: any) => ({
        ma_san_pham: row.ma_san_pham || "Chưa xác định",
        ten_san_pham: row.ten_san_pham,
        so_serial: row.so_serial,
        ma_qr: row.ma_qr,
        ten_danh_muc: row.ten_danh_muc,
        cap_chat_luong: parseInt(row.cap_chat_luong) || 1,
        don_vi_tinh: row.don_vi_tinh || "Cái",
      }));

      try {
        const payload = {
          phieu_data: {
            ma_phieu: phieuForm.ma_phieu,
            loai_phieu: "NHAP_KHO",
            kho_id: parseInt(phieuForm.kho_id),
            nguoi_lap_id: phieuForm.nguoi_lap_id
              ? parseInt(phieuForm.nguoi_lap_id)
              : null,
            ghi_chu: phieuForm.ghi_chu,
            ngay_thuc_hien: phieuForm.ngay_nhap,
          },
          danh_sach_trang_bi: danh_sach_trang_bi,
        };

        // GỌI SERVICE NHẬP EXCEL MỚI
        await khoService.importKhoExcel(payload);

        alert("Nhập kho từ Excel thành công!");
        setPhieuModalOpen(false);
        fetchData();
      } catch (error: any) {
        alert(error.message || "Có lỗi xảy ra khi gọi API nhập kho Excel!");
      }
      return; // Kết thúc nhánh
    }

    // =========================================================
    // NHÁNH 3: NHẬP THỦ CÔNG (Sử dụng API cũ createPhieuNhapKho)
    // =========================================================
    if (manualItems.length === 0) {
      alert("Vui lòng thêm ít nhất 1 thiết bị vào danh sách!");
      return;
    }

    const danh_sach_trang_bi_thu_cong = manualItems.map((item) => ({
      thong_tin_sp_id: parseInt(item.thong_tin_sp_id),
      ma_san_pham: item.ma_san_pham,
      so_serial: item.so_serial,
      ma_qr: item.ma_qr,
      cap_chat_luong: parseInt(item.cap_chat_luong),
    }));

    try {
      const payloadThuCong = {
        phieu_data: {
          ma_phieu: phieuForm.ma_phieu,
          loai_phieu: "NHAP_KHO",
          kho_id: parseInt(phieuForm.kho_id),
          nguoi_lap_id: phieuForm.nguoi_lap_id
            ? parseInt(phieuForm.nguoi_lap_id)
            : null,
          ghi_chu: phieuForm.ghi_chu,
          ngay_thuc_hien: phieuForm.ngay_nhap,
        },
        danh_sach_trang_bi: danh_sach_trang_bi_thu_cong,
      };

      await khoService.createPhieuNhapKho(payloadThuCong);
      alert("Nhập kho thủ công thành công!");
      setPhieuModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo phiếu nhập thủ công!");
    }
  };

  // ================= TẠO PHIẾU XUẤT KHO =================
  const handleOpenPhieuXuat = () => {
    setPhieuXuatForm({
      ma_phieu: `XK-${Date.now()}`,
      kho_id: "",
      nguoi_lap_id: "",
      ghi_chu: "",
      ngay_xuat: new Date().toISOString().split("T")[0],
    });
    setAvailableXuatEquipments([]);
    setSelectedXuatEquipments([]);
    setTbXuatSearch("");
    setPhieuXuatModalOpen(true);
  };

  const handleXuatKhoChange = async (val: string) => {
    setPhieuXuatForm((p) => ({ ...p, kho_id: val }));
    setSelectedXuatEquipments([]);

    if (val) {
      try {
        const eq = await sanPhamService.getTrangBiThucTeTheoKho(Number(val));
        setAvailableXuatEquipments(
          eq.filter((e: any) => e.trang_thai === "TRONG_KHO"),
        );
      } catch (err) {
        console.error("Lỗi lấy danh sách thiết bị", err);
      }
    } else {
      setAvailableXuatEquipments([]);
    }
  };

  const visibleXuatEquipments = availableXuatEquipments.filter((tb) => {
    if (selectedXuatEquipments.find((s) => s.id === tb.id)) return false;
    if (tbXuatSearch) {
      const term = tbXuatSearch.toLowerCase();
      return (
        tb.ma_qr?.toLowerCase().includes(term) ||
        tb.so_serial?.toLowerCase().includes(term) ||
        tb.ten_san_pham?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  const handleSavePhieuXuat = async () => {
    if (!phieuXuatForm.kho_id) {
      alert("Vui lòng chọn Kho xuất!");
      return;
    }
    if (selectedXuatEquipments.length === 0) {
      alert("Vui lòng chọn ít nhất 1 thiết bị để xuất!");
      return;
    }

    try {
      const payload = {
        phieu_data: {
          ma_phieu: phieuXuatForm.ma_phieu,
          loai_phieu: "XUAT_KHO",
          kho_id: parseInt(phieuXuatForm.kho_id),
          nguoi_lap_id: phieuXuatForm.nguoi_lap_id
            ? parseInt(phieuXuatForm.nguoi_lap_id)
            : null,
          ghi_chu: phieuXuatForm.ghi_chu,
          ngay_thuc_hien: phieuXuatForm.ngay_xuat,
        },
        danh_sach_trang_bi: selectedXuatEquipments.map((tb) => tb.id),
      };

      await khoService.createPhieuXuatKho(payload);
      alert("Xuất kho thành công!");
      setPhieuXuatModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Có lỗi xảy ra khi tạo phiếu xuất!");
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const data = await khoService.getChiTietPhieuKho(id);
      setSelectedPhieuDetail(data);
      setDetailModalOpen(true);
    } catch (error) {
      alert("Không thể tải chi tiết phiếu!");
    }
  };

  const exportToExcel = () => {};

  const renderTreeOptions = (nodes: any[], depth = 0): any[] => {
    return nodes.flatMap((node) => {
      const prefix = depth > 0 ? "\u00A0\u00A0".repeat(depth * 2) + "|— " : "";
      const option = (
        <option key={node.id} value={node.id}>
          {prefix}
          {node.ten_don_vi}
        </option>
      );
      const childrenOptions = node.children
        ? renderTreeOptions(node.children, depth + 1)
        : [];
      return [option, ...childrenOptions];
    });
  };

  if (isLoading) {
    return (
      <div style={{ color: "#E2E8F0", padding: 20 }}>Đang tải dữ liệu...</div>
    );
  }

  // Hàm xử lý khi bấm nút Xuất Excel cho 1 Phiếu
  const handleDownloadExcelPhieu = async (phieuId: number) => {
    try {
      // 1. Gọi API lấy dữ liệu JSON chuẩn từ Backend
      const dataToExport = await khoService.exportExcelKhoByID(phieuId);

      // 2. Đưa dữ liệu JSON đó vào hàm vẽ Excel để tải về máy
      await exportPhieuToExcel(dataToExport);
    } catch (error) {
      alert("Có lỗi xảy ra khi xuất file Excel!");
      console.error(error);
    }
  };

  return (
    <div>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <h2
          style={{
            fontSize: 22,
            fontWeight: 700,
            color: "#E2E8F0",
            fontFamily: "'Courier New', monospace",
            letterSpacing: 2,
          }}
        >
          QUẢN LÝ KHO
        </h2>

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={handleOpenAddKho}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
              color: "#fff",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            <Icon name="plus" size={14} /> THÊM KHO
          </button>

          <button
            onClick={handleOpenPhieuXuat}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 8,
              border: "1px solid rgba(245,158,11,0.4)",
              background: "rgba(245,158,11,0.1)",
              color: "#F59E0B",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            <Icon name="arrowdown" size={14} /> PHIẾU XUẤT
          </button>

          <button
            onClick={handleOpenPhieuNhap}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              padding: "10px 18px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
              color: "#0F172A",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            <Icon name="arrowup" size={14} /> NHẬP KHO
          </button>
        </div>
      </div>

      {/* KHỐI CARD THỐNG KÊ KHO */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {khos.map((kho) => {
          const isSelected = selectedKho === kho.id;
          const dang_chua = kho.dang_chua || kho.tong_so_luong || 0;
          const sucChua = kho.suc_chua || 100;
          const pct = sucChua > 0 ? Math.round((dang_chua / sucChua) * 100) : 0;

          return (
            <div
              key={kho.id}
              onClick={() => setSelectedKho(isSelected ? null : kho.id!)}
              style={{
                background: "rgba(15,23,42,0.8)",
                border: `1px solid ${isSelected ? "#00D4AA" : "rgba(100,116,139,0.2)"}`,
                borderRadius: 12,
                padding: 18,
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={(e) => {
                if (!isSelected)
                  e.currentTarget.style.borderColor = "rgba(0,212,170,0.4)";
              }}
              onMouseLeave={(e) => {
                if (!isSelected)
                  e.currentTarget.style.borderColor = "rgba(100,116,139,0.2)";
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: "linear-gradient(to right, #00D4AA, #0EA5E9)",
                  }}
                />
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: 10,
                }}
              >
                <div style={{ color: isSelected ? "#00D4AA" : "#64748B" }}>
                  <Icon name="warehouse" size={22} />
                </div>
                {isSelected && (
                  <span
                    style={{
                      fontSize: 10,
                      color: "#00D4AA",
                      border: "1px solid #00D4AA44",
                      padding: "2px 7px",
                      borderRadius: 10,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    ĐANG LỌC
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#E2E8F0",
                  marginBottom: 3,
                  fontFamily: "'Courier New', monospace",
                }}
              >
                {kho.ma_kho}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "#64748B",
                  marginBottom: 10,
                  lineHeight: 1.4,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {kho.ten_kho}
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 6,
                }}
              >
                <span style={{ fontSize: 11, color: "#64748B" }}>Tồn kho</span>
                <span
                  style={{ fontSize: 11, fontWeight: 700, color: "#E2E8F0" }}
                >
                  {dang_chua}{" "}
                  <span style={{ color: "#475569", fontWeight: 400 }}>
                    /{sucChua}
                  </span>
                </span>
              </div>
              <div
                style={{
                  height: 4,
                  background: "rgba(30,41,59,0.8)",
                  borderRadius: 2,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${pct > 100 ? 100 : pct}%`,
                    background:
                      pct > 80 ? "#EF4444" : pct > 60 ? "#F59E0B" : "#00D4AA",
                    borderRadius: 2,
                    transition: "width 0.5s",
                  }}
                />
              </div>
              <div
                style={{
                  marginTop: 4,
                  fontSize: 10,
                  color: "#475569",
                  textAlign: "right",
                }}
              >
                {pct}% công suất
              </div>
            </div>
          );
        })}
      </div>

      {/* TABS NAVIGATION */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 20,
          background: "rgba(15,23,42,0.8)",
          border: "1px solid rgba(100,116,139,0.15)",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {[
          { id: "tonkho", label: "Tồn kho theo kho" },
          { id: "sanpham", label: "Tồn kho theo sản phẩm" },
          { id: "danhsachkho", label: "Danh sách kho" },
          { id: "phieu", label: "Phiếu nhập / xuất" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 20px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.15s",
              letterSpacing: 0.5,
              background: tab === t.id ? "rgba(0,212,170,0.15)" : "transparent",
              color: tab === t.id ? "#00D4AA" : "#64748B",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* SEARCH BAR */}
      {(tab === "tonkho" || tab === "sanpham") && (
        <div style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}>
          <span
            style={{
              position: "absolute",
              left: 12,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748B",
            }}
          >
            <Icon name="search" size={15} />
          </span>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm tên sản phẩm..."
            style={{
              width: "100%",
              paddingLeft: 36,
              paddingRight: 14,
              paddingTop: 9,
              paddingBottom: 9,
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(100,116,139,0.25)",
              borderRadius: 8,
              color: "#E2E8F0",
              fontSize: 13,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      )}

      {/* NỘI DUNG TABS */}

      {/* TAB 1: DANH SÁCH KHO */}
      {tab === "danhsachkho" && (
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.15)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(30,41,59,0.8)",
                  borderBottom: "1px solid rgba(0,212,170,0.15)",
                }}
              >
                {[
                  "Mã Kho",
                  "Tên Kho",
                  "Đơn Vị Quản Lý",
                  "Vị Trí",
                  "Đang chứa",
                  "Sức chứa",
                  "% Công suất",
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#A78BFA",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredDanhSachKho.map((kho) => {
                const dang_chua = kho.dang_chua || kho.tong_so_luong || 0;
                const sucChua = kho.suc_chua || 100;
                const pct =
                  sucChua > 0 ? Math.round((dang_chua / sucChua) * 100) : 0;
                return (
                  <tr
                    key={kho.id}
                    style={{ borderBottom: "1px solid rgba(100,116,139,0.08)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(30,41,59,0.4)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#A78BFA",
                        fontWeight: 700,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {kho.ma_kho}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "#E2E8F0",
                        fontWeight: 500,
                      }}
                    >
                      {kho.ten_kho}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {kho.don_vi_quan_ly || "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      {kho.vi_tri || "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#00D4AA",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {dang_chua}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "#E2E8F0",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {sucChua}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 60,
                            height: 6,
                            background: "rgba(30,41,59,0.8)",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              width: `${pct > 100 ? 100 : pct}%`,
                              background:
                                pct > 80
                                  ? "#EF4444"
                                  : pct > 60
                                    ? "#F59E0B"
                                    : "#00D4AA",
                              borderRadius: 3,
                              transition: "width 0.5s",
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontSize: 11,
                            color: pct > 80 ? "#EF4444" : "#64748B",
                            fontWeight: pct > 80 ? 700 : 400,
                          }}
                        >
                          {pct}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button
                          onClick={() => handleOpenEditKho(kho)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: `1px solid #F59E0B33`,
                            background: `#F59E0B11`,
                            color: "#F59E0B",
                            cursor: "pointer",
                          }}
                        >
                          <Icon name="edit" size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteKho(kho.id!)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: `1px solid #EF444433`,
                            background: `#EF444411`,
                            color: "#EF4444",
                            cursor: "pointer",
                          }}
                        >
                          <Icon name="trash" size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: TỒN KHO THEO KHO */}
      {tab === "tonkho" && (
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.15)",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(30,41,59,0.8)",
                  borderBottom: "1px solid rgba(0,212,170,0.15)",
                }}
              >
                {[
                  "Sản phẩm",
                  "Loại",
                  "Kho",
                  "Cấp 1",
                  "Cấp 2",
                  "Cấp 3",
                  "Cấp 4",
                  "Tổng",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#00D4AA",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {searchedTonKho.map((row, i) => {
                const cap1 = row.so_luong_cap1 || 0;
                const cap2 = row.so_luong_cap2 || 0;
                const cap3 = row.so_luong_cap3 || 0;
                const cap4 = row.so_luong_cap4 || 0;
                const tong = cap1 + cap2 + cap3 + cap4;

                return (
                  <tr
                    key={i}
                    style={{ borderBottom: "1px solid rgba(100,116,139,0.08)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(30,41,59,0.4)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 13,
                        color: "#E2E8F0",
                        fontWeight: 500,
                        maxWidth: 200,
                      }}
                    >
                      {row.ten_san_pham || "Chưa xác định"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      {row.loai_trang_bi || "Trang bị"}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "rgba(0,212,170,0.1)",
                          color: "#00D4AA",
                          border: "1px solid rgba(0,212,170,0.25)",
                          fontFamily: "'Courier New', monospace",
                        }}
                      >
                        {row.ten_kho}
                      </span>
                    </td>
                    {[cap1, cap2, cap3, cap4].map((v, ci) => (
                      <td key={ci} style={{ padding: "13px 16px" }}>
                        <span
                          style={{
                            fontSize: 14,
                            fontWeight: 700,
                            color: v > 0 ? CAP_COLORS[ci] : "#374151",
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          {v}
                        </span>
                      </td>
                    ))}
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#E2E8F0",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {tong}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: TỒN KHO THEO SẢN PHẨM */}
      {tab === "sanpham" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {spList.map((sp) => {
            const isOpen = selectedSP === sp.spId;
            const tongAll = sp.khos.reduce(
              (s: number, k: any) =>
                s +
                (k.so_luong_cap1 || 0) +
                (k.so_luong_cap2 || 0) +
                (k.so_luong_cap3 || 0) +
                (k.so_luong_cap4 || 0),
              0,
            );
            return (
              <div
                key={sp.spId}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${isOpen ? "rgba(0,212,170,0.35)" : "rgba(100,116,139,0.15)"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  onClick={() => setSelectedSP(isOpen ? null : sp.spId)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    cursor: "pointer",
                    background: isOpen ? "rgba(0,212,170,0.05)" : "transparent",
                  }}
                >
                  <div
                    style={{
                      color: isOpen ? "#00D4AA" : "#475569",
                      transition: "color 0.2s",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  >
                    <Icon name="chevron" size={16} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#E2E8F0",
                      }}
                    >
                      {sp.tenSP}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}
                    >
                      {sp.loai} · Phân bố tại{" "}
                      <span style={{ color: "#00D4AA", fontWeight: 700 }}>
                        {sp.khos.length} kho
                      </span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {sp.khos.map((k: any, idx: number) => (
                      <span
                        key={idx}
                        style={{
                          padding: "3px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "rgba(14,165,233,0.1)",
                          color: "#0EA5E9",
                          border: "1px solid rgba(14,165,233,0.25)",
                          fontFamily: "'Courier New', monospace",
                        }}
                      >
                        {k.ten_kho}
                      </span>
                    ))}
                  </div>
                  <div style={{ textAlign: "right", minWidth: 60 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: "#00D4AA",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {tongAll}
                    </div>
                    <div style={{ fontSize: 10, color: "#475569" }}>
                      Tổng tồn
                    </div>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop: "1px solid rgba(0,212,170,0.15)" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ background: "rgba(0,212,170,0.04)" }}>
                          {[
                            "Kho",
                            "Cấp 1",
                            "Cấp 2",
                            "Cấp 3",
                            "Cấp 4",
                            "Tổng",
                            "Phân bổ",
                          ].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px 16px",
                                textAlign: "left",
                                fontSize: 10,
                                fontWeight: 700,
                                color: "#475569",
                                letterSpacing: 1,
                                textTransform: "uppercase",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {sp.khos.map((k: any, ki: number) => {
                          const cap1 = k.so_luong_cap1 || 0;
                          const cap2 = k.so_luong_cap2 || 0;
                          const cap3 = k.so_luong_cap3 || 0;
                          const cap4 = k.so_luong_cap4 || 0;
                          const rowTotal = cap1 + cap2 + cap3 + cap4;
                          const pct =
                            tongAll > 0
                              ? Math.round((rowTotal / tongAll) * 100)
                              : 0;

                          return (
                            <tr
                              key={ki}
                              style={{
                                borderTop: "1px solid rgba(100,116,139,0.08)",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.background =
                                  "rgba(30,41,59,0.5)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.background =
                                  "transparent")
                              }
                            >
                              <td style={{ padding: "12px 16px" }}>
                                <div
                                  style={{
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color: "#0EA5E9",
                                    fontFamily: "'Courier New', monospace",
                                  }}
                                >
                                  {k.ten_kho}
                                </div>
                              </td>
                              {[cap1, cap2, cap3, cap4].map((v, ci) => (
                                <td key={ci} style={{ padding: "12px 16px" }}>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 6,
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 15,
                                        fontWeight: 800,
                                        color:
                                          v > 0 ? CAP_COLORS[ci] : "#2D3748",
                                        fontFamily: "'Courier New', monospace",
                                      }}
                                    >
                                      {v}
                                    </span>
                                  </div>
                                </td>
                              ))}
                              <td
                                style={{
                                  padding: "12px 16px",
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: "#E2E8F0",
                                  fontFamily: "'Courier New', monospace",
                                }}
                              >
                                {rowTotal}
                              </td>
                              <td style={{ padding: "12px 16px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                  }}
                                >
                                  <div
                                    style={{
                                      width: 60,
                                      height: 6,
                                      background: "rgba(30,41,59,0.8)",
                                      borderRadius: 3,
                                      overflow: "hidden",
                                    }}
                                  >
                                    <div
                                      style={{
                                        height: "100%",
                                        width: `${pct}%`,
                                        background:
                                          "linear-gradient(to right,#00D4AA,#0EA5E9)",
                                        borderRadius: 3,
                                      }}
                                    />
                                  </div>
                                  <span
                                    style={{ fontSize: 11, color: "#64748B" }}
                                  >
                                    {pct}%
                                  </span>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 4: PHIẾU GIAO DỊCH */}
      {tab === "phieu" && (
        <>
          {/* <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: 12,
            }}
          >
            <button
              onClick={exportToExcel}
              style={{
                padding: "8px 16px",
                background: "#10B98115",
                border: "1px solid #10B981",
                color: "#10B981",
                borderRadius: 6,
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon name="download" size={14} /> XUẤT EXCEL
            </button>
          </div> */}
          <div
            style={{
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(100,116,139,0.15)",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    background: "rgba(30,41,59,0.8)",
                    borderBottom: "1px solid rgba(100,116,139,0.2)",
                  }}
                >
                  {[
                    "Mã phiếu",
                    "Loại",
                    "Kho",
                    "Người lập",
                    "Ngày",
                    "Số lượng",
                    "Ghi chú",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "13px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#64748B",
                        letterSpacing: 1,
                        textTransform: "uppercase",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredPhieu.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid rgba(100,116,139,0.08)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "rgba(30,41,59,0.4)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color:
                          row.loai_phieu === "NHAP_KHO" ? "#00D4AA" : "#F59E0B",
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 700,
                      }}
                    >
                      {row.ma_phieu}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 10px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 700,
                          background:
                            row.loai_phieu === "NHAP_KHO"
                              ? "rgba(0,212,170,0.12)"
                              : "rgba(245,158,11,0.12)",
                          color:
                            row.loai_phieu === "NHAP_KHO"
                              ? "#00D4AA"
                              : "#F59E0B",
                          border: `1px solid ${row.loai_phieu === "NHAP_KHO" ? "rgba(0,212,170,0.3)" : "rgba(245,158,11,0.3)"}`,
                        }}
                      >
                        {row.loai_phieu === "NHAP_KHO" ? (
                          <Icon name="arrowdown" size={11} />
                        ) : (
                          <Icon name="arrowup" size={11} />
                        )}
                        {row.loai_phieu === "NHAP_KHO"
                          ? "NHẬP KHO"
                          : "XUẤT KHO"}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color: "#0EA5E9",
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 600,
                      }}
                    >
                      {row.ten_kho}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {row.nguoi_lap || "Hệ thống"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      {row.created_at
                        ? new Date(row.created_at).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 14,
                        fontWeight: 800,
                        color: "#E2E8F0",
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {row.so_luong || 0}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        fontSize: 12,
                        color: "#64748B",
                      }}
                    >
                      {row.ghi_chu}
                    </td>
                    <td
                      style={{
                        padding: "13px 16px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <QRPhieuPreviewButton
                        phieuId={row.id}
                        maPhieu={row.ma_phieu}
                      />
                      <button
                        onClick={() => handleViewDetail(row.id)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: "1px solid #0EA5E933",
                          background: "#0EA5E911",
                          color: "#0EA5E9",
                          cursor: "pointer",
                        }}
                      >
                        <Icon name="eye" size={13} />
                      </button>
                      <button
                        onClick={() => handleDownloadExcelPhieu(row.id)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: "1px solid #10B98133",
                          background: "#10B98111",
                          color: "#10B981",
                          cursor: "pointer",
                        }}
                        title="Xuất file Excel"
                      >
                        <Icon name="download" size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ======================= MODALS ======================= */}

      {/* MODAL THÊM / SỬA KHO */}
      <Modal
        isOpen={isKhoModalOpen}
        onClose={() => setKhoModalOpen(false)}
        title={editingKhoId ? "CẬP NHẬT THÔNG TIN KHO" : "THÊM KHO LƯU TRỮ MỚI"}
        accentColor="#A78BFA"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Mã kho">
              <Input
                value={khoForm.ma_kho}
                onChange={(e: any) =>
                  setKhoForm({ ...khoForm, ma_kho: e.target.value })
                }
                placeholder="VD: KHO-E"
              />
            </FormGroup>
            <FormGroup label="Tên kho">
              <Input
                value={khoForm.ten_kho}
                onChange={(e: any) =>
                  setKhoForm({ ...khoForm, ten_kho: e.target.value })
                }
                placeholder="VD: Kho E - Hậu cần"
              />
            </FormGroup>
          </div>
          <FormGroup label="Đơn vị quản lý (Trực thuộc)">
            <Select
              value={khoForm.don_vi_id}
              onChange={(e: any) =>
                setKhoForm({ ...khoForm, don_vi_id: e.target.value })
              }
            >
              <option value="">-- Chọn đơn vị quản lý --</option>
              {renderTreeOptions(donViTree)}
            </Select>
          </FormGroup>
          <FormGroup label="Vị trí vật lý">
            <Input
              value={khoForm.vi_tri}
              onChange={(e: any) =>
                setKhoForm({ ...khoForm, vi_tri: e.target.value })
              }
              placeholder="VD: Tòa nhà E, Tầng 1"
            />
          </FormGroup>
          <FormGroup label="Sức chứa tối đa (Trang bị)">
            <Input
              type="number"
              value={khoForm.suc_chua}
              onChange={(e: any) =>
                setKhoForm({ ...khoForm, suc_chua: e.target.value })
              }
              placeholder="VD: 500"
            />
          </FormGroup>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setKhoModalOpen(false)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "1px solid rgba(100,116,139,0.3)",
              background: "transparent",
              color: "#E2E8F0",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            HỦY
          </button>
          <button
            onClick={handleSaveKho}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            {editingKhoId ? "LƯU CẬP NHẬT" : "LƯU KHO MỚI"}
          </button>
        </div>
      </Modal>

      {/* MODAL TẠO PHIẾU NHẬP KHO */}
      {isPhieuModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8,15,30,0.85)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setPhieuModalOpen(false)}
          />

          <div
            style={{
              position: "relative",
              width: 1100,
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "linear-gradient(160deg, #0D1626, #080F1E)",
              border: "1px solid rgba(0,212,170,0.3)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 0 60px rgba(0,212,170,0.12)",
            }}
          >
            <button
              onClick={() => setPhieuModalOpen(false)}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                padding: 8,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(100,116,139,0.3)",
                color: "#64748B",
                cursor: "pointer",
              }}
            >
              <Icon name="x" size={16} />
            </button>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#00D4AA",
                letterSpacing: 1,
                marginBottom: 24,
                fontFamily: "'Courier New', monospace",
              }}
            >
              TẠO PHIẾU NHẬP KHO
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginBottom: 24,
                background: "rgba(0,0,0,0.2)",
                padding: 6,
                borderRadius: 8,
                width: "fit-content",
              }}
            >
              <button
                onClick={() => setImportMode("manual")}
                style={{
                  padding: "8px 24px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    importMode === "manual"
                      ? "rgba(0,212,170,0.2)"
                      : "transparent",
                  color: importMode === "manual" ? "#00D4AA" : "#64748B",
                }}
              >
                NHẬP THỦ CÔNG
              </button>

              <button
                onClick={() => setImportMode("qr_phieu")}
                style={{
                  padding: "8px 24px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    importMode === "qr_phieu"
                      ? "rgba(245,158,11,0.2)"
                      : "transparent",
                  color: importMode === "qr_phieu" ? "#F59E0B" : "#64748B",
                }}
              >
                NHẬP TỪ MÃ QR PHIẾU
              </button>

              <button
                onClick={() => setImportMode("excel")}
                style={{
                  padding: "8px 24px",
                  borderRadius: 6,
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                  background:
                    importMode === "excel"
                      ? "rgba(0,212,170,0.2)"
                      : "transparent",
                  color: importMode === "excel" ? "#00D4AA" : "#64748B",
                }}
              >
                NHẬP TỪ FILE EXCEL
              </button>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 16,
                marginBottom: 24,
                padding: 20,
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px solid rgba(100,116,139,0.2)",
              }}
            >
              <FormGroup label="Mã phiếu nhập">
                <Input
                  value={phieuForm.ma_phieu}
                  onChange={(e: any) =>
                    setPhieuForm({ ...phieuForm, ma_phieu: e.target.value })
                  }
                  disabled={importMode === "qr_phieu"}
                />
              </FormGroup>
              <FormGroup label="Ngày nhập">
                <Input
                  type="date"
                  value={phieuForm.ngay_nhap}
                  onChange={(e: any) =>
                    setPhieuForm({ ...phieuForm, ngay_nhap: e.target.value })
                  }
                  disabled={importMode === "qr_phieu"}
                />
              </FormGroup>
              <FormGroup label="Kho Nhập Tới (*)">
                <Select
                  value={phieuForm.kho_id}
                  onChange={(e: any) =>
                    setPhieuForm({ ...phieuForm, kho_id: e.target.value })
                  }
                >
                  <option value="">-- Chọn kho nhập --</option>
                  {khos.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.ten_kho}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Người Lập Phiếu">
                <Select
                  value={phieuForm.nguoi_lap_id}
                  onChange={(e: any) =>
                    setPhieuForm({ ...phieuForm, nguoi_lap_id: e.target.value })
                  }
                >
                  <option value="">-- Chọn người lập --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.username}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>

            {/* HIỂN THỊ NỘI DUNG THEO TỪNG MODE */}
            {importMode === "excel" ? (
              <div
                style={{
                  padding: 40,
                  background: "rgba(0,212,170,0.05)",
                  border: "1px dashed rgba(0,212,170,0.4)",
                  borderRadius: 12,
                  textAlign: "center",
                }}
              >
                <Icon name="upload" size={40} />
                <div
                  style={{
                    fontSize: 16,
                    color: "#E2E8F0",
                    fontWeight: 700,
                    marginTop: 16,
                    marginBottom: 6,
                  }}
                >
                  TẢI LÊN FILE EXCEL
                </div>
                <div
                  style={{ fontSize: 13, color: "#94A3B8", marginBottom: 24 }}
                >
                  File Excel cần tuân thủ đúng định dạng các cột: Ma_SP, Serial,
                  Ma_QR, Cap_Chat_Luong
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 16,
                    alignItems: "center",
                  }}
                >
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    style={{
                      color: "#E2E8F0",
                      fontSize: 13,
                      background: "rgba(15,23,42,0.8)",
                      padding: "10px 16px",
                      borderRadius: 8,
                      border: "1px solid rgba(100,116,139,0.3)",
                    }}
                  />
                  <button
                    onClick={downloadTemplate}
                    style={{
                      padding: "12px 24px",
                      background: "transparent",
                      border: "1px solid rgba(0,212,170,0.5)",
                      color: "#00D4AA",
                      borderRadius: 8,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                    }}
                  >
                    <Icon name="download" size={16} /> MẪU EXCEL
                  </button>
                </div>
              </div>
            ) : importMode === "qr_phieu" ? (
              // BỔ SUNG: GIAO DIỆN NHẬP KHO QUA MÃ QR PHIẾU
              <div
                style={{
                  padding: 40,
                  background: "rgba(245,158,11,0.05)",
                  border: "1px dashed rgba(245,158,11,0.4)",
                  borderRadius: 12,
                }}
              >
                <div
                  style={{
                    maxWidth: 600,
                    margin: "0 auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 20,
                  }}
                >
                  <div style={{ textAlign: "center", marginBottom: 12 }}>
                    <Icon name="qr" size={40} />
                    <div
                      style={{
                        fontSize: 16,
                        color: "#E2E8F0",
                        fontWeight: 700,
                        marginTop: 12,
                      }}
                    >
                      NHẬP KHO TỰ ĐỘNG TỪ MÃ QR PHIẾU XUẤT
                    </div>
                    <div
                      style={{ fontSize: 13, color: "#94A3B8", marginTop: 6 }}
                    >
                      Hệ thống sẽ tự động tạo phiếu nhập và chuyển dữ liệu thiết
                      bị sang kho bạn đã chọn.
                    </div>
                  </div>

                  <FormGroup label="1. Chuỗi mã hóa Phiếu Xuất (*)">
                    <div style={{ display: "flex", gap: 8 }}>
                      <input
                        value={phieuQrInput}
                        onChange={(e) => setPhieuQrInput(e.target.value)}
                        placeholder="Dán chuỗi hoặc quét mã QR..."
                        style={{
                          flex: 1,
                          padding: "12px 16px",
                          background: "rgba(15,23,42,0.8)",
                          border: "1px solid rgba(100,116,139,0.3)",
                          borderRadius: 8,
                          color: "#F59E0B",
                          fontSize: 13,
                          fontFamily: "'Courier New', monospace",
                          outline: "none",
                          boxSizing: "border-box",
                        }}
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setScannerTarget("nhap_phieu_qr");
                          setIsScannerOpen(true);
                        }}
                        style={{
                          padding: "0 16px",
                          background: "rgba(245,158,11,0.15)",
                          border: "1px solid rgba(245,158,11,0.3)",
                          color: "#F59E0B",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 18,
                          fontWeight: 700,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        📷 QUÉT
                      </button>
                    </div>
                  </FormGroup>

                  <FormGroup label="2. Khóa bảo mật (Secret Key) (*)">
                    <input
                      type="password"
                      value={phieuQrSecret}
                      onChange={(e) => setPhieuQrSecret(e.target.value)}
                      placeholder="Nhập khóa bảo mật của phiếu..."
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        background: "rgba(15,23,42,0.8)",
                        border: "1px solid rgba(100,116,139,0.3)",
                        borderRadius: 8,
                        color: "#E2E8F0",
                        fontSize: 14,
                        outline: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </FormGroup>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "350px 1fr",
                  gap: 24,
                }}
              >
                <div
                  style={{
                    background: "rgba(15,23,42,0.4)",
                    border: "1px solid rgba(0,212,170,0.3)",
                    borderRadius: 12,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 16,
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#00D4AA",
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    ➕ THÔNG TIN THIẾT BỊ MỚI
                  </div>

                  <FormGroup label="Sản phẩm gốc (*)">
                    <Select
                      value={currentManualItem.thong_tin_sp_id}
                      onChange={(e: any) =>
                        setCurrentManualItem({
                          ...currentManualItem,
                          thong_tin_sp_id: e.target.value,
                        })
                      }
                    >
                      <option value="">- Chọn Sản phẩm -</option>
                      {sanPhams.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.ten_san_pham}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup label="Mã QR Hệ thống (*)">
                    <div style={{ display: "flex", gap: 8 }}>
                      <Input
                        value={currentManualItem.ma_qr}
                        onChange={(e: any) =>
                          setCurrentManualItem({
                            ...currentManualItem,
                            ma_qr: e.target.value,
                          })
                        }
                      />
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          setScannerTarget("nhap_tay");
                          setIsScannerOpen(true);
                        }}
                        style={{
                          padding: "0 12px",
                          background: "rgba(0,212,170,0.15)",
                          border: "1px solid rgba(0,212,170,0.3)",
                          color: "#00D4AA",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 16,
                        }}
                        title="Quét QR bằng Camera"
                      >
                        📷
                      </button>
                      <button
                        onClick={generateRandomQR}
                        style={{
                          padding: "0 12px",
                          background: "rgba(14,165,233,0.15)",
                          border: "1px solid rgba(14,165,233,0.3)",
                          color: "#0EA5E9",
                          borderRadius: 8,
                          cursor: "pointer",
                          fontSize: 18,
                        }}
                        title="Tạo mã ngẫu nhiên"
                      >
                        🎲
                      </button>
                    </div>
                  </FormGroup>

                  <FormGroup label="Số Serial (NSX)">
                    <Input
                      value={currentManualItem.so_serial}
                      onChange={(e: any) =>
                        setCurrentManualItem({
                          ...currentManualItem,
                          so_serial: e.target.value,
                        })
                      }
                      placeholder="Để trống nếu không có"
                    />
                  </FormGroup>

                  <FormGroup label="Cấp chất lượng">
                    <Select
                      value={currentManualItem.cap_chat_luong}
                      onChange={(e: any) =>
                        setCurrentManualItem({
                          ...currentManualItem,
                          cap_chat_luong: e.target.value,
                        })
                      }
                    >
                      <option value="1">Cấp 1 (Mới / Rất tốt)</option>
                      <option value="2">Cấp 2 (Tốt)</option>
                      <option value="3">Cấp 3 (Trung bình)</option>
                      <option value="4">Cấp 4 (Kém)</option>
                    </Select>
                  </FormGroup>

                  <button
                    onClick={addManualItem}
                    style={{
                      width: "100%",
                      padding: "14px",
                      borderRadius: 8,
                      border: "none",
                      background: "rgba(0,212,170,0.15)",
                      color: "#00D4AA",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                      marginTop: 8,
                    }}
                  >
                    THÊM VÀO DANH SÁCH BÊN DƯỚI
                  </button>
                </div>

                <div
                  style={{
                    background: "rgba(15,23,42,0.4)",
                    border: "1px dashed rgba(100,116,139,0.3)",
                    borderRadius: 12,
                    padding: 20,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: "#E2E8F0",
                      fontWeight: 700,
                      marginBottom: 16,
                      letterSpacing: 1,
                    }}
                  >
                    📋 DANH SÁCH CHỜ NHẬP KHO ({manualItems.length})
                  </div>

                  <div
                    style={{
                      flex: 1,
                      maxHeight: "320px",
                      overflowY: "auto",
                      paddingRight: 4,
                    }}
                  >
                    {manualItems.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          color: "#64748B",
                          fontSize: 13,
                          marginTop: 80,
                          marginBottom: 80,
                        }}
                      >
                        Chưa có thiết bị nào trong danh sách.
                      </div>
                    ) : (
                      <table
                        style={{ width: "100%", borderCollapse: "collapse" }}
                      >
                        <thead
                          style={{
                            position: "sticky",
                            top: 0,
                            background: "#111827",
                            zIndex: 1,
                          }}
                        >
                          <tr
                            style={{
                              borderBottom: "1px solid rgba(100,116,139,0.3)",
                            }}
                          >
                            {["Sản phẩm", "Mã QR", "Serial", "Cấp CL", ""].map(
                              (h) => (
                                <th
                                  key={h}
                                  style={{
                                    padding: "10px",
                                    textAlign: "left",
                                    fontSize: 11,
                                    color: "#94A3B8",
                                    textTransform: "uppercase",
                                  }}
                                >
                                  {h}
                                </th>
                              ),
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {manualItems.map((item, idx) => (
                            <tr
                              key={idx}
                              style={{
                                borderBottom: "1px solid rgba(100,116,139,0.1)",
                              }}
                            >
                              <td
                                style={{
                                  padding: "12px 10px",
                                  fontSize: 13,
                                  color: "#E2E8F0",
                                }}
                              >
                                {item.ten_san_pham}
                              </td>
                              <td
                                style={{
                                  padding: "12px 10px",
                                  fontSize: 13,
                                  color: "#00D4AA",
                                  fontWeight: 600,
                                  fontFamily: "'Courier New', monospace",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                  }}
                                >
                                  {item.ma_qr}
                                  <QRPreviewButton qr={item.ma_qr} />
                                </div>
                              </td>
                              <td
                                style={{
                                  padding: "12px 10px",
                                  fontSize: 12,
                                  color: "#94A3B8",
                                }}
                              >
                                {item.so_serial || "—"}
                              </td>
                              <td
                                style={{
                                  padding: "12px 10px",
                                  fontSize: 12,
                                  color: "#F59E0B",
                                  fontWeight: 700,
                                }}
                              >
                                Cấp {item.cap_chat_luong}
                              </td>
                              <td
                                style={{
                                  padding: "12px 10px",
                                  textAlign: "right",
                                }}
                              >
                                <button
                                  onClick={() =>
                                    setManualItems(
                                      manualItems.filter((_, i) => i !== idx),
                                    )
                                  }
                                  style={{
                                    background: "rgba(239,68,68,0.1)",
                                    border: "1px solid rgba(239,68,68,0.3)",
                                    borderRadius: 6,
                                    padding: "8px",
                                    color: "#EF4444",
                                    cursor: "pointer",
                                    display: "inline-flex",
                                  }}
                                >
                                  <Icon name="x" size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div style={{ marginTop: 24 }}>
              <FormGroup label="Ghi chú (Tùy chọn)">
                <Input
                  value={phieuForm.ghi_chu}
                  onChange={(e: any) =>
                    setPhieuForm({ ...phieuForm, ghi_chu: e.target.value })
                  }
                />
              </FormGroup>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
              <button
                onClick={() => setPhieuModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: 8,
                  border: "1px solid rgba(100,116,139,0.3)",
                  background: "transparent",
                  color: "#E2E8F0",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleSavePhieuNhap}
                style={{
                  flex: 2,
                  padding: "16px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
                  color: "#0F172A",
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: 1,
                  fontSize: 13,
                }}
              >
                {importMode === "qr_phieu"
                  ? "TỰ ĐỘNG NHẬP KHO"
                  : "LƯU PHIẾU NHẬP KHO"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TẠO PHIẾU XUẤT KHO */}
      {isPhieuXuatModalOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8,15,30,0.85)",
              backdropFilter: "blur(6px)",
            }}
            onClick={() => setPhieuXuatModalOpen(false)}
          />

          <div
            style={{
              position: "relative",
              width: 1100,
              maxWidth: "95vw",
              maxHeight: "90vh",
              overflowY: "auto",
              background: "linear-gradient(160deg, #0D1626, #080F1E)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 0 60px rgba(245,158,11,0.12)",
            }}
          >
            <button
              onClick={() => setPhieuXuatModalOpen(false)}
              style={{
                position: "absolute",
                top: 24,
                right: 24,
                padding: 8,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(100,116,139,0.3)",
                color: "#64748B",
                cursor: "pointer",
              }}
            >
              <Icon name="x" size={16} />
            </button>

            <div
              style={{
                fontSize: 18,
                fontWeight: 800,
                color: "#F59E0B",
                letterSpacing: 1,
                marginBottom: 24,
                fontFamily: "'Courier New', monospace",
              }}
            >
              TẠO PHIẾU XUẤT KHO
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr 1fr",
                gap: 16,
                marginBottom: 24,
                padding: 20,
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px solid rgba(245,158,11,0.3)",
              }}
            >
              <FormGroup label="Mã phiếu xuất">
                <Input
                  value={phieuXuatForm.ma_phieu}
                  onChange={(e: any) =>
                    setPhieuXuatForm({
                      ...phieuXuatForm,
                      ma_phieu: e.target.value,
                    })
                  }
                />
              </FormGroup>
              <FormGroup label="Ngày xuất">
                <Input
                  type="date"
                  value={phieuXuatForm.ngay_xuat}
                  onChange={(e: any) =>
                    setPhieuXuatForm({
                      ...phieuXuatForm,
                      ngay_xuat: e.target.value,
                    })
                  }
                />
              </FormGroup>
              <FormGroup label="Kho Xuất Từ (*)">
                <Select
                  value={phieuXuatForm.kho_id}
                  onChange={(e: any) => handleXuatKhoChange(e.target.value)}
                >
                  <option value="">-- Chọn kho xuất --</option>
                  {khos.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.ten_kho}
                    </option>
                  ))}
                </Select>
              </FormGroup>
              <FormGroup label="Người Lập Phiếu">
                <Select
                  value={phieuXuatForm.nguoi_lap_id}
                  onChange={(e: any) =>
                    setPhieuXuatForm({
                      ...phieuXuatForm,
                      nguoi_lap_id: e.target.value,
                    })
                  }
                >
                  <option value="">-- Chọn người lập --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name || u.username}
                    </option>
                  ))}
                </Select>
              </FormGroup>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              {/* Cột trái: Có sẵn */}
              <div
                style={{
                  background: "rgba(30,41,59,0.3)",
                  border: "1px solid rgba(100,116,139,0.3)",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#E2E8F0",
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    📦 THIẾT BỊ KHẢ DỤNG ({visibleXuatEquipments.length})
                  </span>
                </div>
                <div style={{ position: "relative", display: "flex", gap: 8 }}>
                  <div style={{ position: "relative", flex: 1 }}>
                    <span
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#64748B",
                      }}
                    >
                      <Icon name="search" size={14} />
                    </span>
                    <input
                      value={tbXuatSearch}
                      onChange={(e) => setTbXuatSearch(e.target.value)}
                      disabled={!phieuXuatForm.kho_id}
                      placeholder="Tìm QR, serial, tên SP..."
                      style={{
                        width: "100%",
                        padding: "9px 10px 9px 32px",
                        background: "rgba(15,23,42,0.6)",
                        border: "1px solid rgba(100,116,139,0.3)",
                        borderRadius: 6,
                        color: "#E2E8F0",
                        fontSize: 12,
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      setScannerTarget("xuat_kho");
                      setIsScannerOpen(true);
                    }}
                    disabled={!phieuXuatForm.kho_id}
                    style={{
                      padding: "0 14px",
                      background: "rgba(245,158,11,0.15)",
                      border: "1px solid rgba(245,158,11,0.3)",
                      color: "#F59E0B",
                      borderRadius: 6,
                      cursor: phieuXuatForm.kho_id ? "pointer" : "not-allowed",
                      fontSize: 16,
                    }}
                    title="Quét mã để tìm kiếm"
                  >
                    📷
                  </button>
                </div>
                <div
                  style={{
                    flex: 1,
                    maxHeight: 320,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {visibleXuatEquipments.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#64748B",
                        fontSize: 13,
                        marginTop: 40,
                        marginBottom: 40,
                      }}
                    >
                      {phieuXuatForm.kho_id
                        ? "Không tìm thấy thiết bị."
                        : "Vui lòng chọn Kho xuất ở phía trên."}
                    </div>
                  ) : (
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead
                        style={{
                          position: "sticky",
                          top: 0,
                          background: "#111827",
                          zIndex: 1,
                        }}
                      >
                        <tr
                          style={{
                            borderBottom: "1px solid rgba(100,116,139,0.3)",
                          }}
                        >
                          {["Sản phẩm", "Mã QR", ""].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontSize: 11,
                                color: "#94A3B8",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {visibleXuatEquipments.map((tb) => (
                          <tr
                            key={tb.id}
                            style={{
                              borderBottom: "1px solid rgba(100,116,139,0.1)",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 10px",
                                fontSize: 12,
                                color: "#E2E8F0",
                              }}
                            >
                              {tb.ten_san_pham}
                              <br />
                              <span style={{ fontSize: 10, color: "#94A3B8" }}>
                                SN: {tb.serial || "—"}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "12px 10px",
                                fontSize: 12,
                                color: "#00D4AA",
                                fontWeight: 600,
                                fontFamily: "'Courier New', monospace",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {tb.ma_qr}
                                <QRPreviewButton qr={tb.ma_qr} />
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "12px 10px",
                                textAlign: "right",
                              }}
                            >
                              <button
                                onClick={() =>
                                  setSelectedXuatEquipments([
                                    ...selectedXuatEquipments,
                                    tb,
                                  ])
                                }
                                style={{
                                  background: "rgba(245,158,11,0.1)",
                                  border: "1px solid rgba(245,158,11,0.3)",
                                  borderRadius: 6,
                                  padding: "6px 12px",
                                  color: "#F59E0B",
                                  cursor: "pointer",
                                  fontSize: 11,
                                  fontWeight: 700,
                                }}
                              >
                                CHỌN
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Cột phải: Đã chọn */}
              <div
                style={{
                  background: "rgba(245,158,11,0.05)",
                  border: "1px dashed rgba(245,158,11,0.4)",
                  borderRadius: 12,
                  padding: 20,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      color: "#F59E0B",
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    📋 CHỜ XUẤT KHO ({selectedXuatEquipments.length})
                  </span>
                  {selectedXuatEquipments.length > 0 && (
                    <span
                      onClick={() => setSelectedXuatEquipments([])}
                      style={{
                        fontSize: 11,
                        color: "#EF4444",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      Xóa hết
                    </span>
                  )}
                </div>
                <div
                  style={{
                    flex: 1,
                    maxHeight: 320,
                    overflowY: "auto",
                    paddingRight: 4,
                  }}
                >
                  {selectedXuatEquipments.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        color: "#64748B",
                        fontSize: 13,
                        marginTop: 40,
                        marginBottom: 40,
                      }}
                    >
                      Chưa có thiết bị nào được chọn.
                    </div>
                  ) : (
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead
                        style={{
                          position: "sticky",
                          top: 0,
                          background: "#111827",
                          zIndex: 1,
                        }}
                      >
                        <tr
                          style={{
                            borderBottom: "1px solid rgba(100,116,139,0.3)",
                          }}
                        >
                          {["Sản phẩm", "Mã QR", ""].map((h) => (
                            <th
                              key={h}
                              style={{
                                padding: "10px",
                                textAlign: "left",
                                fontSize: 11,
                                color: "#94A3B8",
                              }}
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedXuatEquipments.map((tb, idx) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: "1px solid rgba(100,116,139,0.1)",
                            }}
                          >
                            <td
                              style={{
                                padding: "12px 10px",
                                fontSize: 12,
                                color: "#E2E8F0",
                              }}
                            >
                              {tb.ten_san_pham}
                            </td>
                            <td
                              style={{
                                padding: "12px 10px",
                                fontSize: 12,
                                color: "#F59E0B",
                                fontWeight: 600,
                                fontFamily: "'Courier New', monospace",
                              }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                {tb.ma_ca_the}
                                <QRPreviewButton qr={tb.ma_ca_the} />
                              </div>
                            </td>
                            <td
                              style={{
                                padding: "12px 10px",
                                textAlign: "right",
                              }}
                            >
                              <button
                                onClick={() =>
                                  setSelectedXuatEquipments(
                                    selectedXuatEquipments.filter(
                                      (_, i) => i !== idx,
                                    ),
                                  )
                                }
                                style={{
                                  background: "rgba(239,68,68,0.1)",
                                  border: "1px solid rgba(239,68,68,0.3)",
                                  borderRadius: 6,
                                  padding: "6px",
                                  color: "#EF4444",
                                  cursor: "pointer",
                                  display: "inline-flex",
                                }}
                              >
                                <Icon name="x" size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginTop: 24 }}>
              <FormGroup label="Ghi chú (Tùy chọn)">
                <Input
                  value={phieuXuatForm.ghi_chu}
                  onChange={(e: any) =>
                    setPhieuXuatForm({
                      ...phieuXuatForm,
                      ghi_chu: e.target.value,
                    })
                  }
                />
              </FormGroup>
            </div>

            <div style={{ display: "flex", gap: 16, marginTop: 32 }}>
              <button
                onClick={() => setPhieuXuatModalOpen(false)}
                style={{
                  flex: 1,
                  padding: "16px",
                  borderRadius: 8,
                  border: "1px solid rgba(100,116,139,0.3)",
                  background: "transparent",
                  color: "#E2E8F0",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                HỦY BỎ
              </button>
              <button
                onClick={handleSavePhieuXuat}
                style={{
                  flex: 2,
                  padding: "16px",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                  color: "#fff",
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: 1,
                  fontSize: 13,
                }}
              >
                XÁC NHẬN XUẤT KHO
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL XEM CHI TIẾT PHIẾU GIAO DỊCH KHO */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title="CHI TIẾT PHIẾU GIAO DỊCH"
        accentColor="#0EA5E9"
      >
        {selectedPhieuDetail && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                background: "rgba(15,23,42,0.5)",
                padding: 16,
                borderRadius: 8,
                border: "1px solid rgba(100,116,139,0.2)",
              }}
            >
              <div>
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  Mã Phiếu:
                </span>{" "}
                <div
                  style={{
                    fontSize: 14,
                    color: "#0EA5E9",
                    fontWeight: 700,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {selectedPhieuDetail.ma_phieu}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#64748B" }}>Kho:</span>{" "}
                <div
                  style={{ fontSize: 14, color: "#E2E8F0", fontWeight: 600 }}
                >
                  {selectedPhieuDetail.ten_kho}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  Ngày tạo:
                </span>{" "}
                <div style={{ fontSize: 13, color: "#E2E8F0" }}>
                  {new Date(selectedPhieuDetail.created_at).toLocaleDateString(
                    "vi-VN",
                  )}
                </div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: "#64748B" }}>
                  Người lập:
                </span>{" "}
                <div style={{ fontSize: 13, color: "#E2E8F0" }}>
                  {selectedPhieuDetail.nguoi_lap || "Hệ thống"}
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: 12,
                color: "#94A3B8",
                fontWeight: 700,
                letterSpacing: 1,
              }}
            >
              DANH SÁCH THIẾT BỊ (
              {selectedPhieuDetail.danh_sach_trang_bi?.length || 0})
            </div>
            <div
              style={{
                maxHeight: 300,
                overflowY: "auto",
                border: "1px solid rgba(100,116,139,0.2)",
                borderRadius: 8,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(30,41,59,0.8)" }}>
                    <th
                      style={{
                        padding: "10px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      Mã QR
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      Thiết bị
                    </th>
                    <th
                      style={{
                        padding: "10px",
                        textAlign: "center",
                        fontSize: 11,
                        color: "#64748B",
                        textTransform: "uppercase",
                      }}
                    >
                      Cấp CL
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPhieuDetail.danh_sach_trang_bi?.map(
                    (ct: any, idx: number) => (
                      <tr
                        key={idx}
                        style={{ borderTop: "1px solid rgba(100,116,139,0.1)" }}
                      >
                        <td
                          style={{
                            padding: "10px",
                            fontSize: 12,
                            color: "#00D4AA",
                            fontWeight: 600,
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          <div
                            style={{ display: "flex", alignItems: "center" }}
                          >
                            {ct.ma_qr}
                            <QRPreviewButton qr={ct.ma_qr} />
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            fontSize: 12,
                            color: "#E2E8F0",
                          }}
                        >
                          {ct.ten_san_pham}
                          <br />
                          <span style={{ fontSize: 10, color: "#64748B" }}>
                            S/N: {ct.so_serial || "—"}
                          </span>
                        </td>
                        <td
                          style={{
                            padding: "10px",
                            textAlign: "center",
                            fontSize: 12,
                            color: "#F59E0B",
                            fontWeight: 700,
                          }}
                        >
                          {ct.cap_chat_luong}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
            <button
              onClick={() => setDetailModalOpen(false)}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(100,116,139,0.4)",
                color: "#E2E8F0",
                cursor: "pointer",
                fontWeight: 600,
                marginTop: 8,
              }}
            >
              ĐÓNG
            </button>
          </div>
        )}
      </Modal>

      {/* COMPONENT QUÉT CAMERA */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => {
          setIsScannerOpen(false);
          setScannerTarget(null);
        }}
        onScanSuccess={(text) => {
          if (scannerTarget === "nhap_tay") {
            setCurrentManualItem({ ...currentManualItem, ma_qr: text });
          } else if (scannerTarget === "nhap_phieu_qr") {
            setPhieuQrInput(text);
          } else if (scannerTarget === "xuat_kho") {
            setTbXuatSearch(text);
          }
        }}
      />
    </div>
  );
}
