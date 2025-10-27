const togglePassBtn = document.getElementById('toggleAdminPass');
const adminPassword = document.getElementById('adminPassword');
const alertMsg = document.getElementById('alertMsg');

// Toggle show/ẩn mật khẩu
togglePassBtn.addEventListener('click', () => {
  if (adminPassword.type === 'password') {
    adminPassword.type = 'text';
    togglePassBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i>';
  } else {
    adminPassword.type = 'password';
    togglePassBtn.innerHTML = '<i class="fa-solid fa-eye"></i>';
  }
});

// Submit form
document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('adminEmail').value.trim();
  const password = adminPassword.value.trim();

  try {
    const admins = await getData('admins'); // lấy dữ liệu từ db.json
    const admin = admins.find(a => a.email === email && a.password === password);

    if (admin) {
      alertMsg.classList.remove('alert-danger');
      alertMsg.classList.add('alert-success');
      alertMsg.textContent = `Đăng nhập thành công! Chào ${admin.fullName}`;
      alertMsg.style.display = 'block';

      localStorage.setItem('adminLogged', 'true');
      localStorage.setItem('adminName', admin.fullName);

      setTimeout(() => {
        window.location.href = 'AdminVTi.html';
      }, 1500);

    } else {
      alertMsg.classList.remove('alert-success');
      alertMsg.classList.add('alert-danger');
      alertMsg.textContent = 'Email hoặc mật khẩu không đúng!';
      alertMsg.style.display = 'block';
    }
  } catch (error) {
    console.error(error);
    alertMsg.classList.remove('alert-success');
    alertMsg.classList.add('alert-danger');
    alertMsg.textContent = 'Không thể tải dữ liệu admin!';
    alertMsg.style.display = 'block';
  }
});
