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
// Thêm vào script xử lý dashboard
async function loadPetHistory(maThuCung) {
    const historyContent = document.getElementById('history-content');
    if (!maThuCung) {
        historyContent.innerHTML = '<p style="color: #999;">Chọn thú cưng để xem lịch sử...</p>';
        return;
    }

    try {
        historyContent.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang tải...';
        const response = await fetch(`/api/customer/pets/history/${maThuCung}`).then(res => res.json());
        
        if (response.success) {
            const { checkups, vaccinations, packages } = response.data;
            let html = '';

            // Render Gói tiêm đã mua
            html += '<strong>Gói tiêm đã mua:</strong>';
            html += packages.length ? packages.map(p => `<div class="history-item">${p.MaGoiTiem} - ${p.LoaiGoiTiem} (${new Date(p.NgayDangKy).toLocaleDateString()})</div>`).join('') : '<p>Chưa mua gói</p>';

            // Render Khám bệnh
            html += '<hr><strong>Khám bệnh gần nhất:</strong>';
            html += checkups.length ? checkups.map(c => `<div class="history-item">📅 ${new Date(c.NgayHenTaiKham).toLocaleDateString()}: ${c.ChuanDoan}</div>`).join('') : '<p>Chưa có dữ liệu</p>';

            // Render Tiêm phòng
            html += '<hr><strong>Tiêm phòng gần nhất:</strong>';
            html += vaccinations.length ? vaccinations.map(v => `<div class="history-item">💉 ${v.TenVacxin} (${new Date(v.NgayTiem).toLocaleDateString()})</div>`).join('') : '<p>Chưa có dữ liệu</p>';

            historyContent.innerHTML = html;
        }
    } catch (err) {
        historyContent.innerHTML = '<p style="color: red;">Lỗi tải dữ liệu</p>';
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

    // setupEventListeners() {
    //     // Logout button
    //     document.getElementById('logout-btn').addEventListener('click', () => {
    //         if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
    //             localStorage.clear();
    //             window.location.href = '/login.html';
    //         }
    //     });

    //     // Pet management
    //     document.getElementById('add-pet-btn').addEventListener('click', () => {
    //         this.showModal('add-pet-modal');
    //     });

    //     document.getElementById('add-pet-form').addEventListener('submit', (e) => {
    //         e.preventDefault();
    //         this.addPet();
    //     });

    //     document.getElementById('cancel-pet-btn').addEventListener('click', () => {
    //         this.hideModal('add-pet-modal');
    //     });

    //     // Booking management
    //     document.getElementById('new-booking-btn').addEventListener('click', async () => {
    //         // Refresh pets list trước khi mở modal để đảm bảo thú cưng mới tạo hiện lên
    //         await this.loadPets();
    //         this.populateBookingPets();
    //         this.showModal('booking-modal');
    //     });

    //     document.getElementById('booking-form').addEventListener('submit', (e) => {
    //         e.preventDefault();
    //         this.createBooking();
    //     });

    //     document.getElementById('cancel-booking-btn').addEventListener('click', () => {
    //         this.hideModal('booking-modal');
    //     });

    //     // Booking filters
    //     document.querySelectorAll('.filter-btn').forEach(btn => {
    //         btn.addEventListener('click', (e) => {
    //             document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    //             e.target.classList.add('active');
    //             this.currentFilter = e.target.dataset.filter;
    //             this.renderBookings();
    //         });
    //     });
    // }

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

                // Reload data if needed
                if (tabName === 'profile') {
                    this.renderProfile();
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
            const response = await apiCall(`/api/customer/pets/history/${maThuCung}`);
            
            if (response && response.success) {
                const { checkups, vaccinations, packages } = response.data;

                let html = '';

                // 1. Render Gói tiêm đã mua
                html += '<p style="font-weight:700; color:var(--primary); margin-bottom:10px;"><i class="fas fa-box"></i> Gói tiêm đã sở hữu:</p>';
                if (packages && packages.length > 0) {
                    html += packages.map(p => `
                        <div class="history-item" style="border-left: 3px solid var(--success); background: #f0fdf4;">
                            <strong>${p.TenGoiTiem}</strong>
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
            MaKhachHang: maKhachHang,
            TenThuCung: form.petName.value,
            Loai: form.petType.value,
            Giong: form.petBreed.value || null,
            NgaySinh: form.petDOB.value,
            GioiTinh: form.petGender.value || null,
            TinhTrang: form.petHealth.value || 'Bình thường'
        };

        const response = await apiCall('/api/customer/pets', {
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
        const response = await apiCall(`/api/customer/bookings/${maKhachHang}`);

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

        const response = await apiCall('/api/customer/bookings', {
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
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new CustomerDashboard();
});
