document.addEventListener('DOMContentLoaded', async () => {
    const seatMapContainer = document.getElementById('seat-map-container');
    const movieTitleEl = document.getElementById('movie-title');
    const cinemaNameEl = document.getElementById('cinema-name');
    const showtimeTimeEl = document.getElementById('showtime-time');
    const roomNameEl = document.getElementById('room-name');
    const selectedSeatsListEl = document.getElementById('selected-seats-list');
    const totalPriceEl = document.getElementById('total-price');

    let selectedSeats = [];
    let dbData = null; // Cache the database data

    function updateSelectionDetails(showtime) {
        if (selectedSeats.length === 0) {
            selectedSeatsListEl.textContent = 'Chưa chọn ghế nào'; // Cập nhật thông báo
            totalPriceEl.textContent = '0 ₫';
        } else {
            const seatLabels = selectedSeats.map(seat => seat.dataset.seatLabel);
            selectedSeatsListEl.textContent = seatLabels.join(', ');
            
            // Giá tiền dựa trên suất chiếu, không phải từng ghế riêng lẻ
            const totalPrice = selectedSeats.length * showtime.price;
            totalPriceEl.textContent = totalPrice.toLocaleString('vi-VN');
        }
    }

    function handleSeatClick(seatElement, showtime) {
        const seatId = seatElement.dataset.seatId;
        const isSelected = seatElement.classList.toggle('selected');

        if (isSelected) {
            selectedSeats.push(seatElement);
        } else {
            selectedSeats = selectedSeats.filter(seat => seat.dataset.seatId !== seatId);
        }
        updateSelectionDetails(showtime);
    }

    async function renderSeatMap(showtimeId) {
        seatMapContainer.innerHTML = 'Đang tải sơ đồ ghế...';

        try {
            // 1. Lấy dữ liệu nếu chưa có trong cache
            if (!dbData) {
                const response = await fetch('../json/db.json');
                if (!response.ok) throw new Error('Không thể tải dữ liệu từ server.');
                dbData = await response.json();
            }

            // 2. Tìm thông tin cần thiết (sử dụng so sánh lỏng lẻo cho ID)
            const showtime = dbData.showtimes.find(st => st.id == showtimeId);
            if (!showtime) throw new Error(`Không tìm thấy suất chiếu với ID ${showtimeId}.`);

            const movie = dbData.movies.find(m => m.id == showtime.movieId);
            const room = dbData.cinema_rooms.find(r => r.id == showtime.roomId); // Đảm bảo room.id là số
            
            if (!room) throw new Error(`Không tìm thấy phòng chiếu với ID ${showtime.roomId}.`);
            
            const cinema = dbData.cinemas.find(c => c.id == room.cinemaId);
            
            if (!room.gridDimensions) throw new Error(`Cấu hình 'gridDimensions' cho phòng chiếu bị thiếu.`);
            // 3. Update ticket info
            movieTitleEl.textContent = movie.title;
            cinemaNameEl.textContent = cinema.name;
            roomNameEl.textContent = room.room_name;
            showtimeTimeEl.textContent = new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

            // // Cập nhật chú thích (legend)
            // const legendContainer = document.querySelector('.datghe-legend');
            // if (legendContainer) {
            //     legendContainer.innerHTML = `
            //         <div><span style="background-color: #B9F6CA;"></span>Ghế thường</div>
            //         <div><span style="background-color: #81D4FA;"></span>Ghế VIP</div>
            //         <div><span style="background-color: #F48FB1;"></span>Ghế đôi</div>
            //         <div><span style="background-color: #651FFF;"></span>Ghế đang chọn</div>
            //         <div><span style="background-color: #E0E0E0;"></span>Ghế đã bán</div>
            //     `;
            // }

            // 4. Chuẩn bị trạng thái ghế
            const occupiedSeats = (dbData.showtimeSeats || [])
                .filter(ss => ss.showtimeId == showtimeId)
                .reduce((map, seatStatus) => {
                    map[seatStatus.seatTemplateId] = seatStatus.status;
                    return map;
                }, {});
            
            // 5. Render sơ đồ ghế dựa trên gridDimensions và seatTemplates
            seatMapContainer.innerHTML = ''; // Chỉ xóa nội dung của container ghế

            // Kiểm tra xem phần tử màn hình đã tồn tại chưa để tránh thêm nhiều lần
            const parentContainer = seatMapContainer.parentElement;
            if (!parentContainer.querySelector('.seat-map-screen')) {
                const screenEl = document.createElement('div');
                screenEl.className = 'seat-map-screen';
                screenEl.textContent = 'MÀN HÌNH';
                parentContainer.insertBefore(screenEl, seatMapContainer); // Chèn màn hình vào trước sơ đồ ghế
            }

            seatMapContainer.style.setProperty('--total-cols', room.gridDimensions.totalCols);
            seatMapContainer.style.setProperty('--total-rows', room.gridDimensions.totalRows);

            const seatTemplatesForRoom = dbData.seatTemplates.filter(st => st.roomId === room.id);
            const seatGrid = document.createDocumentFragment(); // Dùng fragment để tối ưu hiệu suất

            seatTemplatesForRoom.forEach(template => {
                const seatElement = document.createElement('div');
                seatElement.classList.add('seat', template.seatType.toLowerCase());
                
                let status = occupiedSeats[template.id] || 'available';
                // Coi trạng thái "tạm giữ" (held) như là "đã đặt" (occupied)
                if (status === 'held') {
                    status = 'occupied';
                }
                seatElement.classList.add(status);

                // Định vị ghế trên lưới
                seatElement.style.gridRow = template.gridRow; // Đặt hàng cho ghế
                if (template.seatType.toLowerCase() === 'couple') {
                    seatElement.style.gridColumn = `${template.gridCol} / span 2`; // Ghế đôi chiếm 2 cột
                } else {
                    seatElement.style.gridColumn = template.gridCol; // Ghế thường chiếm 1 cột
                }

                seatElement.dataset.seatId = template.id;
                seatElement.dataset.seatLabel = template.seatLabel;
                seatElement.textContent = template.seatLabel;

                if (status === 'available') {
                    seatElement.addEventListener('click', () => handleSeatClick(seatElement, showtime));
                }
                
                seatGrid.appendChild(seatElement);
            });

            seatMapContainer.appendChild(seatGrid); // Thêm tất cả ghế một lần

        } catch (error) {
            console.error('Lỗi khi vẽ sơ đồ ghế:', error);
            seatMapContainer.parentElement.innerHTML = `<p style="color: red; text-align: center;">Lỗi: ${error.message}. Vui lòng thử lại sau.</p>`;
        }
    }

    // --- INITIALIZATION ---
    const urlParams = new URLSearchParams(window.location.search);
    const showtimeIdToRender = urlParams.get('showtimeId'); // Keep it as a string for comparison

    if (showtimeIdToRender) {
        renderSeatMap(showtimeIdToRender); // Truyền showtimeId dưới dạng chuỗi
    } else {
        seatMapContainer.innerHTML = '<p style="color: orange; grid-column: 1 / -1;">Vui lòng cung cấp `showtimeId` trong URL để chọn suất chiếu.</p>';
    }

    const continueBtn = document.getElementById('continue-btn');
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            if (selectedSeats.length === 0) {
                alert('Vui lòng chọn ít nhất một ghế.');
                return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const showtimeId = urlParams.get('showtimeId');
            const showtime = dbData.showtimes.find(st => st.id == showtimeId);
            const movie = dbData.movies.find(m => m.id == showtime.movieId);
            const room = dbData.cinema_rooms.find(r => r.id == showtime.roomId);
            const cinema = dbData.cinemas.find(c => c.id == room.cinemaId);

            const bookingDetails = {
                movieTitle: movie.title,
                cinemaName: cinema.name,
                showtime: new Date(showtime.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' - ' + new Date(showtime.startTime).toLocaleDateString('vi-VN'),
                roomName: room.room_name,
                selectedSeats: selectedSeats.map(seat => seat.dataset.seatLabel),
<<<<<<< HEAD
                selectedSeatIds: selectedSeats.map(seat => seat.dataset.seatId),
=======
>>>>>>> VanTiet
                totalPrice: selectedSeats.length * showtime.price,
                showtimeId: showtimeId
            };

            sessionStorage.setItem('bookingDetails', JSON.stringify(bookingDetails));
            window.location.href = 'confirm.html';
        });
    }
});