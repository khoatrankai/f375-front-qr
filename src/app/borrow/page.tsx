/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { StatusBadge } from "@/src/components/ui/Shared";

// --- IMPORTS SERVICES ---
import { phieuMuonTraService } from "@/src/services/phieuMuonTra.service";
import { donViService } from "@/src/services/donVi.service";
import { khoService } from "@/src/services/kho.service";
import { userService } from "@/src/services/user.service";
import { sanPhamService } from "@/src/services/sanPham.service";

export default function BorrowPage() {
  // --- STATE DATA MASTER ---
  const [phieus, setPhieus] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);

  const [donVis, setDonVis] = useState<any[]>([]);
  const [khos, setKhos] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // --- STATE UI & TABS ---
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("list"); // list | create
  const [modal, setModal] = useState<string | null>(null); // "view" | null
  const [selected, setSelected] = useState<any>(null); // Chi tiết phiếu đang xem

  const [search, setSearch] = useState("");

  // --- STATE FORM TẠO PHIẾU ---
  const [form, setForm] = useState({
    ma_phieu: `PM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    nguoi_muon_id: "",
    nguoi_cho_muon_id: "",
    don_vi_muon_id: "",
    kho_id: "", // Dùng để filter trang bị
    ngay_muon: new Date().toISOString().split("T")[0],
    han_tra: "",
    muc_dich: "",
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
      const [listPhieu, statData, listDonVi, listKho, listUser] =
        await Promise.all([
          phieuMuonTraService.getDanhSachPhieu(),
          phieuMuonTraService.getThongKe(),
          donViService.getAll(),
          khoService.getAll(),
          userService.getAll(),
        ]);
      setPhieus(listPhieu);
      setStats(statData);
      setDonVis(listDonVi);
      setKhos(listKho);
      setUsers(listUser);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== LỌC DỮ LIỆU BẢNG ====================
  const filteredPhieus = phieus.filter((r) => {
    if (
      search &&
      !r.ma_phieu?.toLowerCase().includes(search.toLowerCase()) &&
      !r.nguoi_muon_ten?.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  // ==================== LOGIC CHỌN TRANG BỊ TỪ KHO ====================
  const handleKhoChange = async (val: string) => {
    setForm((p) => ({ ...p, kho_id: val }));
    setSelectedEquipments([]);

    if (val) {
      try {
        const eq = await sanPhamService.getTrangBiThucTeTheoKho(Number(val));
        // Chỉ hiện những thiết bị đang trong trạng thái "TRONG_KHO" để cho mượn
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
    if (!form.nguoi_muon_id || !form.han_tra) {
      alert("Vui lòng điền đủ Người mượn và Ngày hẹn trả!");
      return;
    }
    if (selectedEquipments.length === 0) {
      alert("Vui lòng chọn ít nhất 1 trang bị để cho mượn!");
      return;
    }

    try {
      const payload: any = {
        ma_phieu: form.ma_phieu,
        nguoi_muon_id: parseInt(form.nguoi_muon_id),
        nguoi_cho_muon_id: form.nguoi_cho_muon_id
          ? parseInt(form.nguoi_cho_muon_id)
          : null,
        don_vi_muon_id: form.don_vi_muon_id
          ? parseInt(form.don_vi_muon_id)
          : null,
        ngay_muon: form.ngay_muon,
        han_tra: form.han_tra,
        muc_dich: form.muc_dich,
        trang_thai: "DANG_MUON",
        danh_sach_thiet_bi_ids: selectedEquipments.map((tb) => tb.id),
      };

      await phieuMuonTraService.createPhieu(payload);

      // Reset form
      setForm({
        ...form,
        ma_phieu: `PM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
        muc_dich: "",
        han_tra: "",
      });
      setSelectedEquipments([]);
      setTbSearch("");
      setTab("list");

      fetchInitialData();
    } catch (error: any) {
      alert("Lỗi khi tạo phiếu mượn: " + (error.message || "Unknown error"));
    }
  };

  const handleReturn = async (id: number) => {
    if (confirm("Xác nhận đã thu hồi đầy đủ các thiết bị trong phiếu này?")) {
      try {
        await phieuMuonTraService.returnThietBi(id, {
          ngay_tra_thuc_te: new Date().toISOString().split("T")[0],
          ghi_chu_tinh_trang: "Bình thường",
        });
        fetchInitialData();
        setModal(null);
      } catch (error) {
        alert("Lỗi cập nhật trạng thái trả");
      }
    }
  };

  const handleViewDetail = async (row: any) => {
    try {
      const details = await phieuMuonTraService.getChiTietPhieu(row.id);
      setSelected(details);
      setModal("view");
    } catch (error) {
      alert("Lỗi khi tải chi tiết phiếu");
    }
  };

  // ==================== RENDER HELPERS ====================
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
      {/* HEADER & TABS NAVIGATION */}
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
          CHO MƯỢN / TRẢ TRANG BỊ
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
                  tab === m.v ? "rgba(245,158,11,0.18)" : "transparent",
                color: tab === m.v ? "#F59E0B" : "#64748B",
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
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
              marginBottom: 24,
            }}
          >
            {[
              { l: "Đang mượn", v: stats?.dang_muon || 0, c: "#F59E0B" },
              { l: "Quá hạn", v: stats?.qua_han || 0, c: "#EF4444" },
              {
                l: "Đã trả thành công",
                v: stats?.da_tra_thang_nay || 0,
                c: "#00D4AA",
              },
            ].map((s) => (
              <div
                key={s.l}
                style={{
                  background: "rgba(15,23,42,0.8)",
                  border: `1px solid ${s.c}33`,
                  borderRadius: 12,
                  padding: "20px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: 28,
                    fontWeight: 700,
                    color: s.c,
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {s.v}
                </div>
                <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* Thanh tìm kiếm */}
          <div
            style={{ position: "relative", marginBottom: 16, maxWidth: 360 }}
          >
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
              placeholder="Tìm mã phiếu, người mượn..."
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
                    borderBottom: "1px solid rgba(245,158,11,0.2)",
                  }}
                >
                  {[
                    "Mã phiếu",
                    "Người mượn",
                    "Đơn vị",
                    "Ngày mượn",
                    "Hạn trả",
                    "SL",
                    "Trạng thái",
                    "",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "14px 16px",
                        textAlign: "left",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#F59E0B",
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
                {filteredPhieus.map((row) => (
                  <tr
                    key={row.id}
                    style={{ borderBottom: "1px solid rgba(100,116,139,0.1)" }}
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
                        color: "#F59E0B",
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 600,
                      }}
                    >
                      {row.ma_phieu}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "#E2E8F0",
                      }}
                    >
                      {row.nguoi_muon || "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {row.don_vi || "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {row.ngay_muon
                        ? new Date(row.ngay_muon).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color:
                          row.trang_thai === "QUA_HAN" ? "#EF4444" : "#94A3B8",
                        fontWeight: row.trang_thai === "QUA_HAN" ? 700 : 400,
                      }}
                    >
                      {row.han_tra
                        ? new Date(row.han_tra).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 13,
                        color: "#E2E8F0",
                        fontWeight: 600,
                      }}
                    >
                      {row.so_luong || 0}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={row.trang_thai} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
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
                          <Icon name="eye" size={14} />
                        </button>
                        {(row.trang_thai === "DANG_MUON" ||
                          row.trang_thai === "QUA_HAN") && (
                          <button
                            onClick={() => handleReturn(row.id!)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              border: "1px solid #00D4AA55",
                              background: "#00D4AA11",
                              color: "#00D4AA",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 600,
                            }}
                          >
                            TRẢ
                          </button>
                        )}
                      </div>
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
              color: "#F59E0B",
              letterSpacing: 2,
              marginBottom: 22,
            }}
          >
            TẠO PHIẾU CHO MƯỢN TRANG BỊ
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* THÔNG TIN CHUNG */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 24,
                padding: 20,
                background: "rgba(255,255,255,0.02)",
                borderRadius: 12,
                border: "1px dashed rgba(245,158,11,0.3)",
              }}
            >
              <div>
                {lbl(
                  "Mã Phiếu",
                  inp(form.ma_phieu, f("ma_phieu"), "Mã phiếu tự động..."),
                )}
                {lbl(
                  "Kho xuất thiết bị (*)",
                  <select
                    value={form.kho_id}
                    onChange={(e) => handleKhoChange(e.target.value)}
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
                    <option value="">-- Chọn Kho chứa đồ --</option>
                    {khos.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.ten_kho}
                      </option>
                    ))}
                  </select>,
                )}
                {lbl(
                  "Người duyệt xuất (Cho mượn)",
                  sel(
                    form.nguoi_cho_muon_id,
                    f("nguoi_cho_muon_id"),
                    users.map((u) => ({
                      v: u.id,
                      l: u.full_name || u.username,
                    })),
                  ),
                )}
              </div>
              <div>
                {lbl(
                  "Người Mượn (*)",
                  sel(
                    form.nguoi_muon_id,
                    f("nguoi_muon_id"),
                    users.map((u) => ({
                      v: u.id,
                      l: u.full_name || u.username,
                    })),
                  ),
                )}
                {lbl(
                  "Đơn vị của người mượn",
                  sel(
                    form.don_vi_muon_id,
                    f("don_vi_muon_id"),
                    donVis.map((d) => ({ v: d.id, l: d.ten_don_vi })),
                  ),
                )}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 10,
                  }}
                >
                  {lbl(
                    "Ngày mượn",
                    inp(form.ngay_muon, f("ngay_muon"), "", "date"),
                  )}
                  {lbl(
                    "Ngày hẹn trả (*)",
                    inp(form.han_tra, f("han_tra"), "", "date"),
                  )}
                </div>
              </div>
            </div>

            {/* {lbl(
              "Mục đích mượn",
              inp(
                form.muc_dich,
                f("muc_dich"),
                "VD: Mượn đi công tác, diễn tập...",
              ),
            )} */}

            {/* COMPONENT LỌC VÀ CHỌN TRANG BỊ */}
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
                  color: "#F59E0B",
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                📦 CHỌN TRANG BỊ CHO MƯỢN
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 20,
                }}
              >
                {/* Cột Trái: Có Sẵn */}
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
                      disabled={!form.kho_id}
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
                        {form.kho_id
                          ? "Không tìm thấy thiết bị khả dụng."
                          : "Vui lòng chọn Kho xuất ở phía trên."}
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
                                color: "#F59E0B",
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
                              background: "rgba(245,158,11,0.1)",
                              border: "1px solid rgba(245,158,11,0.3)",
                              borderRadius: 6,
                              color: "#F59E0B",
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

                {/* Cột Phải: Đã Chọn */}
                <div
                  style={{
                    background: "rgba(245,158,11,0.05)",
                    border: "1px dashed rgba(245,158,11,0.4)",
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
                        color: "#F59E0B",
                        fontWeight: 700,
                      }}
                    >
                      Đã chọn mượn ({selectedEquipments.length})
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
                            border: "1px solid rgba(245,158,11,0.3)",
                            borderRadius: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#F59E0B",
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
                background: "linear-gradient(135deg,#F59E0B,#EF4444)",
                color: "#0F172A",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 1,
              }}
            >
              TẠO PHIẾU CHO MƯỢN
            </button>
          </div>
        </div>
      )}

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
              width: 550,
              maxHeight: "88vh",
              overflow: "auto",
              background: "linear-gradient(160deg,#0D1626,#080F1E)",
              border: "1px solid rgba(245,158,11,0.3)",
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
                    color: "#F59E0B",
                    letterSpacing: 2,
                    fontFamily: "'Courier New',monospace",
                    marginBottom: 6,
                  }}
                >
                  CHI TIẾT PHIẾU MƯỢN
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
                <div style={{ marginTop: 6 }}>
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

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                ["Người mượn", selected.nguoi_muon || "—"],
                ["Đơn vị", selected.don_vi || "—"],
                [
                  "Ngày mượn",
                  selected.ngay_muon
                    ? new Date(selected.ngay_muon).toLocaleDateString("vi-VN")
                    : "—",
                ],
                [
                  "Hạn trả",
                  selected.han_tra
                    ? new Date(selected.han_tra).toLocaleDateString("vi-VN")
                    : "—",
                ],
                // ["Mục đích", selected.muc_dich || "—"],
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
                    borderLeft: "3px solid rgba(245,158,11,0.3)",
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
              CHI TIẾT TRANG BỊ MƯỢN ({selected.danh_sach_thiet_bi?.length || 0}
              )
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                marginBottom: 20,
              }}
            >
              {selected.danh_sach_thiet_bi?.map((tb: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    padding: "10px 14px",
                    background: "rgba(245,158,11,0.05)",
                    border: "1px solid rgba(245,158,11,0.2)",
                    borderRadius: 8,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#F59E0B",
                        fontWeight: 700,
                        fontFamily: "'Courier New', monospace",
                      }}
                    >
                      {tb.ma_qr}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}
                    >
                      {tb.ten_san_pham}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {(selected.trang_thai === "DANG_MUON" ||
              selected.trang_thai === "QUA_HAN") && (
              <button
                onClick={() => handleReturn(selected.id)}
                style={{
                  width: "100%",
                  padding: "12px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#00D4AA,#34D399)",
                  color: "#0F172A",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  letterSpacing: 1,
                }}
              >
                XÁC NHẬN ĐÃ THU HỒI
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
