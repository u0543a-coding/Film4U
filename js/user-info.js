document.addEventListener('DOMContentLoaded', () => {
    const userFullNameElement = document.getElementById('user-fullname');
    const userEmailElement = document.getElementById('user-email');
    const userPhoneElement = document.getElementById('user-phone');
    const logoutButton = document.getElementById('logout-button');

    const loggedInUser = sessionStorage.getItem('loggedInUser');

    if (loggedInUser) {
        const user = JSON.parse(loggedInUser);
        userFullNameElement.textContent = user.fullName || 'Không có thông tin';
        userEmailElement.textContent = user.email || 'Không có thông tin';
        userPhoneElement.textContent = user.phoneNumber || 'Không có thông tin';
    } else {
        // Nếu không có thông tin người dùng, chuyển hướng về trang đăng nhập
        alert('Bạn cần đăng nhập để xem trang này.');
        window.location.href = 'login.html';
        return; // Dừng thực thi script
    }

    logoutButton.addEventListener('click', () => {
        // Xóa thông tin người dùng khỏi sessionStorage
        sessionStorage.removeItem('loggedInUser');
        
        // Thông báo và chuyển hướng về trang chủ
        alert('Bạn đã đăng xuất thành công.');
        window.location.href = 'homepage.html';
    });
});
