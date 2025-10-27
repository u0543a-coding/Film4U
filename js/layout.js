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

                // Handle user login status
                const accountLink = document.getElementById("account-link");
                const myTicketsLink = document.getElementById("my-tickets-link");
                const ticketCount = document.getElementById("ticket-count");
                const loggedInUser = sessionStorage.getItem("loggedInUser");

                if (loggedInUser) {
                    const user = JSON.parse(loggedInUser);
                    accountLink.textContent = user.fullName;
                    accountLink.href = "user-info.html"; 

                    // Handle My Tickets cart
                    myTicketsLink.style.display = 'list-item'; // Show the link
                    const myTickets = JSON.parse(sessionStorage.getItem('myTickets')) || [];
                    if (myTickets.length > 0) {
                        ticketCount.textContent = `(${myTickets.length})`;
                    } else {
                        ticketCount.textContent = '';
                    }
                    // For now, link to the user-info page to see booking history (a future feature)
                    myTicketsLink.href = "my-tickets.html";

                } else {
                    // When not logged in, the link correctly points to login.html by default
                    accountLink.href = "login.html";
                    myTicketsLink.style.display = 'none'; // Hide the link
                }
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