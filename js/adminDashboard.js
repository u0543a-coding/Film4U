// adminDashboard.js
const apiUrl = "http://localhost:3000";

// ====== Kiểm tra đăng nhập ======
function checkAdminLogin() {
    const isLoggedIn = localStorage.getItem('adminLogged');
    const adminName = localStorage.getItem('adminName');
    
    if (!isLoggedIn || !adminName) {
        window.location.href = 'admin-login.html';
        return false;
    }
    
    document.getElementById('admin-name').textContent = adminName;
    return true;
}

// ====== Admin Name & Logout ======
const adminNameSpan = document.getElementById('admin-name');
adminNameSpan.textContent = localStorage.getItem('adminName') || 'Admin';

// ====== Đăng xuất ======
function logout() {
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminLogged');
    localStorage.removeItem('adminEmail');
    localStorage.removeItem('adminId');
    window.location.href = 'admin-login.html';
}

document.getElementById('logout-btn-dropdown').addEventListener('click', (e) => {
    e.preventDefault();
    logout();
});

// Thêm sự kiện click ngoài để đóng dropdown
document.addEventListener('click', (e) => {
    const userDropdown = document.getElementById('user-dropdown');
    if (!userDropdown.contains(e.target)) {
        document.getElementById('user-menu').style.display = 'none';
    }
});

// Sự kiện mở dropdown
document.getElementById('user-dropdown').addEventListener('click', (e) => {
    e.stopPropagation();
    const userMenu = document.getElementById('user-menu');
    userMenu.style.display = userMenu.style.display === 'block' ? 'none' : 'block';
});

// ====== Sidebar Navigation ======
const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('.content-section');

navItems.forEach(item => {
    item.addEventListener('click', () => {
        navItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        const section = item.dataset.section;
        sections.forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${section}-section`).classList.add('active');
    });
});

// ====== Dashboard ======
async function loadDashboard() {
    try {
        const [usersRes, cinemasRes, moviesRes, promosRes, bookingsRes] = await Promise.all([
            fetch(`${apiUrl}/users`),
            fetch(`${apiUrl}/cinemas`),
            fetch(`${apiUrl}/movies`),
            fetch(`${apiUrl}/promotions`),
            fetch(`${apiUrl}/bookings`)
        ]);

        const users = await usersRes.json();
        const cinemas = await cinemasRes.json();
        const movies = await moviesRes.json();
        const promotions = await promosRes.json();
        const bookings = await bookingsRes.json();

        document.getElementById('total-users').textContent = users.length;
        document.getElementById('total-cinemas').textContent = cinemas.length;
        document.getElementById('total-movies').textContent = movies.length;
        document.getElementById('total-promotions').textContent = promotions.length;

        const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
        document.getElementById('total-revenue').textContent = totalRevenue.toLocaleString('vi-VN') + ' ₫';
    } catch (err) {
        console.error("Error loading dashboard:", err);
    }
}

// ====== Users Management ======
const usersTableBody = document.querySelector('#users-table tbody');
const userFormContainer = document.getElementById('user-form-container');
const userForm = document.getElementById('user-form');
const addUserBtn = document.getElementById('add-user-btn');
const cancelUserBtn = document.getElementById('cancel-user-btn');
let editingUserId = null;

async function loadUsers() {
    try {
        const res = await fetch(`${apiUrl}/users`);
        const users = await res.json();
        usersTableBody.innerHTML = '';
        users.forEach(user => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${user.id}</td>
                <td>${user.fullName}</td>
                <td>${user.email}</td>
                <td>${user.phoneNumber || 'N/A'}</td>
                <td>${user.role}</td>
                <td>
                <button class="edit-btn" data-id="${user.id}"><i class="fas fa-edit"></i>Sửa</button>
                <button class="delete-btn" data-id="${user.id}"><i class="fas fa-trash"></i>Block</button>
                </td>
            `;
            usersTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editUser(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteUser(btn.dataset.id));
        });
    } catch (err) {
        console.error("Error loading users:", err);
    }
}

addUserBtn.addEventListener('click', () => {
    editingUserId = null;
    userFormContainer.style.display = 'block';
    userForm.reset();
    document.getElementById('user-form-title').textContent = 'Thêm Người dùng';
});

cancelUserBtn.addEventListener('click', () => {
    userFormContainer.style.display = 'none';
});

userForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const userData = {
        fullName: document.getElementById('user-fullName').value,
        email: document.getElementById('user-email').value,
        password: document.getElementById('user-password').value,
        phoneNumber: document.getElementById('user-phoneNumber').value,
        role: document.getElementById('user-role').value,
        createdAt: new Date().toISOString()
    };
    try {
        if (editingUserId) {
            await fetch(`${apiUrl}/users/${editingUserId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        } else {
            await fetch(`${apiUrl}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
        }
        userFormContainer.style.display = 'none';
        loadUsers();
        loadDashboard();
    } catch (err) {
        console.error("Error saving user:", err);
    }
});

async function editUser(id) {
    const res = await fetch(`${apiUrl}/users/${id}`);
    const user = await res.json();
    editingUserId = id;
    document.getElementById('user-form-title').textContent = 'Chỉnh sửa Người dùng';
    document.getElementById('user-fullName').value = user.fullName;
    document.getElementById('user-email').value = user.email;
    document.getElementById('user-password').value = user.password;
    document.getElementById('user-phoneNumber').value = user.phoneNumber || '';
    document.getElementById('user-role').value = user.role;
    userFormContainer.style.display = 'block';
}

async function deleteUser(id) {
    if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
    await fetch(`${apiUrl}/users/${id}`, { method: 'DELETE' });
    loadUsers();
    loadDashboard();
}

// ====== Cinema Management ======
const cinemasTableBody = document.querySelector('#cinemas-table tbody');
const cinemaFormContainer = document.getElementById('cinema-form-container');
const cinemaForm = document.getElementById('cinema-form');
const addCinemaBtn = document.getElementById('add-cinema-btn');
const cancelCinemaBtn = document.getElementById('cancel-cinema-btn');
let editingCinemaId = null;

