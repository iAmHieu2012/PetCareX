import { api } from './api.js';

// ==================== CUSTOMER DASHBOARD JS ====================

// Helper: Get token and user from localStorage
function getAuthData() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const maKhachHang = localStorage.getItem('maKhachHang');
    return { token, user, maKhachHang };
}

// Helper: Check authentication
function checkAuth() {
    const { token, maKhachHang } = getAuthData();
    
    if (!token || !maKhachHang) {
        alert('Vui lòng đăng nhập để truy cập!');
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// Helper: Show alert/notification
function showAlert(message, type = 'info', duration = 3000) {
    const alertContainer = document.getElementById('alert-container');
    const alert = document.createElement('div');
    alert.className = `alert ${type}`;
    
    const iconMap = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    
    alert.innerHTML = `
        <i class="${iconMap[type]}"></i>
        <span>${message}</span>
        <button class="alert-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    alertContainer.appendChild(alert);
    
    // Remove alert on close button click
    alert.querySelector('.alert-close').addEventListener('click', () => {
        alert.remove();
    });
    
    // Auto remove after duration
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, duration);
}

// Helper: Make API calls
async function apiCall(endpoint, options = {}) {
    const { token } = getAuthData();
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(endpoint, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/login.html';
                return null;
            }
            throw new Error(`HTTP ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showAlert(`Lỗi: ${error.message}`, 'error');
        return null;
    }
}

// Thêm hàm này vào file customer-dashboard.js
async function loadShopBranches() {
    const branchSelect = document.getElementById('shop-branch-select');
    if (!branchSelect) return;

    try {
        // Sử dụng api.getBranches mà mày đã định nghĩa trong api.js
        const response = await api.getBranches();
        const branches = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
        
        branchSelect.innerHTML = '<option value="">-- Chọn chi nhánh --</option>' + 
            branches.map(bn => `
                <option value="${bn.MaChiNhanh}">${bn.TenChiNhanh}</option>
            `).join('');
            
        // (Tùy chọn) Nếu khách đã từng chọn chi nhánh, lưu lại cho lần sau
        const lastBranch = localStorage.getItem('last_selected_branch');
        if (lastBranch) branchSelect.value = lastBranch;

        // Thêm event listener để khi thay đổi chi nhánh thì reload shop
        branchSelect.addEventListener('change', () => {
            if (window.dashboard) {
                const selectedBranch = branchSelect.value;
                window.dashboard.loadShopProducts('all', selectedBranch);
                // Lưu chi nhánh được chọn
                localStorage.setItem('last_selected_branch', selectedBranch);
            }
        });

    } catch (err) {
        console.error("Lỗi tải chi nhánh:", err);
    }
}


// ==================== MAIN APP ====================
class CustomerDashboard {
    constructor() {
        this.currentFilter = 'all';
        this.pets = [];
        this.bookings = [];
        this.branches = [];
        this.customerData = null;
        this.cart = [];
        this.init();
    }

    init() {
        if (!checkAuth()) return;

        // Set up UI
        this.setupEventListeners();
        this.setupTabNavigation();
        this.setupModals();

        // Load data
        this.loadUserInfo();
        this.loadPets();
        this.loadBookings();
        this.loadBranches();
    }

    setupTabNavigation() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;

                // Update active button
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                // Update active pane
                document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));
                document.getElementById(`${tabName}-tab`).classList.add('active');
                
                if (tabName === 'shop') {
                    this.loadShopProducts('all');
                }
                // Reload data if needed
                if (tabName === 'profile') {
                    this.renderProfile();
                }
                // Load invoices if needed
                if (tabName === 'invoices') {
                    loadPendingInvoices();
                }
            });
        });
    }

    setupEventListeners() {
        // Logout
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
                    localStorage.clear();
                    window.location.href = '/login.html';
                }
            });
        }

        // Pet management
        const addPetBtn = document.getElementById('add-pet-btn');
        if (addPetBtn) addPetBtn.addEventListener('click', () => this.showModal('add-pet-modal'));

        const addPetForm = document.getElementById('add-pet-form');
        if (addPetForm) addPetForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.addPet();
        });

        const cancelPetBtn = document.getElementById('cancel-pet-btn');
        if (cancelPetBtn) cancelPetBtn.addEventListener('click', () => this.hideModal('add-pet-modal'));

        // Booking management
        const newBookingBtn = document.getElementById('new-booking-btn');
        if (newBookingBtn) {
            newBookingBtn.addEventListener('click', async () => {
                await this.loadPets();
                this.populateBookingPets();
                this.showModal('booking-modal');
            });
        }

        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.createBooking();
            });
        }

        const cancelBookingBtn = document.getElementById('cancel-booking-btn');
        if (cancelBookingBtn) cancelBookingBtn.addEventListener('click', () => this.hideModal('booking-modal'));

        // TÍCH HỢP: Lắng nghe chọn thú cưng để hiện lịch sử
        const bookingPetSelect = document.getElementById('booking-pet');
        if (bookingPetSelect) {
            bookingPetSelect.addEventListener('change', (e) => {
                this.loadPetHistoryIntoModal(e.target.value);
            });
        }
    }

    setupModals() {
        // CÁCH SỬA LỖI: Kiểm tra phần tử có tồn tại trước khi add event
        const modalIds = ['close-pet-modal', 'close-pet-detail-modal', 'close-booking-modal'];
        modalIds.forEach(id => {
            const btn = document.getElementById(id);
            if (btn) {
                btn.addEventListener('click', () => {
                    const modal = btn.closest('.modal');
                    if (modal) modal.classList.remove('active');
                });
            }
        });

        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.remove('active');
            });
        });
    }

    // Hàm lấy lịch sử y tế tích hợp vào Dashboard
    async loadPetHistoryIntoModal(maThuCung) {
        const historyContent = document.getElementById('history-content');
        if (!historyContent) return;

        if (!maThuCung) {
            historyContent.innerHTML = '<p style="color: #999; text-align: center;">Chọn thú cưng để xem lịch sử...</p>';
            return;
        }

        try {
            historyContent.innerHTML = '<div style="text-align:center; padding: 20px;"><i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu y tế...</div>';
            
            // Gọi API lấy lịch sử y tế (Hàm đã được định nghĩa trong controller)
            const response = await apiCall(`/api/pets/history/${maThuCung}`);
            
            if (response && response.success) {
                const { checkups, vaccinations, packages } = response.data;

                let html = '';

                // 1. Render Gói tiêm đã mua
                html += '<p style="font-weight:700; color:var(--primary); margin-bottom:10px;"><i class="fas fa-box"></i> Gói tiêm đã sở hữu:</p>';
                if (packages && packages.length > 0) {
                    html += packages.map(p => `
                        <div class="history-item" style="border-left: 3px solid var(--success); background: #f0fdf4;">
                            <strong>${p.MaGoiTiem}</strong>
                            <div style="font-size: 12px; color: #666;">Ngày mua: ${new Date(p.NgayDangKy).toLocaleDateString('vi-VN')}</div>
                        </div>
                    `).join('');
                } else {
                    html += '<p style="font-size: 13px; color: #999; margin-bottom: 15px;">Chưa có gói tiêm nào.</p>';
                }

                // 2. Render Khám bệnh gần nhất
                html += '<p style="font-weight:700; color:var(--primary); margin: 15px 0 10px;"><i class="fas fa-stethoscope"></i> Lịch sử khám bệnh:</p>';
                if (checkups && checkups.length > 0) {
                    html += checkups.map(c => `
                        <div class="history-item" style="border-left: 3px solid var(--primary);">
                            <strong>Chẩn đoán: ${c.ChuanDoan}</strong>
                            <div style="font-size: 12px; color: #666;">
                                Hẹn tái khám: ${c.NgayHenTaiKham ? new Date(c.NgayHenTaiKham).toLocaleDateString('vi-VN') : 'Không có'}
                            </div>
                        </div>
                    `).join('');
                } else {
                    html += '<p style="font-size: 13px; color: #999; margin-bottom: 15px;">Chưa có lịch sử khám.</p>';
                }

                // 3. Render Tiêm phòng gần nhất
                html += '<p style="font-weight:700; color:var(--primary); margin: 15px 0 10px;"><i class="fas fa-syringe"></i> Lịch sử tiêm chủng:</p>';
                if (vaccinations && vaccinations.length > 0) {
                    html += vaccinations.map(v => `
                        <div class="history-item" style="border-left: 3px solid var(--warning);">
                            <strong>Vắc-xin: ${v.TenVacxin}</strong>
                            <div style="font-size: 12px; color: #666;">Ngày tiêm: ${new Date(v.NgayTiem).toLocaleDateString('vi-VN')}</div>
                        </div>
                    `).join('');
                } else {
                    html += '<p style="font-size: 13px; color: #999;">Chưa có lịch sử tiêm phòng.</p>';
                }

                historyContent.innerHTML = html;
            } else {
                historyContent.innerHTML = '<p style="color: #ef4444; text-align: center;">Không thể lấy dữ liệu lịch sử.</p>';
            }
        } catch (err) {
            console.error('Lỗi tải lịch sử:', err);
            historyContent.innerHTML = '<p style="color: #ef4444; text-align: center;">Lỗi kết nối máy chủ.</p>';
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    // ==================== USER INFO ====================
    async loadUserInfo() {
        const { user, maKhachHang } = getAuthData();

        // Update greeting
        const greeting = document.getElementById('greeting-message');
        greeting.textContent = `Chào mừng ${user.name || 'khách hàng'} trở lại!`;

        document.getElementById('user-name').textContent = `Xin chào, ${user.name || 'Khách hàng'}`;

        // Load full customer info
        const customerInfo = await apiCall(`/api/customer/info/${maKhachHang}`);
        if (customerInfo) {
            this.customerData = customerInfo.data;
            this.updateUserPoints();
        }
    }

    updateUserPoints() {
        if (this.customerData) {
            const points = this.customerData.DiemTichLuy || 0;
            document.getElementById('user-points').textContent = `${points} điểm`;
        }
    }

    renderProfile() {
        if (!this.customerData) return;

        const data = this.customerData;
        document.getElementById('profile-name').textContent = data.TenKhachHang || '-';
        document.getElementById('profile-email').textContent = data.Email || '-';
        document.getElementById('profile-phone').textContent = data.SoDienThoai || '-';
        document.getElementById('profile-cccd').textContent = data.CCCD || '-';
        document.getElementById('profile-gender').textContent = data.GioiTinh || '-';
        document.getElementById('profile-points').textContent = data.DiemTichLuy || 0;

        // Determine loyalty tier
        const points = data.DiemTichLuy || 0;
        let tier = 'Cơ bản';
        if (points >= 1000) tier = 'VIP';
        else if (points >= 500) tier = 'Thân thiết';

        document.getElementById('loyalty-tier').textContent = tier;
    }

    // ==================== PETS ====================
    async loadPets() {
        const { maKhachHang } = getAuthData();
        const response = await apiCall(`/api/customer/pets/${maKhachHang}`);

        if (response && response.data) {
            this.pets = response.data;
            this.renderPets();
        }
    }

    renderPets() {
        const container = document.getElementById('pets-container');

        if (this.pets.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-paw"></i>
                    <p>Bạn chưa có thú cưng nào</p>
                    <button id="add-pet-empty-btn" class="btn-primary">
                        <i class="fas fa-plus"></i> Thêm Thú Cưng Ngay
                    </button>
                </div>
            `;
            document.getElementById('add-pet-empty-btn').addEventListener('click', () => {
                this.showModal('add-pet-modal');
            });
            return;
        }

        container.innerHTML = this.pets.map(pet => `
            <div class="pet-card">
                <div class="pet-card-header">
                    <div class="pet-card-title">
                        <div class="pet-name">${pet.TenThuCung}</div>
                        <div class="pet-type">${pet.Loai}${pet.Giong ? ` - ${pet.Giong}` : ''}</div>
                    </div>
                    <div class="pet-icon">
                        ${this.getPetIcon(pet.Loai)}
                    </div>
                </div>

                <div class="pet-info">
                    <div class="pet-info-item">
                        <div class="pet-info-label">Giới Tính</div>
                        <div class="pet-info-value">${pet.GioiTinh || '-'}</div>
                    </div>
                    <div class="pet-info-item">
                        <div class="pet-info-label">Tuổi</div>
                        <div class="pet-info-value">${this.calculateAge(pet.NgaySinh)} tuổi</div>
                    </div>
                    <div class="pet-info-item">
                        <div class="pet-info-label">Tình Trạng</div>
                        <div class="pet-info-value">${pet.TinhTrang || 'Bình thường'}</div>
                    </div>
                    <div class="pet-info-item">
                        <div class="pet-info-label">Sinh Nhật</div>
                        <div class="pet-info-value">${this.formatDate(pet.NgaySinh)}</div>
                    </div>
                </div>

                <div class="pet-card-footer">
                    <button class="pet-btn pet-btn-view" data-pet-id="${pet.MaThuCung}">
                        <i class="fas fa-eye"></i> Chi Tiết
                    </button>
                    <button class="pet-btn pet-btn-edit" data-pet-id="${pet.MaThuCung}">
                        <i class="fas fa-pencil-alt"></i> Sửa
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.pet-btn-view').forEach(btn => {
            btn.addEventListener('click', () => {
                const petId = btn.dataset.petId;
                this.showPetDetail(petId);
            });
        });
    }

    getPetIcon(type) {
        const icons = {
            'Chó': '🐕',
            'Mèo': '🐈',
            'Thỏ': '🐇',
            'Chim': '🐦',
            'Chuột': '🐁',
            'Khác': '🐾'
        };
        return icons[type] || '🐾';
    }

    calculateAge(birthDate) {
        if (!birthDate) return '?';
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return Math.max(0, age);
    }

    formatDate(date) {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    showPetDetail(petId) {
        const pet = this.pets.find(p => p.MaThuCung === petId);
        if (!pet) return;

        document.getElementById('pet-detail-name').textContent = pet.TenThuCung;
        
        const detailBody = document.querySelector('.pet-detail-body');
        detailBody.innerHTML = `
            <div class="pet-detail-content">
                <div style="text-align: center; margin-bottom: 1.5rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">
                        ${this.getPetIcon(pet.Loai)}
                    </div>
                    <h3 style="font-size: 1.5rem; margin: 0;">${pet.TenThuCung}</h3>
                </div>

                <div class="profile-info">
                    <div class="info-row">
                        <label>Loại</label>
                        <span>${pet.Loai}</span>
                    </div>
                    <div class="info-row">
                        <label>Giống</label>
                        <span>${pet.Giong || '-'}</span>
                    </div>
                    <div class="info-row">
                        <label>Giới Tính</label>
                        <span>${pet.GioiTinh || '-'}</span>
                    </div>
                    <div class="info-row">
                        <label>Ngày Sinh</label>
                        <span>${this.formatDate(pet.NgaySinh)} (${this.calculateAge(pet.NgaySinh)} tuổi)</span>
                    </div>
                    <div class="info-row">
                        <label>Tình Trạng</label>
                        <span>${pet.TinhTrang || 'Bình thường'}</span>
                    </div>
                </div>

                <div style="margin-top: 2rem;">
                    <button class="btn-primary" style="width: 100%;">
                        <i class="fas fa-calendar-alt"></i> Đặt Lịch Hẹn Cho ${pet.TenThuCung}
                    </button>
                </div>
            </div>
        `;

        this.showModal('pet-detail-modal');
    }

    async addPet() {
        const { maKhachHang } = getAuthData();
        const form = document.getElementById('add-pet-form');
        
        const petData = {
            maKhachHang: maKhachHang,
            tenThuCung: form.petName.value,
            loaiThuCung: form.petType.value,
            giong: form.petBreed.value || null,
            gioiTinh: form.petGender.value || null,
            ngaySinh: form.petDOB.value,
            tinhTrang: form.petHealth.value || 'Bình thường'
        };

        const response = await apiCall('/api/pets', {
            method: 'POST',
            body: JSON.stringify(petData)
        });

        if (response) {
            showAlert('Thêm thú cưng thành công!', 'success');
            this.hideModal('add-pet-modal');
            form.reset();
            this.loadPets();
            this.populateBookingPets();  // Cập nhật dropdown pets trong form booking
        }
    }

    // ==================== BOOKINGS ====================
    async loadBookings() {
        const { maKhachHang } = getAuthData();
        const response = await apiCall(`/api/bookings/customer/${maKhachHang}`);

        if (response && response.data) {
            this.bookings = response.data;
            this.renderBookings();
            this.populateBookingPets();
        }
    }

    renderBookings() {
        const container = document.getElementById('bookings-container');
        
        let filtered = this.bookings;
        if (this.currentFilter !== 'all') {
            filtered = this.bookings.filter(b => b.TrangThai.includes(this.currentFilter));
        }

        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-calendar-times"></i>
                    <p>Chưa có lịch hẹn nào</p>
                    <button id="new-booking-empty-btn" class="btn-primary">
                        <i class="fas fa-plus"></i> Đặt Lịch Hẹn Ngay
                    </button>
                </div>
            `;
            document.getElementById('new-booking-empty-btn').addEventListener('click', async () => {
                // Refresh pets list trước khi mở modal (giống nút header)
                await this.loadPets();
                this.populateBookingPets();
                this.showModal('booking-modal');
            });
            return;
        }

        container.innerHTML = filtered.map(booking => `
            <div class="booking-card ${this.getBookingStatus(booking.TrangThai)}">
                <div class="booking-header">
                    <div class="booking-header-left">
                        <h3>${booking.TenThuCung}</h3>
                        <p style="color: var(--text-light); font-size: 0.9rem;">${booking.TenChiNhanh}</p>
                    </div>
                    <span class="booking-status status-${this.getBookingStatus(booking.TrangThai)}">
                        ${booking.TrangThai}
                    </span>
                </div>

                <div class="booking-body">
                    <div class="booking-info-item">
                        <div class="booking-info-label">Dịch Vụ</div>
                        <div class="booking-info-value">${booking.LoaiLichHen}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Ngày Hẹn</div>
                        <div class="booking-info-value">${this.formatDate(booking.ThoiGian)}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Giờ Hẹn</div>
                        <div class="booking-info-value">${this.formatTime(booking.ThoiGian)}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Mã Lịch Hẹn</div>
                        <div class="booking-info-value">${booking.MaLichHen}</div>
                    </div>
                </div>

                <div class="booking-actions">
                    <button class="booking-btn booking-btn-view">
                        <i class="fas fa-eye"></i> Chi Tiết
                    </button>
                    ${booking.TrangThai.includes('Chờ') ? `
                        <button class="booking-btn booking-btn-cancel" data-booking-id="${booking.MaLichHen}">
                            <i class="fas fa-times"></i> Hủy
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    getBookingStatus(status) {
        if (status.includes('Chờ')) return 'pending';
        if (status.includes('Xác')) return 'confirmed';
        if (status.includes('Hoàn')) return 'completed';
        return 'pending';
    }

    formatTime(datetime) {
        if (!datetime) return '-';
        return new Date(datetime).toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    populateBookingPets() {
        const select = document.getElementById('booking-pet');
        select.innerHTML = `
            <option value="">-- Chọn thú cưng --</option>
            ${this.pets.map(pet => `
                <option value="${pet.MaThuCung}">${pet.TenThuCung} (${pet.Loai})</option>
            `).join('')}
        `;
    }

    async loadBranches() {
        const response = await apiCall('/api/branches');
        // API trả về mảng trực tiếp hoặc object có property data
        if (response) {
            this.branches = Array.isArray(response) ? response : (response.data || []);
            if (this.branches.length === 0) {
                console.warn('Không có chi nhánh nào');
            }
            this.populateBookingBranches();
        } else {
            console.warn('Lỗi tải danh sách chi nhánh');
        }
    }

    populateBookingBranches() {
        const select = document.getElementById('booking-branch');
        select.innerHTML = `
            <option value="">-- Chọn chi nhánh --</option>
            ${this.branches.map(branch => `
                <option value="${branch.MaChiNhanh}">${branch.TenChiNhanh} - ${branch.DiaChi}</option>
            `).join('')}
        `;
    }

    async createBooking() {
        const { maKhachHang } = getAuthData();
        const form = document.getElementById('booking-form');

        if (!form.pet.value || !this.pets.find(p => p.MaThuCung === form.pet.value)) {
            showAlert('Vui lòng chọn thú cưng hợp lệ', 'warning');
            return;
        }

        const bookingData = {
            MaKhachHang: maKhachHang,
            MaThuCung: form.pet.value,
            MaChiNhanh: form.branch.value,
            ThoiGian: `${form.date.value}T${form.time.value}:00`,
            LoaiLichHen: form.service.value,
            GhiChu: form.notes.value
        };

        const response = await apiCall('/api/bookings', {
            method: 'POST',
            body: JSON.stringify(bookingData)
        });

        if (response) {
            showAlert('Đặt lịch hẹn thành công!', 'success');
            this.hideModal('booking-modal');
            form.reset();
            this.loadBookings();
        }
    }
    // ==================== NEW SHOP & CART METHODS ====================

    // 1. Tải danh sách sản phẩm từ API
    async loadShopProducts(type = 'all', branchId = null) {
        const grid = document.getElementById('dashboard-products-grid'); // ID đúng trong HTML của bạn
        if (!grid) return;

        grid.innerHTML = '<div class="loading-message"><i class="fas fa-spinner fa-spin"></i> Đang tải cửa hàng...</div>';

        try {
            // Nếu chọn chi nhánh, load sản phẩm có tồn kho tại chi nhánh đó
            let response;
            if (branchId) {
                response = await api.getProductsByBranch(branchId, type);
            } else {
                response = await api.getProducts(type);
            }
            
            const products = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
            
            if (!products || products.length === 0) {
                grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Hiện chưa có sản phẩm nào.</p>';
                return;
            }

            grid.innerHTML = products.map(p => {
                const stock = p.SoLuongTonKho || 0;
                const isLowStock = stock < 5;
                const stockLabel = stock === 0 ? 'Hết hàng' : (isLowStock ? `Còn ${stock} cái` : `Còn ${stock} cái`);
                const stockColor = stock === 0 ? 'color: #dc3545;' : (isLowStock ? 'color: #ff9800;' : 'color: #28a745;');
                
                return `
                    <div class="pet-card">
                        <div class="pet-info">
                            <h3>${p.TenSanPham}</h3>
                            <p><strong>Loại:</strong> ${p.LoaiSanPham}</p>
                            <p style="font-size: 1.2rem; color: var(--secondary); font-weight: bold; margin: 10px 0;">
                                ${new Intl.NumberFormat('vi-VN').format(p.GiaBan)} đ
                            </p>
                            <p style="font-size: 0.9rem; ${stockColor} font-weight: bold; margin: 5px 0;">
                                📦 ${stockLabel}
                            </p>
                        </div>
                        <div class="pet-actions">
                            ${stock > 0 
                                ? `<button class="btn-primary" onclick="window.dashboard.addToCart('${p.MaSanPham}', '${p.TenSanPham}', ${p.GiaBan}, ${stock})">
                                    <i class="fas fa-cart-plus"></i> Thêm vào giỏ
                                </button>`
                                : `<button class="btn-primary" style="background-color: #ccc; cursor: not-allowed;" disabled>
                                    <i class="fas fa-ban"></i> Hết hàng
                                </button>`
                            }
                        </div>
                    </div>
                `;
            }).join('');
        } catch (err) {
            console.error('Lỗi tải sản phẩm:', err);
            grid.innerHTML = '<p>Không thể tải sản phẩm.</p>';
        }
    }

    // 2. Thêm sản phẩm vào mảng giỏ hàng tạm thời
    addToCart(id, name, price, availableStock = 999) {
        const existing = this.cart.find(item => item.id === id);
        
        // Kiểm tra số lượng tồn kho
        const totalQuantity = (existing ? existing.quantity : 0) + 1;
        if (totalQuantity > availableStock) {
            showAlert(`Không thể thêm. Tồn kho chỉ còn ${availableStock} cái`, 'error');
            return;
        }
        
        if (existing) {
            existing.quantity += 1;
        } else {
            this.cart.push({ id, name, price, quantity: 1, availableStock });
        }
        this.renderCart();
        showAlert(`Đã thêm ${name} vào giỏ`, 'success');
    }

    // 3. Hiển thị giỏ hàng ra sidebar bên phải
    renderCart() {
        const container = document.getElementById('dashboard-cart-items');
        const totalElem = document.getElementById('dashboard-cart-total');
        if (!container || !totalElem) return;

        if (this.cart.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">Chưa có sản phẩm nào</p>';
            totalElem.innerText = '0 đ';
            return;
        }

        let total = 0;
        container.innerHTML = this.cart.map((item, index) => {
            total += item.price * item.quantity;
            const stock = item.availableStock || 999;
            const stockStatus = stock < 5 ? `<span style="color: #ff9800; font-weight: bold;"> (Còn ${stock})</span>` : '';
            
            return `
                <div class="cart-item" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
                    <div style="flex: 1;">
                        <strong>${item.name}</strong>${stockStatus}<br>
                        <small>${item.quantity} x ${new Intl.NumberFormat('vi-VN').format(item.price)} = ${new Intl.NumberFormat('vi-VN').format(item.quantity * item.price)}</small><br>
                        <div style="margin-top: 5px; display: flex; gap: 5px; align-items: center;">
                            <button onclick="window.dashboard.decreaseCart(${index})" style="background:#f0f0f0; border:1px solid #ccc; padding:2px 6px; cursor:pointer; border-radius:3px;">−</button>
                            <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                            <button onclick="window.dashboard.increaseCart(${index})" style="background:#f0f0f0; border:1px solid #ccc; padding:2px 6px; cursor:pointer; border-radius:3px; ${item.quantity >= stock ? 'opacity: 0.5; cursor: not-allowed;' : ''}">+</button>
                        </div>
                    </div>
                    <button onclick="window.dashboard.removeFromCart(${index})" style="background:none; border:none; color:red; cursor:pointer; margin-left: 10px;">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
        }).join('');
        
        totalElem.innerText = new Intl.NumberFormat('vi-VN').format(total) + ' đ';
    }

    decreaseCart(index) {
        if (this.cart[index].quantity > 1) {
            this.cart[index].quantity -= 1;
            this.renderCart();
        }
    }

    increaseCart(index) {
        const stock = this.cart[index].availableStock || 999;
        if (this.cart[index].quantity < stock) {
            this.cart[index].quantity += 1;
            this.renderCart();
        } else {
            showAlert(`Tồn kho chỉ còn ${stock} cái`, 'warning');
        }
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.renderCart();
    }
}

