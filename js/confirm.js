document.addEventListener('DOMContentLoaded', () => {
    const bookingDetails = JSON.parse(sessionStorage.getItem('bookingDetails'));
    console.log(bookingDetails);

    if (bookingDetails) {
        // Populate the summary
        const summaryDiv = document.querySelector('.right .summary');
        summaryDiv.innerHTML = `
            <strong>${bookingDetails.movieTitle}</strong><br>
            ${bookingDetails.cinemaName}<br>
            Suất <b>${bookingDetails.showtime}</b><br>
            Phòng chiếu <b>${bookingDetails.roomName}</b> – Ghế <b>${bookingDetails.selectedSeats.join(', ')}</b>
        `;

        // Populate the order summary table
        const table = document.querySelector('.left table');
        const standardRow = table.rows[1];
        standardRow.cells[1].textContent = bookingDetails.selectedSeats.length;
        standardRow.cells[2].textContent = `${bookingDetails.totalPrice.toLocaleString('vi-VN')} đ`;

        const fee = 2500;
        const total = bookingDetails.totalPrice + fee;

        const feeRow = table.rows[2];
        feeRow.cells[2].textContent = `${fee.toLocaleString('vi-VN')} đ`;

        const totalRow = table.rows[3];
        totalRow.cells[2].textContent = `${total.toLocaleString('vi-VN')} đ`;

        // Populate the total box
        const totalBox = document.querySelector('.total-box p b');
        totalBox.textContent = `${total.toLocaleString('vi-VN')} đ`;
    } else {
        // Handle case where there is no booking data
        document.querySelector('.container').innerHTML = '<h1>Không có thông tin đặt vé. Vui lòng quay lại trang chủ.</h1>';
    }

    // Handle back button
    const backBtn = document.querySelector('.btn-back');
    backBtn.addEventListener('click', () => {
        window.history.back();
    });
});
