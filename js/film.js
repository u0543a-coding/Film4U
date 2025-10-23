/**
 * Hàm để hiển thị danh sách phim vào một container cụ thể
 * @param {Array} movies - Mảng các đối tượng phim
 * @param {HTMLElement} container - Element DOM để chèn HTML vào
 */
function renderMovies(movies, container) {
  if (!container) {
    console.error("Không tìm thấy phần tử container để hiển thị phim.");
    return;
  }

  let html = "";

  // Nếu không có phim, hiển thị thông báo
  if (movies.length === 0) {
    container.innerHTML = "<p>Không tìm thấy phim phù hợp.</p>";
    return;
  }

  movies.forEach((movie) => {
    const isComingSoon = movie.status === 'coming_soon';
    const buttonHTML = isComingSoon
      ? `<button class="btn gray">Xem thêm</button>`
      : `<button class="btn red">Đặt vé</button>`;

    html += `
      <a href="film-information.html?id=${movie.id}" class="movie-card-link">
        <div class="movie-card">
            <img src="${movie.poster_url}" alt="${movie.title}">
            <h4>${movie.title}</h4>
            <p>${movie.duration_minutes} phút | ${new Date(
      movie.release_date
    ).toLocaleDateString("vi-VN")}</p>
            ${buttonHTML}
        </div>
      </a>
    `;
  });

  container.innerHTML = html;
}

/**
 * Lấy tất cả phim và hiển thị chúng
 */
async function fetchAndDisplayAllMovies() {
  const allFilmsGrid = document.getElementById("all-films-grid");

  try {
    const allMovies = await api.getMovies({});
    renderMovies(allMovies, allFilmsGrid);
  } catch (error) {
    console.error("Đã có lỗi xảy ra với tác vụ fetch: ", error);
    if (allFilmsGrid) allFilmsGrid.innerHTML = "<p>Lỗi tải phim.</p>";
  }
}

// Chạy các hàm khởi tạo khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  fetchAndDisplayAllMovies();
});