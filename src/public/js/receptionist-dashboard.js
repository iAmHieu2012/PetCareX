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
    await loadAllPendingConfirmationInvoices(); // Load hóa đơn chờ xác nhận khi vào tab
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
        btn.addEventListener('click', async () => {
            const tabId = btn.dataset.tab;
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            if (tabId === 'customers') loadCustomers();
            if (tabId === 'bookings') loadAllBookings();
            if (tabId === 'payment-confirmation') await loadAllPendingConfirmationInvoices();
            if (tabId === 'my-confirmed') await loadMyConfirmedInvoices();
        });
    });
}

async function loadInitialData() {
    try {
        const branchesRes = await api.getBranches();
        const branches = branchesRes.data || branchesRes;
        const branchesData = Array.isArray(branches) ? branches : (branchesRes.data || []);
        
        const select = document.getElementById('maChiNhanh');
        
        select.innerHTML = branchesData.map(b => `<option value="${b.MaChiNhanh}">${b.TenChiNhanh}</option>`).join('');
        
        if (branchesData.length > 0) {
            state.maChiNhanh = branchesData[0].MaChiNhanh;
            select.value = state.maChiNhanh;
            await loadAllBookings();
        }
    } catch (err) { console.error('Lỗi tải chi nhánh:', err); }
}

