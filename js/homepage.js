// Slide banner
let banners = [];
let current = 0;
let bannerInterval;

/**
 * Thay đổi ảnh banner dựa trên hướng di chuyển.
 * @param {number} direction - Hướng di chuyển (-1 cho lùi, 1 cho tới).
 */
window.changeImage = function (direction) {
  if (banners.length === 0) return;
  current = (current + direction + banners.length) % banners.length;
  const bannerImage = document.getElementById("bannerImage");
  bannerImage.src = banners[current].imageUrl;
  bannerImage.alt = banners[current].altText;

  // Đặt lại bộ đếm thời gian tự động chạy
  clearInterval(bannerInterval);
  bannerInterval = setInterval(() => changeImage(1), 5000); // Tự động chuyển ảnh sau 5 giây
};

async function setupBanner() {
  try {
    banners = await api.getBanners();
    changeImage(0); // Hiển thị banner đầu tiên

    // Bắt đầu tự động chạy banner
    bannerInterval = setInterval(() => changeImage(1), 5000);
  } catch (error) {
    console.error("Đã có lỗi xảy ra với banner: ", error);
  }
}



/**
 * Xử lý tìm kiếm phim dựa trên tiêu đề hoặc diễn viên.
 * @param {Event} event - Sự kiện submit của form.
 */
async function handleSearch(event) {
  event.preventDefault(); // Ngăn form gửi đi và tải lại trang

  const searchInput = document.getElementById("search-input");
  const query = searchInput.value.trim();

  const searchResultsSection = document.getElementById("search-results-section");
  const nowShowingSection = document.getElementById("now-showing-section");
  const comingSoonSection = document.getElementById("coming-soon-section");
  const sectionTitle = document.querySelector(".section-title");

  // Nếu ô tìm kiếm trống, hiển thị lại các mục mặc định
  if (!query) {
    searchResultsSection.style.display = "none";
    nowShowingSection.style.display = "block";
    comingSoonSection.style.display = "block";
    sectionTitle.style.display = "block";
    return;
  }

  try {
    // Lấy phim dựa trên query
    const filteredMovies = await api.getMovies({}); // Lấy tất cả phim

    // Ẩn các mục phim hot và hiển thị khu vực kết quả tìm kiếm
    nowShowingSection.style.display = "none";
    comingSoonSection.style.display = "none";
    sectionTitle.style.display = "none";
    searchResultsSection.style.display = "block";

    // Cập nhật tiêu đề kết quả tìm kiếm
    const searchResultsTitle = document.getElementById("search-results-title");
    searchResultsTitle.textContent = `Kết quả tìm kiếm cho "${searchInput.value}"`;

    // Hiển thị phim đã lọc
    const searchResultsGrid = document.getElementById("search-results-grid"); 
    
    // Lọc phim dựa trên query từ input
    const moviesMatchingQuery = filteredMovies.filter(movie => 
      movie.title.toLowerCase().includes(query.toLowerCase()) || 
      movie.actors.toLowerCase().includes(query.toLowerCase())
    );
    renderMovies(moviesMatchingQuery, searchResultsGrid, false); // Giả sử tất cả đều có thể đặt vé
  } catch (error) {
    console.error("Lỗi khi thực hiện tìm kiếm: ", error);
  }
}



/**
 * Hàm để hiển thị danh sách phim vào một container cụ thể
 * @param {Array} movies - Mảng các đối tượng phim
 * @param {HTMLElement} container - Element DOM để chèn HTML vào
 * @param {boolean} isComingSoon - Cờ để xác định loại nút (true cho 'Xem thêm', false cho 'Đặt vé')
 */
function renderMovies(movies, container, isComingSoon) {
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

async function fetchAndDisplayMovies() {
  const nowShowingGrid = document.getElementById("now-showing-grid");
  const comingSoonGrid = document.getElementById("coming-soon-grid");

  try {
    // Gọi API song song bằng api.js
    const [nowShowingMovies, comingSoonMovies] = await Promise.all([
      api.getMovies({ status: "now_showing", _limit: 4 }),
      api.getMovies({ status: "coming_soon", _limit: 4 }),
    ]);

    // Hiển thị phim lên giao diện
    renderMovies(nowShowingMovies, nowShowingGrid, false);
    renderMovies(comingSoonMovies, comingSoonGrid, true);

  } catch (error) {
    console.error("Đã có lỗi xảy ra với tác vụ fetch: ", error);
    if (nowShowingGrid) nowShowingGrid.innerHTML = "<p>Lỗi tải phim.</p>";
    if (comingSoonGrid) comingSoonGrid.innerHTML = "<p>Lỗi tải phim.</p>";
  }
}


// Chạy các hàm khởi tạo khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", () => {
  setupBanner();
  fetchAndDisplayMovies();

  // Lắng nghe sự kiện header đã được tải
  document.addEventListener('headerLoaded', () => {
    // Xử lý tìm kiếm từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const searchQuery = urlParams.get('search');

    if (searchQuery) {
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.value = decodeURIComponent(searchQuery);
        // Gọi hàm handleSearch để hiển thị kết quả
        handleSearch({ preventDefault: () => {} });
      }
    }
  });
});