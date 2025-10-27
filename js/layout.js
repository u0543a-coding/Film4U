document.addEventListener("DOMContentLoaded", function() {
    const headerPlaceholder = document.getElementById("header-placeholder");
    const footerPlaceholder = document.getElementById("footer-placeholder");

    if (headerPlaceholder) {
        fetch("header.html")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;

                const searchForm = document.querySelector(".navbar-search");
                const searchInput = document.getElementById("search-input");

                if (searchForm && searchInput) {
                    searchForm.addEventListener("submit", (event) => {
                        event.preventDefault();
                        const query = searchInput.value.trim();
                        if (query) {
                            window.location.href = `homepage.html?search=${encodeURIComponent(query)}`;
                        }
                    });
                }
                document.dispatchEvent(new Event('headerLoaded'));
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation for the header:', error);
            });
    }

    if (footerPlaceholder) {
        fetch("footer.html")
            .then(response => {
                if (!response.ok) {
                    throw new Error("Network response was not ok " + response.statusText);
                }
                return response.text();
            })
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(error => {
                console.error('There has been a problem with your fetch operation for the footer:', error);
            });
    }
});