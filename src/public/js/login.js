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
            localStorage.setItem('userRole', data.user.role);
            localStorage.setItem('maKhachHang', data.maKhachHang || '');
            localStorage.setItem('maNhanVien', data.maNhanVien || '');

            // 2. Thông báo và chuyển hướng
            alert(`Chào mừng ${data.user.name} (${data.user.role}) quay trở lại!`);
            
            // 3. Chuyển tới trang phù hợp theo role
            const role = data.user.role;
            
            if (role === 'KhachHang') {
                window.location.href = '/customer-dashboard.html';
            } else if (role === 'Admin') {
                window.location.href = '/dashboard.html'; // Admin dashboard
            } else {
                // Default fallback
                window.location.href = '/staff-booking.html';
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