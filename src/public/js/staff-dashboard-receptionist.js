import { api } from './api.js';

const state = {
    maNhanVien: localStorage.getItem('maNhanVien'),
    maChiNhanh: null,
    bookings: [],
    selectedBooking: null
};

// --- HÀM BỔ TRỢ (HELPER FUNCTIONS) ---

// Xác định màu sắc thẻ dựa trên trạng thái
const getStatusClass = (status) => {
    if (status.includes('Chờ')) return 'pending';
    if (status.includes('Xác')) return 'confirmed';
    return 'completed';
};

// Gọi API nhanh (Dùng cho phần lấy lịch sử thú cưng)
async function apiCall(endpoint) {
    return fetch(endpoint).then(res => res.json());
}

// --- KHỞI TẠO ---
document.addEventListener('DOMContentLoaded', async () => {
    if (!checkAuth()) return;
    
    setupTabs();
    await loadInitialData();
    setupEventListeners();
});

function checkAuth() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!token || user.role !== 'TiepTan') {
        window.location.href = '/login.html';
        return false;
    }
    document.getElementById('userName').textContent = user.name;
    return true;
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            if (tabId === 'customers') loadCustomers();
            if (tabId === 'bookings') loadAllBookings();
        });
    });
}

async function loadInitialData() {
    try {
        const branches = await api.getBranches();
        const select = document.getElementById('maChiNhanh'); // ID select chi nhánh
        const data = Array.isArray(branches) ? branches : (branches.data || []);
        
        select.innerHTML = data.map(b => `<option value="${b.MaChiNhanh}">${b.TenChiNhanh}</option>`).join('');
        
        if (data.length > 0) {
            state.maChiNhanh = data[0].MaChiNhanh;
            select.value = state.maChiNhanh;
            await loadAllBookings();
        }
    } catch (err) { console.error('Lỗi tải chi nhánh:', err); }
}

async function loadAllBookings() {
    const res = await api.getBookingsByBranch(state.maChiNhanh);
    state.bookings = Array.isArray(res) ? res : (res.data || []);
    
    updateBannerStats(state.bookings);
    renderBookingCards(state.bookings);
}

function updateBannerStats(data) {
    const today = new Date().toDateString();
    document.getElementById('todayBookings').textContent = data.filter(b => new Date(b.ThoiGian).toDateString() === today).length;
    document.getElementById('pendingBookings').textContent = data.filter(b => b.TrangThai === 'Chờ xác nhận').length;
}

function renderBookingCards(data) {
    const container = document.getElementById('bookingList');
    if (!data.length) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Không có lịch hẹn nào.</div>';
        return;
    }

    container.innerHTML = data.map(b => {
        const statusClass = getStatusClass(b.TrangThai);
        return `
            <div class="booking-card ${statusClass}">
                <div class="booking-header">
                    <div class="booking-header-left">
                        <h3 style="color:var(--primary); font-size:1.1rem;">${b.TenThuCung || 'Thú cưng'} <small style="color:#888;">(${b.Loai || ''})</small></h3>
                        <p style="font-size:0.85rem; color:#666;">Khách: ${b.TenKhachHang}</p>
                    </div>
                    <span class="booking-status status-${statusClass}">${b.TrangThai}</span>
                </div>
                <div class="booking-body" style="grid-template-columns: 1fr;">
                    <div class="booking-info-item">
                        <div class="booking-info-label">Dịch vụ</div>
                        <div class="booking-info-value">${b.LoaiLichHen}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Thời gian</div>
                        <div class="booking-info-value">
                            ${new Date(b.ThoiGian).toLocaleDateString('vi-VN')} | 
                            ${new Date(b.ThoiGian).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                        </div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Mã Lịch Hẹn</div>
                        <div class="booking-info-value">${b.MaLichHen}</div>
                    </div>
                </div>
                <div class="booking-actions" style="margin-top:1rem; display:flex; gap:10px;">
                    ${b.TrangThai === 'Chờ xác nhận' ? `
                        <button class="btn-primary" onclick="openConfirmModal('${b.MaLichHen}')" style="flex:1;">Tiếp nhận</button>
                        <button onclick="handleCancel('${b.MaLichHen}')" style="flex:0.5; background:#fee2e2; color:var(--danger); border:none; border-radius:8px; cursor:pointer;">Hủy</button>
                    ` : '<button class="btn-primary" style="width:100%; opacity:0.5;" disabled>Đã xử lý</button>'}
                </div>
            </div>
        `;
    }).join('');
}

