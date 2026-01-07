import { api } from './api.js';

// Check authentication and role
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
        const branches = await api.getBranches();
        document.getElementById('stat-branches').textContent = branches.length || 0;
        
        // Load services count
        const services = await api.getServices();
        document.getElementById('stat-services').textContent = services.length || 0;
        
        // Load staff count
        const staffData = await api.getStaffCount();
        document.getElementById('stat-staff').textContent = staffData.count || 0;
        
        // Load customers count
        const customersData = await api.getCustomersCount();
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
    event?.target?.classList.add('active');
    
    const contentSection = document.getElementById('content-section');
    
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
            contentSection.innerHTML = `
                <h2><i class="fas fa-user-friends"></i> Quản lý Khách hàng</h2>
                <div class="empty-state">
                    <i class="fas fa-user-friends"></i>
                    <p>Tính năng quản lý khách hàng đang được phát triển...</p>
                </div>
            `;
            break;
            
        case 'pets':
            loadPetsSection();
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
        const branches = await api.getBranches();
        const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', 
            minute: '2-digit', 
            hour12: false
        });
        
        if (branches.length === 0) {
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
        <div id="services-list" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem;">
            <p style="text-align: center; color: var(--text-light); padding: 2rem; grid-column: 1/-1;">
                <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </p>
        </div>
    `;
    
    try {
        const services = await api.getServices();
        const icons = ['fa-stethoscope', 'fa-syringe', 'fa-cut', 'fa-bath', 'fa-tooth', 'fa-wave-square', 'fa-vials', 'fa-heartbeat'];
        
        if (services.length === 0) {
            document.getElementById('services-list').innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1;">
                    <i class="fas fa-concierge-bell"></i>
                    <p>Chưa có dịch vụ nào trong hệ thống.</p>
                </div>
            `;
            return;
        }
        
        const servicesHTML = services.map((service, i) => `
            <div style="background: white; padding: 1.5rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); border-top: 3px solid var(--primary);">
                <div style="text-align: center; margin-bottom: 1rem;">
                    <i class="fas ${icons[i] || 'fa-paw'}" style="font-size: 2.5rem; color: var(--primary);"></i>
                </div>
                <h3 style="color: var(--text-dark); margin-bottom: 0.5rem; text-align: center;">
                    ${service.TenDichVu || 'N/A'}
                </h3>
                <p style="color: var(--text-light); font-size: 0.9rem; text-align: center;">
                    ${service.MoTa || 'Chưa có mô tả'}
                </p>
            </div>
        `).join('');
        
        document.getElementById('services-list').innerHTML = servicesHTML;
    } catch (err) {
        console.error('Error loading services:', err);
        document.getElementById('services-list').innerHTML = `
            <div class="empty-state" style="grid-column: 1/-1;">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi khi tải dữ liệu dịch vụ: ${err.message}</p>
            </div>
        `;
    }
}

async function loadPetsSection() {
    const contentSection = document.getElementById('content-section');
    contentSection.innerHTML = `
        <h2><i class="fas fa-paw"></i> Quản lý Thú cưng</h2>
        
        <div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">
                <i class="fas fa-search"></i> Tìm kiếm Thú cưng
            </h3>
            <form id="pet-search-form" onsubmit="handlePetSearch(event)" style="display: flex; gap: 1rem; align-items: end;">
                <div style="flex: 1;">
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 600; font-size: 0.9rem;">
                        <i class="fas fa-tag"></i> Mã Thú cưng
                    </label>
                    <input type="text" id="pet-search-input" placeholder="VD: TC00000001" maxlength="10" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;"
                           onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='#e0e0e0'" required>
                    <small style="color: var(--text-light); font-size: 0.8rem;">Nhập mã thú cưng để tìm kiếm</small>
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
        
        <div id="pet-details-container">
            <p style="text-align: center; color: var(--text-light); padding: 2rem;">
                <i class="fas fa-info-circle"></i> Nhập mã thú cưng ở trên để xem thông tin chi tiết
            </p>
        </div>
    `;
}

