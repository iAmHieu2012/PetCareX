// API Calls
const api = {
    createBookingStaff: (data) =>
        fetch('/api/bookings/staff/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        }).then(res => res.json()),
    
    getBookingsByBranch: (maChiNhanh) =>
        fetch(`/api/bookings/branch/${maChiNhanh}`)
            .then(res => res.json()),
    
    confirmBooking: (maLichHen, maChiNhanh) =>
        fetch('/api/bookings/confirm', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maLichHen, maChiNhanh })
        }).then(res => res.json()),
    
    cancelBooking: (maLichHen, maChiNhanh) =>
        fetch('/api/bookings/cancel', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ maLichHen, maChiNhanh })
        }).then(res => res.json()),
    
    getBranches: () =>
        fetch('/api/branches')
            .then(res => res.json())
};

// DOM Elements
const staffBookingForm = document.getElementById('staffBookingForm');
const staffSuccessMessage = document.getElementById('staffSuccessMessage');
const staffErrorMessage = document.getElementById('staffErrorMessage');
const staffBookingId = document.getElementById('staffBookingId');
const staffPDVInfo = document.getElementById('staffPDVInfo');
const searchBranch = document.getElementById('searchBranch');
const searchBranchBtn = document.getElementById('searchBranchBtn');
const branchBookingList = document.getElementById('branchBookingList');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Kiểm tra xem user đã login là nhân viên chưa
    const userRole = localStorage.getItem('userRole');
    const maNhanVien = localStorage.getItem('maNhanVien');
    
    if (!userRole || !maNhanVien) {
        window.location.href = '/login.html';
        return;
    }
    
    loadBranches();
    setupEventListeners();
});

// Setup Event Listeners
function setupEventListeners() {
    staffBookingForm.addEventListener('submit', handleStaffBookingSubmit);
    searchBranchBtn.addEventListener('click', handleSearchBranchBookings);
    searchBranch.addEventListener('change', handleSearchBranchBookings);
}

// Load branches
async function loadBranches() {
    try {
        const branches = await api.getBranches();
        const select1 = document.getElementById('staffMaChiNhanh');
        const select2 = document.getElementById('searchBranch');
        
        if (Array.isArray(branches)) {
            branches.forEach(branch => {
                const option1 = document.createElement('option');
                option1.value = branch.MaChiNhanh;
                option1.textContent = branch.TenChiNhanh;
                select1.appendChild(option1);
                
                const option2 = document.createElement('option');
                option2.value = branch.MaChiNhanh;
                option2.textContent = branch.TenChiNhanh;
                select2.appendChild(option2);
            });
        }
    } catch (err) {
        console.error('Lỗi tải danh sách chi nhánh:', err);
    }
}

// Handle form submission - NHÂN VIÊN
async function handleStaffBookingSubmit(e) {
    e.preventDefault();
    
    staffSuccessMessage.style.display = 'none';
    staffErrorMessage.style.display = 'none';
    
    const formData = {
        MaKhachHang: document.getElementById('staffMaKhachHang').value,
        MaThuCung: document.getElementById('staffMaThuCung').value,
        MaChiNhanh: document.getElementById('staffMaChiNhanh').value,
        LoaiLichHen: document.getElementById('staffLoaiLichHen').value,
        ThoiGian: document.getElementById('staffThoiGian').value,
        MaNhanVienXacNhan: document.getElementById('staffMaNhanVien').value || null,
        TrangThai: document.getElementById('staffTrangThai').value
    };
    
    try {
        const response = await api.createBookingStaff(formData);
        
        if (response.success) {
            staffBookingId.textContent = response.maLichHen;
            
            let infoText = '';
            if (response.maPhieuDichVu) {
                infoText = `<br>Phiếu dịch vụ được tạo: <strong>${response.maPhieuDichVu}</strong>`;
            }
            staffPDVInfo.innerHTML = infoText;
            staffSuccessMessage.style.display = 'block';
            staffBookingForm.reset();
            
            setTimeout(() => {
                staffSuccessMessage.style.display = 'none';
            }, 5000);
        } else {
            showError(response.message || 'Có lỗi xảy ra');
        }
    } catch (err) {
        showError('Lỗi: ' + err.message);
    }
}

