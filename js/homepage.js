// Lấy dữ liệu từ JSON Server
const fetchData = async () => {
    try {
        const response = await fetch ('http://localhost:3000/products')
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch error: ', error);
        return [];
    }

};

// Hiển thị sản phẩm lên trang chủ
const displayProducts = async () => {
    const products = await fetchData();
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';
    products.forEach(product => {
        const productItem = document.createElement('div');
        productItem.className = 'product-item';
        productItem.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>Price: $${product.price}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        productList.appendChild(productItem);
    });

    // Thêm sự kiện cho nút "Add to Cart"
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const productId = button.getAttribute('data-id');
            addToCart(productId);
        });
    });
};