async function loadCinemas() {
    try {
        const res = await fetch(`${apiUrl}/cinemas`);
        const cinemas = await res.json();
        cinemasTableBody.innerHTML = '';
        cinemas.forEach(cinema => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${cinema.id}</td>
                <td>${cinema.name}</td>
                <td>${cinema.address}</td>
                <td>${cinema.city}</td>
                <td>
                <button class="view-cinema-btn" data-id="${cinema.id}"><i class="fas fa-eye"></i>Xem</button>
                <button class="edit-cinema-btn" data-id="${cinema.id}"><i class="fas fa-edit"></i>Sửa</button>
                <button class="delete-cinema-btn" data-id="${cinema.id}"><i class="fas fa-trash"></i>Xóa</button>
                </td>
            `;
            cinemasTableBody.appendChild(tr);
        });

        document.querySelectorAll('.view-cinema-btn').forEach(btn => {
            btn.addEventListener('click', () => viewCinemaRooms(btn.dataset.id));
        });
        document.querySelectorAll('.edit-cinema-btn').forEach(btn => {
            btn.addEventListener('click', () => editCinema(btn.dataset.id));
        });
        document.querySelectorAll('.delete-cinema-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteCinema(btn.dataset.id));
        });
    } catch (err) {
        console.error("Error loading cinemas:", err);
    }
}

addCinemaBtn.addEventListener('click', () => {
    editingCinemaId = null;
    cinemaFormContainer.style.display = 'block';
    cinemaForm.reset();
    document.getElementById('cinema-form-title').textContent = 'Thêm Rạp';
});

cancelCinemaBtn.addEventListener('click', () => {
    cinemaFormContainer.style.display = 'none';
});

cinemaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const cinemaData = {
        name: document.getElementById('cinema-name').value,
        address: document.getElementById('cinema-address').value,
        city: document.getElementById('cinema-city').value
    };
    try {
        if (editingCinemaId) {
            await fetch(`${apiUrl}/cinemas/${editingCinemaId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cinemaData)
            });
        } else {
            await fetch(`${apiUrl}/cinemas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(cinemaData)
            });
        }
        cinemaFormContainer.style.display = 'none';
        loadCinemas();
        loadDashboard();
    } catch (err) {
        console.error("Error saving cinema:", err);
    }
});

async function editCinema(id) {
    const res = await fetch(`${apiUrl}/cinemas/${id}`);
    const cinema = await res.json();
    editingCinemaId = id;
    document.getElementById('cinema-form-title').textContent = 'Chỉnh sửa Rạp';
    document.getElementById('cinema-name').value = cinema.name;
    document.getElementById('cinema-address').value = cinema.address;
    document.getElementById('cinema-city').value = cinema.city;
    cinemaFormContainer.style.display = 'block';
}

async function deleteCinema(id) {
    if (!confirm("Bạn có chắc muốn xóa rạp này?")) return;
    await fetch(`${apiUrl}/cinemas/${id}`, { method: 'DELETE' });
    loadCinemas();
    loadDashboard();
}

// ====== Rooms Management ======
const roomsModal = document.getElementById('rooms-modal');
const roomsTableBody = document.querySelector('#rooms-table tbody');
const roomFormContainer = document.getElementById('room-form-container');
const roomForm = document.getElementById('room-form');
const addRoomBtn = document.getElementById('add-room-btn');
const cancelRoomBtn = document.getElementById('cancel-room-btn');
let currentCinemaId = null;
let editingRoomId = null;

// Mở modal quản lý phòng
async function viewCinemaRooms(cinemaId) {
    currentCinemaId = cinemaId;
    
    // Lấy thông tin rạp để hiển thị tên
    const cinemaRes = await fetch(`${apiUrl}/cinemas/${cinemaId}`);
    const cinema = await cinemaRes.json();
    document.getElementById('cinema-name-title').textContent = cinema.name;
    
    // Hiển thị modal
    roomsModal.style.display = 'block';
    
    // Tải danh sách phòng
    loadRooms();
}

// Đóng modal
document.querySelector('#rooms-modal .close').addEventListener('click', () => {
    roomsModal.style.display = 'none';
});

// Tải danh sách phòng
async function loadRooms() {
    try {
        const res = await fetch(`${apiUrl}/cinema_rooms`);
        const rooms = await res.json();
        // Lọc phòng theo cinemaId
        const filteredRooms = rooms.filter(room => room.cinemaId == currentCinemaId);
        
        roomsTableBody.innerHTML = '';
        filteredRooms.forEach(room => {
            const gridDimensions = room.gridDimensions || { totalRows: 0, totalCols: 0 };
            
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${room.id}</td>
                <td>${room.room_name}</td>
                <td>${gridDimensions.totalRows}</td>
                <td>${gridDimensions.totalCols}</td>
                <td>
                <button class="view-room-btn" data-id="${room.id}"><i class="fas fa-eye"></i>Xem</button>
                <button class="edit-room-btn" data-id="${room.id}"><i class="fas fa-edit"></i>Sửa</button>
                <button class="delete-room-btn" data-id="${room.id}"><i class="fas fa-trash"></i>Xóa</button>
                </td>
            `;
            roomsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.view-room-btn').forEach(btn => {
            btn.addEventListener('click', () => viewRoomDetails(btn.dataset.id));
        });
        document.querySelectorAll('.edit-room-btn').forEach(btn => {
            btn.addEventListener('click', () => editRoom(btn.dataset.id));
        });
        document.querySelectorAll('.delete-room-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteRoom(btn.dataset.id));
        });
    } catch (err) {
        console.error("Error loading rooms:", err);
    }
}

// Thêm phòng
addRoomBtn.addEventListener('click', () => {
    editingRoomId = null;
    roomFormContainer.style.display = 'block';
    roomForm.reset();
    document.getElementById('room-form-title').textContent = 'Thêm Phòng';
});

cancelRoomBtn.addEventListener('click', () => {
    roomFormContainer.style.display = 'none';
});

roomForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const roomData = {
        room_name: document.getElementById('room-name').value,
        cinemaId: currentCinemaId,
        gridDimensions: {
            totalRows: parseInt(document.getElementById('room-rows').value),
            totalCols: parseInt(document.getElementById('room-cols').value)
        }
    };
    
    try {
        if (editingRoomId) {
            await fetch(`${apiUrl}/cinema_rooms/${editingRoomId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
        } else {
            await fetch(`${apiUrl}/cinema_rooms`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(roomData)
            });
        }
        roomFormContainer.style.display = 'none';
        loadRooms();
    } catch (err) {
        console.error("Error saving room:", err);
    }
});

// Sửa phòng
async function editRoom(id) {
    const res = await fetch(`${apiUrl}/cinema_rooms/${id}`);
    const room = await res.json();
    editingRoomId = id;
    document.getElementById('room-form-title').textContent = 'Chỉnh sửa Phòng';
    document.getElementById('room-name').value = room.room_name;
    document.getElementById('room-rows').value = room.gridDimensions?.totalRows || 0;
    document.getElementById('room-cols').value = room.gridDimensions?.totalCols || 0;
    roomFormContainer.style.display = 'block';
}

// Xóa phòng
async function deleteRoom(id) {
    if (!confirm("Bạn có chắc muốn xóa phòng này?")) return;
    await fetch(`${apiUrl}/cinema_rooms/${id}`, { method: 'DELETE' });
    loadRooms();
}

// ====== Room Details Management (Seats & Screenings) ======
const roomDetailModal = document.getElementById('room-detail-modal');
let currentRoomId = null;

// Mở modal chi tiết phòng
async function viewRoomDetails(roomId) {
    currentRoomId = roomId;
    
    // Lấy thông tin phòng để hiển thị tên
    const roomRes = await fetch(`${apiUrl}/cinema_rooms/${roomId}`);
    const room = await roomRes.json();
    document.getElementById('room-name-title').textContent = room.room_name;
    
    // Hiển thị modal
    roomDetailModal.style.display = 'block';
    
    // Tải ghế và suất chiếu
    loadSeats();
    loadScreenings();
}

// Đóng modal
document.querySelector('#room-detail-modal .close').addEventListener('click', () => {
    roomDetailModal.style.display = 'none';
});

// Tab switching
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`${tab}-tab`).classList.add('active');
    });
});

// ====== Seats Management ======
const seatsGrid = document.getElementById('seats-grid');

async function loadSeats() {
    try {
        const res = await fetch(`${apiUrl}/seatTemplates`);
        const seats = await res.json();
        
        // Lọc ghế theo roomId
        const filteredSeats = seats.filter(seat => seat.roomId == currentRoomId);
        
        // Lấy thông tin phòng để biết kích thước grid
        const roomRes = await fetch(`${apiUrl}/cinema_rooms/${currentRoomId}`);
        const room = await roomRes.json();
        const gridDimensions = room.gridDimensions || { totalRows: 0, totalCols: 0 };
        
        // Tạo grid ghế
        renderSeatsGrid(filteredSeats, gridDimensions);
    } catch (err) {
        console.error("Error loading seats:", err);
    }
}

function renderSeatsGrid(seats, gridDimensions) {
    seatsGrid.innerHTML = '';
    
    // Tạo mảng 2D cho grid
    const grid = Array.from({ length: gridDimensions.totalRows }, () => 
        Array.from({ length: gridDimensions.totalCols }, () => null)
    );
    
    // Đặt ghế vào grid
    seats.forEach(seat => {
        if (seat.gridRow <= gridDimensions.totalRows && seat.gridCol <= gridDimensions.totalCols) {
            grid[seat.gridRow - 1][seat.gridCol - 1] = seat;
        }
    });
    
    // Render grid
    for (let row = 0; row < gridDimensions.totalRows; row++) {
        const rowDiv = document.createElement('div');
        rowDiv.className = 'seat-row';
        
        for (let col = 0; col < gridDimensions.totalCols; col++) {
            const seat = grid[row][col];
            const seatDiv = document.createElement('div');
            seatDiv.className = `seat ${seat ? seat.seatType.toLowerCase() : 'empty'}`;
            
            if (seat) {
                seatDiv.textContent = seat.seatLabel;
                seatDiv.title = `${seat.seatLabel} - ${seat.seatType}`;
                seatDiv.addEventListener('click', () => editSeat(seat.id));
            } else {
                seatDiv.className += ' empty';
                seatDiv.addEventListener('click', () => addSeat(row + 1, col + 1));
            }
            
            rowDiv.appendChild(seatDiv);
        }
        seatsGrid.appendChild(rowDiv);
    }
}

function addSeat(row, col) {
    const seatLabel = prompt("Nhập tên ghế (ví dụ: A1):");
    if (!seatLabel) return;
    
    const seatType = prompt("Chọn loại ghế (Standard/Premium/VIP/Couple):", "Standard");
    if (!seatType) return;
    
    const seatData = {
        roomId: currentRoomId,
        seatLabel: seatLabel,
        seatType: seatType,
        gridRow: row,
        gridCol: col
    };
    
    fetch(`${apiUrl}/seatTemplates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(seatData)
    }).then(() => loadSeats());
}

