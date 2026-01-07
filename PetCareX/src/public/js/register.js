document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Lấy dữ liệu từ các ID đã có trong HTML của bạn
    const fullName = document.getElementById('register_fullname').value;
    const phone = document.getElementById('register_phone').value;
    const username = document.getElementById('register_username').value;
    const email = document.getElementById('register_email').value;
    const cccd = document.getElementById('register_cccd').value;
    const gender = document.getElementById('register_gender').value;
    const password = document.getElementById('register_password').value;
    
    const messageDiv = document.getElementById('register_message');
    const btn = document.getElementById('register_btn');

    // Reset thông báo
    messageDiv.innerText = "Đang xử lý...";
    btn.disabled = true;

    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                username, 
                password, 
                email, 
                fullName, 
                phone,
                cccd,
                gender
            })
        });

        const data = await response.json();

        if (response.ok) {
            messageDiv.style.color = "green";
            messageDiv.innerText = "Đăng ký thành công! Đang chuyển hướng...";
            setTimeout(() => window.location.href = 'index.html', 2000);
        } else {
            messageDiv.style.color = "red";
            messageDiv.innerText = data.message || "Lỗi đăng ký!";
        }
    } catch (error) {
        console.error("Lỗi Fetch:", error);
        messageDiv.innerText = "Không thể kết nối đến máy chủ!";
    } finally {
        btn.disabled = false;
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