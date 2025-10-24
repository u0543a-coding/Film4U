document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("movieId");

  const cinemaSelect = document.querySelector(".datve-cinema-select");
  const dateList = document.querySelector(".datve-date-list");
  const movieBox = document.querySelector(".datve-movie-box");
  const cinemaInfoContainer = document.querySelector(".datve-cinema-info");
  const showtimeContainer = document.querySelector(".datve-showtime");

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
    rooms: [],
    showtimes: [],
    genres: {},
  };

  /**
   * Cập nhật và render lại giao diện dựa trên state mới
   */
  function updateAndRender() {
    if (!state.selectedCinemaId && state.cinemas.length > 0) {
      state.selectedCinemaId = state.cinemas[0].id;
    }
    if (!state.selectedDate) {
      const today = new Date();
      state.selectedDate = today.toISOString().split('T')[0];
    }

    renderCinemaInfo();
    renderShowtimes();
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
   * Hiển thị các lựa chọn rạp
   */
  function renderCinemaOptions() {
    if (!cinemaSelect) return;
    cinemaSelect.innerHTML = '<option value="">Chọn rạp</option>';
    state.cinemas.forEach(cinema => {
      const option = document.createElement('option');
      option.value = cinema.id;
      option.textContent = cinema.name;
      cinemaSelect.appendChild(option);
    });

    // Tự động chọn rạp đầu tiên nếu có
    if (state.cinemas.length > 0) {
        cinemaSelect.value = state.cinemas[0].id;
        state.selectedCinemaId = state.cinemas[0].id;
    }
  }

  /**
   * Hiển thị thông tin rạp đang chọn
   */
  function renderCinemaInfo() {
    if (!cinemaInfoContainer) return;
    const selectedCinema = state.cinemas.find(c => c.id == state.selectedCinemaId);
    if (!selectedCinema) {
        cinemaInfoContainer.innerHTML = '';
        return;
    }

    const date = new Date(state.selectedDate);
    const formattedDate = `Thứ ${date.getDay() + 1}, ${date.toLocaleDateString('vi-VN')}`;

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

    const filteredShowtimes = state.showtimes.filter(st => 
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
        return `<button>${time}</button>`;
    }).join('');
  }

  /**
   * Khởi tạo trang
   */
  async function initializePage() {
    try {
      const [movieDetails, allCinemas, allShowtimes, allGenres, allRooms] = await Promise.all([
        api.getMovieDetails(movieId),
        api.getCinemas(),
        api.getShowtimes({ movieId: movieId }),
        api.getGenres(),
        api.getCinemaRooms()
      ]);

      // Chuyển đổi mảng thành đối tượng map để tra cứu nhanh
      state.genres = allGenres.reduce((acc, genre) => { acc[genre.id] = genre.name; return acc; }, {});
      state.rooms = allRooms.reduce((acc, room) => { acc[room.id] = room; return acc; }, {});

      // Lọc ra các rạp có chiếu phim này
      const cinemaIdsWithShowtimes = [...new Set(allShowtimes.map(st => st.cinemaId))];
      state.cinemas = allCinemas.filter(c => cinemaIdsWithShowtimes.includes(parseInt(c.id)));

      state.movie = movieDetails;
      state.showtimes = allShowtimes;

      // Render
      renderMovieInfo();
      renderCinemaOptions();
      updateAndRender();

      // Thêm Event Listeners
      cinemaSelect.addEventListener('change', (e) => {
        state.selectedCinemaId = e.target.value;
        updateAndRender();
      });

      dateList.querySelectorAll('.datve-date-item').forEach(item => {
        item.addEventListener('click', (event) => {
            // Lấy ngày từ thuộc tính data-date
            state.selectedDate = event.currentTarget.dataset.date;

            // Bỏ active ở tất cả các item khác
            dateList.querySelectorAll('.datve-date-item').forEach(i => i.classList.remove('active'));
            // Thêm active cho item được click
            event.currentTarget.classList.add('active');

            updateAndRender();
        });
      });

    } catch (error) {
      console.error("Lỗi khi khởi tạo trang đặt vé:", error);
      document.querySelector(".datve-container").innerHTML = 
        `<p style="text-align: center; color: red;">Tải dữ liệu trang không thành công.</p>`;
    }
  }

  initializePage();
});