// // Initialize app when DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//     window.dashboard = new CustomerDashboard();
//     const shopBtn = document.querySelector('[data-tab="shop"]');
//     if (shopBtn) {
//         shopBtn.addEventListener('click', () => loadShopData());
//     }
// });

// Khởi tạo ứng dụng
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new CustomerDashboard();
    const shopBtn = document.querySelector('[data-tab="shop"]');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            window.dashboard.loadShopProducts('all');    // Load sản phẩm
            loadShopBranches(); // Load thêm cái này nữa là chuẩn bài
        });
    }
});

// Đăng ký các hàm toàn cục để gọi được từ thuộc tính onclick trong HTML
window.checkoutDashboardShop = async () => {
    // 1. Lấy branchId từ select
    const branchId = document.getElementById('shop-branch-select').value;
    
    // 2. Kiểm tra xem khách đã chọn chi nhánh chưa
    if (!branchId) {
        return showAlert('Vui lòng chọn chi nhánh mua hàng để kiểm tra tồn kho!', 'warning');
    }

    if (window.dashboard.cart.length === 0) {
        return showAlert('Giỏ hàng trống!', 'warning');
    }

    // 3. Lưu lại chi nhánh này để lần sau khách đỡ phải chọn lại
    localStorage.setItem('last_selected_branch', branchId);

    const { maKhachHang } = getAuthData();

    try {
        const response = await apiCall('/api/retail/checkout', {
            method: 'POST',
            body: JSON.stringify({
                customerId: maKhachHang,
                branchId: branchId,
                cartItems: window.dashboard.cart.map((item, index) => ({
                    MaSP: item.id,
                    SoLuong: item.quantity,
                    SoThuTu: index + 1
                }))
            })
        });

        if (response && response.success) {
            // Trả về mã Hóa đơn (Draft) để khách ra quầy đọc cho nhân viên
            const invoiceId = (response && response.data) ? response.data.invoiceId : response.invoiceId;
            showAlert(`Tạo đơn hàng thành công! Vui lòng thanh toán ở tab Hóa Đơn.`, 'success');
            window.dashboard.cart = [];
            window.dashboard.renderCart();
            
            // Auto-switch to invoices tab để thanh toán
            setTimeout(() => {
                const invoicesTab = document.querySelector('[data-tab="invoices"]');
                if (invoicesTab) invoicesTab.click();
            }, 500);
        }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'error');
    }
};

