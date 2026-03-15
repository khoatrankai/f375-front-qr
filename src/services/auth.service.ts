/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/auth.service.ts

const ENDPOINT = "https://f375-back-qr.onrender.com/api/auth"; // Điều chỉnh lại prefix route cho đúng với BE của bạn
export const getAuthHeaders = () => {
  const token = authService.getToken();
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};
export const authService = {
  // 1. Đăng nhập
  login: async (username: string, password: string): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/login`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ username, password }),
      });

      const res = await response.json();

      if (!response.ok || !res.success) {
        throw new Error(res.message || "Đăng nhập thất bại");
      }

      // Lưu Token và thông tin user vào LocalStorage
      if (res.data && res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user || {}));
      }

      return res;
    } catch (error) {
      console.error("authService.login error:", error);
      throw error;
    }
  },

  // 2. Đăng xuất
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login"; // Chuyển hướng về trang đăng nhập
  },

  // 3. Lấy Token hiện tại (Để các file service khác gọi vào)
  getToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("token");
    }
    return null;
  },

  // 4. API Quên mật khẩu (Mock)
  forgotPassword: async (usernameOrEmail: string): Promise<any> => {
    try {
      const response = await fetch(`${ENDPOINT}/forgot-password`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ username: usernameOrEmail }),
      });

      const res = await response.json();
      if (!response.ok)
        throw new Error(res.message || "Lỗi yêu cầu cấp lại mật khẩu");
      return res;
    } catch (error) {
      console.error("authService.forgotPassword error:", error);
      throw error;
    }
  },
};
