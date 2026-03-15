/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { authService } from "@/src/services/auth.service";

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Lấy token từ localStorage
    const token = authService.getToken();

    // Trường hợp 1: Chưa đăng nhập mà cố vào các trang bên trong
    if (!token && pathname !== "/login") {
      router.push("/login");
    }
    // Trường hợp 2: Đã đăng nhập rồi nhưng lại gõ URL quay lại trang đăng nhập
    else if (token && pathname === "/login") {
      router.push("/warehouse"); // Hoặc dashboard tùy trang chủ của bạn
    }
    // Trường hợp 3: Hợp lệ -> Cho phép render nội dung
    else {
      setIsChecking(false);
    }
  }, [pathname, router]);

  // Trong lúc đang kiểm tra (tránh bị chớp nháy giao diện cũ trước khi bị redirect)
  if (isChecking) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0F172A",
          color: "#00D4AA",
          fontFamily: "monospace",
        }}
      >
        ĐANG KIỂM TRA QUYỀN TRUY CẬP...
      </div>
    );
  }

  // Vượt qua vòng gửi xe -> Trả về giao diện thực tế
  return <>{children}</>;
}