// Hàm lọc sản phẩm theo loại
window.filterDashboardShop = () => {
    const filterValue = document.getElementById('dashboard-shop-filter').value;
    window.dashboard.loadShopProducts(filterValue);
};

// ==================== VACCINATION MANAGEMENT ====================
let vaccinationData = {
    packages: [],
    selectedPackage: null,
    petData: {},
    branchData: {}
};

// Load danh sách gói tiêm
async function loadVaccinationPackages() {
    try {
        const response = await apiCall('/api/vaccinations/packages');
        if (response && response.data) {
            vaccinationData.packages = response.data;
            displayVaccinationPackages();
        }
    } catch (err) {
        console.error('Lỗi load gói tiêm:', err);
    }
}

// Hiển thị danh sách gói tiêm
function displayVaccinationPackages() {
    const container = document.getElementById('vaccination-packages-list');
    if (!container) return;

    if (vaccinationData.packages.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Không có gói tiêm nào</p>';
        return;
    }

    container.innerHTML = vaccinationData.packages.map(pkg => `
        <div class="package-card" onclick="selectVaccinationPackage('${pkg.MaGoiTiem}', ${pkg.TongGia || 0})" style="cursor: pointer; padding: 12px; border: 2px solid #ddd; border-radius: 8px; margin-bottom: 10px; transition: all 0.3s;">
            <strong style="color: #333;">${pkg.MaGoiTiem}</strong>
            <p style="font-size: 12px; color: #666; margin: 5px 0;">
                💊 ${pkg.SoVacxin} vắc xin | 🎁 ${(pkg.UuDai * 100).toFixed(0)}% giảm
            </p>
            <p style="color: #667eea; font-weight: 600; font-size: 14px;">
                ${(pkg.TongGia || 0).toLocaleString()} VNĐ
            </p>
        </div>
    `).join('');
}

