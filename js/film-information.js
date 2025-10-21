// Function to render reviews
function renderReviews(reviews) {
  if (reviews.length === 0) {
    return "<p>Chưa có đánh giá nào cho phim này.</p>";
  }

  return reviews.map(review => `
    <div class="review-item">
      <div class="review-header">
        <div class="avatar">${review.author.charAt(0).toUpperCase()}</div>
        <div class="reviewer-info">
          <div class="reviewer-name">${review.author}</div>
          <div class="review-time">${new Date(review.createdAt).toLocaleString("vi-VN")}</div>
        </div>
      </div>
      
      <div class="review-content">
        <div class="review-text">
          <p>${review.content}</p>
        </div>
        <button class="like-btn">Like</button>
      </div>
    </div>
  `).join('');
}

// Function to handle review submission
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
        author: "Người dùng ẩn danh", // Or get from a logged-in user
        content: content,
        createdAt: new Date().toISOString(),
    };
    await api.postReview(reviewData);

    // Refresh reviews section
    const newReviews = await api.getReviews(movieId);
    document.querySelector('.reviews-list').innerHTML = renderReviews(newReviews);
    
    textarea.value = ''; // Clear textarea

  } catch (error) {
    console.error("Lỗi khi gửi đánh giá:", error);
    alert("Gửi đánh giá không thành công.");
  } finally {
    button.disabled = false;
    button.textContent = "Gửi đánh giá";
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const movieId = params.get("id");

  if (!movieId) {
    console.error("Không tìm thấy ID phim trong URL.");
    const container = document.querySelector('.container');
    if(container) container.innerHTML = `<p style="text-align: center; color: red;">Lỗi: Không tìm thấy ID phim trong URL.</p>`;
    return;
  }

  try {
    // Fetch movie, genres, and reviews in parallel using the api object
    const [movie, genresData, reviews] = await Promise.all([
      api.getMovieDetails(movieId),
      api.getGenres(),
      api.getReviews(movieId)
    ]);

    const genresMap = genresData.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});

    const genres = movie.genreIds.map((id) => genresMap[id] || "").join(", ");
    document.title = movie.title;

    const container = document.querySelector('.container');
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
              <div class="detail-item"><span class="detail-label">Lịch chiếu</span><span class="detail-value">${new Date(movie.release_date).toLocaleDateString("vi-VN")}</span></div>
              <div class="detail-item"><span class="detail-label">Thời lượng</span><span class="detail-value">${movie.duration_minutes} phút</span></div>
              <div class="detail-item"><span class="detail-label">Độ tuổi</span><span class="detail-value">13+</span></div>
            </div>
          </div>
        </div>
        <div class="content">
          <div class="info-section">
            <h2 class="section-title">Thông tin phim</h2>
            <div class="info-item"><span class="info-label">Mô tả:</span><div class="info-content"><p>${movie.description}</p></div></div>
            <div class="info-item"><span class="info-label">Đạo diễn:</span><div class="info-content"><p>${movie.director}</p></div></div>
            <div class="info-item"><span class="info-label">Diễn viên:</span><div class="info-content"><p>${movie.actors}</p></div></div>
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

      // Add event listener for the new form
      const reviewForm = document.querySelector('.review-form');
      if (reviewForm) {
        reviewForm.addEventListener('submit', (event) => handleReviewSubmit(event, movieId));
      }

      // Add event listener for the book ticket button
      const bookTicketButton = document.querySelector('.book-ticket');
      if (bookTicketButton) {
        bookTicketButton.addEventListener('click', () => {
          window.location.href = `Chonghe.html?movieId=${movieId}`;
        });
      }
    }
  } catch (error) {
    console.error("Đã có lỗi xảy ra:", error);
    const container = document.querySelector(".container");
    if (container) {
      container.innerHTML = `<p style='text-align: center; color: red;'>Tải dữ liệu không thành công. Vui lòng thử lại sau.</p>`;
    }
  }
});
