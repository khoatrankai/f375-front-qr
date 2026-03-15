/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Icon } from "@/src/components/ui/Icon";
import { QRScannerModal } from "@/src/components/ui/Shared";
import { useState } from "react";
import { sanPhamService } from "@/src/services/sanPham.service"; // Bổ sung import service

export default function QRScanner() {
  const [scanning, setScanning] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [result, setResult] = useState<any>(null);
  // State để hiển thị thông báo lỗi nếu quét QR không hợp lệ hoặc lỗi mạng
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleScanClick = () => {
    setErrorMsg(null); // Xoá lỗi cũ nếu có
    setIsScannerOpen(true);
  };

  const handleScanSuccess = async (qrText: string) => {
    // Đóng modal camera ngay khi quét xong
    // alert(qrText);
    setIsScannerOpen(false);
    setScanning(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // Gọi API lấy thông tin trang bị dựa trên mã QR vừa quét được
      const data = await sanPhamService.getTrangBiByQR(qrText);

      // Map dữ liệu thực tế từ API sang định dạng hiển thị của bạn
      // (Bạn có thể cần điều chỉnh các trường này cho khớp với cấu trúc trả về thực tế từ API)
      setResult({
        ma: data.ma_qr || qrText, // Ưu tiên mã QR từ API, nếu không dùng mã quét được
        ten: data.ten_san_pham || "Chưa cập nhật",
        serial: data.serial || "Không có",
        cap: data.cap_chat_luong || "1",
        trangThai: data.trang_thai || "Không xác định",
        donVi: data.don_vi_quan_ly || "Không xác định",
        kho: data.kho || "Không xác định",
        ngayNhap: data.created_at
          ? new Date(data.created_at).toLocaleDateString("vi-VN")
          : "—",
      });
    } catch (error: any) {
      console.error("Lỗi khi lấy thông tin sản phẩm:", error);
      setErrorMsg(
        error.message || "Không tìm thấy thông tin sản phẩm cho mã QR này.",
      );
    } finally {
      setScanning(false);
    }
  };

  return (
    <div>
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
        QUÉT MÃ QR
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: "1px solid rgba(0,212,170,0.2)",
            borderRadius: 12,
            padding: 32,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div
              style={{
                width: 240,
                height: 240,
                margin: "0 auto",
                borderRadius: 12,
                position: "relative",
                overflow: "hidden",
                background: scanning
                  ? "rgba(0,212,170,0.05)"
                  : "rgba(15,23,42,0.9)",
                border: `2px solid ${scanning ? "#00D4AA" : "rgba(0,212,170,0.3)"}`,
                transition: "all 0.3s",
              }}
            >
              {scanning ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 12,
                  }}
                >
                  <p style={{ color: "#00D4AA", fontSize: 13 }}>
                    Đang tải dữ liệu...
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    gap: 8,
                  }}
                >
                  <Icon name="qr" size={64} />
                  <p style={{ color: "#64748B", fontSize: 13 }}>
                    Đặt mã QR vào khung
                  </p>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleScanClick}
            disabled={scanning}
            style={{
              width: "100%",
              padding: "12px 0",
              borderRadius: 8,
              border: "none",
              cursor: scanning ? "not-allowed" : "pointer",
              background: scanning
                ? "rgba(0,212,170,0.3)"
                : "linear-gradient(135deg, #00D4AA, #0EA5E9)",
              color: "#0F172A",
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 1,
            }}
          >
            {scanning ? "ĐANG TẢI..." : "BẮT ĐẦU QUÉT"}
          </button>
        </div>

        <div
          style={{
            background: "rgba(15,23,42,0.8)",
            border: `1px solid ${result ? "rgba(0,212,170,0.4)" : errorMsg ? "rgba(239,68,68,0.4)" : "rgba(100,116,139,0.2)"}`,
            borderRadius: 12,
            padding: 32,
          }}
        >
          {result ? (
            <div>
              <h3
                style={{
                  color: "#00D4AA",
                  fontSize: 14,
                  fontWeight: 700,
                  marginBottom: 20,
                }}
              >
                KẾT QUẢ NHẬN DẠNG
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {[
                  { label: "Mã trang bị", value: result.ma },
                  { label: "Tên thiết bị", value: result.ten },
                  { label: "Số serial", value: result.serial },
                  { label: "Cấp chất lượng", value: result.cap },
                  { label: "Trạng thái", value: result.trangThai },
                  { label: "Đơn vị quản lý", value: result.donVi },
                  { label: "Kho hiện tại", value: result.kho },
                  { label: "Ngày nhập", value: result.ngayNhap },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "rgba(30,41,59,0.5)",
                      borderRadius: 8,
                    }}
                  >
                    <span style={{ color: "#64748B", fontSize: 12 }}>
                      {item.label}
                    </span>
                    <span
                      style={{
                        color: "#E2E8F0",
                        fontSize: 13,
                        fontWeight: 600,
                      }}
                    >
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : errorMsg ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 300,
                color: "#EF4444",
                gap: 12,
                textAlign: "center",
              }}
            >
              <Icon name="x" size={48} />
              <p style={{ fontSize: 14, fontWeight: 600 }}>Lỗi truy xuất</p>
              <p style={{ fontSize: 12, color: "#FCA5A5" }}>{errorMsg}</p>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                minHeight: 300,
                color: "#374151",
                gap: 12,
              }}
            >
              <Icon name="qr" size={48} />
              <p style={{ fontSize: 14 }}>Chưa có kết quả quét</p>
            </div>
          )}
        </div>
      </div>
      {/* MODAL CAMERA QUÉT QR VÀ ĐẨY VÀO STATE */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
}