// Chọn gói tiêm
window.selectVaccinationPackage = function(packageId, price) {
    vaccinationData.selectedPackage = packageId;
    document.getElementById('vaccination-original-price').textContent = price.toLocaleString() + ' VNĐ';
    document.getElementById('vaccination-total-price').textContent = price.toLocaleString() + ' VNĐ';

    // Highlight selected package
    document.querySelectorAll('#vaccination-packages-list .package-card').forEach(card => {
        card.style.borderColor = '#ddd';
        card.style.background = 'white';
    });
    event.currentTarget.style.borderColor = '#667eea';
    event.currentTarget.style.background = '#f0f4ff';

    // Load chi tiết gói tiêm
    loadVaccinationPackageDetails(packageId);
    updateVaccinationButtonState();
}

// Load chi tiết gói tiêm
async function loadVaccinationPackageDetails(packageId) {
    try {
        const response = await apiCall(`/api/vaccinations/packages/${packageId}`);
        if (response && response.data) {
            displayVaccinationPackageDetails(response.data);
        }
    } catch (err) {
        console.error('Lỗi load chi tiết gói tiêm:', err);
    }
}

// Hiển thị chi tiết gói tiêm
function displayVaccinationPackageDetails(details) {
    const container = document.getElementById('vaccination-package-details');
    if (!container) return;

    if (!details || details.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center;">Không có thông tin</p>';
        return;
    }

    let html = `<div style="padding: 15px;">`;
    html += `<strong style="color: #667eea; font-size: 16px;">${details[0].MaGoiTiem}</strong><br>`;
    html += `<p style="font-size: 13px; color: #666; margin: 8px 0;">Loại: ${details[0].LoaiGoiTiem}</p>`;
    if (details[0].ChuKi > 0) {
        html += `<p style="font-size: 13px; color: #666; margin: 8px 0;">Chu kỳ: ${details[0].ChuKi} ngày</p>`;
    }

    html += `<div style="margin-top: 15px; border-top: 2px solid #eee; padding-top: 12px;">`;
    html += `<strong style="color: #667eea; font-size: 14px;">Danh sách vắc xin:</strong>`;
    html += `<ul style="list-style: none; margin: 10px 0; padding: 0;">`;

    details.forEach(detail => {
        if (detail.MaVacxin) {
            html += `
                <li style="padding: 8px; border-bottom: 1px solid #f0f0f0;">
                    <strong style="color: #333;">✓ ${detail.TenVacxin}</strong>
                    <p style="font-size: 11px; color: #999; margin: 3px 0;">${detail.MoTa}</p>
                </li>
            `;
        }
    });

    html += `</ul></div></div>`;
    container.innerHTML = html;
}

