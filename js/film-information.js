// Chạy các hàm khởi tạo khi DOM đã tải xong
document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  if (!movieId) {
    console.error("Không tìm thấy ID phim trong URL.");
    const container = document.querySelector(".container");
    if (container)
      container.innerHTML = `<p style="text-align: center; color: red;">Lỗi: Không tìm thấy ID phim trong URL.</p>`;
    return;
  }

  try {
    // Lấy thông tin phim, thể loại và đánh giá song song bằng đối tượng api
    const [movie, genresData, reviews] = await Promise.all([
      api.getMovieDetails(movieId),
      api.getGenres(),
      api.getReviews(movieId),
    ]);

    const genresMap = genresData.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});

    const genres = movie.genreIds.map((id) => genresMap[id] || "").join(", ");
    document.title = movie.title;

    /**
     * Hàm để hiển thị danh sách các đánh giá.
     * @param {Array<object>} reviews - Mảng các đối tượng đánh giá.
     * @returns {string} - Chuỗi HTML chứa danh sách các đánh giá.
     */
    function renderReviews(reviews) {
      if (reviews.length === 0) {
        return "<p>Chưa có đánh giá nào cho phim này.</p>";
      }

      return reviews
        .map(
          (review) => `
    <div class="review-item">
      <div class="review-header">
        <div class="avatar">${review.author.charAt(0).toUpperCase()}</div>
        <div class="reviewer-info">
          <div class="reviewer-name">${review.author}</div>
          <div class="review-time">${new Date(review.createdAt).toLocaleString(
            "vi-VN"
          )}</div>
        </div>
      </div>
      
      <div class="review-content">
        <div class="review-text">
          <p>${review.content}</p>
        </div>
        <button class="like-btn">Thích</button>
      </div>
    </div>
  `
        )
        .join("");
    }

    const container = document.querySelector(".container");
    if (container) {
      container.innerHTML = `
        <div class="banner">
          <div class="poster-section">
            <div class="poster">
              <img src="${movie.poster_url}" alt="Poster phim ${movie.title}">
            </div>
            <button class="book-ticket">Đặt vé</button>
          </div>
          <div class="movie-info">
            <h1 class="movie-title">${movie.title}</h1>
            <div class="movie-genre">${genres}</div>
            <div class="movie-details">
              <div class="detail-item"><span class="detail-label">Hài lòng</span><span class="detail-value">97%</span></div>
              <div class="detail-item"><span class="detail-label">Lịch chiếu</span><span class="detail-value">${new Date(
                movie.release_date
              ).toLocaleDateString("vi-VN")}</span></div>
              <div class="detail-item"><span class="detail-label">Thời lượng</span><span class="detail-value">${
                movie.duration_minutes
              } phút</span></div>
              <div class="detail-item"><span class="detail-label">Độ tuổi</span><span class="detail-value">13+</span></div>
            </div>
          </div>
        </div>
        <div class="content">
          <div class="info-section">
            <h2 class="section-title">Thông tin phim</h2>
            <div class="info-item"><span class="info-label">Mô tả:</span><div class="info-content"><p>${
              movie.description
            }</p></div></div>
            <div class="info-item"><span class="info-label">Đạo diễn:</span><div class="info-content"><p>${
              movie.director
            }</p></div></div>
            <div class="info-item"><span class="info-label">Diễn viên:</span><div class="info-content"><p>${
              movie.actors
            }</p></div></div>
          </div>
          <div class="reviews-section">
            <h2 class="section-title">Đánh giá</h2>
            <div class="reviews-list">
              ${renderReviews(reviews)}
            </div>
            <form class="review-form">
              <textarea class="input-content" rows="3" placeholder="Viết đánh giá của bạn..."></textarea>
              <button type="submit" class="submit-btn">Gửi đánh giá</button>
            </form>
          </div>
        </div>
      `;

      /**
       * Hàm xử lý việc gửi đánh giá mới.
       * @param {Event} event - Sự kiện submit của form.
       * @param {string} movieId - ID của bộ phim được đánh giá.
       */
      async function handleReviewSubmit(event, movieId) {
        event.preventDefault();
        const form = event.target;
        const textarea = form.querySelector(".input-content");
        const button = form.querySelector(".submit-btn");
        const content = textarea.value.trim();

        if (!content) {
          alert("Vui lòng nhập nội dung đánh giá.");
          return;
        }

        button.disabled = true;
        button.textContent = "Đang gửi...";

        try {
          const reviewData = {
            movieId: parseInt(movieId),
            author: "Người dùng ẩn danh", // Hoặc lấy từ người dùng đã đăng nhập
            content: content,
            createdAt: new Date().toISOString(),
          };
          await api.postReview(reviewData);

          // Tải lại phần đánh giá
          const newReviews = await api.getReviews(movieId);
          document.querySelector(".reviews-list").innerHTML =
            renderReviews(newReviews);

          textarea.value = ""; // Xóa nội dung trong textarea
        } catch (error) {
          console.error("Lỗi khi gửi đánh giá:", error);
          alert("Gửi đánh giá không thành công.");
        } finally {
          button.disabled = false;
          button.textContent = "Gửi đánh giá";
        }
      }

      // Thêm trình lắng nghe sự kiện cho form mới
      const reviewForm = document.querySelector(".review-form");
      if (reviewForm) {
        reviewForm.addEventListener("submit", (event) =>
          handleReviewSubmit(event, movieId)
        );
      }

      /**
       * Cập nhật trạng thái của nút đặt vé dựa trên trạng thái của phim.
       * @param {object} movie - Đối tượng thông tin phim.
       * @param {string} movieId - ID của phim.
       */
      function updateBookingButton(movie, movieId) {
        const bookTicketButton = document.querySelector(".book-ticket");
        if (bookTicketButton) {
          if (movie.status === "coming_soon") {
            bookTicketButton.textContent = "Sắp chiếu";
            bookTicketButton.disabled = true;
            bookTicketButton.style.cursor = "not-allowed";
            bookTicketButton.style.backgroundColor = "#ccc";
          } else {
            bookTicketButton.addEventListener("click", () => {
              window.location.href = `cinemabooking.html?movieId=${movieId}`;
            });
          }
        }
      }

      // Cập nhật trạng thái nút Đặt vé
      updateBookingButton(movie, movieId);
    }
  } catch (error) {
    console.error("Đã có lỗi xảy ra:", error);
    const container = document.querySelector(".container");
    if (container) {
      container.innerHTML = `<p style='text-align: center; color: red;'>Tải dữ liệu không thành công. Vui lòng thử lại sau.</p>`;
    }
  }
});
