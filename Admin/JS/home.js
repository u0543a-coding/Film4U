// /Film4U/Admin/js/Home.js

// ---- 1. Dữ liệu mẫu (có thể thay bằng dữ liệu thật từ localStorage) ---- //
const sampleActivities = [
  { user: "Hồ Văn Tiết", action: 'Đặt vé xem phim "Venom 3"', time: "15-10-2025 08:32", status: "done" },
  { user: "Nguyễn Hữu Tổng Đạt", action: "Tạo tài khoản mới", time: "14-10-2025 21:10", status: "done" },
  { user: "Hồ Văn Đàn", action: "Hủy vé xem phim", time: "14-10-2025 16:24", status: "cancel" },
  { user: "Hồ Thị Như", action: "Cập nhật thông tin cá nhân", time: "13-10-2025 19:05", status: "pending" },
];

// ---- 2. Lấy danh sách từ localStorage (nếu có) ---- //
function getActivities() {
  const data = JSON.parse(localStorage.getItem("activities"));
  return data && data.length ? data : sampleActivities;
}

// ---- 3. Lưu hoạt động mới ---- //
function addActivity(user, action, status = "done") {
  const activities = getActivities();
  const now = new Date();
  const time = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()} ${now.getHours()}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const newActivity = { user, action, time, status };
  activities.unshift(newActivity); // thêm lên đầu
  if (activities.length > 10) activities.pop(); // giới hạn 10 dòng
  localStorage.setItem("activities", JSON.stringify(activities));
  renderActivities();
}

// ---- 4. Hiển thị danh sách hoạt động ---- //
function renderActivities() {
  const tbody = document.querySelector("tbody");
  if (!tbody) return;

  const activities = getActivities();
  tbody.innerHTML = "";

  activities.forEach((a) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${a.user}</td>
      <td>${a.action}</td>
      <td>${a.time}</td>
      <td><span class="status ${a.status}">${getStatusLabel(a.status)}</span></td>
    `;
    tbody.appendChild(row);
  });
}

// ---- 5. Gán nhãn trạng thái ---- //
function getStatusLabel(status) {
  switch (status) {
    case "done":
      return "Hoàn tất";
    case "cancel":
      return "Hủy";
    case "pending":
      return "Đang xử lý";
    default:
      return "Không xác định";
  }
}

// ---- 6. Cập nhật số liệu thống kê ---- //
function updateDashboardCounts() {
  const movies = JSON.parse(localStorage.getItem("movies")) || [];
  const users = JSON.parse(localStorage.getItem("users")) || [];
  const orders = JSON.parse(localStorage.getItem("orders")) || [];
  const promotions = JSON.parse(localStorage.getItem("promotions")) || [];

  const counts = {
    movies: movies.length || 126,
    users: users.length || 892,
    orders: orders.length || 342,
    promotions: promotions.length || 14,
  };

  const cards = document.querySelectorAll(".card p");
  if (cards.length >= 4) {
    cards[0].textContent = counts.movies;
    cards[1].textContent = counts.users;
    cards[2].textContent = counts.orders;
    cards[3].textContent = counts.promotions;
  }
}

// ---- 7. Tự động chạy khi tải trang ---- //
window.addEventListener("DOMContentLoaded", () => {
  renderActivities();
  updateDashboardCounts();
});