// Load thú cưng của khách hàng (cho tab tiêm)
async function loadVaccinationPets() {
    const { maKhachHang } = getAuthData();
    try {
        const response = await apiCall(`/api/customer/pets/${maKhachHang}`);
        if (response && response.data) {
            vaccinationData.petData = response.data;
            const select = document.getElementById('vaccination-pet-select');
            if (select) {
                select.innerHTML = '<option value="">-- Chọn thú cưng --</option>' +
                    response.data.map(pet => `<option value="${pet.MaThuCung}">${pet.TenThuCung}</option>`).join('');
            }
        }
    } catch (err) {
        console.error('Lỗi load thú cưng:', err);
    }
}

// Load danh sách chi nhánh (cho tab tiêm)
async function loadVaccinationBranches() {
    const branchSelect = document.getElementById('vaccination-branch-select');
    if (!branchSelect) return;

    try {
        const response = await apiCall('/api/branches');
        const branches = (response && response.data) ? response.data : (Array.isArray(response) ? response : []);
        
        branchSelect.innerHTML = '<option value="">-- Chọn chi nhánh --</option>' + 
            branches.map(bn => `
                <option value="${bn.MaChiNhanh}">${bn.TenChiNhanh}</option>
            `).join('');
            
        // Nếu khách đã từng chọn chi nhánh, lưu lại cho lần sau
        const lastBranch = localStorage.getItem('last_selected_branch');
        if (lastBranch) branchSelect.value = lastBranch;

        // Thêm event listener để khi thay đổi chi nhánh thì cập nhật trạng thái nút
        branchSelect.addEventListener('change', () => {
            updateVaccinationButtonState();
            // Lưu chi nhánh được chọn
            localStorage.setItem('last_selected_branch', branchSelect.value);
        });

    } catch (err) {
        console.error("Lỗi tải chi nhánh:", err);
    }
}

