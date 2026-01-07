document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault(); // Ngăn trang web tải lại

    const username = document.getElementById('login_username').value;
    const password = document.getElementById('login_password').value;
    const messageDiv = document.getElementById('login_message');
    const btnLogin = document.getElementById('login_btn');

    // Hiện trạng thái đang xử lý
    messageDiv.innerText = "";
    btnLogin.innerText = "Đang kiểm tra...";
    btnLogin.disabled = true;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                loginIdentifier: username, 
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            // 1. Lưu Token và thông tin User vào LocalStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            // 2. Thông báo và chuyển hướng
            alert(`Chào mừng ${data.user.name} (${data.user.role}) quay trở lại!`);
            
            // Tùy vào vai trò mà chuyển đến trang tương ứng
            if (data.user.role === 'Admin' || data.user.role === 'QuanLi') {
                window.location.href = '/dashboard.html';
            } else {
                window.location.href = '/user-profile.html';
            }
        } else {
            messageDiv.innerText = data.message || "Đăng nhập thất bại!";
        }
    } catch (error) {
        messageDiv.innerText = "Không thể kết nối tới Server!";
        console.error("Lỗi:", error);
    } finally {
        btnLogin.innerText = "Đăng Nhập";
        btnLogin.disabled = false;
    }
});

function togglePass(inputId, iconId) {
    const passwordInput = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        icon.classList.replace('fa-eye-slash', 'fa-eye');
    }
}