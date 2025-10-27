// adminDN.js - Xử lý đăng nhập admin
const apiUrl = "http://localhost:3000";

// Kiểm tra nếu đã đăng nhập thì chuyển hướng
document.addEventListener('DOMContentLoaded', function() {
    if (localStorage.getItem('adminLogged') === 'true') {
        window.location.href = 'admin.html';
    }
});

// Hiển thị/ẩn mật khẩu
document.getElementById('toggleAdminPass').addEventListener('click', function() {
    const passwordInput = document.getElementById('adminPassword');
    const icon = this.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
});

// Xử lý đăng nhập
document.getElementById('adminLoginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const alertMsg = document.getElementById('alertMsg');
    
    // Reset thông báo
    alertMsg.style.display = 'none';
    alertMsg.className = 'alert text-center';
    
    // Validate cơ bản
    if (!email || !password) {
        showAlert('Vui lòng nhập đầy đủ thông tin!', 'danger');
        return;
    }
    
    try {
        // Hiển thị loading
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang đăng nhập...';
        submitBtn.disabled = true;
        
        // Gọi API đăng nhập
        const response = await fetch(`${apiUrl}/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            // Lưu thông tin đăng nhập
            localStorage.setItem('adminLogged', 'true');
            localStorage.setItem('adminName', result.admin.name || result.admin.fullName || 'Admin');
            localStorage.setItem('adminEmail', result.admin.email);
            localStorage.setItem('adminId', result.admin.id);
            
            showAlert('Đăng nhập thành công! Đang chuyển hướng...', 'success');
            
            // Chuyển hướng sau 1 giây
            setTimeout(() => {
                window.location.href = 'admin.html';
            }, 1000);
            
        } else {
            showAlert(result.message || 'Đăng nhập thất bại!', 'danger');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        showAlert('Lỗi kết nối! Vui lòng thử lại sau.', 'danger');
    } finally {
        // Khôi phục button
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.innerHTML = 'Đăng nhập';
        submitBtn.disabled = false;
    }
});

// Hiển thị thông báo
function showAlert(message, type) {
    const alertMsg = document.getElementById('alertMsg');
    alertMsg.textContent = message;
    alertMsg.className = `alert alert-${type} text-center`;
    alertMsg.style.display = 'block';
    
    // Tự động ẩn thông báo sau 5 giây
    setTimeout(() => {
        alertMsg.style.display = 'none';
    }, 5000);
}

// Xử lý phím Enter
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        document.getElementById('adminLoginForm').dispatchEvent(new Event('submit'));
    }
});