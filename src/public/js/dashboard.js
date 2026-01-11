import { api } from './api.js';

// ==================== REPORT JS INTEGRATION ====================
let revenueChart = null;
let doctorChart = null;

// Định dạng tiền tệ VND
const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Check if user is logged in
    if (!token) {
        alert('Vui lòng đăng nhập để truy cập dashboard!');
        window.location.href = '/login.html';
        return;
    }
    
    // Check if user has Admin or QuanLi role
    if (user.role !== 'Admin' && user.role !== 'QuanLi') {
        alert('Bạn không có quyền truy cập trang này!');
        window.location.href = '/login.html';
        return;
    }
    
    // Display user info
    displayUserInfo(user);
    
    // Load dashboard data
    loadDashboardData();
    
    // Load default section
    loadSection('overview');
});

function displayUserInfo(user) {
    const userInfoElement = document.getElementById('user-info');
    const roleBadgeElement = document.getElementById('role-badge');
    
    userInfoElement.textContent = `Xin chào, ${user.name || 'Quản trị viên'}`;
    
    // Display role badge
    if (user.role === 'Admin') {
        roleBadgeElement.textContent = 'Admin';
        roleBadgeElement.style.background = 'rgba(255, 159, 67, 0.3)';
    } else if (user.role === 'QuanLi') {
        roleBadgeElement.textContent = 'Quản lý';
        roleBadgeElement.style.background = 'rgba(102, 126, 234, 0.3)';
    }
}

async function loadDashboardData() {
    try {
        // Load branches count
        const branchesRes = await api.getBranches();
        const branches = branchesRes.data || branchesRes;
        document.getElementById('stat-branches').textContent = (Array.isArray(branches) ? branches.length : 0) || 0;
        
        // Load services count
        const servicesRes = await api.getServices();
        const services = servicesRes.data || servicesRes;
        document.getElementById('stat-services').textContent = (Array.isArray(services) ? services.length : 0) || 0;
        
        // Load staff count
        const staffRes = await api.getStaffCount();
        const staffData = staffRes.data || staffRes;
        document.getElementById('stat-staff').textContent = staffData.count || 0;
        
        // Load customers count
        const customersRes = await api.getCustomersCount();
        const customersData = customersRes.data || customersRes;
        document.getElementById('stat-customers').textContent = customersData.count || 0;
        
    } catch (err) {
        console.error('Error loading dashboard data:', err);
        // Set default values on error
        document.getElementById('stat-branches').textContent = '0';
        document.getElementById('stat-services').textContent = '0';
        document.getElementById('stat-staff').textContent = '0';
        document.getElementById('stat-customers').textContent = '0';
    }
}

function loadSection(section) {
    // Update active button
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event?.target?.classList) {
        event.target.classList.add('active');
    }
    
    // Reset display for all main sections
    const contentSection = document.getElementById('content-section');
    const staffDiv = document.getElementById('staff');
    if (contentSection) contentSection.style.display = 'block';
    if (staffDiv) staffDiv.style.display = 'none';
    
    switch(section) {
        case 'overview':
            contentSection.innerHTML = `
                <h2><i class="fas fa-home"></i> Tổng quan hệ thống</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
                    <div style="background: #f8faff; padding: 1.5rem; border-radius: 10px;">
                        <h3 style="color: var(--primary); margin-bottom: 1rem;">
                            <i class="fas fa-info-circle"></i> Thông tin hệ thống
                        </h3>
                        <p style="color: var(--text-light); line-height: 1.8;">
                            Hệ thống quản lý PetCareX đang hoạt động bình thường. 
                            Bạn có thể quản lý các chi nhánh, nhân viên, dịch vụ và khách hàng từ đây.
                        </p>
                    </div>
                    <div style="background: #f8faff; padding: 1.5rem; border-radius: 10px;">
                        <h3 style="color: var(--accent); margin-bottom: 1rem;">
                            <i class="fas fa-bell"></i> Thông báo
                        </h3>
                        <p style="color: var(--text-light); line-height: 1.8;">
                            Không có thông báo mới nào.
                        </p>
                    </div>
                </div>
            `;
            break;
            
        case 'branches':
            loadBranchesSection();
            break;
            
        case 'staff':
            loadStaffSection();
            break;
            
        case 'services':
            loadServicesSection();
            break;
            
        case 'customers':
            loadCustomersSection();
            break;
            
        case 'reports':
            loadReportsSection();
            break;
    }
}

async function loadBranchesSection() {
    const contentSection = document.getElementById('content-section');
    contentSection.innerHTML = `
        <h2><i class="fas fa-building"></i> Quản lý Chi nhánh</h2>
        <div id="branches-list" style="display: grid; gap: 1rem;">
            <p style="text-align: center; color: var(--text-light); padding: 2rem;">
                <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </p>
        </div>
    `;
    
    try {
        const branchesRes = await api.getBranches();
        const branches = branchesRes.data || branchesRes || [];
        const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false
        });
        
        if (!Array.isArray(branches) || branches.length === 0) {
            document.getElementById('branches-list').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-building"></i>
                    <p>Chưa có chi nhánh nào trong hệ thống.</p>
                </div>
            `;
            return;
        }
        
        const branchesHTML = branches.map(branch => `
            <div style="background: #f8faff; padding: 1.5rem; border-radius: 10px; border-left: 4px solid var(--primary);">
                <h3 style="color: var(--text-dark); margin-bottom: 1rem;">
                    <i class="fas fa-building" style="color: var(--primary);"></i>
                    ${branch.TenChiNhanh || 'N/A'}
                </h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; color: var(--text-light);">
                    <div>
                        <i class="fas fa-map-marker-alt"></i> 
                        <strong>Địa chỉ:</strong><br>
                        ${branch.DiaChi || 'N/A'}
                    </div>
                    <div>
                        <i class="fas fa-phone"></i> 
                        <strong>Điện thoại:</strong><br>
                        ${branch.DienThoai || 'N/A'}
                    </div>
                    <div>
                        <i class="fas fa-clock"></i> 
                        <strong>Giờ làm việc:</strong><br>
                        ${branch.GioMoCua ? timeFormatter.format(new Date(branch.GioMoCua)) : 'N/A'} - 
                        ${branch.GioDongCua ? timeFormatter.format(new Date(branch.GioDongCua)) : 'N/A'}
                    </div>
                </div>
            </div>
        `).join('');
        
        document.getElementById('branches-list').innerHTML = branchesHTML;
    } catch (err) {
        console.error('Error loading branches:', err);
        document.getElementById('branches-list').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi khi tải dữ liệu chi nhánh: ${err.message}</p>
            </div>
        `;
    }
}

