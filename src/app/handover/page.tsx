/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import {
  QRPreviewButton,
  QRPreviewSPButton,
  StatusBadge,
} from "@/src/components/ui/Shared";

// --- IMPORTS SERVICES ---
import {
  phieuBanGiaoService,
  PhieuBanGiao,
} from "@/src/services/phieuBanGiao.service";
import { donViService } from "@/src/services/donVi.service";
import { khoService } from "@/src/services/kho.service";
import { userService } from "@/src/services/user.service";
import { sanPhamService } from "@/src/services/sanPham.service";

export default function BanGiaoPage() {
  // --- STATE DATA MASTER ---
  const [banGiaos, setBanGiaos] = useState<PhieuBanGiao[]>([]);
  const [donVis, setDonVis] = useState<any[]>([]);
  const [khos, setKhos] = useState<any[]>([]); // Danh sách tất cả kho (dùng để hiển thị ở bảng)
  const [users, setUsers] = useState<any[]>([]);

  // --- STATE LIST KHO THEO ĐƠN VỊ CHỌN ---
  const [khoNguonList, setKhoNguonList] = useState<any[]>([]);
  const [khoDichList, setKhoDichList] = useState<any[]>([]);

  // --- STATE UI & TABS ---
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("list");
  const [modal, setModal] = useState<string | null>(null);
  const [selected, setSelected] = useState<any>(null); // Chi tiết phiếu đang xem

  const [search, setSearch] = useState("");
  const [filterLoai, setFilterLoai] = useState("ALL");
  const [filterTT, setFilterTT] = useState("ALL");

  // --- STATE FORM TẠO PHIẾU ---
  const [form, setForm] = useState({
    ma_phieu: `BG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    loai_phieu: "BAN_GIAO",
    tu_don_vi_id: "",
    den_don_vi_id: "",
    tu_kho_id: "",
    den_kho_id: "",
    nguoi_giao_id: "",
    nguoi_nhan_id: "",
    ngay_thuc_hien: new Date().toISOString().split("T")[0],
    ghi_chu: "",
  });

  // State chuyên dùng cho phần chọn Trang bị
  const [availableEquipments, setAvailableEquipments] = useState<any[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<any[]>([]);
  const [tbSearch, setTbSearch] = useState("");

  const f = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  // ==================== FETCH MASTER DATA ====================
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [listPhieu, listDonVi, listKho, listUser] = await Promise.all([
        phieuBanGiaoService.getDanhSachPhieu(),
        donViService.getAll(),
        khoService.getAll(),
        userService.getAll(),
      ]);
      setBanGiaos(listPhieu);
      setDonVis(listDonVi);
      setKhos(listKho);
      setUsers(listUser);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HELPERS ====================
  const LOAI_CFG: any = {
    BAN_GIAO: {
      label: "Bàn giao",
      color: "#00D4AA",
      bg: "rgba(0,212,170,0.12)",
      border: "rgba(0,212,170,0.3)",
      icon: "handover",
    },
    CHUYEN_KHO: {
      label: "Chuyển kho",
      color: "#0EA5E9",
      bg: "rgba(14,165,233,0.12)",
      border: "rgba(14,165,233,0.3)",
      icon: "swap",
    },
  };

  const getDVName = (id: any) =>
    donVis.find((d) => d.id == id)?.ten_don_vi || "—";
  const getKhoName = (id: any) => khos.find((k) => k.id == id)?.ten_kho || "—";
  const getUserName = (id: any) =>
    users.find((u) => u.id == id)?.full_name || "—";

  // ==================== THỐNG KÊ & LỌC ====================
  const stats = [
    { l: "Tổng phiếu", v: banGiaos.length, c: "#00D4AA" },
    {
      l: "Chờ duyệt",
      v: banGiaos.filter((r) => r.trang_thai === "CHO_DUYET").length,
      c: "#A78BFA",
    },
    {
      l: "Đang xử lý",
      v: banGiaos.filter((r) => r.trang_thai === "DANG_XU_LY").length,
      c: "#F59E0B",
    },
    {
      l: "Hoàn thành",
      v: banGiaos.filter((r) => r.trang_thai === "HOAN_THANH").length,
      c: "#3B82F6",
    },
  ];

  const filteredPhieus = banGiaos.filter((r) => {
    if (filterLoai !== "ALL" && r.loai_phieu !== filterLoai) return false;
    if (filterTT !== "ALL" && r.trang_thai !== filterTT) return false;
    if (search && !r.ma_phieu?.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  // ==================== LOGIC CHỌN ĐƠN VỊ VÀ KHO ====================

  // Khi chọn Đơn vị nguồn -> Tải danh sách kho tương ứng
  const handleTuDonViChange = async (val: string) => {
    setForm((p) => ({ ...p, tu_don_vi_id: val, tu_kho_id: "" })); // Reset kho nguồn
    setSelectedEquipments([]);
    setAvailableEquipments([]);

    if (val) {
      try {
        const khoList = await khoService.getAllByDonVi(Number(val));
        setKhoNguonList(khoList);
      } catch (err) {
        console.error("Lỗi khi tải kho nguồn", err);
        setKhoNguonList([]);
      }
    } else {
      setKhoNguonList([]);
    }
  };

  // Khi chọn Đơn vị đích -> Tải danh sách kho tương ứng
  const handleDenDonViChange = async (val: string) => {
    setForm((p) => ({ ...p, den_don_vi_id: val, den_kho_id: "" })); // Reset kho đích
    if (val) {
      try {
        const khoList = await khoService.getAllByDonVi(Number(val));
        setKhoDichList(khoList);
      } catch (err) {
        console.error("Lỗi khi tải kho đích", err);
        setKhoDichList([]);
      }
    } else {
      setKhoDichList([]);
    }
  };

  // Khi chọn Kho Nguồn -> Tải danh sách thiết bị
  const handleSourceKhoChange = async (val: string) => {
    setForm((p) => ({ ...p, tu_kho_id: val }));
    setSelectedEquipments([]);

    if (val) {
      try {
        const eq = await sanPhamService.getTrangBiThucTeTheoKho(Number(val));
        // Lọc thiết bị TRONG_KHO
        setAvailableEquipments(eq.filter((e) => e.trang_thai === "TRONG_KHO"));
      } catch (err) {
        console.error("Không lấy được danh sách thiết bị kho", err);
      }
    } else {
      setAvailableEquipments([]);
    }
  };

  const visibleEquipments = availableEquipments.filter((tb) => {
    if (selectedEquipments.find((s) => s.id === tb.id)) return false;
    if (tbSearch) {
      const term = tbSearch.toLowerCase();
      return (
        tb.ma_qr?.toLowerCase().includes(term) ||
        tb.so_serial?.toLowerCase().includes(term) ||
        tb.ten_san_pham?.toLowerCase().includes(term)
      );
    }
    return true;
  });

  // ==================== LOGIC TƯƠNG TÁC API (CRUD) ====================
  const createPhieu = async () => {
    if (!form.den_don_vi_id && form.loai_phieu === "BAN_GIAO") {
      alert("Đơn vị nhận (Đích) không được để trống!");
      return;
    }
    if (selectedEquipments.length === 0) {
      alert("Vui lòng chọn ít nhất 1 trang bị để luân chuyển!");
      return;
    }

    try {
      const payload: any = {
        ma_phieu: form.ma_phieu,
        loai_phieu: form.loai_phieu,
        tu_don_vi_id: form.tu_don_vi_id ? parseInt(form.tu_don_vi_id) : null,
        den_don_vi_id: form.den_don_vi_id ? parseInt(form.den_don_vi_id) : null,
        tu_kho_id: form.tu_kho_id ? parseInt(form.tu_kho_id) : null,
        den_kho_id: form.den_kho_id ? parseInt(form.den_kho_id) : null,
        nguoi_giao_id: form.nguoi_giao_id ? parseInt(form.nguoi_giao_id) : null,
        nguoi_nhan_id: form.nguoi_nhan_id ? parseInt(form.nguoi_nhan_id) : null,
        ngay_thuc_hien: form.ngay_thuc_hien,
        ghi_chu: form.ghi_chu,
        trang_thai: "CHO_DUYET",
        danh_sach_thiet_bi_ids: selectedEquipments.map((tb) => tb.id),
      };

      await phieuBanGiaoService.createPhieu(payload);

      setForm({
        ...form,
        ma_phieu: `BG-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        ghi_chu: "",
      });
      setSelectedEquipments([]);
      setTbSearch("");
      setTab("list");

      fetchInitialData();
    } catch (error: any) {
      alert("Lỗi khi tạo phiếu: " + (error.message || "Unknown error"));
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await phieuBanGiaoService.updatePhieu(id, { trang_thai: status as any });
      fetchInitialData();
      setModal(null);
    } catch (error) {
      alert("Lỗi cập nhật trạng thái");
    }
  };

  const deleteRow = async (id: number) => {
    try {
      await phieuBanGiaoService.deletePhieu(id);
      fetchInitialData();
      setModal(null);
    } catch (error) {
      alert("Lỗi khi xóa phiếu");
    }
  };

  const handleViewDetail = async (row: any) => {
    try {
      const details = await phieuBanGiaoService.getChiTietPhieu(row.id);
      setSelected(details);
      setModal("view");
    } catch (error) {
      alert("Lỗi khi tải chi tiết phiếu");
    }
  };

  // ==================== RENDER HELPERS ====================
  const sBdr = (c: string, bg: string, border: string) => ({
    padding: "3px 10px",
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: bg,
    color: c,
    border: `1px solid ${border}`,
    letterSpacing: "0.03em",
    textTransform: "uppercase" as const,
  });
  const inp = (val: string, onChange: any, ph: string, type = "text") => (
    <input
      type={type}
      value={val}
      onChange={(e) => onChange(e.target.value)}
      placeholder={ph}
      style={{
        width: "100%",
        padding: "10px 14px",
        background: "rgba(30,41,59,0.7)",
        border: "1px solid rgba(100,116,139,0.3)",
        borderRadius: 8,
        color: "#E2E8F0",
        fontSize: 13,
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
  const sel = (
    val: string,
    onChange: any,
    options: { v: string | number; l: string }[],
  ) => (
    <select
      value={val}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "10px 14px",
        background: "rgba(30,41,59,0.9)",
        border: "1px solid rgba(100,116,139,0.3)",
        borderRadius: 8,
        color: "#E2E8F0",
        fontSize: 13,
        outline: "none",
        boxSizing: "border-box",
        cursor: "pointer",
      }}
    >
      <option value="">-- Bỏ qua / Không chọn --</option>
      {options.map((o) => (
        <option key={o.v} value={o.v}>
          {o.l}
        </option>
      ))}
    </select>
  );
  const lbl = (label: string, children: any) => (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          fontSize: 11,
          color: "#64748B",
          fontWeight: 600,
          letterSpacing: 1,
          textTransform: "uppercase",
          marginBottom: 6,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );

  if (isLoading) {
    return (
      <div style={{ color: "#E2E8F0", padding: 20 }}>Đang tải dữ liệu...</div>
    );
  }

  return (
    <div>
      {/* Modal View Detail */}
      {modal === "view" && selected && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setModal(null)}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8,15,30,0.88)",
              backdropFilter: "blur(6px)",
            }}
          />
          <div
            style={{
              position: "relative",
              width: 650,
              maxHeight: "88vh",
              overflow: "auto",
              background: "linear-gradient(160deg,#0D1626,#080F1E)",
              border: "1px solid rgba(0,212,170,0.3)",
              borderRadius: 16,
              padding: 32,
              zIndex: 1,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 22,
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
                  CHI TIẾT PHIẾU
                </div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "#E2E8F0",
                    fontFamily: "'Courier New',monospace",
                  }}
                >
                  {selected.ma_phieu}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    display: "flex",
                    gap: 8,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={sBdr(
                      LOAI_CFG[selected.loai_phieu]?.color,
                      LOAI_CFG[selected.loai_phieu]?.bg,
                      LOAI_CFG[selected.loai_phieu]?.border,
                    )}
                  >
                    {LOAI_CFG[selected.loai_phieu]?.label}
                  </span>
                  <StatusBadge status={selected.trang_thai} />
                </div>
              </div>
              <button
                onClick={() => setModal(null)}
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

            {/* ROUTE VISUALIZATION */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr auto 1fr",
                gap: 16,
                marginBottom: 24,
                padding: 20,
                background: "rgba(0,212,170,0.03)",
                border: "1px solid rgba(0,212,170,0.15)",
                borderRadius: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#EF4444",
                    fontWeight: 700,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  🔴 NGUỒN GIAO
                </div>
                <div
                  style={{ fontSize: 13, color: "#E2E8F0", marginBottom: 4 }}
                >
                  🏠 ĐV:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {getDVName(selected.tu_don_vi_id)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#E2E8F0" }}>
                  📦 Kho:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {getKhoName(selected.tu_kho_id)}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Icon
                  name={
                    LOAI_CFG[
                      selected.tu_don_vi_id === selected.den_don_vi_id
                        ? "CHUYEN_KHO"
                        : "BAN_GIAO"
                    ]?.icon
                  }
                  size={24}
                />
                <div
                  style={{
                    width: 60,
                    height: 2,
                    background: "linear-gradient(to right,#EF4444,#00D4AA)",
                    marginTop: 8,
                  }}
                />
              </div>
              <div>
                <div
                  style={{
                    fontSize: 10,
                    color: "#00D4AA",
                    fontWeight: 700,
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  🟢 ĐÍCH NHẬN
                </div>
                <div
                  style={{ fontSize: 13, color: "#E2E8F0", marginBottom: 4 }}
                >
                  🏠 ĐV:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {getDVName(selected.den_don_vi_id)}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: "#E2E8F0" }}>
                  📦 Kho:{" "}
                  <span style={{ fontWeight: 600 }}>
                    {getKhoName(selected.den_kho_id)}
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                ["Người giao", getUserName(selected.nguoi_ban_giao_id)],
                ["Người nhận", getUserName(selected.nguoi_nhan_id)],
                [
                  "Ngày thực hiện",
                  new Date(selected.ngay_ban_giao).toLocaleDateString(),
                ],
                ["Ghi chú", selected.loai_phieu || "—"],
              ].map(([l, v]) => (
                <div
                  key={l}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    background: "rgba(30,41,59,0.5)",
                    borderRadius: 8,
                    borderLeft: "3px solid rgba(0,212,170,0.25)",
                  }}
                >
                  <span style={{ fontSize: 12, color: "#64748B" }}>{l}</span>
                  <span
                    style={{ fontSize: 13, fontWeight: 600, color: "#E2E8F0" }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                fontSize: 11,
                color: "#64748B",
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              CHI TIẾT TRANG BỊ ({selected.danh_sach_thiet_bi?.length || 0})
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 6,
                marginBottom: 20,
              }}
            >
              {selected.danh_sach_thiet_bi?.map((tb: any, idx: number) => (
                <span
                  key={idx}
                  style={{
                    padding: "4px 10px",
                    background: "rgba(14,165,233,0.1)",
                    border: "1px solid rgba(14,165,233,0.3)",
                    color: "#0EA5E9",
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  {tb.ma_qr || `TB : ${tb.ten_san_pham}`}
                  <QRPreviewSPButton qr={tb.ma_qr} />
                  <QRPreviewButton qr={tb.ma_qr} />
                </span>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              {selected.trang_thai === "CHO_DUYET" && (
                <>
                  <button
                    onClick={() => updateStatus(selected.id, "DANG_XU_LY")}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      borderRadius: 8,
                      border: "none",
                      background: "linear-gradient(135deg,#00D4AA,#0EA5E9)",
                      color: "#0F172A",
                      fontSize: 13,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Phê duyệt
                  </button>
                  <button
                    onClick={() => updateStatus(selected.id, "TU_CHOI")}
                    style={{
                      flex: 1,
                      padding: "11px 0",
                      borderRadius: 8,
                      border: "1px solid rgba(239,68,68,0.4)",
                      background: "rgba(239,68,68,0.08)",
                      color: "#EF4444",
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Từ chối
                  </button>
                </>
              )}
              {selected.trang_thai === "DANG_XU_LY" && (
                <button
                  onClick={() => updateStatus(selected.id, "HOAN_THANH")}
                  style={{
                    flex: 1,
                    padding: "11px 0",
                    borderRadius: 8,
                    border: "none",
                    background: "linear-gradient(135deg,#00D4AA,#34D399)",
                    color: "#0F172A",
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  Xác nhận hoàn thành
                </button>
              )}
              {(selected.trang_thai === "CHO_DUYET" ||
                selected.trang_thai === "TU_CHOI") && (
                <button
                  onClick={() => deleteRow(selected.id)}
                  style={{
                    padding: "11px 16px",
                    borderRadius: 8,
                    border: "1px solid rgba(239,68,68,0.3)",
                    background: "rgba(239,68,68,0.06)",
                    color: "#EF4444",
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  <Icon name="trash" size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TABS NAVIGATION */}
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
          LUÂN CHUYỂN TRANG BỊ
        </h2>
        <div
          style={{
            display: "flex",
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.2)",
            borderRadius: 8,
            padding: 3,
          }}
        >
          {[
            { v: "list", l: "Danh sách phiếu" },
            { v: "create", l: "Tạo phiếu mới" },
          ].map((m) => (
            <button
              key={m.v}
              onClick={() => setTab(m.v)}
              style={{
                padding: "7px 16px",
                borderRadius: 6,
                border: "none",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
                background:
                  tab === m.v ? "rgba(0,212,170,0.18)" : "transparent",
                color: tab === m.v ? "#00D4AA" : "#64748B",
              }}
            >
              {m.l}
            </button>
          ))}
        </div>
      </div>

      {/* VIEW DANH SÁCH */}
      {tab === "list" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: 14,
              marginBottom: 20,
            }}
          >
            {stats.map((s) => (
              <div
                key={s.l}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${s.c}33`,
                  borderRadius: 12,
                  padding: "16px 20px",
                }}
              >
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: s.c,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {s.v}
                </div>
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

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
                    "Mã phiếu",
                    "Loại",
                    "Thông tin Nguồn",
                    "Thông tin Đích",
                    "SL",
                    "Trạng thái",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "13px 14px",
                        textAlign: "left",
                        fontSize: 10,
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
                {filteredPhieus.map((row: any) => (
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
                        padding: "13px 14px",
                        fontSize: 12,
                        color: "#00D4AA",
                        fontWeight: 700,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {row.ma_phieu}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "4px 8px",
                          borderRadius: 20,
                          fontSize: 10,
                          fontWeight: 700,
                          background: LOAI_CFG[row.loai_phieu]?.bg,
                          color: LOAI_CFG[row.loai_phieu]?.color,
                        }}
                      >
                        <Icon name={LOAI_CFG[row.loai_phieu]?.icon} size={10} />{" "}
                        {LOAI_CFG[row.loai_phieu]?.label}
                      </span>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>
                        ĐV:{" "}
                        <span style={{ color: "#E2E8F0" }}>
                          {getDVName(row.tu_don_vi_id)}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>
                        Kho:{" "}
                        <span style={{ color: "#0EA5E9" }}>
                          {getKhoName(row.tu_kho_id)}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>
                        ĐV:{" "}
                        <span style={{ color: "#E2E8F0" }}>
                          {getDVName(row.den_don_vi_id)}
                        </span>
                      </div>
                      <div style={{ fontSize: 11, color: "#94A3B8" }}>
                        Kho:{" "}
                        <span style={{ color: "#0EA5E9" }}>
                          {getKhoName(row.den_kho_id)}
                        </span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "13px 14px",
                        fontSize: 14,
                        fontWeight: 700,
                        color: "#E2E8F0",
                      }}
                    >
                      {row.so_luong || 0}
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <StatusBadge status={row.trang_thai} />
                    </td>
                    <td style={{ padding: "13px 14px" }}>
                      <button
                        onClick={() => handleViewDetail(row)}
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
                    </td>
                  </tr>
                ))}
                {filteredPhieus.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        padding: 30,
                        textAlign: "center",
                        color: "#64748B",
                      }}
                    >
                      Chưa có dữ liệu phiếu
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* VIEW TẠO PHIẾU */}
      {tab === "create" && (
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.15)",
            borderRadius: 14,
            padding: 28,
            maxWidth: 900,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              color: "#00D4AA",
              letterSpacing: 2,
              marginBottom: 22,
            }}
          >
            TẠO PHIẾU ĐIỀU ĐỘNG / BÀN GIAO
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {lbl(
              "Mã Phiếu",
              inp(form.ma_phieu, f("ma_phieu"), "Mã phiếu tự động..."),
            )}

            {/* {lbl(
              "Mục đích / Loại phiếu",
              sel(form.loai_phieu, f("loai_phieu"), [
                { v: "BAN_GIAO", l: "Bàn giao thiết bị giữa các Đơn Vị" },
                { v: "CHUYEN_KHO", l: "Chuyển vật tư nội bộ giữa các Kho" },
              ]),
            )} */}

            {/* BOX NGUỒN - ĐÍCH */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
              }}
            >
              {/* Cột Nguồn */}
              <div
                style={{
                  padding: 20,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 12,
                  border: "1px dashed rgba(239,68,68,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#EF4444",
                    fontWeight: 700,
                    marginBottom: 16,
                    letterSpacing: 1,
                  }}
                >
                  🔴 BÊN GIAO (NGUỒN)
                </div>
                {lbl(
                  "Từ Đơn vị",
                  <select
                    value={form.tu_don_vi_id}
                    onChange={(e) => handleTuDonViChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(30,41,59,0.9)",
                      border: "1px solid rgba(100,116,139,0.3)",
                      borderRadius: 8,
                      color: "#E2E8F0",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Chọn Đơn vị Nguồn --</option>
                    {donVis.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.ten_don_vi}
                      </option>
                    ))}
                  </select>,
                )}

                {/* Chọn Kho Nguồn => Load Thiết Bị Tương Ứng */}
                {lbl(
                  "Từ Kho (*)",
                  <select
                    value={form.tu_kho_id}
                    onChange={(e) => handleSourceKhoChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(30,41,59,0.9)",
                      border: "1px solid rgba(100,116,139,0.3)",
                      borderRadius: 8,
                      color: "#E2E8F0",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Chọn Kho Nguồn --</option>
                    {khoNguonList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.ten_kho}
                      </option>
                    ))}
                  </select>,
                )}
                {lbl(
                  "Người giao (Ký xuất)",
                  sel(
                    form.nguoi_giao_id,
                    f("nguoi_giao_id"),
                    users.map((u) => ({
                      v: u.id,
                      l: u.full_name || u.username,
                    })),
                  ),
                )}
              </div>

              {/* Cột Đích */}
              <div
                style={{
                  padding: 20,
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 12,
                  border: "1px dashed rgba(0,212,170,0.3)",
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: "#00D4AA",
                    fontWeight: 700,
                    marginBottom: 16,
                    letterSpacing: 1,
                  }}
                >
                  🟢 BÊN NHẬN (ĐÍCH)
                </div>
                {lbl(
                  "Đến Đơn vị (*)",
                  <select
                    value={form.den_don_vi_id}
                    onChange={(e) => handleDenDonViChange(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(30,41,59,0.9)",
                      border: "1px solid rgba(100,116,139,0.3)",
                      borderRadius: 8,
                      color: "#E2E8F0",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Chọn Đơn vị Đích --</option>
                    {donVis.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.ten_don_vi}
                      </option>
                    ))}
                  </select>,
                )}
                {lbl(
                  "Đến Kho",
                  <select
                    value={form.den_kho_id}
                    onChange={(e) =>
                      setForm({ ...form, den_kho_id: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      background: "rgba(30,41,59,0.9)",
                      border: "1px solid rgba(100,116,139,0.3)",
                      borderRadius: 8,
                      color: "#E2E8F0",
                      fontSize: 13,
                      outline: "none",
                      cursor: "pointer",
                    }}
                  >
                    <option value="">-- Chọn Kho Đích --</option>
                    {khoDichList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.ten_kho}
                      </option>
                    ))}
                  </select>,
                )}
                {lbl(
                  "Người nhận (Ký nhập)",
                  sel(
                    form.nguoi_nhan_id,
                    f("nguoi_nhan_id"),
                    users.map((u) => ({
                      v: u.id,
                      l: u.full_name || u.username,
                    })),
                  ),
                )}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 16,
              }}
            >
              {lbl(
                "Ngày thực hiện dự kiến",
                inp(form.ngay_thuc_hien, f("ngay_thuc_hien"), "", "date"),
              )}
              {/* {lbl(
                "Ghi chú",
                inp(
                  form.ghi_chu,
                  f("ghi_chu"),
                  "VD: Bàn giao phục vụ diễn tập...",
                ),
              )} */}
            </div>

            {/* COMPONENT LỌC VÀ CHỌN TRANG BỊ THEO KHO NGUỒN ĐÃ CHỌN */}
            <div
              style={{
                marginTop: 8,
                borderTop: "1px solid rgba(100,116,139,0.2)",
                paddingTop: 20,
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: "#0EA5E9",
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                📦 CHỌN TRANG BỊ LUÂN CHUYỂN
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                {/* Có sẵn */}
                <div
                  style={{
                    background: "rgba(30,41,59,0.3)",
                    border: "1px solid rgba(100,116,139,0.3)",
                    borderRadius: 10,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
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
                        fontWeight: 600,
                      }}
                    >
                      Có sẵn tại Kho nguồn ({visibleEquipments.length})
                    </span>
                  </div>
                  <div style={{ position: "relative" }}>
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
                      value={tbSearch}
                      onChange={(e) => setTbSearch(e.target.value)}
                      disabled={!form.tu_kho_id}
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
                  <div
                    style={{
                      flex: 1,
                      height: 220,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      paddingRight: 4,
                    }}
                  >
                    {visibleEquipments.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: 20,
                          color: "#64748B",
                          fontSize: 12,
                        }}
                      >
                        {form.tu_kho_id
                          ? "Không tìm thấy thiết bị khả dụng phù hợp."
                          : "Vui lòng chọn Kho Nguồn ở phía trên."}
                      </div>
                    ) : (
                      visibleEquipments.map((tb) => (
                        <div
                          key={tb.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            background: "rgba(15,23,42,0.8)",
                            border: "1px solid rgba(100,116,139,0.2)",
                            borderRadius: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#00D4AA",
                                fontWeight: 700,
                                fontFamily: "'Courier New', monospace",
                              }}
                            >
                              {tb.ma_ca_the}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94A3B8",
                                marginTop: 2,
                              }}
                            >
                              {tb.ten_san_pham} | S/N: {tb.serial || "—"}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setSelectedEquipments([...selectedEquipments, tb])
                            }
                            style={{
                              padding: "6px 12px",
                              background: "rgba(0,212,170,0.1)",
                              border: "1px solid rgba(0,212,170,0.3)",
                              borderRadius: 6,
                              color: "#00D4AA",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            CHỌN
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Đã chọn */}
                <div
                  style={{
                    background: "rgba(14,165,233,0.05)",
                    border: "1px dashed rgba(14,165,233,0.4)",
                    borderRadius: 10,
                    padding: 16,
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
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
                        color: "#0EA5E9",
                        fontWeight: 700,
                      }}
                    >
                      Đã chọn ({selectedEquipments.length})
                    </span>
                    {selectedEquipments.length > 0 && (
                      <span
                        onClick={() => setSelectedEquipments([])}
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
                      height: 260,
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      paddingRight: 4,
                    }}
                  >
                    {selectedEquipments.length === 0 ? (
                      <div
                        style={{
                          textAlign: "center",
                          padding: 20,
                          color: "#64748B",
                          fontSize: 12,
                        }}
                      >
                        Chưa có trang bị nào được chọn
                      </div>
                    ) : (
                      selectedEquipments.map((tb) => (
                        <div
                          key={tb.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 14px",
                            background: "rgba(15,23,42,0.9)",
                            border: "1px solid rgba(14,165,233,0.3)",
                            borderRadius: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#0EA5E9",
                                fontWeight: 700,
                                fontFamily: "'Courier New', monospace",
                              }}
                            >
                              {tb.ma_ca_the}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94A3B8",
                                marginTop: 2,
                              }}
                            >
                              {tb.ten_san_pham}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setSelectedEquipments(
                                selectedEquipments.filter(
                                  (s) => s.id !== tb.id,
                                ),
                              )
                            }
                            style={{
                              padding: "6px",
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: 6,
                              color: "#EF4444",
                              cursor: "pointer",
                              display: "flex",
                            }}
                          >
                            <Icon name="x" size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={createPhieu}
              style={{
                padding: "14px 0",
                marginTop: 8,
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg,#00D4AA,#0EA5E9)",
                color: "#0F172A",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 1,
              }}
            >
              LƯU PHIẾU VÀO HỆ THỐNG
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
