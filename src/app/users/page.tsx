/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { Modal, FormGroup, Input, Select } from "@/src/components/ui/Shared";
import { userService } from "@/src/services/user.service";
import { donViService } from "@/src/services/donVi.service";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [treeData, setTreeData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State cho Modal CRUD
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Khởi tạo form state (Bao gồm trường mật khẩu)
  const [form, setForm] = useState({
    username: "",
    password: "", // Chỉ dùng khi thêm mới hoặc đổi pass
    full_name: "",
    role: "USER",
    don_vi_id: "",
    is_active: "1", // Dùng string để dễ map với Select
  });

  // Gọi API lấy data khi component vừa mount
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      // Fetch đồng thời danh sách User và Cây đơn vị
      const [usersData, tree] = await Promise.all([
        userService.getAll(),
        donViService.getTree(),
      ]);
      setUsers(usersData);
      setTreeData(tree);
    } catch (error) {
      alert("Không thể tải dữ liệu từ máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (user: any = null) => {
    if (user) {
      setEditingId(user.id);
      setForm({
        username: user.username,
        password: "", // Ẩn mật khẩu hiện tại, chỉ nhập khi muốn đổi
        full_name: user.full_name || "",
        role: user.role || "USER",
        don_vi_id: user?.don_vi?.id ? user?.don_vi?.id.toString() : "",
        is_active: user.is_active ? "1" : "0",
      });
    } else {
      setEditingId(null);
      setForm({
        username: "",
        password: "",
        full_name: "",
        role: "USER",
        don_vi_id: "",
        is_active: "1",
      });
    }
    setModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa tài khoản này?")) {
      try {
        await userService.delete(id);
        fetchData(); // Cập nhật lại danh sách
      } catch (error) {
        alert("Lỗi khi xóa tài khoản!");
      }
    }
  };

  const handleSave = async () => {
    // Validate cơ bản
    if (!form.username) {
      alert("Vui lòng nhập tên đăng nhập!");
      return;
    }
    if (!editingId && !form.password) {
      alert("Vui lòng nhập mật khẩu cho tài khoản mới!");
      return;
    }

    try {
      const payload: Partial<any> = {
        username: form.username,
        full_name: form.full_name,
        role: form.role,
        don_vi_id: form.don_vi_id ? parseInt(form.don_vi_id) : null,
        is_active: parseInt(form.is_active),
      };

      // Chỉ gửi password nếu người dùng có nhập (tránh ghi đè pass cũ thành rỗng)
      if (form.password) {
        payload.password = form.password;
      }

      if (editingId) {
        await userService.update(editingId, payload);
      } else {
        await userService.create(payload);
      }

      setModalOpen(false);
      fetchData(); // Làm mới data
    } catch (error) {
      alert("Lỗi khi lưu thông tin tài khoản!");
    }
  };

  // Hàm đệ quy render Option Select dạng Cây cho Đơn Vị
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
          QUẢN LÝ TÀI KHOẢN
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
            background: "linear-gradient(135deg, #0EA5E9, #3B82F6)",
            color: "#fff",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          <Icon name="plus" size={16} /> TẠO TÀI KHOẢN
        </button>
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
                borderBottom: "1px solid rgba(14,165,233,0.2)",
              }}
            >
              {[
                "Username",
                "Họ tên",
                "Vai trò",
                "Đơn vị",
                "Trạng thái",
                "Thao tác",
              ].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "14px 16px",
                    textAlign: "left",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "#0EA5E9",
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
            {users.map((row) => (
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
                    color: "#0EA5E9",
                    fontFamily: "'Courier New', monospace",
                    fontWeight: 600,
                  }}
                >
                  {row.username}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 13,
                    color: "#E2E8F0",
                  }}
                >
                  {row.full_name}
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <span
                    style={{
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      background:
                        row.role === "ADMIN"
                          ? "rgba(239,68,68,0.15)"
                          : row.role === "MANAGER"
                            ? "rgba(245,158,11,0.15)"
                            : "rgba(100,116,139,0.15)",
                      color:
                        row.role === "ADMIN"
                          ? "#EF4444"
                          : row.role === "MANAGER"
                            ? "#F59E0B"
                            : "#94A3B8",
                    }}
                  >
                    {row.role}
                  </span>
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 12,
                    color: "#94A3B8",
                  }}
                >
                  {row?.don_vi?.ma_don_vi || "—"}
                </td>
                <td
                  style={{
                    padding: "14px 16px",
                    fontSize: 12,
                    color: row.is_active ? "#00D4AA" : "#EF4444",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: row.is_active ? "#00D4AA" : "#EF4444",
                        boxShadow: row.is_active ? "0 0 6px #00D4AA" : "none",
                      }}
                    />
                    {row.is_active ? "Hoạt động" : "Vô hiệu"}
                  </span>
                </td>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleOpenModal(row)}
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
                      onClick={() => handleDelete(row.id!)}
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
            ))}
            {users.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  style={{ padding: 30, textAlign: "center", color: "#64748B" }}
                >
                  Chưa có tài khoản nào
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD User */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? "Cập nhật tài khoản" : "Thêm tài khoản"}
        accentColor="#0EA5E9"
      >
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          <FormGroup label="Tên đăng nhập (Username)">
            <Input
              value={form.username}
              onChange={(e: any) =>
                setForm({ ...form, username: e.target.value })
              }
              placeholder="VD: nguyen.van.a"
              disabled={!!editingId}
              style={{ opacity: editingId ? 0.6 : 1 }}
            />
          </FormGroup>

          {/* Trường nhập Mật khẩu */}
          <FormGroup label={editingId ? "Đổi mật khẩu" : "Mật khẩu *"}>
            <Input
              type="password"
              value={form.password}
              onChange={(e: any) =>
                setForm({ ...form, password: e.target.value })
              }
              placeholder="Nhập mật khẩu..."
            />
          </FormGroup>
        </div>

        <FormGroup label="Họ và tên đầy đủ">
          <Input
            value={form.full_name}
            onChange={(e: any) =>
              setForm({ ...form, full_name: e.target.value })
            }
            placeholder="VD: Đại úy Nguyễn Văn A"
          />
        </FormGroup>

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}
        >
          {/* SỬ DỤNG TREE SELECT CHO ĐƠN VỊ */}
          <FormGroup label="Đơn vị quản lý">
            <Select
              value={form.don_vi_id}
              onChange={(e: any) =>
                setForm({ ...form, don_vi_id: e.target.value })
              }
            >
              <option value="">-- Không trực thuộc --</option>
              {renderTreeOptions(treeData)}
            </Select>
          </FormGroup>

          <FormGroup label="Phân quyền (Role)">
            <Select
              value={form.role}
              onChange={(e: any) => setForm({ ...form, role: e.target.value })}
            >
              <option value="ADMIN">Quản trị viên (ADMIN)</option>
              <option value="MANAGER">Quản lý (MANAGER)</option>
              <option value="KTV">Kỹ thuật viên (KTV)</option>
              <option value="USER">Người dùng (USER)</option>
            </Select>
          </FormGroup>
        </div>

        <FormGroup label="Trạng thái hoạt động">
          <Select
            value={form.is_active}
            onChange={(e: any) =>
              setForm({ ...form, is_active: e.target.value })
            }
          >
            <option value="1">Đang hoạt động</option>
            <option value="0">Vô hiệu hóa</option>
          </Select>
        </FormGroup>

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
              background: `linear-gradient(135deg, #0EA5E9, #3B82F6)`,
              color: "#fff",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            {editingId ? "CẬP NHẬT" : "TẠO TÀI KHOẢN"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
