document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("movieId");

  const cinemaSelect = document.querySelector(".datve-cinema-select");
  const dateList = document.querySelector(".datve-date-list");
  const movieBox = document.querySelector(".datve-movie-box");
  const cinemaInfoContainer = document.querySelector(".datve-cinema-info");

  if (!movieId) {
    document.querySelector(".datve-container").innerHTML =
      `<p style="text-align: center; color: red;">Lỗi: Không tìm thấy ID phim trong URL.</p>`;
    return;
  }

  // --- STATE ---
  let state = {
    selectedCinemaId: null,
    selectedDate: null, // YYYY-MM-DD
    movie: null,
    cinemas: [],
    allShowtimesForMovie: [], // Chỉ lưu các suất chiếu cho phim đang chọn
    genres: {},
  };

  /**
   * Cập nhật và render lại giao diện dựa trên state mới
   */
  function updateAndRender() {
    renderCinemaInfo();
    renderShowtimes();
  }

  /**
   * Tạo và hiển thị danh sách các ngày có suất chiếu.
   */
  function renderDateList() {
    if (!dateList) return;
    dateList.innerHTML = ''; // Xóa nội dung cũ

    const weekdays = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();

    // Helper function to format date string correctly without timezone issues
    const toYYYYMMDD = (date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const d = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const day = date.getDate();
      const month = date.getMonth() + 1;
      const weekday = weekdays[date.getDay()];
      const formattedDate = `${day}/${month}`;
      const dateString = toYYYYMMDD(date); // Sử dụng helper function

      const dateItem = document.createElement('div');
      dateItem.classList.add('datve-date-item');
      dateItem.dataset.date = dateString;

      if (i === 0) {
        dateItem.classList.add('active');
        state.selectedDate = dateString; // Set ngày mặc định là hôm nay
      }
      
      // Consistent format for all days: Weekday on top, date on bottom
      dateItem.innerHTML = `${weekday}<br><small>${formattedDate}</small>`;
      
      dateList.appendChild(dateItem);
    }
    
    addDateClickHandlers();
  }

  /**
   * Thêm trình xử lý sự kiện click cho các ngày
   */
  function addDateClickHandlers() {
      dateList.querySelectorAll('.datve-date-item').forEach(item => {
        item.addEventListener('click', (event) => {
            state.selectedDate = event.currentTarget.dataset.date;
            dateList.querySelectorAll('.datve-date-item').forEach(i => i.classList.remove('active'));
            event.currentTarget.classList.add('active');
            updateAndRender();
        });
      });
  }

  /**
   * Hiển thị thông tin phim
   */
  function renderMovieInfo() {
    if (!movieBox || !state.movie) return;
    const movieGenres = state.movie.genreIds.map(id => state.genres[id] || '').join(', ');
    movieBox.innerHTML = `
      <img src="${state.movie.poster_url}" alt="Poster phim">
      <div class="datve-movie-info">
        <h4>${state.movie.title}</h4>
        <p><small>T16 · ${state.movie.duration_minutes} phút · ${movieGenres}</small></p>
        <p><strong>2D Phụ đề Việt</strong></p>
        <div class="datve-showtime">
          <!-- Suất chiếu sẽ được render ở đây -->
        </div>
      </div>
    `;
  }

  /**
   * Hiển thị các lựa chọn rạp có chiếu phim này
   */
  function renderCinemaOptions() {
    if (!cinemaSelect) return;
    cinemaSelect.innerHTML = '<option value="">Chọn rạp</option>';
    
    const cinemaIdsWithShowtimes = [...new Set(state.allShowtimesForMovie.map(st => st.cinemaId))];
    const cinemasWithShowtimes = state.cinemas.filter(c => cinemaIdsWithShowtimes.includes(c.id));

    if (cinemasWithShowtimes.length === 0) {
        cinemaSelect.innerHTML = '<option value="">Không có rạp nào chiếu phim này</option>';
        return;
    }

    cinemasWithShowtimes.forEach(cinema => {
      const option = document.createElement('option');
      option.value = cinema.id;
      option.textContent = cinema.name;
      cinemaSelect.appendChild(option);
    });

    // Tự động chọn rạp đầu tiên nếu có
    if (cinemasWithShowtimes.length > 0) {
        cinemaSelect.value = cinemasWithShowtimes[0].id;
        state.selectedCinemaId = cinemasWithShowtimes[0].id;
    }
  }

  /**
   * Hiển thị thông tin rạp đang chọn
   */
  function renderCinemaInfo() {
    if (!cinemaInfoContainer || !state.selectedCinemaId) {
        cinemaInfoContainer.innerHTML = '';
        return;
    };
    const selectedCinema = state.cinemas.find(c => c.id == state.selectedCinemaId);
    if (!selectedCinema) return;

    const parts = state.selectedDate.split('-');
    const date = new Date(parts[0], parts[1] - 1, parts[2]); 
    const weekdays = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const formattedDate = `${weekdays[date.getDay()]}, ${date.toLocaleDateString('vi-VN')}`;

    cinemaInfoContainer.innerHTML = `
      <strong>${selectedCinema.name}</strong> · ${formattedDate}<br>
      <small>${selectedCinema.address}</small>
    `;
  }

  /**
   * Hiển thị các suất chiếu dựa trên rạp và ngày đã chọn
   */
  function renderShowtimes() {
    const showtimeContainer = movieBox.querySelector('.datve-showtime');
    if (!showtimeContainer) return;

    const filteredShowtimes = state.allShowtimesForMovie.filter(st =>
        st.cinemaId == state.selectedCinemaId &&
        st.startTime.startsWith(state.selectedDate)
    );

    if (filteredShowtimes.length === 0) {
        showtimeContainer.innerHTML = '<p>Không có suất chiếu phù hợp.</p>';
        return;
    }

    filteredShowtimes.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

    showtimeContainer.innerHTML = filteredShowtimes.map(st => {
        const time = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        const url = `seatbooking.html?showtimeId=${st.id}`;
        return `<a href="${url}" class="showtime-button">${time}</a>`;
        return `<a href="${url}" class="showtime-link">${time}</a>`;
    }).join('');
  }
  
  /**
   * Thêm hàm getShowtimes vào api.js nếu chưa có
   */
  function ensureApiFunction() {
      if (typeof api.getShowtimes !== 'function') {
          api.getShowtimes = (params = {}) => {
              const query = new URLSearchParams(params).toString();
              return fetchJson(`${BASE_URL}/showtimes?${query}`);
          }
      }
  }

  /**
   * Khởi tạo trang
   */
  async function initializePage() {
    try {
      ensureApiFunction();

      // --- 1. Tải dữ liệu từ API ---
      // Chuyển sang dùng api.getShowtimes thay vì getShowtimePatterns
      const [movieDetails, allCinemas, allShowtimesForMovie, allGenres] = await Promise.all([
        api.getMovieDetails(movieId),
        api.getCinemas(),
        api.getShowtimes({ movieId: movieId }), // Lấy các suất chiếu tĩnh cho phim
        api.getGenres(),
      ]);

      // --- 2. Xử lý và lưu dữ liệu vào state ---
      state.genres = allGenres.reduce((acc, genre) => { acc[genre.id] = genre.name; return acc; }, {});
      state.cinemas = allCinemas;
      state.movie = movieDetails;
      state.allShowtimesForMovie = allShowtimesForMovie;

      // --- 3. Render giao diện ---
      renderMovieInfo();
      renderCinemaOptions();
      renderDateList(); // Phải chạy sau khi có allShowtimesForMovie
      updateAndRender(); // Render thông tin rạp và suất chiếu lần đầu

      // --- 4. Thêm Event Listeners ---
      cinemaSelect.addEventListener('change', (e) => {
        state.selectedCinemaId = e.target.value;
        updateAndRender();
      });

    } catch (error) {
      console.error("Lỗi khi khởi tạo trang đặt vé:", error);
      document.querySelector(".datve-container").innerHTML =
        `<p style="text-align: center; color: red;">Tải dữ liệu trang không thành công.</p>`;
    }
  }

  initializePage();
});
