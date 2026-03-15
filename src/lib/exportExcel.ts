/* eslint-disable @typescript-eslint/no-explicit-any */
import * as ExcelJS from "exceljs";
import { saveAs } from "file-saver";

// ============================================================================
// 1. HÀM XUẤT EXCEL (CÓ THÊM MÃ SẢN PHẨM)
// ============================================================================
export const exportPhieuToExcel = async (data: any) => {
  if (!data || !data.thong_tin_phieu) return;

  const phieu = data.thong_tin_phieu;
  const thietBiList = data.danh_sach_thiet_bi || [];

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("ChiTietPhieu");

  // ===========================
  // TITLE
  // ===========================
  worksheet.addRow([]);
  worksheet.mergeCells("B2:J2"); // Kéo dài thêm 1 cột thành J
  const isNhapKho = phieu.loai_phieu === "NHAP_KHO";
  worksheet.getCell("B2").value = isNhapKho
    ? "PHIẾU NHẬP KHO THIẾT BỊ"
    : "PHIẾU XUẤT KHO THIẾT BỊ";
  worksheet.getCell("B2").font = { size: 18, bold: true };
  worksheet.getCell("B2").alignment = {
    horizontal: "center",
    vertical: "middle",
  };

  worksheet.addRow([]);

  // ===========================
  // THÔNG TIN CHUNG
  // ===========================
  worksheet.getCell("B4").value = "Mã phiếu:";
  worksheet.getCell("B4").font = { bold: true };
  worksheet.getCell("C4").value = phieu.ma_phieu;

  worksheet.getCell("G4").value = "Ngày tạo:";
  worksheet.getCell("G4").font = { bold: true };
  worksheet.getCell("H4").value = phieu.created_at;

  worksheet.getCell("B5").value = "Kho giao dịch:";
  worksheet.getCell("B5").font = { bold: true };
  worksheet.getCell("C5").value = phieu.ten_kho;

  worksheet.getCell("G5").value = "Người lập:";
  worksheet.getCell("G5").font = { bold: true };
  worksheet.getCell("H5").value = phieu.nguoi_lap;

  worksheet.getCell("B6").value = "Ghi chú:";
  worksheet.getCell("B6").font = { bold: true };
  worksheet.mergeCells("C6:H6");
  worksheet.getCell("C6").value = phieu.ghi_chu || "Không có";

  worksheet.addRow([]);
  worksheet.addRow([]);

  // ===========================
  // TABLE HEADER (ĐÃ BỔ SUNG MÃ SẢN PHẨM)
  // ===========================
  worksheet.columns = [
    { key: "empty", width: 5 }, // A (Bỏ trống)
    { key: "stt", width: 8 }, // B
    { key: "ma_qr", width: 25 }, // C
    { key: "ma_sp", width: 20 }, // D <--- BỔ SUNG CỘT MÃ SẢN PHẨM
    { key: "ten_sp", width: 35 }, // E
    { key: "serial", width: 20 }, // F
    { key: "danh_muc", width: 25 }, // G
    { key: "cap_cl", width: 25 }, // H
    { key: "dvt", width: 12 }, // I
    { key: "trang_thai", width: 20 }, // J
  ];

  const headerRowIndex = 9;
  worksheet.getRow(headerRowIndex).values = [
    "",
    "STT",
    "MÃ QR CÁ THỂ",
    "MÃ SẢN PHẨM", // <--- Thêm tiêu đề
    "TÊN THIẾT BỊ",
    "SỐ SERIAL",
    "DANH MỤC",
    "CẤP CHẤT LƯỢNG",
    "ĐVT",
    "TRẠNG THÁI",
  ];

  const headerRow = worksheet.getRow(headerRowIndex);
  headerRow.font = { bold: true, color: { argb: "FFFFFF" }, size: 11 };
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.height = 25;

  const headerColor = isNhapKho ? "10B981" : "F59E0B";
  for (let col = 2; col <= 10; col++) {
    // Lặp từ 2 đến 10 (Từ B đến J)
    const cell = headerRow.getCell(col);
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: headerColor },
    };
    cell.border = {
      top: { style: "thin", color: { argb: "475569" } },
      left: { style: "thin", color: { argb: "475569" } },
      right: { style: "thin", color: { argb: "475569" } },
      bottom: { style: "thin", color: { argb: "475569" } },
    };
  }

  // ===========================
  // BƠM DỮ LIỆU
  // ===========================
  let rowIndex = headerRowIndex + 1;

  thietBiList.forEach((tb: any, index: number) => {
    const row = worksheet.getRow(rowIndex);

    row.getCell("stt").value = index + 1;
    row.getCell("ma_qr").value = tb.ma_qr;
    row.getCell("ma_sp").value = tb.ma_san_pham || ""; // <--- Bơm dữ liệu mã sản phẩm
    row.getCell("ten_sp").value = tb.ten_san_pham;
    row.getCell("serial").value = tb.so_serial || "-";
    row.getCell("danh_muc").value = tb.ten_danh_muc;
    row.getCell("cap_cl").value = `Cấp ${tb.cap_chat_luong}`;
    row.getCell("dvt").value = tb.don_vi_tinh;
    row.getCell("trang_thai").value = tb.trang_thai_hien_tai;

    row.font = { size: 11 };
    row.alignment = { vertical: "middle" };
    row.getCell("stt").alignment = { horizontal: "center", vertical: "middle" };
    row.getCell("cap_cl").alignment = {
      horizontal: "center",
      vertical: "middle",
    };
    row.getCell("dvt").alignment = { horizontal: "center", vertical: "middle" };

    for (let col = 2; col <= 10; col++) {
      row.getCell(col).border = {
        top: { style: "thin", color: { argb: "CBD5E1" } },
        left: { style: "thin", color: { argb: "CBD5E1" } },
        right: { style: "thin", color: { argb: "CBD5E1" } },
        bottom: { style: "thin", color: { argb: "CBD5E1" } },
      };
    }
    rowIndex++;
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `${phieu.ma_phieu}.xlsx`);
};

