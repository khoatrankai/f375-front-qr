"use client";

import { usePathname } from "next/navigation";
import AuthGuard from "../components/auth/AuthGuard";
import AppLayout from "../components/layout/AppLayout";
import "./globals.css";

// Bỏ export metadata đi vì "use client" không hỗ trợ xuất metadata trực tiếp trong layout.
// Bạn có thể chuyển metadata sang một file server component hoặc kệ nó nếu không quá quan trọng về SEO lúc này.

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Xác định các trang KHÔNG cần Sidebar/Header (Ví dụ: login, forgot-password, 404,...)
  const isPublicPage = pathname === "/login";

  return (
    <html lang="vi">
      <title>VKTBKT - Quản lý trang bị</title>
      <body>
        <AuthGuard>
          {isPublicPage ? (
            /* Nếu là trang đăng nhập, chỉ render nội dung gốc (không có Sidebar) */
            children
          ) : (
            /* Nếu là trang bên trong, bọc giao diện AppLayout (có Sidebar + Header) */
            <AppLayout>{children}</AppLayout>
          )}
        </AuthGuard>
      </body>
    </html>
  );
}
