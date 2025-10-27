const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = loginForm.email.value;
    const password = loginForm.password.value;

    try {
        // Truy vấn người dùng với email và mật khẩu đã cung cấp
        const users = await api.getUsers({ email, password });

        if (users.length > 0) {
            const user = users[0]; // Lấy người dùng đầu tiên trong mảng trả về
            if (user.role === 'admin') {
                localStorage.setItem('loggedInUserId', user.id);
                window.location.href = '_admin.html';
            } else {
                errorMessage.textContent = 'Bạn không có quyền truy cập trang quản trị.';
            }
        } else {
            errorMessage.textContent = 'Email hoặc mật khẩu không đúng.';
        }
    } catch (error) {
        console.error('Error during login:', error);
        errorMessage.textContent = 'Đã có lỗi xảy ra trong quá trình đăng nhập.';
    }
});