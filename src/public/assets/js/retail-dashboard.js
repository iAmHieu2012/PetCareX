// Retail Staff Dashboard Class
class RetailDashboard {
    constructor() {
        this.currentUser = this.loadUser();
        this.products = [];
        this.customers = [];
        this.transactions = [];
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = '/login.html';
            return;
        }

        document.getElementById('userNameDisplay').innerText = `Nhân Viên ${this.currentUser.name}`;
        
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
        if (section === 'sales') this.loadCustomers();
        else if (section === 'inventory') this.loadInventory();
        else if (section === 'transactions') this.loadTransactions();
    }

    async loadDashboard() {
        try {
            const token = localStorage.getItem('token');

            // Load products
            const productsRes = await fetch('/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const productsData = await productsRes.json();
            this.products = (productsData.data || productsData || []);

            // Load customers (mock data)
            this.loadCustomersData();

            // Set today's stats
            document.getElementById('todaySales').innerText = '5';
            document.getElementById('todayRevenue').innerText = '2.5M₫';
            document.getElementById('itemsSold').innerText = '12';
            document.getElementById('commission').innerText = '250K₫';

            // Load recent transactions
            this.loadRecentTransactions();
        } catch (err) {
            console.error('Lỗi tải dashboard:', err);
        }
    }

    async loadCustomersData() {
        try {
            const token = localStorage.getItem('token');
            
            // Mock customer data since we don't have dedicated endpoint
            this.customers = [
                { MaKhachHang: 'KH001', TenKhachHang: 'Lê Văn X', SoDienThoai: '0912345678', TotalSpent: 5000000, PurchaseCount: 5 },
                { MaKhachHang: 'KH002', TenKhachHang: 'Hoàng Thị Y', SoDienThoai: '0987654321', TotalSpent: 3500000, PurchaseCount: 3 },
                { MaKhachHang: 'KH003', TenKhachHang: 'Đỗ Văn Z', SoDienThoai: '0901234567', TotalSpent: 2200000, PurchaseCount: 2 },
            ];
        } catch (err) {
            console.error('Lỗi tải khách hàng:', err);
        }
    }

    loadRecentTransactions() {
        const tbody = document.getElementById('recentTransactions');
        
        const mockTransactions = [
            { id: 'GD001', customer: 'Lê Văn X', time: new Date(Date.now() - 30 * 60000), amount: 500000, status: 'Thành công' },
            { id: 'GD002', customer: 'Hoàng Thị Y', time: new Date(Date.now() - 120 * 60000), amount: 750000, status: 'Thành công' },
            { id: 'GD003', customer: 'Đỗ Văn Z', time: new Date(Date.now() - 300 * 60000), amount: 1200000, status: 'Thành công' },
        ];

        tbody.innerHTML = mockTransactions.map(t => `
            <tr>
                <td>${t.id}</td>
                <td>${t.customer}</td>
                <td>${t.time.toLocaleString('vi-VN')}</td>
                <td>${this.formatCurrency(t.amount)}</td>
                <td><span style="color: var(--success); font-weight: bold;">${t.status}</span></td>
            </tr>
        `).join('');
    }

    async loadCustomers() {
        try {
            const tbody = document.getElementById('customersTable');
            
            if (this.customers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có khách hàng nào</td></tr>';
                return;
            }

            tbody.innerHTML = this.customers.map(cust => `
                <tr>
                    <td>${cust.TenKhachHang}</td>
                    <td>${cust.SoDienThoai}</td>
                    <td>${cust.PurchaseCount}</td>
                    <td>${this.formatCurrency(cust.TotalSpent)}</td>
                    <td>
                        <button class="btn btn-primary btn-small" onclick="window.retailDashboard.sellToCustomer('${cust.MaKhachHang}')">
                            Bán Hàng
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải khách hàng:', err);
        }
    }

    async loadInventory() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const products = data.data || data || [];

            const container = document.getElementById('productsList');
            
            if (products.length === 0) {
                container.innerHTML = '<p style="text-align: center; grid-column: 1/-1;">Không có sản phẩm nào</p>';
                return;
            }

            container.innerHTML = products.map(p => `
                <div class="product-card">
                    <div style="color: var(--primary); font-size: 32px; margin-bottom: 10px;">
                        <i class="fas fa-box"></i>
                    </div>
                    <div class="product-name">${p.TenSanPham}</div>
                    <div class="product-stock">Tồn: 50 cái</div>
                    <div class="product-price">${this.formatCurrency(p.GiaBan)}</div>
                    <button class="btn btn-primary btn-small" onclick="window.retailDashboard.addToCart('${p.MaSanPham}')">
                        Thêm
                    </button>
                </div>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải tồn kho:', err);
        }
    }

    loadTransactions() {
        try {
            const tbody = document.getElementById('transactionsTable');
            
            const mockTransactions = [
                { id: 'GD001', date: '2025-01-09', customer: 'Lê Văn X', product: 'Thức ăn chó', quantity: 2, amount: 500000 },
                { id: 'GD002', date: '2025-01-08', customer: 'Hoàng Thị Y', product: 'Cát mèo', quantity: 1, amount: 750000 },
                { id: 'GD003', date: '2025-01-07', customer: 'Đỗ Văn Z', product: 'Thuốc tẩy giun', quantity: 3, amount: 1200000 },
            ];

            tbody.innerHTML = mockTransactions.map(t => `
                <tr>
                    <td>${t.id}</td>
                    <td>${new Date(t.date).toLocaleDateString('vi-VN')}</td>
                    <td>${t.customer}</td>
                    <td>${t.product}</td>
                    <td>${t.quantity}</td>
                    <td>${this.formatCurrency(t.amount)}</td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải giao dịch:', err);
        }
    }

    startNewSale() {
        // Populate customer dropdown
        const customerSelect = document.getElementById('customerSelect');
        customerSelect.innerHTML = '<option value="">-- Chọn khách hàng --</option>' + 
            this.customers.map(c => `<option value="${c.MaKhachHang}">${c.TenKhachHang}</option>`).join('');

        // Populate product dropdown
        const productSelect = document.getElementById('productSelect');
        productSelect.innerHTML = '<option value="">-- Chọn sản phẩm --</option>' + 
            this.products.map(p => `<option value="${p.MaSanPham}">${p.TenSanPham} (${this.formatCurrency(p.GiaBan)})</option>`).join('');

        document.getElementById('saleModal').classList.add('active');
    }

    closeSaleModal() {
        document.getElementById('saleModal').classList.remove('active');
        document.getElementById('saleForm').reset();
    }

    async submitSale(event) {
        event.preventDefault();
        
        const customerId = document.getElementById('customerSelect').value;
        const productId = document.getElementById('productSelect').value;
        const quantity = document.getElementById('quantity').value;
        const hinhThucThanhToan = document.getElementById('hinhThucThanhToan').value;

        if (!customerId || !productId || !hinhThucThanhToan) {
            alert('Vui lòng chọn khách hàng, sản phẩm và hình thức thanh toán');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/retail/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    customerId: customerId,
                    branchId: localStorage.getItem('branchId') || 'CN00000001',
                    cartItems: [
                        {
                            MaSP: productId,
                            SoLuong: parseInt(quantity),
                            SoThuTu: 1
                        }
                    ],
                    hinhThucThanhToan: hinhThucThanhToan
                })
            });

            if (response.ok) {
                alert('Bán hàng thành công!');
                this.closeSaleModal();
                this.loadDashboard();
            }
        } catch (err) {
            console.error('Lỗi bán hàng:', err);
            alert('Không thể bán hàng');
        }
    }

    sellToCustomer(customerId) {
        document.getElementById('customerSelect').value = customerId;
        this.startNewSale();
    }

    addToCart(productId) {
        alert(`Thêm sản phẩm ${productId} vào giỏ hàng`);
        // Implementation for add to cart
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
        window.retailDashboard = new RetailDashboard();
    });
} else {
    window.retailDashboard = new RetailDashboard();
}
