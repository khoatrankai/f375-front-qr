/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { Icon } from "../components/ui/Icon";
import { dashboardService } from "@/src/services/dashboard.service"; // Nhập service vừa tạo

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const resData = await dashboardService.getOverviewDashboard();
      setData(resData);
    } catch (error) {
      console.error("Không thể tải dữ liệu Dashboard", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ color: "#E2E8F0", padding: 20 }}>
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  // Nếu không có data, hiển thị fallback
  if (!data) {
    return (
      <div style={{ color: "#EF4444", padding: 20 }}>
        Lỗi tải dữ liệu. Vui lòng thử lại sau.
      </div>
    );
  }

  // Bóc tách dữ liệu từ API
  const tongQuan = data.tong_quan || {};
  const bieuDoHoatDong = data.bieu_do_hoat_dong || [];
  const canhBao = data.canh_bao_nhac_nho || [];
  const phanBo = data.phan_bo_trang_thai || {};

  // Chuẩn bị mảng để render 4 thẻ (Card) thống kê dựa theo MOCK cũ
  const statsCards = [
    {
      label: "TỔNG TRANG BỊ",
      value: tongQuan.tong_trang_bi?.gia_tri || 0,
      change: Math.abs(tongQuan.tong_trang_bi?.trend || 0),
      trend: (tongQuan.tong_trang_bi?.trend || 0) >= 0 ? "up" : "down",
      color: "#00D4AA",
      icon: "shield",
    },
    {
      label: "ĐANG MƯỢN",
      value: tongQuan.dang_cho_muon?.gia_tri || 0,
      change: Math.abs(tongQuan.dang_cho_muon?.trend || 0),
      trend: (tongQuan.dang_cho_muon?.trend || 0) >= 0 ? "up" : "down",
      color: "#F59E0B",
      icon: "file",
    },
    {
      label: "ĐANG BẢO DƯỠNG",
      value: tongQuan.dang_bao_duong?.gia_tri || 0,
      change: Math.abs(tongQuan.dang_bao_duong?.trend || 0),
      trend: (tongQuan.dang_bao_duong?.trend || 0) >= 0 ? "up" : "down",
      color: "#EF4444",
      icon: "settings",
    },
    {
      label: "SẴN SÀNG TRONG KHO",
      value: tongQuan.trong_kho?.gia_tri || 0,
      change: Math.abs(tongQuan.trong_kho?.trend || 0),
      trend: (tongQuan.trong_kho?.trend || 0) >= 0 ? "up" : "down",
      color: "#3B82F6",
      icon: "warehouse",
    },
  ];

  const maxVal = Math.max(...bieuDoHoatDong.map((d: any) => d.value), 1); // Tránh chia cho 0

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 28,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#E2E8F0",
              fontFamily: "'Courier New', monospace",
              letterSpacing: 3,
              marginBottom: 4,
            }}
          >
            TỔNG QUAN HỆ THỐNG
          </h2>
          <p style={{ color: "#64748B", fontSize: 13 }}>
            Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
          </p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={fetchDashboardData}
            style={{
              padding: "9px 16px",
              borderRadius: 8,
              border: "1px solid rgba(0,212,170,0.3)",
              background: "transparent",
              color: "#00D4AA",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Icon name="download" size={14} /> Làm mới báo cáo
          </button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {statsCards.map((s, i) => (
          <div
            key={i}
            style={{
              background: "rgba(15,23,42,0.8)",
              border: `1px solid ${s.color}22`,
              borderRadius: 12,
              padding: "20px 24px",
              position: "relative",
              overflow: "hidden",
              transition: "border-color 0.2s",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.borderColor = `${s.color}55`)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.borderColor = `${s.color}22`)
            }
          >
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 2,
                background: `linear-gradient(to right, ${s.color}, transparent)`,
              }}
            />
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                color: s.color,
                opacity: 0.15,
              }}
            >
              <Icon name={s.icon} size={48} />
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#64748B",
                letterSpacing: 1,
                textTransform: "uppercase",
                fontFamily: "'Courier New', monospace",
                marginBottom: 8,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontSize: 32,
                fontWeight: 700,
                color: s.color,
                fontFamily: "'Courier New', monospace",
                lineHeight: 1,
              }}
            >
              {s.value}
            </div>
            <div
              style={{
                marginTop: 8,
                fontSize: 12,
                color: s.trend === "up" ? "#00D4AA" : "#EF4444",
              }}
            >
              {s.trend === "up" ? "▲" : "▼"} {s.change} so với tháng trước
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.5fr 1fr",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.15)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3
            style={{
              color: "#E2E8F0",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 20,
              letterSpacing: 1,
              fontFamily: "'Courier New', monospace",
            }}
          >
            HOẠT ĐỘNG MƯỢN/TRẢ (6 THÁNG)
          </h3>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 12,
              height: 140,
            }}
          >
            {bieuDoHoatDong.map((d: any, i: number) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <span style={{ color: "#64748B", fontSize: 10 }}>
                  {d.value}
                </span>
                <div
                  style={{
                    width: "100%",
                    borderRadius: "4px 4px 0 0",
                    background: `linear-gradient(to top, #00D4AA, #0EA5E9)`,
                    height: `${(d.value / maxVal) * 100}px`,
                    minHeight: 4,
                    transition: "height 0.5s ease",
                  }}
                />
                <span style={{ color: "#64748B", fontSize: 11 }}>{d.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(100,116,139,0.15)",
            borderRadius: 12,
            padding: 24,
          }}
        >
          <h3
            style={{
              color: "#E2E8F0",
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 20,
              letterSpacing: 1,
              fontFamily: "'Courier New', monospace",
            }}
          >
            PHÂN BỐ TRẠNG THÁI
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              {
                label: "Trong kho",
                value: phanBo.trong_kho_pct || 0,
                color: "#3B82F6",
              },
              {
                label: "Đang mượn",
                value: phanBo.dang_muon_pct || 0,
                color: "#F59E0B",
              },
              {
                label: "Bảo dưỡng",
                value: phanBo.bao_duong_pct || 0,
                color: "#EF4444",
              },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>
                    {item.label}
                  </span>
                  <span
                    style={{ fontSize: 12, color: item.color, fontWeight: 700 }}
                  >
                    {item.value}%
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "rgba(30,41,59,0.8)",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${item.value}%`,
                      background: item.color,
                      borderRadius: 3,
                      transition: "width 1s ease",
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          background: "rgba(15,23,42,0.8)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          padding: 20,
        }}
      >
        <h3
          style={{
            color: "#EF4444",
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 16,
            letterSpacing: 1,
            fontFamily: "'Courier New', monospace",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Icon name="alert" size={16} /> CẢNH BÁO / NHẮC NHỞ
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {canhBao.length === 0 ? (
            <span style={{ color: "#64748B", fontSize: 13 }}>
              Không có cảnh báo nào.
            </span>
          ) : (
            canhBao.map((a: any, i: number) => {
              // Gán màu tuỳ theo "loai" trả về từ API
              let color = "#3B82F6"; // Info mặc định
              if (a.loai === "danger") color = "#EF4444";
              if (a.loai === "warning") color = "#F59E0B";

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "10px 14px",
                    background: `${color}0D`,
                    borderRadius: 8,
                    borderLeft: `3px solid ${color}`,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: color,
                      boxShadow: `0 0 6px ${color}`,
                    }}
                  />
                  <span style={{ fontSize: 13, color: "#E2E8F0" }}>
                    {a.thong_diep}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
