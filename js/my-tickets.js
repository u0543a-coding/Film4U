// document.addEventListener('DOMContentLoaded', () => {
//     const bookingListContainer = document.getElementById('booking-list');
//     const loggedInUser = sessionStorage.getItem('loggedInUser');

//     if (!bookingListContainer) {
//         console.error('Không tìm thấy container hiển thị lịch sử đặt vé');
//         return;
//     }

//     if (loggedInUser) {
//         try {
//             const user = JSON.parse(loggedInUser);
//             if (!user.id) {
//                 throw new Error('Thông tin người dùng không hợp lệ');
//             }
//             loadBookingHistory(user.id);
//         } catch (error) {
//             console.error('Lỗi xử lý thông tin người dùng:', error);
//             alert('Có lỗi xảy ra với thông tin đăng nhập. Vui lòng đăng nhập lại.');
//             window.location.href = 'login.html';
//         }
//     } else {
//         alert('Bạn cần đăng nhập để xem trang này.');
//         window.location.href = 'login.html';
//     }

//     async function loadBookingHistory(userId) {
//         if (!bookingListContainer) return;

//         try {
//             // Hiển thị trạng thái loading
//             bookingListContainer.innerHTML = '<p class="loading">Đang tải lịch sử đặt vé...</p>';

//             const bookings = await api.getBookings({ userId: userId, _sort: 'bookingTime', _order: 'desc' });

//             if (bookings.length === 0) {
//                 bookingListContainer.innerHTML = '<p class="no-bookings">Bạn chưa có lịch sử đặt vé nào.</p>';
//                 return;
//             }

//             let html = '';
//             for (const booking of bookings) {
//                 try {
//                     const showtime = await api.getShowtimes({ id: booking.showtimeId, _expand: 'movie' });
//                     if (showtime.length === 0) {
//                         console.warn(`Không tìm thấy thông tin suất chiếu ID: ${booking.showtimeId}`);
//                         continue;
//                     }

//                     const { movie, cinemaId, roomId, startTime } = showtime[0];

//                     if (!movie) {
//                         console.warn(`Không tìm thấy thông tin phim cho suất chiếu ID: ${booking.showtimeId}`);
//                         continue;
//                     }

//                     const cinema = await api.getCinemas({ id: cinemaId });
//                     const cinemaName = cinema.length > 0 ? cinema[0].name : 'Không xác định';

//                     html += `
//                         <div class="booking-card">
//                             <img src="${movie.poster_url}" alt="Poster phim ${movie.title}" class="film-poster"
//                                  onerror="this.src='../assets/images/default-poster.jpg'">
//                             <div class="booking-details">
//                                 <h3>${movie.title}</h3>
//                                 <p><strong>Rạp:</strong> ${cinemaName}</p>
//                                 <p><strong>Suất chiếu:</strong> ${new Date(startTime).toLocaleString('vi-VN')}</p>
//                                 <p><strong>Ghế đã đặt:</strong> ${booking.seatTemplateIds ? booking.seatTemplateIds.join(', ') : 'Không xác định'}</p>
//                                 <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} đ</p>
//                                 <p><strong>Ngày đặt:</strong> ${new Date(booking.bookingTime).toLocaleString('vi-VN')}</p>
//                             </div>
//                         </div>
//                     `;
//                 } catch (bookingError) {
//                     console.error(`Lỗi khi tải thông tin cho đặt vé ID ${booking.id}:`, bookingError);
//                     continue;
//                 }
//             }

//             if (html === '') {
//                 bookingListContainer.innerHTML = '<p class="no-bookings">Không thể tải thông tin vé. Vui lòng thử lại sau.</p>';
//             } else {
//                 bookingListContainer.innerHTML = html;
//             }

//         } catch (error) {
//             console.error('Lỗi khi tải lịch sử đặt vé:', error);
//             bookingListContainer.innerHTML = `
//                 <p class="error-message" style="color: red;">
//                     Đã xảy ra lỗi khi tải lịch sử đặt vé. 
//                     <button onclick="location.reload()">Thử lại</button>
//                 </p>`;
//         }
//     }
// });

// import api from './api.js';

// // Hàm hiển thị danh sách vé của user
// async function renderUserTickets(userId) {
//     try {
//         // 1️⃣ Lấy danh sách vé của người dùng
//         const bookings = await api.getBookings({ userId });

//         // 2️⃣ Với mỗi vé, lấy thêm thông tin showtime và movie
//         const ticketElements = await Promise.all(bookings.map(async (booking) => {
//             const showtime = await api.getShowtimes({ id: booking.showtimeId });
//             const show = showtime[0]; // vì getShowtimes trả mảng

//             const movie = await api.getMovieDetails(show.movieId);

//             // 3️⃣ Format ngày giờ dễ đọc
//             const startTime = new Date(show.startTime).toLocaleString('vi-VN');

//             // 4️⃣ Tạo HTML hiển thị vé
//             return `
//                 <div class="ticket-card">
//                     <img src="${movie.poster_url}" alt="${movie.title}" class="ticket-poster"/>
//                     <div class="ticket-info">
//                         <h3>${movie.title}</h3>
//                         <p><strong>Suất chiếu:</strong> ${startTime}</p>
//                         <p><strong>Ghế:</strong> ${booking.seatTemplateIds?.join(', ') || 'N/A'}</p>
//                         <p><strong>Tổng tiền:</strong> ${booking.totalPrice.toLocaleString('vi-VN')} đ</p>
//                         <p><strong>Trạng thái:</strong> ${booking.status}</p>
//                     </div>
//                 </div>
//             `;
//         }));

//         // 5️⃣ Chèn tất cả vé vào DOM
//         document.getElementById('userTickets').innerHTML = ticketElements.join('');

