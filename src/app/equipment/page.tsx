/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import {
  QualityStars,
  StatusBadge,
  Modal,
  FormGroup,
  Input,
  Select,
  QRPreviewButton,
  QRPreviewSPButton,
} from "@/src/components/ui/Shared";
import { danhMucService, DanhMucNode } from "@/src/services/danhMuc.service";
import { sanPhamService } from "@/src/services/sanPham.service";
import { khoService } from "@/src/services/kho.service";
import { donViService } from "@/src/services/donVi.service";
// import { exportPhieuToExcel } from "@/src/lib/exportExcel";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "https://f375-back-qr.onrender.com/api";
const CAP_COLORS_EQ = ["#00D4AA", "#3B82F6", "#F59E0B", "#EF4444"];

// --- Helper hiển thị danh sách cây ---
const renderTreeOptions = (nodes: any[], depth = 0): any[] => {
  return nodes?.flatMap((node) => {
    const prefix = depth > 0 ? "\u00A0\u00A0".repeat(depth * 2) + "|— " : "";
    const option = (
      <option key={node.id} value={node.id}>
        {prefix}
        {node.ten_danh_muc || node.ten_don_vi}
      </option>
    );
    const childrenOptions = node.children
      ? renderTreeOptions(node.children, depth + 1)
      : [];
    return [option, ...childrenOptions];
  });
};

