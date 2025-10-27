const BASE_URL = "http://localhost:3000";

/**
 * Hàm fetch helper chung để xử lý các yêu cầu API và lỗi.
 * @param {string} url - URL để fetch.
 * @param {object} options - Tùy chọn cho fetch.
 * @returns {Promise<any>} - Dữ liệu JSON trả về.
 */
async function fetchJson(url, options = {}) {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            throw new Error(`Lỗi HTTP: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(`Lỗi fetch cho URL ${url}:`, error);
        throw error; // Ném lại lỗi để hàm gọi có thể xử lý
    }
}

// Đối tượng api chứa tất cả các phương thức giao tiếp với server
const api = {
    /**
     * Lấy danh sách banners.
     */
    getBanners: () => fetchJson(`${BASE_URL}/banners`),

    /**
     * Lấy danh sách phim với các tham số truy vấn.
     * @param {object} params - Ví dụ: { status: 'now_showing', _limit: 4 }
     */
    getMovies: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${BASE_URL}/movies?${query}`);
    },

    /**
     * Lấy thông tin chi tiết của một phim.
     * @param {string|number} movieId - ID của phim.
     */
    getMovieDetails: (movieId) => fetchJson(`${BASE_URL}/movies/${movieId}`),

    /**
     * Lấy tất cả thể loại.
     */
    getGenres: () => fetchJson(`${BASE_URL}/genres`),

    /**
     * Lấy đánh giá cho một phim.
     * @param {string|number} movieId - ID của phim.
     */
    getReviews: (movieId) => fetchJson(`${BASE_URL}/reviews?movieId=${movieId}`),

    /**
     * Gửi một đánh giá mới.
     * @param {object} reviewData - Dữ liệu đánh giá.
     */
    postReview: (reviewData) => {
        return fetchJson(`${BASE_URL}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData),
        });
    },

    /**
     * Lấy thông tin người dùng bằng ID.
     * @param {string|number} userId - ID của người dùng.
     */
    getUserById: (userId) => fetchJson(`${BASE_URL}/users/${userId}`),

    /**
     * Lấy danh sách người dùng với các tham số truy vấn.
     * @param {object} params - Ví dụ: { email: 'admin@example.com' }
     */
    getUsers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${BASE_URL}/users?${query}`);
    },

    /**
     * Thêm một phim mới.
     * @param {object} movieData - Dữ liệu phim mới.
     */
    addMovie: (movieData) => {
        return fetchJson(`${BASE_URL}/movies`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData),
        });
    },

    /**
     * Cập nhật một phim.
     * @param {string|number} movieId - ID của phim.
     * @param {object} movieData - Dữ liệu phim để cập nhật.
     */
    updateMovie: (movieId, movieData) => {
        return fetchJson(`${BASE_URL}/movies/${movieId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData),
        });
    },

    /**
     * Xóa một phim.
     * @param {string|number} movieId - ID của phim.
     */
    deleteMovie: (movieId) => {
        return fetchJson(`${BASE_URL}/movies/${movieId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Lấy danh sách đặt vé với các tham số truy vấn.
     * @param {object} params - Ví dụ: { userId: 1 }
     */
    getBookings: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${BASE_URL}/bookings?${query}`);
    },
   // Văn Tiết mới thêm cho trang quản trị là đây
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`${BASE_URL}/users?${query}`);
  },
  addUser: (userData) => fetchJson(`${BASE_URL}/users`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(userData)
  }),
  updateUser: (userId, userData) => fetchJson(`${BASE_URL}/users/${userId}`, {
    method: 'PUT',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(userData)
  }),
  deleteUser: (userId) => fetchJson(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE'
  }),
  getCinemas: () => fetchJson(`${BASE_URL}/cinemas`),
  getCinemaRooms: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`${BASE_URL}/cinema_rooms?${query}`);
  },
  getBookings: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchJson(`${BASE_URL}/bookings?${query}`);
  }
};


async function getData(type) {
  try {
    const response = await fetch("../json/db.json"); // đúng đường dẫn
    const data = await response.json();
    return data[type] || []; // đảm bảo luôn trả về mảng (nếu không có thì [])
  } catch (error) {
    console.error("Lỗi tải dữ liệu:", error);
    return [];
  }
}