//     } catch (err) {
//         console.error('Lỗi khi hiển thị vé:', err);
//         document.getElementById('userTickets').innerHTML = '<p>Không thể tải danh sách vé.</p>';
//     }
// }

// // Gọi hàm này sau khi user đăng nhập (ví dụ userId = 2)
// renderUserTickets(2);



// my-tickets.js (thay thế toàn bộ)
document.addEventListener('DOMContentLoaded', async () => {
  const bookingListContainer = document.getElementById('booking-list');
  if (!bookingListContainer) {
    console.error('Không tìm thấy container #booking-list');
    return;
  }

  // TÌM user: thử cả localStorage và sessionStorage (chắc chắn)
  let loggedRaw = localStorage.getItem('loggedInUser') || sessionStorage.getItem('loggedInUser') || localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
  console.log('[my-tickets] loggedRaw:', loggedRaw);

  if (!loggedRaw) {
    // Không tìm thấy user -> báo và chuyển về login
    bookingListContainer.innerHTML = '<p class="no-bookings">Bạn cần đăng nhập để xem vé. Chuyển tới trang đăng nhập...</p>';
    setTimeout(() => window.location.href = 'user-login.html', 1000);
    return;
  }

  let user;
  try {
    user = JSON.parse(loggedRaw);
  } catch (err) {
    console.error('Lỗi parse user từ storage:', err);
    bookingListContainer.innerHTML = '<p class="error-message">Thông tin đăng nhập không hợp lệ. Vui lòng đăng nhập lại.</p>';
    return;
  }

  if (!user || (!user.id && !user.email)) {
    bookingListContainer.innerHTML = '<p class="error-message">Không tìm thấy thông tin tài khoản. Vui lòng đăng nhập lại.</p>';
    return;
  }

  const userId = String(user.id ?? user.userId ?? user._id); // đảm bảo string

  // Show loading
  bookingListContainer.innerHTML = '<p class="loading">Đang tải lịch sử đặt vé...</p>';

  try {
    // 1) Lấy booking từ api
    const bookings = await api.getBookings({ userId }); // api.getBookings builds ?userId=...
    console.log('[my-tickets] bookings raw:', bookings);

    if (!Array.isArray(bookings) || bookings.length === 0) {
      bookingListContainer.innerHTML = '<p class="no-bookings">Bạn chưa có lịch sử đặt vé nào.</p>';
      return;
    }

    // sắp xếp theo bookingTime giảm dần (mới nhất trước)
    bookings.sort((a, b) => new Date(b.bookingTime) - new Date(a.bookingTime));

    // 2) build html cho mỗi booking (lấy showtime + movie + cinema khi cần)
    let html = '';
    for (const b of bookings) {
      try {
        // lấy showtime (API trả mảng do query ?id=)
        const showtimeArr = await api.getShowtimes({ id: b.showtimeId });
        const showtime = Array.isArray(showtimeArr) ? showtimeArr[0] : showtimeArr;
        if (!showtime) {
          console.warn(`[my-tickets] Không tìm thấy showtime id=${b.showtimeId} cho booking id=${b.id}`);
          continue;
        }

        // lấy movie (showtime.movieId có thể là string)
        const movie = await api.getMovieDetails(showtime.movieId);
        // lấy cinema tên (api.getCinemas không có query param in your api; use getCinemas then find)
        let cinemaName = 'Không xác định';
        try {
          const cinemas = await api.getCinemas();
          const found = (Array.isArray(cinemas) ? cinemas : []).find(c => String(c.id) === String(showtime.cinemaId) || String(c.id) === String(showtime.cinema));
          if (found) cinemaName = found.name;
        } catch (err) {
          console.warn('[my-tickets] Lỗi lấy danh sách rạp:', err);
        }

        const poster = movie?.poster_url || '../assets/images/default-poster.jpg';
        const title = movie?.title || 'Phim chưa rõ';
        const start = showtime?.startTime ? new Date(showtime.startTime).toLocaleString('vi-VN') : 'Không xác định';
        const seats = Array.isArray(b.seatTemplateIds) ? b.seatTemplateIds.join(', ') : (b.seatTemplateIds || 'Không xác định');
        const total = b.totalPrice ? Number(b.totalPrice).toLocaleString('vi-VN') + ' đ' : 'N/A';
        const bookedAt = b.bookingTime ? new Date(b.bookingTime).toLocaleString('vi-VN') : '';

        html += `
          <div class="booking-card">
            <img src="${poster}" alt="${title}" class="film-poster" onerror="this.src='../assets/images/default-poster.jpg'">
            <div class="booking-details">
              <h3 class="movie-title">${title}</h3>
              <p><strong>Rạp:</strong> ${cinemaName}</p>
              <p><strong>Suất chiếu:</strong> ${start}</p>
              <p><strong>Ghế đã đặt:</strong> ${seats}</p>
              <p><strong>Tổng tiền:</strong> ${total}</p>
              <p class="booking-meta"><strong>Ngày đặt:</strong> ${bookedAt} · <strong>Trạng thái:</strong> ${b.status || 'N/A'}</p>
            </div>
          </div>
        `;
      } catch (innerErr) {
        console.error(`[my-tickets] Lỗi xử lý booking id=${b.id}:`, innerErr);
        // tiếp tục các booking khác
      }
    }

    bookingListContainer.innerHTML = html || '<p class="no-bookings">Không tìm thấy vé hợp lệ.</p>';
  } catch (err) {
    console.error('[my-tickets] Lỗi khi gọi API bookings:', err);
    bookingListContainer.innerHTML = `
      <p class="error-message">Không thể tải lịch sử đặt vé. <button id="retryBtn">Thử lại</button></p>
    `;
    document.getElementById('retryBtn')?.addEventListener('click', () => location.reload());
  }
});