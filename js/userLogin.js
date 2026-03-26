document.addEventListener("DOMContentLoaded", async () => {
  const loginForm = document.getElementById("login-form");
  const errorMessage = document.getElementById("error-message");
  const togglePassword = document.getElementById("togglePassword");
  const passwordInput = document.getElementById("password");

  // Lấy dữ liệu user từ JSON
  const users = await getData("users");

  // Toggle hiện/ẩn mật khẩu
  togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    togglePassword.classList.toggle("fa-eye");
    togglePassword.classList.toggle("fa-eye-slash");
  });

  // Xử lý đăng nhập
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = passwordInput.value.trim();

    const user = users.find(
      (u) => u.email === email && u.password === password && u.role === "user"
    );

    if (user) {
      alert("Đăng nhập thành công!");
      localStorage.setItem("loggedInUser", JSON.stringify(user));
      window.location.href = "homepage.html";
    } else {
      errorMessage.textContent = "Sai email hoặc mật khẩu!";
    }
  });
});