function editSeat(seatId) {
    const newType = prompt("Chọn loại ghế mới (Standard/Premium/VIP/Couple):", "Standard");
    if (!newType) return;
    
    fetch(`${apiUrl}/seatTemplates/${seatId}`)
        .then(res => res.json())
        .then(seat => {
            seat.seatType = newType;
            return fetch(`${apiUrl}/seatTemplates/${seatId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(seat)
            });
        })
        .then(() => loadSeats());
}

// ====== Screenings Management ======
const screeningsTableBody = document.querySelector('#screenings-table tbody');
const screeningFormContainer = document.getElementById('screening-form-container');
const screeningForm = document.getElementById('screening-form');
const addScreeningBtn = document.getElementById('add-screening-btn');
const cancelScreeningBtn = document.getElementById('cancel-screening-btn');
const screeningMovieSelect = document.getElementById('screening-movie');
let editingScreeningId = null;

// Tải danh sách phim cho dropdown
async function loadMoviesForScreenings() {
    try {
        const res = await fetch(`${apiUrl}/movies`);
        const movies = await res.json();
        
        screeningMovieSelect.innerHTML = '<option value="">Chọn phim</option>';
        movies.forEach(movie => {
            const option = document.createElement('option');
            option.value = movie.id;
            option.textContent = movie.title;
            screeningMovieSelect.appendChild(option);
        });
    } catch (err) {
        console.error("Error loading movies for screenings:", err);
    }
}

// Tải danh sách suất chiếu
async function loadScreenings() {
    try {
        const res = await fetch(`${apiUrl}/showtimes`);
        const screenings = await res.json();
        
        // Lọc suất chiếu theo roomId
        const filteredScreenings = screenings.filter(screening => screening.roomId == currentRoomId);
        
        screeningsTableBody.innerHTML = '';
        filteredScreenings.forEach(screening => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${screening.id}</td>
                <td>${screening.movieId}</td>
                <td>${new Date(screening.startTime).toLocaleString('vi-VN')}</td>
                <td>${screening.price.toLocaleString('vi-VN')} ₫</td>
                <td>
                <button class="edit-screening-btn" data-id="${screening.id}"><i class="fas fa-edit"></i>Sửa</button>
                <button class="delete-screening-btn" data-id="${screening.id}"><i class="fas fa-trash"></i>Xóa</button>
                </td>
            `;
            screeningsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-screening-btn').forEach(btn => {
            btn.addEventListener('click', () => editScreening(btn.dataset.id));
        });
        document.querySelectorAll('.delete-screening-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteScreening(btn.dataset.id));
        });
    } catch (err) {
        console.error("Error loading screenings:", err);
    }
}

// Thêm suất chiếu
addScreeningBtn.addEventListener('click', () => {
    editingScreeningId = null;
    screeningFormContainer.style.display = 'block';
    screeningForm.reset();
    document.getElementById('screening-form-title').textContent = 'Thêm Suất chiếu';
    loadMoviesForScreenings();
});

cancelScreeningBtn.addEventListener('click', () => {
    screeningFormContainer.style.display = 'none';
});

screeningForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const screeningData = {
        movieId: document.getElementById('screening-movie').value,
        cinemaId: currentCinemaId,
        roomId: currentRoomId,
        startTime: document.getElementById('screening-time').value,
        price: parseInt(document.getElementById('screening-price').value)
    };
    
    try {
        if (editingScreeningId) {
            await fetch(`${apiUrl}/showtimes/${editingScreeningId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(screeningData)
            });
        } else {
            await fetch(`${apiUrl}/showtimes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(screeningData)
            });
        }
        screeningFormContainer.style.display = 'none';
        loadScreenings();
    } catch (err) {
        console.error("Error saving screening:", err);
    }
});

// Sửa suất chiếu
async function editScreening(id) {
    const res = await fetch(`${apiUrl}/showtimes/${id}`);
    const screening = await res.json();
    editingScreeningId = id;
    document.getElementById('screening-form-title').textContent = 'Chỉnh sửa Suất chiếu';
    
    // Tải danh sách phim trước
    await loadMoviesForScreenings();
    
    document.getElementById('screening-movie').value = screening.movieId;
    document.getElementById('screening-time').value = screening.startTime.slice(0, 16);
    document.getElementById('screening-price').value = screening.price;
    screeningFormContainer.style.display = 'block';
}