// Xử lý khi chọn thú cưng
document.addEventListener('DOMContentLoaded', () => {
    const petSelect = document.getElementById('vaccination-pet-select');
    if (petSelect) {
        petSelect.addEventListener('change', () => {
            updateVaccinationButtonState();
        });
    }

    const branchSelect = document.getElementById('vaccination-branch-select');
    if (branchSelect) {
        branchSelect.addEventListener('change', () => {
            updateVaccinationButtonState();
        });
    }

    // Load gói tiêm và chi nhánh khi mở tab
    const vaccinationTab = document.querySelector('[data-tab="vaccination"]');
    if (vaccinationTab) {
        vaccinationTab.addEventListener('click', () => {
            loadVaccinationPackages();
            loadVaccinationPets();
            loadVaccinationBranches();
        });
    }
});

// Cập nhật trạng thái nút
function updateVaccinationButtonState() {
    const petSelect = document.getElementById('vaccination-pet-select');
    const branchSelect = document.getElementById('vaccination-branch-select');
    const registerBtn = document.getElementById('vaccination-register-btn');

    if (petSelect && branchSelect && registerBtn) {
        const canRegister = petSelect.value && branchSelect.value && vaccinationData.selectedPackage;
        registerBtn.disabled = !canRegister;
    }
}

// Đăng ký gói tiêm
window.vaccinationRegisterPackage = async function() {
    const { maKhachHang } = getAuthData();
    const petSelect = document.getElementById('vaccination-pet-select');
    const branchSelect = document.getElementById('vaccination-branch-select');

    if (!petSelect.value || !branchSelect.value || !vaccinationData.selectedPackage) {
        showAlert('Vui lòng chọn thú cưng, chi nhánh và gói tiêm', 'warning');
        return;
    }

    const registerBtn = document.getElementById('vaccination-register-btn');

    registerBtn.disabled = true;
    registerBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        const response = await apiCall('/api/vaccinations/register', {
            method: 'POST',
            body: JSON.stringify({
                maKhachHang: maKhachHang,
                maThuCung: petSelect.value,
                maGoiTiem: vaccinationData.selectedPackage,
                maChiNhanh: branchSelect.value
            })
        });

        if (response && response.success) {
            vaccinationData.currentPDV = response.data.maPDV;
            vaccinationData.tongGia = response.data.tongGia;
            showAlert('Đăng ký gói tiêm thành công! Vui lòng thanh toán', 'success');
            registerBtn.innerHTML = 'Đăng Ký Gói';
            registerBtn.disabled = true;
        } else {
            showAlert('Lỗi: ' + (response ? response.message : 'Không rõ'), 'error');
            registerBtn.innerHTML = 'Đăng Ký Gói';
            registerBtn.disabled = false;
        }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'error');
        registerBtn.innerHTML = 'Đăng Ký Gói';
        registerBtn.disabled = false;
    }
}

// Thanh toán gói tiêm
window.vaccinationCheckout = async function() {
    if (!vaccinationData.currentPDV) {
        showAlert('Vui lòng đăng ký gói tiêm trước', 'warning');
        return;
    }

    try {
        const response = await apiCall('/api/vaccinations/checkout', {
            method: 'POST',
            body: JSON.stringify({
                maPDV: vaccinationData.currentPDV,
                khuyenMai: 0
            })
        });

        if (response && response.success) {
            showAlert('✓ Đăng ký gói tiêm thành công! Vui lòng thanh toán ở tab Hóa Đơn.', 'success');
            setTimeout(() => {
                const invoicesTab = document.querySelector('[data-tab="invoices"]');
                if (invoicesTab) invoicesTab.click();
            }, 500);
        } else {
            showAlert('Lỗi: ' + (response ? response.message : 'Không rõ'), 'error');
        }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'error');
    }
}

// ==================== INVOICE MANAGEMENT ====================
let invoiceData = {
    pendingInvoices: [],
    selectedInvoice: null,
    selectedPet: null,
    customerInfo: null
};