// --- Component Drawer Xem Chi tiết ---
const UnitDetailDrawer = ({ unit, sanPhams, onClose }: any) => {
  if (!unit) return null;
  const sp = sanPhams.find((s: any) => s.id === unit.trang_bi_id);
  const khoName = unit?.kho || "Chưa có kho";
  const donViName = unit?.don_vi_quan_ly || "Chưa có ĐV";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,15,30,0.85)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: 480,
          background: "linear-gradient(160deg,#0D1626,#080F1E)",
          border: "1px solid rgba(0,212,170,0.3)",
          borderRadius: 16,
          padding: 32,
          zIndex: 1,
          boxShadow: "0 0 60px rgba(0,212,170,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: "linear-gradient(to right,#00D4AA,#0EA5E9)",
            borderRadius: "16px 16px 0 0",
          }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: "#00D4AA",
                letterSpacing: 2,
                fontFamily: "'Courier New',monospace",
                marginBottom: 6,
              }}
            >
              CHI TIẾT TRANG BỊ
            </div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0" }}>
              {unit?.ten_san_pham || "Không xác định"}
            </div>
            <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>
              {sp?.ten_danh_muc || "Chưa phân loại"} · {sp?.don_vi_tinh}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid rgba(100,116,139,0.3)",
              background: "transparent",
              color: "#64748B",
              cursor: "pointer",
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            {
              label: "Mã QR",
              value: unit.ma_ca_the,
              mono: true,
              color: "#A78BFA",
            },
            {
              label: "Số serial",
              value: unit.serial || "—",
              mono: true,
              color: "#0EA5E9",
            },
            {
              label: "Kho hiện tại",
              value: khoName,
              mono: false,
              color: "#E2E8F0",
            },
            {
              label: "Đơn vị quản lý",
              value: donViName,
              mono: false,
              color: "#E2E8F0",
            },
            {
              label: "Ngày nhập kho",
              value: new Date(unit.created_at).toLocaleDateString("vi-VN"),
              mono: false,
              color: "#94A3B8",
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "10px 14px",
                background: "rgba(30,41,59,0.5)",
                borderRadius: 8,
                borderLeft: "3px solid rgba(0,212,170,0.3)",
              }}
            >
              <span style={{ fontSize: 12, color: "#64748B" }}>
                {item.label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: item.color,
                  fontFamily: item.mono ? "'Courier New',monospace" : "inherit",
                }}
              >
                {item.value}
              </span>
            </div>
          ))}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: "rgba(30,41,59,0.5)",
              borderRadius: 8,
              borderLeft: "3px solid rgba(0,212,170,0.3)",
            }}
          >
            <span style={{ fontSize: 12, color: "#64748B" }}>
              Cấp chất lượng
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <QualityStars cap={unit.cap_chat_luong} />
              <span
                style={{
                  fontSize: 11,
                  color: CAP_COLORS_EQ[unit.cap_chat_luong - 1],
                  fontWeight: 700,
                }}
              >
                Cấp {unit.cap_chat_luong}
              </span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 14px",
              background: "rgba(30,41,59,0.5)",
              borderRadius: 8,
              borderLeft: "3px solid rgba(0,212,170,0.3)",
            }}
          >
            <span style={{ fontSize: 12, color: "#64748B" }}>Trạng thái</span>
            <StatusBadge status={unit.trang_thai} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function EquipmentPage() {
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterKho, setFilterKho] = useState("ALL");

  const [viewMode, setViewMode] = useState("flat");
  const [expandedSp, setExpandedSp] = useState<number | null>(null);
  const [selectedUnitDrawer, setSelectedUnitDrawer] = useState<any>(null);

  // --- STATE DATA API ---
  const [sanPhams, setSanPhams] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]); // Cá thể thực tế
  const [khos, setKhos] = useState<any[]>([]);

  const [categoryTree, setCategoryTree] = useState<DanhMucNode[]>([]);
  const [donViTree, setDonViTree] = useState<any[]>([]);

  // --- STATE MODAL SẢN PHẨM GỐC (BỔ SUNG THỂ TÍCH) ---
  const [isSpModalOpen, setSpModalOpen] = useState(false);
  const [editingSpId, setEditingSpId] = useState<number | null>(null);
  const [spForm, setSpForm] = useState({
    ma_san_pham: "",
    ten_san_pham: "",
    danh_muc_id: "",
    don_vi_tinh: "Cái",
    the_tich: "0", // <- THÊM MỚI Ở ĐÂY
    thong_so_ky_thuat: "",
  });

  // --- STATE MODAL CÁ THỂ (TRANG BỊ THỰC TẾ) ---
  const [isUnitModalOpen, setUnitModalOpen] = useState(false);
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null);
  const [unitForm, setUnitForm] = useState({
    thong_tin_sp_id: "",
    serial: "",
    ma_qr: "",
    cap_chat_luong: "1",
    kho_id_hien_tai: "",
    don_vi_quan_ly_id: "",
    trang_thai: "TRONG_KHO",
  });

  // ================= FETCH DATA API =================
  const fetchData = async () => {
    try {
      const [treeCat, listSp, listUnits, listKho, treeDv] = await Promise.all([
        danhMucService.getTree(),
        sanPhamService.getAll(),
        sanPhamService.getDanhSachTrangBiTungCai(),
        khoService.getAll(),
        donViService.getTree(),
      ]);
      setCategoryTree(treeCat);
      setSanPhams(listSp);
      setUnits(listUnits);
      setKhos(listKho);
      setDonViTree(treeDv);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu", err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // Helper lấy tên
  const getKhoName = (id: any) => khos.find((k) => k.id == id)?.ten_kho || "—";

  // ================= CRUD SẢN PHẨM GỐC =================
  const handleOpenSpModal = (sp: any = null) => {
    if (sp) {
      setEditingSpId(sp.id);
      setSpForm({
        ma_san_pham: sp.ma_san_pham,
        ten_san_pham: sp.ten_san_pham,
        danh_muc_id: sp.danh_muc_id ? sp.danh_muc_id.toString() : "",
        don_vi_tinh: sp.don_vi_tinh || "Cái",
        the_tich: sp.the_tich ? sp.the_tich.toString() : "0", // <- THÊM MỚI
        thong_so_ky_thuat: sp.thong_so_ky_thuat || "",
      });
    } else {
      setEditingSpId(null);
      setSpForm({
        ma_san_pham: "",
        ten_san_pham: "",
        danh_muc_id: "",
        don_vi_tinh: "Cái",
        the_tich: "0",
        thong_so_ky_thuat: "",
      });
    }
    setSpModalOpen(true);
  };

  const handleSaveSp = async () => {
    if (!spForm.ma_san_pham || !spForm.ten_san_pham) {
      alert("Vui lòng điền mã và tên sản phẩm!");
      return;
    }
    try {
      const payload = {
        ...spForm,
        danh_muc_id: spForm.danh_muc_id ? parseInt(spForm.danh_muc_id) : null,
        the_tich: parseFloat(spForm.the_tich) || 0, // <- BỔ SUNG PAYLOAD THE TÍCH
      };
      if (editingSpId) await sanPhamService.update(editingSpId, payload);
      else await sanPhamService.create(payload);
      setSpModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu thông tin sản phẩm.");
    }
  };

  const handleDeleteSp = async (id: number) => {
    if (
      confirm(
        "Xóa sản phẩm này sẽ xóa luôn các cá thể liên kết. Bạn chắc chắn chứ?",
      )
    ) {
      try {
        await sanPhamService.delete(id);
        fetchData();
      } catch (error) {
        alert("Lỗi xóa sản phẩm.");
      }
    }
  };

  // ================= CRUD CÁ THỂ VẬT LÝ =================
  const handleOpenUnitModal = (unit: any = null) => {
    if (unit) {
      setEditingUnitId(unit.id);
      setUnitForm({
        thong_tin_sp_id: unit.trang_bi_id.toString(),
        serial: unit.serial || "",
        ma_qr: unit.ma_ca_the || "",
        cap_chat_luong: unit.cap_chat_luong.toString(),
        kho_id_hien_tai: unit.kho_id_hien_tai
          ? unit.kho_id_hien_tai.toString()
          : "",
        don_vi_quan_ly_id: unit.don_vi_quan_ly_id
          ? unit.don_vi_quan_ly_id.toString()
          : "",
        trang_thai: unit.trang_thai || "TRONG_KHO",
      });
    } else {
      setEditingUnitId(null);
      setUnitForm({
        thong_tin_sp_id: "",
        serial: "",
        ma_qr: `QR-${Date.now()}`,
        cap_chat_luong: "1",
        kho_id_hien_tai: "",
        don_vi_quan_ly_id: "",
        trang_thai: "TRONG_KHO",
      });
    }
    setUnitModalOpen(true);
  };

  const handleSaveUnit = async () => {
    if (!unitForm.thong_tin_sp_id || !unitForm.ma_qr) {
      alert("Thiếu Sản phẩm gốc hoặc Mã QR!");
      return;
    }
    try {
      const payload = {
        thong_tin_sp_id: parseInt(unitForm.thong_tin_sp_id),
        so_serial: unitForm.serial,
        ma_qr: unitForm.ma_qr,
        cap_chat_luong: parseInt(unitForm.cap_chat_luong),
        kho_id_hien_tai: unitForm.kho_id_hien_tai
          ? parseInt(unitForm.kho_id_hien_tai)
          : null,
        don_vi_quan_ly_id: unitForm.don_vi_quan_ly_id
          ? parseInt(unitForm.don_vi_quan_ly_id)
          : null,
        trang_thai: unitForm.trang_thai,
      };

      if (editingUnitId) {
        await sanPhamService.updateTrangBiThucTe(editingUnitId, payload);
      } else {
        await sanPhamService.createTrangBiThucTe(payload);
      }
      setUnitModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Có lỗi xảy ra khi lưu cá thể.");
    }
  };

  const handleDeleteUnit = async (id: number) => {
    if (confirm("Xóa cá thể vật lý này khỏi hệ thống?")) {
      try {
        await sanPhamService.deleteTrangBiThucTe(id);
        fetchData();
      } catch (error) {
        alert("Lỗi xóa cá thể.");
      }
    }
  };

  // ================= LỌC & MAP DATA RENDER =================
  const flatUnits = units.filter((u) => {
    if (filterStatus !== "ALL" && u.trang_thai !== filterStatus) return false;
    if (
      filterKho !== "ALL" &&
      u.kho_id_hien_tai?.toString() !== filterKho.toString()
    )
      return false;
    if (search) {
      const sp = sanPhams.find((s) => s.id === u.thong_tin_sp_id);
      const term = search.toLowerCase();
      if (
        !u.serial?.toLowerCase().includes(term) &&
        !u.ma_qr?.toLowerCase().includes(term) &&
        !(sp?.ten_san_pham || "").toLowerCase().includes(term)
      )
        return false;
    }
    return true;
  });

  const spGroups = sanPhams
    .map((sp) => {
      const spUnits = units.filter((u) => {
        if (u.trang_bi_id !== sp.id) return false;
        if (filterStatus !== "ALL" && u.trang_thai !== filterStatus)
          return false;
        if (
          filterKho !== "ALL" &&
          u.kho_id_hien_tai?.toString() !== filterKho.toString()
        )
          return false;
        return true;
      });
      if (spUnits.length === 0) return null;

      const khoSet = [
        ...new Set(spUnits.map((u) => getKhoName(u.kho_id_hien_tai))),
      ];
      const counts: any = { TRONG_KHO: 0, DANG_MUON: 0, BAO_DUONG: 0 };
      spUnits.forEach((u) => {
        if (counts[u.trang_thai] !== undefined) counts[u.trang_thai]++;
      });
      return { ...sp, spUnits, khoSet, counts, total: spUnits.length };
    })
    .filter(Boolean);

  const STATUS_FILTER_OPTS = [
    { v: "ALL", l: "TẤT CẢ" },
    { v: "TRONG_KHO", l: "TRONG KHO" },
    { v: "DANG_MUON", l: "ĐANG MƯỢN" },
    { v: "BAO_DUONG", l: "BẢO DƯỠNG" },
  ];

  return (
    <div>
      {selectedUnitDrawer && (
        <UnitDetailDrawer
          unit={selectedUnitDrawer}
          sanPhams={sanPhams}
          onClose={() => setSelectedUnitDrawer(null)}
        />
      )}

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
            fontFamily: "'Courier New',monospace",
            letterSpacing: 2,
          }}
        >
          QUẢN LÝ TRANG BỊ
        </h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => handleOpenSpModal()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
              color: "#fff",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            <Icon name="plus" size={14} /> THÊM SP GỐC
          </button>
          <button
            onClick={() => handleOpenUnitModal()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg,#00D4AA,#0EA5E9)",
              color: "#0F172A",
              fontWeight: 700,
              fontSize: 12,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            <Icon name="plus" size={14} /> THÊM CÁ THỂ
          </button>
        </div>
      </div>

      {/* Tabs Menu */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 24,
          background: "rgba(15,23,42,0.8)",
          border: "1px solid rgba(100,116,139,0.15)",
          borderRadius: 10,
          padding: 4,
          width: "fit-content",
        }}
      >
        {[
          { v: "grouped", l: "Thống kê theo Loại" },
          { v: "flat", l: "Danh sách Cá thể vật lý" },
          { v: "sanpham", l: "Danh mục Sản phẩm gốc" },
        ].map((m) => (
          <button
            key={m.v}
            onClick={() => setViewMode(m.v)}
            style={{
              padding: "8px 20px",
              borderRadius: 7,
              border: "none",
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              transition: "all 0.15s",
              background:
                viewMode === m.v ? "rgba(0,212,170,0.15)" : "transparent",
              color: viewMode === m.v ? "#00D4AA" : "#64748B",
            }}
          >
            {m.l}
          </button>
        ))}
      </div>

      {(viewMode === "grouped" || viewMode === "flat") && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4,1fr)",
            gap: 12,
            marginBottom: 20,
          }}
        >
          {[
            { l: "Tổng cá thể", v: units.length, c: "#00D4AA" },
            {
              l: "Trong kho",
              v: units.filter((u) => u.trang_thai === "TRONG_KHO").length,
              c: "#3B82F6",
            },
            {
              l: "Đang mượn",
              v: units.filter((u) => u.trang_thai === "DANG_MUON").length,
              c: "#F59E0B",
            },
            {
              l: "Bảo dưỡng",
              v: units.filter((u) => u.trang_thai === "BAO_DUONG").length,
              c: "#EF4444",
            },
          ].map((s) => (
            <div
              key={s.l}
              style={{
                background: "rgba(15,23,42,0.8)",
                border: `1px solid ${s.c}22`,
                borderRadius: 10,
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                position: "relative",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: `linear-gradient(to right,${s.c},transparent)`,
                }}
              />
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: s.c,
                  fontFamily: "'Courier New',monospace",
                }}
              >
                {s.v}
              </span>
              <span style={{ fontSize: 11, color: "#64748B", lineHeight: 1.4 }}>
                {s.l}
              </span>
            </div>
          ))}
        </div>
      )}

      {(viewMode === "grouped" || viewMode === "flat") && (
        <div
          style={{
            display: "flex",
            gap: 10,
            marginBottom: 18,
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <span
              style={{
                position: "absolute",
                left: 11,
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
              placeholder="Tìm QR, serial..."
              style={{
                width: "100%",
                paddingLeft: 34,
                paddingRight: 12,
                paddingTop: 9,
                paddingBottom: 9,
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(100,116,139,0.25)",
                borderRadius: 8,
                color: "#E2E8F0",
                fontSize: 13,
                outline: "none",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {STATUS_FILTER_OPTS.map((f) => (
              <button
                key={f.v}
                onClick={() => setFilterStatus(f.v)}
                style={{
                  padding: "9px 13px",
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  background:
                    filterStatus === f.v
                      ? "rgba(0,212,170,0.15)"
                      : "rgba(15,23,42,0.8)",
                  border: `1px solid ${filterStatus === f.v ? "#00D4AA" : "rgba(100,116,139,0.25)"}`,
                  color: filterStatus === f.v ? "#00D4AA" : "#64748B",
                }}
              >
                {f.l}
              </button>
            ))}
          </div>
          <select
            value={filterKho}
            onChange={(e) => setFilterKho(e.target.value)}
            style={{
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 12,
              background: "rgba(15,23,42,0.9)",
              border: "1px solid rgba(100,116,139,0.25)",
              color: "#94A3B8",
              outline: "none",
              cursor: "pointer",
            }}
          >
            <option value="ALL">Tất cả kho</option>
            {khos.map((k) => (
              <option key={k.id} value={k.id}>
                {k.ten_kho}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* 1. VIEW SẢN PHẨM GỐC */}
      {viewMode === "sanpham" && (
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
                  borderBottom: "1px solid rgba(167,139,250,0.3)",
                }}
              >
                {[
                  "Mã Sản Phẩm",
                  "Tên Sản Phẩm",
                  "Danh mục (Loại)",
                  "Đơn Vị Tính",
                  "Thể tích", // <- HIỂN THỊ CỘT THỂ TÍCH MỚI
                  "Thao tác",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "13px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#A78BFA",
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
              {sanPhams.map((sp) => (
                <tr
                  key={sp.id}
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
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#A78BFA",
                      fontWeight: 700,
                    }}
                  >
                    {sp.ma_san_pham}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 13,
                      color: "#E2E8F0",
                      fontWeight: 500,
                    }}
                  >
                    {sp.ten_san_pham}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#94A3B8",
                    }}
                  >
                    {sp.ten_danh_muc || "Chưa phân loại"}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#E2E8F0",
                    }}
                  >
                    {sp.don_vi_tinh}
                  </td>
                  <td
                    style={{
                      padding: "12px 16px",
                      fontSize: 12,
                      color: "#E2E8F0",
                    }}
                  >
                    {sp.the_tich || 0} {/* <- GIÁ TRỊ THỂ TÍCH */}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button
                        onClick={() => handleOpenSpModal(sp)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: "1px solid #F59E0B33",
                          background: "#F59E0B11",
                          color: "#F59E0B",
                          cursor: "pointer",
                        }}
                      >
                        <Icon name="edit" size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteSp(sp.id)}
                        style={{
                          padding: 6,
                          borderRadius: 6,
                          border: "1px solid #EF444433",
                          background: "#EF444411",
                          color: "#EF4444",
                          cursor: "pointer",
                        }}
                      >
                        <Icon name="trash" size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. VIEW FLAT (CÁ THỂ) */}
      {viewMode === "flat" && (
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
                  "Mã QR",
                  "Tên Sản Phẩm",
                  "Serial",
                  "Kho",
                  "Cấp CL",
                  "Trạng thái",
                  "Thao tác",
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
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {flatUnits.map((unit) => {
                const sp = sanPhams.find((s) => s.id === unit.trang_bi_id);

                const khoName = unit.kho;
                return (
                  <tr
                    key={unit.id}
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
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#00D4AA",
                        fontFamily: "'Courier New',monospace",
                        fontWeight: 600,
                      }}
                    >
                      {unit.ma_ca_the}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#E2E8F0",
                          fontWeight: 500,
                        }}
                      >
                        {unit?.ten_san_pham}
                      </div>
                      <div
                        style={{ fontSize: 11, color: "#475569", marginTop: 1 }}
                      >
                        {sp?.ma_san_pham}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "12px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {unit.serial || "—"}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <span
                        style={{
                          padding: "3px 9px",
                          borderRadius: 20,
                          fontSize: 11,
                          fontWeight: 600,
                          background: "rgba(14,165,233,0.1)",
                          color: "#0EA5E9",
                          border: "1px solid rgba(14,165,233,0.2)",
                        }}
                      >
                        {khoName}
                      </span>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <QualityStars cap={unit.cap_chat_luong} />
                        <span
                          style={{
                            fontSize: 10,
                            color: CAP_COLORS_EQ[unit.cap_chat_luong - 1],
                            fontWeight: 700,
                          }}
                        >
                          C{unit.cap_chat_luong}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <StatusBadge status={unit.trang_thai} />
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <QRPreviewSPButton qr={unit.ma_ca_the} />
                        <QRPreviewButton qr={unit.ma_ca_the} />
                        <button
                          onClick={() => setSelectedUnitDrawer(unit)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: "1px solid #0EA5E933",
                            background: "#0EA5E911",
                            color: "#0EA5E9",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <Icon name="eye" size={13} />
                        </button>
                        <button
                          onClick={() => handleOpenUnitModal(unit)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: "1px solid #F59E0B33",
                            background: "#F59E0B11",
                            color: "#F59E0B",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <Icon name="edit" size={13} />
                        </button>
                        <button
                          onClick={() => handleDeleteUnit(unit.id)}
                          style={{
                            padding: 6,
                            borderRadius: 6,
                            border: "1px solid #EF444433",
                            background: "#EF444411",
                            color: "#EF4444",
                            cursor: "pointer",
                            display: "flex",
                          }}
                        >
                          <Icon name="trash" size={13} />
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

      {/* 3. VIEW GROUPED */}
      {viewMode === "grouped" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {spGroups.map((sp) => {
            const spData = sp as any;
            const isOpen = expandedSp === spData.id;
            return (
              <div
                key={spData.id}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${isOpen ? "rgba(0,212,170,0.35)" : "rgba(100,116,139,0.15)"}`,
                  borderRadius: 12,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <div
                  onClick={() => setExpandedSp(isOpen ? null : spData.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "16px 20px",
                    cursor: "pointer",
                    background: isOpen ? "rgba(0,212,170,0.04)" : "transparent",
                  }}
                >
                  <div
                    style={{
                      color: isOpen ? "#00D4AA" : "#475569",
                      transform: isOpen ? "rotate(90deg)" : "rotate(0deg)",
                    }}
                  >
                    <Icon name="chevron" size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#E2E8F0",
                      }}
                    >
                      {spData.ten_san_pham}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}
                    >
                      Mã gốc:{" "}
                      <span style={{ color: "#00D4AA" }}>
                        {spData.ma_san_pham}
                      </span>
                    </div>
                  </div>
                  <div style={{ textAlign: "center", minWidth: 48 }}>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 900,
                        color: "#00D4AA",
                      }}
                    >
                      {spData.total}
                    </div>
                    <div style={{ fontSize: 9, color: "#475569" }}>Cá thể</div>
                  </div>
                </div>
                {isOpen && (
                  <div style={{ borderTop: "1px solid rgba(0,212,170,0.15)" }}>
                    <table
                      style={{ width: "100%", borderCollapse: "collapse" }}
                    >
                      <thead>
                        <tr style={{ background: "rgba(8,15,30,0.4)" }}>
                          {[
                            "Mã QR",
                            "Serial",
                            "Kho",
                            "Đơn vị q.lý",
                            "Cấp CL",
                            "Trạng thái",
                            "Thao tác",
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
                        {spData.spUnits.map((unit: any) => {
                          const khoName = unit?.kho;
                          const donViName = unit.don_vi_quan_ly;

                          return (
                            <tr
                              key={unit.id}
                              style={{
                                borderTop: "1px solid rgba(100,116,139,0.07)",
                                transition: "background 0.12s",
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
                              <td
                                style={{
                                  padding: "11px 16px",
                                  fontSize: 12,
                                  color: "#00D4AA",
                                  fontFamily: "'Courier New',monospace",
                                  fontWeight: 600,
                                }}
                              >
                                {unit.ma_ca_the}
                              </td>
                              <td
                                style={{
                                  padding: "11px 16px",
                                  fontSize: 12,
                                  color: "#94A3B8",
                                  fontFamily: "'Courier New',monospace",
                                }}
                              >
                                {unit.serial || "—"}
                              </td>
                              <td style={{ padding: "11px 16px" }}>
                                <span
                                  style={{
                                    padding: "3px 9px",
                                    borderRadius: 20,
                                    fontSize: 11,
                                    fontWeight: 600,
                                    background: "rgba(14,165,233,0.1)",
                                    color: "#0EA5E9",
                                    border: "1px solid rgba(14,165,233,0.2)",
                                  }}
                                >
                                  {khoName}
                                </span>
                              </td>
                              <td
                                style={{
                                  padding: "11px 16px",
                                  fontSize: 12,
                                  color: "#64748B",
                                }}
                              >
                                {donViName}
                              </td>
                              <td style={{ padding: "11px 16px" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <QualityStars cap={unit.cap_chat_luong} />
                                  <span
                                    style={{
                                      fontSize: 10,
                                      color:
                                        CAP_COLORS_EQ[unit.cap_chat_luong - 1],
                                      fontWeight: 700,
                                    }}
                                  >
                                    C{unit.cap_chat_luong}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: "11px 16px" }}>
                                <StatusBadge status={unit.trang_thai} />
                              </td>
                              <td style={{ padding: "11px 16px" }}>
                                <div style={{ display: "flex", gap: 5 }}>
                                  <button
                                    onClick={() => setSelectedUnitDrawer(unit)}
                                    style={{
                                      padding: 6,
                                      borderRadius: 6,
                                      border: "1px solid #0EA5E933",
                                      background: "#0EA5E911",
                                      color: "#0EA5E9",
                                      cursor: "pointer",
                                      display: "flex",
                                    }}
                                  >
                                    <Icon name="eye" size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleOpenUnitModal(unit)}
                                    style={{
                                      padding: 6,
                                      borderRadius: 6,
                                      border: "1px solid #F59E0B33",
                                      background: "#F59E0B11",
                                      color: "#F59E0B",
                                      cursor: "pointer",
                                      display: "flex",
                                    }}
                                  >
                                    <Icon name="edit" size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUnit(unit.id)}
                                    style={{
                                      padding: 6,
                                      borderRadius: 6,
                                      border: "1px solid #EF444433",
                                      background: "#EF444411",
                                      color: "#EF4444",
                                      cursor: "pointer",
                                      display: "flex",
                                    }}
                                  >
                                    <Icon name="trash" size={13} />
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
              </div>
            );
          })}
        </div>
      )}

      {/* ================= MODAL SẢN PHẨM GỐC ================= */}
      <Modal
        isOpen={isSpModalOpen}
        onClose={() => setSpModalOpen(false)}
        title={editingSpId ? "CẬP NHẬT SẢN PHẨM GỐC" : "THÊM SẢN PHẨM MỚI"}
        accentColor="#A78BFA"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div
            style={{ display: "grid", gridTemplateColumns: "2fr 2fr", gap: 16 }}
          >
            <FormGroup label="Mã Sản Phẩm (Model)">
              <Input
                value={spForm.ma_san_pham}
                onChange={(e: any) =>
                  setSpForm({ ...spForm, ma_san_pham: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="Tên Trang Bị">
              <Input
                value={spForm.ten_san_pham}
                onChange={(e: any) =>
                  setSpForm({ ...spForm, ten_san_pham: e.target.value })
                }
              />
            </FormGroup>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: 16,
            }}
          >
            <FormGroup label="Danh mục">
              <Select
                value={spForm.danh_muc_id}
                onChange={(e: any) =>
                  setSpForm({ ...spForm, danh_muc_id: e.target.value })
                }
              >
                <option value="">-- Chưa phân loại --</option>
                {renderTreeOptions(categoryTree)}
              </Select>
            </FormGroup>
            <FormGroup label="Đơn vị tính">
              <Select
                value={spForm.don_vi_tinh}
                onChange={(e: any) =>
                  setSpForm({ ...spForm, don_vi_tinh: e.target.value })
                }
              >
                <option value="Cái">Cái</option>
                <option value="Bộ">Bộ</option>
                <option value="Hệ thống">Hệ thống</option>
                <option value="Thùng">Thùng</option>
              </Select>
            </FormGroup>
            {/* THÊM TRƯỜNG THỂ TÍCH Ở ĐÂY */}
            <FormGroup label="Thể tích (m³)">
              <Input
                type="number"
                value={spForm.the_tich}
                onChange={(e: any) =>
                  setSpForm({ ...spForm, the_tich: e.target.value })
                }
                placeholder="VD: 0.5"
              />
            </FormGroup>
          </div>
          <FormGroup label="Thông số kỹ thuật">
            <Input
              value={spForm.thong_so_ky_thuat}
              onChange={(e: any) =>
                setSpForm({ ...spForm, thong_so_ky_thuat: e.target.value })
              }
            />
          </FormGroup>
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setSpModalOpen(false)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "1px solid rgba(100,116,139,0.3)",
              background: "transparent",
              color: "#E2E8F0",
              cursor: "pointer",
            }}
          >
            HỦY
          </button>
          <button
            onClick={handleSaveSp}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
              color: "#fff",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {editingSpId ? "CẬP NHẬT" : "LƯU"}
          </button>
        </div>
      </Modal>

      {/* ================= MODAL CÁ THỂ VẬT LÝ ================= */}
      <Modal
        isOpen={isUnitModalOpen}
        onClose={() => setUnitModalOpen(false)}
        title={editingUnitId ? "CẬP NHẬT CÁ THỂ" : "NHẬP CÁ THỂ MỚI"}
        accentColor="#00D4AA"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <FormGroup label="Sản phẩm gốc">
            <Select
              value={unitForm.thong_tin_sp_id}
              onChange={(e: any) =>
                setUnitForm({ ...unitForm, thong_tin_sp_id: e.target.value })
              }
            >
              <option value="">-- Chọn sản phẩm gốc --</option>
              {sanPhams.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.ma_san_pham} - {s.ten_san_pham}
                </option>
              ))}
            </Select>
          </FormGroup>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Mã QR Hệ thống">
              <Input
                value={unitForm.ma_qr}
                onChange={(e: any) =>
                  setUnitForm({ ...unitForm, ma_qr: e.target.value })
                }
              />
            </FormGroup>
            <FormGroup label="Số Serial (NSX)">
              <Input
                value={unitForm.serial}
                onChange={(e: any) =>
                  setUnitForm({ ...unitForm, serial: e.target.value })
                }
                placeholder="Không bắt buộc"
              />
            </FormGroup>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Kho lưu trữ">
              <Select
                value={unitForm.kho_id_hien_tai}
                onChange={(e: any) =>
                  setUnitForm({ ...unitForm, kho_id_hien_tai: e.target.value })
                }
              >
                <option value="">-- Chọn kho --</option>
                {khos.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.ten_kho}
                  </option>
                ))}
              </Select>
            </FormGroup>
            <FormGroup label="Đơn vị quản lý">
              <Select
                value={unitForm.don_vi_quan_ly_id}
                onChange={(e: any) =>
                  setUnitForm({
                    ...unitForm,
                    don_vi_quan_ly_id: e.target.value,
                  })
                }
              >
                <option value="">-- Chọn đơn vị --</option>
                {renderTreeOptions(donViTree)}
              </Select>
            </FormGroup>
          </div>

          <div
            style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
          >
            <FormGroup label="Cấp chất lượng">
              <Select
                value={unitForm.cap_chat_luong}
                onChange={(e: any) =>
                  setUnitForm({ ...unitForm, cap_chat_luong: e.target.value })
                }
              >
                <option value="1">Cấp 1 (Rất tốt)</option>
                <option value="2">Cấp 2 (Tốt)</option>
                <option value="3">Cấp 3 (Trung bình)</option>
                <option value="4">Cấp 4 (Kém)</option>
              </Select>
            </FormGroup>
            <FormGroup label="Trạng thái">
              <Select
                value={unitForm.trang_thai}
                onChange={(e: any) =>
                  setUnitForm({ ...unitForm, trang_thai: e.target.value })
                }
              >
                <option value="TRONG_KHO">Trong kho</option>
                <option value="DANG_MUON">Đang mượn</option>
                <option value="BAO_DUONG">Đang bảo dưỡng</option>
              </Select>
            </FormGroup>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setUnitModalOpen(false)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "1px solid rgba(100,116,139,0.3)",
              background: "transparent",
              color: "#E2E8F0",
              cursor: "pointer",
            }}
          >
            HỦY
          </button>
          <button
            onClick={handleSaveUnit}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
              color: "#0F172A",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            {editingUnitId ? "CẬP NHẬT" : "LƯU CÁ THỂ"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