async function loadServicesSection() {
    const contentSection = document.getElementById('content-section');
    contentSection.innerHTML = `
        <h2><i class="fas fa-concierge-bell"></i> Quản lý Dịch vụ</h2>
        <div id="services-list" style="display: flex; flex-direction: column; gap: 1rem;">
            <p style="text-align: center; color: var(--text-light); padding: 2rem;">
                <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </p>
        </div>
    `;
    
    try {
        const servicesRes = await api.getServices();
        const services = servicesRes.data || servicesRes || [];
        const icons = ['fa-stethoscope', 'fa-syringe', 'fa-cut', 'fa-bath', 'fa-tooth', 'fa-wave-square', 'fa-vials', 'fa-heartbeat'];
        
        if (!Array.isArray(services) || services.length === 0) {
            document.getElementById('services-list').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-concierge-bell"></i>
                    <p>Chưa có dịch vụ nào trong hệ thống.</p>
                </div>
            `;
            return;
        }
        
        const servicesHTML = services.map((service, i) => `
            <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-left: 4px solid var(--primary); display: flex; align-items: center; gap: 1.5rem;">
                <div style="flex-shrink: 0;">
                    <i class="fas ${icons[i] || 'fa-paw'}" style="font-size: 2rem; color: var(--primary);"></i>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: var(--text-dark); margin: 0 0 0.5rem 0;">
                        ${service.TenDichVu || 'N/A'}
                    </h3>
                    <p style="color: var(--text-light); font-size: 0.9rem; margin: 0;">
                        ${service.MoTa || 'Chưa có mô tả'}
                    </p>
                </div>
            </div>
        `).join('');
        
        document.getElementById('services-list').innerHTML = servicesHTML;
    } catch (err) {
        console.error('Error loading services:', err);
        document.getElementById('services-list').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi khi tải dữ liệu dịch vụ: ${err.message}</p>
            </div>
        `;
    }
}

async function loadCustomersSection() {
    const contentSection = document.getElementById('content-section');
    contentSection.innerHTML = `
        <h2><i class="fas fa-user-friends"></i> Quản lý Khách hàng</h2>
        
        <div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">
                <i class="fas fa-search"></i> Tìm kiếm Khách hàng
            </h3>
            <form id="customer-search-form" onsubmit="handleCustomerSearch(event)" style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 600; font-size: 0.9rem;">
                        <i class="fas fa-phone"></i> Số điện thoại / Email / CCCD
                    </label>
                    <input type="text" id="customer-search-input" placeholder="VD: 0912345678 hoặc email@example.com" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;"
                           onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='#e0e0e0'" required>
                </div>
                <div>
                    <button type="submit" style="padding: 0.75rem 2rem; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s; white-space: nowrap;"
                            onmouseover="this.style.background='var(--secondary)'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='var(--primary)'; this.style.transform='translateY(0)'">
                        <i class="fas fa-search"></i> Tìm kiếm
                    </button>
                </div>
            </form>
        </div>
        
        <div id="customer-details-container">
            <p style="text-align: center; color: var(--text-light); padding: 2rem;">
                <i class="fas fa-info-circle"></i> Nhập thông tin khách hàng ở trên để xem chi tiết và danh sách thú cưng
            </p>
        </div>
    `;
}

async function handleCustomerSearch(event) {
    event.preventDefault();
    
    const searchInput = document.getElementById('customer-search-input').value.trim();
    
    if (!searchInput) {
        alert('Vui lòng nhập thông tin tìm kiếm!');
        return;
    }
    
    const container = document.getElementById('customer-details-container');
    container.innerHTML = `
        <p style="text-align: center; color: var(--text-light); padding: 2rem;">
            <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </p>
    `;
    
    try {
        const token = localStorage.getItem('token');
        
        // Try searching customer by various fields
        const response = await fetch(`/api/customer/search?q=${encodeURIComponent(searchInput)}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) {
            throw new Error('Không tìm thấy khách hàng');
        }
        
        const result = await response.json();
        const customer = result.data || result;
        
        if (!customer || !customer.MaKhachHang) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle" style="color: #e74c3c;"></i>
                    <p>Không tìm thấy khách hàng với thông tin: <strong>${searchInput}</strong></p>
                </div>
            `;
            return;
        }
        
        // Load customer's pets
        const petsResponse = await fetch(`/api/customer/pets/${customer.MaKhachHang}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        let pets = [];
        if (petsResponse.ok) {
            const petsResult = await petsResponse.json();
            pets = Array.isArray(petsResult.data) ? petsResult.data : (Array.isArray(petsResult) ? petsResult : []);
        }
        
        displayCustomerDetails(customer, pets);
    } catch (err) {
        console.error('Error searching customer:', err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi: ${err.message}</p>
            </div>
        `;
    }
    
    return false;
}

function displayCustomerDetails(customer, pets) {
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const customerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #f0f0f0;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">
                    <i class="fas fa-user"></i>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: var(--text-dark); margin: 0 0 0.5rem 0; font-size: 1.5rem;">
                        ${customer.TenKhachHang || 'N/A'}
                    </h3>
                    <p style="color: var(--text-light); margin: 0; font-size: 0.9rem;">
                        Mã: <strong>${customer.MaKhachHang || 'N/A'}</strong>
                    </p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div style="background: #f8faff; padding: 1.5rem; border-radius: 10px; border-left: 4px solid var(--primary);">
                    <h4 style="color: var(--primary); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-info-circle"></i> Thông tin Khách hàng
                    </h4>
                    <div style="display: grid; gap: 0.75rem; color: var(--text-dark);">
                        <div>
                            <strong style="color: var(--text-light);">Số điện thoại:</strong><br>
                            <span style="font-size: 1.1rem;">${customer.SoDienThoai || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">Email:</strong><br>
                            <span style="font-size: 1.1rem;">${customer.Email || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">CCCD:</strong><br>
                            <span style="font-size: 1.1rem;">${customer.CCCD || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: var(--primary); margin-top: 0; margin-bottom: 1.5rem;">
                <i class="fas fa-paw"></i> Danh sách Thú cưng (${pets.length})
            </h3>
            
            ${pets.length === 0 ? `
                <div class="empty-state">
                    <i class="fas fa-paw"></i>
                    <p>Khách hàng này chưa có thú cưng nào trong hệ thống</p>
                </div>
            ` : `
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem;">
                    ${pets.map(pet => `
                        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.2);">
                                <div style="width: 50px; height: 50px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">
                                    <i class="fas fa-paw"></i>
                                </div>
                                <div>
                                    <h4 style="margin: 0; font-size: 1.1rem;">${pet.TenThuCung || 'N/A'}</h4>
                                    <p style="margin: 0; font-size: 0.85rem; opacity: 0.9;">Mã: ${pet.MaThuCung}</p>
                                </div>
                            </div>
                            <div style="font-size: 0.9rem; line-height: 1.6;">
                                <p style="margin: 0.5rem 0;"><strong>Loài:</strong> ${pet.Loai || 'N/A'}</p>
                                <p style="margin: 0.5rem 0;"><strong>Giống:</strong> ${pet.Giong || 'N/A'}</p>
                                <p style="margin: 0.5rem 0;"><strong>Giới tính:</strong> ${pet.GioiTinh || 'N/A'}</p>
                                <p style="margin: 0.5rem 0;"><strong>Ngày sinh:</strong> ${pet.NgaySinh ? dateFormatter.format(new Date(pet.NgaySinh)) : 'N/A'}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `}
        </div>
    `;
    
    document.getElementById('customer-details-container').innerHTML = customerHTML;
}

async function loadStaffSection() {
    const staffDiv = document.getElementById('staff');
    if (!staffDiv) return;
    
    staffDiv.style.display = 'block';
    document.getElementById('content-section').style.display = 'none';
    
    try {
        const token = localStorage.getItem('token');
        
        // Load branches for filter dropdown
        const branchRes = await fetch('/api/branches', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (branchRes.ok) {
            const branchResult = await branchRes.json();
            const branches = Array.isArray(branchResult.data) ? branchResult.data : (Array.isArray(branchResult) ? branchResult : []);
            
            const filterBranch = document.getElementById('filterBranch');
            filterBranch.innerHTML = '<option value="">-- Tất cả chi nhánh --</option>';
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.MaChiNhanh || branch.maChiNhanh;
                option.textContent = branch.TenChiNhanh || branch.tenChiNhanh;
                filterBranch.appendChild(option);
            });
        }
        
        // Load all staff
        const staffRes = await fetch('/api/staff/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!staffRes.ok) {
            throw new Error(`HTTP error! status: ${staffRes.status}`);
        }
        
        const staffResult = await staffRes.json();
        const allStaff = Array.isArray(staffResult.data) ? staffResult.data : (Array.isArray(staffResult) ? staffResult : []);
        
        // Store for filtering
        window.allStaffData = allStaff;
        
        // Display staff
        window.filterStaff();
        
    } catch (error) {
        console.error('Error loading staff:', error);
        const tbody = document.getElementById('staffTableBody');
        if (tbody) {
            tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red; padding: 2rem;">Lỗi: ${error.message}</td></tr>`;
        }
    }
}

window.filterStaff = function() {
    const filterBranch = document.getElementById('filterBranch')?.value || '';
    const filterPosition = document.getElementById('filterPosition')?.value || '';
    const filterSearch = document.getElementById('filterSearch')?.value?.toLowerCase() || '';
    const tbody = document.getElementById('staffTableBody');
    
    if (!tbody || !window.allStaffData) return;
    
    let filtered = window.allStaffData;
    
    // Apply filters
    if (filterBranch) {
        filtered = filtered.filter(s => (s.MaChiNhanh || s.maChiNhanh) === filterBranch);
    }
    
    if (filterPosition) {
        filtered = filtered.filter(s => s.ChucVu === filterPosition);
    }
    
    if (filterSearch) {
        filtered = filtered.filter(s => {
            const name = (s.HoTen || s.hoTen || '').toLowerCase();
            const id = (s.MaNhanVien || s.maNhanVien || '').toLowerCase();
            return name.includes(filterSearch) || id.includes(filterSearch);
        });
    }
    
    // Display filtered staff
    if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem;">Không có nhân viên phù hợp</td></tr>';
        return;
    }
    
    tbody.innerHTML = filtered.map(emp => {
        const hireDate = emp.NgayVaoLam || emp.ngayVaoLam;
        const formattedDate = hireDate ? new Date(hireDate).toLocaleDateString('vi-VN') : '';
        
        return `
            <tr style="border-bottom: 1px solid #e0e0e0;">
                <td style="padding: 1rem;">${emp.MaNhanVien || emp.maNhanVien || ''}</td>
                <td style="padding: 1rem;">${emp.HoTen || emp.hoTen || ''}</td>
                <td style="padding: 1rem;">${emp.ChucVu || emp.chucVu || ''}</td>
                <td style="padding: 1rem;">${emp.TenChiNhanh || emp.tenChiNhanh || ''}</td>
                <td style="padding: 1rem;">${formattedDate}</td>
                <td style="padding: 1rem; text-align: center;">
                    <button onclick="window.openEditStaffModal('${emp.MaNhanVien || emp.maNhanVien}')" style="background: #2196F3; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; margin-right: 0.5rem;">
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
};

window.openAddStaffModal = function() {
    const modal = document.getElementById('add-staff-modal');
    if (!modal) return;
    
    // Reset form
    document.getElementById('add-staff-form').reset();
    document.getElementById('doctor-fields').style.display = 'none';
    
    // Load branches
    loadBranchesForAddModal();
    
    // Show modal
    modal.style.display = 'flex';
};

async function loadBranchesForAddModal() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/branches', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const branches = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
            
            const select = document.getElementById('staffBranch');
            if (!select) {
                console.error('staffBranch element not found');
                return;
            }
            select.innerHTML = '<option value="">-- Chọn chi nhánh --</option>';
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.MaChiNhanh || branch.maChiNhanh;
                option.textContent = branch.TenChiNhanh || branch.tenChiNhanh;
                select.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

window.closeAddStaffModal = function() {
    const modal = document.getElementById('add-staff-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('add-staff-form').reset();
    }
};

window.updateStaffFormFields = function() {
    const position = document.getElementById('staffPosition')?.value;
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
};

window.submitAddStaff = async function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để tiếp tục!');
        window.location.href = '/login.html';
        return;
    }
    
    const staffName = document.getElementById('staffName').value;
    const staffEmail = document.getElementById('staffEmail').value;
    const staffDOB = document.getElementById('staffDOB').value;
    const staffGender = document.getElementById('staffGender').value;
    const staffHireDate = document.getElementById('staffHireDate').value;
    const staffPosition = document.getElementById('staffPosition').value;
    const staffBranch = document.getElementById('staffBranch').value;
    
    if (!staffName || !staffEmail || !staffDOB || !staffGender || !staffPosition || !staffBranch) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc!');
        return;
    }
    
    const formData = {
        hoTen: staffName,
        email: staffEmail,
        ngaySinh: staffDOB,
        gioiTinh: staffGender,
        ngayVaoLam: staffHireDate || null,
        chucVu: staffPosition,
        maChiNhanh: staffBranch
    };
    
    // Add doctor fields if applicable
    if (staffPosition === 'Bác sĩ thú y') {
        formData.gioLamViec = document.getElementById('staffWorkStart').value;
        formData.gioNghi = document.getElementById('staffWorkEnd').value;
    }
    
    try {
        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang thêm...';
        
        const response = await fetch('/api/staff/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success || result.data) {
            alert('✓ Thêm nhân viên thành công!');
            window.closeAddStaffModal();
            loadStaffSection();
        } else {
            alert('❌ ' + (result.message || 'Lỗi khi thêm nhân viên'));
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Thêm Nhân Viên';
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
    }
};

window.openEditStaffModal = async function(maNhanVien) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/staff/${maNhanVien}`, {
            headers: { 'Authorization': `Bearer ${token}` }
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
        
        // Load branches
        await loadBranchesForEditModal();
        
        // Set current branch
        const branchSelect = document.getElementById('editStaffBranch');
        if (branchSelect) {
            branchSelect.value = staff.MaChiNhanh;
        }
        
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
        modal.style.display = 'flex';
        
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
    }
};

async function loadBranchesForEditModal() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/branches', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const branches = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : []);
            
            const selectCurrent = document.getElementById('editStaffBranch');
            const selectNew = document.getElementById('editStaffNewBranch');
            
            if (!selectCurrent) {
                console.error('editStaffBranch element not found');
                return;
            }
            
            // Load current branch dropdown
            selectCurrent.innerHTML = '';
            branches.forEach(branch => {
                const option = document.createElement('option');
                option.value = branch.MaChiNhanh || branch.maChiNhanh;
                option.textContent = branch.TenChiNhanh || branch.tenChiNhanh;
                selectCurrent.appendChild(option);
            });
            
            // Load new branch dropdown for transfer
            if (selectNew) {
                selectNew.innerHTML = '<option value="">-- Giữ nguyên chi nhánh --</option>';
                branches.forEach(branch => {
                    const option = document.createElement('option');
                    option.value = branch.MaChiNhanh || branch.maChiNhanh;
                    option.textContent = branch.TenChiNhanh || branch.tenChiNhanh;
                    selectNew.appendChild(option);
                });
            }
        }
    } catch (error) {
        console.error('Error loading branches:', error);
    }
}

async function loadStaffHistory(maNhanVien) {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/staff/history/${maNhanVien}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
            const result = await response.json();
            const history = result.data || [];
            
            let historyHtml = history.map(h => `
                <div style="margin-bottom: 0.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid #ddd;">
                    <strong>${h.MaChiNhanh || h.maChiNhanh}</strong> - ${h.ViTri || h.viTri}<br>
                    <small>Từ: ${new Date(h.NgayBatDau || h.ngayBatDau).toLocaleDateString('vi-VN')} ${h.NgayKetThuc ? '→ ' + new Date(h.NgayKetThuc).toLocaleDateString('vi-VN') : '(Hiện tại)'}</small>
                </div>
            `).join('');
            
            document.getElementById('staffHistoryDisplay').innerHTML = historyHtml || 'Không có lịch sử';
        }
    } catch (error) {
        console.error('Error loading history:', error);
    }
}

