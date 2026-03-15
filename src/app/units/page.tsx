/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { Modal, FormGroup, Input, Select } from "@/src/components/ui/Shared";
import { donViService } from "@/src/services/donVi.service";

export default function UnitsPage() {
  const [units, setUnits] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State cho Modal CRUD
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    ma_don_vi: "",
    ten_don_vi: "",
    cap_tren_id: "",
  });

  // Gọi API lấy data khi component vừa mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Gọi song song 2 API: Lấy list phẳng cho Table, Lấy list cây cho Select
      const [flatData, tree] = await Promise.all([
        donViService.getAll(),
        donViService.getTree(),
      ]);
      setUnits(flatData);
      setTreeData(tree);
    } catch (error) {
      alert("Không thể tải danh sách đơn vị từ server!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CRUD Handlers ---
  const handleOpenModal = (unit: any = null) => {
    if (unit) {
      setEditingId(unit.id);
      setForm({
        ma_don_vi: unit.ma_don_vi,
        ten_don_vi: unit.ten_don_vi,
        cap_tren_id: unit.cap_tren_id ? unit.cap_tren_id.toString() : "",
      });
    } else {
      setEditingId(null);
      setForm({ ma_don_vi: "", ten_don_vi: "", cap_tren_id: "" });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa đơn vị này? Các dữ liệu trực thuộc có thể bị ảnh hưởng.",
      )
    ) {
      try {
        await donViService.delete(id);
        fetchData(); // Refresh lại data
      } catch (error) {
        alert("Lỗi khi xóa đơn vị!");
      }
    }
  };

  const handleSave = async () => {
    if (!form.ma_don_vi || !form.ten_don_vi) {
      alert("Vui lòng điền mã và tên đơn vị!");
      return;
    }

    try {
      const payload = {
        ma_don_vi: form.ma_don_vi,
        ten_don_vi: form.ten_don_vi,
        cap_tren_id: form.cap_tren_id ? parseInt(form.cap_tren_id) : null,
      };

      if (editingId) {
        await donViService.update(editingId, payload);
      } else {
        await donViService.create(payload);
      }

      setModalOpen(false);
      fetchData(); // Refresh lại bảng và cây sau khi lưu
    } catch (error) {
      alert("Lỗi khi lưu thông tin đơn vị!");
    }
  };

  // Hàm đệ quy render Option Select dạng Cây
  const renderTreeOptions = (nodes: any[], depth = 0): any[] => {
    return nodes.flatMap((node) => {
      // Tạo prefix thụt lề để hiện rõ cấp bậc
      const prefix = depth > 0 ? "\u00A0\u00A0".repeat(depth * 2) + "|— " : "";

      // Chặn không cho chọn chính nó làm cấp trên khi đang sửa
      const isDisabled = editingId === node.id;

      const option = (
        <option key={node.id} value={node.id} disabled={isDisabled}>
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
          QUẢN LÝ ĐƠN VỊ
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
            background: `linear-gradient(135deg, #34D399, #10B981)`,
            color: "#0F172A",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          <Icon name="plus" size={16} /> THÊM ĐƠN VỊ
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
                borderBottom: `1px solid rgba(52,211,153,0.3)`,
              }}
            >
              {[
                "Mã ĐV",
                "Tên đơn vị",
                "Cấp trên",
                "Số trang bị",
                "Thao tác",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#34D399",
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
            {units.map((row: any) => (
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
                    color: "#34D399",
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  {row.ma_don_vi}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#E2E8F0",
                  }}
                >
                  {row.ten_don_vi}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#94A3B8",
                  }}
                >
                  {row?.cap_tren?.ma_don_vi ?? "—"}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#34D399",
                  }}
                >
                  {row.so_luong_trang_bi || 0}
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
                      onClick={() => handleDelete(row.id)}
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
            {units.length === 0 && (
              <tr>
                <td
                  colSpan={5}
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
        title={editingId ? `CẬP NHẬT ĐƠN VỊ` : `THÊM ĐƠN VỊ MỚI`}
        accentColor="#34D399"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FormGroup label="Mã Đơn Vị">
            <Input
              value={form.ma_don_vi}
              onChange={(e: any) =>
                setForm({ ...form, ma_don_vi: e.target.value })
              }
              placeholder="VD: D1"
            />
          </FormGroup>

          <FormGroup label="Tên Đơn Vị">
            <Input
              value={form.ten_don_vi}
              onChange={(e: any) =>
                setForm({ ...form, ten_don_vi: e.target.value })
              }
              placeholder="VD: Đại đội 1"
            />
          </FormGroup>

          {/* TREE SELECT CHO CẤP TRÊN */}
          <FormGroup label="Đơn vị cấp trên (Trực thuộc)">
            <Select
              value={form.cap_tren_id}
              onChange={(e: any) =>
                setForm({ ...form, cap_tren_id: e.target.value })
              }
            >
              <option value="">-- Là Đơn vị Cấp cao nhất --</option>
              {renderTreeOptions(treeData)}
            </Select>
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
              background: `linear-gradient(135deg, #34D399, #10B981)`,
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