// Load danh sách hóa đơn chưa thanh toán
async function loadPendingInvoices() {
    const { maKhachHang } = getAuthData();
    console.log('Loading invoices for:', maKhachHang);
    try {
        const response = await apiCall(`/api/invoices/${maKhachHang}`);
        console.log('Invoice response:', response);
        if (response && response.data) {
            invoiceData.pendingInvoices = response.data;
            displayPendingInvoices();
            // Load customer info để lấy điểm tích lũy
            await loadCustomerLoyaltyPoints(maKhachHang);
        } else if (response && !response.success) {
            document.getElementById('invoices-list-container').innerHTML = 
                '<p style="color: #999; text-align: center;">Lỗi: ' + (response.message || 'Không thể tải hóa đơn') + '</p>';
        } else {
            document.getElementById('invoices-list-container').innerHTML = 
                '<p style="color: #999; text-align: center;">Bạn không có hóa đơn nào</p>';
        }
    } catch (err) {
        console.error('Lỗi load hóa đơn:', err);
        document.getElementById('invoices-list-container').innerHTML = 
            '<p style="color: #999; text-align: center;">Không thể tải hóa đơn - ' + err.message + '</p>';
    }
}

// Load điểm tích lũy khách hàng
async function loadCustomerLoyaltyPoints(maKhachHang) {
    try {
        const response = await apiCall(`/api/customer/info/${maKhachHang}`);
        if (response && response.data) {
            invoiceData.customerInfo = response.data;
            document.getElementById('current-points').textContent = response.data.DiemTichLuy || 0;
        }
    } catch (err) {
        console.error('Lỗi load điểm tích lũy:', err);
    }
}

// Hiển thị danh sách hóa đơn chưa thanh toán
function displayPendingInvoices() {
    const container = document.getElementById('invoices-list-container');
    
    if (!invoiceData.pendingInvoices || invoiceData.pendingInvoices.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px 20px;">Bạn không có phiếu dịch vụ nào</p>';
        return;
    }

    // Hiển thị tất cả phiếu theo mặc định
    filterInvoicesByType('all');
}

// Phân loại phiếu dịch vụ theo loại
window.filterInvoicesByType = function(type) {
    const container = document.getElementById('invoices-list-container');
    let filtered = invoiceData.pendingInvoices;

    // Phân loại dựa vào loại phiếu dịch vụ
    if (type !== 'all') {
        filtered = invoiceData.pendingInvoices.filter(invoice => {
            const invoiceType = invoice.LoaiPhieuDichVu || detectInvoiceType(invoice);
            return invoiceType === type;
        });
    }

    if (filtered.length === 0) {
        container.innerHTML = '<p style="color: #999; text-align: center; padding: 40px 20px;">Không có phiếu dịch vụ nào trong danh mục này</p>';
        return;
    }

    // Cập nhật trạng thái active của tab
    document.querySelectorAll('.invoice-sub-tab').forEach(btn => {
        btn.classList.remove('active');
        btn.style.borderColor = '#e5e7eb';
        btn.style.color = '#666';
        btn.style.background = 'white';
    });
    
    document.querySelector(`[data-type="${type}"]`).classList.add('active');
    document.querySelector(`[data-type="${type}"]`).style.borderColor = '#667eea';
    document.querySelector(`[data-type="${type}"]`).style.color = '#667eea';
    document.querySelector(`[data-type="${type}"]`).style.background = 'white';

    // Hiển thị phiếu đã lọc
    container.innerHTML = filtered.map(invoice => {
        const isThanhToan = invoice.TrangThaiThanhToan === 'Đã thanh toán';
        const invoiceType = invoice.LoaiPhieuDichVu || detectInvoiceType(invoice);
        const typeIcon = getTypeIcon(invoiceType);
        const typeLabel = getTypeLabel(invoiceType);
        
        return `
        <div style="border: 2px solid ${isThanhToan ? '#d1d5db' : '#e0e0e0'}; border-radius: 12px; padding: 15px; background: ${isThanhToan ? '#f3f4f6' : 'white'}; transition: all 0.3s;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px;">
                        <span style="font-size: 18px;">${typeIcon}</span>
                        <span style="font-size: 12px; color: #999; font-weight: 600;">${typeLabel}</span>
                    </div>
                    <p style="margin: 0; font-size: 12px; color: #999;">Phiếu Dịch Vụ</p>
                    <h3 style="margin: 5px 0 0 0; color: #333;">${invoice.MaPhieuDichVu}</h3>
                </div>
                <span style="background: ${getStatusColor(invoice.TrangThaiThanhToan).bg}; color: ${getStatusColor(invoice.TrangThaiThanhToan).text}; padding: 8px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; text-align: center;">
                    ${invoice.TrangThaiThanhToan === 'Đã thanh toán' ? '✓ Đã thanh toán' : invoice.TrangThaiThanhToan === 'Chờ xác nhận' ? '⏳ Chờ xác nhận' : '⏱️ Chưa thanh toán'}
                </span>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 15px; padding: 12px 0; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
                <div>
                    <p style="margin: 0; font-size: 12px; color: #666;">Chi Nhánh</p>
                    <p style="margin: 5px 0 0 0; color: #333; font-weight: 600;">${invoice.TenChiNhanh}</p>
                </div>
                <div>
                    <p style="margin: 0; font-size: 12px; color: #666;">Tổng Tiền</p>
                    <p style="margin: 5px 0 0 0; color: #667eea; font-weight: 600; font-size: 16px;">${(invoice.TongTien || 0).toLocaleString()} VNĐ</p>
                </div>
            </div>

            ${isThanhToan ? `
                <div style="padding: 12px; background: ${getStatusColor(invoice.TrangThaiThanhToan).bg}; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid ${getStatusColor(invoice.TrangThaiThanhToan).text};">
                    <p style="margin: 0; font-size: 12px; color: ${getStatusColor(invoice.TrangThaiThanhToan).text};">
                        <strong>✓ Mã hóa đơn:</strong> ${invoice.MaHoaDon}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: ${getStatusColor(invoice.TrangThaiThanhToan).text};">
                        <strong>📅 Ngày thanh toán:</strong> ${new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}
                    </p>
                    <p style="margin: 5px 0 0 0; font-size: 12px; color: ${getStatusColor(invoice.TrangThaiThanhToan).text};">
                        <strong>💳 Hình thức:</strong> ${invoice.HinhThucThanhToan}
                    </p>
                </div>
            ` : invoice.TrangThaiThanhToan === 'Chờ xác nhận' ? `
                <div style="padding: 12px; background: #fef3c7; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #f59e0b;">
                    <p style="margin: 0; font-size: 12px; color: #92400e;">
                        <strong>⏳ Trạng thái:</strong> Đang chờ quầy thanh toán xác nhận
                    </p>
                </div>
            ` : `
                <button onclick="openInvoicePaymentModal('${invoice.MaPhieuDichVu}', ${invoice.TongTien || 0}, '${invoice.MaThuCung || ''}')" 
                    style="width: 100%; padding: 12px; background: #10b981; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.3s;"
                    onmouseover="this.style.background='#059669'"
                    onmouseout="this.style.background='#10b981'">
                    <i class="fas fa-credit-card"></i> Thanh Toán Ngay
                </button>
            `}
        </div>
    `}).join('');
}