async function handlePetSearch(event) {
    event.preventDefault();
    
    const maThuCung = document.getElementById('pet-search-input').value.trim().toUpperCase();
    
    if (!maThuCung) {
        alert('Vui lòng nhập mã thú cưng!');
        return;
    }
    
    const petContainer = document.getElementById('pet-details-container');
    petContainer.innerHTML = `
        <p style="text-align: center; color: var(--text-light); padding: 2rem;">
            <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
        </p>
    `;
    
    try {
        const petDetails = await api.getPetDetails(maThuCung);
        displayPetDetails(petDetails);
    } catch (err) {
        console.error('Error loading pet details:', err);
        const errorMessage = err.message || 'Không tìm thấy thú cưng với mã này';
        petContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>${errorMessage}</p>
            </div>
        `;
    }
}

function displayPetDetails(pet) {
    if (!pet) {
        document.getElementById('pet-details-container').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>Không tìm thấy thông tin thú cưng</p>
            </div>
        `;
        return;
    }
    
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    
    const petHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <div style="display: flex; align-items: center; gap: 1.5rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 2px solid #f0f0f0;">
                <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">
                    <i class="fas fa-paw"></i>
                </div>
                <div style="flex: 1;">
                    <h3 style="color: var(--text-dark); margin: 0 0 0.5rem 0; font-size: 1.5rem;">
                        ${pet.TenThuCung || 'N/A'}
                    </h3>
                    <p style="color: var(--text-light); margin: 0; font-size: 0.9rem;">
                        Mã: <strong>${pet.MaThuCung || 'N/A'}</strong>
                    </p>
                </div>
            </div>
            
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                <div style="background: #f8faff; padding: 1.5rem; border-radius: 10px; border-left: 4px solid var(--primary);">
                    <h4 style="color: var(--primary); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-info-circle"></i> Thông tin Thú cưng
                    </h4>
                    <div style="display: grid; gap: 0.75rem; color: var(--text-dark);">
                        <div>
                            <strong style="color: var(--text-light);">Loài:</strong><br>
                            <span style="font-size: 1.1rem;">${pet.Loai || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">Giống:</strong><br>
                            <span style="font-size: 1.1rem;">${pet.Giong || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">Giới tính:</strong><br>
                            <span style="font-size: 1.1rem;">${pet.GioiTinh || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">Ngày sinh:</strong><br>
                            <span style="font-size: 1.1rem;">${pet.NgaySinh ? dateFormatter.format(new Date(pet.NgaySinh)) : 'N/A'}</span>
                        </div>
                    </div>
                </div>
                
                <div style="background: #f8faff; padding: 1.5rem; border-radius: 10px; border-left: 4px solid var(--accent);">
                    <h4 style="color: var(--accent); margin: 0 0 1rem 0; display: flex; align-items: center; gap: 0.5rem;">
                        <i class="fas fa-user"></i> Thông tin Chủ sở hữu
                    </h4>
                    <div style="display: grid; gap: 0.75rem; color: var(--text-dark);">
                        <div>
                            <strong style="color: var(--text-light);">Mã khách hàng:</strong><br>
                            <span style="font-size: 1.1rem; font-weight: 600;">${pet.MaKhachHang || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">Tên chủ sở hữu:</strong><br>
                            <span style="font-size: 1.1rem;">${pet.TenChuSoHuu || 'N/A'}</span>
                        </div>
                        <div>
                            <strong style="color: var(--text-light);">Số điện thoại:</strong><br>
                            <span style="font-size: 1.1rem;">${pet.SoDienThoai || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('pet-details-container').innerHTML = petHTML;
}

async function loadStaffSection() {
    const contentSection = document.getElementById('content-section');
    contentSection.innerHTML = `
        <h2><i class="fas fa-users"></i> Quản lý Nhân viên</h2>
        <div id="staff-list" style="display: grid; gap: 1rem;">
            <p style="text-align: center; color: var(--text-light); padding: 2rem;">
                <i class="fas fa-spinner fa-spin"></i> Đang tải dữ liệu...
            </p>
        </div>
    `;
    
    try {
        const staff = await api.getAllStaff();
        const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        
        if (staff.length === 0) {
            document.getElementById('staff-list').innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users"></i>
                    <p>Chưa có nhân viên nào trong hệ thống.</p>
                </div>
            `;
            return;
        }
        
        // Group staff by ChucVu (Position)
        const groupedByPosition = {};
        staff.forEach(employee => {
            const position = employee.ChucVu || 'Khác';
            if (!groupedByPosition[position]) {
                groupedByPosition[position] = [];
            }
            groupedByPosition[position].push(employee);
        });
        
        let staffHTML = '';
        
        // Display each position group
        Object.keys(groupedByPosition).forEach(position => {
            staffHTML += `
                <div style="margin-bottom: 2rem;">
                    <h3 style="color: var(--primary); margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid var(--bg-light);">
                        <i class="fas fa-briefcase"></i> ${position}
                    </h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem;">
                        ${groupedByPosition[position].map(emp => `
                            <div class="staff-card" onclick="showEmployeeDetails('${emp.MaNhanVien}', '${emp.HoTen || 'N/A'}')" style="background: #f8faff; padding: 1.5rem; border-radius: 10px; border-left: 4px solid var(--primary); box-shadow: 0 2px 8px rgba(0,0,0,0.1); cursor: pointer; transition: all 0.3s;">
                                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                                    <div style="width: 50px; height: 50px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 1.2rem;">
                                        ${emp.HoTen ? emp.HoTen.charAt(0) : 'N'}
                                    </div>
                                    <div style="flex: 1;">
                                        <h4 style="color: var(--text-dark); margin: 0 0 0.25rem 0; font-size: 1.1rem;">
                                            ${emp.HoTen || 'N/A'}
                                        </h4>
                                        <p style="color: var(--text-light); margin: 0; font-size: 0.85rem;">
                                            ${emp.MaNhanVien || 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div style="display: grid; gap: 0.5rem; color: var(--text-light); font-size: 0.9rem;">
                                    <div>
                                        <i class="fas fa-building" style="color: var(--primary); width: 20px;"></i>
                                        <strong>Chi nhánh:</strong> ${emp.TenChiNhanh || 'N/A'}
                                    </div>
                                    <div>
                                        <i class="fas fa-calendar-alt" style="color: var(--primary); width: 20px;"></i>
                                        <strong>Ngày vào làm:</strong> ${emp.NgayVaoLam ? dateFormatter.format(new Date(emp.NgayVaoLam)) : 'N/A'}
                                    </div>
                                    <div>
                                        <i class="fas fa-money-bill-wave" style="color: var(--accent); width: 20px;"></i>
                                        <strong>Lương cơ bản:</strong> ${emp.LuongCoBan ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(emp.LuongCoBan) : 'N/A'}
                                    </div>
                                </div>
                                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(0,0,0,0.1); text-align: center; color: var(--primary); font-size: 0.85rem;">
                                    <i class="fas fa-info-circle"></i> Click để xem chi tiết
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        });
        
        document.getElementById('staff-list').innerHTML = staffHTML;
    } catch (err) {
        console.error('Error loading staff:', err);
        document.getElementById('staff-list').innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-triangle" style="color: #e74c3c;"></i>
                <p>Lỗi khi tải dữ liệu nhân viên: ${err.message}</p>
            </div>
        `;
    }
}

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
        const transfers = await api.getTransferHistory(maNV);
        
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
        
        <div style="background: white; padding: 1.5rem; border-radius: 15px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 2rem;">
            <h3 style="color: var(--primary); margin-bottom: 1rem;">
                <i class="fas fa-filter"></i> Tìm kiếm & Lọc dữ liệu
            </h3>
            <form id="report-filter-form" onsubmit="handleReportFilter(event)" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; align-items: end;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 600; font-size: 0.9rem;">
                        <i class="fas fa-calendar-alt"></i> Tháng
                    </label>
                    <input type="number" id="filter-thang" min="1" max="12" value="${currentMonth}" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;"
                           onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='#e0e0e0'" required>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 600; font-size: 0.9rem;">
                        <i class="fas fa-calendar"></i> Năm
                    </label>
                    <input type="number" id="filter-nam" min="2020" max="2100" value="${currentYear}" 
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;"
                           onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='#e0e0e0'" required>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; color: var(--text-dark); font-weight: 600; font-size: 0.9rem;">
                        <i class="fas fa-user"></i> Mã Nhân viên (Tùy chọn)
                    </label>
                    <input type="text" id="filter-manv" placeholder="VD: NV00000001" maxlength="10"
                           style="width: 100%; padding: 0.75rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; transition: border-color 0.3s;"
                           onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='#e0e0e0'">
                    <small style="color: var(--text-light); font-size: 0.8rem;">Để trống để xem tất cả nhân viên</small>
                </div>
                <div>
                    <button type="submit" style="width: 100%; padding: 0.75rem; background: var(--primary); color: white; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s;"
                            onmouseover="this.style.background='var(--secondary)'; this.style.transform='translateY(-2px)'"
                            onmouseout="this.style.background='var(--primary)'; this.style.transform='translateY(0)'">
                        <i class="fas fa-search"></i> Tìm kiếm
                    </button>
                </div>
            </form>
            <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e0e0e0;">
                <button onclick="loadDefaultReports()" style="padding: 0.5rem 1rem; background: #f8faff; color: var(--primary); border: 2px solid var(--primary); border-radius: 8px; font-size: 0.9rem; cursor: pointer; transition: all 0.3s;"
                        onmouseover="this.style.background='var(--primary)'; this.style.color='white'"
                        onmouseout="this.style.background='#f8faff'; this.style.color='var(--primary)'">
                    <i class="fas fa-redo"></i> Xem 12 tháng gần nhất
                </button>
            </div>
        </div>
        
        <div id="reports-content" style="margin-top: 2rem;">
            <p style="text-align: center; color: var(--text-light); padding: 2rem;">
                <i class="fas fa-info-circle"></i> Vui lòng chọn tháng và năm để xem báo cáo, hoặc nhấn "Xem 12 tháng gần nhất" để xem báo cáo mặc định
            </p>
        </div>
    `;
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

// Make loadSection available globally for onclick handlers
window.loadSection = loadSection;
window.logout = logout;
window.showEmployeeDetails = showEmployeeDetails;
window.closeEmployeeModal = closeEmployeeModal;
window.handleReportFilter = handleReportFilter;
window.loadDefaultReports = loadDefaultReports;
window.handlePetSearch = handlePetSearch;

