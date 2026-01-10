// Manager Dashboard Class
class ManagerDashboard {
    constructor() {
        this.currentUser = this.loadUser();
        this.staff = [];
        this.branches = [];
        this.customers = [];
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = '/login.html';
            return;
        }

        document.getElementById('userNameDisplay').innerText = `Quản Lí ${this.currentUser.name}`;
        
        // Setup menu events
        document.querySelectorAll('.menu-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(link.dataset.section);
            });
        });

        // Setup logout buttons
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());
        document.getElementById('logoutBtn2').addEventListener('click', () => this.logout());

        // Load initial data
        this.loadDashboard();
    }

    loadUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    switchSection(section) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(el => el.classList.remove('active'));
        // Show selected section
        const sectionEl = document.getElementById(section);
        if (sectionEl) sectionEl.classList.add('active');

        // Update menu active state
        document.querySelectorAll('.menu-link').forEach(link => link.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Load data based on section
        if (section === 'staff') this.loadStaff();
        else if (section === 'branches') this.loadBranches();
        else if (section === 'revenue') this.loadRevenue();
        else if (section === 'customers') this.loadCustomers();
    }

    async loadDashboard() {
        try {
            const token = localStorage.getItem('token');

            // Load branches
            const branchRes = await fetch('/api/branches', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const branchData = await branchRes.json();
            this.branches = branchData.data || branchData || [];

            // Mock data for stats
            document.getElementById('totalStaff').innerText = '24';
            document.getElementById('totalCustomers').innerText = '156';
            document.getElementById('totalRevenue').innerText = '125.5M₫';
            document.getElementById('avgRating').innerText = '4.7';

        } catch (err) {
            console.error('Lỗi tải dashboard:', err);
        }
    }

    async loadStaff() {
        try {
            const token = localStorage.getItem('token');
            
            // Since we don't have a dedicated endpoint, fetch from bookings data
            // In production, this would be /api/staff or similar
            const tbody = document.getElementById('staffTable');
            
            // Mock staff data
            const mockStaff = [
                { MaNhanVien: 'NV001', HoTen: 'Nguyễn Văn A', ChucVu: 'Bác sĩ thú y', MaChiNhanh: 'CN001', NgayVaoLam: '2023-01-15' },
                { MaNhanVien: 'NV002', HoTen: 'Trần Thị B', ChucVu: 'Nhân viên bán hàng', MaChiNhanh: 'CN001', NgayVaoLam: '2023-03-20' },
                { MaNhanVien: 'NV003', HoTen: 'Phạm Văn C', ChucVu: 'Tiếp tân', MaChiNhanh: 'CN002', NgayVaoLam: '2023-05-10' },
            ];

            tbody.innerHTML = mockStaff.map(staff => `
                <tr>
                    <td>${staff.HoTen}</td>
                    <td>${staff.ChucVu}</td>
                    <td>${staff.MaChiNhanh}</td>
                    <td>${new Date(staff.NgayVaoLam).toLocaleDateString('vi-VN')}</td>
                    <td><span class="status-badge status-active">Đang làm</span></td>
                    <td>
                        <button class="btn btn-primary btn-small">Sửa</button>
                        <button class="btn btn-small" style="background: var(--danger); color: var(--white);">Xóa</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải nhân viên:', err);
        }
    }

    async loadBranches() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/branches', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const branches = data.data || data || [];

            const tbody = document.getElementById('branchesTable');
            
            if (branches.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có chi nhánh nào</td></tr>';
                return;
            }

            tbody.innerHTML = branches.map(branch => `
                <tr>
                    <td>${branch.TenChiNhanh}</td>
                    <td>${branch.DiaChi}</td>
                    <td>${branch.DienThoai}</td>
                    <td>${branch.GioMoCua} - ${branch.GioDongCua}</td>
                    <td><span class="status-badge status-active">Hoạt động</span></td>
                    <td>
                        <button class="btn btn-primary btn-small">Sửa</button>
                        <button class="btn btn-small" style="background: var(--danger); color: var(--white);">Xóa</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải chi nhánh:', err);
        }
    }

    loadRevenue() {
        try {
            const tbody = document.getElementById('revenueTable');
            
            // Mock revenue data
            const mockRevenue = [
                { date: '2025-01-01', invoices: 5, revenue: 500000, discount: 0, total: 500000 },
                { date: '2025-01-02', invoices: 8, revenue: 850000, discount: 50000, total: 800000 },
                { date: '2025-01-03', invoices: 6, revenue: 720000, discount: 20000, total: 700000 },
            ];

            tbody.innerHTML = mockRevenue.map(r => `
                <tr>
                    <td>${new Date(r.date).toLocaleDateString('vi-VN')}</td>
                    <td>${r.invoices}</td>
                    <td>${this.formatCurrency(r.revenue)}</td>
                    <td>${this.formatCurrency(r.discount)}</td>
                    <td><strong>${this.formatCurrency(r.total)}</strong></td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải doanh thu:', err);
        }
    }

    async loadCustomers() {
        try {
            const token = localStorage.getItem('token');
            
            // Mock customer data
            const tbody = document.getElementById('customersTable');
            
            const mockCustomers = [
                { MaKhachHang: 'KH001', TenKhachHang: 'Lê Văn X', SoDienThoai: '0912345678', Email: 'lx@email.com', DiemTichLuy: 500 },
                { MaKhachHang: 'KH002', TenKhachHang: 'Hoàng Thị Y', SoDienThoai: '0987654321', Email: 'hy@email.com', DiemTichLuy: 1200 },
                { MaKhachHang: 'KH003', TenKhachHang: 'Đỗ Văn Z', SoDienThoai: '0901234567', Email: 'dz@email.com', DiemTichLuy: 800 },
            ];

            tbody.innerHTML = mockCustomers.map(cust => `
                <tr>
                    <td>${cust.TenKhachHang}</td>
                    <td>${cust.SoDienThoai}</td>
                    <td>${cust.Email}</td>
                    <td><span class="status-badge status-active">${cust.DiemTichLuy} điểm</span></td>
                    <td>
                        <button class="btn btn-primary btn-small">Chi Tiết</button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải khách hàng:', err);
        }
    }

    openStaffModal() {
        // Populate branches dropdown
        const select = document.getElementById('staffBranch');
        select.innerHTML = '<option value="">-- Chọn chi nhánh --</option>' + 
            this.branches.map(b => `<option value="${b.MaChiNhanh}">${b.TenChiNhanh}</option>`).join('');
        
        document.getElementById('staffModal').classList.add('active');
    }

    closeStaffModal() {
        document.getElementById('staffModal').classList.remove('active');
        document.getElementById('staffForm').reset();
    }

    async submitStaff(event) {
        event.preventDefault();
        alert('Lưu thông tin nhân viên thành công!');
        this.closeStaffModal();
        this.loadStaff();
    }

    openBranchModal() {
        document.getElementById('branchModal').classList.add('active');
    }

    closeBranchModal() {
        document.getElementById('branchModal').classList.remove('active');
        document.getElementById('branchForm').reset();
    }

    async submitBranch(event) {
        event.preventDefault();
        alert('Lưu thông tin chi nhánh thành công!');
        this.closeBranchModal();
        this.loadBranches();
    }

    filterRevenue() {
        alert('Lọc doanh thu theo tháng');
        this.loadRevenue();
    }

    formatCurrency(value) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(value);
    }

    logout() {
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.managerDashboard = new ManagerDashboard();
    });
} else {
    window.managerDashboard = new ManagerDashboard();
}
