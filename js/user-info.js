document.addEventListener('DOMContentLoaded', () => {
    // View Mode Elements
    const userFullNameElement = document.getElementById('user-fullname');
    const userEmailElement = document.getElementById('user-email');
    const userPhoneElement = document.getElementById('user-phone');
    const editButton = document.getElementById('edit-button');
    const logoutButton = document.getElementById('logout-button');

    // Edit Mode Elements
    const viewModeContainer = document.getElementById('view-mode');
    const editModeForm = document.getElementById('edit-mode');
    const editFullnameInput = document.getElementById('edit-fullname');
    const editEmailInput = document.getElementById('edit-email');
    const editPhoneInput = document.getElementById('edit-phone');
    const editPasswordInput = document.getElementById('edit-password');
    const saveButton = document.getElementById('save-button');
    const cancelButton = document.getElementById('cancel-button');

    const loggedInUser = sessionStorage.getItem('loggedInUser');
    let user;

    if (loggedInUser) {
        user = JSON.parse(loggedInUser);
        displayUserInfo(user);
    } else {
        alert('Bạn cần đăng nhập để xem trang này.');
        window.location.href = 'login.html';
        return;
    }

    function displayUserInfo(user) {
        userFullNameElement.textContent = user.fullName || 'Không có thông tin';
        userEmailElement.textContent = user.email || 'Không có thông tin';
        userPhoneElement.textContent = user.phoneNumber || 'Không có thông tin';
    }

    function switchToEditMode() {
        editFullnameInput.value = user.fullName;
        editEmailInput.value = user.email;
        editPhoneInput.value = user.phoneNumber;
        editPasswordInput.value = ''; // Clear password field

        viewModeContainer.classList.add('hidden');
        editModeForm.classList.remove('hidden');
    }

    function switchToViewMode() {
        viewModeContainer.classList.remove('hidden');
        editModeForm.classList.add('hidden');
    }

    editButton.addEventListener('click', switchToEditMode);
    cancelButton.addEventListener('click', switchToViewMode);

    logoutButton.addEventListener('click', () => {
        sessionStorage.removeItem('loggedInUser');
        alert('Bạn đã đăng xuất thành công.');
        window.location.href = 'homepage.html';
    });

    editModeForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const updatedData = {
            fullName: editFullnameInput.value.trim(),
            email: editEmailInput.value.trim(),
            phoneNumber: editPhoneInput.value.trim(),
        };

        const newPassword = editPasswordInput.value.trim();
        if (newPassword) {
            updatedData.password = newPassword;
        }

        try {
            const updatedUser = await api.updateUser(user.id, updatedData);
            
            // Update user data in sessionStorage
            sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
            user = updatedUser; // Update local user variable

            alert('Cập nhật thông tin thành công!');
            displayUserInfo(user);
            switchToViewMode();
            // Refresh header to show new name
            location.reload(); 

        } catch (error) {
            console.error('Lỗi khi cập nhật thông tin:', error);
            alert('Đã xảy ra lỗi khi cập nhật thông tin. Vui lòng thử lại.');
        }
    });
});