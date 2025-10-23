async function loadData() {
  const res = await fetch("../json/db.json"); // Đường dẫn chính xác
  const data = await res.json();

  const cinemaSelect = document.querySelector(".datve-cinema-select");
  const movieContainer = document.querySelector(".datve-movie-box");

  cinemaSelect.addEventListener("change", () => {
    const selectedCinemaID = parseInt(cinemaSelect.value)   ;
    const cinema = data.cinemas.find(c => c.id === selectedCinemaID);
    if (!cinema) return;

    const rooms = data.cinema_rooms.filter(r => r.cinemaId === cinema.id);
    const showtimes = data.showtimes.filter(st =>
      rooms.some(r => r.id === st.roomId)
    );
    const movieIds = [...new Set(showtimes.map(st => st.movieId))];
    const movies = data.movies.filter(m => movieIds.includes(m.id));

    movieContainer.innerHTML = movies.map(movie => `
      <div class="movie-card">
        <img src="${movie.poster_url}" alt="${movie.title}" />
        <div class="movie-info">
          <h3>${movie.title}</h3>
          <p>${movie.duration_minutes} phút | ${movie.director}</p>
          <div class="showtimes">
            ${showtimes.filter(st => st.movieId === movie.id)
              .map(st => {
                const time = new Date(st.startTime).toLocaleTimeString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit"
                });
                return `<button>${time}</button>`;
              }).join("")}
          </div>
        </div>
      </div>
    `).join('');
  });
}

loadData();