/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useRef, useState } from "react";
import { Icon } from "./Icon";
import { QRCode } from "antd";
import jsQR from "jsqr"; // Bổ sung thư viện đọc mã QR từ ảnh
// Thêm dòng này ở đầu file Shared.tsx
import { Scanner } from "@yudiel/react-qr-scanner";
import { sanPhamService } from "@/src/services/sanPham.service";
import { khoService } from "@/src/services/kho.service";
export const StatusBadge = ({ status }: { status: string }) => {
  const config: any = {
    TRONG_KHO: {
      label: "Trong kho",
      bg: "rgba(59,130,246,0.15)",
      color: "#3B82F6",
      border: "rgba(59,130,246,0.3)",
    },
    DANG_MUON: {
      label: "Đang mượn",
      bg: "rgba(245,158,11,0.15)",
      color: "#F59E0B",
      border: "rgba(245,158,11,0.3)",
    },
    BAO_DUONG: {
      label: "Bảo dưỡng",
      bg: "rgba(239,68,68,0.15)",
      color: "#EF4444",
      border: "rgba(239,68,68,0.3)",
    },
    QUA_HAN: {
      label: "Quá hạn",
      bg: "rgba(239,68,68,0.15)",
      color: "#EF4444",
      border: "rgba(239,68,68,0.3)",
    },
    DA_TRA: {
      label: "Đã trả",
      bg: "rgba(0,212,170,0.15)",
      color: "#00D4AA",
      border: "rgba(0,212,170,0.3)",
    },
    DANG_XU_LY: {
      label: "Đang xử lý",
      bg: "rgba(245,158,11,0.15)",
      color: "#F59E0B",
      border: "rgba(245,158,11,0.3)",
    },
    HOAN_THANH: {
      label: "Hoàn thành",
      bg: "rgba(0,212,170,0.15)",
      color: "#00D4AA",
      border: "rgba(0,212,170,0.3)",
    },
    CHO_DUYET: {
      label: "Chờ duyệt",
      bg: "rgba(167,139,250,0.15)",
      color: "#A78BFA",
      border: "rgba(167,139,250,0.3)",
    },
    TU_CHOI: {
      label: "Từ chối",
      bg: "rgba(239,68,68,0.15)",
      color: "#EF4444",
      border: "rgba(239,68,68,0.3)",
    },
  };
  const c = config[status] || {
    label: status,
    bg: "rgba(107,114,128,0.15)",
    color: "#6B7280",
    border: "rgba(107,114,128,0.3)",
  };
  return (
    <span
      style={{
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 600,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        letterSpacing: "0.03em",
        textTransform: "uppercase",
      }}
    >
      {c.label}
    </span>
  );
};

export const QualityStars = ({ cap }: { cap: number }) => (
  <div style={{ display: "flex", gap: 2 }}>
    {[1, 2, 3, 4].map((i) => (
      <span
        key={i}
        style={{ color: i <= cap ? "#F59E0B" : "#374151", fontSize: 12 }}
      >
        ★
      </span>
    ))}
  </div>
);

