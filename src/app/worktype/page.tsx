/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { Modal, FormGroup, Input } from "@/src/components/ui/Shared";
import { loaiCongViecService } from "@/src/services/loaiCongViec.service";

export default function WorkTypePage() {
  const [workTypes, setWorkTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State cho Modal CRUD
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    ma_loai_cv: "",
    ten_loai_cv: "",
    mo_ta: "",
  });

  // Gọi API lấy data khi component vừa mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const data = await loaiCongViecService.getAll();
      setWorkTypes(data);
    } catch (error) {
      alert("Không thể tải danh sách loại công việc từ server!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CRUD Handlers ---
  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingId(item.id);
      setForm({
        ma_loai_cv: item.ma_loai_cv,
        ten_loai_cv: item.ten_loai_cv,
        mo_ta: item.mo_ta || "",
      });
    } else {
      setEditingId(null);
      setForm({ ma_loai_cv: "", ten_loai_cv: "", mo_ta: "" });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa loại công việc này? Các phiếu bảo dưỡng liên quan có thể bị ảnh hưởng.",
      )
    ) {
      try {
        await loaiCongViecService.delete(id);
        fetchData();
      } catch (error) {
        alert("Lỗi khi xóa loại công việc!");
      }
    }
  };

  const handleSave = async () => {
    if (!form.ma_loai_cv || !form.ten_loai_cv) {
      alert("Vui lòng điền mã và tên loại công việc!");
      return;
    }

    try {
      const payload: Partial<any> = {
        ma_loai_cv: form.ma_loai_cv,
        ten_loai_cv: form.ten_loai_cv,
        mo_ta: form.mo_ta,
      };

      if (editingId) {
        await loaiCongViecService.update(editingId, payload);
      } else {
        await loaiCongViecService.create(payload);
      }

      setModalOpen(false);
      fetchData();
    } catch (error) {
      alert("Lỗi khi lưu thông tin loại công việc!");
    }
  };

  if (isLoading) {
    return (
      <div style={{ color: "#E2E8F0", padding: 20 }}>Đang tải dữ liệu...</div>
    );
  }

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
          LOẠI CÔNG VIỆC BẢO DƯỠNG
        </h2>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, #F472B6, #DB2777)`,
            color: "#0F172A",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          <Icon name="plus" size={16} /> THÊM LOẠI CV
        </button>
      </div>

      {/* BẢNG DỮ LIỆU */}
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
                borderBottom: `1px solid rgba(244,114,182,0.3)`,
              }}
            >
              {["Mã Loại CV", "Tên Loại Công Việc", "Mô Tả", "Thao tác"].map(
                (h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#F472B6",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {workTypes.map((row: any) => (
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
                    color: "#F472B6",
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  {row.ma_loai_cv}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#E2E8F0",
                    fontWeight: 500,
                  }}
                >
                  {row.ten_loai_cv}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 12,
                    color: "#94A3B8",
                  }}
                >
                  {row.mo_ta || "—"}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleOpenModal(row)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: `1px solid rgba(245,158,11,0.3)`,
                        background: `rgba(245,158,11,0.1)`,
                        color: "#F59E0B",
                        cursor: "pointer",
                      }}
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id!)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: `1px solid rgba(239,68,68,0.3)`,
                        background: `rgba(239,68,68,0.1)`,
                        color: "#EF4444",
                        cursor: "pointer",
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {workTypes.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  style={{ padding: 30, textAlign: "center", color: "#64748B" }}
                >
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL CRUD */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingId ? `CẬP NHẬT LOẠI CÔNG VIỆC` : `THÊM LOẠI CÔNG VIỆC MỚI`
        }
        accentColor="#F472B6"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FormGroup label="Mã Loại CV">
            <Input
              value={form.ma_loai_cv}
              onChange={(e: any) =>
                setForm({ ...form, ma_loai_cv: e.target.value })
              }
              placeholder="VD: SC-01"
            />
          </FormGroup>

          <FormGroup label="Tên Loại Công Việc">
            <Input
              value={form.ten_loai_cv}
              onChange={(e: any) =>
                setForm({ ...form, ten_loai_cv: e.target.value })
              }
              placeholder="VD: Sửa chữa định kỳ"
            />
          </FormGroup>

          <FormGroup label="Mô Tả / Ghi chú">
            <textarea
              value={form.mo_ta}
              onChange={(e: any) => setForm({ ...form, mo_ta: e.target.value })}
              placeholder="Nhập mô tả chi tiết công việc..."
              style={{
                width: "100%",
                height: 80,
                padding: "10px 14px",
                background: "rgba(30,41,59,0.7)",
                border: "1px solid rgba(100,116,139,0.3)",
                borderRadius: 8,
                color: "#E2E8F0",
                fontSize: 13,
                outline: "none",
                resize: "none",
              }}
            />
          </FormGroup>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setModalOpen(false)}
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
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: `linear-gradient(135deg, #F472B6, #DB2777)`,
              color: "#0F172A",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            {editingId ? "CẬP NHẬT" : "LƯU MỚI"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
