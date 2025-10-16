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
    const response = await fetch("http://localhost:3000/banners");
    if (!response.ok) throw new Error("Lỗi khi tải dữ liệu banner.");
    banners = await response.json();
    changeImage(0); // Hiển thị banner đầu tiên

    // Bắt đầu tự động chạy banner
    bannerInterval = setInterval(() => changeImage(1), 5000);
  } catch (error) {
    console.error("Đã có lỗi xảy ra với banner: ", error);
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

  // Giới hạn chỉ 4 phim cho mỗi mục
  // const moviesToDisplay = movies.slice(0, 4);
  let html = "";

  movies.slice(0, 4).forEach((movie) => {
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
  try {
    // Tạo các promise để gọi API song song
    const nowShowingPromise = fetch(
      "http://localhost:3000/movies?status=now_showing&_limit=4"
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Lỗi khi tải phim đang chiếu: ${res.statusText}`);
      return res.json();
    });

    const comingSoonPromise = fetch(
      "http://localhost:3000/movies?status=coming_soon&_limit=4"
    ).then((res) => {
      if (!res.ok)
        throw new Error(`Lỗi khi tải phim sắp chiếu: ${res.statusText}`);
      return res.json();
    });

    // Chờ cả hai promise hoàn thành
    const [nowShowingMovies, comingSoonMovies] = await Promise.all([
      nowShowingPromise,
      comingSoonPromise,
    ]);

    // Hiển thị phim lên giao diện
    renderMovies(
      nowShowingMovies,
      document.getElementById("now-showing-grid"),
      false
    );
    renderMovies(
      comingSoonMovies,
      document.getElementById("coming-soon-grid"),
      true
    );
  } catch (error) {
    console.error("Đã có lỗi xảy ra với tác vụ fetch: ", error);
  }
}



/**
 * Hiển thị kết quả tìm kiếm
 * @param {Array} movies - Mảng phim tìm được
 */
function renderSearchResults(movies) {
  const container = document.getElementById("search-results-grid");
  if (!container) return;

  if (movies.length === 0) {
    container.innerHTML =
      "<p>Không tìm thấy phim nào phù hợp với từ khóa của bạn.</p>";
    return;
  }

  let html = "";
  movies.forEach((movie) => {
    // Xác định nút bấm dựa trên trạng thái phim
    const buttonHTML =
      movie.status === "coming_soon"
        ? `<button class="btn gray">Xem thêm</button>`
        : `<button class="btn red">Đặt vé</button>`;

    html += `
      <a href="film-information.html?id=${movie.id}" class="movie-card-link">
        <div class="movie-card">
            <img src="${movie.poster_url}" alt="${movie.title}">
            <h4>${movie.title}</h4>
            <p>${movie.duration_minutes} phút | ${new Date(movie.release_date).toLocaleDateString("vi-VN")}</p>
            ${buttonHTML}
        </div>
      </a>
    `;
  });
  container.innerHTML = html;
}

/**
 * Thực hiện tìm kiếm phim
 * @param {string} query - Từ khóa tìm kiếm
 */
async function performSearch(query) {
  const searchResultsSection = document.getElementById(
    "search-results-section"
  );
  const searchResultsTitle = document.getElementById("search-results-title");
  const defaultSections = [
    document.getElementById("now-showing-section"),
    document.getElementById("coming-soon-section"),
  ];

  if (!query) {
    searchResultsSection.style.display = "none";
    defaultSections.forEach((sec) => (sec.style.display = "block"));
    return;
  }

  try {
    // Gửi 2 yêu cầu song song: một tìm theo tiêu đề, một tìm theo diễn viên
    const titlePromise = fetch(
      `http://localhost:3000/movies?title_like=${encodeURIComponent(query)}`
    ).then((res) => res.json());

    const actorsPromise = fetch(
      `http://localhost:3000/movies?actors_like=${encodeURIComponent(query)}`
    ).then((res) => res.json());

    // Chờ cả hai yêu cầu hoàn thành
    const [titleResults, actorResults] = await Promise.all([
      titlePromise,
      actorsPromise,
    ]);

    // Gộp hai kết quả và loại bỏ các phim trùng lặp
    const combinedResults = [...titleResults, ...actorResults];
    const uniqueResults = Array.from(
      new Map(combinedResults.map((movie) => [movie.id, movie])).values()
    );

    searchResultsTitle.innerText = `Kết quả tìm kiếm cho "${query}" (${uniqueResults.length})`;
    renderSearchResults(uniqueResults);

    searchResultsSection.style.display = "block";
    defaultSections.forEach((sec) => (sec.style.display = "none"));
  } catch (error) {
    console.error("Lỗi khi tìm kiếm: ", error);
  }
}

// Chạy hàm khi trang được tải
document.addEventListener("DOMContentLoaded", () => {
  setupBanner();
  fetchAndDisplayMovies();

  const searchForm = document.querySelector(".navbar-search");
  const searchInput = document.getElementById("search-input");

  searchForm.addEventListener("submit", (event) => {
    // Ngăn form submit và tải lại trang
    event.preventDefault();
    const query = searchInput.value.trim();
    performSearch(query);
  });
});
