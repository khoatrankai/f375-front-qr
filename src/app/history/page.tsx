/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { QRScannerModal, StatusBadge } from "@/src/components/ui/Shared";
import { sanPhamService } from "@/src/services/sanPham.service";

export default function TraCuuThietBiPage() {
  const [qrInput, setQrInput] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hàm xử lý gọi API tra cứu
  const handleSearch = async (qrCode: string) => {
    if (!qrCode.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await sanPhamService.getChiTietVaLichSuByQR(qrCode);
      setResult(data); // data chứa { thong_tin: {...}, lich_su: [...] }
    } catch (error: any) {
      setErrorMsg("Không tìm thấy thiết bị với mã QR này hoặc có lỗi xảy ra.");
    } finally {
      setLoading(false);
    }
  };

  // Xử lý khi ấn nút Tra Cứu (nhập tay)
  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(qrInput);
  };

  // Helper lấy màu sắc cho từng loại sự kiện trong lịch sử
  const getEventColor = (type: string) => {
    switch (type) {
      case "TAO_MOI":
        return "#3B82F6"; // Xanh dương
      case "CHO_MUON":
        return "#F59E0B"; // Vàng cam
      case "DA_TRA":
        return "#10B981"; // Xanh lá
      case "BAO_DUONG":
        return "#EF4444"; // Đỏ
      case "XUAT_KHO":
        return "#8B5CF6"; // Tím
      case "NHAP_KHO":
        return "#00D4AA"; // Xanh ngọc
      default:
        return "#64748B"; // Xám mặc định
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
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
        TRA CỨU THÔNG TIN & LỊCH SỬ THIẾT BỊ
      </h2>

      {/* THANH TÌM KIẾM */}
      <form
        onSubmit={handleManualSearch}
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 32,
          background: "rgba(15,23,42,0.6)",
          padding: 20,
          borderRadius: 12,
          border: "1px solid rgba(100,116,139,0.2)",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <span
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#64748B",
            }}
          >
            <Icon name="search" size={18} />
          </span>
          <input
            value={qrInput}
            onChange={(e) => setQrInput(e.target.value)}
            placeholder="Nhập mã QR thiết bị cần tra cứu..."
            style={{
              width: "100%",
              padding: "14px 16px 14px 44px",
              background: "rgba(15,23,42,0.8)",
              border: "1px solid rgba(100,116,139,0.3)",
              borderRadius: 8,
              color: "#E2E8F0",
              fontSize: 14,
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <button
          type="button"
          onClick={() => setIsScannerOpen(true)}
          style={{
            padding: "0 20px",
            background: "rgba(0,212,170,0.15)",
            border: "1px solid rgba(0,212,170,0.3)",
            color: "#00D4AA",
            borderRadius: 8,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyItems: "center",
            gap: 8,
            fontWeight: 700,
          }}
        >
          <span style={{ fontSize: 20 }}>📷</span> QUÉT QR
        </button>

        <button
          type="submit"
          disabled={loading || !qrInput.trim()}
          style={{
            padding: "0 24px",
            background: "linear-gradient(135deg, #3B82F6, #0EA5E9)",
            border: "none",
            color: "#fff",
            borderRadius: 8,
            cursor: loading || !qrInput.trim() ? "not-allowed" : "pointer",
            fontWeight: 700,
            letterSpacing: 1,
            opacity: loading || !qrInput.trim() ? 0.7 : 1,
          }}
        >
          {loading ? "ĐANG TÌM..." : "TRA CỨU"}
        </button>
      </form>

      {/* THÔNG BÁO LỖI */}
      {errorMsg && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#FCA5A5",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* KẾT QUẢ HIỂN THỊ */}
      {result && result.thong_tin && (
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}
        >
          {/* CỘT TRÁI: THÔNG TIN CƠ BẢN */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3
              style={{
                color: "#0EA5E9",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              📋 THÔNG TIN THIẾT BỊ
            </h3>

            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(14,165,233,0.2)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: "#E2E8F0",
                  marginBottom: 20,
                }}
              >
                {result.thong_tin.ten_san_pham}
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed rgba(100,116,139,0.2)",
                    paddingBottom: 12,
                  }}
                >
                  <span style={{ color: "#64748B", fontSize: 13 }}>
                    Mã cá thể (QR)
                  </span>
                  <span
                    style={{
                      color: "#00D4AA",
                      fontWeight: 700,
                      fontFamily: "'Courier New', monospace",
                      fontSize: 14,
                    }}
                  >
                    {result.thong_tin.ma_ca_the}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed rgba(100,116,139,0.2)",
                    paddingBottom: 12,
                  }}
                >
                  <span style={{ color: "#64748B", fontSize: 13 }}>
                    Số Serial (S/N)
                  </span>
                  <span
                    style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 13 }}
                  >
                    {result.thong_tin.serial || "—"}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    borderBottom: "1px dashed rgba(100,116,139,0.2)",
                    paddingBottom: 12,
                  }}
                >
                  <span style={{ color: "#64748B", fontSize: 13 }}>
                    Trạng thái
                  </span>
                  <StatusBadge status={result.thong_tin.trang_thai} />
                </div>

                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "#64748B", fontSize: 13 }}>
                    Vị trí hiện tại
                  </span>
                  <span
                    style={{ color: "#F59E0B", fontWeight: 600, fontSize: 13 }}
                  >
                    {result.thong_tin.kho || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TIMELINE LỊCH SỬ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3
              style={{
                color: "#0EA5E9",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              ⏱️ LỊCH SỬ HOẠT ĐỘNG
            </h3>

            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(100,116,139,0.2)",
                borderRadius: 12,
                padding: 24,
                maxHeight: 500,
                overflowY: "auto",
              }}
            >
              {!result.lich_su || result.lich_su.length === 0 ? (
                <div
                  style={{ color: "#64748B", textAlign: "center", padding: 20 }}
                >
                  Chưa có lịch sử hoạt động.
                </div>
              ) : (
                <div
                  style={{
                    borderLeft: "2px solid rgba(100,116,139,0.3)",
                    marginLeft: 12,
                    paddingLeft: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 24,
                  }}
                >
                  {result.lich_su.map((evt: any, idx: number) => {
                    const evtColor = getEventColor(evt.loai_su_kien);
                    return (
                      <div key={idx} style={{ position: "relative" }}>
                        {/* Chấm tròn đánh dấu trên timeline */}
                        <div
                          style={{
                            position: "absolute",
                            left: -31,
                            top: 4,
                            width: 12,
                            height: 12,
                            borderRadius: "50%",
                            background: evtColor,
                            boxShadow: `0 0 10px ${evtColor}88`,
                          }}
                        />

                        <div
                          style={{
                            fontSize: 12,
                            color: "#94A3B8",
                            marginBottom: 4,
                          }}
                        >
                          {new Date(evt.ngay_thuc_hien).toLocaleString("vi-VN")}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 6,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: evtColor,
                            }}
                          >
                            {evt.loai_su_kien}
                          </span>
                          <span
                            style={{
                              fontSize: 12,
                              color: "#64748B",
                              background: "rgba(255,255,255,0.05)",
                              padding: "2px 8px",
                              borderRadius: 12,
                            }}
                          >
                            {evt.nguoi_thuc_hien}
                          </span>
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            color: "#E2E8F0",
                            lineHeight: 1.5,
                          }}
                        >
                          {evt.ghi_chu || "Không có ghi chú"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tích hợp Modal Quét QR Camera (Dùng chung) */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(text) => {
          setQrInput(text); // Điền vào ô input
          handleSearch(text); // Tự động gọi hàm tìm kiếm luôn
        }}
      />
    </div>
  );
}