// ============================================================================
// 2. HÀM NHẬP EXCEL THÀNH JSON (DỊCH CHUYỂN CỘT ĐỂ ĐỌC ĐÚNG MÃ SẢN PHẨM)
// ============================================================================
export const importPhieuFromExcel = async (file: File) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const arrayBuffer = await file.arrayBuffer();
    await workbook.xlsx.load(arrayBuffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error("File Excel không có dữ liệu!");

    // ĐỌC THÔNG TIN CHUNG
    const ma_phieu = worksheet.getCell("C4").value?.toString() || "";
    const created_at = worksheet.getCell("H4").value?.toString() || "";
    const ten_kho = worksheet.getCell("C5").value?.toString() || "";
    const nguoi_lap = worksheet.getCell("H5").value?.toString() || "";
    const ghi_chu = worksheet.getCell("C6").value?.toString() || "";

    const title = worksheet.getCell("B2").value?.toString() || "";
    const loai_phieu = title.includes("NHẬP") ? "NHAP_KHO" : "XUAT_KHO";

    const thong_tin_phieu = {
      ma_phieu,
      loai_phieu,
      created_at,
      ten_kho,
      nguoi_lap,
      ghi_chu,
    };

    // ĐỌC DANH SÁCH THIẾT BỊ
    const danh_sach_thiet_bi = [];
    let rowIndex = 10;

    while (true) {
      const row = worksheet.getRow(rowIndex);

      const stt = row.getCell(2).value;
      if (!stt) break;

      // Do chèn thêm cột "Mã sản phẩm" ở cột D (4), nên các cột phía sau lùi lại 1 bậc
      const cap_cl_str = row.getCell(8).value?.toString() || ""; // Giờ Cấp CL nằm ở cột H (8)
      const cap_chat_luong = parseInt(cap_cl_str.replace(/\D/g, "")) || 1;

      danh_sach_thiet_bi.push({
        ma_qr: row.getCell(3).value?.toString() || "", // Cột C
        ma_san_pham: row.getCell(4).value?.toString() || "", // Cột D <--- Đã thêm
        ten_san_pham: row.getCell(5).value?.toString() || "", // Cột E
        so_serial: row.getCell(6).value?.toString() || "", // Cột F
        ten_danh_muc: row.getCell(7).value?.toString() || "", // Cột G
        cap_chat_luong: cap_chat_luong, // Cột H
        don_vi_tinh: row.getCell(9).value?.toString() || "", // Cột I
        trang_thai_hien_tai: row.getCell(10).value?.toString() || "", // Cột J
      });

      rowIndex++;
    }

    return {
      success: true,
      data: {
        thong_tin_phieu,
        danh_sach_thiet_bi,
      },
    };
  } catch (error) {
    console.error("Lỗi khi đọc file Excel:", error);
    throw new Error("File Excel không đúng định dạng hoặc bị lỗi!");
  }
};