window.updateEditStaffFormFields = function() {
    const position = document.getElementById('editStaffPosition')?.value;
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
};

window.closeEditStaffModal = function() {
    const modal = document.getElementById('edit-staff-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('edit-staff-form').reset();
    }
};

window.submitEditStaff = async function() {
    const maNhanVien = document.getElementById('edit-staff-form').dataset.maNhanVien;
    const currentBranch = document.getElementById('editStaffBranch').value;
    const newBranch = document.getElementById('editStaffNewBranch').value;
    const chucVu = document.getElementById('editStaffPosition').value;
    
    if (!chucVu || !currentBranch) {
        alert('Vui lòng chọn chức vụ và chi nhánh!');
        return;
    }
    
    const submitBtn = document.getElementById('submit-edit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang lưu...';
    
    try {
        const token = localStorage.getItem('token');
        
        // Nếu có chi nhánh mới và khác chi nhánh cũ, thực hiện transfer
        if (newBranch && newBranch !== currentBranch) {
            const transferResponse = await fetch(`/api/staff/${maNhanVien}/transfer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    oldBranch: currentBranch,
                    newBranch: newBranch,
                    newPosition: chucVu
                })
            });
            
            if (!transferResponse.ok) {
                throw new Error(`HTTP error! status: ${transferResponse.status}`);
            }
            
            const transferResult = await transferResponse.json();
            if (!transferResult.success && !transferResult.data) {
                throw new Error(transferResult.message || 'Lỗi khi điều động nhân viên');
            }
        }
        
        // Cập nhật thông tin khác
        const formData = {
            maNhanVien,
            maChiNhanh: newBranch || currentBranch,
            chucVu,
            gioLamViec: document.getElementById('editStaffWorkStart').value || null,
            gioNghi: document.getElementById('editStaffWorkEnd').value || null
        };
        
        const response = await fetch(`/api/staff/${maNhanVien}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success || result.data) {
            const message = newBranch && newBranch !== currentBranch 
                ? '✓ Điều động nhân viên và cập nhật thông tin thành công!' 
                : '✓ Cập nhật nhân viên thành công!';
            alert(message);
            window.closeEditStaffModal();
            loadStaffSection();
        } else {
            alert('❌ ' + (result.message || 'Lỗi khi cập nhật nhân viên'));
        }
        
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu Thay Đổi';
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Lưu Thay Đổi';
    }
};

window.deleteStaffFromModal = async function() {
    const maNhanVien = document.getElementById('edit-staff-form').dataset.maNhanVien;
    const staffName = document.getElementById('editStaffName').textContent;
    
    if (!confirm(`Bạn có chắc muốn xóa nhân viên ${staffName}?`)) {
        return;
    }
    
    try {
        const response = await fetch('/api/staff/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                maNhanVien,
                maChiNhanh: document.getElementById('editStaffBranch').value
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
            alert('✓ Xóa nhân viên thành công!');
            window.closeEditStaffModal();
            loadStaffSection();
        } else {
            alert('❌ ' + (result.message || 'Lỗi khi xóa nhân viên'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Lỗi: ' + error.message);
    }
}

window.viewStaffSalary = async function() {
    const maNhanVien = document.getElementById('edit-staff-form').dataset.maNhanVien;
    const staffName = document.getElementById('editStaffName').textContent;
    const hireDateText = document.getElementById('editStaffHireDate').textContent;
    
    if (!maNhanVien) {
        alert('Vui lòng chọn nhân viên!');
        return;
    }
    
    const modal = document.getElementById('salary-modal');
    if (!modal) return;
    
    modal.style.display = 'flex';
    const content = document.getElementById('salaryModalContent');
    content.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: var(--primary);"></i><p style="color: #999; margin-top: 1rem;">Đang tải dữ liệu lương...</p></div>';
    
    try {
        const token = localStorage.getItem('token');
        
        // Parse hire date - Multiple formats supported
        let hireYear, hireMonth;
        
        // Try YYYY-MM-DD format first (SQL Server format)
        if (hireDateText.includes('-')) {
            const parts = hireDateText.split('-');
            if (parts.length >= 2) {
                hireYear = parseInt(parts[0]);
                hireMonth = parseInt(parts[1]);
            }
        }
        // Try DD/MM/YYYY format
        else if (hireDateText.includes('/')) {
            const [hireDayStr, hireMonthStr, hireYearStr] = hireDateText.split('/');
            hireYear = parseInt(hireYearStr);
            hireMonth = parseInt(hireMonthStr);
        }
        // Try "DD tháng MM năm YYYY" format
        else {
            const monthMatch = hireDateText.match(/tháng\s+(\d+)\s+năm\s+(\d+)/);
            if (monthMatch) {
                hireMonth = parseInt(monthMatch[1]);
                hireYear = parseInt(monthMatch[2]);
            }
        }
        
        if (isNaN(hireYear) || isNaN(hireMonth) || !hireYear || !hireMonth) {
            throw new Error('Lỗi: Ngày vào làm không hợp lệ - ' + hireDateText);
        }
        
        // Fetch job history
        const historyResponse = await fetch(`/api/staff/history/${maNhanVien}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!historyResponse.ok) {
            throw new Error('Không thể lấy lịch sử điều động');
        }
        
        const historyResult = await historyResponse.json();
        const jobHistory = historyResult.data || [];
        
        // Fetch salary table once
        let salaryTable = [];
        try {
            const salaryTableResponse = await fetch('/api/branches/salary-table', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (salaryTableResponse.ok) {
                const salaryTableResult = await salaryTableResponse.json();
                salaryTable = salaryTableResult.data || [];
            }
        } catch (err) {
            console.error('Error loading salary table:', err);
        }
        
        // Build salary table from job history
        const salaryData = [];
        let totalIncome = 0;
        
        // For each month from hire month to December
        for (let month = hireMonth; month <= 12; month++) {
            // Find active position at this month
            let activePosition = null;
            
            for (const entry of jobHistory) {
                const startDate = new Date(entry.NgayBatDau);
                const endDate = entry.NgayKetThuc ? new Date(entry.NgayKetThuc) : null;
                
                // Check if this month falls within the period of this position
                const entryStartMonth = startDate.getMonth() + 1;
                const entryStartYear = startDate.getFullYear();
                const entryEndMonth = endDate ? endDate.getMonth() + 1 : null;
                const entryEndYear = endDate ? endDate.getFullYear() : null;
                
                // Check if current month is within this period
                const isInRange = (entryStartYear < hireYear || (entryStartYear === hireYear && entryStartMonth <= month)) &&
                                 (!endDate || entryEndYear > hireYear || (entryEndYear === hireYear && entryEndMonth >= month));
                
                if (isInRange) {
                    activePosition = entry.ViTri;
                    break;
                }
            }
            
            // If there's an active position, get the salary for that position
            if (activePosition) {
                const positionSalary = salaryTable.find(s => s.ChucVu === activePosition);
                if (positionSalary) {
                    const baseSalary = positionSalary.LuongCoBan;
                    salaryData.push({
                        year: hireYear,
                        month,
                        salary: baseSalary,
                        position: activePosition,
                        status: 'Đang làm'
                    });
                    totalIncome += baseSalary;
                } else {
                    // No salary info found, mark as working but no salary
                    salaryData.push({
                        year: hireYear,
                        month,
                        salary: 0,
                        position: activePosition,
                        status: 'Đang làm (chưa xác định lương)'
                    });
                }
            } else {
                // No active position this month - no salary
                salaryData.push({
                    year: hireYear,
                    month,
                    salary: 0,
                    position: null,
                    status: 'Không làm'
                });
            }
        }
        
        // Display salary data
        let html = `<div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                            <div style="width: 50px; height: 50px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">
                                ${staffName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <h3 style="margin: 0; font-size: 1.1rem; color: var(--primary);">${staffName}</h3>
                                <p style="margin: 0.25rem 0 0 0; color: #666; font-size: 0.9rem;">Lương từ tháng ${hireMonth}/${hireYear} đến 12/${hireYear}</p>
                            </div>
                        </div>
                    </div>`;
        
        if (salaryData.length === 0) {
            html += '<div style="text-align: center; padding: 3rem 1rem; color: #999; background: #f9f9f9; border-radius: 8px; border: 1px dashed #ddd;"><p><i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 1rem; display: block;"></i>Chưa có dữ liệu lương</p></div>';
        } else {
            html += '<div style="overflow-x: auto; border-radius: 8px; border: 1px solid #e0e0e0;"><table style="width: 100%; border-collapse: collapse; background: white;">';
            html += '<thead><tr style="background: linear-gradient(135deg, var(--primary) 0%, #0d6b7f 100%); color: white;">';
            html += '<th style="padding: 1rem 1.5rem; text-align: left; font-weight: 600; border: none;">Tháng/Năm</th>';
            html += '<th style="padding: 1rem 1.5rem; text-align: left; font-weight: 600; border: none;">Chức vụ</th>';
            html += '<th style="padding: 1rem 1.5rem; text-align: center; font-weight: 600; border: none;">Trạng thái</th>';
            html += '<th style="padding: 1rem 1.5rem; text-align: right; font-weight: 600; border: none;">Lương</th>';
            html += '</tr></thead><tbody>';
            
            salaryData.forEach((item, idx) => {
                const monthName = new Date(item.year, item.month - 1).toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
                const isWorking = item.status === 'Đang làm';
                const statusColor = isWorking ? '#4caf50' : '#ff9800';
                const statusIcon = isWorking ? '<i class="fas fa-check-circle"></i>' : '<i class="fas fa-ban"></i>';
                
                html += `<tr style="border-bottom: 1px solid #e8e8e8; background: ${idx % 2 === 0 ? '#fafafa' : 'white'}; transition: all 0.3s;">
                            <td style="padding: 1rem 1.5rem; font-weight: 500; color: #333;">${monthName}</td>
                            <td style="padding: 1rem 1.5rem; color: ${isWorking ? 'var(--primary)' : '#999'};">${item.position || '—'}</td>
                            <td style="padding: 1rem 1.5rem; text-align: center; color: ${statusColor};">${statusIcon} ${item.status}</td>
                            <td style="padding: 1rem 1.5rem; text-align: right; color: ${isWorking ? 'var(--primary)' : '#ccc'}; font-weight: 600;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.salary)}</td>
                        </tr>`;
            });
            
            // Add total row
            html += '<tr style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); font-weight: bold; border-top: 2px solid var(--primary);">';
            html += `<td style="padding: 1.2rem 1.5rem; color: var(--primary); font-size: 1.05rem;"><i class="fas fa-coins"></i> Tổng Cộng Năm</td>`;
            html += `<td colspan="2"></td>`;
            html += `<td style="padding: 1.2rem 1.5rem; text-align: right; color: var(--primary); font-size: 1.1rem;">${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalIncome)}</td>`;
            html += '</tr>';
            
            html += '</tbody></table></div>';
        }
        
        content.innerHTML = html;
    } catch (error) {
        console.error('Error loading salary:', error);
        content.innerHTML = `<p style="color: red; text-align: center;">Lỗi khi tải dữ liệu lương: ${error.message}</p>`;
    }
};

window.closeSalaryModal = function() {
    const modal = document.getElementById('salary-modal');
    if (modal) {
        modal.style.display = 'none';
    }
};

async function showEmployeeDetails(maNV, hoTen) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.id = 'employee-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        padding: 2rem;
    `;
    
    modal.innerHTML = `
        <div style="background: white; border-radius: 15px; max-width: 900px; width: 100%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 40px rgba(0,0,0,0.2);">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 15px 15px 0 0; display: flex; justify-content: space-between; align-items: center;">
                <h2 style="margin: 0;"><i class="fas fa-user"></i> Chi tiết Nhân viên: ${hoTen}</h2>
                <button onclick="closeEmployeeModal()" style="background: rgba(255,255,255,0.2); border: none; color: white; width: 35px; height: 35px; border-radius: 50%; cursor: pointer; font-size: 1.2rem;">&times;</button>
            </div>
            <div id="employee-detail-content" style="padding: 2rem;">
                <p style="text-align: center; color: var(--text-light);">
                    <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
                </p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeEmployeeModal();
        }
    });
    
    try {
        // Load transfer history
        const transferResponse = await api.getTransferHistory(maNV);
        const transfers = Array.isArray(transferResponse) ? transferResponse : 
                         (transferResponse && Array.isArray(transferResponse.data) ? transferResponse.data : []);
        
        const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        let detailHTML = `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">
                    <i class="fas fa-exchange-alt"></i> Lịch sử Điều động
                </h3>
                ${transfers.length === 0 ? `
                    <p style="color: var(--text-light); padding: 1rem; background: #f8faff; border-radius: 8px;">
                        Chưa có lịch sử điều động nào.
                    </p>
                ` : `
                    <div style="display: grid; gap: 1rem;">
                        ${transfers.map((transfer, index) => {
                            const startDate = transfer.NgayBatDau ? new Date(transfer.NgayBatDau) : null;
                            const endDate = transfer.NgayKetThuc ? new Date(transfer.NgayKetThuc) : null;
                            const isCurrent = !endDate;
                            
                            return `
                                <div style="background: #f8faff; padding: 1.5rem; border-radius: 10px; border-left: 4px solid ${isCurrent ? 'var(--accent)' : 'var(--primary)'};">
                                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                                        <div>
                                            <h4 style="color: var(--text-dark); margin: 0 0 0.5rem 0;">
                                                <i class="fas fa-building"></i> ${transfer.TenChiNhanh || 'N/A'}
                                            </h4>
                                            <p style="color: var(--text-light); margin: 0; font-size: 0.9rem;">
                                                <i class="fas fa-briefcase"></i> ${transfer.ViTri || 'N/A'}
                                            </p>
                                        </div>
                                        ${isCurrent ? '<span style="background: var(--accent); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">Hiện tại</span>' : ''}
                                    </div>
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; color: var(--text-light); font-size: 0.9rem;">
                                        <div>
                                            <strong>Ngày bắt đầu:</strong><br>
                                            ${startDate ? dateFormatter.format(startDate) : 'N/A'}
                                        </div>
                                        <div>
                                            <strong>Ngày kết thúc:</strong><br>
                                            ${endDate ? dateFormatter.format(endDate) : 'Đang làm việc'}
                                        </div>
                                    </div>
                                    <div id="income-${index}" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.1);">
                                        <p style="color: var(--text-light); font-size: 0.85rem;">
                                            <i class="fas fa-spinner fa-spin"></i> Đang tải thu nhập...
                                        </p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
        `;
        
        // Load performance statistics for last 12 months
        const perfCurrentDate = new Date();
        const perfCurrentYear = perfCurrentDate.getFullYear();
        const perfCurrentMonth = perfCurrentDate.getMonth() + 1;
        
        // Generate array of last 12 months
        const monthsToLoad = [];
        for (let i = 0; i < 12; i++) {
            let year = perfCurrentYear;
            let month = perfCurrentMonth - i;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            monthsToLoad.push({ year, month });
        }
        
        // Add performance section placeholder
        detailHTML += `
            <div id="performance-section" style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">
                    <i class="fas fa-chart-line"></i> Thống kê Hiệu suất (12 tháng gần nhất)
                </h3>
                <p style="text-align: center; color: var(--text-light);">
                    <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
                </p>
            </div>
        `;
        
        document.getElementById('employee-detail-content').innerHTML = detailHTML;
        
        // Load performance data for all 12 months
        try {
            const performancePromises = monthsToLoad.map(({ year, month }) => 
                api.getEmployeePerformance(maNV, month, year)
            );
            const performances = await Promise.all(performancePromises);
            
            let performanceHTML = '<div style="display: grid; gap: 1rem;">';
            
            performances.forEach((perf, index) => {
                const { year, month } = monthsToLoad[index];
                const monthName = new Date(year, month - 1).toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
                const isCurrentMonth = index === 0;
                
                if (perf && (perf.TongSoDonHang > 0 || perf.TongDoanhSo > 0)) {
                    // Has performance data
                    performanceHTML += `
                        <div style="background: ${isCurrentMonth ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#f8faff'}; color: ${isCurrentMonth ? 'white' : 'inherit'}; padding: 1.5rem; border-radius: 10px; border-left: 4px solid ${isCurrentMonth ? 'var(--accent)' : 'var(--primary)'};">
                            <h4 style="margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem; ${isCurrentMonth ? '' : 'color: var(--text-dark);'}">
                                <i class="fas fa-calendar-${isCurrentMonth ? 'check' : 'alt'}"></i> ${monthName}
                                ${isCurrentMonth ? '<span style="background: rgba(255,255,255,0.3); padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; margin-left: auto;">Tháng hiện tại</span>' : ''}
                            </h4>
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem;">
                                <div style="background: ${isCurrentMonth ? 'rgba(255,255,255,0.2)' : 'white'}; padding: 1rem; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; ${isCurrentMonth ? 'opacity: 0.9' : 'color: var(--text-light)'}; margin-bottom: 0.5rem;">Tổng số đơn hàng</div>
                                    <div style="font-size: ${isCurrentMonth ? '1.5rem' : '1.3rem'}; font-weight: bold; ${isCurrentMonth ? '' : 'color: var(--text-dark)'};">${perf.TongSoDonHang || 0}</div>
                                </div>
                                <div style="background: ${isCurrentMonth ? 'rgba(255,255,255,0.2)' : 'white'}; padding: 1rem; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; ${isCurrentMonth ? 'opacity: 0.9' : 'color: var(--text-light)'}; margin-bottom: 0.5rem;">Tổng doanh số</div>
                                    <div style="font-size: ${isCurrentMonth ? '1.5rem' : '1.3rem'}; font-weight: bold; ${isCurrentMonth ? '' : 'color: var(--text-dark)'};">
                                        ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(perf.TongDoanhSo || 0)}
                                    </div>
                                </div>
                                <div style="background: ${isCurrentMonth ? 'rgba(255,255,255,0.2)' : 'white'}; padding: 1rem; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; ${isCurrentMonth ? 'opacity: 0.9' : 'color: var(--text-light)'}; margin-bottom: 0.5rem;">Điểm dịch vụ TB</div>
                                    <div style="font-size: ${isCurrentMonth ? '1.5rem' : '1.3rem'}; font-weight: bold; ${isCurrentMonth ? '' : 'color: var(--text-dark)'};">
                                        ${perf.DiemDichVuTB ? perf.DiemDichVuTB.toFixed(1) : 'N/A'}
                                        ${perf.DiemDichVuTB ? `<span style="font-size: ${isCurrentMonth ? '0.8rem' : '0.7rem'}; ${isCurrentMonth ? '' : 'color: var(--text-light)'}">/5</span>` : ''}
                                    </div>
                                </div>
                                <div style="background: ${isCurrentMonth ? 'rgba(255,255,255,0.2)' : 'white'}; padding: 1rem; border-radius: 8px;">
                                    <div style="font-size: 0.85rem; ${isCurrentMonth ? 'opacity: 0.9' : 'color: var(--text-light)'}; margin-bottom: 0.5rem;">Điểm thái độ TB</div>
                                    <div style="font-size: ${isCurrentMonth ? '1.5rem' : '1.3rem'}; font-weight: bold; ${isCurrentMonth ? '' : 'color: var(--text-dark)'};">
                                        ${perf.DiemThaiDoTB ? perf.DiemThaiDoTB.toFixed(1) : 'N/A'}
                                        ${perf.DiemThaiDoTB ? `<span style="font-size: ${isCurrentMonth ? '0.8rem' : '0.7rem'}; ${isCurrentMonth ? '' : 'color: var(--text-light)'}">/5</span>` : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                } else {
                    // No performance data for this month
                    performanceHTML += `
                        <div style="background: #f8faff; padding: 1rem; border-radius: 10px; border-left: 4px solid #ddd; opacity: 0.7;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-dark); font-weight: 500;">
                                    <i class="fas fa-calendar-alt"></i> ${monthName}
                                </span>
                                <span style="color: var(--text-light); font-size: 0.85rem;">Chưa có dữ liệu</span>
                            </div>
                        </div>
                    `;
                }
            });
            
            performanceHTML += '</div>';
            document.getElementById('performance-section').innerHTML = `
                <h3 style="color: var(--primary); margin-bottom: 1rem;">
                    <i class="fas fa-chart-line"></i> Thống kê Hiệu suất (12 tháng gần nhất)
                </h3>
                ${performanceHTML}
            `;
        } catch (err) {
            console.error('Error loading performance:', err);
            document.getElementById('performance-section').innerHTML = `
                <h3 style="color: var(--primary); margin-bottom: 1rem;">
                    <i class="fas fa-chart-line"></i> Thống kê Hiệu suất (12 tháng gần nhất)
                </h3>
                <p style="color: var(--text-light); padding: 1rem; background: #f8faff; border-radius: 8px;">
                    Lỗi khi tải dữ liệu hiệu suất: ${err.message}
                </p>
            `;
        }
        
        // Load income for each transfer period
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        for (let i = 0; i < transfers.length; i++) {
            const transfer = transfers[i];
            const startDate = transfer.NgayBatDau ? new Date(transfer.NgayBatDau) : null;
            const endDate = transfer.NgayKetThuc ? new Date(transfer.NgayKetThuc) : null;
            
            if (!startDate) continue;
            
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth() + 1;
            const endYear = endDate ? endDate.getFullYear() : currentYear;
            const endMonth = endDate ? endDate.getMonth() + 1 : currentMonth;
            
            let incomeHTML = '<h4 style="color: var(--primary); margin-bottom: 0.75rem; font-size: 1rem;"><i class="fas fa-money-bill-wave"></i> Thu nhập theo tháng:</h4>';
            incomeHTML += '<div style="display: grid; gap: 0.75rem;">';
            
            // Calculate months to show income for
            let year = startYear;
            let month = startMonth;
            let hasIncome = false;
            
            while (year < endYear || (year === endYear && month <= endMonth)) {
                try {
                    const income = await api.getEmployeeIncome(maNV, month, year);
                    if (income && income.TongThucLinh !== null) {
                        hasIncome = true;
                        const monthName = new Date(year, month - 1).toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
                        incomeHTML += `
                            <div style="background: white; padding: 1rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1);">
                                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                                    <strong style="color: var(--text-dark);">${monthName}</strong>
                                    <span style="color: var(--accent); font-weight: bold; font-size: 1.1rem;">
                                        ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(income.TongThucLinh || 0)}
                                    </span>
                                </div>
                                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.85rem; color: var(--text-light);">
                                    <div>Lương chính: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(income.LuongChinh || 0)}</div>
                                    <div>Thưởng KD: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(income.ThuongKinhDoanh || 0)}</div>
                                    ${income.ThuongThang13 > 0 ? `<div>Thưởng Tết: ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(income.ThuongThang13)}</div>` : ''}
                                </div>
                            </div>
                        `;
                    }
                } catch (err) {
                    console.error(`Error loading income for ${month}/${year}:`, err);
                }
                
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
            }
            
            if (!hasIncome) {
                incomeHTML += '<p style="color: var(--text-light); font-size: 0.9rem;">Chưa có dữ liệu thu nhập cho giai đoạn này.</p>';
            }
            
            incomeHTML += '</div>';
            document.getElementById(`income-${i}`).innerHTML = incomeHTML;
        }
        
    } catch (err) {
        console.error('Error loading employee details:', err);
        document.getElementById('employee-detail-content').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi khi tải dữ liệu: ${err.message}</p>
            </div>
        `;
    }
}

function closeEmployeeModal() {
    const modal = document.getElementById('employee-modal');
    if (modal) {
        modal.remove();
    }
}

// Add hover effect for staff cards
document.addEventListener('DOMContentLoaded', () => {
    const style = document.createElement('style');
    style.textContent = `
        .staff-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
        }
    `;
    document.head.appendChild(style);
});

function logout() {
    if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
    }
}

async function loadReportsSection() {
    const contentSection = document.getElementById('content-section');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    contentSection.innerHTML = `
        <h2><i class="fas fa-chart-bar"></i> Báo cáo & Thống kê</h2>
        
        <div class="report-toolbar card-panel">
            <div class="filter-group-modern">
                <div class="select-wrapper">
                    <i class="fas fa-map-marker-alt"></i>
                    <select id="branchSelect">
                        <option value="ALL">Toàn hệ thống</option>
                    </select>
                </div>
                <div class="select-wrapper">
                    <i class="fas fa-calendar-alt"></i>
                    <select id="reportType" onchange="toggleTimeInput()">
                        <option value="Ngay">Theo Ngày</option>
                        <option value="Thang" selected>Theo Tháng</option>
                        <option value="Quy">Theo Quý</option>
                        <option value="Nam">Theo Năm</option>
                    </select>
                </div>
        
                <div id="dynamicInputContainer" class="select-wrapper">
                    <input type="number" id="timeValue" placeholder="Nhập Tháng (1-12)" value="${currentMonth}">
                </div>
        
                <div id="yearInputContainer" class="select-wrapper">
                    <i class="fas fa-calendar-check" style="color: var(--primary); margin-right: 10px;"></i>
                    <input type="number" id="timeYear" placeholder="Năm" value="${currentYear}">
                </div>
        
                <button class="register-btn" onclick="updateReport()">
                    <i class="fas fa-sync-alt"></i> Cập nhật dữ liệu
                </button>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon"><i class="fas fa-money-bill-wave"></i></div>
                <div class="stat-info">
                    <p>Tổng doanh thu</p>
                    <h3 id="totalRevenue">0 đ</h3>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #e0f2fe; color: #0369a1;"><i class="fas fa-stethoscope"></i></div>
                <div class="stat-info">
                    <p>Doanh thu Dịch vụ</p>
                    <h3 id="serviceRevenue">0 đ</h3>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #fef3c7; color: #b45309;"><i class="fas fa-shopping-bag"></i></div>
                <div class="stat-info">
                    <p>Doanh thu Sản phẩm</p>
                    <h3 id="productRevenue">0 đ</h3>
                </div>
            </div>
            <div class="stat-card">
                <div class="stat-icon" style="background: #dcfce7; color: #15803d;"><i class="fas fa-user-md"></i></div>
                <div class="stat-info">
                    <p>Số lượt khám</p>
                    <h3 id="visitCount">0</h3>
                </div>
            </div>
        </div>

        <div class="retail-layout">
            <div class="chart-section card-panel">
                <h4><i class="fas fa-chart-line"></i> Biểu đồ tăng trưởng</h4>
                <div style="height: 300px;">
                    <canvas id="revenueChart"></canvas>
                </div>
            </div>
            <div class="chart-section card-panel">
                <h4><i class="fas fa-user-check"></i> Doanh thu theo Bác sĩ</h4>
                <div style="height: 300px;">
                    <canvas id="doctorChart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Load branches
    try {
        const branchRes = await api.getBranches();
        const branches = branchRes.data || branchRes || [];
        const branchSelect = document.getElementById('branchSelect');
        
        if (Array.isArray(branches) && branches.length > 0) {
            branchSelect.innerHTML = '<option value="ALL">Toàn hệ thống</option>' + 
                branches.map(b => `<option value="${b.MaChiNhanh}">${b.TenChiNhanh}</option>`).join('');
        }
    } catch (err) {
        console.error('Error loading branches:', err);
    }
    
    // Load default report
    loadDefaultReports();
}

async function handleReportFilter(event) {
    event.preventDefault();
    
    const thang = parseInt(document.getElementById('filter-thang').value);
    const nam = parseInt(document.getElementById('filter-nam').value);
    const maNV = document.getElementById('filter-manv').value.trim() || null;
    
    if (!thang || !nam) {
        alert('Vui lòng nhập đầy đủ tháng và năm!');
        return;
    }
    
    const reportsContent = document.getElementById('reports-content');
    reportsContent.innerHTML = `
        <p style="text-align: center; color: var(--text-light); padding: 2rem;">
            <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </p>
    `;
    
    try {
        const performanceData = await api.getAllEmployeesPerformance(thang, nam, maNV);
        displayPerformanceReport(performanceData, thang, nam, maNV);
    } catch (err) {
        console.error('Error loading filtered report:', err);
        reportsContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi khi tải dữ liệu báo cáo: ${err.message}</p>
            </div>
        `;
    }
}

function displayPerformanceReport(performanceData, thang, nam, maNV) {
    const monthName = new Date(nam, thang - 1).toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
    const reportsContent = document.getElementById('reports-content');
    
    if (!performanceData || performanceData.length === 0) {
        reportsContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Không có dữ liệu hiệu suất cho ${monthName}${maNV ? ` (Mã NV: ${maNV})` : ''}</p>
            </div>
        `;
        return;
    }
    
    let reportHTML = `
        <div style="margin-bottom: 2rem;">
            <h3 style="color: var(--primary); margin-bottom: 0.5rem;">
                <i class="fas fa-chart-line"></i> Báo cáo Hiệu suất - ${monthName}
            </h3>
            ${maNV ? `<p style="color: var(--text-light);">Lọc theo Mã NV: <strong>${maNV}</strong></p>` : '<p style="color: var(--text-light);">Tất cả nhân viên</p>'}
        </div>
        
        <div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: var(--primary); color: white;">
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Mã NV</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Họ tên</th>
                            <th style="padding: 1rem; text-align: left; font-weight: 600;">Chức vụ</th>
                            <th style="padding: 1rem; text-align: right; font-weight: 600;">Tổng đơn hàng</th>
                            <th style="padding: 1rem; text-align: right; font-weight: 600;">Tổng doanh số</th>
                            <th style="padding: 1rem; text-align: center; font-weight: 600;">Điểm DV TB</th>
                            <th style="padding: 1rem; text-align: center; font-weight: 600;">Điểm TD TB</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${performanceData.map((emp, idx) => `
                            <tr style="border-bottom: 1px solid #f0f0f0; ${idx % 2 === 0 ? 'background: #fafafa;' : ''}">
                                <td style="padding: 0.75rem 1rem; color: var(--text-dark); font-weight: 500;">${emp.MaNhanVien || 'N/A'}</td>
                                <td style="padding: 0.75rem 1rem; color: var(--text-dark);">${emp.HoTen || 'N/A'}</td>
                                <td style="padding: 0.75rem 1rem; color: var(--text-light);">${emp.ChucVu || 'N/A'}</td>
                                <td style="padding: 0.75rem 1rem; text-align: right; color: var(--text-dark); font-weight: 600;">${emp.TongSoDonHang || 0}</td>
                                <td style="padding: 0.75rem 1rem; text-align: right; color: var(--accent); font-weight: 600;">
                                    ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.TongDoanhSo || 0)}
                                </td>
                                <td style="padding: 0.75rem 1rem; text-align: center; color: var(--text-dark);">
                                    ${emp.DiemDichVuTB ? `<span style="background: ${emp.DiemDichVuTB >= 4 ? '#4caf50' : emp.DiemDichVuTB >= 3 ? '#ff9800' : '#f44336'}; color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-weight: 600;">${emp.DiemDichVuTB.toFixed(1)}/5</span>` : '<span style="color: var(--text-light);">N/A</span>'}
                                </td>
                                <td style="padding: 0.75rem 1rem; text-align: center; color: var(--text-dark);">
                                    ${emp.DiemThaiDoTB ? `<span style="background: ${emp.DiemThaiDoTB >= 4 ? '#4caf50' : emp.DiemThaiDoTB >= 3 ? '#ff9800' : '#f44336'}; color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-weight: 600;">${emp.DiemThaiDoTB.toFixed(1)}/5</span>` : '<span style="color: var(--text-light);">N/A</span>'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                    <tfoot>
                        <tr style="background: #f8faff; font-weight: bold;">
                            <td colspan="3" style="padding: 1rem; text-align: right; color: var(--text-dark);">Tổng cộng:</td>
                            <td style="padding: 1rem; text-align: right; color: var(--primary);">
                                ${performanceData.reduce((sum, emp) => sum + (emp.TongSoDonHang || 0), 0)}
                            </td>
                            <td style="padding: 1rem; text-align: right; color: var(--accent);">
                                ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                    performanceData.reduce((sum, emp) => sum + (emp.TongDoanhSo || 0), 0)
                                )}
                            </td>
                            <td colspan="2" style="padding: 1rem;"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        </div>
    `;
    
    reportsContent.innerHTML = reportHTML;
}

async function loadDefaultReports() {
    const reportsContent = document.getElementById('reports-content');
    if (!reportsContent) return;
    
    reportsContent.innerHTML = `
        <p style="text-align: center; color: var(--text-light); padding: 2rem;">
            <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </p>
    `;
    
    try {
        // Generate array of last 12 months
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth() + 1;
        
        const monthsToLoad = [];
        for (let i = 0; i < 12; i++) {
            let year = currentYear;
            let month = currentMonth - i;
            if (month <= 0) {
                month += 12;
                year -= 1;
            }
            monthsToLoad.push({ year, month });
        }
        
        // Load performance data for all employees for all 12 months
        const allMonthsData = await Promise.all(
            monthsToLoad.map(({ year, month }) => 
                api.getAllEmployeesPerformance(month, year)
            )
        );
        
        let reportsHTML = `
            <div style="margin-bottom: 2rem;">
                <h3 style="color: var(--primary); margin-bottom: 1rem;">
                    <i class="fas fa-users"></i> Báo cáo Hiệu suất Nhân viên (12 tháng gần nhất)
                </h3>
                <p style="color: var(--text-light); margin-bottom: 1.5rem;">
                    Thống kê hiệu suất làm việc của tất cả nhân viên theo từng tháng
                </p>
            </div>
        `;
        
        // Display data for each month
        allMonthsData.forEach((monthData, index) => {
            const { year, month } = monthsToLoad[index];
            const monthName = new Date(year, month - 1).toLocaleString('vi-VN', { month: 'long', year: 'numeric' });
            const isCurrentMonth = index === 0;
            
            if (monthData && monthData.length > 0) {
                reportsHTML += `
                    <div style="margin-bottom: 2rem; background: ${isCurrentMonth ? 'linear-gradient(135deg, #667eea15 0%, #764ba215 100%)' : '#f8faff'}; padding: 1.5rem; border-radius: 15px; border-left: 4px solid ${isCurrentMonth ? 'var(--accent)' : 'var(--primary)'};">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                            <h4 style="color: var(--text-dark); margin: 0; display: flex; align-items: center; gap: 0.5rem;">
                                <i class="fas fa-calendar-${isCurrentMonth ? 'check' : 'alt'}"></i> ${monthName}
                            </h4>
                            ${isCurrentMonth ? '<span style="background: var(--accent); color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem;">Tháng hiện tại</span>' : ''}
                        </div>
                        
                        <div style="overflow-x: auto;">
                            <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 10px; overflow: hidden;">
                                <thead>
                                    <tr style="background: var(--primary); color: white;">
                                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Mã NV</th>
                                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Họ tên</th>
                                        <th style="padding: 1rem; text-align: left; font-weight: 600;">Chức vụ</th>
                                        <th style="padding: 1rem; text-align: right; font-weight: 600;">Tổng đơn hàng</th>
                                        <th style="padding: 1rem; text-align: right; font-weight: 600;">Tổng doanh số</th>
                                        <th style="padding: 1rem; text-align: center; font-weight: 600;">Điểm DV TB</th>
                                        <th style="padding: 1rem; text-align: center; font-weight: 600;">Điểm TD TB</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${monthData.map((emp, idx) => `
                                        <tr style="border-bottom: 1px solid #f0f0f0; ${idx % 2 === 0 ? 'background: #fafafa;' : ''}">
                                            <td style="padding: 0.75rem 1rem; color: var(--text-dark); font-weight: 500;">${emp.MaNhanVien || 'N/A'}</td>
                                            <td style="padding: 0.75rem 1rem; color: var(--text-dark);">${emp.HoTen || 'N/A'}</td>
                                            <td style="padding: 0.75rem 1rem; color: var(--text-light);">${emp.ChucVu || 'N/A'}</td>
                                            <td style="padding: 0.75rem 1rem; text-align: right; color: var(--text-dark); font-weight: 600;">${emp.TongSoDonHang || 0}</td>
                                            <td style="padding: 0.75rem 1rem; text-align: right; color: var(--accent); font-weight: 600;">
                                                ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.TongDoanhSo || 0)}
                                            </td>
                                            <td style="padding: 0.75rem 1rem; text-align: center; color: var(--text-dark);">
                                                ${emp.DiemDichVuTB ? `<span style="background: ${emp.DiemDichVuTB >= 4 ? '#4caf50' : emp.DiemDichVuTB >= 3 ? '#ff9800' : '#f44336'}; color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-weight: 600;">${emp.DiemDichVuTB.toFixed(1)}/5</span>` : '<span style="color: var(--text-light);">N/A</span>'}
                                            </td>
                                            <td style="padding: 0.75rem 1rem; text-align: center; color: var(--text-dark);">
                                                ${emp.DiemThaiDoTB ? `<span style="background: ${emp.DiemThaiDoTB >= 4 ? '#4caf50' : emp.DiemThaiDoTB >= 3 ? '#ff9800' : '#f44336'}; color: white; padding: 0.25rem 0.5rem; border-radius: 15px; font-weight: 600;">${emp.DiemThaiDoTB.toFixed(1)}/5</span>` : '<span style="color: var(--text-light);">N/A</span>'}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                                <tfoot>
                                    <tr style="background: #f8faff; font-weight: bold;">
                                        <td colspan="3" style="padding: 1rem; text-align: right; color: var(--text-dark);">Tổng cộng:</td>
                                        <td style="padding: 1rem; text-align: right; color: var(--primary);">
                                            ${monthData.reduce((sum, emp) => sum + (emp.TongSoDonHang || 0), 0)}
                                        </td>
                                        <td style="padding: 1rem; text-align: right; color: var(--accent);">
                                            ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                                                monthData.reduce((sum, emp) => sum + (emp.TongDoanhSo || 0), 0)
                                            )}
                                        </td>
                                        <td colspan="2" style="padding: 1rem;"></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    </div>
                `;
            } else {
                reportsHTML += `
                    <div style="margin-bottom: 2rem; background: #f8faff; padding: 1.5rem; border-radius: 15px; border-left: 4px solid #ddd; opacity: 0.7;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <h4 style="color: var(--text-dark); margin: 0;">
                                <i class="fas fa-calendar-alt"></i> ${monthName}
                            </h4>
                            <span style="color: var(--text-light); font-size: 0.85rem;">Chưa có dữ liệu</span>
                        </div>
                    </div>
                `;
            }
        });
        
        reportsContent.innerHTML = reportsHTML;
    } catch (err) {
        console.error('Error loading default reports:', err);
        reportsContent.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi khi tải dữ liệu báo cáo: ${err.message}</p>
            </div>
        `;
    }
}

// ==================== REPORT FUNCTIONS ====================
// 1. Điều khiển hiển thị Input thời gian
window.toggleTimeInput = () => {
    const reportTypeEl = document.getElementById('reportType');
    const container = document.getElementById('dynamicInputContainer');
    const yearContainer = document.getElementById('yearInputContainer');
    
    if (!reportTypeEl || !container || !yearContainer) return;
    
    const type = reportTypeEl.value;

    if (type === 'Ngay') {
        container.innerHTML = '<input type="date" id="dateInput" style="border:none; background:transparent; outline:none; font-weight:600; width:100%;">';
        yearContainer.style.display = 'none'; 
    } else {
        const placeholder = type === 'Quy' ? 'Nhập Quý (1-4)' : 'Nhập Tháng (1-12)';
        container.innerHTML = `<input type="number" id="timeValue" placeholder="${placeholder}" style="border:none; background:transparent; outline:none; font-weight:600; width:100%;">`;
        yearContainer.style.display = 'flex';
    }
};

// 2. Cập nhật toàn bộ báo cáo
window.updateReport = async () => {
    const branchId = document.getElementById('branchSelect')?.value;
    const type = document.getElementById('reportType')?.value;
    
    if (!branchId || !type) return;
    
    let value, year;

    // Lấy giá trị thời gian
    if (type === 'Ngay') {
        const dateVal = document.getElementById('dateInput')?.value;
        if (!dateVal) return alert("Vui lòng chọn ngày!");
        const dateObj = new Date(dateVal);
        value = (dateObj.getMonth() + 1) * 100 + dateObj.getDate(); 
        year = dateObj.getFullYear();
    } else {
        value = document.getElementById('timeValue')?.value;
        year = document.getElementById('timeYear')?.value;
        if (!value || !year) return alert("Vui lòng nhập đủ Tháng/Quý và Năm!");
    }

    try {
        const response = await api.getAdvancedReport(branchId, value, year, type);
        const responseData = response.data || response;
        const { stats, doctors } = responseData;

        document.getElementById('totalRevenue').innerText = formatVND(stats.TongDoanhThu);
        document.getElementById('serviceRevenue').innerText = formatVND(stats.DoanhThuDichVu);
        document.getElementById('productRevenue').innerText = formatVND(stats.DoanhThuSanPham);
        document.getElementById('visitCount').innerText = stats.SoLuotKham;

        renderRevenueChart([{ ThoiGian: 'Kỳ này', TongDoanhThu: stats.TongDoanhThu }], type, branchId);
        renderDoctorChart(doctors);

    } catch (err) {
        console.error("Lỗi khi hiển thị báo cáo:", err);
    }
};

// Vẽ biểu đồ doanh thu
function renderRevenueChart(data, type, branch) {
    const ctx = document.getElementById('revenueChart')?.getContext('2d');
    if (!ctx) return;
    if (revenueChart) revenueChart.destroy();

    revenueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.map(i => i.ThoiGian || 'Kỳ này'),
            datasets: [{
                label: 'Doanh thu',
                data: data.map(i => i.TongDoanhThu),
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                fill: true,
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// Vẽ biểu đồ bác sĩ
function renderDoctorChart(doctorData) {
    const ctx = document.getElementById('doctorChart')?.getContext('2d');
    if (!ctx || !doctorData || !Array.isArray(doctorData) || doctorData.length === 0) return;
    if (doctorChart) doctorChart.destroy();

    doctorChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: doctorData.map(i => i.HoTen),
            datasets: [{
                label: 'Doanh thu đóng góp (VND)',
                data: doctorData.map(i => i.DoanhThuTaoRa),
                backgroundColor: '#10b981'
            }]
        },
        options: { 
            indexAxis: 'y',
            responsive: true, 
            maintainAspectRatio: false 
        }
    });
}

// Make loadSection available globally for onclick handlers
window.loadSection = loadSection;
window.logout = logout;
window.showEmployeeDetails = showEmployeeDetails;
window.closeEmployeeModal = closeEmployeeModal;
window.handleReportFilter = handleReportFilter;
window.loadDefaultReports = loadDefaultReports;
window.handleCustomerSearch = handleCustomerSearch;

// ==================== MODAL EVENT LISTENERS ====================
document.addEventListener('DOMContentLoaded', () => {
    // Add Staff Modal
    const addStaffModal = document.getElementById('add-staff-modal');
    const editStaffModal = document.getElementById('edit-staff-modal');
    const addStaffForm = document.getElementById('add-staff-form');
    const editStaffForm = document.getElementById('edit-staff-form');
    const searchForm = document.getElementById('customer-search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', handleCustomerSearch);
    }
    
    if (addStaffModal) {
        // Click outside modal to close
        addStaffModal.addEventListener('click', (e) => {
            if (e.target === addStaffModal) {
                window.closeAddStaffModal();
            }
        });
        
        // Close button in modal header
        const closeBtn = addStaffModal.querySelector('button[onclick="window.closeAddStaffModal()"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', window.closeAddStaffModal);
        }
    }
    
    // Add Staff Form Submit
    if (addStaffForm) {
        addStaffForm.addEventListener('submit', window.submitAddStaff);
        
        // Close button
        const closeBtn = document.getElementById('close-staff-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', window.closeAddStaffModal);
        }
    }
    
    if (editStaffModal) {
        // Click outside modal to close
        editStaffModal.addEventListener('click', (e) => {
            if (e.target === editStaffModal) {
                window.closeEditStaffModal();
            }
        });
        
        // Close button in modal header
        const closeBtn = editStaffModal.querySelector('button[onclick="window.closeEditStaffModal()"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', window.closeEditStaffModal);
        }
    }
    
    // Edit Staff Form Submit
    if (editStaffForm) {
        const submitBtn = document.getElementById('submit-edit-btn');
        if (submitBtn) {
            submitBtn.addEventListener('click', window.submitEditStaff);
        }
        
        // Close button
        const closeBtn = document.getElementById('close-edit-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', window.closeEditStaffModal);
        }
        
        // Delete button
        const deleteBtn = document.getElementById('delete-staff-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', window.deleteStaffFromModal);
        }
    }
    
    // Salary Modal
    const salaryModal = document.getElementById('salary-modal');
    if (salaryModal) {
        // Click outside modal to close
        salaryModal.addEventListener('click', (e) => {
            if (e.target === salaryModal) {
                window.closeSalaryModal();
            }
        });
        
        // Close button in modal header
        const closeBtn = salaryModal.querySelector('button[onclick="window.closeSalaryModal()"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', window.closeSalaryModal);
        }
    }
});
