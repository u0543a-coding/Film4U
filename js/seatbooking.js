document.addEventListener('DOMContentLoaded', () => {
    // Lấy các element cần thiết từ DOM
    const seatMapContainer = document.getElementById('seat-map-container');
    const movieTitleEl = document.getElementById('movie-title');
    const cinemaNameEl = document.getElementById('cinema-name');
    const showtimeTimeEl = document.getElementById('showtime-time');
    const roomNameEl = document.getElementById('room-name');
    const selectedSeatsListEl = document.getElementById('selected-seats-list');
    const totalPriceEl = document.getElementById('total-price');

    // Biến toàn cục để lưu trạng thái lựa chọn
    let selectedSeats = [];
    let dbData = null; // Lưu dữ liệu db để không phải fetch nhiều lần

    /**
     * Cập nhật chi tiết thông tin vé và tổng tiền
     */
    function updateSelectionDetails() {
        if (selectedSeats.length === 0) {
            selectedSeatsListEl.textContent = 'Chưa có';
            totalPriceEl.textContent = '0';
        } else {
            const seatNames = selectedSeats.map(seat => seat.dataset.seatId.split('_')[1]);
            selectedSeatsListEl.textContent = seatNames.join(', ');
            
            const totalPrice = selectedSeats.reduce((total, seat) => total + parseFloat(seat.dataset.price), 0);
            totalPriceEl.textContent = totalPrice.toLocaleString('vi-VN');
        }
    }

    /**
     * Xử lý sự kiện khi một ghế được chọn hoặc bỏ chọn
     * @param {HTMLElement} seatElement - The seat element that was clicked.
     */
    function handleSeatClick(seatElement) {
        seatElement.classList.toggle('selected');
        const seatId = seatElement.dataset.seatId;

        if (seatElement.classList.contains('selected')) {
            // Thêm ghế vào danh sách đã chọn
            selectedSeats.push(seatElement);
        } else {
            // Xóa ghế khỏi danh sách đã chọn
            selectedSeats = selectedSeats.filter(seat => seat.dataset.seatId !== seatId);
        }
        updateSelectionDetails();
    }

    /**
     * Lấy dữ liệu và vẽ sơ đồ ghế cho một suất chiếu cụ thể.
     * @param {number} showtimeId - ID của suất chiếu cần hiển thị.
     */
    async function renderSeatMap(showtimeId) {
        seatMapContainer.innerHTML = 'Đang tải sơ đồ ghế...';

        try {
            // 1. Tải dữ liệu nếu chưa có
            if (!dbData) {
                const response = await fetch('../json/db.json');
                if (!response.ok) throw new Error('Không thể tải dữ liệu từ server.');
                dbData = await response.json();
            }

            // 2. Tìm thông tin cần thiết từ dữ liệu đã tải
            const showtime = dbData.showtimes.find(st => st.id === showtimeId);
            if (!showtime) throw new Error(`Không tìm thấy suất chiếu với ID ${showtimeId}.`);

            const movie = dbData.movies.find(m => m.id === showtime.movieId);
            const room = dbData.cinema_rooms.find(r => r.id === showtime.roomId);
            const cinema = dbData.cinemas.find(c => c.id === room.cinemaId);

            // Kiểm tra xem phòng đã được cấu hình theo phương pháp mới chưa
            if (!room || !room.seat_layout || !room.seat_layout.config) {
                throw new Error(`Cấu hình sơ đồ ghế cho phòng ID ${room.id} bị thiếu.`);
            }

            // 3. Cập nhật thông tin vé
            movieTitleEl.textContent = movie.title;
            cinemaNameEl.textContent = cinema.name;
            roomNameEl.textContent = room.room_name;
            showtimeTimeEl.textContent = new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            // 4. Chuẩn bị và vẽ sơ đồ ghế
            seatMapContainer.innerHTML = ''; // Xóa thông báo đang tải
            const layout = room.seat_layout;
            const config = layout.config;
            const rowChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            seatMapContainer.style.setProperty('--seats-per-row', layout.seatsPerRow);

            const occupiedSeats = (dbData.showtimeSeats || [])
                .filter(ss => ss.showtimeId === showtimeId)
                .reduce((map, seatStatus) => {
                    map[seatStatus.seatId] = seatStatus.status;
                    return map;
                }, {});

            // 5. Bắt đầu tạo ghế
            for (let i = 0; i < layout.rows; i++) {
                const rowChar = rowChars[i];
                let rowType = config.defaultType;
                let rowPrice = config.defaultPrice;

                const typeOverride = config.typeMapping.find(tm => tm.rows.includes(rowChar));
                if (typeOverride) {
                    rowType = typeOverride.type;
                    rowPrice = typeOverride.price;
                }

                for (let j = 1; j <= layout.seatsPerRow; j++) {
                    const seatId = `${room.id}_${rowChar}${j}`;
                    const seatElement = document.createElement('div');
                    seatElement.classList.add('seat', rowType);
                    
                    const status = occupiedSeats[seatId] || 'available';
                    seatElement.classList.add(status);

                    seatElement.dataset.seatId = seatId;
                    seatElement.dataset.price = rowPrice;
                    seatElement.dataset.type = rowType;
                    seatElement.textContent = `${rowChar}${j}`;

                    if (status === 'available') {
                        seatElement.addEventListener('click', () => handleSeatClick(seatElement));
                    }
                    
                    seatMapContainer.appendChild(seatElement);
                }
            }

        } catch (error) {
            console.error('Lỗi khi vẽ sơ đồ ghế:', error);
            seatMapContainer.innerHTML = `<p style="color: red; grid-column: 1 / -1;">Lỗi: ${error.message}</p>`;
        }
    }

    // --- KHỞI CHẠY --- 
    const urlParams = new URLSearchParams(window.location.search);
    const showtimeIdToRender = parseInt(urlParams.get('showtimeId'));

    if (showtimeIdToRender) {
        renderSeatMap(showtimeIdToRender);
    } else {
        seatMapContainer.innerHTML = '<p style="color: orange; grid-column: 1 / -1;">Vui lòng cung cấp `showtimeId` trong URL để chọn suất chiếu.</p>';
    }
});