// Xóa suất chiếu
async function deleteScreening(id) {
    if (!confirm("Bạn có chắc muốn xóa suất chiếu này?")) return;
    await fetch(`${apiUrl}/showtimes/${id}`, { method: 'DELETE' });
    loadScreenings();
}

// ====== Movies Management ======
const moviesTableBody = document.querySelector('#movies-table tbody');
const movieFormContainer = document.getElementById('movie-form-container');
const movieForm = document.getElementById('movie-form');
const addMovieBtn = document.getElementById('add-movie-btn');
const cancelMovieBtn = document.getElementById('cancel-movie-btn');
let editingMovieId = null;

async function loadMovies() {
    try {
        const res = await fetch(`${apiUrl}/movies`);
        const movies = await res.json();
        moviesTableBody.innerHTML = '';
        movies.forEach(movie => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${movie.id}</td>
                <td>${movie.title}</td>
                <td>${movie.director}</td>
                <td>${movie.duration_minutes} phút</td>
                <td>${new Date(movie.release_date).toLocaleDateString('vi-VN')}</td>
                <td>${movie.status === 'now_showing' ? 'Đang chiếu' : 'Sắp chiếu'}</td>
                <td>
                <button class="edit-movie-btn" data-id="${movie.id}"><i class="fas fa-edit"></i>Sửa</button>
                <button class="delete-movie-btn" data-id="${movie.id}"><i class="fas fa-trash"></i>Xóa</button>
                </td>
            `;
            moviesTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-movie-btn').forEach(btn => {
            btn.addEventListener('click', () => editMovie(btn.dataset.id));
        });
        document.querySelectorAll('.delete-movie-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteMovie(btn.dataset.id));
        });
    } catch (err) {
        console.error("Error loading movies:", err);
    }
}

addMovieBtn.addEventListener('click', () => {
    editingMovieId = null;
    movieFormContainer.style.display = 'block';
    movieForm.reset();
    document.getElementById('movie-form-title').textContent = 'Thêm Phim';
});

cancelMovieBtn.addEventListener('click', () => {
    movieFormContainer.style.display = 'none';
});

movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const movieData = {
        title: document.getElementById('movie-title').value,
        director: document.getElementById('movie-director').value,
        actors: document.getElementById('movie-actors').value,
        duration_minutes: parseInt(document.getElementById('movie-duration').value),
        release_date: document.getElementById('movie-release-date').value,
        status: document.getElementById('movie-status').value,
        poster_url: document.getElementById('movie-poster-url').value,
        description: document.getElementById('movie-description').value,
        genreIds: [5] // Mặc định thể loại Chính kịch
    };
    
    try {
        if (editingMovieId) {
            await fetch(`${apiUrl}/movies/${editingMovieId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });
        } else {
            await fetch(`${apiUrl}/movies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(movieData)
            });
        }
        movieFormContainer.style.display = 'none';
        loadMovies();
        loadDashboard();
    } catch (err) {
        console.error("Error saving movie:", err);
    }
});

async function editMovie(id) {
    const res = await fetch(`${apiUrl}/movies/${id}`);
    const movie = await res.json();
    editingMovieId = id;
    document.getElementById('movie-form-title').textContent = 'Chỉnh sửa Phim';
    document.getElementById('movie-title').value = movie.title;
    document.getElementById('movie-director').value = movie.director;
    document.getElementById('movie-actors').value = movie.actors;
    document.getElementById('movie-duration').value = movie.duration_minutes;
    document.getElementById('movie-release-date').value = movie.release_date;
    document.getElementById('movie-status').value = movie.status;
    document.getElementById('movie-poster-url').value = movie.poster_url;
    document.getElementById('movie-description').value = movie.description;
    movieFormContainer.style.display = 'block';
}

async function deleteMovie(id) {
    if (!confirm("Bạn có chắc muốn xóa phim này?")) return;
    await fetch(`${apiUrl}/movies/${id}`, { method: 'DELETE' });
    loadMovies();
    loadDashboard();
}

// ====== Promotions Management ======
const promotionsTableBody = document.querySelector('#promotions-table tbody');
const promoFormContainer = document.getElementById('promo-form-container');
const promoForm = document.getElementById('promo-form');
const addPromoBtn = document.getElementById('add-promo-btn');
const cancelPromoBtn = document.getElementById('cancel-promo-btn');
let editingPromoId = null;

async function loadPromotions() {
    try {
        const res = await fetch(`${apiUrl}/promotions`);
        const promotions = await res.json();
        promotionsTableBody.innerHTML = '';
        promotions.forEach(promo => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${promo.id}</td>
                <td>${promo.code}</td>
                <td>${promo.title}</td>
                <td>${promo.discountType === 'percentage' ? 'Phần trăm' : 'Cố định'}</td>
                <td>${promo.discountType === 'percentage' ? promo.discountValue + '%' : promo.discountValue.toLocaleString('vi-VN') + ' ₫'}</td>
                <td>${new Date(promo.expiryDate).toLocaleDateString('vi-VN')}</td>
                <td>
                <button class="edit-promo-btn" data-id="${promo.id}"><i class="fas fa-edit"></i>Sửa</button>
                <button class="delete-promo-btn" data-id="${promo.id}"><i class="fas fa-trash"></i>Xóa</button>
                </td>
            `;
            promotionsTableBody.appendChild(tr);
        });

        document.querySelectorAll('.edit-promo-btn').forEach(btn => {
            btn.addEventListener('click', () => editPromotion(btn.dataset.id));
        });
        document.querySelectorAll('.delete-promo-btn').forEach(btn => {
            btn.addEventListener('click', () => deletePromotion(btn.dataset.id));
        });
    } catch (err) {
        console.error("Error loading promotions:", err);
    }
}

