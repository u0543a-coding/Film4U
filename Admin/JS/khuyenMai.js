// Lấy danh sách khuyến mãi từ localStorage
let promos = JSON.parse(localStorage.getItem("promos")) || [];

// Hàm sinh ID ngẫu nhiên
function generatePromoID() {
  return "KM" + Math.floor(Math.random() * 100000);
}

// ======= HIỂN THỊ DANH SÁCH =======
function renderPromos() {
  const tbody = document.querySelector("#promoTable tbody");
  tbody.innerHTML = promos
    .map(
      (p, index) => `
      <tr>
        <td>${p.id}</td>
        <td>${p.name}</td>
        <td>${p.discount}%</td>
        <td>${p.startDate}</td>
        <td>${p.endDate}</td>
        <td>
          <button class="edit-btn" onclick="editPromo(${index})">Sửa</button>
          <button class="delete-btn" onclick="deletePromo(${index})">Xóa</button>
        </td>
      </tr>
    `
    )
    .join("");
}

// ======= THÊM KHUYẾN MÃI =======
document.getElementById("promoForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const id = generatePromoID();
  const name = document.getElementById("promoName").value;
  const discount = document.getElementById("discount").value;
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;

  promos.push({ id, name, discount, startDate, endDate });
  localStorage.setItem("promos", JSON.stringify(promos));

  renderPromos();
  e.target.reset();
});

// ======= XÓA KHUYẾN MÃI =======
function deletePromo(index) {
  if (confirm("Bạn có chắc muốn xóa khuyến mãi này không?")) {
    promos.splice(index, 1);
    localStorage.setItem("promos", JSON.stringify(promos));
    renderPromos();
  }
}

// ======= SỬA KHUYẾN MÃI =======
function editPromo(index) {
  const promo = promos[index];
  const newName = prompt("Tên chương trình mới:", promo.name);
  const newDiscount = prompt("Giảm (%) mới:", promo.discount);
  const newStart = prompt("Ngày bắt đầu mới (yyyy-mm-dd):", promo.startDate);
  const newEnd = prompt("Ngày kết thúc mới (yyyy-mm-dd):", promo.endDate);

  if (newName && newDiscount && newStart && newEnd) {
    promos[index] = {
      ...promo,
      name: newName,
      discount: newDiscount,
      startDate: newStart,
      endDate: newEnd,
    };
    localStorage.setItem("promos", JSON.stringify(promos));
    renderPromos();
  }
}

// Gọi khi tải trang
renderPromos();
