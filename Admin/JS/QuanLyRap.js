// DỮ LIỆU RẠP Ở ĐÀ NẴNG
const rapDaNang = [
  { ten: "CGV Vincom Đà Nẵng", diachi: "910A Ngô Quyền, Sơn Trà, Đà Nẵng", doanhthu: 95000000, trangthai: "Hoạt động" },
  { ten: "Lotte Cinema Đà Nẵng", diachi: "6 Nại Nam, Hải Châu, Đà Nẵng", doanhthu: 78000000, trangthai: "Hoạt động" },
  { ten: "Galaxy Đà Nẵng", diachi: "478 Điện Biên Phủ, Thanh Khê, Đà Nẵng", doanhthu: 120000000, trangthai: "Tạm ngưng" },
  { ten: "Beta Đà Nẵng", diachi: "2 Nguyễn Văn Linh, Hải Châu, Đà Nẵng", doanhthu: 112000000, trangthai: "Hoạt động" }
];

// ELEMENT
const rapTable = document.getElementById("rapTable");
const statusFilter = document.getElementById("statusFilter");

// ĐỊNH DẠNG TIỀN TỆ
function formatCurrency(value) {
  return value.toLocaleString("vi-VN") + " ₫";
}

// HIỂN THỊ DỮ LIỆU RA BẢNG
function renderTable(data) {
  rapTable.innerHTML = "";
  data.forEach(rap => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${rap.ten}</td>
      <td>${rap.diachi}</td>
      <td class="revenue">0 ₫</td>
      <td><span class="status ${rap.trangthai === "Hoạt động" ? "done" : "pending"}">${rap.trangthai}</span></td>
    `;
    rapTable.appendChild(row);

    // Hiệu ứng đếm doanh thu
    let start = 0;
    const end = rap.doanhthu;
    const duration = 800;
    const step = end / (duration / 30);
    const revenueCell = row.querySelector(".revenue");

    const counter = setInterval(() => {
      start += step;
      if (start >= end) {
        start = end;
        clearInterval(counter);
      }
      revenueCell.textContent = formatCurrency(Math.floor(start));
    }, 30);
  });
}

// LỌC THEO TRẠNG THÁI
statusFilter.addEventListener("change", () => {
  const value = statusFilter.value;
  if (value === "all") renderTable(rapDaNang);
  else renderTable(rapDaNang.filter(r => r.trangthai === value));
});

// KHỞI TẠO
renderTable(rapDaNang);
