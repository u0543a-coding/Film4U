// adminDashboard.js
const apiUrl = "http://localhost:3000";

// ====== Admin Name & Logout ======
const adminNameSpan = document.getElementById('admin-name');
adminNameSpan.textContent = localStorage.getItem('adminName') || 'Admin';

document.getElementById('logout-btn-dropdown').addEventListener('click', () => {
  localStorage.removeItem('adminName');
  localStorage.removeItem('adminLogged');
  window.location.href = 'admin-login.html';
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
    role: document.getElementById('user-role').value
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
  document.getElementById('user-role').value = user.role;
  userFormContainer.style.display = 'block';
}

async function deleteUser(id) {
  if (!confirm("Bạn có chắc muốn xóa người dùng này?")) return;
  await fetch(`${apiUrl}/users/${id}`, { method: 'DELETE' });
  loadUsers();
  loadDashboard();
}

// ====== QUẢN LÝ RẠP ======
const cinemasSection = document.getElementById("cinemas-section");
const cinemaDetailContainer = document.getElementById("cinema-detail-container");

// Elements
const cinemasTableBody = document.querySelector("#cinemas-table tbody");
const addCinemaBtn = document.getElementById("add-cinema-btn");
const cinemaFormContainer = document.getElementById("cinema-form-container");
const cinemaForm = document.getElementById("cinema-form");
const cancelCinemaBtn = document.getElementById("cancel-cinema-btn");

// Detail elements
const cinemaNameDetail = document.getElementById("cinema-name-detail");
const cinemaAddressDetail = document.getElementById("cinema-address-detail");
const btnCloseDetail = document.getElementById("btn-close-cinema-detail");
const btnEditCinema = document.getElementById("btn-edit-cinema");
const btnDeleteCinema = document.getElementById("btn-delete-cinema");
const editForm = document.getElementById("cinema-edit-form");
const editCancel = document.getElementById("cinema-edit-cancel");

// Tabs
const btnRoomsSeats = document.getElementById("btn-rooms-seats");
const btnShowtimes = document.getElementById("btn-showtimes");
const tabRooms = document.getElementById("tab-rooms-seats");
const tabShowtimes = document.getElementById("tab-showtimes");

let cinemas = [];
let cinemaRooms = [];
let showtimes = [];
let currentCinema = null;

// ====== Fetch Data ======
async function loadCinemas() {
  const [cinemaRes, roomRes, showtimeRes] = await Promise.all([
    fetch(`${apiUrl}/cinemas`),
    fetch(`${apiUrl}/cinema_rooms`),
    fetch(`${apiUrl}/showtimes`),
  ]);
  cinemas = await cinemaRes.json();
  cinemaRooms = await roomRes.json();
  showtimes = await showtimeRes.json();
  renderCinemasTable();
}

// ====== Render Table ======
function renderCinemasTable() {
  cinemasTableBody.innerHTML = "";
  cinemas.forEach((c) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${c.id}</td>
      <td>${c.name}</td>
      <td>${c.address}</td>
      <td>${c.city}</td>
      <td>${c.revenue || 0}</td>
      <td>
        <button class="btn small" onclick="viewCinemaDetail(${c.id})">Xem</button>
      </td>
    `;
    cinemasTableBody.appendChild(tr);
  });
}

// ====== View Detail ======
window.viewCinemaDetail = function (id) {
  currentCinema = cinemas.find((c) => c.id === id);
  if (!currentCinema) return;

  // Hiển thị thông tin
  cinemaNameDetail.textContent = currentCinema.name;
  cinemaAddressDetail.textContent = `${currentCinema.address}, ${currentCinema.city}`;

  // Chuyển view
  cinemasSection.style.display = "none";
  cinemaDetailContainer.style.display = "block";

  renderCinemaRooms();
  renderCinemaShowtimes();
};

// ====== Quay lại danh sách ======
btnCloseDetail.addEventListener("click", () => {
  cinemaDetailContainer.style.display = "none";
  cinemasSection.style.display = "block";
});

// ====== Tabs ======
btnRoomsSeats.addEventListener("click", () => {
  btnRoomsSeats.classList.add("active");
  btnShowtimes.classList.remove("active");
  tabRooms.style.display = "block";
  tabShowtimes.style.display = "none";
});

btnShowtimes.addEventListener("click", () => {
  btnShowtimes.classList.add("active");
  btnRoomsSeats.classList.remove("active");
  tabShowtimes.style.display = "block";
  tabRooms.style.display = "none";
});

// ====== Render Phòng ======
function renderCinemaRooms() {
  const container = document.getElementById("rooms-seats-content");
  container.innerHTML = "";

  const rooms = cinemaRooms.filter((r) => r.cinemaId === currentCinema.id);
  if (rooms.length === 0) {
    container.innerHTML = "<p>Chưa có phòng chiếu nào.</p>";
    return;
  }

  rooms.forEach((room) => {
    const div = document.createElement("div");
    div.className = "room-card";
    div.innerHTML = `
      <h4>${room.room_name}</h4>
      <p>${room.rows} hàng × ${room.seatsPerRow} ghế</p>
    `;
    container.appendChild(div);
  });
}

// ====== Render Suất chiếu ======
function renderCinemaShowtimes() {
  const container = document.getElementById("showtimes-content");
  container.innerHTML = "";

  const cinemaShowtimes = showtimes.filter((s) => {
    const room = cinemaRooms.find((r) => r.id === s.roomId);
    return room && room.cinemaId === currentCinema.id;
  });

  if (cinemaShowtimes.length === 0) {
    container.innerHTML = "<p>Chưa có suất chiếu nào.</p>";
    return;
  }

  cinemaShowtimes.forEach((st) => {
    const movieName = st.movieTitle || `Phim #${st.movieId}`;
    const time = new Date(st.startTime).toLocaleString("vi-VN");
    const div = document.createElement("div");
    div.className = "showtime-card";
    div.innerHTML = `
      <p>🎬 ${movieName}</p>
      <p>🕒 ${time}</p>
      <p>💰 ${st.price}₫</p>
    `;
    container.appendChild(div);
  });
}

