/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
// import { Icon } from "../ui/Icon";
import { Modal, FormGroup, Input } from "../ui/Shared";
import { userService } from "@/src/services/user.service"; // Bổ sung import này

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!oldPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Vui lòng điền đầy đủ các trường!");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp!");
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg("Mật khẩu mới phải có ít nhất 6 ký tự!");
      return;
    }

    setLoading(true);
    try {
      // GỌI API THỰC TẾ
      await userService.changePassword(oldPassword, newPassword);

      setSuccessMsg("Đổi mật khẩu thành công!");
      setTimeout(() => {
        handleClose();
      }, 1500);
    } catch (error: any) {
      setErrorMsg(
        error.message || "Lỗi đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu cũ!",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrorMsg("");
    setSuccessMsg("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="ĐỔI MẬT KHẨU"
      accentColor="#0EA5E9"
    >
      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {errorMsg && (
          <div
            style={{
              color: "#FCA5A5",
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              padding: "10px",
              borderRadius: 8,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            style={{
              color: "#6EE7B7",
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              padding: "10px",
              borderRadius: 8,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            {successMsg}
          </div>
        )}

        <FormGroup label="Mật khẩu hiện tại (*)">
          <Input
            type="password"
            value={oldPassword}
            onChange={(e: any) => setOldPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
          />
        </FormGroup>

        <FormGroup label="Mật khẩu mới (*)">
          <Input
            type="password"
            value={newPassword}
            onChange={(e: any) => setNewPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
          />
        </FormGroup>

        <FormGroup label="Xác nhận mật khẩu mới (*)">
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e: any) => setConfirmPassword(e.target.value)}
            disabled={loading}
            placeholder="••••••••"
          />
        </FormGroup>

        <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
          <button
            type="button"
            onClick={handleClose}
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
            type="submit"
            disabled={loading}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: "linear-gradient(135deg, #0EA5E9, #3B82F6)",
              color: "#fff",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "ĐANG XỬ LÝ..." : "CẬP NHẬT"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