addPromoBtn.addEventListener('click', () => {
    editingPromoId = null;
    promoFormContainer.style.display = 'block';
    promoForm.reset();
    document.getElementById('promo-form-title').textContent = 'Thêm Khuyến mãi';
});

cancelPromoBtn.addEventListener('click', () => {
    promoFormContainer.style.display = 'none';
});

promoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const promoData = {
        code: document.getElementById('promo-code').value,
        title: document.getElementById('promo-title').value,
        description: document.getElementById('promo-description').value,
        discountType: document.getElementById('promo-discountType').value,
        discountValue: parseInt(document.getElementById('promo-discountValue').value),
        expiryDate: document.getElementById('promo-expiryDate').value,
        usedBy: []
    };
    
    try {
        if (editingPromoId) {
            await fetch(`${apiUrl}/promotions/${editingPromoId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promoData)
            });
        } else {
            await fetch(`${apiUrl}/promotions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(promoData)
            });
        }
        promoFormContainer.style.display = 'none';
        loadPromotions();
        loadDashboard();
    } catch (err) {
        console.error("Error saving promotion:", err);
    }
});

async function editPromotion(id) {
    const res = await fetch(`${apiUrl}/promotions/${id}`);
    const promo = await res.json();
    editingPromoId = id;
    document.getElementById('promo-form-title').textContent = 'Chỉnh sửa Khuyến mãi';
    document.getElementById('promo-code').value = promo.code;
    document.getElementById('promo-title').value = promo.title;
    document.getElementById('promo-description').value = promo.description;
    document.getElementById('promo-discountType').value = promo.discountType;
    document.getElementById('promo-discountValue').value = promo.discountValue;
    document.getElementById('promo-expiryDate').value = promo.expiryDate.slice(0, 16);
    promoFormContainer.style.display = 'block';
}

async function deletePromotion(id) {
    if (!confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;
    await fetch(`${apiUrl}/promotions/${id}`, { method: 'DELETE' });
    loadPromotions();
    loadDashboard();
}

// ====== Khởi tạo ======
document.addEventListener('DOMContentLoaded', function() {
    if (!checkAdminLogin()) return;
    
    // Tải tất cả dữ liệu ban đầu
    loadDashboard();
    loadUsers();
    loadCinemas();
    loadMovies();
    loadPromotions();
    
    // Đóng modal khi click bên ngoài
    window.addEventListener('click', (e) => {
        if (e.target === roomsModal) {
            roomsModal.style.display = 'none';
        }
        if (e.target === roomDetailModal) {
            roomDetailModal.style.display = 'none';
        }
    });
});