export const SimpleListPage = ({
  title,
  data: initialData,
  columns,
  accentColor,
  addLabel,
}: any) => {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<any>({});

  // Lọc ra các cột cần nhập liệu (bỏ qua cột tự render phức tạp hoặc số đếm tự động nếu cần)
  const formColumns = columns.filter(
    (c: any) => c.key !== "soSP" && c.key !== "soTB",
  );

  const handleOpenModal = (row: any = null) => {
    if (row) {
      setEditingId(row.id);
      setFormData({ ...row });
    } else {
      setEditingId(null);
      const emptyForm: any = {};
      formColumns.forEach((c: any) => (emptyForm[c.key] = ""));
      setFormData(emptyForm);
    }
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa bản ghi này?")) {
      setData(data.filter((item: any) => item.id !== id));
    }
  };

  const handleSave = () => {
    if (editingId) {
      // Cập nhật
      setData(
        data.map((item: any) =>
          item.id === editingId ? { ...item, ...formData } : item,
        ),
      );
    } else {
      // Thêm mới
      setData([...data, { id: Date.now(), ...formData, soSP: 0, soTB: 0 }]); // Gán mặc định các giá trị đếm = 0
    }
    setModalOpen(false);
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
          }}
        >
          {title}
        </h2>
        <button
          onClick={() => handleOpenModal()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 20px",
            borderRadius: 8,
            border: "none",
            background: `linear-gradient(135deg, ${accentColor}, ${accentColor}88)`,
            color: "#0F172A",
            fontWeight: 700,
            fontSize: 13,
            cursor: "pointer",
            letterSpacing: 1,
          }}
        >
          <Icon name="plus" size={16} /> {addLabel}
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
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                background: "rgba(30,41,59,0.8)",
                borderBottom: `1px solid ${accentColor}33`,
              }}
            >
              {[...columns.map((c: any) => c.label), "Thao tác"].map(
                (h: string) => (
                  <th
                    key={h}
                    style={{
                      padding: "14px 16px",
                      textAlign: "left",
                      fontSize: 11,
                      fontWeight: 700,
                      color: accentColor,
                      letterSpacing: 1,
                      textTransform: "uppercase",
                      fontFamily: "'Courier New', monospace",
                    }}
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {data?.map((row: any, i: number) => (
              <tr
                key={row.id}
                style={{ borderBottom: "1px solid rgba(100,116,139,0.1)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(30,41,59,0.4)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {columns.map((c: any) => (
                  <td
                    key={c.key}
                    style={{
                      padding: "14px 16px",
                      fontSize: c.code ? 12 : 13,
                      color: c.code ? accentColor : "#E2E8F0",
                      fontFamily: c.code
                        ? "'Courier New', monospace"
                        : "inherit",
                      fontWeight: c.code ? 600 : 400,
                    }}
                  >
                    {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
                  </td>
                ))}
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => handleOpenModal(row)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: `1px solid #F59E0B33`,
                        background: `#F59E0B11`,
                        color: "#F59E0B",
                        cursor: "pointer",
                      }}
                    >
                      <Icon name="edit" size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(row.id)}
                      style={{
                        padding: 6,
                        borderRadius: 6,
                        border: `1px solid #EF444433`,
                        background: `#EF444411`,
                        color: "#EF4444",
                        cursor: "pointer",
                      }}
                    >
                      <Icon name="trash" size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + 1}
                  style={{ padding: 30, textAlign: "center", color: "#64748B" }}
                >
                  Chưa có dữ liệu
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal CRUD */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? `Sửa ${title}` : `Thêm mới ${title}`}
        accentColor={accentColor}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {formColumns.map((col: any) => (
            <FormGroup key={col.key} label={col.label}>
              <Input
                value={formData[col.key] || ""}
                onChange={(e: any) =>
                  setFormData({ ...formData, [col.key]: e.target.value })
                }
                placeholder={`Nhập ${col.label.toLowerCase()}...`}
              />
            </FormGroup>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button
            onClick={() => setModalOpen(false)}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "1px solid rgba(100,116,139,0.3)",
              background: "transparent",
              color: "#E2E8F0",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            HỦY
          </button>
          <button
            onClick={handleSave}
            style={{
              flex: 1,
              padding: "12px",
              borderRadius: 8,
              border: "none",
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}AA)`,
              color: "#0F172A",
              fontWeight: 700,
              cursor: "pointer",
              letterSpacing: 1,
            }}
          >
            {editingId ? "CẬP NHẬT" : "LƯU MỚI"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

// --- COMPONENT MỚI: Modal dùng chung chuẩn thiết kế hitech ---
export const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  accentColor = "#00D4AA",
}: any) => {
  if (!isOpen) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,15,30,0.85)",
          backdropFilter: "blur(4px)",
        }}
        onClick={onClose}
      />
      <div
        style={{
          position: "relative",
          width: 500,
          background: "linear-gradient(160deg,#0D1626,#080F1E)",
          border: `1px solid ${accentColor}44`,
          borderRadius: 16,
          padding: 32,
          zIndex: 1,
          boxShadow: `0 0 40px ${accentColor}15`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(to right, ${accentColor}, transparent)`,
            borderRadius: "16px 16px 0 0",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                fontSize: 11,
                color: accentColor,
                letterSpacing: 2,
                fontFamily: "'Courier New',monospace",
                marginBottom: 6,
              }}
            >
              THAO TÁC HỆ THỐNG
            </div>
            <div
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#E2E8F0",
                textTransform: "uppercase",
              }}
            >
              {title}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 8,
              borderRadius: 8,
              border: "1px solid rgba(100,116,139,0.3)",
              background: "transparent",
              color: "#64748B",
              cursor: "pointer",
            }}
          >
            <Icon name="x" size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