// --- LOGIC MODAL XÁC NHẬN ---
window.openConfirmModal = async (maLH) => {
    const booking = state.bookings.find(b => b.MaLichHen === maLH);
    if (!booking) return;
    
    state.selectedBooking = booking;

    const infoDiv = document.getElementById('modalBookingInfo');
    const packageSection = document.getElementById('vaccinePackageSection'); //
    const isTiemPhong = booking.LoaiLichHen.includes("Tiêm");
    
    infoDiv.innerHTML = `
        <div style="display:grid; gap:5px;">
            <p><strong>Mã LH:</strong> ${maLH}</p>
            <p><strong>Thú cưng:</strong> ${booking.TenThuCung}</p>
            <p><strong>Dịch vụ:</strong> <span class="status-badge ${isTiemPhong ? 'status-confirmed' : 'status-pending'}">${booking.LoaiLichHen}</span></p>
        </div>
    `;

    if (isTiemPhong) {
        packageSection.style.display = 'block';
        const packageSelect = document.getElementById('maGoiTiem');
        packageSelect.innerHTML = '<option value="">-- Đang tải gói tiêm... --</option>';
        
        try {
            // Lấy lịch sử gói tiêm từ Backend của khách hàng
            const historyRes = await apiCall(`/api/customer/pets/history/${booking.MaThuCung}`);
            if (historyRes?.success && historyRes.data.packages.length > 0) {
                packageSelect.innerHTML = historyRes.data.packages.map(p => 
                    `<option value="${p.MaGoiTiem}">${p.LoaiGoiTiem} (${p.MaGoiTiem})</option>`
                ).join('');
            } else {
                packageSelect.innerHTML = '<option value="">-- Thú cưng chưa mua gói --</option>';
            }
        } catch (err) {
            packageSelect.innerHTML = '<option value="">-- Lỗi tải dữ liệu gói --</option>';
        }
    } else {
        packageSection.style.display = 'none';
    }

    // Tải danh sách bác sĩ của chi nhánh hiện tại
    const drsResponse = await api.getDoctorsByBranch(state.maChiNhanh);
    const drs = Array.isArray(drsResponse) ? drsResponse : (drsResponse.data || []);
    const drSelect = document.getElementById('selectDoctor'); // Phải khớp với ID trong HTML
    drSelect.innerHTML = '<option value="">-- Chọn bác sĩ phụ trách --</option>' + 
        drs.map(d => `<option value="${d.MaNhanVien}">${d.HoTen}</option>`).join('');

    document.getElementById('doctorSelectionModal').classList.add('active');
};

async function handleFinalConfirm() {
    const bs = document.getElementById('selectDoctor').value;
    const gt = document.getElementById('maGoiTiem')?.value; 
    
    // Lấy dữ liệu từ state.selectedBooking
    const { MaLichHen, MaChiNhanh, MaKhachHang, MaThuCung, LoaiLichHen } = state.selectedBooking;

    // FIX LỖI: Nếu MaChiNhanh từ recordset bị thiếu, dùng mã chi nhánh từ state của dashboard
    const currentBranch = MaChiNhanh || state.maChiNhanh;

    if (!bs) {
        alert("Vui lòng chọn bác sĩ phụ trách!");
        return;
    }

    try {
        let res;
        // TỰ ĐỘNG nhận diện loại phiếu dựa trên LoaiLichHen ban đầu
        if (LoaiLichHen.includes("Tiêm")) {
            // Gọi API xác nhận tiêm phòng
            res = await api.confirmAndCreateVaccinationForm(MaLichHen, currentBranch, MaKhachHang, MaThuCung, bs, gt || null);
        } else {
            // Gọi API xác nhận khám bệnh
            res = await api.confirmAndCreateMedicalForm(MaLichHen, currentBranch, MaKhachHang, MaThuCung, bs);
        }
        
        if (res.success) {
            alert('Xác nhận lịch hẹn thành công!');
            window.closeDoctorModal();
            await loadAllBookings(); // Tải lại danh sách sau khi đổi trạng thái
        } else {
            alert("Lỗi từ máy chủ: " + res.message);
        }
    } catch (err) { 
        alert("Lỗi hệ thống: " + err.message); 
    }
}

window.closeDoctorModal = () => {
    document.getElementById('doctorSelectionModal').classList.remove('active');
};

window.handleCancel = async (id) => {
    if (confirm('Hủy lịch hẹn này?')) {
        try {
            const res = await api.cancelBooking(id, state.maChiNhanh);
            if (res.success) {
                alert('Đã hủy lịch hẹn');
                loadAllBookings();
            }
        } catch (err) { alert("Lỗi khi hủy: " + err.message); }
    }
};

function setupEventListeners() {
    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '/login.html';
    });
    
    // Nút xác nhận trong modal
    document.getElementById('finalConfirmBtn').addEventListener('click', handleFinalConfirm);
    
    // Thay đổi chi nhánh để lọc lịch hẹn
    document.getElementById('maChiNhanh').addEventListener('change', (e) => {
        state.maChiNhanh = e.target.value;
        loadAllBookings();
    });
}

// Load danh sách khách hàng duy nhất của chi nhánh
async function loadCustomers() {
    const res = await api.getBookingsByBranch(state.maChiNhanh);
    const data = Array.isArray(res) ? res : (res.data || []);
    
    // Lọc khách hàng duy nhất từ danh sách lịch hẹn
    const uniqueKH = {};
    data.forEach(b => { 
        if(!uniqueKH[b.MaKhachHang]) {
            uniqueKH[b.MaKhachHang] = {
                MaKhachHang: b.MaKhachHang,
                TenKhachHang: b.TenKhachHang,
                SoDienThoai: b.SoDienThoai
            };
        }
    });
    
    const container = document.getElementById('customerList');
    const customers = Object.values(uniqueKH);
    
    if (customers.length === 0) {
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Chưa có khách hàng nào.</div>';
        return;
    }

    container.innerHTML = customers.map(c => `
        <div class="booking-card" style="border-left:none; border-top:4px solid var(--primary);">
            <div class="booking-header">
                <h3>${c.TenKhachHang}</h3>
            </div>
            <div class="booking-body" style="grid-template-columns: 1fr; border:none; padding:0; margin:0;">
                <p><strong>SĐT:</strong> ${c.SoDienThoai}</p>
                <p><strong>Mã KH:</strong> ${c.MaKhachHang}</p>
            </div>
            <div style="margin-top:1rem; border-top:1px solid #eee; padding-top:10px; text-align:center;">
                <button class="btn-primary" style="width:100%; font-size:0.8rem; padding:0.5rem;" onclick="alert('Tính năng đang phát triển')">
                    Hồ Sơ Chi Tiết
                </button>
            </div>
        </div>
    `).join('');
}

// Xuất các hàm ra window để các thuộc tính onclick trong HTML hoạt động
window.openConfirmModal = openConfirmModal;
window.handleCancel = handleCancel;
window.closeDoctorModal = closeDoctorModal;