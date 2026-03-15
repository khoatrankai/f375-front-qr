/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { nhatKyService } from "@/src/services/nhatKy.service";

export default function LogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dữ liệu khi component được mount
  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await nhatKyService.getDanhSachNhatKy();
      setLogs(data || []);
    } catch (error) {
      console.error("Không thể tải nhật ký", error);
    } finally {
      setIsLoading(false);
    }
  };

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
            margin: 0,
          }}
        >
          NHẬT KÝ HỆ THỐNG
        </h2>
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          style={{
            padding: "8px 16px",
            background: "rgba(14,165,233,0.1)",
            border: "1px solid rgba(14,165,233,0.3)",
            color: "#0EA5E9",
            borderRadius: 8,
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {isLoading ? "ĐANG TẢI..." : "LÀM MỚI"}
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
        {isLoading && logs.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#64748B",
              fontSize: 14,
            }}
          >
            Đang tải dữ liệu nhật ký...
          </div>
        ) : logs.length === 0 ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#64748B",
              fontSize: 14,
            }}
          >
            Chưa có nhật ký nào được ghi nhận.
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr
                style={{
                  background: "rgba(30,41,59,0.8)",
                  borderBottom: "1px solid rgba(100,116,139,0.2)",
                }}
              >
                {[
                  "ID",
                  "Người dùng",
                  "Hành động",
                  "Bảng",
                  "Địa chỉ IP",
                  "Thời gian",
                ].map((h) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748B",
                      letterSpacing: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((row) => (
                <tr
                  key={row.id}
                  style={{ borderBottom: "1px solid rgba(100,116,139,0.08)" }}
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
                      color: "#64748B",
                    }}
                  >
                    {row.id}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 12,
                      color: "#00D4AA",
                      fontWeight: 600,
                    }}
                  >
                    {/* Tùy thuộc vào việc Backend join bảng User hay trả về user_id, 
                        bạn có thể thay đổi trường row.user_id hoặc row.username cho phù hợp */}
                    {row.user_id || row.username || "Hệ thống"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 13,
                      color: "#E2E8F0",
                    }}
                  >
                    {/* Map trường hành động từ DB (VD: CREATE, UPDATE, DELETE) ra text dễ đọc nếu cần */}
                    {row.action}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 11,
                      color: "#64748B",
                      background: "rgba(0,0,0,0.2)",
                    }}
                  >
                    {row.table_name}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 12,
                      color: "#94A3B8",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {row.ip_address || "—"}
                  </td>
                  <td
                    style={{
                      padding: "14px 16px",
                      fontSize: 12,
                      color: "#64748B",
                    }}
                  >
                    {row.created_at
                      ? new Date(row.created_at).toLocaleString("vi-VN")
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
