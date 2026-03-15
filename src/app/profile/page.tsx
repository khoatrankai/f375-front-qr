/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
// import { Icon } from "@/src/components/ui/Icon";
import { userService } from "@/src/services/user.service"; // Bổ sung import

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const parsed = JSON.parse(userStr);
        setUser(parsed);
        setFullName(parsed.full_name || "");

        if (parsed.profile_data) {
          let pData = parsed.profile_data;
          if (typeof pData === "string") pData = JSON.parse(pData);
          setPhone(pData.phone || "");
          setAddress(pData.address || "");
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const newProfileData = {
        phone: phone,
        address: address,
      };

      const payload = {
        full_name: fullName,
        profile_data: JSON.stringify(newProfileData),
      };

      // GỌI API CẬP NHẬT HỒ SƠ
      await userService.updateProfile(payload);

      // Cập nhật thành công -> Cập nhật lại state và LocalStorage
      const updatedUser = {
        ...user,
        full_name: fullName,
        profile_data: payload.profile_data,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);

      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });

      // Bắn event để Header AppLayout cập nhật lại tên ngay lập tức (Tuỳ chọn)
      window.dispatchEvent(new Event("storage"));
    } catch (error: any) {
      setMessage({
        type: "error",
        text: error.message || "Cập nhật thất bại!",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user)
    return (
      <div style={{ color: "#E2E8F0", padding: 20 }}>Đang tải dữ liệu...</div>
    );

  return (
    <div style={{ maxWidth: 800, margin: "0 auto" }}>
      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#E2E8F0",
          marginBottom: 24,
          fontFamily: "'Courier New', monospace",
          letterSpacing: 2,
        }}
      >
        THÔNG TIN CÁ NHÂN
      </h2>

      <div
        style={{ display: "grid", gridTemplateColumns: "250px 1fr", gap: 24 }}
      >
        {/* CỘT TRÁI: AVATAR & INFO FIX */}
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.2)",
            borderRadius: 12,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 40,
              fontWeight: 800,
              color: "#0F172A",
              marginBottom: 16,
              boxShadow: "0 0 20px rgba(0,212,170,0.2)",
            }}
          >
            {user.full_name
              ? user.full_name.charAt(0)
              : user.username?.charAt(0)}
          </div>

          <div style={{ fontSize: 18, fontWeight: 700, color: "#E2E8F0" }}>
            {user.username}
          </div>
          <div
            style={{
              fontSize: 12,
              color: "#0EA5E9",
              background: "rgba(14,165,233,0.1)",
              padding: "4px 12px",
              borderRadius: 20,
              marginTop: 8,
              fontWeight: 600,
            }}
          >
            Quyền: {user.role}
          </div>

          <div
            style={{
              width: "100%",
              height: 1,
              background: "rgba(100,116,139,0.2)",
              margin: "20px 0",
            }}
          />

          <div
            style={{
              width: "100%",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#64748B" }}>ID Tài khoản:</span>
              <span style={{ color: "#E2E8F0", fontWeight: 600 }}>
                #{user.id}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#64748B" }}>Đơn vị:</span>
              <span style={{ color: "#E2E8F0", fontWeight: 600 }}>
                {user.don_vi_id || "Không có"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#64748B" }}>Trạng thái:</span>
              <span
                style={{
                  color: user.is_active ? "#10B981" : "#EF4444",
                  fontWeight: 600,
                }}
              >
                {user.is_active ? "Đang hoạt động" : "Bị khóa"}
              </span>
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: FORM CHỈNH SỬA */}
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.2)",
            borderRadius: 12,
            padding: 32,
          }}
        >
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: "#00D4AA",
              marginBottom: 24,
              borderBottom: "1px dashed rgba(0,212,170,0.3)",
              paddingBottom: 12,
            }}
          >
            CẬP NHẬT THÔNG TIN HỒ SƠ
          </h3>

          {message.text && (
            <div
              style={{
                padding: 12,
                borderRadius: 8,
                marginBottom: 20,
                fontSize: 13,
                background:
                  message.type === "success"
                    ? "rgba(16,185,129,0.1)"
                    : "rgba(239,68,68,0.1)",
                color: message.type === "success" ? "#6EE7B7" : "#FCA5A5",
                border: `1px solid ${message.type === "success" ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`,
              }}
            >
              {message.text}
            </div>
          )}

          <form
            onSubmit={handleUpdateProfile}
            style={{ display: "flex", flexDirection: "column", gap: 20 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "#94A3B8",
                  marginBottom: 8,
                  fontWeight: 600,
                }}
              >
                Họ và Tên
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  background: "rgba(15,23,42,0.6)",
                  border: "1px solid rgba(100,116,139,0.4)",
                  borderRadius: 8,
                  color: "#E2E8F0",
                  fontSize: 14,
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#94A3B8",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Nhập SĐT..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(100,116,139,0.4)",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    display: "block",
                    fontSize: 12,
                    color: "#94A3B8",
                    marginBottom: 8,
                    fontWeight: 600,
                  }}
                >
                  Địa chỉ / Nơi công tác
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Nhập địa chỉ..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(100,116,139,0.4)",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: "14px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
                color: "#0F172A",
                fontWeight: 800,
                cursor: isLoading ? "not-allowed" : "pointer",
                marginTop: 12,
                opacity: isLoading ? 0.7 : 1,
                letterSpacing: 1,
              }}
            >
              {isLoading ? "ĐANG LƯU..." : "LƯU THAY ĐỔI"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
