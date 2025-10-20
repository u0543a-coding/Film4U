// film-information.js

// Xử lý nút like
document.querySelectorAll('.xemchitiet-like-btn').forEach(button => {
    let likeCount = 0;

    // Thêm style cho nút like
    button.style.border = '1px solid #ccc';
    button.style.borderRadius = '4px';
    button.style.cursor = 'pointer';
    button.style.padding = '5px 10px';
    button.style.background = 'none';

    button.addEventListener('click', function() {
        if (this.textContent.includes('Like')) {
            likeCount++;
            this.innerHTML = `<i class="bi bi-hand-thumbs-up-fill"></i> Đã like (${likeCount})`;
        } else {
            likeCount--;
            if (likeCount <= 0) {
                this.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like`;
                likeCount = 0;
            } else {
                this.innerHTML = `<i class="bi bi-hand-thumbs-up-fill"></i> Đã like (${likeCount})`;
            }
        }
    });
});

// Xử lý xóa đánh giá
document.querySelectorAll('.xemchitiet-review-item').forEach(item => {
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = '1px solid #ff4444';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = '#ff4444';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.padding = '5px 10px';

    deleteBtn.addEventListener('click', function() {
        if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
            item.remove();
        }
    });

    item.querySelector('.xemchitiet-review-content').appendChild(deleteBtn);
});

// Xử lý gửi đánh giá mới
document.querySelector('.xemchitiet-submit-btn').addEventListener('click', function() {
    const textarea = document.querySelector('.xemchitiet-input-content');
    const content = textarea.value.trim();

    if (content === '') {
        alert('Vui lòng nhập đánh giá!');
        return;
    }

    // Tạo đánh giá mới
    const newReview = document.createElement('div');
    newReview.className = 'xemchitiet-review-item';
    newReview.innerHTML = `
        <div class="xemchitiet-review-header">
            <div class="xemchitiet-avatar">You</div>
            <div class="xemchitiet-reviewer-info">
                <div class="xemchitiet-reviewer-name">Bạn</div>
                <div class="xemchitiet-review-time">Vừa xong</div>
            </div>
        </div>
        <div class="xemchitiet-review-content">
            <div class="xemchitiet-review-text">
                <p>${content}</p>
            </div>
            <button class="xemchitiet-like-btn"><i class="bi bi-hand-thumbs-up"></i> Like</button>
        </div>
    `;

    // Thêm nút xóa cho đánh giá mới
    const deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = '<i class="bi bi-trash"></i>';
    deleteBtn.style.background = 'none';
    deleteBtn.style.border = '1px solid #ff4444';
    deleteBtn.style.borderRadius = '4px';
    deleteBtn.style.cursor = 'pointer';
    deleteBtn.style.color = '#ff4444';
    deleteBtn.style.marginLeft = '10px';
    deleteBtn.style.padding = '5px 10px';

    deleteBtn.addEventListener('click', function() {
        if (confirm('Bạn có chắc muốn xóa đánh giá này?')) {
            newReview.remove();
        }
    });

    newReview.querySelector('.xemchitiet-review-content').appendChild(deleteBtn);

    // Thêm sự kiện like cho đánh giá mới
    const newLikeBtn = newReview.querySelector('.xemchitiet-like-btn');
    let likeCount = 0;

    // Thêm style cho nút like mới
    newLikeBtn.style.border = '1px solid #ccc';
    newLikeBtn.style.borderRadius = '4px';
    newLikeBtn.style.cursor = 'pointer';
    newLikeBtn.style.padding = '5px 10px';
    newLikeBtn.style.background = 'none';

    newLikeBtn.addEventListener('click', function() {
        if (this.innerHTML.includes('Like')) {
            likeCount++;
            this.innerHTML = `<i class="bi bi-hand-thumbs-up-fill"></i> Đã like (${likeCount})`;
        } else {
            likeCount--;
            if (likeCount <= 0) {
                this.innerHTML = `<i class="bi bi-hand-thumbs-up"></i> Like`;
                likeCount = 0;
            } else {
                this.innerHTML = `<i class="bi bi-hand-thumbs-up-fill"></i> Đã like (${likeCount})`;
            }
        }
    });

    // Thêm đánh giá mới vào đầu danh sách
    const reviewsSection = document.querySelector('.xemchitiet-reviews-section');
    const reviewForm = document.querySelector('.xemchitiet-review-form');
    reviewsSection.insertBefore(newReview, reviewForm);

    // Reset form
    textarea.value = '';
});

// Xử lý nút đặt vé
document.querySelector('.xemchitiet-book-ticket').addEventListener('click', function() {
    alert('Phim chưa được chiếu vui lòng quay lại sau!');
});