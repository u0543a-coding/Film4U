document.addEventListener('DOMContentLoaded', () => {
    const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));
    const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

    // DOM Elements
    const summaryDiv = document.querySelector('.right .summary');
    const orderTable = document.getElementById('order-summary-table');
    const totalBoxPrice = document.querySelector('.total-box p b');
    const promoInput = document.getElementById('promo-code-input');
    const applyPromoBtn = document.getElementById('apply-promo-btn');
    const promoMessage = document.getElementById('promo-message');
    const discountRow = document.querySelector('.discount-row');
    const discountAmountEl = document.getElementById('discount-amount');
    const totalPriceEl = document.getElementById('total-price');
    const fullNameInput = document.getElementById('confirm-fullname');
    const phoneInput = document.getElementById('confirm-phone');
    const emailInput = document.getElementById('confirm-email');

    let originalTotal = 0;
    let currentTotal = 0;
    let appliedPromo = null;
    let currentUserId = null;

    if (loggedInUser) {
        fullNameInput.value = loggedInUser.fullName;
        phoneInput.value = loggedInUser.phoneNumber;
        emailInput.value = loggedInUser.email;
        currentUserId = loggedInUser.id;
    }

    if (bookingDetails) {
        populateOrderDetails();
    } else {
        document.querySelector('.container').innerHTML = '<h1>Không có thông tin đặt vé. Vui lòng quay lại trang chủ.</h1>';
        return; // Stop execution if no booking details
    }

    function populateOrderDetails() {
        summaryDiv.innerHTML = `
            <strong>${bookingDetails.movieTitle}</strong><br>
            ${bookingDetails.cinemaName}<br>
            Suất <b>${bookingDetails.showtime}</b><br>
            Phòng chiếu <b>${bookingDetails.roomName}</b> – Ghế <b>${bookingDetails.selectedSeats.join(', ')}</b>
        `;

        const ticketPriceRow = orderTable.rows[1];
        ticketPriceRow.cells[1].textContent = bookingDetails.selectedSeats.length;
        ticketPriceRow.cells[2].textContent = `${bookingDetails.totalPrice.toLocaleString('vi-VN')} đ`;

        const fee = 2500;
        const feeRow = orderTable.rows[2];
        feeRow.cells[2].textContent = `${fee.toLocaleString('vi-VN')} đ`;

        originalTotal = bookingDetails.totalPrice + fee;
        currentTotal = originalTotal;

        totalPriceEl.textContent = `${currentTotal.toLocaleString('vi-VN')} đ`;
        totalBoxPrice.textContent = `${currentTotal.toLocaleString('vi-VN')} đ`;
    }

    applyPromoBtn.addEventListener('click', handleApplyPromo);

    async function handleApplyPromo() {
        const code = promoInput.value.trim().toUpperCase();
        if (!code) {
            showPromoMessage('Vui lòng nhập mã giảm giá.', 'error');
            return;
        }

        if (!currentUserId) {
            showPromoMessage('Bạn cần đăng nhập để sử dụng mã giảm giá.', 'error');
            return;
        }

        try {
            const promos = await window.api.getPromotionByCode(code);
            
            if (promos.length === 0) {
                showPromoMessage('Mã giảm giá không hợp lệ.', 'error');
                return;
            }

            const promo = promos[0];
            const now = new Date();
            const expiryDate = new Date(promo.expiryDate);

            if (now > expiryDate) {
                showPromoMessage('Mã giảm giá đã hết hạn.', 'error');
                return;
            }

            if (promo.usedBy.includes(currentUserId)) {
                showPromoMessage('Bạn đã sử dụng mã giảm giá này rồi.', 'error');
                return;
            }

            // If validation passes
            appliedPromo = promo;
            calculateDiscount();
            showPromoMessage(`Áp dụng mã thành công!`, 'success');
            promoInput.disabled = true;
            applyPromoBtn.disabled = true;

        } catch (error) {
            console.error('Error applying promotion:', error);
            showPromoMessage('Đã có lỗi xảy ra. Vui lòng thử lại.', 'error');
        }
    }

    function calculateDiscount() {
        if (!appliedPromo) return;

        let discount = 0;
        if (appliedPromo.discountType === 'percentage') {
            discount = (bookingDetails.totalPrice * appliedPromo.discountValue) / 100;
        } else if (appliedPromo.discountType === 'fixed') {
            discount = appliedPromo.discountValue;
        }

        // Ensure discount doesn't exceed original total
        discount = Math.min(discount, originalTotal);

        currentTotal = originalTotal - discount;

        discountAmountEl.textContent = `-${discount.toLocaleString('vi-VN')} đ`;
        discountRow.style.display = 'table-row';

        totalPriceEl.textContent = `${currentTotal.toLocaleString('vi-VN')} đ`;
        totalBoxPrice.textContent = `${currentTotal.toLocaleString('vi-VN')} đ`;
    }

    function showPromoMessage(message, type) {
        promoMessage.textContent = message;
        promoMessage.className = `promo-message ${type}`;
    }

    // Handle back button
    const backBtn = document.querySelector('.btn-back');
    backBtn.addEventListener('click', () => {
        window.history.back();
    });

    // Handle final confirmation
    const confirmBtn = document.querySelector('.btn-confirm');
    confirmBtn.addEventListener('click', async () => {
        // 1. Validate user is logged in
        if (!loggedInUser || !currentUserId) {
            alert('Vui lòng đăng nhập để hoàn tất đặt vé.');
            window.location.href = 'login.html';
            return;
        }

        // 2. Validate required fields
        const fullName = fullNameInput.value.trim();
        const phone = phoneInput.value.trim();
        if (!fullName || !phone) {
            alert('Vui lòng điền đầy đủ Họ và tên và Số điện thoại.');
            return;
        }

        // 3. Construct booking data
        const bookingData = {
            userId: currentUserId,
            showtimeId: bookingDetails.showtimeId, // Assuming this exists in bookingDetails
            seatIds: bookingDetails.selectedSeatIds, // Assuming this exists
            totalPrice: currentTotal,
            bookingTime: new Date().toISOString(),
            status: "confirmed",
            promoId: appliedPromo ? appliedPromo.id : null
        };

        confirmBtn.disabled = true;
        confirmBtn.textContent = 'Đang xử lý...';

        try {
            // 4. Call API to create booking
            const newBooking = await window.api.createBooking(bookingData);

            // 5. Add to local 'my tickets' cart
            let myTickets = JSON.parse(sessionStorage.getItem('myTickets')) || [];
            myTickets.push(newBooking);
            sessionStorage.setItem('myTickets', JSON.stringify(myTickets));

            // 6. Show success popup and redirect
            document.querySelector('.popup').style.display = 'flex';
            
            // Optional: Add a close handler for the popup that redirects
            const popupCloseBtn = document.querySelector('.popup button');
            popupCloseBtn.addEventListener('click', () => {
                sessionStorage.removeItem('bookingDetails'); // Clean up booking details
                window.location.href = 'homepage.html';
            });

        } catch (error) {
            console.error('Lỗi khi tạo đặt vé:', error);
            alert('Đã có lỗi xảy ra trong quá trình đặt vé. Vui lòng thử lại.');
            confirmBtn.disabled = false;
            confirmBtn.textContent = 'Xác nhận';
        }
    });
});
