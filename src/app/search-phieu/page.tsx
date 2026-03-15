/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { QRScannerModal } from "@/src/components/ui/Shared";
import { khoService } from "@/src/services/kho.service";

export default function TraCuuPhieuBaoMatPage() {
  const [qrInput, setQrInput] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDecryptSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!qrInput.trim() || !secretKey.trim()) {
      setErrorMsg("Vui lòng nhập chuỗi mã hóa và khóa bảo mật!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const data = await khoService.decryptPhieuKho(qrInput, secretKey);
      console.log(data);
      setResult(data);
    } catch (error: any) {
      setErrorMsg(
        "Giải mã thất bại! Sai khóa bảo mật hoặc chuỗi mã hóa không hợp lệ.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
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
        TRA CỨU & GIẢI MÃ PHIẾU KHO
      </h2>

      {/* FORM NHẬP LIỆU */}
      <form
        onSubmit={handleDecryptSearch}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
          marginBottom: 32,
          background: "rgba(15,23,42,0.6)",
          padding: 24,
          borderRadius: 12,
          border: "1px solid rgba(245,158,11,0.3)",
          boxShadow: "0 0 20px rgba(245,158,11,0.05)",
        }}
      >
        <div
          style={{
            color: "#F59E0B",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          🔐 BẢO MẬT PHIẾU KHO
        </div>

        <div style={{ display: "flex", gap: 12 }}>
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
              <Icon name="qr" size={18} />
            </span>
            <input
              value={qrInput}
              onChange={(e) => setQrInput(e.target.value)}
              placeholder="Nhập hoặc quét chuỗi QR Phiếu đã mã hóa..."
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(100,116,139,0.3)",
                borderRadius: 8,
                color: "#F59E0B",
                fontSize: 13,
                fontFamily: "'Courier New', monospace",
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
              background: "rgba(245,158,11,0.15)",
              border: "1px solid rgba(245,158,11,0.3)",
              color: "#F59E0B",
              borderRadius: 8,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 700,
            }}
          >
            <span style={{ fontSize: 20 }}>📷</span> QUÉT QR
          </button>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
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
              <Icon name="lock" size={18} />
            </span>
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Nhập khóa bảo mật (Secret Key)..."
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
            type="submit"
            disabled={loading || !qrInput.trim() || !secretKey.trim()}
            style={{
              padding: "0 32px",
              background: "linear-gradient(135deg, #F59E0B, #EF4444)",
              border: "none",
              color: "#fff",
              borderRadius: 8,
              cursor:
                loading || !qrInput.trim() || !secretKey.trim()
                  ? "not-allowed"
                  : "pointer",
              fontWeight: 800,
              letterSpacing: 1,
              opacity:
                loading || !qrInput.trim() || !secretKey.trim() ? 0.7 : 1,
              minWidth: 160,
            }}
          >
            {loading ? "ĐANG GIẢI MÃ..." : "GIẢI MÃ PHIẾU"}
          </button>
        </div>
      </form>

      {errorMsg && (
        <div
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.3)",
            color: "#FCA5A5",
            padding: 16,
            borderRadius: 8,
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* KẾT QUẢ HIỂN THỊ */}
      {result && result.thong_tin_phieu && (
        <div
          style={{ display: "grid", gridTemplateColumns: "350px 1fr", gap: 32 }}
        >
          {/* CỘT TRÁI: THÔNG TIN PHIẾU */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3
              style={{
                color: "#F59E0B",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              📄 THÔNG TIN PHIẾU
            </h3>

            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(245,158,11,0.2)",
                borderRadius: 12,
                padding: 24,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color:
                    result.thong_tin_phieu.loai_phieu === "NHAP_KHO"
                      ? "#00D4AA"
                      : "#F59E0B",
                  marginBottom: 20,
                  fontFamily: "'Courier New', monospace",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {result.thong_tin_phieu.loai_phieu === "NHAP_KHO" ? (
                  <Icon name="arrowdown" size={20} />
                ) : (
                  <Icon name="arrowup" size={20} />
                )}
                {result.thong_tin_phieu.ma_phieu}
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
                    Loại phiếu
                  </span>
                  <span
                    style={{ color: "#E2E8F0", fontWeight: 700, fontSize: 13 }}
                  >
                    {result.thong_tin_phieu.loai_phieu}
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
                  <span style={{ color: "#64748B", fontSize: 13 }}>Kho</span>
                  <span
                    style={{ color: "#0EA5E9", fontWeight: 600, fontSize: 13 }}
                  >
                    {result.thong_tin_phieu.ten_kho}
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
                    Người lập
                  </span>
                  <span
                    style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 13 }}
                  >
                    {result.thong_tin_phieu.nguoi_lap}
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
                    Ngày tạo
                  </span>
                  <span style={{ color: "#E2E8F0", fontSize: 13 }}>
                    {new Date(result.thong_tin_phieu.created_at).toLocaleString(
                      "vi-VN",
                    )}
                  </span>
                </div>
                <div
                  style={{ display: "flex", flexDirection: "column", gap: 6 }}
                >
                  <span style={{ color: "#64748B", fontSize: 13 }}>
                    Ghi chú:
                  </span>
                  <span
                    style={{
                      color: "#94A3B8",
                      fontSize: 13,
                      fontStyle: "italic",
                      lineHeight: 1.5,
                    }}
                  >
                    {result.thong_tin_phieu.ghi_chu || "Không có ghi chú"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: DANH SÁCH THIẾT BỊ TRONG PHIẾU */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3
              style={{
                color: "#F59E0B",
                fontSize: 14,
                fontWeight: 700,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              📦 CHI TIẾT THIẾT BỊ ({result.danh_sach_thiet_bi?.length || 0})
            </h3>

            <div
              style={{
                background: "rgba(15,23,42,0.6)",
                border: "1px solid rgba(100,116,139,0.2)",
                borderRadius: 12,
                overflow: "hidden",
              }}
            >
              <div style={{ maxHeight: 500, overflowY: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead
                    style={{
                      position: "sticky",
                      top: 0,
                      background: "#0F172A",
                      zIndex: 1,
                    }}
                  >
                    <tr
                      style={{
                        borderBottom: "1px solid rgba(100,116,139,0.3)",
                      }}
                    >
                      {["Thiết bị", "Mã QR", "Thông số", "Trạng thái"].map(
                        (h) => (
                          <th
                            key={h}
                            style={{
                              padding: "14px 16px",
                              textAlign: "left",
                              fontSize: 11,
                              color: "#94A3B8",
                              textTransform: "uppercase",
                            }}
                          >
                            {h}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {result.danh_sach_thiet_bi?.map((tb: any, idx: number) => (
                      <tr
                        key={idx}
                        style={{
                          borderBottom: "1px solid rgba(100,116,139,0.1)",
                        }}
                      >
                        <td style={{ padding: "14px 16px" }}>
                          <div
                            style={{
                              fontSize: 13,
                              color: "#E2E8F0",
                              fontWeight: 600,
                              marginBottom: 4,
                            }}
                          >
                            {tb.ten_san_pham}
                          </div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>
                            S/N: {tb.so_serial || "—"} | {tb.ten_danh_muc}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 13,
                            color: "#00D4AA",
                            fontWeight: 600,
                            fontFamily: "'Courier New', monospace",
                          }}
                        >
                          {tb.ma_qr}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 12,
                            color: "#94A3B8",
                          }}
                        >
                          {tb.thong_so_ky_thuat || "—"}
                        </td>
                        <td
                          style={{
                            padding: "14px 16px",
                            fontSize: 12,
                            color: "#F59E0B",
                            fontWeight: 700,
                          }}
                        >
                          {tb.trang_thai_hien_tai}
                        </td>
                      </tr>
                    ))}
                    {result.danh_sach_thiet_bi?.length === 0 && (
                      <tr>
                        <td
                          colSpan={4}
                          style={{
                            textAlign: "center",
                            padding: 30,
                            color: "#64748B",
                          }}
                        >
                          Không có thiết bị nào trong phiếu này.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(text) => setQrInput(text)}
      />
    </div>
  );
}
