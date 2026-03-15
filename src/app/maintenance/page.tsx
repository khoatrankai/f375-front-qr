/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { StatusBadge, QualityStars } from "@/src/components/ui/Shared";

// IMPORTS SERVICES
import { phieuBaoDuongService } from "@/src/services/phieuBaoDuong.service";
import { loaiCongViecService } from "@/src/services/loaiCongViec.service";
import { userService } from "@/src/services/user.service";
import { sanPhamService } from "@/src/services/sanPham.service";

const CAP_COLORS_EQ = ["#00D4AA", "#3B82F6", "#F59E0B", "#EF4444"];

export default function MaintenancePage() {
  // --- STATE DATA MASTER ---
  const [phieus, setPhieus] = useState<any[]>([]);
  const [loaiCVs, setLoaiCVs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // --- STATE UI & TABS ---
  const [isLoading, setIsLoading] = useState(true);
  const [tab, setTab] = useState("list");
  const [modal, setModal] = useState<string | null>(null);
  const [selected, setSelected] = useState<any | null>(null);

  const [search, setSearch] = useState("");
  const [filterLoaiCV, setFilterLoaiCV] = useState("ALL");
  const [filterTT, setFilterTT] = useState("ALL");

  // --- STATE FORM TẠO PHIẾU ---
  const [form, setForm] = useState({
    ma_phieu: `BD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
    loai_cong_viec_id: "",
    nguoi_phu_trach_id: "",
    ngay_bat_dau: new Date().toISOString().split("T")[0],
  });

  // State chuyên dùng cho phần chọn Trang bị
  const [availableEquipments, setAvailableEquipments] = useState<any[]>([]);
  const [selectedEquipments, setSelectedEquipments] = useState<any[]>([]);
  const [tbSearch, setTbSearch] = useState("");

  const f = (k: string) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  // ==================== FETCH DATA ====================
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setIsLoading(true);
      const [listPhieu, listLoaiCV, listUser, listEq] = await Promise.all([
        phieuBaoDuongService.getDanhSachPhieu(),
        loaiCongViecService.getAll(),
        userService.getAll(),
        sanPhamService.getDanhSachTrangBiTungCai(),
      ]);
      setPhieus(listPhieu);
      setLoaiCVs(listLoaiCV);
      setUsers(listUser);
      // Chỉ cho phép đưa vào bảo dưỡng các thiết bị đang TRONG_KHO hoặc DANG_MUON
      setAvailableEquipments(
        listEq.filter(
          (e) => e.trang_thai !== "BAO_DUONG" && e.trang_thai !== "HONG_HOC",
        ),
      );
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu bảo dưỡng", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== LOGIC LỌC TẠI FRONTEND ====================
  const filteredPhieus = phieus.filter((r) => {
    if (
      filterLoaiCV !== "ALL" &&
      r.loai_cong_viec_id?.toString() !== filterLoaiCV
    )
      return false;
    if (filterTT !== "ALL" && r.trang_thai !== filterTT) return false;
    if (search && !r.ma_phieu?.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

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

  // ==================== API ACTIONS ====================
  const createPhieu = async () => {
    if (!form.loai_cong_viec_id || !form.ngay_bat_dau) {
      alert("Vui lòng điền đủ Loại công việc và Ngày bắt đầu!");
      return;
    }
    if (selectedEquipments.length === 0) {
      alert("Vui lòng chọn ít nhất 1 thiết bị để đưa vào bảo dưỡng!");
      return;
    }

    try {
      const payload: any = {
        ma_phieu: form.ma_phieu,
        loai_cong_viec_id: parseInt(form.loai_cong_viec_id),
        nguoi_phu_trach_id: form.nguoi_phu_trach_id
          ? parseInt(form.nguoi_phu_trach_id)
          : null,
        ngay_bat_dau: form.ngay_bat_dau,

        // ĐIỀU CHỈNH Ở ĐÂY: Sửa tên key thành danh_sach_thiet_bi_ids
        // và map để trả về mảng các ID [1, 2, 3...]
        danh_sach_thiet_bi_ids: selectedEquipments.map((tb) => tb.id),
      };

      await phieuBaoDuongService.createPhieu(payload);

      // Reset form sau khi tạo thành công
      setForm({
        ...form,
        ma_phieu: `BD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      });
      setSelectedEquipments([]);
      setTbSearch("");
      setTab("list");
      fetchInitialData();
    } catch (error: any) {
      alert("Lỗi khi tạo phiếu bảo dưỡng!");
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const details = await phieuBaoDuongService.getChiTietPhieu(id);
      setSelected(details);
      setModal("view");
    } catch (error) {
      alert("Lỗi khi tải chi tiết phiếu");
    }
  };

  // Cập nhật state nội bộ khi đang điền thông tin nghiệm thu
  const handleUpdateDetailRow = (index: number, field: string, value: any) => {
    if (!selected || !selected.danh_sach_thiet_bi) return;
    const newDetails = [...selected.danh_sach_thiet_bi];
    (newDetails[index] as any)[field] = value;
    setSelected({ ...selected, danh_sach_thiet_bi: newDetails });
  };

  // Gọi API xác nhận hoàn thành
  const completePhieu = async () => {
    if (!selected || !selected.id) return;

    // Kiểm tra xem đã điền Cấp chất lượng sau cho tất cả đồ chưa
    const isReady = selected.danh_sach_thiet_bi?.every(
      (ct: any) => ct.cap_chat_luong_sau,
    );
    if (!isReady) {
      alert(
        "Vui lòng đánh giá Cấp chất lượng cho TẤT CẢ thiết bị trước khi hoàn thành.",
      );
      return;
    }

    try {
      await phieuBaoDuongService.completeBaoDuong(selected.id, {
        ngay_hoan_thanh: new Date().toISOString().split("T")[0],
        chi_tiet: selected.danh_sach_thiet_bi || [],
      });
      fetchInitialData();
      setModal(null);
    } catch (error) {
      alert("Lỗi khi xác nhận hoàn thành");
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
          BẢO DƯỠNG & SỬA CHỮA
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
                  tab === m.v ? "rgba(239,68,68,0.15)" : "transparent",
                color: tab === m.v ? "#EF4444" : "#64748B",
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
          {/* LỌC */}
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
                placeholder="Tìm mã phiếu..."
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
            <select
              value={filterLoaiCV}
              onChange={(e) => setFilterLoaiCV(e.target.value)}
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
              <option value="ALL">Tất cả loại công việc</option>
              {loaiCVs.map((k) => (
                <option key={k.id} value={k.id.toString()}>
                  {k.ten_loai_cv}
                </option>
              ))}
            </select>
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { v: "ALL", l: "TẤT CẢ" },
                { v: "DANG_XU_LY", l: "ĐANG BẢO DƯỠNG" },
                { v: "HOAN_THANH", l: "ĐÃ HOÀN THÀNH" },
              ].map((f) => (
                <button
                  key={f.v}
                  onClick={() => setFilterTT(f.v)}
                  style={{
                    padding: "9px 13px",
                    borderRadius: 8,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: "pointer",
                    background:
                      filterTT === f.v
                        ? "rgba(239,68,68,0.15)"
                        : "rgba(15,23,42,0.8)",
                    border: `1px solid ${filterTT === f.v ? "#EF4444" : "rgba(100,116,139,0.25)"}`,
                    color: filterTT === f.v ? "#EF4444" : "#64748B",
                  }}
                >
                  {f.l}
                </button>
              ))}
            </div>
          </div>

          {/* BẢNG */}
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
                    borderBottom: "1px solid rgba(239,68,68,0.2)",
                  }}
                >
                  {[
                    "Mã phiếu",
                    "Loại công việc",
                    "Phụ trách",
                    "Ngày BD",
                    "Ngày HT",
                    "SL Thiết bị",
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
                        color: "#EF4444",
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
                        color: "#EF4444",
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
                        fontWeight: 500,
                      }}
                    >
                      {row.loai_cong_viec}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {row.phu_trach || "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {row.ngay_bat_dau
                        ? new Date(row.ngay_bat_dau).toLocaleDateString("vi-VN")
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 12,
                        color: "#94A3B8",
                      }}
                    >
                      {row.ngay_hoan_thanh
                        ? new Date(row.ngay_hoan_thanh).toLocaleDateString(
                            "vi-VN",
                          )
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "14px 16px",
                        fontSize: 14,
                        color: "#E2E8F0",
                        fontWeight: 700,
                      }}
                    >
                      {row.so_luong || 0}
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <StatusBadge status={row.trang_thai} />
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button
                        onClick={() => handleViewDetail(row.id!)}
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
                      Chưa có dữ liệu
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
              color: "#EF4444",
              letterSpacing: 2,
              marginBottom: 22,
            }}
          >
            TẠO PHIẾU BẢO DƯỠNG
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: 16,
              }}
            >
              {lbl(
                "Mã Phiếu",
                inp(form.ma_phieu, f("ma_phieu"), "Mã phiếu..."),
              )}
              {lbl(
                "Loại công việc bảo dưỡng (*)",
                sel(
                  form.loai_cong_viec_id,
                  f("loai_cong_viec_id"),
                  loaiCVs.map((cv) => ({ v: cv.id, l: cv.ten_loai_cv })),
                ),
              )}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              {lbl(
                "Người phụ trách (Kỹ thuật viên)",
                sel(
                  form.nguoi_phu_trach_id,
                  f("nguoi_phu_trach_id"),
                  users.map((u) => ({ v: u.id, l: u.full_name || u.username })),
                ),
              )}
              {lbl(
                "Ngày bắt đầu dự kiến",
                inp(form.ngay_bat_dau, f("ngay_bat_dau"), "", "date"),
              )}
            </div>

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
                  color: "#EF4444",
                  fontWeight: 700,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                📦 CHỌN THIẾT BỊ CẦN BẢO DƯỠNG
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
                      Thiết bị khả dụng ({visibleEquipments.length})
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
                      height: 260,
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
                        Hệ thống không còn thiết bị trống.
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
                              {tb.ten_san_pham}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setSelectedEquipments([...selectedEquipments, tb])
                            }
                            style={{
                              padding: "6px 12px",
                              background: "rgba(239,68,68,0.1)",
                              border: "1px solid rgba(239,68,68,0.3)",
                              borderRadius: 6,
                              color: "#EF4444",
                              cursor: "pointer",
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            ĐƯA VÀO
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Đã chọn */}
                <div
                  style={{
                    background: "rgba(239,68,68,0.05)",
                    border: "1px dashed rgba(239,68,68,0.4)",
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
                        color: "#EF4444",
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
                      height: 300,
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
                        Chưa có thiết bị nào được chọn
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
                            border: "1px solid rgba(239,68,68,0.3)",
                            borderRadius: 8,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 13,
                                color: "#EF4444",
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
                              Cấp CL hiện tại: {tb.cap_chat_luong}
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
                background: "linear-gradient(135deg,#EF4444,#F59E0B)",
                color: "#0F172A",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                letterSpacing: 1,
              }}
            >
              TẠO PHIẾU BẢO DƯỠNG
            </button>
          </div>
        </div>
      )}

      {/* Modal View Detail & Cập nhật Hoàn Thành */}
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
              width: 850,
              maxHeight: "90vh",
              overflow: "auto",
              background: "linear-gradient(160deg,#0D1626,#080F1E)",
              border: "1px solid rgba(239,68,68,0.3)",
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
                    color: "#EF4444",
                    letterSpacing: 2,
                    fontFamily: "'Courier New',monospace",
                    marginBottom: 6,
                  }}
                >
                  CHI TIẾT PHIẾU BẢO DƯỠNG
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
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginBottom: 20,
              }}
            >
              {[
                ["Loại công việc", selected.ten_loai_cv || "—"],
                ["Người phụ trách", selected.phu_trach || "—"],
                [
                  "Ngày bắt đầu",
                  selected.ngay_bat_dau
                    ? new Date(selected.ngay_bat_dau).toLocaleDateString(
                        "vi-VN",
                      )
                    : "—",
                ],
                [
                  "Ngày hoàn thành",
                  selected.ngay_hoan_thanh
                    ? new Date(selected.ngay_hoan_thanh).toLocaleDateString(
                        "vi-VN",
                      )
                    : "—",
                ],
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
                    borderLeft: "3px solid rgba(239,68,68,0.25)",
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
              DANH SÁCH THIẾT BỊ TRONG PHIẾU (
              {selected.danh_sach_thiet_bi?.length || 0})
            </div>

            {/* BẢNG CHI TIẾT */}
            <div
              style={{
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(100,116,139,0.2)",
                borderRadius: 10,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(30,41,59,0.6)" }}>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#94A3B8",
                      }}
                    >
                      Thiết bị
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#94A3B8",
                      }}
                    >
                      Cấp Trước
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#94A3B8",
                      }}
                    >
                      Cấp Sau (Nghiệm thu)
                    </th>
                    <th
                      style={{
                        padding: "10px 14px",
                        textAlign: "left",
                        fontSize: 11,
                        color: "#94A3B8",
                        width: "35%",
                      }}
                    >
                      Nội dung thực hiện
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selected.danh_sach_thiet_bi?.map((ct: any, idx: any) => (
                    <tr
                      key={idx}
                      style={{ borderTop: "1px solid rgba(100,116,139,0.1)" }}
                    >
                      <td style={{ padding: "10px 14px" }}>
                        <div
                          style={{
                            fontSize: 12,
                            color: "#0EA5E9",
                            fontWeight: 700,
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          {ct.ma_qr}
                        </div>
                        <div
                          style={{
                            fontSize: 11,
                            color: "#64748B",
                            marginTop: 2,
                          }}
                        >
                          {ct.ten_san_pham}
                        </div>
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        <QualityStars cap={ct.cap_chat_luong_truoc} />
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {selected.trang_thai === "DANG_XU_LY" ? (
                          <select
                            value={ct.cap_chat_luong_sau || ""}
                            onChange={(e) =>
                              handleUpdateDetailRow(
                                idx,
                                "cap_chat_luong_sau",
                                parseInt(e.target.value),
                              )
                            }
                            style={{
                              width: "100%",
                              padding: "6px",
                              borderRadius: 6,
                              background: "rgba(30,41,59,0.8)",
                              border: "1px solid #475569",
                              color: "#E2E8F0",
                              outline: "none",
                            }}
                          >
                            <option value="">- Chọn -</option>
                            <option value="1">Cấp 1</option>
                            <option value="2">Cấp 2</option>
                            <option value="3">Cấp 3</option>
                            <option value="4">Cấp 4</option>
                          </select>
                        ) : ct.cap_chat_luong_sau ? (
                          <QualityStars cap={ct.cap_chat_luong_sau} />
                        ) : (
                          "—"
                        )}
                      </td>
                      <td style={{ padding: "10px 14px" }}>
                        {selected.trang_thai === "DANG_XU_LY" ? (
                          <input
                            type="text"
                            value={ct.noi_dung_thuc_hien || ""}
                            onChange={(e) =>
                              handleUpdateDetailRow(
                                idx,
                                "noi_dung_thuc_hien",
                                e.target.value,
                              )
                            }
                            placeholder="Thay linh kiện, vệ sinh..."
                            style={{
                              width: "100%",
                              padding: "6px 10px",
                              borderRadius: 6,
                              background: "rgba(30,41,59,0.8)",
                              border: "1px solid #475569",
                              color: "#E2E8F0",
                              outline: "none",
                              fontSize: 12,
                            }}
                          />
                        ) : (
                          <span style={{ fontSize: 12, color: "#E2E8F0" }}>
                            {ct.noi_dung_thuc_hien || "—"}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selected.trang_thai === "DANG_XU_LY" && (
              <button
                onClick={completePhieu}
                style={{
                  width: "100%",
                  padding: "14px 0",
                  borderRadius: 8,
                  border: "none",
                  background: "linear-gradient(135deg,#00D4AA,#34D399)",
                  color: "#0F172A",
                  fontSize: 14,
                  fontWeight: 800,
                  cursor: "pointer",
                  letterSpacing: 1,
                }}
              >
                XÁC NHẬN NGHIỆM THU & HOÀN THÀNH
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
