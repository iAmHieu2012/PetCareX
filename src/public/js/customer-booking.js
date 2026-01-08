const apiBaseUrl = 'http://localhost:5000/api';

// Get branch list
async function loadBranches() {
    try {
        const response = await fetch(`${apiBaseUrl}/branches`);
        const data = await response.json();
        
        if (data.success && data.branches) {
            const branchSelect = document.getElementById('MaChiNhanh');
            
            data.branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.MaChiNhanh;
                option.text = `${branch.MaChiNhanh} - ${branch.TenChiNhanh}`;
                branchSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading branches:', error);
        alert('Lỗi tải danh sách chi nhánh');
    }
}

// Handle booking form submission
async function handleBookingSubmit(e) {
    e.preventDefault();
    
    const maKhachHang = document.getElementById('MaKhachHang').value;
    const maThuCung = document.getElementById('MaThuCung').value;
    const maChiNhanh = document.getElementById('MaChiNhanh').value;
    const loaiLichHen = document.getElementById('LoaiLichHen').value;
    const thoiGian = document.getElementById('ThoiGian').value;
    const ghiChu = document.getElementById('GhiChu').value;
    
    try {
        const response = await fetch(`${apiBaseUrl}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                MaKhachHang: maKhachHang,
                MaThuCung: maThuCung,
                MaChiNhanh: maChiNhanh,
                LoaiLichHen: loaiLichHen,
                ThoiGian: new Date(thoiGian).toISOString(),
                GhiChu: ghiChu
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('bookingId').textContent = data.bookingId;
            document.getElementById('successMessage').style.display = 'block';
            document.getElementById('errorMessage').style.display = 'none';
            
            // Reset form
            document.getElementById('bookingForm').reset();
            
            // Auto-fill customer ID for search
            document.getElementById('searchCustomer').value = maKhachHang;
            
            // Load bookings after success
            setTimeout(() => {
                handleSearchCustomerBookings();
            }, 1500);
        } else {
            document.getElementById('errorMessage').textContent = '❌ ' + (data.message || 'Lỗi tạo lịch hẹn');
            document.getElementById('errorMessage').style.display = 'block';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('errorMessage').textContent = '❌ Lỗi kết nối server';
        document.getElementById('errorMessage').style.display = 'block';
    }
}

// Search customer bookings
async function handleSearchCustomerBookings() {
    const maKhachHang = document.getElementById('searchCustomer').value.trim();
    
    if (!maKhachHang) {
        alert('Nhập mã khách hàng');
        return;
    }
    
    try {
        const response = await fetch(`${apiBaseUrl}/bookings/customer/${maKhachHang}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.bookings) {
            displayCustomerBookings(data.bookings);
        } else {
            document.getElementById('bookingList').innerHTML = '<p class="no-data">Không tìm thấy lịch hẹn</p>';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Lỗi tải lịch hẹn');
    }
}

// Display customer bookings
function displayCustomerBookings(bookings) {
    const container = document.getElementById('bookingList');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-data">Không có lịch hẹn nào</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <h3>Lịch hẹn #${booking.MaLichHen}</h3>
                <span class="status-badge status-${booking.TrangThai.toLowerCase().replace(/\s+/g, '-')}">
                    ${booking.TrangThai}
                </span>
            </div>
            <div class="booking-details">
                <p><strong>Thú Cưng:</strong> ${booking.MaThuCung}</p>
                <p><strong>Chi Nhánh:</strong> ${booking.MaChiNhanh}</p>
                <p><strong>Dịch Vụ:</strong> ${booking.LoaiLichHen}</p>
                <p><strong>Thời Gian:</strong> ${new Date(booking.ThoiGian).toLocaleString('vi-VN')}</p>
                ${booking.GhiChu ? `<p><strong>Ghi Chú:</strong> ${booking.GhiChu}</p>` : ''}
            </div>
            <div class="booking-actions">
                ${booking.TrangThai === 'Chờ xác nhận' ? `
                    <button class="btn btn-danger" onclick="cancelBooking('${booking.MaLichHen}', '${booking.MaChiNhanh}')">Hủy Lịch</button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Cancel booking
async function cancelBooking(maLichHen, maChiNhanh) {
    if (!confirm('Bạn chắc chắn muốn hủy lịch hẹn này?')) return;
    
    try {
        const response = await fetch(`${apiBaseUrl}/bookings/cancel`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                MaLichHen: maLichHen,
                MaChiNhanh: maChiNhanh
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✓ Đã hủy lịch hẹn');
            handleSearchCustomerBookings();
        } else {
            alert('❌ ' + (data.message || 'Lỗi hủy lịch'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi kết nối server');
    }
}

// Logout function
function logout() {
    if (confirm('Bạn chắc chắn muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập');
        window.location.href = '/login.html';
        return;
    }
    
    // Auto-detect role and redirect if staff
    const userRole = localStorage.getItem('userRole');
    const staffRoles = ['NhanVien', 'Tiếp tân', 'BacSiThuY', 'NhanVienBanHang'];
    
    if (staffRoles.includes(userRole)) {
        window.location.href = '/staff-booking.html';
        return;
    }
    
    // Load branches
    await loadBranches();
    
    // Setup form submit handler
    document.getElementById('bookingForm').addEventListener('submit', handleBookingSubmit);
    
    // Setup search button
    document.getElementById('searchBtn').addEventListener('click', handleSearchCustomerBookings);
    
    // Auto-fill customer ID if available
    const maKhachHang = localStorage.getItem('maKhachHang');
    if (maKhachHang) {
        document.getElementById('MaKhachHang').value = maKhachHang;
        document.getElementById('searchCustomer').value = maKhachHang;
    }
});
