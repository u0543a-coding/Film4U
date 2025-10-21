// auth.js - handles register / login / session using localStorage + sessionStorage
(function(){
  'use strict';

  // ===== Helpers =====
  function qs(id){ return document.getElementById(id); }
  function toast(msg){ alert(msg); } // Simple alert; you can upgrade to Bootstrap toasts

  // ===== Convert text -> SHA-256 hash (hex) =====
  async function hashPassword(password){
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ===== Password toggle =====
  const t1 = qs('toggleRegPass');
  if (t1) t1.addEventListener('click', () => {
    const ip = qs('regPass');
    if (ip.type === 'password') {
      ip.type = 'text';
      t1.querySelector('i').classList.replace('fa-eye','fa-eye-slash');
    } else {
      ip.type = 'password';
      t1.querySelector('i').classList.replace('fa-eye-slash','fa-eye');
    }
  });

  const t2 = qs('toggleLoginPass');
  if (t2) t2.addEventListener('click', () => {
    const ip = qs('loginPass');
    if (ip.type === 'password') {
      ip.type = 'text';
      t2.querySelector('i').classList.replace('fa-eye','fa-eye-slash');
    } else {
      ip.type = 'password';
      t2.querySelector('i').classList.replace('fa-eye-slash','fa-eye');
    }
  });

  const t3 = qs('toggleRegPassConfirm');
  if (t3) t3.addEventListener('click', () => {
    const ip = qs('regPassConfirm');
    if (ip.type === 'password') {
      ip.type = 'text';
      t3.querySelector('i').classList.replace('fa-eye','fa-eye-slash');
    } else {
      ip.type = 'password';
      t3.querySelector('i').classList.replace('fa-eye-slash','fa-eye');
    }
  });

  // ===== Register =====
  const regForm = qs('registerForm');
  if (regForm){
    regForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = qs('regName').value.trim();
      const pass = qs('regPass').value.trim();
      const confirm = qs('regPassConfirm') ? qs('regPassConfirm').value.trim() : '';

      if (!name || !pass || !confirm) {
        toast('Điền đủ thông tin nhé.');
        return;
      }
      if (pass.length < 6) {
        toast('Mật khẩu phải >= 6 ký tự.');
        return;
      }
      if (pass !== confirm) {
        toast('Mật khẩu xác nhận không khớp.');
        qs('regPassConfirm').classList.add('is-invalid');
        return;
      } else {
        qs('regPassConfirm').classList.remove('is-invalid');
      }

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      if (users.find(u => u.name === name)) {
        toast('Tên đăng nhập đã tồn tại.');
        return;
      }

      const passHash = await hashPassword(pass);
      const newUser = { id: Date.now(), name, pass: passHash };
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));

      toast('Đăng ký thành công! Chuyển sang trang đăng nhập.');
      window.location.href = 'login.html';
    });
  }

  // ===== Login =====
  const loginForm = qs('loginForm');
  if (loginForm){
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = qs('loginName').value.trim();
      const pass = qs('loginPass').value.trim();
      const users = JSON.parse(localStorage.getItem('users') || '[]');

      const passHash = await hashPassword(pass);
      const found = users.find(u => u.name === name && u.pass === passHash);
      if (!found){
        toast('Sai tên hoặc mật khẩu.');
        return;
      }

      sessionStorage.setItem('loggedInUser', JSON.stringify(found));
      window.location.href = 'index.html';
    });
  }

  // ===== Dashboard / index page =====
  const welcome = qs('welcomeText');
  if (welcome){
    const user = JSON.parse(sessionStorage.getItem('loggedInUser') || 'null');
    if (!user){
      window.location.href = 'login.html';
      return;
    }
    qs('navUsername').textContent = user.name;
    welcome.textContent = `Xin chào, ${user.name}`;
    qs('userInfo').textContent = `ID: ${user.id} — Tên: ${user.name}`;

    // Logout
    qs('logoutBtn').addEventListener('click', () => {
      sessionStorage.removeItem('loggedInUser');
      window.location.href = 'login.html';
    });
  }

})();
