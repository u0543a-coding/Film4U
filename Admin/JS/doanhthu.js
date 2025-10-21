// Dữ liệu mẫu - các rạp ở Đà Nẵng
const danhSachRap = [
  { ten: "CGV Vincom Đà Nẵng", diachi: "910A Ngô Quyền, Sơn Trà, Đà Nẵng", doanhthu: 95000000 },
  { ten: "Lotte Cinema Đà Nẵng", diachi: "Tầng 5, Lotte Mart, 6 Nại Nam, Hải Châu, Đà Nẵng", doanhthu: 87000000 },
  { ten: "Galaxy Đà Nẵng", diachi: "Tầng 3, Coopmart, 478 Điện Biên Phủ, Thanh Khê, Đà Nẵng", doanhthu: 102000000 },
  { ten: "Beta Đà Nẵng", diachi: "319 Lê Duẩn, Thanh Khê, Đà Nẵng", doanhthu: 72000000 },
  { ten: "Cinestar Đà Nẵng", diachi: "50 Phan Đăng Lưu, Hải Châu, Đà Nẵng", doanhthu: 89000000 },
];

function loadData() {
  const tbody = document.querySelector("#tableDoanhThu tbody");
  tbody.innerHTML = "";

  let tong = 0;
  danhSachRap.forEach((rap, i) => {
    const row = `
      <tr>
        <td>${i + 1}</td>
        <td>${rap.ten}</td>
        <td>${rap.diachi}</td>
        <td>${rap.doanhthu.toLocaleString()} đ</td>
      </tr>
    `;
    tbody.insertAdjacentHTML("beforeend", row);
    tong += rap.doanhthu;
  });

  document.getElementById("tongDoanhThu").textContent =
    "Tổng doanh thu: " + tong.toLocaleString() + " VNĐ";
}

// Nút tải lại dữ liệu
document.getElementById("btnRefresh").addEventListener("click", loadData);

// Gọi khi trang load
window.onload = loadData;
