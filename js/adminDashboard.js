// Kiểm tra login
if (!localStorage.getItem('adminLogged')) {
  window.location.href = 'admin-login.html';
}

// Hiển thị tên admin
const adminNameSpan = document.getElementById('admin-name');
adminNameSpan.textContent = localStorage.getItem('adminName');

// Toggle dropdown
const userDropdown = document.getElementById('user-dropdown');
const userMenu = document.getElementById('user-menu');
userDropdown.addEventListener('click', () => {
  userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
});

// Logout
document.getElementById('logout-btn-dropdown').addEventListener('click', () => {
  localStorage.removeItem('adminLogged');
  localStorage.removeItem('adminName');
  alert('Đăng xuất thành công!');
  window.location.href = 'admin-login.html';
});

// Dashboard stats
const totalUsersSpan = document.getElementById('total-users');
const totalCinemasSpan = document.getElementById('total-cinemas');
const totalRevenueSpan = document.getElementById('total-revenue');

async function loadDashboardStats() {
  try {
    const users = await getData('users');
    const cinemas = await getData('cinemas');
    const bookings = await getData('bookings');

    totalUsersSpan.textContent = users.length;
    totalCinemasSpan.textContent = cinemas.length;

    const revenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    totalRevenueSpan.textContent = revenue.toLocaleString('vi-VN') + ' ₫';
  } catch (err) {
    console.error(err);
  }
}

loadDashboardStats();