async function loadAllBookings() {
    const res = await api.getBookingsByBranch(state.maChiNhanh);
    const bookingsData = res.data || res || [];
    state.bookings = Array.isArray(bookingsData) ? bookingsData : [];
    
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
            const historyRes = await apiCall(`/api/pets/history/${booking.MaThuCung}`);
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
    const { MaLichHen, MaChiNhanh, MaKhachHang, MaThuCung, LoaiLichHen, ThoiGian } = state.selectedBooking;

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
            res = await api.confirmAndCreateVaccinationForm({
                maLichHen: MaLichHen,
                maChiNhanh: currentBranch,
                maKhachHang: MaKhachHang,
                maThuCung: MaThuCung,
                maBacSi: bs,
                goiTiem: gt || null,
                ngayTiem: ThoiGian
            });
        } else {
            // Gọi API xác nhận khám bệnh
            res = await api.confirmAndCreateMedicalForm({
                maLichHen: MaLichHen,
                maChiNhanh: currentBranch,
                maKhachHang: MaKhachHang,
                maThuCung: MaThuCung,
                maBacSi: bs
            });
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

// Load tất cả hóa đơn chờ xác nhận (loại trừ PHIEU_MUA_HANG - chỉ khám bệnh, tiêm phòng, gói tiêm)
async function loadAllPendingConfirmationInvoices() {
    try {
        const res = await api.getAllPendingConfirmationInvoices();
        const allInvoices = res.data || res || [];
        
        // FILTER: Loại trừ PHIEU_MUA_HANG (retail) - chỉ lấy các hóa đơn từ khám bệnh, tiêm phòng, đăng ký gói tiêm
        const invoices = allInvoices.filter(inv => inv.LoaiPhieu !== 'retail');
        
        const container = document.getElementById('paymentConfirmationList');
        
        if (!invoices.length) {
            container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:2rem; color:#999;">Không có hóa đơn chờ xác nhận.</div>';
            return;
        }

        container.innerHTML = invoices.map(inv => `
            <div class="booking-card" style="border-left:5px solid #ff9500;">
                <div class="booking-header">
                    <div class="booking-header-left">
                        <h3 style="color:var(--primary); font-size:1.1rem;">Mã HĐ: ${inv.MaHoaDon}</h3>
                        <p style="font-size:0.85rem; color:#666;">Khách: ${inv.TenKhachHang} (${inv.MaKhachHang})</p>
                    </div>
                    <span class="booking-status status-pending">Chờ Xác Nhận</span>
                </div>
                <div class="booking-body" style="grid-template-columns: 1fr 1fr 1fr; gap:15px;">
                    <div class="booking-info-item">
                        <div class="booking-info-label">Ngày Lập</div>
                        <div class="booking-info-value">${new Date(inv.NgayLap).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Tổng Tiền</div>
                        <div class="booking-info-value" style="color:#27ae60; font-weight:bold;">${inv.TongTienThanhToan.toLocaleString('vi-VN')} ₫</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Hình Thức</div>
                        <div class="booking-info-value">${inv.HinhThucThanhToan}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Chi Nhánh</div>
                        <div class="booking-info-value">${inv.TenChiNhanh}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">SĐT Khách</div>
                        <div class="booking-info-value">${inv.SoDienThoai}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">CCCD</div>
                        <div class="booking-info-value">${inv.CCCD}</div>
                    </div>
                </div>
                <div class="booking-actions" style="margin-top:1rem; display:flex; gap:10px;">
                    <button class="btn-primary" onclick="window.confirmPaymentAction('${inv.MaHoaDon}', '${inv.NgayLap.split('T')[0]}')" style="flex:1;">
                        <i class="fas fa-check"></i> Xác Nhận Thanh Toán
                    </button>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Lỗi load hóa đơn:', err);
        document.getElementById('paymentConfirmationList').innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Lỗi tải dữ liệu hóa đơn.</div>';
    }
}

// Xác nhận thanh toán
window.confirmPaymentAction = async (maHoaDon, ngayLap) => {
    try {
        const res = await api.confirmPayment({
            maHoaDon: maHoaDon,
            ngayLap: ngayLap,
            maNhanVien: state.maNhanVien,
            hinhThucThanhToan: 'Chuyển khoản' // Default payment method
        });

        if (res.success) {
            alert('Xác nhận thanh toán thành công!');
            await loadAllPendingConfirmationInvoices(); // Tải lại danh sách
        } else {
            alert('Lỗi: ' + (res.message || 'Không xác nhận được'));
        }
    } catch (err) {
        alert('Lỗi hệ thống: ' + err.message);
    }
};

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

// Load danh sách hóa đơn mà nhân viên tiếp tân hiện tại đã xác nhận
async function loadMyConfirmedInvoices() {
    const container = document.getElementById('myConfirmedPaymentList');
    if (!container) return;
    
    try {
        if (!state.maNhanVien) {
            container.innerHTML = '<p style="color:red;">Lỗi: Không tìm thấy mã nhân viên</p>';
            return;
        }

        const res = await api.getConfirmedInvoicesByStaff(state.maNhanVien);
        const invoices = res.data || [];

        if (invoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align:center; padding:2rem; color:#999;">
                    <i class="fas fa-inbox"></i>
                    <p>Bạn chưa xác nhận hóa đơn nào</p>
                </div>
            `;
            return;
        }

        container.innerHTML = invoices.map(inv => `
            <div class="booking-card" style="border-left:5px solid #27ae60;">
                <div class="booking-header">
                    <div class="booking-header-left">
                        <h3 style="color:var(--primary); font-size:1.1rem;">Mã HĐ: ${inv.MaHoaDon}</h3>
                        <p style="font-size:0.85rem; color:#666;">Khách: ${inv.TenKhachHang} (${inv.MaKhachHang})</p>
                    </div>
                    <span class="booking-status status-confirmed" style="background:#27ae60;">Đã Xác Nhận</span>
                </div>
                <div class="booking-body" style="grid-template-columns: 1fr 1fr 1fr; gap:15px;">
                    <div class="booking-info-item">
                        <div class="booking-info-label">Ngày Xác Nhận</div>
                        <div class="booking-info-value">${new Date(inv.NgayLap).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Tổng Tiền</div>
                        <div class="booking-info-value" style="color:#27ae60; font-weight:bold;">${parseInt(inv.TongTienThanhToan).toLocaleString('vi-VN')} ₫</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Hình Thức</div>
                        <div class="booking-info-value">${inv.HinhThucThanhToan}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Chi Nhánh</div>
                        <div class="booking-info-value">${inv.TenChiNhanh}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">SĐT Khách</div>
                        <div class="booking-info-value">${inv.SoDienThoai}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">CCCD</div>
                        <div class="booking-info-value">${inv.CCCD}</div>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Lỗi load hóa đơn của tôi:', err);
        container.innerHTML = '<div class="empty-state" style="grid-column: 1/-1;">Lỗi tải dữ liệu hóa đơn.</div>';
    }
}

// ========== ĐẶT LỊCH KHÁCH HÀNG ==========
window.receptionist = {
    selectedCustomer: null,
    selectedPet: null,
    branches: [],

    async searchCustomer() {
        const searchInput = document.getElementById('customerSearchInput').value.trim();
        if (!searchInput) {
            alert('Vui lòng nhập SĐT, Email hoặc CCCD để tìm kiếm');
            return;
        }

        try {
            const res = await api.searchCustomer(searchInput);
            const customer = res.data || res;
            
            if (!customer || !customer.MaKhachHang) {
                document.getElementById('customerSearchResult').innerHTML = `
                    <div style="text-align: center; color: #dc3545; padding: 30px 0;">
                        <i class="fas fa-user-slash fa-2x" style="margin-bottom: 10px;"></i>
                        <p style="margin-top: 10px; font-weight: 600;">Không tìm thấy khách hàng</p>
                    </div>
                `;
                return;
            }

            this.selectedCustomer = customer;
            
            // Hiển thị thông tin khách hàng
            document.getElementById('customerSearchResult').innerHTML = `
                <div style="background: #e8f5e9; padding: 15px; border-radius: 8px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                        <div><strong>Tên:</strong> ${customer.TenKhachHang}</div>
                        <div><strong>SĐT:</strong> ${customer.SoDienThoai}</div>
                        <div><strong>Email:</strong> ${customer.Email || 'N/A'}</div>
                        <div><strong>CCCD:</strong> ${customer.CCCD || 'N/A'}</div>
                    </div>
                    <button onclick="window.receptionist.selectCustomer()" 
                        style="width: 100%; padding: 10px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; margin-top: 10px;">
                        <i class="fas fa-check"></i> Chọn Khách Hàng
                    </button>
                </div>
            `;
        } catch (err) {
            console.error('Lỗi tìm kiếm khách hàng:', err);
            document.getElementById('customerSearchResult').innerHTML = `
                <div style="text-align: center; color: #dc3545;">
                    <p>Lỗi tìm kiếm khách hàng</p>
                </div>
            `;
        }
    },

    selectCustomer() {
        if (!this.selectedCustomer) return;

        const cust = this.selectedCustomer;
        document.getElementById('selectedCustomerDisplay').innerHTML = `
            <div style="flex: 1;">
                <strong>${cust.TenKhachHang}</strong><br>
                <span style="font-size: 0.85rem; color: #999;">SĐT: ${cust.SoDienThoai} | Điểm: ${cust.DiemTichLuy || 0}</span>
            </div>
            <button onclick="window.receptionist.clearCustomer()" style="padding: 8px 12px; background: #ef4444; color: white; border: none; border-radius: 6px; cursor: pointer;">
                <i class="fas fa-times"></i> Thay đổi
            </button>
        `;

        // Load thú cưng của khách hàng
        this.loadCustomerPets(cust.MaKhachHang);
    },

    clearCustomer() {
        this.selectedCustomer = null;
        document.getElementById('selectedCustomerDisplay').innerHTML = 'Chưa chọn khách hàng';
        document.getElementById('newBookingPet').innerHTML = '<option value="">-- Chọn thú cưng --</option>';
        document.getElementById('petMedicalHistoryPanel').style.display = 'none';
    },

    async loadCustomerPets(maKhachHang) {
        try {
            const res = await api.getPetsByCustomer(maKhachHang);
            const pets = res.data || res || [];

            const petSelect = document.getElementById('newBookingPet');
            petSelect.innerHTML = '<option value="">-- Chọn thú cưng --</option>' + 
                pets.map(p => `<option value="${p.MaThuCung}">${p.TenThuCung}</option>`).join('');
        } catch (err) {
            console.error('Lỗi load thú cưng:', err);
        }
    },

    async onPetSelected() {
        const petSelect = document.getElementById('newBookingPet');
        const maThuCung = petSelect.value;

        if (!maThuCung) {
            document.getElementById('petMedicalHistoryPanel').style.display = 'none';
            return;
        }

        this.selectedPet = maThuCung;
        await this.loadPetMedicalHistory(maThuCung);
    },

    async loadPetMedicalHistory(maThuCung) {
        try {
            const res = await api.getPetMedicalHistory(maThuCung);
            const history = res.data || res || {};

            let historyHTML = '';

            if (history.checkups && history.checkups.length > 0) {
                historyHTML += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #667eea; margin-bottom: 10px;">
                            <i class="fas fa-stethoscope"></i> Lịch Khám Bệnh
                        </h4>
                        ${history.checkups.map(e => `
                            <div style="background: #f0f7ff; padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #667eea;">
                                <div><strong>${e.NgayHenTaiKham ? new Date(e.NgayHenTaiKham).toLocaleDateString('vi-VN') : 'N/A'}</strong> - ${e.ChuanDoan || 'N/A'}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (history.vaccinations && history.vaccinations.length > 0) {
                historyHTML += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #f59e0b; margin-bottom: 10px;">
                            <i class="fas fa-syringe"></i> Lịch Tiêm Phòng
                        </h4>
                        ${history.vaccinations.map(v => `
                            <div style="background: #fffbeb; padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #f59e0b;">
                                <div><strong>${v.NgayTiem ? new Date(v.NgayTiem).toLocaleDateString('vi-VN') : 'N/A'}</strong> - ${v.TenVacxin || 'N/A'}</div>
                                <div style="font-size: 0.85rem; color: #666;">Liều lượng: ${v.LieuLuong || 'N/A'}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (history.packages && history.packages.length > 0) {
                historyHTML += `
                    <div style="margin-bottom: 20px;">
                        <h4 style="color: #10b981; margin-bottom: 10px;">
                            <i class="fas fa-box"></i> Gói Tiêm Đã Mua
                        </h4>
                        ${history.packages.map(p => `
                            <div style="background: #ecfdf5; padding: 10px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #10b981;">
                                <div><strong>${p.LoaiGoiTiem || 'N/A'}</strong></div>
                                <div style="font-size: 0.85rem; color: #666;">Chu kỳ: ${p.ChuKi || 'N/A'} ngày - Đăng ký: ${p.NgayDangKy ? new Date(p.NgayDangKy).toLocaleDateString('vi-VN') : 'N/A'}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (!historyHTML) {
                historyHTML = '<p style="color: #999; text-align: center; padding: 20px 0;">Chưa có lịch sử y tế</p>';
            }

            document.getElementById('petMedicalHistory').innerHTML = historyHTML;
            document.getElementById('petMedicalHistoryPanel').style.display = 'block';
        } catch (err) {
            console.error('Lỗi load lịch sử y tế:', err);
        }
    },

    async createNewBooking() {
        if (!this.selectedCustomer) {
            alert('Vui lòng chọn khách hàng');
            return;
        }
        if (!this.selectedPet) {
            alert('Vui lòng chọn thú cưng');
            return;
        }

        const service = document.getElementById('newBookingService').value;
        const branch = document.getElementById('newBookingBranch').value;
        const date = document.getElementById('newBookingDate').value;
        const time = document.getElementById('newBookingTime').value;

        if (!service || !branch || !date || !time) {
            alert('Vui lòng điền đầy đủ thông tin lịch hẹn');
            return;
        }

        try {
            const bookingData = {
                MaKhachHang: this.selectedCustomer.MaKhachHang,
                MaThuCung: this.selectedPet,
                MaChiNhanh: branch,
                ThoiGian: `${date}T${time}:00`,
                LoaiLichHen: service
            };

            const res = await api.createBooking(bookingData);
            
            if (res && (res.message || res.data)) {
                alert('Đặt lịch hẹn thành công!');
                
                // Reset form
                document.getElementById('customerSearchInput').value = '';
                document.getElementById('selectedCustomerDisplay').innerHTML = 'Chưa chọn khách hàng';
                document.getElementById('newBookingPet').innerHTML = '<option value="">-- Chọn thú cưng --</option>';
                document.getElementById('newBookingService').value = '';
                document.getElementById('newBookingDate').value = '';
                document.getElementById('newBookingTime').value = '';
                document.getElementById('customerSearchResult').innerHTML = '<p style="text-align: center; color: #999; font-size: 0.9rem;">Nhập tìm kiếm để xem kết quả...</p>';
                document.getElementById('petMedicalHistoryPanel').style.display = 'none';
                this.selectedCustomer = null;
                this.selectedPet = null;
            }
        } catch (err) {
            console.error('Lỗi đặt lịch:', err);
            alert('Lỗi đặt lịch hẹn: ' + (err.message || 'Vui lòng thử lại'));
        }
    }
};

// Load branches vào dropdown
async function loadBranchesForNewBooking() {
    try {
        const res = await api.getBranches();
        const branches = res.data || res || [];
        const select = document.getElementById('newBookingBranch');
        select.innerHTML = branches.map(b => `<option value="${b.MaChiNhanh}">${b.TenChiNhanh}</option>`).join('');
        window.receptionist.branches = branches;
    } catch (err) {
        console.error('Lỗi load chi nhánh:', err);
    }
}

// Gọi khi trang load
setTimeout(loadBranchesForNewBooking, 500);