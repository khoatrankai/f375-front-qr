/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Icon } from "@/src/components/ui/Icon";
import { QRScannerModal, StatusBadge } from "@/src/components/ui/Shared";
import { sanPhamService } from "@/src/services/sanPham.service";

export default function TraCuuBaoMatPage() {
  const [qrInput, setQrInput] = useState(""); // Chứa chuỗi đã mã hóa (quét được hoặc nhập tay)
  const [secretKey, setSecretKey] = useState(""); // Chứa mật khẩu giải mã
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Hàm xử lý gọi API giải mã
  const handleDecryptSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!qrInput.trim()) {
      setErrorMsg("Vui lòng nhập hoặc quét mã QR mã hóa!");
      return;
    }
    if (!secretKey.trim()) {
      setErrorMsg("Vui lòng nhập khóa bảo mật (Secret Key)!");
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      // Gọi service giải mã đã được định nghĩa
      const data = await sanPhamService.decryptChiTietQR(qrInput, secretKey);
      setResult(data); // data chứa { thong_tin: {...}, lich_su: [...] }
    } catch (error: any) {
      setErrorMsg(
        "Giải mã thất bại! Sai khóa bảo mật hoặc chuỗi mã hóa không hợp lệ.",
      );
    } finally {
      setLoading(false);
    }
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
        TRA CỨU & GIẢI MÃ THIẾT BỊ
      </h2>

      {/* FORM NHẬP LIỆU BẢO MẬT */}
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
          border: "1px solid rgba(14,165,233,0.3)",
          boxShadow: "0 0 20px rgba(14,165,233,0.05)",
        }}
      >
        <div
          style={{
            color: "#0EA5E9",
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 1,
          }}
        >
          🔐 NHẬP THÔNG TIN BẢO MẬT
        </div>

        {/* Dòng 1: Ô nhập chuỗi mã hóa + Nút Quét */}
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
              placeholder="Nhập hoặc quét chuỗi QR đã mã hóa..."
              style={{
                width: "100%",
                padding: "14px 16px 14px 44px",
                background: "rgba(15,23,42,0.8)",
                border: "1px solid rgba(100,116,139,0.3)",
                borderRadius: 8,
                color: "#00D4AA", // Màu chữ khác biệt để nhận diện chuỗi hash
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
              background: "rgba(0,212,170,0.15)",
              border: "1px solid rgba(0,212,170,0.3)",
              color: "#00D4AA",
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

        {/* Dòng 2: Ô nhập Secret Key + Nút Submit */}
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
              background: "linear-gradient(135deg, #0EA5E9, #3B82F6)",
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
            {loading ? "ĐANG GIẢI MÃ..." : "GIẢI MÃ"}
          </button>
        </div>
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
            marginBottom: 32,
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
                color: "#00D4AA",
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
                border: "1px solid rgba(0,212,170,0.2)",
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
                    {result.thong_tin.ten_kho || "—"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* CỘT PHẢI: TIMELINE LỊCH SỬ */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <h3
              style={{
                color: "#00D4AA",
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

      {/* Tích hợp Modal Quét QR Camera */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={(text) => {
          setQrInput(text); // Khi quét xong, điền vào ô chuỗi mã hóa
          // Không tự động gọi Search vì người dùng còn phải nhập Key!
        }}
      />
    </div>
  );
}