// Handle search branch bookings
async function handleSearchBranchBookings() {
    const maChiNhanh = searchBranch.value;
    
    if (!maChiNhanh) {
        showError('Vui lòng chọn chi nhánh');
        return;
    }
    
    try {
        branchBookingList.innerHTML = '<p class="loading">Đang tải...</p>';
        
        const response = await api.getBookingsByBranch(maChiNhanh);
        
        if (response.success && Array.isArray(response.data)) {
            displayStaffBookings(response.data);
        } else {
            branchBookingList.innerHTML = '<p class="no-data">Không tìm thấy lịch hẹn nào</p>';
        }
    } catch (err) {
        branchBookingList.innerHTML = '<p class="error">Lỗi: ' + err.message + '</p>';
    }
}

// Display bookings for staff
function displayStaffBookings(bookings) {
    if (bookings.length === 0) {
        branchBookingList.innerHTML = '<p class="no-data">Không có lịch hẹn nào</p>';
        return;
    }
    
    branchBookingList.innerHTML = bookings.map(booking => `
        <div class="booking-card" data-status="${booking.TrangThai}">
            <div class="booking-header">
                <h3>🐾 ${booking.TenThuCung}</h3>
                <span class="status-badge status-${getStatusClass(booking.TrangThai)}">
                    ${booking.TrangThai}
                </span>
            </div>
            
            <div class="booking-info">
                <p><strong>Mã Lịch Hẹn:</strong> ${booking.MaLichHen}</p>
                <p><strong>Khách Hàng:</strong> ${booking.TenKhachHang}</p>
                <p><strong>Số ĐT:</strong> ${booking.SoDienThoai}</p>
                <p><strong>Loài Vật:</strong> ${booking.Loai}</p>
                <p><strong>Dịch Vụ:</strong> ${booking.LoaiLichHen}</p>
                <p><strong>Thời Gian:</strong> ${formatDateTime(booking.ThoiGian)}</p>
            </div>
            
            <div class="booking-actions">
                ${booking.TrangThai === 'Chờ xác nhận' ? `
                    <button class="btn btn-small btn-success" onclick="confirmBooking('${booking.MaLichHen}', '${booking.MaChiNhanh}')">
                        ✓ Xác Nhận
                    </button>
                ` : ''}
                ${booking.TrangThai !== 'Đã hủy' ? `
                    <button class="btn btn-small btn-danger" onclick="cancelBookingHandler('${booking.MaLichHen}', '${booking.MaChiNhanh}')">
                        ✗ Hủy
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Confirm booking
async function confirmBooking(maLichHen, maChiNhanh) {
    if (!confirm('Bạn có chắc muốn xác nhận lịch hẹn này?')) return;
    
    try {
        const response = await api.confirmBooking(maLichHen, maChiNhanh);
        
        if (response.success) {
            showSuccess('Xác nhận lịch hẹn thành công');
            setTimeout(() => handleSearchBranchBookings(), 1500);
        } else {
            showError(response.message || 'Có lỗi xảy ra');
        }
    } catch (err) {
        showError('Lỗi: ' + err.message);
    }
}

// Cancel booking
async function cancelBookingHandler(maLichHen, maChiNhanh) {
    if (!confirm('Bạn có chắc muốn hủy lịch hẹn này?')) return;
    
    try {
        const response = await api.cancelBooking(maLichHen, maChiNhanh);
        
        if (response.success) {
            showSuccess('Hủy lịch hẹn thành công');
            setTimeout(() => handleSearchBranchBookings(), 1500);
        } else {
            showError(response.message || 'Có lỗi xảy ra');
        }
    } catch (err) {
        showError('Lỗi: ' + err.message);
    }
}

// Show error/success messages
function showError(message) {
    staffErrorMessage.textContent = message;
    staffErrorMessage.style.display = 'block';
    
    setTimeout(() => {
        staffErrorMessage.style.display = 'none';
    }, 5000);
}

function showSuccess(message) {
    const successMsg = document.createElement('div');
    successMsg.className = 'message message-success';
    successMsg.textContent = '✓ ' + message;
    document.body.appendChild(successMsg);
    
    setTimeout(() => successMsg.remove(), 3000);
}

// Get status class
function getStatusClass(status) {
    switch(status) {
        case 'Đã xác nhận': return 'confirmed';
        case 'Chờ xác nhận': return 'pending';
        case 'Đã hủy': return 'cancelled';
        default: return 'pending';
    }
}

// Format datetime
function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Logout
function logout() {
    if (confirm('Bạn có chắc muốn đăng xuất?')) {
        localStorage.clear();
        window.location.href = '/login.html';
    }
}
