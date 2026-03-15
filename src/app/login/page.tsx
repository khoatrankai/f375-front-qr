/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/src/components/ui/Icon";
import { authService } from "@/src/services/auth.service";

export default function LoginPage() {
  const router = useRouter();

  // Trạng thái UI
  const [isLoginView, setIsLoginView] = useState(true); // true = Login, false = Forgot Password
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Đăng nhập
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Form Quên mật khẩu
  const [forgotInput, setForgotInput] = useState("");

  // Xử lý Đăng nhập
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!username || !password) {
      setErrorMsg("Vui lòng nhập tài khoản và mật khẩu!");
      return;
    }

    setIsLoading(true);
    try {
      await authService.login(username, password);
      setSuccessMsg("Đăng nhập thành công! Đang chuyển hướng...");
      // Chuyển hướng sang trang Dashboard hoặc Kho sau khi đăng nhập thành công
      setTimeout(() => {
        router.push("/warehouse"); // Đổi đường dẫn theo trang chủ của bạn
      }, 1000);
    } catch (error: any) {
      setErrorMsg(error.message || "Tài khoản hoặc mật khẩu không chính xác!");
      setIsLoading(false);
    }
  };

  // Xử lý Quên mật khẩu
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    if (!forgotInput) {
      setErrorMsg("Vui lòng nhập tài khoản hoặc email của bạn!");
      return;
    }

    setIsLoading(true);
    try {
      // Giả lập gọi API Quên mật khẩu
      await authService.forgotPassword(forgotInput);
      setSuccessMsg(
        "Yêu cầu thành công! Vui lòng kiểm tra email của quản trị viên.",
      );
      setTimeout(() => {
        setIsLoginView(true);
        setSuccessMsg("");
      }, 3000);
    } catch (error: any) {
      setErrorMsg(error.message || "Không tìm thấy thông tin tài khoản!");
    } finally {
      setIsLoading(false);
    }
  };

  // Đổi view
  const toggleView = () => {
    setIsLoginView(!isLoginView);
    setErrorMsg("");
    setSuccessMsg("");
    setUsername("");
    setPassword("");
    setForgotInput("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at center, #1E293B 0%, #0F172A 100%)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: 400,
          background: "rgba(15,23,42,0.8)",
          border: "1px solid rgba(0,212,170,0.3)",
          borderRadius: 16,
          padding: 40,
          boxShadow: "0 0 60px rgba(0,212,170,0.1)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Trang trí góc */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "linear-gradient(to right, #00D4AA, #0EA5E9)",
          }}
        />

        {/* LOGO / TIÊU ĐỀ */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto",
              background: "rgba(0,212,170,0.1)",
              border: "1px solid rgba(0,212,170,0.3)",
              borderRadius: 16,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#00D4AA",
              marginBottom: 16,
            }}
          >
            <Icon name="shield" size={32} />
          </div>
          <h1
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#E2E8F0",
              margin: 0,
              letterSpacing: 2,
              fontFamily: "'Courier New', monospace",
            }}
          >
            HỆ THỐNG QUẢN LÝ
          </h1>
          <p style={{ fontSize: 13, color: "#64748B", marginTop: 8 }}>
            Mã hóa & Xác thực an toàn
          </p>
        </div>

        {/* THÔNG BÁO LỖI / THÀNH CÔNG */}
        {errorMsg && (
          <div
            style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#FCA5A5",
              padding: "10px 16px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            style={{
              background: "rgba(16,185,129,0.1)",
              border: "1px solid rgba(16,185,129,0.3)",
              color: "#6EE7B7",
              padding: "10px 16px",
              borderRadius: 8,
              fontSize: 13,
              marginBottom: 20,
              textAlign: "center",
            }}
          >
            {successMsg}
          </div>
        )}

        {/* =========================================
            FORM ĐĂNG NHẬP 
            ========================================= */}
        {isLoginView ? (
          <form
            onSubmit={handleLogin}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
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
                TÀI KHOẢN
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                >
                  <Icon name="user" size={16} />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={isLoading}
                  placeholder="Nhập tên đăng nhập..."
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(100,116,139,0.4)",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#00D4AA")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(100,116,139,0.4)")
                  }
                />
              </div>
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
                MẬT KHẨU
              </label>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                >
                  <Icon name="lock" size={16} />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="••••••••"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    background: "rgba(15,23,42,0.6)",
                    border: "1px solid rgba(100,116,139,0.4)",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                    transition: "border-color 0.2s",
                    fontFamily: "'Courier New', monospace",
                    letterSpacing: 2,
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#00D4AA")}
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(100,116,139,0.4)")
                  }
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <span
                onClick={toggleView}
                style={{
                  fontSize: 12,
                  color: "#0EA5E9",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Quên mật khẩu?
              </span>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
                color: "#0F172A",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 1,
                cursor: isLoading ? "not-allowed" : "pointer",
                marginTop: 8,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "ĐANG XÁC THỰC..." : "ĐĂNG NHẬP HỆ THỐNG"}
            </button>
          </form>
        ) : (
          /* =========================================
            FORM QUÊN MẬT KHẨU 
            ========================================= */
          <form
            onSubmit={handleForgotPassword}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div
              style={{
                textAlign: "center",
                color: "#94A3B8",
                fontSize: 13,
                marginBottom: 8,
              }}
            >
              Vui lòng nhập tài khoản hoặc Email để hệ thống gửi yêu cầu cấp lại
              mật khẩu.
            </div>

            <div>
              <div style={{ position: "relative" }}>
                <span
                  style={{
                    position: "absolute",
                    left: 14,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#64748B",
                  }}
                >
                  <Icon name="mail" size={16} />
                </span>
                <input
                  type="text"
                  value={forgotInput}
                  onChange={(e) => setForgotInput(e.target.value)}
                  disabled={isLoading}
                  placeholder="Nhập Username hoặc Email..."
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
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
                width: "100%",
                padding: "14px",
                borderRadius: 8,
                border: "none",
                background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                color: "#fff",
                fontWeight: 800,
                fontSize: 14,
                letterSpacing: 1,
                cursor: isLoading ? "not-allowed" : "pointer",
                marginTop: 8,
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "ĐANG GỬI YÊU CẦU..." : "GỬI YÊU CẦU KHÔI PHỤC"}
            </button>

            <div style={{ textAlign: "center", marginTop: 16 }}>
              <span
                onClick={toggleView}
                style={{
                  fontSize: 13,
                  color: "#64748B",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Icon name="chevron-left" size={14} /> Quay lại Đăng nhập
              </span>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
