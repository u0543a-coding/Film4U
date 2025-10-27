document.addEventListener('DOMContentLoaded', () => {
    // --- AUTHENTICATION --- //
    (async () => {
        const userId = localStorage.getItem("loggedInUserId");
        if (!userId) {
            window.location.href = "login.html";
            return;
        }
        try {
            const user = await api.getUserById(userId);
            if (user.role !== "admin") {
                localStorage.removeItem("loggedInUserId");
                window.location.href = "login.html";
            }
        } catch (error) {
            console.error("Admin auth check failed:", error);
            localStorage.removeItem("loggedInUserId");
            window.location.href = "login.html";
        }
    })();

    // --- HEADER & USER MENU --- //
    const userIcon = document.getElementById('user-icon');
    const userMenu = document.getElementById('user-menu');
    const logoutBtn = document.getElementById('logout-btn-dropdown');

    userIcon.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent click from immediately closing the menu
        userMenu.classList.toggle('show');
    });

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("loggedInUserId");
        window.location.href = "login.html";
    });

    // Close the dropdown if clicking outside
    window.addEventListener('click', (e) => {
        if (!userIcon.contains(e.target)) {
            userMenu.classList.remove('show');
        }
    });

    // --- NAVIGATION / TAB SWITCHING --- //
    const navItems = document.querySelectorAll('.nav-item');
    const contentSections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const targetSectionId = item.dataset.section;

            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            contentSections.forEach(sec => sec.classList.remove('active'));

            // Add active class to the clicked item and corresponding section
            item.classList.add('active');
            document.getElementById(`${targetSectionId}-section`).classList.add('active');
        });
    });

    // --- DOM ELEMENTS (for Movie Management) --- //
    const moviesSection = document.getElementById('movies-section');
    const addMovieBtn = document.getElementById('add-movie-btn');
    const movieFormContainer = document.getElementById('movie-form-container');
    const movieForm = document.getElementById('movie-form');
    const cancelBtn = document.getElementById('cancel-btn');
    const moviesTableBody = document.getElementById('movies-table-body');
    const formTitle = document.getElementById('form-title');
    const genreSelect = document.getElementById('genreIds');

    let allGenres = [];

    // --- FUNCTIONS --- //

    /**
     * Fetches movies and renders them in the table.
     */
    const renderMovies = async () => {
        try {
            const movies = await api.getMovies();
            moviesTableBody.innerHTML = ''; // Clear existing rows
            movies.forEach(movie => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${movie.title}</td>
                    <td>${new Date(movie.release_date).toLocaleDateString('vi-VN')}</td>
                    <td>${movie.status === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu'}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-warning edit-btn" data-id="${movie.id}">Sửa</button>
                        <button class="btn btn-sm btn-danger delete-btn" data-id="${movie.id}">Xóa</button>
                    </td>
                `;
                moviesTableBody.appendChild(row);
            });
        } catch (error) {
            console.error('Failed to render movies:', error);
            moviesTableBody.innerHTML = '<tr><td colspan="4">Lỗi tải danh sách phim.</td></tr>';
        }
    };

    /**
     * Fetches genres and populates the multi-select dropdown.
     */
    const populateGenres = async () => {
        try {
            allGenres = await api.getGenres();
            genreSelect.innerHTML = '';
            allGenres.forEach(genre => {
                const option = document.createElement('option');
                option.value = genre.id;
                option.textContent = genre.name;
                genreSelect.appendChild(option);
            });
        } catch (error) {
            console.error('Failed to populate genres:', error);
        }
    };

    /**
     * Shows the form for adding or editing a movie.
     * @param {object|null} movie - The movie object to edit, or null to add.
     */
    const showForm = (movie = null) => {
        movieForm.reset();
        if (movie) {
            formTitle.textContent = 'Chỉnh sửa Phim';
            // Populate form with movie data
            document.getElementById('movie-id').value = movie.id;
            document.getElementById('title').value = movie.title;
            document.getElementById('description').value = movie.description;
            document.getElementById('poster_url').value = movie.poster_url;
            document.getElementById('release_date').value = movie.release_date;
            document.getElementById('duration_minutes').value = movie.duration_minutes;
            document.getElementById('director').value = movie.director;
            document.getElementById('actors').value = movie.actors;
            document.getElementById('trailer_url').value = movie.trailer_url;
            document.getElementById('status').value = movie.status;
            // Select genres
            const genreIds = movie.genreIds || [];
            Array.from(genreSelect.options).forEach(option => {
                option.selected = genreIds.includes(parseInt(option.value));
            });
        } else {
            formTitle.textContent = 'Thêm Phim Mới';
            document.getElementById('movie-id').value = '';
        }
        movieFormContainer.style.display = 'block';
    };

    /**
     * Hides the movie form.
     */
    const hideForm = () => {
        movieFormContainer.style.display = 'none';
        movieForm.reset();
    };

    /**
     * Handles the form submission for adding or updating a movie.
     * @param {Event} e - The form submission event.
     */
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(movieForm);
        const id = formData.get('id');
        const selectedGenreIds = Array.from(genreSelect.selectedOptions).map(opt => parseInt(opt.value));

        const movieData = {
            title: formData.get('title'),
            description: formData.get('description'),
            poster_url: formData.get('poster_url'),
            release_date: formData.get('release_date'),
            duration_minutes: parseInt(formData.get('duration_minutes')),
            director: formData.get('director'),
            actors: formData.get('actors'),
            trailer_url: formData.get('trailer_url'),
            status: formData.get('status'),
            genreIds: selectedGenreIds
        };

        try {
            if (id) {
                // Update existing movie
                await api.updateMovie(id, movieData);
            } else {
                // Add new movie
                await api.addMovie(movieData);
            }
            hideForm();
            await renderMovies(); // Refresh the table
        } catch (error) {
            console.error('Failed to save movie:', error);
            alert('Lưu phim không thành công.');
        }
    };

    /**
     * Handles clicks on the movie table (for edit and delete buttons).
     * @param {Event} e - The click event.
     */
    const handleTableClick = async (e) => {
        const target = e.target;
        const id = target.dataset.id;

        if (target.classList.contains('delete-btn')) {
            if (confirm('Bạn có chắc chắn muốn xóa phim này không?')) {
                try {
                    await api.deleteMovie(id);
                    await renderMovies(); // Refresh the table
                } catch (error) {
                    console.error('Failed to delete movie:', error);
                    alert('Xóa phim không thành công.');
                }
            }
        } else if (target.classList.contains('edit-btn')) {
            try {
                const movie = await api.getMovieDetails(id);
                showForm(movie);
            } catch (error) {
                console.error('Failed to fetch movie details for editing:', error);
                alert('Không thể lấy thông tin chi tiết phim.');
            }
        }
    };

    // --- DOM ELEMENTS (for Showtime Management) ---
    const addShowtimeBtn = document.getElementById('add-showtime-btn');
    const showtimeFormContainer = document.getElementById('showtime-form-container');
    const showtimeForm = document.getElementById('showtime-form');
    const cancelShowtimeBtn = document.getElementById('cancel-showtime-btn');
    const showtimesTableBody = document.getElementById('showtimes-table-body');
    const showtimeMovieSelect = document.getElementById('showtime-movie');
    const showtimeCinemaSelect = document.getElementById('showtime-cinema');
    const showtimeRoomSelect = document.getElementById('showtime-room');

    let allShowtimeMovies = [];
    let allShowtimeCinemas = [];
    let allShowtimeRooms = [];

    /**
     * Shows the form for adding a new showtime.
     */
    const showShowtimeForm = () => {
        showtimeForm.reset();
        showtimeRoomSelect.disabled = true; // Disable room selection initially
        document.getElementById('showtime-id').value = '';
        showtimeFormContainer.style.display = 'block';
    };

    /**
     * Hides the showtime form.
     */
    const hideShowtimeForm = () => {
        showtimeFormContainer.style.display = 'none';
        showtimeForm.reset();
    };

    /**
     * Fetches and renders showtimes into the table.
     */
    const renderShowtimes = async () => {
        try {
            const showtimes = await api.getShowtimes({ _sort: 'startTime', _order: 'desc' });
            showtimesTableBody.innerHTML = ''; // Clear table

            // Create lookup maps for efficiency
            const movieMap = new Map(allShowtimeMovies.map(m => [m.id, m.title]));
            const cinemaMap = new Map(allShowtimeCinemas.map(c => [c.id, c.name]));
            const roomMap = new Map(allShowtimeRooms.map(r => [r.id, r.room_name]));

            showtimes.forEach(st => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${movieMap.get(st.movieId) || 'N/A'}</td>
                    <td>${cinemaMap.get(st.cinemaId) || 'N/A'}</td>
                    <td>${roomMap.get(st.roomId) || 'N/A'}</td>
                    <td>${new Date(st.startTime).toLocaleString('vi-VN')}</td>
                    <td>${st.price.toLocaleString('vi-VN')} ₫</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-danger delete-showtime-btn" data-id="${st.id}">Xóa</button>
                    </td>
                `;
                showtimesTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Failed to render showtimes:", error);
            showtimesTableBody.innerHTML = '<tr><td colspan="6">Lỗi tải danh sách suất chiếu.</td></tr>';
        }
    };

    /**
     * Handles click events on the showtimes table, specifically for deletion.
     */
    const handleShowtimesTableClick = async (e) => {
        const target = e.target;
        if (target.classList.contains('delete-showtime-btn')) {
            const showtimeId = target.dataset.id;
            if (confirm('Bạn có chắc chắn muốn xóa suất chiếu này không? Thao tác này không thể hoàn tác.')) {
                try {
                    await api.deleteShowtime(showtimeId);
                    await renderShowtimes(); // Refresh the table
                } catch (error) {
                    console.error('Failed to delete showtime:', error);
                    alert('Xóa suất chiếu không thành công.');
                }
            }
        }
    };

    /**
     * Populates the dropdowns for movies and cinemas in the showtime form.
     */
    const populateShowtimeDropdowns = async () => {
        try {
            // Fetch all necessary data in parallel
            [allShowtimeMovies, allShowtimeCinemas, allShowtimeRooms] = await Promise.all([
                api.getMovies(),
                api.getCinemas(),
                api.getCinemaRooms() // Assuming api.js has or will have this function
            ]);

            // Populate movies dropdown
            showtimeMovieSelect.innerHTML = '<option value="">-- Chọn phim --</option>';
            allShowtimeMovies
                .filter(m => m.status === 'now_showing') // Only include movies that are currently showing
                .forEach(movie => {
                    const option = document.createElement('option');
                    option.value = movie.id;
                    option.textContent = movie.title;
                    showtimeMovieSelect.appendChild(option);
                });

            // Populate cinemas dropdown
            showtimeCinemaSelect.innerHTML = '<option value="">-- Chọn rạp --</option>';
            allShowtimeCinemas.forEach(cinema => {
                const option = document.createElement('option');
                option.value = cinema.id;
                option.textContent = cinema.name;
                showtimeCinemaSelect.appendChild(option);
            });

        } catch (error) {
            console.error("Failed to populate showtime dropdowns:", error);
        }
    };

    /**
     * Updates the room dropdown based on the selected cinema.
     */
    const updateRoomDropdown = () => {
        const selectedCinemaId = showtimeCinemaSelect.value;
        showtimeRoomSelect.innerHTML = '<option value="">-- Chọn phòng --</option>'; // Reset

        if (!selectedCinemaId) {
            showtimeRoomSelect.disabled = true;
            return;
        }

        const roomsForCinema = allShowtimeRooms.filter(room => room.cinemaId === selectedCinemaId);
        
        if (roomsForCinema.length > 0) {
            roomsForCinema.forEach(room => {
                const option = document.createElement('option');
                option.value = room.id;
                option.textContent = room.room_name;
                showtimeRoomSelect.appendChild(option);
            });
            showtimeRoomSelect.disabled = false;
        } else {
            showtimeRoomSelect.disabled = true;
        }
    };

    const timelineInfo = document.getElementById('timeline-info');
    const conflictWarning = document.getElementById('conflict-warning');
    const saveShowtimeBtn = document.getElementById('save-showtime-btn');

    /**
     * Displays the current schedule for a room and checks for conflicts with the proposed new showtime.
     */
    const displayTimelineAndCheckConflict = async () => {
        const movieId = showtimeMovieSelect.value;
        const roomId = showtimeRoomSelect.value;
        const date = document.getElementById('showtime-date').value;
        const startTime = document.getElementById('showtime-start-time').value;

        // Clear previous state
        timelineInfo.innerHTML = '';
        conflictWarning.innerHTML = '';
        saveShowtimeBtn.disabled = true; // Disable by default

        if (!roomId || !date) { // Only need room and date to show timeline
            return;
        }

        try {
            // 1. Fetch existing showtimes for the selected room and date
            const existingShowtimes = await api.getShowtimes({
                roomId: roomId,
                startTime_like: `^${date}` // Get all showtimes that start with the selected date
            });

            const CLEANUP_TIME_MINS = 20;
            
            // 2. Display the timeline of existing showtimes
            let timelineHTML = '<strong>Lịch hiện tại của phòng:</strong><ul>';
            if (existingShowtimes.length > 0) {
                existingShowtimes.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
                existingShowtimes.forEach(st => {
                    const stStart = new Date(st.startTime);
                    const stMovie = allShowtimeMovies.find(m => m.id === st.movieId);
                    const stDuration = stMovie ? stMovie.duration_minutes : 0;
                    const stEnd = new Date(stStart.getTime() + (stDuration + CLEANUP_TIME_MINS) * 60000);
                    timelineHTML += `<li>${stStart.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} - ${stEnd.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})} (${stMovie ? stMovie.title : 'N/A'})</li>`;
                });
            } else {
                timelineHTML += '<li>Chưa có suất chiếu nào.</li>';
            }
            timelineHTML += '</ul>';
            timelineInfo.innerHTML = timelineHTML;

            // 3. Check for conflicts if all info is present
            if (!movieId || !startTime) {
                return; // Not enough info to check for conflict
            }

            const movie = allShowtimeMovies.find(m => m.id === movieId);
            if (!movie) return;

            const proposedStart = new Date(`${date}T${startTime}`);
            const proposedEnd = new Date(proposedStart.getTime() + (movie.duration_minutes + CLEANUP_TIME_MINS) * 60000);

            let conflictFound = false;
            for (const st of existingShowtimes) {
                const stStart = new Date(st.startTime);
                const stMovie = allShowtimeMovies.find(m => m.id === st.movieId);
                const stDuration = stMovie ? stMovie.duration_minutes : 0;
                const stEnd = new Date(stStart.getTime() + (stDuration + CLEANUP_TIME_MINS) * 60000);

                if (proposedStart < stEnd && proposedEnd > stStart) {
                    conflictFound = true;
                    conflictWarning.innerHTML = `Xung đột với suất chiếu: <strong>${stMovie.title}</strong> lúc ${stStart.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'})}`;
                    break;
                }
            }

            // 4. Enable or disable the save button
            if (!conflictFound) {
                saveShowtimeBtn.disabled = false;
            } else {
                saveShowtimeBtn.disabled = true;
            }

        } catch (error) {
            console.error("Error checking timeline:", error);
            conflictWarning.innerHTML = "Không thể tải và kiểm tra lịch chiếu.";
        }
    };

    /**
     * Handles the form submission for adding a showtime.
     */
    const handleShowtimeFormSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData(showtimeForm);
        const showtimeData = {
            movieId: formData.get('movieId'),
            cinemaId: formData.get('cinemaId'),
            roomId: formData.get('roomId'),
            startTime: `${formData.get('date')}T${formData.get('startTime')}`,
            price: parseInt(formData.get('price')),
        };

        try {
            await api.addShowtime(showtimeData);
            hideShowtimeForm();
            await renderShowtimes(); // Refresh the table
            alert('Thêm suất chiếu thành công!');
        } catch (error) {
            console.error("Failed to save showtime:", error);
            alert('Lưu suất chiếu không thành công.');
        }
    };

    // --- INITIALIZATION & EVENT LISTENERS --- //

    if (addMovieBtn) {
        addMovieBtn.addEventListener('click', () => showForm());
    }
    if (cancelBtn) {
        cancelBtn.addEventListener('click', hideForm);
    }
    if (movieForm) {
        movieForm.addEventListener('submit', handleFormSubmit);
    }
    moviesTableBody.addEventListener('click', handleTableClick);

    // Event listeners for Showtime Management
    if (addShowtimeBtn) {
        addShowtimeBtn.addEventListener('click', showShowtimeForm);
    }
    if (cancelShowtimeBtn) {
        cancelShowtimeBtn.addEventListener('click', hideShowtimeForm);
    }
    if (showtimeForm) {
        showtimeForm.addEventListener('submit', handleShowtimeFormSubmit);
    }
    if (showtimeCinemaSelect) {
        showtimeCinemaSelect.addEventListener('change', updateRoomDropdown);
    }
    if (showtimesTableBody) {
        showtimesTableBody.addEventListener('click', handleShowtimesTableClick);
    }
    // Add listeners to all relevant fields to trigger conflict check
    [showtimeMovieSelect, showtimeRoomSelect, document.getElementById('showtime-date'), document.getElementById('showtime-start-time')].forEach(el => {
        if(el) el.addEventListener('change', displayTimelineAndCheckConflict);
    });
    const updateDashboardStats = async () => {
        try {
            const [movies, users, bookings] = await Promise.all([
                api.getMovies(),
                api.getUsers(),
                api.getBookings()
            ]);

            // 1. Total Movies
            const totalMovies = movies.length;
            document.getElementById('total-movies-stat').textContent = totalMovies;

            // 2. Total Users (excluding admins)
            const totalUsers = users.filter(u => u.role === 'user').length;
            const userStatCard = document.querySelector('#dashboard-section .stat-card:nth-child(3) .card-info span');
            if(userStatCard) userStatCard.textContent = totalUsers;

            // 3. Daily Bookings & Revenue
            const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD
            const todaysBookings = bookings.filter(b => b.bookingTime.startsWith(today) && b.status === 'confirmed');
            
            const dailyBookingsCount = todaysBookings.length;
            const dailyRevenue = todaysBookings.reduce((total, booking) => total + booking.totalPrice, 0);

            const bookingsStatCard = document.querySelector('#dashboard-section .stat-card:nth-child(1) .card-info span');
            if(bookingsStatCard) bookingsStatCard.textContent = dailyBookingsCount;

            const revenueStatCard = document.querySelector('#dashboard-section .stat-card:nth-child(2) .card-info span');
            if(revenueStatCard) revenueStatCard.textContent = `${dailyRevenue.toLocaleString('vi-VN')} ₫`;

        } catch (error) {
            console.error("Failed to update dashboard stats:", error);
        }
    };

    const initialize = async () => {
        // Initial data loading and rendering
        await populateGenres();
        await renderMovies();
        await populateShowtimeDropdowns();
        await renderShowtimes();
        await updateDashboardStats();
    };

    initialize();
});
