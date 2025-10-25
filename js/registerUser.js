// js/registerUser.js (bản debug + fallback)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("register-form");
  const errorMessage = document.getElementById("error-message");

  const togglePasswordBtn = document.getElementById("togglePassword");
  const toggleConfirmBtn = document.getElementById("toggleConfirmPassword");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  // Toggle visibility (Bootstrap icon switching)
  const toggleVisibility = (input, button) => {
    button.addEventListener("click", () => {
      const icon = button.querySelector("i");
      if (input.type === "password") {
        input.type = "text";
        if (icon) icon.classList.replace("bi-eye", "bi-eye-slash");
      } else {
        input.type = "password";
        if (icon) icon.classList.replace("bi-eye-slash", "bi-eye");
      }
    });
  };
  if (togglePasswordBtn) toggleVisibility(passwordInput, togglePasswordBtn);
  if (toggleConfirmBtn) toggleVisibility(confirmInput, toggleConfirmBtn);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.textContent = "";

    const fullName = document.getElementById("fullName").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmInput.value.trim();

    if (!fullName || !email || !password) {
      errorMessage.textContent = "Vui lòng nhập đủ thông tin.";
      return;
    }
    if (password !== confirmPassword) {
      errorMessage.textContent = "Mật khẩu nhập lại không khớp!";
      return;
    }

    // Build new user object
    const newUser = {
      fullName,
      email,
      password,
      role: "user",
      createdAt: new Date().toISOString()
    };

    try {
      // 1) Lấy danh sách users hiện có (kiểm tra trùng email)
      console.log("Đang lấy danh sách users để kiểm tra trùng...");
      const existingUsers = await api.getUsers(); // api.getUsers() trả Promise từ api.js
      console.log("Users hiện có:", existingUsers);

      if (existingUsers.some(u => u.email === email)) {
        errorMessage.textContent = "Email này đã được đăng ký!";
        return;
      }

      // 2) Gửi POST lên server
      console.log("Gửi yêu cầu tạo user mới lên server:", newUser);
      const res = await fetch(`${BASE_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser)
      });

      // Kiểm tra response
      if (!res.ok) {
        const text = await res.text().catch(() => null);
        console.error("Server trả lỗi khi POST /users:", res.status, text);
        errorMessage.textContent = `Lỗi server: ${res.status} ${res.statusText}`;
        return;
      }

      const created = await res.json();
      console.log("User đã tạo:", created);

      alert("Đăng ký thành công! Vui lòng đăng nhập.");
      window.location.href = "login.html";
    } catch (err) {
      console.error("Lỗi khi đăng ký:", err);

      // Nếu server không reachable, fallback: lưu vào localStorage tạm (dev mode)
      if (err.message && /Failed to fetch|NetworkError|TypeError/.test(err.message)) {
        const fallbackKey = "localUsersFallback";
        const list = JSON.parse(localStorage.getItem(fallbackKey) || "[]");
        list.push(newUser);
        localStorage.setItem(fallbackKey, JSON.stringify(list));
        errorMessage.textContent = "Server không phản hồi — đã lưu tạm vào localStorage (chỉ test).";
        console.warn("User lưu tạm localStorage under", fallbackKey);
        return;
      }

      errorMessage.textContent = "Đã xảy ra lỗi, vui lòng thử lại! (xem console để biết chi tiết)";
    }
  });
});
