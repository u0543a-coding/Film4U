// Slide banner
const images = [
  "https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/07/26020212/poster-phim-hanh-dong.jpg",
  "https://designercomvn.s3.ap-southeast-1.amazonaws.com/wp-content/uploads/2017/07/26020157/poster-phim-kinh-di.jpg",
];
let current = 0;
function nextImage() {
  current = (current + 1) % images.length;
  document.getElementById("bannerImage").src = images[current];
}
function prevImage() {
  current = (current - 1 + images.length) % images.length;
  document.getElementById("bannerImage").src = images[current];
}

// Lấy dữ liệu từ JSON Server
// -- Hiển thị mục 
fetch("http://localhost:3000/movies")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    return response.json();
  })
  .then((data) => {
    // Xâu chuỗi dữ liệu thành HTML, đảm bảo chỉ hiển thị tối đa 4 phim
    const movieGrid = document.querySelector(".movie-grid");
    let html = "";
    data.slice(0, 4).forEach((movie) => {
      html += `
          <div class="movie-card">
              <img src="${movie.poster_url}" alt="${movie.title}">
              <h4>${movie.title}</h4>
              <p>${movie.duration_minutes} phút | ${movie.release_date}</p>
              <button class="btn red">Đặt vé</button>
          </div>
          `;
    });
    movieGrid.innerHTML = html;
    console.log(data);
  })
  .catch((error) => {
    console.error(
      "There has been a problem with your fetch operation: ",
      error
    );
  });