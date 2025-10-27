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

// ====== Helper function to get next ID ======
async function getNextId(resource) {
  try {
    const res = await fetch(`${apiUrl}/${resource}`);
    const items = await res.json();
    
    if (items.length === 0) return 1;
    
    // Lấy tất cả ID số
    const numericIds = items
      .map(item => {
        const id = parseInt(item.id);
        return isNaN(id) ? 0 : id;
      })
      .filter(id => id > 0);
    
    if (numericIds.length === 0) return 1;
    
    return Math.max(...numericIds) + 1;
  } catch (err) {
    console.error(`Error getting next ID for ${resource}:`, err);
    return 1;
  }
}

// ====== Helper function to reorder IDs ======
async function reorderIds(resource) {
  try {
    const res = await fetch(`${apiUrl}/${resource}`);
    const items = await res.json();
    
    if (items.length === 0) return true;
    
    // Sắp xếp items theo ID hiện tại
    const sortedItems = items.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    // Xóa tất cả items cũ
    for (const item of sortedItems) {
      await fetch(`${apiUrl}/${resource}/${item.id}`, {
        method: 'DELETE'
      });
    }
    
    // Thêm lại items với ID mới
    for (let i = 0; i < sortedItems.length; i++) {
      const newItem = { ...sortedItems[i], id: (i + 1).toString() };
      await fetch(`${apiUrl}/${resource}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newItem)
      });
    }
    
    return true;
  } catch (err) {
    console.error(`Error reordering IDs for ${resource}:`, err);
    return false;
  }
}

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
    
    // Sắp xếp users theo ID
    const sortedUsers = users.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    sortedUsers.forEach(user => {
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
      // Lấy ID tiếp theo cho user
      const nextId = await getNextId('users');
      userData.id = nextId.toString();
      
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
  
  try {
    // Xóa user
    await fetch(`${apiUrl}/users/${id}`, { method: 'DELETE' });
    
    // Load lại danh sách users để lấy danh sách mới
    const res = await fetch(`${apiUrl}/users`);
    const users = await res.json();
    
    if (users.length > 0) {
      // Xóa tất cả users cũ
      for (const user of users) {
        await fetch(`${apiUrl}/users/${user.id}`, { method: 'DELETE' });
      }
      
      // Thêm lại users với ID mới
      const sortedUsers = users.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      for (let i = 0; i < sortedUsers.length; i++) {
        const newUser = { ...sortedUsers[i], id: (i + 1).toString() };
        await fetch(`${apiUrl}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newUser)
        });
      }
    }
    
    loadUsers();
    loadDashboard();
  } catch (err) {
    console.error("Error deleting user:", err);
  }
}

// ====== Cinemas Management ======
const cinemasTableBody = document.querySelector('#cinemas-table tbody');
const cinemaFormContainer = document.getElementById('cinema-form-container');
const cinemaForm = document.getElementById('cinema-form');
const addCinemaBtn = document.getElementById('add-cinema-btn');
const cancelCinemaBtn = document.getElementById('cancel-cinema-btn');
let editingCinemaId = null;

