document.addEventListener('DOMContentLoaded', function() {

    // Khai báo các biến sẽ sử dụng
    var cinemaSelect = document.getElementById('cinema-select');
    var dateList = document.getElementById('date-list');
    var movieDetailsContainer = document.getElementById('movie-details-container');
    var cinemaInfo = document.getElementById('cinema-info');
    var moviePoster = document.getElementById('movie-poster');
    var movieTitle = document.getElementById('movie-title');
    var movieDetails = document.getElementById('movie-details');
    var movieFormat = document.getElementById('movie-format');
    var showtimeList = document.getElementById('showtime-list');

    var allMovies, allCinemas, allCinemaRooms, allShowtimes, allGenres;

    // Hàm chính để khởi tạo trang
    async function initializePage() {
        // Lấy movieId từ URL
        var params = new URLSearchParams(window.location.search);
        var movieId = parseInt(params.get("movieId"));

        if (!movieId) {
            document.querySelector('.datve-container').innerHTML = '<p style="text-align: center; color: red;">Lỗi: Không tìm thấy phim.</p>';
            return;
        }

        // Tải toàn bộ dữ liệu từ db.json
        var response = await fetch('/Film4U/json/db.json');
        var data = await response.json();
        allMovies = data.movies;
        allCinemas = data.cinemas;
        allCinemaRooms = data.cinema_rooms;
        allShowtimes = data.showtimes;
        allGenres = data.genres;

        // Tìm phim được chọn
        var selectedMovie = allMovies.find(function(m) { return m.id === movieId; });

        if (!selectedMovie) {
            document.querySelector('.datve-container').innerHTML = '<p style="text-align: center; color: red;">Lỗi: Không tìm thấy thông tin phim.</p>';
            return;
        }

        // Hiển thị thông tin cơ bản của phim
        document.title = 'Đặt vé: ' + selectedMovie.title;
        movieTitle.textContent = selectedMovie.title;
        moviePoster.src = selectedMovie.poster_url;
        movieDetails.textContent = 'T' + (selectedMovie.age_rating || 16) + ' · ' + selectedMovie.duration_minutes + '’ · ' + getGenreNames(selectedMovie.genreIds);
        movieFormat.textContent = '2D Phụ đề Việt'; // Giả định tạm thời

        // Tạo danh sách ngày chiếu
        populateDates();

        // Lọc và hiển thị các rạp có chiếu phim này
        populateCinemas(movieId);

        // Gắn sự kiện để cập nhật suất chiếu
        cinemaSelect.addEventListener('change', updateShowtimes);
    }

    // Hàm hiển thị danh sách rạp
    function populateCinemas(movieId) {
        var relevantShowtimes = allShowtimes.filter(function(st) { return st.movieId === movieId; });
        var roomIds = [].concat.apply([], relevantShowtimes.map(function(st) { return st.roomId; }));
        var uniqueRoomIds = [...new Set(roomIds)];
        var cinemaIds = [].concat.apply([], allCinemaRooms.filter(function(room) { return uniqueRoomIds.includes(room.id); }).map(function(room) { return room.cinemaId; }));
        var uniqueCinemaIds = [...new Set(cinemaIds)];
        var cinemasForMovie = allCinemas.filter(function(cinema) { return uniqueCinemaIds.includes(cinema.id); });

        cinemaSelect.innerHTML = '<option selected value="">Vui lòng chọn rạp</option>';
        if (cinemasForMovie.length > 0) {
            cinemasForMovie.forEach(function(cinema) {
                var option = document.createElement('option');
                option.value = cinema.id;
                option.textContent = cinema.name;
                cinemaSelect.appendChild(option);
            });
        } else {
            cinemaSelect.innerHTML = '<option selected>Không có rạp nào chiếu phim này</option>';
            cinemaSelect.disabled = true;
        }
    }

    // Hàm tạo danh sách ngày
    function populateDates() {
        dateList.innerHTML = '';
        var today = new Date();
        for (var i = 0; i < 7; i++) {
            var date = new Date(today);
            date.setDate(today.getDate() + i);
            
            var dateItem = document.createElement('div');
            dateItem.classList.add('datve-date-item');
            if (i === 0) {
                dateItem.classList.add('active');
            }
            dateItem.dataset.date = date.toISOString().split('T')[0]; // YYYY-MM-DD
            
            var day = String(date.getDate()).padStart(2, '0');
            var month = String(date.getMonth() + 1).padStart(2, '0');
            var weekday = date.toLocaleDateString('vi-VN', { weekday: 'short' });

            dateItem.innerHTML = day + '/' + month + '<br><small>' + weekday + '</small>';
            dateList.appendChild(dateItem);

            dateItem.addEventListener('click', function() {
                document.querySelectorAll('.datve-date-item').forEach(function(item) { item.classList.remove('active'); });
                this.classList.add('active');
                updateShowtimes();
            });
        }
    }

    // Hàm cập nhật và hiển thị suất chiếu
    function updateShowtimes() {
        var selectedCinemaId = parseInt(cinemaSelect.value);
        var selectedDateElem = document.querySelector('.datve-date-item.active');
        
        if (!selectedCinemaId || !selectedDateElem) {
            movieDetailsContainer.style.display = 'none';
            return;
        }

        var selectedDate = selectedDateElem.dataset.date;
        var selectedCinema = allCinemas.find(function(c) { return c.id === selectedCinemaId; });
        var params = new URLSearchParams(window.location.search);
        var movieId = parseInt(params.get("movieId"));

        // Cập nhật thông tin rạp
        var today = new Date(selectedDate);
        var weekday = today.toLocaleDateString('vi-VN', { weekday: 'long' });
        var day = String(today.getDate()).padStart(2, '0');
        var month = String(today.getMonth() + 1).padStart(2, '0');
        var year = today.getFullYear();
        cinemaInfo.innerHTML = '<strong>' + selectedCinema.name + '</strong> · ' + weekday + ', ' + day + '/' + month + '/' + year + '<br><small>' + selectedCinema.address + '</small>';

        // Lọc và hiển thị các suất chiếu
        var roomIdsInCinema = allCinemaRooms.filter(function(room) { return room.cinemaId === selectedCinemaId; }).map(function(room) { return room.id; });
        var relevantShowtimes = allShowtimes.filter(function(st) {
            return st.movieId === movieId && 
                   roomIdsInCinema.includes(st.roomId) &&
                   st.startTime.startsWith(selectedDate);
        });

        showtimeList.innerHTML = '';
        if (relevantShowtimes.length > 0) {
            relevantShowtimes.sort(function(a, b) { return new Date(a.startTime) - new Date(b.startTime); });
            relevantShowtimes.forEach(function(st) {
                var time = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                var button = document.createElement('button');
                button.textContent = time;
                showtimeList.appendChild(button);
            });
        } else {
            showtimeList.innerHTML = '<p>Không có suất chiếu nào cho ngày này.</p>';
        }

        movieDetailsContainer.style.display = 'flex';
    }

    // Hàm lấy tên thể loại
    function getGenreNames(genreIds) {
        if (!genreIds || !allGenres) return '';
        return genreIds.map(function(id) {
            var genre = allGenres.find(function(g) { return g.id === id; });
            return genre ? genre.name : '';
        }).join(', ');
    }

    // Chạy hàm khởi tạo
    initializePage();
});