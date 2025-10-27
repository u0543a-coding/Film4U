document.addEventListener('DOMContentLoaded', () => {
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    const loginErrorMessage = document.getElementById('login-error-message');
    const registerErrorMessage = document.getElementById('register-error-message');
    const registerSuccessMessage = document.getElementById('register-success-message');

    // Chuyển đổi form
    showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
    });

    showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
    });

    // Xử lý đăng nhập
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        loginErrorMessage.textContent = '';

        const identifier = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        try {
            // Thử tìm người dùng bằng email trước
            let users = await api.getUsers({ email: identifier });

            // Nếu không tìm thấy bằng email, thử tìm bằng số điện thoại
            if (users.length === 0) {
                users = await api.getUsers({ phoneNumber: identifier });
            }

            if (users.length === 0) {
                loginErrorMessage.textContent = 'Email hoặc số điện thoại không tồn tại.';
                return;
            }

            const user = users[0];
            if (user.password === password) {
                // Đăng nhập thành công
                sessionStorage.setItem('loggedInUser', JSON.stringify(user));
                if (user.role === 'admin') {
                    window.location.href = '_admin.html';
                } else {
                    window.location.href = 'homepage.html';
                }
            } else {
                loginErrorMessage.textContent = 'Mật khẩu không đúng.';
            }

        } catch (error) {
            console.error('Lỗi đăng nhập:', error);
            loginErrorMessage.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        }
    });

    // Xử lý đăng ký
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        registerErrorMessage.textContent = '';
        registerSuccessMessage.textContent = '';

        const fullName = document.getElementById('register-fullname').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const phoneNumber = document.getElementById('register-phone').value;

        if (password !== confirmPassword) {
            registerErrorMessage.textContent = 'Mật khẩu không khớp.';
            return;
        }

        try {
            // Kiểm tra email đã tồn tại chưa
            const existingUsers = await api.getUsers({ email });
            if (existingUsers.length > 0) {
                registerErrorMessage.textContent = 'Email này đã được sử dụng.';
                return;
            }

            // Thêm người dùng mới
            const newUser = {
                fullName,
                email,
                password, // Lưu ý: trong thực tế cần mã hóa mật khẩu
                phoneNumber,
                role: 'user',
                createdAt: new Date().toISOString(),
            };

            await api.createUser(newUser);

            registerSuccessMessage.textContent = 'Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.';
            
            // Chuyển về form đăng nhập sau 2 giây
            setTimeout(() => {
                registerContainer.style.display = 'none';
                loginContainer.style.display = 'block';
                registerForm.reset(); // Xóa các trường đã nhập
            }, 2000);

        } catch (error) {
            console.error('Lỗi đăng ký:', error);
            registerErrorMessage.textContent = 'Đã có lỗi xảy ra. Vui lòng thử lại.';
        }
    });
});