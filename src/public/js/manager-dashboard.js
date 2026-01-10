// Manager Dashboard - Version 2
// Handles missing backend APIs gracefully with placeholder data

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        alert('Vui lòng đăng nhập để truy cập!');
        window.location.href = '/login.html';
        return;
    }
    
    if (user.role !== 'QuanLi') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '/login.html';
        return;
    }
    
    displayUserInfo(user);
    loadManagerData();
    loadSection('overview');
});

// Display user info in header
function displayUserInfo(user) {
    const userInfo = document.getElementById('user-info');
    if (userInfo) {
        userInfo.textContent = `Xin chào, ${user.name || user.hoTen || 'Quản Lí'}`;
    }
}

// Get branch ID from localStorage (set during login)
function getBranchId() {
    const maChiNhanh = localStorage.getItem('maChiNhanh');
    if (maChiNhanh) {
        return maChiNhanh;
    }
    
    // Fallback to extracting from maNhanVien if available
    const maNhanVien = localStorage.getItem('maNhanVien');
    if (maNhanVien && maNhanVien.length >= 8) {
        return maNhanVien.substring(0, 8);
    }
    
    return null;
}

// Load manager's data
async function loadManagerData() {
    try {
        const branchId = getBranchId();
        if (!branchId) {
            console.error('Cannot determine branch ID');
            return;
        }
        
        const token = localStorage.getItem('token');
        
        // Load staff count
        try {
            const staffResponse = await fetch(`/api/branches/staff/by-branch/${branchId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (staffResponse.ok) {
                const result = await staffResponse.json();
                console.log('Staff response:', result);
                const staffList = Array.isArray(result.data) ? result.data : [];
                document.getElementById('staffCount').textContent = staffList.length;
            } else {
                console.error('Staff API error:', staffResponse.status);
                document.getElementById('staffCount').textContent = '0';
            }
        } catch (e) {
            console.error('Error loading staff count:', e);
            document.getElementById('staffCount').textContent = '0';
        }
        
        // Load invoice count
        try {
            const invoiceResponse = await fetch(`/api/invoices/by-branch/${branchId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (invoiceResponse.ok) {
                const result = await invoiceResponse.json();
                console.log('Invoice response:', result);
                const invoiceList = Array.isArray(result.data) ? result.data : [];
                document.getElementById('invoiceCount').textContent = invoiceList.length;
            } else {
                console.error('Invoice API error:', invoiceResponse.status);
                document.getElementById('invoiceCount').textContent = '0';
            }
        } catch (e) {
            console.error('Error loading invoice count:', e);
            document.getElementById('invoiceCount').textContent = '0';
        }
        
        // Load revenue count (sum of all invoices)
        try {
            const invoiceResponse = await fetch(`/api/invoices/by-branch/${branchId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (invoiceResponse.ok) {
                const result = await invoiceResponse.json();
                const invoiceList = Array.isArray(result.data) ? result.data : [];
                const totalRevenue = invoiceList.reduce((sum, inv) => sum + (inv.tongTien || 0), 0);
                document.getElementById('revenueCount').textContent = formatVND(totalRevenue);
            } else {
                document.getElementById('revenueCount').textContent = '0₫';
            }
        } catch (e) {
            console.error('Error loading revenue:', e);
            document.getElementById('revenueCount').textContent = '0₫';
        }
        
        // Load customer count
        try {
            const customerResponse = await fetch(`/api/customer/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (customerResponse.ok) {
                const result = await customerResponse.json();
                console.log('Customer response:', result);
                const customerList = Array.isArray(result.data) ? result.data : [];
                document.getElementById('customerCount').textContent = customerList.length;
            } else {
                console.error('Customer API error:', customerResponse.status);
                document.getElementById('customerCount').textContent = '0';
            }
        } catch (e) {
            console.error('Error loading customer count:', e);
            document.getElementById('customerCount').textContent = '0';
        }
        
    } catch (error) {
        console.error('Error loading manager data:', error);
    }
}

// Format VND currency
function formatVND(amount) {
    if (!amount) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(amount);
}

// Load section based on user selection
function loadSection(section) {
    const branchId = getBranchId();
    
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(section);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Highlight active button
    const buttons = document.querySelectorAll('.nav-btn');
    buttons.forEach(btn => {
        if (btn.getAttribute('onclick')?.includes(`'${section}'`)) {
            btn.classList.add('active');
        }
    });
    
    // Load data based on section
    switch(section) {
        case 'overview':
            loadOverviewSection(branchId);
            break;
        case 'staff':
            loadStaffSection(branchId);
            break;
        case 'invoices':
            loadInvoicesSection(branchId);
            break;
        case 'revenue':
            loadRevenueSection(branchId);
            break;
    }
}

// Load overview section
async function loadOverviewSection(branchId) {
    try {
        const token = localStorage.getItem('token');
        
        // Load active staff count
        try {
            const staffResponse = await fetch(`/api/branches/staff/by-branch/${branchId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (staffResponse.ok) {
                const result = await staffResponse.json();
                const staffList = Array.isArray(result.data) ? result.data : [];
                document.getElementById('activeStaffCount').textContent = staffList.length;
            } else {
                document.getElementById('activeStaffCount').textContent = '0';
            }
        } catch (e) {
            console.error('Error loading active staff:', e);
            document.getElementById('activeStaffCount').textContent = '0';
        }
        
        // Load unpaid invoices count
        try {
            const invoiceResponse = await fetch(
                `/api/invoices/by-branch/${branchId}?trangThaiThanhToan=Chưa thanh toán`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (invoiceResponse.ok) {
                const result = await invoiceResponse.json();
                const unpaidList = Array.isArray(result.data) ? result.data : [];
                document.getElementById('unpaidInvoices').textContent = unpaidList.length;
            } else {
                document.getElementById('unpaidInvoices').textContent = '0';
            }
        } catch (e) {
            console.error('Error loading unpaid invoices:', e);
            document.getElementById('unpaidInvoices').textContent = '0';
        }
        
        // Load new customers
        try {
            const customerResponse = await fetch(`/api/customer/all`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (customerResponse.ok) {
                const result = await customerResponse.json();
                const customerList = Array.isArray(result.data) ? result.data : [];
                document.getElementById('newCustomers').textContent = customerList.length;
            } else {
                document.getElementById('newCustomers').textContent = '0';
            }
        } catch (e) {
            console.error('Error loading new customers:', e);
            document.getElementById('newCustomers').textContent = '0';
        }
        
        // Load today's revenue
        try {
            const invoiceResponse = await fetch(
                `/api/invoices/by-branch/${branchId}?trangThaiThanhToan=Đã thanh toán`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            if (invoiceResponse.ok) {
                const result = await invoiceResponse.json();
                const invoiceList = Array.isArray(result.data) ? result.data : [];
                const todayRevenue = invoiceList.reduce((sum, inv) => sum + (inv.tongTien || 0), 0);
                document.getElementById('todayRevenue').textContent = formatVND(todayRevenue);
            } else {
                document.getElementById('todayRevenue').textContent = '0₫';
            }
        } catch (e) {
            console.error('Error loading today revenue:', e);
            document.getElementById('todayRevenue').textContent = '0₫';
        }
        
    } catch (error) {
        console.error('Error loading overview:', error);
    }
}

// Load staff section
async function loadStaffSection(branchId) {
    try {
        const token = localStorage.getItem('token');
        const tbody = document.getElementById('staffTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>';
        
        const response = await fetch(`/api/branches/staff/by-branch/${branchId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const staff = Array.isArray(result.data) ? result.data : [];
        
        if (staff.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Không có nhân viên</td></tr>';
            return;
        }
        
        tbody.innerHTML = staff.map(emp => `
            <tr>
                <td>${emp.MaNhanVien || ''}</td>
                <td>${emp.HoTen || ''}</td>
                <td>${emp.viTriLamViec || ''}</td>
                <td>${emp.NgayVaoLam || ''}</td>
                <td>
                    <button class="action-btn" onclick="viewStaffDetail('${emp.MaNhanVien}')">
                        <i class="fas fa-eye"></i> Chi Tiết
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading staff:', error);
        const tbody = document.getElementById('staffTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Lỗi: ' + error.message + '</td></tr>';
        }
    }
}

// View staff details
function viewStaffDetail(maNhanVien) {
    alert(`Xem chi tiết nhân viên: ${maNhanVien}`);
}

// Load invoices section
async function loadInvoicesSection(branchId) {
    try {
        const token = localStorage.getItem('token');
        const tbody = document.getElementById('invoiceTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>';
        
        const statusFilter = document.getElementById('invoiceStatusFilter')?.value || '';
        const url = statusFilter 
            ? `/api/invoices/by-branch/${branchId}?trangThaiThanhToan=${encodeURIComponent(statusFilter)}`
            : `/api/invoices/by-branch/${branchId}`;
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const invoices = Array.isArray(result.data) ? result.data : [];
        
        if (invoices.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">Không có hóa đơn</td></tr>';
            return;
        }
        
        tbody.innerHTML = invoices.map(inv => {
            let statusClass = '';
            let statusText = inv.trangThaiThanhToan || 'Chưa thanh toán';
            
            if (statusText === 'Đã thanh toán') statusClass = 'status-confirmed';
            else if (statusText === 'Chờ xác nhận') statusClass = 'status-pending';
            else statusClass = 'status-unpaid';
            
            return `
                <tr>
                    <td>${inv.MaHoaDon || ''}</td>
                    <td>${inv.TenKhachHang || ''}</td>
                    <td>${formatVND(inv.tongTien || 0)}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${inv.NgayLap ? new Date(inv.NgayLap).toLocaleDateString('vi-VN') : ''}</td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        const tbody = document.getElementById('invoiceTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: red;">Lỗi: ' + error.message + '</td></tr>';
        }
    }
}

// Load revenue section
async function loadRevenueSection(branchId) {
    // Set current month as default
    const now = new Date();
    const monthInput = document.getElementById('revenueMonth');
    if (monthInput && !monthInput.value) {
        monthInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    
    await updateRevenueData(branchId);
}

// Update revenue data
async function updateRevenueData(branchId = null) {
    try {
        if (!branchId) {
            branchId = getBranchId();
        }
        
        const token = localStorage.getItem('token');
        const monthInput = document.getElementById('revenueMonth')?.value;
        
        let url = `/api/invoices/by-branch/${branchId}?trangThaiThanhToan=Đã thanh toán`;
        if (monthInput) {
            url += `&ngayTao=${monthInput}`;
        }
        
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        let invoices = Array.isArray(result.data) ? result.data : [];
        
        // Calculate metrics
        const totalRevenue = invoices.reduce((sum, inv) => sum + (inv.tongTien || 0), 0);
        const serviceRevenue = invoices.reduce((sum, inv) => sum + (inv.tongDichVu || 0), 0);
        const productRevenue = invoices.reduce((sum, inv) => sum + (inv.tongSanPham || 0), 0);
        
        // Update UI
        document.getElementById('monthTotalRevenue').textContent = formatVND(totalRevenue);
        document.getElementById('serviceRevenue').textContent = formatVND(serviceRevenue);
        document.getElementById('productRevenue').textContent = formatVND(productRevenue);
        document.getElementById('visitCount').textContent = invoices.length;
        
    } catch (error) {
        console.error('Error updating revenue data:', error);
        document.getElementById('monthTotalRevenue').textContent = '0₫';
        document.getElementById('serviceRevenue').textContent = '0₫';
        document.getElementById('productRevenue').textContent = '0₫';
        document.getElementById('visitCount').textContent = '0';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}
