/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "../ui/Icon";
import { authService } from "@/src/services/auth.service";
import ChangePasswordModal from "../auth/ChangePasswordModal"; // Component sẽ tạo ở Bước 2

const NAV_ITEMS = [
  { id: "/", label: "Tổng quan", icon: "dashboard" },
  { id: "/qr", label: "Quét mã QR", icon: "qr" },
  { id: "/history", label: "Quét lịch sử QR", icon: "qr" },
  { id: "/equipment", label: "Quản lý trang bị", icon: "equipment" },
  { id: "/warehouse", label: "Quản lý kho", icon: "warehouse" },
  { id: "/handover", label: "Bàn giao / Chuyển kho", icon: "handover" },
  { id: "/borrow", label: "Cho mượn", icon: "borrow" },
  { id: "/maintenance", label: "Bảo dưỡng", icon: "maintenance" },
  { id: "/category", label: "Loại trang bị", icon: "category" },
  { id: "/worktype", label: "Loại công việc", icon: "worktype" },
  { id: "/units", label: "Quản lý đơn vị", icon: "unit" },
  { id: "/users", label: "Quản lý tài khoản", icon: "users" },
  { id: "/logs", label: "Nhật ký hệ thống", icon: "log" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());

  // States cho User & Dropdown
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // State Modal Đổi mật khẩu
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // Lấy thông tin user từ LocalStorage khi component mount
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Lỗi parse user data", e);
      }
    }
  }, []);

  // Xử lý click ra ngoài để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  // Lấy chữ cái đầu của Tên hiển thị trên Avatar
  const avatarLetter = user?.full_name
    ? user.full_name.charAt(0).toUpperCase()
    : user?.username?.charAt(0).toUpperCase() || "A";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background: "#080F1E",
        color: "#E2E8F0",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? 240 : 68,
          minHeight: "100vh",
          background: "linear-gradient(180deg, #0D1626 0%, #080F1E 100%)",
          borderRight: "1px solid rgba(0,212,170,0.12)",
          transition: "width 0.3s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "relative",
          zIndex: 10,
        }}
      >
        {/* ... (Phần Sidebar Header giữ nguyên) ... */}
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid rgba(0,212,170,0.1)",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              fontWeight: 900,
              fontSize: 16,
              color: "#0F172A",
              fontFamily: "'Courier New', monospace",
            }}
          >
            V
          </div>
          {sidebarOpen && (
            <div style={{ overflow: "hidden" }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#00D4AA",
                  fontFamily: "'Courier New', monospace",
                  letterSpacing: 2,
                  lineHeight: 1.2,
                }}
              >
                VKTBKT
              </div>
              <div style={{ fontSize: 10, color: "#475569", letterSpacing: 1 }}>
                Quản lý trang bị
              </div>
            </div>
          )}
        </div>

        {/* ... (Phần Nav Items giữ nguyên) ... */}
        <nav
          style={{
            flex: 1,
            padding: "12px 8px",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.id;
            return (
              <Link
                href={item.id}
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  textDecoration: "none",
                  padding: sidebarOpen ? "11px 14px" : "11px 16px",
                  borderRadius: 8,
                  textAlign: "left",
                  background: isActive ? "rgba(0,212,170,0.12)" : "transparent",
                  color: isActive ? "#00D4AA" : "#64748B",
                  borderLeft: isActive
                    ? "3px solid #00D4AA"
                    : "3px solid transparent",
                  transition: "all 0.15s",
                  justifyContent: sidebarOpen ? "flex-start" : "center",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                    e.currentTarget.style.color = "#94A3B8";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "#64748B";
                  }
                }}
              >
                <span style={{ flexShrink: 0, display: "flex" }}>
                  <Icon name={item.icon} size={18} />
                </span>
                {sidebarOpen && (
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 400,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          style={{
            margin: "12px 8px",
            padding: "10px",
            borderRadius: 8,
            border: "1px solid rgba(100,116,139,0.2)",
            background: "transparent",
            color: "#64748B",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
        >
          <Icon name="menu" size={18} />
        </button>
      </div>

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minWidth: 0,
        }}
      >
        {/* Header trên cùng */}
        <div
          style={{
            padding: "16px 28px",
            borderBottom: "1px solid rgba(100,116,139,0.12)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "rgba(13,22,38,0.9)",
            backdropFilter: "blur(12px)",
            position: "sticky",
            top: 0,
            zIndex: 5,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#E2E8F0",
                letterSpacing: 1,
              }}
            >
              {NAV_ITEMS.find((n) => n.id === pathname)?.label.toUpperCase()}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "#475569",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {time.toLocaleDateString("vi-VN")} —{" "}
              {time.toLocaleTimeString("vi-VN")}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* <div style={{ position: "relative" }}>
              <button
                style={{
                  padding: 8,
                  borderRadius: 8,
                  border: "1px solid rgba(100,116,139,0.2)",
                  background: "transparent",
                  color: "#64748B",
                  cursor: "pointer",
                }}
              >
                <Icon name="bell" size={18} />
              </button>
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  right: 4,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#EF4444",
                  border: "2px solid #0D1626",
                }}
              />
            </div> */}

            {/* KHỐI AVATAR USER - BỌC BỞI DROPDOWN REF */}
            <div
              style={{ position: "relative" }}
              onMouseEnter={() => setDropdownOpen(true)}
              onMouseLeave={() => setDropdownOpen(false)}
            >
              {/* Vùng Avatar */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 14px",
                  borderRadius: 8,
                  background: dropdownOpen
                    ? "rgba(30,41,59,0.9)"
                    : "rgba(30,41,59,0.6)",
                  border: "1px solid rgba(100,116,139,0.2)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#0F172A",
                  }}
                >
                  {avatarLetter}
                </div>
                <div>
                  <div
                    style={{ fontSize: 12, fontWeight: 600, color: "#E2E8F0" }}
                  >
                    {user?.username || "Tài khoản"}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>
                    {user?.role || "USER"}
                  </div>
                </div>
                <div
                  style={{
                    color: "#64748B",
                    marginLeft: 4,
                    transform: dropdownOpen ? "rotate(180deg)" : "rotate(0)",
                    transition: "transform 0.2s",
                  }}
                >
                  <Icon name="chevron" size={14} />
                </div>
              </div>

              {/* VÙNG ĐỆM TRONG SUỐT ĐỂ CHUỘT KHÔNG BỊ "TRƯỢT" MẤT MENU (Rất quan trọng khi dùng hover) */}
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    height: 8,
                    background: "transparent",
                    zIndex: 99,
                  }}
                />
              )}

              {/* DROPDOWN MENU */}
              {dropdownOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 8px)", // Cắt xuống 8px để tạo khoảng cách đẹp mắt
                    right: 0,
                    width: 220,
                    background: "#0F172A",
                    border: "1px solid rgba(100,116,139,0.3)",
                    borderRadius: 12,
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    overflow: "hidden",
                    zIndex: 100,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Header dropdown */}
                  <div
                    style={{
                      padding: "16px",
                      borderBottom: "1px solid rgba(100,116,139,0.15)",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "#E2E8F0",
                      }}
                    >
                      {user?.full_name || user?.username}
                    </div>
                    <div
                      style={{ fontSize: 11, color: "#94A3B8", marginTop: 4 }}
                    >
                      ID Đơn vị: {user?.don_vi_id || "Chưa cấp"}
                    </div>
                  </div>

                  {/* Danh sách Action */}
                  <div
                    style={{
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 4,
                    }}
                  >
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        router.push("/profile");
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 6,
                        background: "transparent",
                        border: "none",
                        color: "#E2E8F0",
                        fontSize: 13,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Icon name="user" size={16} /> Thông tin cá nhân
                    </button>

                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        setPasswordModalOpen(true);
                      }}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 6,
                        background: "transparent",
                        border: "none",
                        color: "#E2E8F0",
                        fontSize: 13,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,255,255,0.05)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Icon name="lock" size={16} /> Đổi mật khẩu
                    </button>

                    <div
                      style={{
                        height: 1,
                        background: "rgba(100,116,139,0.15)",
                        margin: "4px 0",
                      }}
                    />

                    <button
                      onClick={handleLogout}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 6,
                        background: "transparent",
                        border: "none",
                        color: "#EF4444",
                        fontSize: 13,
                        textAlign: "left",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(239,68,68,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Icon name="log" size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div style={{ flex: 1, padding: "28px 28px 40px", overflow: "auto" }}>
          {children}
        </div>
      </div>

      {/* Gắn Component Modal Đổi Mật Khẩu Tái Sử Dụng Ở Đây */}
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />
    </div>
  );
}
