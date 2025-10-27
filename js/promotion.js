document.addEventListener('DOMContentLoaded', function() {
    const promotionContainer = document.getElementById('promotion-container');

    /**
     * Lấy thông tin người dùng từ localStorage
     * @returns {object | null} Thông tin người dùng hoặc null nếu không đăng nhập
     */
    function getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    }

    /**
     * Hiển thị modal chi tiết khuyến mãi
     * @param {object} promotion - Đối tượng khuyến mãi
     */
    function showPromotionModal(promotion) {
        // Xóa modal cũ nếu có
        const existingModal = document.querySelector('.modal-overlay');
        if (existingModal) {
            existingModal.remove();
        }

        const currentUser = getCurrentUser();

        const modalOverlay = document.createElement('div');
        modalOverlay.className = 'modal-overlay';

        let userInfoHtml = '<div class="user-info">';
        if (currentUser) {
            userInfoHtml += `<h4>Thông tin của bạn:</h4>
                         <p><strong>Tên:</strong> ${currentUser.fullName}</p>
                         <p><strong>Email:</strong> ${currentUser.email}</p>`;
        } else {
            userInfoHtml += '<p>Vui lòng <a href="./login.html">đăng nhập</a> để sử dụng mã.</p>';
        }
        userInfoHtml += '</div>';

        modalOverlay.innerHTML = `
            <div class="modal-content">
                <span class="modal-close">&times;</span>
                <h2>${promotion.title}</h2>
                <p>${promotion.description}</p>
                <div class="promo-code">${promotion.code}</div>
                <p><strong>Loại giảm giá:</strong> ${promotion.discountType === 'percentage' ? 'Phần trăm' : 'Số tiền cố định'}</p>
                <p><strong>Giá trị:</strong> ${promotion.discountType === 'percentage' ? promotion.discountValue + '%' : promotion.discountValue.toLocaleString('vi-VN') + ' VNĐ'}</p>
                <p><strong>Ngày hết hạn:</strong> ${new Date(promotion.expiryDate).toLocaleDateString('vi-VN')}</p>
                ${userInfoHtml}
            </div>
        `;

        document.body.appendChild(modalOverlay);

        // Thêm sự kiện đóng modal
        modalOverlay.querySelector('.modal-close').addEventListener('click', () => {
            modalOverlay.remove();
        });
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.remove();
            }
        });
    }

    /**
     * Tải và hiển thị danh sách khuyến mãi
     */
    async function loadPromotions() {
        try {
            const response = await fetch('../json/db.json');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            const promotions = data.promotions || [];
            const now = new Date();

            promotionContainer.innerHTML = ''; // Xóa nội dung cũ

            const validPromotions = promotions.filter(promo => new Date(promo.expiryDate) > now);

            if (validPromotions.length === 0) {
                promotionContainer.innerHTML = '<p>Hiện tại không có chương trình khuyến mãi nào.</p>';
                return;
            }

            validPromotions.forEach(promo => {
                const promoItem = document.createElement('div');
                promoItem.className = 'promotion-item';
                promoItem.innerHTML = `
                    <h3>${promo.title}</h3>
                    <p>${promo.description.substring(0, 100)}...</p>
                    <p class="expiry-date">Hết hạn vào: ${new Date(promo.expiryDate).toLocaleDateString('vi-VN')}</p>
                `;

                promoItem.addEventListener('click', () => showPromotionModal(promo));
                promotionContainer.appendChild(promoItem);
            });

        } catch (error) {
            console.error('Lỗi khi tải khuyến mãi:', error);
            promotionContainer.innerHTML = '<p>Đã xảy ra lỗi khi tải danh sách khuyến mãi. Vui lòng thử lại sau.</p>';
        }
    }

    // Tải layout và sau đó tải khuyến mãi
    if (typeof loadLayout === 'function') {
        loadLayout().then(loadPromotions);
    } else {
        loadPromotions();
    }
});
