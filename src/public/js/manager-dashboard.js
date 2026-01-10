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
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    
    // Show selected section
    const selectedSection = document.getElementById(section);
    if (selectedSection) {
        selectedSection.classList.add('active');
    }
    
    // Highlight active button
    const buttons = document.querySelectorAll('.tab-btn');
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
        
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>';
        
        const response = await fetch(`/api/staff/by-branch/${branchId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        const staff = Array.isArray(result.data) ? result.data : [];
        
        if (staff.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Không có nhân viên</td></tr>';
            return;
        }
        
        tbody.innerHTML = staff.map(emp => `
            <tr>
                <td>${emp.MaNhanVien || ''}</td>
                <td>${emp.HoTen || ''}</td>
                <td>${emp.ChucVu || ''}</td>
                <td>${emp.NgayVaoLam ? new Date(emp.NgayVaoLam).toLocaleDateString('vi-VN') : ''}</td>
                <td>
                    <button class="action-btn" onclick="openEditStaffModal('${emp.MaNhanVien}')" style="background-color: #2196F3;">
                        <i class="fas fa-edit"></i> S\u1eeda
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading staff:', error);
        const tbody = document.getElementById('staffTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Lỗi: ' + error.message + '</td></tr>';
        }
    }
}

// Open edit staff modal
async function openEditStaffModal(maNhanVien) {
    try {
        const response = await fetch(`/api/staff/${maNhanVien}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (!response.ok) {
            throw new Error('Không thể tải thông tin nhân viên');
        }

        const result = await response.json();
        const staff = result.data;

        // Display staff info
        document.getElementById('editStaffId').textContent = staff.MaNhanVien;
        document.getElementById('editStaffName').textContent = staff.HoTen;
        document.getElementById('editStaffDOB').textContent = staff.NgaySinh ? new Date(staff.NgaySinh).toLocaleDateString('vi-VN') : '';
        document.getElementById('editStaffGender').textContent = staff.GioiTinh;
        document.getElementById('editStaffHireDate').textContent = staff.NgayVaoLam ? new Date(staff.NgayVaoLam).toLocaleDateString('vi-VN') : '';

        // Set current position
        document.getElementById('editStaffPosition').value = staff.ChucVu;
        
        // Set doctor fields if applicable
        if (staff.ChucVu === 'Bác sĩ thú y' && staff.GioLamViec && staff.GioNghi) {
            document.getElementById('editStaffWorkStart').value = staff.GioLamViec;
            document.getElementById('editStaffWorkEnd').value = staff.GioNghi;
            document.getElementById('edit-doctor-fields').style.display = 'block';
        } else {
            document.getElementById('edit-doctor-fields').style.display = 'none';
        }

        // Load history
        await loadStaffHistory(maNhanVien);

        // Store current staff ID for form submission
        document.getElementById('edit-staff-form').dataset.maNhanVien = maNhanVien;

        // Show modal
        const modal = document.getElementById('edit-staff-modal');
        modal.classList.add('active');
    } catch (error) {
        alert('❌ Lỗi: ' + error.message);
    }
}

// Load staff history
async function loadStaffHistory(maNhanVien) {
    try {
        const response = await fetch(`/api/staff/history/${maNhanVien}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });

        if (response.ok) {
            const result = await response.json();
            const history = result.data || [];
            
            let historyHtml = history.map(h => `
                <div style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #ddd;">
                    <strong>${h.MaChiNhanh}</strong> - ${h.ViTri}<br>
                    <small>Từ: ${new Date(h.NgayBatDau).toLocaleDateString('vi-VN')} ${h.NgayKetThuc ? '→ ' + new Date(h.NgayKetThuc).toLocaleDateString('vi-VN') : '(Hiện tại)'}</small>
                </div>
            `).join('');
            
            document.getElementById('staffHistoryDisplay').innerHTML = historyHtml || 'Không có lịch sử';
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

// Update edit form fields based on position
function updateEditStaffFormFields() {
    const position = document.getElementById('editStaffPosition').value;
    const doctorFields = document.getElementById('edit-doctor-fields');
    
    if (position === 'Bác sĩ thú y') {
        doctorFields.style.display = 'block';
        document.getElementById('editStaffWorkStart').required = true;
        document.getElementById('editStaffWorkEnd').required = true;
    } else {
        doctorFields.style.display = 'none';
        document.getElementById('editStaffWorkStart').required = false;
        document.getElementById('editStaffWorkEnd').required = false;
    }
}

// Close edit modal
function closeEditStaffModal() {
    const modal = document.getElementById('edit-staff-modal');
    modal.classList.remove('active');
    document.getElementById('edit-staff-form').reset();
}

// Delete staff from modal
async function deleteStaffFromModal() {
    const maNhanVien = document.getElementById('edit-staff-form').dataset.maNhanVien;
    const staffName = document.getElementById('editStaffName').textContent;
    
    if (!confirm(`Bạn có chắc muốn xóa nhân viên ${staffName}?`)) {
        return;
    }

    try {
        const maChiNhanh = getBranchId();
        if (!maChiNhanh) {
            alert('Không tìm thấy chi nhánh!');
            return;
        }

        const response = await fetch('/api/staff/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                maNhanVien,
                maChiNhanh
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('✓ Xóa nhân viên thành công!');
            closeEditStaffModal();
            loadStaffSection(maChiNhanh);
        } else {
            alert('❌ Lỗi: ' + (result.message || 'Không rõ'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
    }
}

// Submit edit staff form
async function submitEditStaff() {
    const maNhanVien = document.getElementById('edit-staff-form').dataset.maNhanVien;
    const maChiNhanh = getBranchId();
    const chucVu = document.getElementById('editStaffPosition').value;

    if (!chucVu) {
        alert('Vui lòng chọn chức vụ!');
        return;
    }

    const submitBtn = document.getElementById('submit-edit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const formData = {
            maNhanVien,
            maChiNhanh,
            chucVu,
            gioLamViec: document.getElementById('editStaffWorkStart').value || null,
            gioNghi: document.getElementById('editStaffWorkEnd').value || null
        };

        const response = await fetch(`/api/staff/${maNhanVien}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('✓ Cập nhật nhân viên thành công!');
            closeEditStaffModal();
            loadStaffSection(maChiNhanh);
        } else {
            alert('❌ Lỗi: ' + (result.message || 'Không rõ'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu Thay Đổi';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu Thay Đổi';
    }
}

// Modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('close-edit-modal')?.addEventListener('click', closeEditStaffModal);
    document.getElementById('close-edit-btn')?.addEventListener('click', closeEditStaffModal);
    document.getElementById('delete-staff-btn')?.addEventListener('click', deleteStaffFromModal);
    document.getElementById('submit-edit-btn')?.addEventListener('click', submitEditStaff);

    document.getElementById('edit-staff-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'edit-staff-modal') {
            closeEditStaffModal();
        }
    });
});


// Load invoices section
async function loadInvoicesSection(branchId) {
    try {
        const token = localStorage.getItem('token');
        const tbody = document.getElementById('invoiceTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;"><i class="fas fa-spinner fa-spin"></i> Đang tải...</td></tr>';
        
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
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">Không có hóa đơn</td></tr>';
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
                    <td>${inv.NgayLap ? new Date(inv.NgayLap).toLocaleDateString('vi-VN') : ''}</td>
                    <td>${formatVND(inv.tongTien || 0)}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn-link" style="background: none; border: none; color: #2196F3; cursor: pointer; padding: 0.5rem;" onclick="openReviewModal('${inv.MaHoaDon}')">
                            <i class="fas fa-comment"></i> Đánh Giá
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        
    } catch (error) {
        console.error('Error loading invoices:', error);
        const tbody = document.getElementById('invoiceTableBody');
        if (tbody) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Lỗi: ' + error.message + '</td></tr>';
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

// ==================== STAFF MANAGEMENT FUNCTIONS ====================

// Open add staff modal
function openAddStaffModal() {
    const modal = document.getElementById('add-staff-modal');
    document.getElementById('add-staff-form').reset();
    document.getElementById('doctor-fields').style.display = 'none';
    
    // Set default hire date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('staffHireDate').value = today;
    
    // Load managers for the branch
    const maChiNhanh = getBranchId();
    if (maChiNhanh) {
        loadManagersForBranch(maChiNhanh);
    }
    
    modal.classList.add('active');
}

// Load managers by branch
async function loadManagersForBranch(maChiNhanh) {
    try {
        const response = await fetch(`/api/staff/managers/${maChiNhanh}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const managerSelect = document.getElementById('staffManager');
        
        // Clear existing options except the first one
        managerSelect.innerHTML = '<option value="">-- Không chọn --</option>';
        
        if (result.success && result.data.length > 0) {
            result.data.forEach(manager => {
                const option = document.createElement('option');
                option.value = manager.MaNhanVien;
                option.textContent = manager.HoTen;
                managerSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading managers:', error);
    }
}

// Close add staff modal
function closeAddStaffModal() {
    const modal = document.getElementById('add-staff-modal');
    modal.classList.remove('active');
}

// Update form fields based on position
function updateStaffFormFields() {
    const position = document.getElementById('staffPosition').value;
    const doctorFields = document.getElementById('doctor-fields');
    
    if (position === 'Bác sĩ thú y') {
        doctorFields.style.display = 'block';
        document.getElementById('staffWorkStart').required = true;
        document.getElementById('staffWorkEnd').required = true;
    } else {
        doctorFields.style.display = 'none';
        document.getElementById('staffWorkStart').required = false;
        document.getElementById('staffWorkEnd').required = false;
    }
}

// Submit add staff form
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-staff-form');
    if (form) {
        form.addEventListener('submit', submitAddStaff);
    }

    const closeBtn = document.getElementById('close-staff-modal');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddStaffModal);
    }

    const closeBtnSecondary = document.getElementById('close-staff-btn');
    if (closeBtnSecondary) {
        closeBtnSecondary.addEventListener('click', closeAddStaffModal);
    }

    document.getElementById('add-staff-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'add-staff-modal') {
            closeAddStaffModal();
        }
    });
});

async function submitAddStaff(e) {
    e.preventDefault();

    const maChiNhanh = getBranchId();
    if (!maChiNhanh) {
        alert('Không tìm thấy chi nhánh!');
        return;
    }

    // Get current manager's info from localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const maNhanVienQuanLi = localStorage.getItem('maNhanVien');
    const chucVu = document.getElementById('staffPosition').value;

    // Nếu thêm quản lí mới, người quản lí = null; Nếu thêm nhân viên khác, người quản lí = quản lí hiện tại
    const nguoiQuanLiSelected = document.getElementById('staffManager').value;
    const nguoiQuanLi = nguoiQuanLiSelected || (chucVu === 'Quản lí' ? null : maNhanVienQuanLi);

    const formData = {
        hoTen: document.getElementById('staffName').value,
        email: document.getElementById('staffEmail').value,
        ngaySinh: document.getElementById('staffDOB').value,
        gioiTinh: document.getElementById('staffGender').value,
        ngayVaoLam: document.getElementById('staffHireDate').value || new Date().toISOString().split('T')[0],
        chucVu: chucVu,
        maChiNhanh: maChiNhanh,
        nguoiQuanLi: nguoiQuanLi
    };

    // Add doctor-specific fields if applicable
    if (formData.chucVu === 'Bác sĩ thú y') {
        formData.gioLamViec = document.getElementById('staffWorkStart').value;
        formData.gioNghi = document.getElementById('staffWorkEnd').value;
    }

    const submitBtn = document.querySelector('#add-staff-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang thêm...';
    try {
        const response = await fetch('/api/staff/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            alert('✓ Thêm nhân viên thành công!');
            closeAddStaffModal();
            loadStaffSection(maChiNhanh);
        } else {
            alert('❌ Lỗi: ' + (result.message || 'Không rõ'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Thêm Nhân Viên';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-user-plus"></i> Thêm Nhân Viên';
    }
}

// View staff detail
function viewStaffDetail(maNhanVien) {
    console.log('Viewing staff:', maNhanVien);
    // This can be expanded later to show detailed view
}

// Open review modal
async function openReviewModal(maHoaDon) {
    try {
        const token = localStorage.getItem('token');
        
        // Fetch review data
        const response = await fetch(`/api/reviews/${maHoaDon}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        const review = result.data;

        // If no review exists
        if (!review) {
            alert('Khách hàng chưa đánh giá hóa đơn này');
            return;
        }

        // Fill invoice info
        document.getElementById('reviewInvoiceId').textContent = maHoaDon;
        document.getElementById('reviewCustomerName').textContent = review.TenKhachHang || '';

        // Build review content
        let reviewHTML = `
            <div style="border: 1px solid #ddd; padding: 1rem; border-radius: 4px;">
                <div style="margin-bottom: 1rem;">
                    <strong>Đánh Giá Chất Lượng Dịch Vụ:</strong>
                    <div style="color: #f39c12; font-size: 1.2rem; margin-top: 0.5rem;">
                        ${'★'.repeat(review.DiemChatLuongDichVu)}${'☆'.repeat(5 - review.DiemChatLuongDichVu)}
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <strong>Thái Độ Nhân Viên:</strong>
                    <div style="color: #f39c12; font-size: 1.2rem; margin-top: 0.5rem;">
                        ${'★'.repeat(review.ThaiDoNhanVien)}${'☆'.repeat(5 - review.ThaiDoNhanVien)}
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <strong>Mức Độ Hài Lòng:</strong>
                    <div style="color: #f39c12; font-size: 1.2rem; margin-top: 0.5rem;">
                        ${'★'.repeat(review.MucDoHaiLong)}${'☆'.repeat(5 - review.MucDoHaiLong)}
                    </div>
                </div>

                <div style="margin-bottom: 1rem;">
                    <strong>Bình Luận:</strong>
                    <div style="background: #fafafa; padding: 0.75rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #2196F3;">
                        ${review.BinhLuan || '(Không có bình luận)'}
                    </div>
                </div>

                <div style="margin-bottom: 1rem; padding-top: 1rem; border-top: 1px solid #eee;">
                    <strong>Phản Hồi Quản Lí:</strong>
                    <div style="background: #e8f5e9; padding: 0.75rem; margin-top: 0.5rem; border-radius: 4px; border-left: 3px solid #4caf50;">
                        ${review.PhanHoi || '(Chưa có phản hồi)'}
                    </div>
                </div>
            </div>
        `;

        document.getElementById('reviewContent').innerHTML = reviewHTML;

        // Show/hide feedback form based on whether feedback exists
        const feedbackForm = document.getElementById('reviewFeedbackForm');
        const submitBtn = document.getElementById('submit-feedback-btn');
        const textarea = document.getElementById('feedbackTextarea');

        if (!review.PhanHoi) {
            // No feedback yet - allow editing
            feedbackForm.style.display = 'block';
            submitBtn.style.display = 'block';
            textarea.value = '';
            textarea.focus();
        } else {
            // Feedback already exists - read only
            feedbackForm.style.display = 'none';
            submitBtn.style.display = 'none';
        }

        // Store invoice ID for later use
        document.getElementById('review-modal').dataset.maHoaDon = maHoaDon;

        // Show modal
        const modal = document.getElementById('review-modal');
        modal.classList.add('active');

    } catch (error) {
        console.error('Error loading review:', error);
        alert('❌ Lỗi: ' + error.message);
    }
}

// Close review modal
function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    modal.classList.remove('active');
}

// Submit feedback
async function submitFeedback() {
    const maHoaDon = document.getElementById('review-modal').dataset.maHoaDon;
    const phanHoi = document.getElementById('feedbackTextarea').value.trim();

    if (!phanHoi) {
        alert('Vui lòng nhập phản hồi!');
        return;
    }

    const submitBtn = document.getElementById('submit-feedback-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';

    try {
        const response = await fetch(`/api/reviews/${maHoaDon}/feedback`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ phanHoi })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();

        if (result.success) {
            alert('✓ Cập nhật phản hồi thành công!');
            closeReviewModal();
            loadSection('invoices');
        } else {
            alert('❌ Lỗi: ' + (result.message || 'Không rõ'));
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu Phản Hồi';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu Phản Hồi';
    }
}

// Review modal event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('close-review-modal')?.addEventListener('click', closeReviewModal);
    document.getElementById('close-review-btn')?.addEventListener('click', closeReviewModal);
    document.getElementById('submit-feedback-btn')?.addEventListener('click', submitFeedback);

    document.getElementById('review-modal')?.addEventListener('click', (e) => {
        if (e.target.id === 'review-modal') {
            closeReviewModal();
        }
    });
});

