document.addEventListener('DOMContentLoaded', () => {
    const statusBadge = document.getElementById('status-badge');
    
    // Giả lập kiểm tra kết nối tới Server
    fetch('/')
        .then(response => {
            if (response.ok) {
                statusBadge.textContent = 'Đã kết nối tới Server thành công!';
                statusBadge.style.background = '#27ae60';
            }
        })
        .catch(err => {
            statusBadge.textContent = 'Không thể kết nối tới Server';
            statusBadge.style.background = '#c0392b';
        });
});