// --- COMPONENT MỚI: Input form chuẩn thiết kế ---
export const FormGroup = ({ label, children }: any) => (
  <div style={{ marginBottom: 16 }}>
    <div
      style={{
        fontSize: 11,
        color: "#64748B",
        fontWeight: 600,
        letterSpacing: 1,
        textTransform: "uppercase",
        marginBottom: 8,
      }}
    >
      {label}
    </div>
    {children}
  </div>
);

export const Input = ({ ...props }: any) => (
  <input
    {...props}
    style={{
      width: "100%",
      padding: "11px 14px",
      background: "rgba(30,41,59,0.7)",
      border: "1px solid rgba(100,116,139,0.3)",
      borderRadius: 8,
      color: "#E2E8F0",
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box",
      transition: "border 0.2s",
    }}
  />
);
export const Select = ({ children, ...props }: any) => (
  <select
    {...props}
    style={{
      width: "100%",
      padding: "11px 14px",
      background: "rgba(30,41,59,0.9)",
      border: "1px solid rgba(100,116,139,0.3)",
      borderRadius: 8,
      color: "#E2E8F0",
      fontSize: 13,
      outline: "none",
      boxSizing: "border-box",
      cursor: "pointer",
    }}
  >
    {children}
  </select>
);

// ============================================================================
// COMPONENT: NÚT XEM TRƯỚC MÃ QR CODE (ĐÃ ĐÓNG GÓI SẴN MODAL)
// ============================================================================
export const QRPreviewButton = ({ qr }: { qr: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  if (!qr) return null;

  return (
    <>
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setIsOpen(true);
        }}
        style={{
          background: "rgba(14, 165, 233, 0.1)",
          border: "1px solid rgba(14, 165, 233, 0.3)",
          borderRadius: 4,
          padding: "4px",
          color: "#0EA5E9",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
          verticalAlign: "middle",
        }}
        title="Xem mã QR"
      >
        <Icon name="search" size={16} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8,15,30,0.85)",
              backdropFilter: "blur(6px)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          />
          <div
            style={{
              position: "relative",
              width: 360,
              background: "linear-gradient(160deg, #0D1626, #080F1E)",
              border: "1px solid rgba(14,165,233,0.3)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 0 60px rgba(14,165,233,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: 8,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(100,116,139,0.3)",
                color: "#64748B",
                cursor: "pointer",
              }}
            >
              <Icon name="x" size={16} />
            </button>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#0EA5E9",
                letterSpacing: 1,
                marginBottom: 24,
              }}
            >
              MÃ QR THIẾT BỊ
            </div>
            <div style={{ background: "#fff", padding: 16, borderRadius: 12 }}>
              <QRCode value={qr} size={200} bordered={false} />
            </div>
            <div
              style={{
                marginTop: 24,
                fontSize: 18,
                fontWeight: 700,
                color: "#E2E8F0",
                fontFamily: "'Courier New', monospace",
              }}
            >
              {qr}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(100,116,139,0.4)",
                color: "#E2E8F0",
                cursor: "pointer",
                fontWeight: 600,
                marginTop: 24,
              }}
            >
              ĐÓNG
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export const QRPreviewSPButton = ({ qr }: { qr: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"input" | "loading" | "result">("input");

  const [secretKey, setSecretKey] = useState("");
  const [encryptedValue, setEncryptedValue] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Dùng Ref để trỏ tới thẻ bọc QRCode, phục vụ việc tải ảnh
  const qrRef = useRef<HTMLDivElement>(null);

  if (!qr) return null;

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
    setStep("input");
    setSecretKey("");
    setErrorMsg("");
  };

  const handleEncrypt = async () => {
    if (!secretKey.trim()) {
      setErrorMsg("Vui lòng nhập khóa bảo mật!");
      return;
    }

    setStep("loading");
    setErrorMsg("");

    try {
      const encryptedData = await sanPhamService.encryptChiTietQR(
        qr,
        secretKey,
      );

      if (encryptedData && encryptedData.crypto_string) {
        setEncryptedValue(encryptedData.crypto_string);
        setStep("result");
      } else {
        setErrorMsg("API không trả về chuỗi mã hóa.");
        setStep("input");
      }
    } catch (error: any) {
      console.error("Lỗi mã hóa", error);
      setErrorMsg("Sai khóa bảo mật hoặc lỗi kết nối máy chủ!");
      setStep("input");
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsOpen(false);
  };

  // Hàm tải ảnh QR Code chất lượng cao
  const downloadQRCode = () => {
    if (!qrRef.current) return;

    // Antd QRCode render ra thẻ canvas bên trong. Ta tìm thẻ đó.
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) {
      alert("Không tìm thấy dữ liệu ảnh để tải.");
      return;
    }

    // Lấy URL dữ liệu của ảnh PNG từ thẻ canvas
    const url = canvas.toDataURL("image/png");

    // Tạo thẻ <a> ẩn để kích hoạt tải xuống
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${qr}_BaoMat.png`; // Tên file tải về (Vd: QR_TB-001_BaoMat.png)
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <button
        onClick={handleOpenClick}
        style={{
          background: "rgba(14, 165, 233, 0.1)",
          border: "1px solid rgba(14, 165, 233, 0.3)",
          borderRadius: 4,
          padding: "4px",
          color: "#0EA5E9",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
          verticalAlign: "middle",
        }}
        title="Xem mã QR bảo mật"
      >
        <Icon name="qr" size={14} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8,15,30,0.85)",
              backdropFilter: "blur(6px)",
            }}
            onClick={handleClose}
          />
          <div
            style={{
              position: "relative",
              width: 360,
              background: "linear-gradient(160deg, #0D1626, #080F1E)",
              border: "1px solid rgba(14,165,233,0.3)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 0 60px rgba(14,165,233,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: 8,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(100,116,139,0.3)",
                color: "#64748B",
                cursor: "pointer",
              }}
            >
              <Icon name="x" size={16} />
            </button>

            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#0EA5E9",
                letterSpacing: 1,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              MÃ HÓA BẢO MẬT QR
            </div>

            {/* BƯỚC 1: NHẬP KEY */}
            {step === "input" && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#94A3B8",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Mã thiết bị:{" "}
                  <strong style={{ color: "#E2E8F0" }}>{qr}</strong>
                  <br />
                  Vui lòng nhập{" "}
                  <span style={{ color: "#00D4AA" }}>Secret Key</span> để mã hóa
                </div>

                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Nhập khóa bảo mật (Secret Key)..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(14,165,233,0.4)",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEncrypt();
                  }}
                />

                {errorMsg && (
                  <div
                    style={{
                      color: "#EF4444",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    {errorMsg}
                  </div>
                )}

                <button
                  onClick={handleEncrypt}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #00D4AA, #0EA5E9)",
                    border: "none",
                    color: "#0F172A",
                    cursor: "pointer",
                    fontWeight: 800,
                    marginTop: 8,
                  }}
                >
                  XÁC NHẬN MÃ HÓA
                </button>
              </div>
            )}

            {/* BƯỚC 2: LOADING */}
            {step === "loading" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  padding: "40px 0",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "3px solid rgba(14,165,233,0.2)",
                    borderTopColor: "#0EA5E9",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <div style={{ color: "#94A3B8", fontSize: 13 }}>
                  Đang xử lý mã hóa...
                </div>
              </div>
            )}

            {/* BƯỚC 3: HIỂN THỊ KẾT QUẢ QR */}
            {step === "result" && (
              <>
                {/* Bao bọc QRCode bằng 1 div có ref để dễ dàng trích xuất thẻ canvas bên trong */}
                <div
                  ref={qrRef}
                  style={{ background: "#fff", padding: 16, borderRadius: 12 }}
                >
                  {/* Ta tăng kích thước (size) lên 1000px ngầm để ảnh tải về nét căng, nhưng vẫn hiển thị ở giao diện nhỏ bằng cách giới hạn chiều rộng của div chứa */}
                  <div style={{ width: 200, height: 200, overflow: "hidden" }}>
                    <QRCode
                      value={encryptedValue}
                      size={1000}
                      style={{ width: "100%", height: "100%" }}
                      bordered={false}
                    />
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 24,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#E2E8F0",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {qr}
                </div>

                <div
                  style={{
                    fontSize: 11,
                    color: "#00D4AA",
                    marginTop: 8,
                    textAlign: "center",
                    background: "rgba(0,212,170,0.1)",
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  Đã được mã hóa an toàn
                </div>

                {/* NÚT TẢI ẢNH */}
                <button
                  onClick={downloadQRCode}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    background: "rgba(14,165,233,0.1)",
                    border: "1px dashed rgba(14,165,233,0.5)",
                    color: "#0EA5E9",
                    cursor: "pointer",
                    fontWeight: 700,
                    marginTop: 24,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icon name="download" size={16} /> TẢI ẢNH QR
                </button>
              </>
            )}

            {/* Nút đóng dùng chung */}
            {step !== "loading" && (
              <button
                onClick={handleClose}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid rgba(100,116,139,0.4)",
                  color: "#E2E8F0",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginTop: step === "result" ? 12 : 24,
                }}
              >
                ĐÓNG
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export const QRScannerModal = ({
  isOpen,
  onClose,
  onScanSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (text: string) => void;
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Hàm xử lý khi người dùng upload file ảnh
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");

        // Thu nhỏ ảnh nếu nó quá to (giúp jsqr đọc nhanh và chính xác hơn)
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;
        if (width > MAX_WIDTH) {
          height = Math.round(height * (MAX_WIDTH / width));
          width = MAX_WIDTH;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (ctx) {
          // BƯỚC QUAN TRỌNG: Tô toàn bộ nền thành màu trắng trước khi vẽ ảnh lên
          // Cứu tinh cho các ảnh PNG có nền trong suốt
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // Vẽ ảnh đè lên nền trắng
          ctx.drawImage(img, 0, 0, width, height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

          // Dùng jsQR để giải mã
          // invert: false là mặc định (QR đen nền trắng)
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
            onScanSuccess(code.data);
            onClose();
          } else {
            alert("Không tìm thấy mã QR. Thử chọn ảnh sáng và rõ nét hơn!");
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8,15,30,0.85)",
          backdropFilter: "blur(6px)",
        }}
        onClick={onClose}
      />

      <div
        style={{
          position: "relative",
          width: 400,
          maxWidth: "90vw",
          background: "#0F172A",
          borderRadius: 16,
          overflow: "hidden",
          border: "1px solid rgba(0,212,170,0.3)",
          boxShadow: "0 0 40px rgba(0,212,170,0.2)",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(0,0,0,0.2)",
          }}
        >
          <span
            style={{
              color: "#00D4AA",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: 1,
            }}
          >
            📷 QUÉT MÃ QR
          </span>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              color: "#EF4444",
              cursor: "pointer",
              fontWeight: 700,
              fontSize: 12,
            }}
          >
            ĐÓNG
          </button>
        </div>

        {/* CAMERA QUÉT TRỰC TIẾP */}
        <div style={{ width: "100%", aspectRatio: "1/1", background: "#000" }}>
          <Scanner
            onScan={(e) => {
              if (e && e.length > 0 && e[0].rawValue) {
                onScanSuccess(e[0].rawValue);
                onClose();
              }
            }}
            onError={(error) => console.log(error)}
          />
        </div>

        {/* NÚT TẢI ẢNH LÊN */}
        <div
          style={{
            padding: 16,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            alignItems: "center",
            background: "rgba(15,23,42,0.8)",
          }}
        >
          <span style={{ fontSize: 12, color: "#64748B" }}>
            Đưa mã QR vào chính giữa khung hình camera
          </span>
          <span style={{ fontSize: 11, color: "#475569", fontWeight: 700 }}>
            HOẶC
          </span>

          {/* Input file ẩn */}
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />

          {/* Nút bấm giả lập input file */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "100%",
              padding: "10px",
              background: "rgba(14,165,233,0.1)",
              border: "1px dashed rgba(14,165,233,0.4)",
              color: "#0EA5E9",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 700,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Icon name="upload" size={16} /> TẢI ẢNH MÃ QR TỪ MÁY
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// COMPONENT: NÚT XEM TRƯỚC MÃ QR PHIẾU KHO (BẢO MẬT)
// ============================================================================
export const QRPhieuPreviewButton = ({
  phieuId,
  maPhieu,
}: {
  phieuId: number;
  maPhieu: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"input" | "loading" | "result">("input");

  const [secretKey, setSecretKey] = useState("");
  const [encryptedValue, setEncryptedValue] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const qrRef = useRef<HTMLDivElement>(null);

  if (!phieuId) return null;

  const handleOpenClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen(true);
    setStep("input");
    setSecretKey("");
    setErrorMsg("");
  };

  const handleEncrypt = async () => {
    if (!secretKey.trim()) {
      setErrorMsg("Vui lòng nhập khóa bảo mật!");
      return;
    }
    setStep("loading");
    setErrorMsg("");
    try {
      const encryptedData = await khoService.encryptPhieuKho(
        phieuId,
        secretKey,
      );
      if (encryptedData && encryptedData.crypto_string) {
        setEncryptedValue(encryptedData.crypto_string);
        setStep("result");
      } else {
        setErrorMsg("API không trả về chuỗi mã hóa.");
        setStep("input");
      }
    } catch (error) {
      setErrorMsg("Sai khóa bảo mật hoặc lỗi kết nối!");
      setStep("input");
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setIsOpen(false);
  };

  const downloadQRCode = () => {
    if (!qrRef.current) return;
    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return alert("Không tìm thấy dữ liệu ảnh.");
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = url;
    a.download = `QR_${maPhieu}_BaoMat.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <>
      <button
        onClick={handleOpenClick}
        style={{
          background: "rgba(245, 158, 11, 0.1)",
          border: "1px solid rgba(245, 158, 11, 0.3)",
          borderRadius: 4,
          padding: "6px",
          color: "#F59E0B",
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 8,
          verticalAlign: "middle",
        }}
        title="Xem QR Phiếu"
      >
        <Icon name="qr" size={14} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(8,15,30,0.85)",
              backdropFilter: "blur(6px)",
            }}
            onClick={handleClose}
          />
          <div
            style={{
              position: "relative",
              width: 360,
              background: "linear-gradient(160deg, #0D1626, #080F1E)",
              border: "1px solid rgba(245,158,11,0.3)",
              borderRadius: 16,
              padding: 32,
              boxShadow: "0 0 60px rgba(245,158,11,0.12)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleClose}
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                padding: 8,
                borderRadius: 8,
                background: "transparent",
                border: "1px solid rgba(100,116,139,0.3)",
                color: "#64748B",
                cursor: "pointer",
              }}
            >
              <Icon name="x" size={16} />
            </button>
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "#F59E0B",
                letterSpacing: 1,
                marginBottom: 24,
                textAlign: "center",
              }}
            >
              MÃ HÓA BẢO MẬT PHIẾU
            </div>

            {step === "input" && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    color: "#94A3B8",
                    textAlign: "center",
                    marginBottom: 8,
                  }}
                >
                  Mã phiếu:{" "}
                  <strong style={{ color: "#E2E8F0" }}>{maPhieu}</strong>
                  <br />
                  Vui lòng nhập{" "}
                  <span style={{ color: "#F59E0B" }}>Secret Key</span> để mã hóa
                </div>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  placeholder="Nhập khóa bảo mật..."
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    background: "rgba(15,23,42,0.8)",
                    border: "1px solid rgba(245,158,11,0.4)",
                    borderRadius: 8,
                    color: "#E2E8F0",
                    fontSize: 14,
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEncrypt();
                  }}
                />
                {errorMsg && (
                  <div
                    style={{
                      color: "#EF4444",
                      fontSize: 12,
                      textAlign: "center",
                    }}
                  >
                    {errorMsg}
                  </div>
                )}
                <button
                  onClick={handleEncrypt}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    background: "linear-gradient(135deg, #F59E0B, #EF4444)",
                    border: "none",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 800,
                    marginTop: 8,
                  }}
                >
                  XÁC NHẬN MÃ HÓA
                </button>
              </div>
            )}

            {step === "loading" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 16,
                  padding: "40px 0",
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "3px solid rgba(245,158,11,0.2)",
                    borderTopColor: "#F59E0B",
                    animation: "spin 1s linear infinite",
                  }}
                />
                <div style={{ color: "#94A3B8", fontSize: 13 }}>
                  Đang xử lý mã hóa...
                </div>
              </div>
            )}

            {step === "result" && (
              <>
                <div
                  ref={qrRef}
                  style={{ background: "#fff", padding: 16, borderRadius: 12 }}
                >
                  <div style={{ width: 200, height: 200, overflow: "hidden" }}>
                    <QRCode
                      value={encryptedValue}
                      size={1000}
                      style={{ width: "100%", height: "100%" }}
                      bordered={false}
                    />
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 24,
                    fontSize: 16,
                    fontWeight: 700,
                    color: "#E2E8F0",
                    fontFamily: "'Courier New', monospace",
                  }}
                >
                  {maPhieu}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#F59E0B",
                    marginTop: 8,
                    textAlign: "center",
                    background: "rgba(245,158,11,0.1)",
                    padding: "4px 12px",
                    borderRadius: 20,
                  }}
                >
                  Đã được mã hóa an toàn
                </div>
                <button
                  onClick={downloadQRCode}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: 8,
                    background: "rgba(245,158,11,0.1)",
                    border: "1px dashed rgba(245,158,11,0.5)",
                    color: "#F59E0B",
                    cursor: "pointer",
                    fontWeight: 700,
                    marginTop: 24,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Icon name="download" size={16} /> TẢI ẢNH QR
                </button>
              </>
            )}

            {step !== "loading" && (
              <button
                onClick={handleClose}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: 8,
                  background: "transparent",
                  border: "1px solid rgba(100,116,139,0.4)",
                  color: "#E2E8F0",
                  cursor: "pointer",
                  fontWeight: 600,
                  marginTop: step === "result" ? 12 : 24,
                }}
              >
                ĐÓNG
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
};
