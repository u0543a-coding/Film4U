const BASE_URL = 'http://localhost:3000';

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
     * Thêm một người dùng mới.
     * @param {object} userData - Dữ liệu người dùng mới.
     */
    createUser: (userData) => {
        return fetchJson(`${BASE_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData),
        });
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

    /**
     * Thêm một đặt vé mới.
     * @param {object} bookingData - Dữ liệu đặt vé mới.
     */
    createBooking: (bookingData) => {
        return fetchJson(`${BASE_URL}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData),
        });
    },

    /**
     * Lấy tất cả rạp chiếu phim.
     */
    getCinemas: () => fetchJson(`${BASE_URL}/cinemas`),

    /**
     * Lấy tất cả phòng chiếu.
     */
    getCinemaRooms: () => fetchJson(`${BASE_URL}/cinema_rooms`),

    /**
     * Lấy các mẫu lịch chiếu với các tham số truy vấn.
     * @param {object} params - Ví dụ: { movieId: 1 }
     */
    getShowtimePatterns: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${BASE_URL}/showtime_patterns?${query}`);
    },

    /**
     * Lấy danh sách suất chiếu với các tham số truy vấn.
     * @param {object} params - Ví dụ: { roomId: 'room_c1_1', _expand: 'movie' }
     */
    getShowtimes: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return fetchJson(`${BASE_URL}/showtimes?${query}`);
    },

    /**
     * Thêm một suất chiếu mới.
     * @param {object} showtimeData - Dữ liệu suất chiếu mới.
     */
    addShowtime: (showtimeData) => {
        return fetchJson(`${BASE_URL}/showtimes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(showtimeData),
        });
    },

    /**
     * Xóa một suất chiếu.
     * @param {string|number} showtimeId - ID của suất chiếu.
     */
    deleteShowtime: (showtimeId) => {
        return fetchJson(`${BASE_URL}/showtimes/${showtimeId}`, {
            method: 'DELETE',
        });
    },

    /**
     * Lấy tất cả các chương trình khuyến mãi.
     */
    getPromotions: () => fetchJson(`${BASE_URL}/promotions`),

    /**
     * Lấy khuyến mãi bằng mã code.
     * @param {string} code - Mã khuyến mãi.
     */
    getPromotionByCode: (code) => fetchJson(`${BASE_URL}/promotions?code=${code}`),

    /**
     * Thêm một khuyến mãi mới.
     * @param {object} promoData - Dữ liệu khuyến mãi.
     */
    addPromotion: (promoData) => {
        return fetchJson(`${BASE_URL}/promotions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promoData),
        });
    },

    /**
     * Cập nhật một khuyến mãi.
     * @param {string|number} promoId - ID của khuyến mãi.
     * @param {object} promoData - Dữ liệu để cập nhật.
     */
    updatePromotion: (promoId, promoData) => {
        return fetchJson(`${BASE_URL}/promotions/${promoId}`, {
            method: 'PATCH', // PATCH is better for partial updates
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(promoData),
        });
    },

    /**
     * Xóa một khuyến mãi.
     * @param {string|number} promoId - ID của khuyến mãi.
     */
    deletePromotion: (promoId) => {
        return fetchJson(`${BASE_URL}/promotions/${promoId}`, {
            method: 'DELETE',
        });
    },
};