// ====== Thêm rạp ======
addCinemaBtn.addEventListener("click", () => {
  cinemaFormContainer.style.display = "block";
  document.getElementById("cinema-form-title").textContent = "Thêm Rạp";
});

cancelCinemaBtn.addEventListener("click", () => {
  cinemaFormContainer.style.display = "none";
  cinemaForm.reset();
});

cinemaForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const newCinema = {
    name: document.getElementById("cinema-name").value,
    address: document.getElementById("cinema-address").value,
    city: document.getElementById("cinema-city").value,
    revenue: 0,
  };
  await fetch(`${apiUrl}/cinemas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newCinema),
  });
  cinemaForm.reset();
  cinemaFormContainer.style.display = "none";
  loadCinemas();
});

// ====== Sửa / Xóa rạp ======
btnEditCinema.addEventListener("click", () => {
  editForm.style.display = "block";
  editForm["cinema-edit-name"].value = currentCinema.name;
  editForm["cinema-edit-address"].value = currentCinema.address;
  editForm["cinema-edit-city"].value = currentCinema.city;
});

editCancel.addEventListener("click", () => {
  editForm.style.display = "none";
});

editForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const updated = {
    ...currentCinema,
    name: document.getElementById("cinema-edit-name").value,
    address: document.getElementById("cinema-edit-address").value,
    city: document.getElementById("cinema-edit-city").value,
  };
  await fetch(`${apiUrl}/cinemas/${currentCinema.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updated),
  });
  editForm.style.display = "none";
  loadCinemas();
  viewCinemaDetail(currentCinema.id);
});

btnDeleteCinema.addEventListener("click", async () => {
  if (!confirm("Xóa rạp này?")) return;
  await fetch(`${apiUrl}/cinemas/${currentCinema.id}`, { method: "DELETE" });
  cinemaDetailContainer.style.display = "none";
  cinemasSection.style.display = "block";
  loadCinemas();
});

// ====== Init ======
loadCinemas();

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
        <td>${movie.actors}</td>
        <td>${movie.release_date}</td>
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

movieForm.addEventListener('submit', async e => {
  e.preventDefault();
  const movieData = {
    title: document.getElementById('movie-title').value,
    director: document.getElementById('movie-director').value,
    actors: document.getElementById('movie-actors').value,
    release_date: document.getElementById('movie-release-date').value,
    status: document.getElementById('movie-status').value,
    poster_url: document.getElementById('movie-poster-url').value,
    description: document.getElementById('movie-description').value
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
    const promos = await res.json();
    promotionsTableBody.innerHTML = '';
    promos.forEach(promo => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${promo.id}</td>
        <td>${promo.code}</td>
        <td>${promo.description}</td>
        <td>${promo.discountPercentage}%</td>
        <td>${new Date(promo.startDate).toLocaleDateString('vi-VN')}</td>
        <td>${new Date(promo.endDate).toLocaleDateString('vi-VN')}</td>
        <td>
          <button class="edit-promo-btn" data-id="${promo.id}"><i class="fas fa-edit"></i>Sửa</button>
          <button class="delete-promo-btn" data-id="${promo.id}"><i class="fas fa-trash"></i>Xóa</button>
        </td>
      `;
      promotionsTableBody.appendChild(tr);
    });

    document.querySelectorAll('.edit-promo-btn').forEach(btn => {
      btn.addEventListener('click', () => editPromo(btn.dataset.id));
    });
    document.querySelectorAll('.delete-promo-btn').forEach(btn => {
      btn.addEventListener('click', () => deletePromo(btn.dataset.id));
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

promoForm.addEventListener('submit', async e => {
  e.preventDefault();
  const promoData = {
    code: document.getElementById('promo-code').value,
    description: document.getElementById('promo-description').value,
    discountPercentage: parseInt(document.getElementById('promo-discount').value),
    startDate: document.getElementById('promo-start-date').value,
    endDate: document.getElementById('promo-end-date').value
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
  } catch (err) {
    console.error("Error saving promotion:", err);
  }
});

async function editPromo(id) {
  const res = await fetch(`${apiUrl}/promotions/${id}`);
  const promo = await res.json();
  editingPromoId = id;
  document.getElementById('promo-form-title').textContent = 'Chỉnh sửa Khuyến mãi';
  document.getElementById('promo-code').value = promo.code;
  document.getElementById('promo-description').value = promo.description;
  document.getElementById('promo-discount').value = promo.discountPercentage;
  document.getElementById('promo-start-date').value = promo.startDate.split('T')[0];
  document.getElementById('promo-end-date').value = promo.endDate.split('T')[0];
  promoFormContainer.style.display = 'block';
}

async function deletePromo(id) {
  if (!confirm("Bạn có chắc muốn xóa khuyến mãi này?")) return;
  await fetch(`${apiUrl}/promotions/${id}`, { method: 'DELETE' });
  loadPromotions();
}

// ====== Initialize ======
loadDashboard();
loadUsers();
loadCinemas();
loadMovies();
loadPromotions();

