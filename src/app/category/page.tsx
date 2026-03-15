/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { Modal, FormGroup, Input, Select } from "@/src/components/ui/Shared";
import { danhMucService, DanhMucNode } from "@/src/services/danhMuc.service";

export default function CategoryPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<DanhMucNode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State cho Modal CRUD
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    ma_danh_muc: "",
    ten_danh_muc: "",
    parent_id: "",
  });

  // Gọi API lấy data khi component vừa mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Gọi song song 2 API: List phẳng cho Table và List cây cho Dropdown
      const [flatData, tree] = await Promise.all([
        danhMucService.getAll(),
        danhMucService.getTree(),
      ]);
      setCategories(flatData);
      setTreeData(tree);
    } catch (error) {
      alert("Không thể tải danh sách danh mục từ server!");
    } finally {
      setIsLoading(false);
    }
  };

  // --- CRUD Handlers ---
  const handleOpenModal = (category: any = null) => {
    if (category) {
      setEditingId(category.id);
      setForm({
        ma_danh_muc: category.ma_danh_muc,
        ten_danh_muc: category.ten_danh_muc,
        parent_id: category.parent_id ? category.parent_id.toString() : "",
      });
    } else {
      setEditingId(null);
      setForm({ ma_danh_muc: "", ten_danh_muc: "", parent_id: "" });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (
      confirm(
        "Bạn có chắc chắn muốn xóa danh mục này? Các danh mục/sản phẩm con có thể bị ảnh hưởng.",
      )
    ) {
      try {
        await danhMucService.delete(id);
        fetchData(); // Lấy lại dữ liệu mới nhất
      } catch (error) {
        alert("Lỗi khi xóa danh mục!");
      }
    }
  };

  const handleSave = async () => {
    if (!form.ma_danh_muc || !form.ten_danh_muc) {
      alert("Vui lòng điền mã và tên danh mục!");
      return;
    }

    try {
      const payload = {
        ma_danh_muc: form.ma_danh_muc,
        ten_danh_muc: form.ten_danh_muc,
        parent_id: form.parent_id ? parseInt(form.parent_id) : null,
      };

      if (editingId) {
        await danhMucService.update(editingId, payload);
      } else {
        await danhMucService.create(payload);
      }

      setModalOpen(false);
      fetchData(); // Refresh UI
    } catch (error) {
      alert("Lỗi khi lưu thông tin danh mục!");
    }
  };

  // --- Hàm đệ quy render Option Select dạng Cây ---
  const renderTreeOptions = (nodes: DanhMucNode[], depth = 0): any[] => {
    return nodes.flatMap((node) => {
      // Dùng khoảng trắng để thụt lề cấp bậc
      const prefix = depth > 0 ? "\u00A0\u00A0".repeat(depth * 2) + "|— " : "";

      // Khóa option nếu nó chính là danh mục đang sửa (Tránh tự chọn mình làm cha)
      const isDisabled = editingId === node.id;

      const option = (
        <option key={node.id} value={node.id} disabled={isDisabled}>
          {prefix}
          {node.ten_danh_muc}
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
          LOẠI TRANG BỊ
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
            background: `linear-gradient(135deg, #A78BFA, #8B5CF6)`,
            color: "#0F172A",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          <Icon name="plus" size={16} /> THÊM LOẠI
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
                borderBottom: `1px solid rgba(167,139,250,0.3)`,
              }}
            >
              {[
                "Mã Loại",
                "Tên Danh Mục",
                "Danh Mục Cha",
                "Số Sản Phẩm",
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
            {categories.map((row: any) => (
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
                    color: "#A78BFA",
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  {row.ma_danh_muc}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#E2E8F0",
                  }}
                >
                  {row.ten_danh_muc}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#94A3B8",
                  }}
                >
                  {row?.danh_muc_cha?.ten_danh_muc ?? "—"}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 14,
                    fontWeight: 700,
                    color: "#A78BFA",
                  }}
                >
                  {row.so_luong_san_pham || 0}
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
            {categories.length === 0 && (
              <tr>
                <td
                  colSpan={5}
                  style={{ padding: 30, textAlign: "center", color: "#64748B" }}
                >
                  Chưa có dữ liệu danh mục
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
        title={editingId ? `CẬP NHẬT DANH MỤC` : `THÊM DANH MỤC MỚI`}
        accentColor="#A78BFA"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <FormGroup label="Mã Danh Mục">
            <Input
              value={form.ma_danh_muc}
              onChange={(e: any) =>
                setForm({ ...form, ma_danh_muc: e.target.value })
              }
              placeholder="VD: TTLL"
            />
          </FormGroup>

          <FormGroup label="Tên Danh Mục">
            <Input
              value={form.ten_danh_muc}
              onChange={(e: any) =>
                setForm({ ...form, ten_danh_muc: e.target.value })
              }
              placeholder="VD: Thông tin liên lạc"
            />
          </FormGroup>

          {/* TREE SELECT CHO DANH MỤC CHA */}
          <FormGroup label="Danh mục cha (Trực thuộc)">
            <Select
              value={form.parent_id}
              onChange={(e: any) =>
                setForm({ ...form, parent_id: e.target.value })
              }
            >
              <option value="">-- Là Danh mục Cấp cao nhất --</option>
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
              background: `linear-gradient(135deg, #A78BFA, #8B5CF6)`,
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
