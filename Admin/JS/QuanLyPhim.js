// /Film4U/Admin/js/QuanLyPhim.js

// ---- 1. Hiển thị danh sách phim trong trang QuanLyPhim.html ---- //
function loadMovies() {
  const movieList = document.querySelector(".content");
  if (!movieList) return; // nếu không ở trang danh sách thì bỏ qua

  let movies = JSON.parse(localStorage.getItem("movies")) || [];

  if (movies.length === 0) {
    movieList.innerHTML = "<p>Chưa có phim nào trong hệ thống.</p>";
    return;
  }

  let html = `
    <table border="1" cellspacing="0" cellpadding="8" style="width:100%; border-collapse:collapse;">
      <tr>
        <th>Tên phim</th>
        <th>Thể loại</th>
        <th>Ngày chiếu</th>
        <th>Đạo diễn</th>
        <th>Thao tác</th>
      </tr>
  `;

  movies.forEach((m, index) => {
    html += `
      <tr>
        <td>${m.tenPhim}</td>
        <td>${m.theLoai}</td>
        <td>${m.ngayChieu}</td>
        <td>${m.daoDien}</td>
        <td>
          <button onclick="editMovie(${index})"> Sửa </button>
          <button onclick="deleteMovie(${index})"> Xóa </button>
        </td>
      </tr>
    `;
  });

  html += `</table>`;
  movieList.innerHTML = html;
}

// ---- 2. Xóa phim ---- //
function deleteMovie(index) {
  if (!confirm("Bạn có chắc muốn xóa phim này không?")) return;
  let movies = JSON.parse(localStorage.getItem("movies")) || [];
  movies.splice(index, 1);
  localStorage.setItem("movies", JSON.stringify(movies));
  loadMovies();
}

// ---- 3. Chuyển sang trang chỉnh sửa ---- //
function editMovie(index) {
  localStorage.setItem("editIndex", index);
  window.location.href = "TaoPhim1.html";
}

// ---- 4. Lưu dữ liệu khi nhấn “Xác nhận” trong form tạo phim ---- //
function handleFormSubmit(e) {
  e.preventDefault();

  const form = e.target;
  const movie = {
    tenPhim: form.querySelector('input[placeholder="Enter name"]').value,
    tenPhimEN: form.querySelector('input[placeholder="Enter english name"]').value,
    moTa: form.querySelector("textarea").value,
    theLoai: form.querySelectorAll("select")[4].value,
    daoDien: form.querySelectorAll("select")[5].value,
    ngayChieu: form.querySelector('input[type="date"]').value,
  };

  if (!movie.tenPhim || !movie.ngayChieu) {
    alert("Vui lòng nhập đủ thông tin bắt buộc!");
    return;
  }

  let movies = JSON.parse(localStorage.getItem("movies")) || [];

  const editIndex = localStorage.getItem("editIndex");
  if (editIndex !== null) {
    movies[editIndex] = movie; // cập nhật
    localStorage.removeItem("editIndex");
  } else {
    movies.push(movie); // thêm mới
  }

  localStorage.setItem("movies", JSON.stringify(movies));
  alert("Lưu phim thành công!");
  window.location.href = "QuanLyPhim.html";
}

// ---- 5. Nếu ở trang form thì gắn sự kiện ---- //
function initForm() {
  const form = document.querySelector("form.form-container");
  if (form) {
    form.addEventListener("submit", handleFormSubmit);

    // nếu đang sửa, điền sẵn thông tin
    const editIndex = localStorage.getItem("editIndex");
    if (editIndex !== null) {
      const movies = JSON.parse(localStorage.getItem("movies")) || [];
      const m = movies[editIndex];
      if (m) {
        form.querySelector('input[placeholder="Enter name"]').value = m.tenPhim;
        form.querySelector('input[placeholder="Enter english name"]').value = m.tenPhimEN;
        form.querySelector("textarea").value = m.moTa;
        form.querySelectorAll("select")[4].value = m.theLoai;
        form.querySelectorAll("select")[5].value = m.daoDien;
        form.querySelector('input[type="date"]').value = m.ngayChieu;
      }
    }
  }
}

// ---- 6. Tự động chạy khi tải trang ---- //
window.addEventListener("DOMContentLoaded", () => {
  loadMovies();
  initForm();
});