// Xác định loại phiếu dịch vụ dựa vào các thông tin có sẵn
function detectInvoiceType(invoice) {
    // Nếu có sẵn thuộc tính LoaiPhieuDichVu thì dùng
    if (invoice.LoaiPhieuDichVu) return invoice.LoaiPhieuDichVu;
    // Nếu không, mặc định trả về 'unknown' và server sẽ phải cung cấp thông tin loại phiếu
    return 'unknown';
}

// Lấy icon cho mỗi loại phiếu
function getTypeIcon(type) {
    const icons = {
        'exam': '🏥',
        'vaccine': '💉',
        'package': '🎁',
        'retail': '🛍️',
        'unknown': '📋'
    };
    return icons[type] || icons['unknown'];
}

// Lấy label cho mỗi loại phiếu
function getTypeLabel(type) {
    const labels = {
        'exam': 'Khám bệnh',
        'vaccine': 'Tiêm phòng',
        'package': 'Gói tiêm',
        'retail': 'Mua hàng',
        'unknown': 'Phiếu dịch vụ'
    };
    return labels[type] || labels['unknown'];
}

// Lấy màu cho trạng thái thanh toán
function getStatusColor(status) {
    const colors = {
        'Đã thanh toán': { bg: '#d1fae5', text: '#065f46' },
        'Chờ xác nhận': { bg: '#fef3c7', text: '#92400e' },
        'Chưa thanh toán': { bg: '#fee2e2', text: '#991b1b' }
    };
    return colors[status] || colors['Chưa thanh toán'];
}

// Mở modal thanh toán hóa đơn
window.openInvoicePaymentModal = async function(maPhieuDichVu, tongTien, maThuCung) {
    invoiceData.selectedInvoice = maPhieuDichVu;
    invoiceData.selectedPet = maThuCung || null;
    
    const modal = document.getElementById('invoice-payment-modal');
    modal.style.display = 'flex';

    // Cập nhật thông tin modal
    document.getElementById('invoice-modal-phieu-id').textContent = maPhieuDichVu;
    document.getElementById('invoice-modal-total').textContent = tongTien.toLocaleString() + ' VNĐ';
    document.getElementById('invoice-modal-original').textContent = tongTien.toLocaleString() + ' VNĐ';
    document.getElementById('invoice-modal-final').textContent = tongTien.toLocaleString() + ' VNĐ';
    document.getElementById('invoice-modal-points-input').value = '0';
    document.getElementById('invoice-modal-discount').textContent = '0 VNĐ';

    // Cập nhật điểm tích lũy
    const points = invoiceData.customerInfo ? invoiceData.customerInfo.DiemTichLuy : 0;
    document.getElementById('invoice-modal-points').textContent = points;
    document.getElementById('invoice-modal-points-input').max = points;
}

// Đóng modal thanh toán
window.closeInvoicePaymentModal = function() {
    document.getElementById('invoice-payment-modal').style.display = 'none';
    invoiceData.selectedInvoice = null;
}

// Tính toán giảm giá dựa trên điểm tích lũy
window.calculateInvoiceDiscount = function() {
    const pointsInput = document.getElementById('invoice-modal-points-input');
    const pointsUsed = Math.max(0, parseInt(pointsInput.value) || 0);
    
    const maxPoints = invoiceData.customerInfo ? invoiceData.customerInfo.DiemTichLuy : 0;
    if (pointsUsed > maxPoints) {
        showAlert(`Bạn chỉ có ${maxPoints} điểm tích lũy`, 'warning');
        pointsInput.value = maxPoints;
        return;
    }

    const originalTotal = parseFloat(
        document.getElementById('invoice-modal-total').textContent.replace(/[^0-9]/g, '')
    );
    const discount = pointsUsed * 1000; // 1 điểm = 1000 VNĐ
    const finalTotal = Math.max(0, originalTotal - discount);

    document.getElementById('invoice-modal-discount').textContent = discount.toLocaleString() + ' VNĐ';
    document.getElementById('invoice-modal-final').textContent = finalTotal.toLocaleString() + ' VNĐ';
}

// Xác nhận thanh toán hóa đơn
window.confirmInvoicePayment = async function() {
    const { maKhachHang } = getAuthData();
    const pointsUsed = parseInt(document.getElementById('invoice-modal-points-input').value) || 0;
    const paymentMethod = document.querySelector('input[name="invoice-payment-method"]:checked').value;

    if (!invoiceData.selectedInvoice) {
        showAlert('Chọn hóa đơn để thanh toán', 'warning');
        return;
    }

    const confirmBtn = event.target;
    confirmBtn.disabled = true;
    confirmBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';

    try {
        const response = await apiCall('/api/invoices/create', {
            method: 'POST',
            body: JSON.stringify({
                maPhieuDichVu: invoiceData.selectedInvoice,
                maKhachHang: maKhachHang,
                maThuCung: invoiceData.selectedPet || null,
                hinhThucThanhToan: paymentMethod,
                diemSuDung: pointsUsed
            })
        });

        if (response && response.success) {
            showAlert('✓ Thanh toán thành công! Mã hóa đơn: ' + response.data.maHoaDon, 'success');
            window.closeInvoicePaymentModal();
            setTimeout(() => {
                loadPendingInvoices();
            }, 1500);
        } else {
            showAlert('Lỗi: ' + (response ? response.message : 'Không rõ'), 'error');
            confirmBtn.disabled = false;
            confirmBtn.innerHTML = '<i class="fas fa-check"></i> Thanh Toán';
        }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'error');
        confirmBtn.disabled = false;
        confirmBtn.innerHTML = '<i class="fas fa-check"></i> Thanh Toán';
    }
}

// Hủy hóa đơn
window.cancelInvoicePayment = async function(maHoaDon, ngayLap) {
    if (!confirm('Bạn chắc chắn muốn hủy hóa đơn này?')) return;

    try {
        const response = await apiCall('/api/invoices/cancel', {
            method: 'POST',
            body: JSON.stringify({
                maHoaDon: maHoaDon,
                ngayLap: ngayLap
            })
        });

        if (response && response.success) {
            showAlert('✓ Hủy hóa đơn thành công! Điểm tích lũy đã được hoàn lại', 'success');
            setTimeout(() => {
                loadPendingInvoices();
            }, 1500);
        } else {
            showAlert('Lỗi: ' + (response ? response.message : 'Không rõ'), 'error');
        }
    } catch (err) {
        showAlert('Lỗi: ' + err.message, 'error');
    }
}