async function loadCinemas() {
  try {
    const [cinemasRes, roomsRes, showtimesRes, bookingsRes] = await Promise.all([
      fetch(`${apiUrl}/cinemas`),
      fetch(`${apiUrl}/cinema_rooms`),
      fetch(`${apiUrl}/showtimes`),
      fetch(`${apiUrl}/bookings`)
    ]);

    const cinemas = await cinemasRes.json();
    const rooms = await roomsRes.json();
    const showtimes = await showtimesRes.json();
    const bookings = await bookingsRes.json();

    cinemasTableBody.innerHTML = '';
    
    // Sắp xếp cinemas theo ID
    const sortedCinemas = cinemas.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    sortedCinemas.forEach(cinema => {
      const cinemaRooms = rooms.filter(r => r.cinemaId === cinema.id);
      let cinemaRevenue = 0;

      cinemaRooms.forEach(room => {
        const roomShowtimes = showtimes.filter(s => s.roomId === room.id);
        roomShowtimes.forEach(st => {
          const stBookings = bookings.filter(b => b.showtimeId === st.id);
          stBookings.forEach(b => cinemaRevenue += (b.totalPrice || 0));
        });
      });

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${cinema.id}</td>
        <td>${cinema.name}</td>
        <td>${cinema.address}</td>
        <td>${cinema.city}</td>
        <td>${cinemaRevenue.toLocaleString('vi-VN')} ₫</td>
        <td>
          <button class="edit-btn" data-id="${cinema.id}"><i class="fas fa-edit"></i>Sửa</button>
          <button class="delete-btn" data-id="${cinema.id}"><i class="fas fa-trash"></i>Xóa</button>
        </td>
      `;
      cinemasTableBody.appendChild(tr);
    });

    // Sử dụng cùng class với phần users để đồng bộ
    document.querySelectorAll('#cinemas-table .edit-btn').forEach(btn => {
      btn.addEventListener('click', () => editCinema(btn.dataset.id));
    });
    document.querySelectorAll('#cinemas-table .delete-btn').forEach(btn => {
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

cinemaForm.addEventListener('submit', async e => {
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
      // Lấy ID tiếp theo cho cinema
      const nextId = await getNextId('cinemas');
      cinemaData.id = nextId.toString();
      
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
  
  try {
    // Xóa cinema
    await fetch(`${apiUrl}/cinemas/${id}`, { method: 'DELETE' });
    
    // Load lại danh sách cinemas để lấy danh sách mới
    const res = await fetch(`${apiUrl}/cinemas`);
    const cinemas = await res.json();
    
    if (cinemas.length > 0) {
      // Xóa tất cả cinemas cũ
      for (const cinema of cinemas) {
        await fetch(`${apiUrl}/cinemas/${cinema.id}`, { method: 'DELETE' });
      }
      
      // Thêm lại cinemas với ID mới
      const sortedCinemas = cinemas.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      for (let i = 0; i < sortedCinemas.length; i++) {
        const newCinema = { ...sortedCinemas[i], id: (i + 1).toString() };
        await fetch(`${apiUrl}/cinemas`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCinema)
        });
      }
    }
    
    loadCinemas();
    loadDashboard();
  } catch (err) {
    console.error("Error deleting cinema:", err);
  }
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
    
    // Sắp xếp movies theo ID
    const sortedMovies = movies.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    sortedMovies.forEach(movie => {
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
      // Lấy ID tiếp theo cho movie
      const nextId = await getNextId('movies');
      movieData.id = nextId.toString();
      
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
  
  try {
    // Xóa movie
    await fetch(`${apiUrl}/movies/${id}`, { method: 'DELETE' });
    
    // Load lại danh sách movies để lấy danh sách mới
    const res = await fetch(`${apiUrl}/movies`);
    const movies = await res.json();
    
    if (movies.length > 0) {
      // Xóa tất cả movies cũ
      for (const movie of movies) {
        await fetch(`${apiUrl}/movies/${movie.id}`, { method: 'DELETE' });
      }
      
      // Thêm lại movies với ID mới
      const sortedMovies = movies.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      for (let i = 0; i < sortedMovies.length; i++) {
        const newMovie = { ...sortedMovies[i], id: (i + 1).toString() };
        await fetch(`${apiUrl}/movies`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newMovie)
        });
      }
    }
    
    loadMovies();
  } catch (err) {
    console.error("Error deleting movie:", err);
  }
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
    
    // Sắp xếp promotions theo ID
    const sortedPromos = promos.sort((a, b) => parseInt(a.id) - parseInt(b.id));
    
    sortedPromos.forEach(promo => {
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
      // Lấy ID tiếp theo cho promotion
      const nextId = await getNextId('promotions');
      promoData.id = nextId.toString();
      
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
  
  try {
    // Xóa promotion
    await fetch(`${apiUrl}/promotions/${id}`, { method: 'DELETE' });
    
    // Load lại danh sách promotions để lấy danh sách mới
    const res = await fetch(`${apiUrl}/promotions`);
    const promos = await res.json();
    
    if (promos.length > 0) {
      // Xóa tất cả promotions cũ
      for (const promo of promos) {
        await fetch(`${apiUrl}/promotions/${promo.id}`, { method: 'DELETE' });
      }
      
      // Thêm lại promotions với ID mới
      const sortedPromos = promos.sort((a, b) => parseInt(a.id) - parseInt(b.id));
      for (let i = 0; i < sortedPromos.length; i++) {
        const newPromo = { ...sortedPromos[i], id: (i + 1).toString() };
        await fetch(`${apiUrl}/promotions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPromo)
        });
      }
    }
    
    loadPromotions();
  } catch (err) {
    console.error("Error deleting promotion:", err);
  }
}

// ====== Initialize ======
loadDashboard();
loadUsers();
loadCinemas();
loadMovies();
loadPromotions();

const userDropdown = document.getElementById('user-dropdown');
const userMenu = document.querySelector('#user-dropdown .user-menu');

if (userDropdown && userMenu) {
  // Khi click vào "Admin Film4U" → hiện/ẩn menu
  userDropdown.addEventListener('click', (e) => {
    e.stopPropagation();
    userMenu.classList.toggle('show');
  });

  // Khi click ra ngoài → ẩn menu
  document.addEventListener('click', (e) => {
    if (!userDropdown.contains(e.target)) {
      userMenu.classList.remove('show');
    }
  });
}