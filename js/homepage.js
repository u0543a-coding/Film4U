// Homepage script: fetch movies and render into the static .movie-grid containers
document.addEventListener('DOMContentLoaded', () => {
    const API = 'http://localhost:3000/movies';

    const fetchMovies = async () => {
        try {
            const res = await fetch(API);
            if (!res.ok) throw new Error('Network response was not ok');
            return await res.json();
        } catch (err) {
            console.error('Fetch movies error:', err);
            return [];
        }
    };

    const renderMovieCard = (movie) => {
        const img = movie.poster_url || movie.image || '';
        const title = movie.title || movie.name || 'Không có tiêu đề';
        const duration = movie.duration_minutes ?? movie.duration ?? '';
        const rawDate = movie.release_date || movie.releaseDate || '';
        let release = '';
        if (rawDate) {
            try { release = new Date(rawDate).toLocaleDateString('vi-VN'); } catch (e) { release = rawDate; }
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'movie-card';
        wrapper.innerHTML = `
            <img src="${img}" alt="${title}">
            <h4>${title}</h4>
            <p>${duration ? duration + ' phút' : ''}${duration && release ? ' | ' : ''}${release}</p>
            <button class="btn red">Đặt vé</button>
        `;
        return wrapper;
    };

    (async () => {
        const movies = await fetchMovies();
        if (!movies.length) return;

        const nowGrid = document.querySelectorAll('.movie-section')[0]?.querySelector('.movie-grid');
        const comingGrid = document.querySelectorAll('.movie-section')[1]?.querySelector('.movie-grid');

        // Filter by status if present in JSON
        const nowShowing = movies.filter(m => m.status === 'now_showing');
        const comingSoon = movies.filter(m => m.status === 'coming_soon');

        // If no status fields, just split first half/second half to show something
        if (nowShowing.length === 0 && comingSoon.length === 0) {
            const half = Math.ceil(movies.length / 2);
            nowShowing.push(...movies.slice(0, half));
            comingSoon.push(...movies.slice(half));
        }

        if (nowGrid) {
            nowGrid.innerHTML = '';
            nowShowing.forEach(m => nowGrid.appendChild(renderMovieCard(m)));
        }
        if (comingGrid) {
            comingGrid.innerHTML = '';
            comingSoon.forEach(m => comingGrid.appendChild(renderMovieCard(m)));
        }
    })();
});