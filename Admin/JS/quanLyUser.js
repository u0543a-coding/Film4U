// Lấy danh sách người dùng từ localStorage (nếu có)
let users = JSON.parse(localStorage.getItem("users")) || [];

// Sinh ID ngẫu nhiên
function generateID() {
  return "U" + Math.floor(Math.random() * 100000);
}

// ======= HIỂN THỊ DANH SÁCH NGƯỜI DÙNG =======
function renderUsers() {
  const tbody = document.querySelector("#userTable tbody");
  tbody.innerHTML = users
    .map(
      (user, index) => `
      <tr>
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.email}</td>
        <td>${user.gender}</td>
        <td>${user.dob}</td>
        <td>${user.district}</td>
        <td>
          <button onclick="editUser(${index})">Sửa</button>
          <button onclick="deleteUser(${index})">Xóa</button>
        </td>
      </tr>
    `
    )
    .join("");
}

// ======= THÊM NGƯỜI DÙNG =======
document.getElementById("userForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const id = generateID();
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const gender = document.getElementById("gender").value;
  const dob = document.getElementById("dob").value;
  const district = document.getElementById("district").value;

  // Kiểm tra trùng email
  if (users.some((u) => u.email === email)) {
    alert("Email này đã tồn tại!");
    return;
  }

  // Lưu user mới
  users.push({ id, name, email, gender, dob, district });
  localStorage.setItem("users", JSON.stringify(users));

  renderUsers();
  e.target.reset(); // Xóa nội dung form
});

// ======= XÓA NGƯỜI DÙNG =======
function deleteUser(index) {
  if (confirm("Bạn có chắc muốn xóa người dùng này không?")) {
    users.splice(index, 1);
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  }
}

// ======= SỬA NGƯỜI DÙNG =======
function editUser(index) {
  const user = users[index];
  const newName = prompt("Nhập tên mới:", user.name);
  const newEmail = prompt("Nhập email mới:", user.email);
  const newGender = prompt("Giới tính (Nam/Nữ/Khác):", user.gender);
  const newDob = prompt("Ngày sinh (yyyy-mm-dd):", user.dob);
  const newDistrict = prompt("Nhập quận:", user.district);

  if (newName && newEmail && newGender && newDob && newDistrict) {
    users[index] = {
      ...user,
      name: newName,
      email: newEmail,
      gender: newGender,
      dob: newDob,
      district: newDistrict,
    };
    localStorage.setItem("users", JSON.stringify(users));
    renderUsers();
  }
}

// ======= GỌI LẦN ĐẦU =======
renderUsers();
