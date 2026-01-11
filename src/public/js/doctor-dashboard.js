import { api } from './api.js';

const state = {
    maBacSi: localStorage.getItem('maNhanVien'),
    medicines: [],
    todayExams: [],
    completedExams: [],
    upcomingExams: [],
    todayVaccines: [],
    completedVaccines: [],
    upcomingVaccines: [],
    vaccines: [],
    currentVaccineData: null
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'BacSi') window.location.href = '/login.html';
    document.getElementById('userName').textContent = user.name;

    setupMainTabs();
    setupSubTabs();
    await loadMedicines();
    await loadVaccines();
    await refreshData();

    document.getElementById('medicalForm').onsubmit = handleExamSubmit;
    document.getElementById('vacForm').onsubmit = handleVacSubmit;
    document.getElementById('logoutBtn').onclick = () => { localStorage.clear(); window.location.href = '/login.html'; };
});

function setupMainTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        };
    });
}

function setupSubTabs() {
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
        btn.onclick = () => {
            const parent = btn.closest('.tab-pane');
            parent.querySelectorAll('.sub-tab-btn').forEach(el => el.classList.remove('active'));
            parent.querySelectorAll('.sub-tab-pane').forEach(el => el.classList.remove('active'));
            
            btn.classList.add('active');
            const subtabName = btn.dataset.subtab;
            parent.querySelector(`#${subtabName}-tab`).classList.add('active');
        };
    });
}

async function refreshData() {
    await Promise.all([
        loadTodayMedicalForms(), 
        loadCompletedMedicalForms(),
        loadUpcomingMedicalForms(),
        loadTodayVaccinationForms(),
        loadCompletedVaccinationForms(),
        loadUpcomingVaccinationForms()
    ]);
    updateWelcomeMessage();
}

function updateWelcomeMessage() {
    const todayExamCount = state.todayExams.length;
    const todayVacCount = state.todayVaccines.length;
    document.getElementById('exam-count').textContent = todayExamCount;
    document.getElementById('vac-count').textContent = todayVacCount;
}

// --- TAB HÔM NAY ---
async function loadTodayMedicalForms() {
    const list = document.getElementById('medical-today-list');
    try {
        const res = await fetch(`/api/medical-forms/today/${state.maBacSi}`).then(r => r.json());
        state.todayExams = res.data || [];
        
        if (state.todayExams.length > 0) {
            list.innerHTML = state.todayExams.map(item => {
                const isCompleted = item.TrangThaiKham === 'Đã khám';
                return `
                    <div class="booking-card border-medical">
                        <div class="booking-header">
                            <h3>${item.TenThuCung} <small>(${item.Loai})</small></h3>
                            <span class="status-badge ${isCompleted ? 'success' : 'pending'}">${item.TrangThaiKham}</span>
                        </div>
                        <div class="booking-body">
                            <p><strong><i class="fas fa-user"></i> Chủ:</strong> ${item.TenKhachHang}</p>
                            <p><strong><i class="fas fa-hashtag"></i> Phiếu:</strong> ${item.MaPhieuDichVu}</p>
                            <p><strong><i class="fas fa-clock"></i> Giờ:</strong> ${new Date(item.ThoiGian).toLocaleTimeString('vi-VN')}</p>
                        </div>
                        <div style="display: flex; gap: 10px;">
                            ${!isCompleted ? `
                                <button class="btn-primary" style="flex: 1;" 
                                    onclick="openMedicalModal('${item.MaPhieuDichVu}', '${item.TenThuCung}')">
                                    <i class="fas fa-stethoscope"></i> Bắt đầu khám
                                </button>
                            ` : `
                                <button class="btn-info" style="flex: 1;" onclick="viewPrescriptions('${item.MaPhieuDichVu}')">
                                    <i class="fas fa-pills"></i> Xem toa thuốc
                                </button>
                            `}
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            list.innerHTML = '<div class="empty-state">Hôm nay không còn ca khám nào.</div>';
        }
    } catch (err) { console.error(err); }
}

// --- TAB ĐÃ KHÁM ---
async function loadCompletedMedicalForms() {
    const list = document.getElementById('medical-completed-list');
    try {
        const res = await fetch(`/api/medical-forms/completed/${state.maBacSi}`).then(r => r.json());
        state.completedExams = res.data || [];
        
        if (state.completedExams.length > 0) {
            list.innerHTML = state.completedExams.map(item => `
                <div class="booking-card border-medical">
                    <div class="booking-header">
                        <h3>${item.TenThuCung} <small>(${item.Loai})</small></h3>
                        <span class="status-badge success">Đã khám</span>
                    </div>
                    <div class="booking-body">
                        <p><strong><i class="fas fa-user"></i> Chủ:</strong> ${item.TenKhachHang}</p>
                        <p><strong><i class="fas fa-hashtag"></i> Phiếu:</strong> ${item.MaPhieuDichVu}</p>
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #6366f1; font-weight: 600;">📋 Xem chi tiết khám & toa thuốc</summary>
                            <div style="margin-top: 10px; padding: 10px; background: #f0f9ff; border-left: 3px solid #6366f1; border-radius: 4px;">
                                <p><strong>Triệu chứng:</strong> ${item.TrieuChung}</p>
                                <p><strong>Chuẩn đoán:</strong> ${item.ChuanDoan}</p>
                                ${item.NgayHenTaiKham ? `<p><strong>Hẹn tái khám:</strong> ${new Date(item.NgayHenTaiKham).toLocaleDateString('vi-VN')}</p>` : ''}
                                <button class="btn-info" style="margin-top: 10px; width: 100%;" onclick="viewPrescriptions('${item.MaPhieuDichVu}')">
                                    <i class="fas fa-pills"></i> Xem toa thuốc
                                </button>
                            </div>
                        </details>
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="empty-state">Chưa có ca khám nào được hoàn tất.</div>';
        }
    } catch (err) { console.error(err); }
}

// --- TAB CHƯA TỚI NGÀY KHÁM ---
async function loadUpcomingMedicalForms() {
    const list = document.getElementById('medical-upcoming-list');
    try {
        const res = await fetch(`/api/medical-forms/upcoming/${state.maBacSi}`).then(r => r.json());
        state.upcomingExams = res.data || [];
        
        if (state.upcomingExams.length > 0) {
            list.innerHTML = state.upcomingExams.map(item => `
                <div class="booking-card border-medical" style="opacity: 0.8;">
                    <div class="booking-header">
                        <h3>${item.TenThuCung} <small>(${item.Loai})</small></h3>
                        <span class="status-badge" style="background: #9ca3af;">Sắp tới</span>
                    </div>
                    <div class="booking-body">
                        <p><strong><i class="fas fa-user"></i> Chủ:</strong> ${item.TenKhachHang}</p>
                        <p><strong><i class="fas fa-hashtag"></i> Phiếu:</strong> ${item.MaPhieuDichVu}</p>
                        <p><strong><i class="fas fa-calendar"></i> Ngày khám:</strong> ${new Date(item.ThoiGian).toLocaleDateString('vi-VN')} ${new Date(item.ThoiGian).toLocaleTimeString('vi-VN')}</p>
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="empty-state">Không có ca khám sắp tới.</div>';
        }
    } catch (err) { console.error(err); }
}

// --- LOGIC TIÊM PHÒNG ---
async function loadTodayVaccinationForms() {
    const list = document.getElementById('vaccination-today-list');
    try {
        const res = await fetch(`/api/vaccinations/today/${state.maBacSi}`).then(r => r.json());
        state.todayVaccines = res.data || [];
        
        if (state.todayVaccines.length > 0) {
            list.innerHTML = state.todayVaccines.map(item => {
                const isCompleted = item.NgayTiem !== null;
                return `
                    <div class="booking-card border-vaccine">
                        <div class="booking-header">
                            <h3>${item.TenThuCung} <small>(${item.Loai})</small></h3>
                            <span class="status-badge ${isCompleted ? 'success' : 'pending'}">${isCompleted ? 'Đã tiêm' : 'Chưa tiêm'}</span>
                        </div>
                        <div class="booking-body">
                            <p><strong><i class="fas fa-user"></i> Chủ:</strong> ${item.TenKhachHang}</p>
                            <p><strong><i class="fas fa-hashtag"></i> Phiếu:</strong> ${item.MaPhieuDichVu}</p>
                            <p><strong><i class="fas fa-clock"></i> Giờ:</strong> ${new Date(item.ThoiGian).toLocaleTimeString('vi-VN')}</p>
                        </div>
                        ${!isCompleted ? `
                            <button class="btn-primary" style="width:100%; margin-top:10px" 
                                onclick="openVaccinationModal('${item.MaPhieuDichVu}', '${item.TenThuCung}', '${item.MaThuCung}', '${item.MaGoiTiem}')">
                                <i class="fas fa-syringe"></i> Bắt đầu tiêm
                            </button>
                        ` : `
                            <button class="btn-secondary" style="width:100%; margin-top:10px;" disabled>
                                <i class="fas fa-check"></i> Đã hoàn tất
                            </button>
                        `}
                    </div>
                `;
            }).join('');
        } else {
            list.innerHTML = '<div class="empty-state">Hôm nay không có ca tiêm nào.</div>';
        }
    } catch (err) { console.error(err); }
}

async function loadCompletedVaccinationForms() {
    const list = document.getElementById('vaccination-completed-list');
    try {
        const res = await fetch(`/api/vaccinations/completed/${state.maBacSi}`).then(r => r.json());
        state.completedVaccines = res.data || [];
        
        if (state.completedVaccines.length > 0) {
            list.innerHTML = state.completedVaccines.map(item => `
                <div class="booking-card border-vaccine">
                    <div class="booking-header">
                        <h3>${item.TenThuCung} <small>(${item.Loai})</small></h3>
                        <span class="status-badge success">Đã tiêm</span>
                    </div>
                    <div class="booking-body">
                        <p><strong><i class="fas fa-user"></i> Chủ:</strong> ${item.TenKhachHang}</p>
                        <p><strong><i class="fas fa-hashtag"></i> Phiếu:</strong> ${item.MaPhieuDichVu}</p>
                        <details style="margin-top: 10px;">
                            <summary style="cursor: pointer; color: #10b981; font-weight: 600;">💉 Xem chi tiết tiêm</summary>
                            <div style="margin-top: 10px; padding: 10px; background: #f0fdf4; border-left: 3px solid #10b981; border-radius: 4px;">
                                <p><strong>Ngày tiêm:</strong> ${new Date(item.NgayTiem).toLocaleDateString('vi-VN')}</p>
                                <p><strong>Vacxin:</strong> ${item.TenVacxin}</p>
                                <p><strong>Liều lượng:</strong> ${item.LieuLuong}ml</p>
                            </div>
                        </details>
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="empty-state">Chưa có ca tiêm nào được hoàn tất.</div>';
        }
    } catch (err) { console.error(err); }
}

async function loadUpcomingVaccinationForms() {
    const list = document.getElementById('vaccination-upcoming-list');
    try {
        const res = await fetch(`/api/vaccinations/upcoming/${state.maBacSi}`).then(r => r.json());
        state.upcomingVaccines = res.data || [];
        
        if (state.upcomingVaccines.length > 0) {
            list.innerHTML = state.upcomingVaccines.map(item => `
                <div class="booking-card border-vaccine" style="opacity: 0.8;">
                    <div class="booking-header">
                        <h3>${item.TenThuCung} <small>(${item.Loai})</small></h3>
                        <span class="status-badge" style="background: #9ca3af;">Sắp tới</span>
                    </div>
                    <div class="booking-body">
                        <p><strong><i class="fas fa-user"></i> Chủ:</strong> ${item.TenKhachHang}</p>
                        <p><strong><i class="fas fa-hashtag"></i> Phiếu:</strong> ${item.MaPhieuDichVu}</p>
                        <p><strong><i class="fas fa-calendar"></i> Ngày tiêm:</strong> ${new Date(item.ThoiGian).toLocaleDateString('vi-VN')} ${new Date(item.ThoiGian).toLocaleTimeString('vi-VN')}</p>
                    </div>
                </div>
            `).join('');
        } else {
            list.innerHTML = '<div class="empty-state">Không có ca tiêm sắp tới.</div>';
        }
    } catch (err) { console.error(err); }
}

async function loadVaccines() {
    try {
        const res = await fetch('/api/products/vaccines').then(r => r.json());
        if (res.success) {
            state.vaccines = res.data || [];
        }
    } catch (err) { console.error(err); }
}

// --- LOGIC KÊ TOA THUỐC ---
async function loadMedicines() {
    const res = await fetch('/api/products/medicines').then(r => r.json());
    if (res.success) {
        state.medicines = res.data;
        renderMedicineList(res.data);
        document.getElementById('searchMedicine').oninput = (e) => {
            const kw = e.target.value.toLowerCase();
            renderMedicineList(state.medicines.filter(m => m.TenThuoc.toLowerCase().includes(kw)));
        };
    }
}

function renderMedicineList(meds) {
    const container = document.getElementById('medicine-selection-list');
    container.innerHTML = meds.map(m => `
        <div class="med-item">
            <label><input type="checkbox" class="med-cb" value="${m.MaThuoc}" onchange="toggleMedQty('${m.MaThuoc}')"> ${m.TenThuoc}</label>
            <input type="number" id="qty-${m.MaThuoc}" class="med-qty" value="1" min="1" disabled>
        </div>
    `).join('');
}

window.toggleMedQty = (id) => {
    const input = document.getElementById(`qty-${id}`);
    input.disabled = !input.disabled;
};

// Cập nhật hàm handleExamSubmit trong doctor-dashboard.js
async function handleExamSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitExam');
    
    // 1. Thu thập danh sách thuốc
    const prescriptions = [];
    document.querySelectorAll('.med-cb:checked').forEach(cb => {
        const maThuoc = cb.value;
        const soLuong = parseInt(document.getElementById(`qty-${maThuoc}`).value);
        if (soLuong > 0) {
            prescriptions.push({ maThuoc, soLuong });
        }
    });

    // 2. Gom tất cả dữ liệu (Bao gồm phí khám)
    const payload = {
        maPhieuDichVu: document.getElementById('exam-maPDV').value,
        phiKhamBenh: parseInt(document.getElementById('exam-phiKham').value) || 0, // <--- PHÍ KHÁM
        trieuChung: document.getElementById('exam-trieuChung').value,
        chuanDoan: document.getElementById('exam-chuanDoan').value,
        ngayHenTaiKham: document.getElementById('exam-taiKham').value || null,
        prescriptions: prescriptions 
    };

    console.log('📤 Gửi dữ liệu khám bệnh:', payload);

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang cập nhật hệ thống...';

    try {
        const res = await fetch('/api/medical-forms/update', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json());

        console.log('📥 Phản hồi từ server:', res);

        if (res.success) {
            alert('✓ Đã cập nhật Bệnh án, Toa thuốc và Phí dịch vụ thành công!\n💰 Phí khám: ' + payload.phiKhamBenh.toLocaleString() + ' VNĐ');
            closeModal('medicalModal');
            await refreshData(); // Tải lại danh sách card để mất ca vừa khám
        } else {
            alert('Lỗi từ hệ thống: ' + res.message);
        }
    } catch (err) {
        console.error('❌ Lỗi kết nối:', err);
        alert('Không thể kết nối đến máy chủ để lưu dữ liệu.');
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-save"></i> Hoàn tất & Chuyển thanh toán';
    }
}

// --- HELPER ---
window.openMedicalModal = (maPDV, name) => {
    document.getElementById('exam-maPDV').value = maPDV;
    document.getElementById('modal-pet-info').innerHTML = `<i class="fas fa-paw"></i> Đang chẩn đoán cho: <strong>${name}</strong>`;
    document.getElementById('medicalModal').style.display = 'block';
};

window.openVaccinationModal = (maPDV, name, maThuCung, maGoiTiem) => {
    document.getElementById('vac-maPDV').value = maPDV;
    document.getElementById('modal-vac-pet-info').innerHTML = `<i class="fas fa-paw"></i> Đang tiêm cho: <strong>${name}</strong>`;
    
    // Lưu dữ liệu để kiểm tra sau
    state.currentVaccineData = { maPDV, maThuCung, maGoiTiem };
    
    // Tải danh sách vacxin cho gói tiêm này
    loadAvailableVaccines(maThuCung, maGoiTiem);
    
    document.getElementById('vaccinationModal').style.display = 'block';
};

async function loadAvailableVaccines(maThuCung, maGoiTiem) {
    try {
        const res = await fetch(`/api/vaccinations/available/${maThuCung}/${maGoiTiem}`).then(r => r.json());
        const select = document.getElementById('vac-maVacxin');
        select.innerHTML = '<option value="">-- Chọn vacxin --</option>';
        
        if (res.success && res.data) {
            res.data.forEach(vac => {
                const option = document.createElement('option');
                option.value = vac.MaVacxin;
                option.textContent = `${vac.TenVacxin} (${vac.ConLai} mũi còn lại)`;
                option.dataset.maxDosage = vac.LieuLuongToiDa;
                option.disabled = vac.ConLai <= 0; // Disable nếu không còn mũi
                select.appendChild(option);
            });
        }
    } catch (err) {
        console.error(err);
        alert('Lỗi khi tải danh sách vacxin');
    }
}

window.updateVaccineLimits = () => {
    const select = document.getElementById('vac-maVacxin');
    const selectedOption = select.options[select.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.maxDosage) {
        const maxDosage = parseInt(selectedOption.dataset.maxDosage);
        document.getElementById('max-dosage').textContent = maxDosage;
        document.getElementById('vac-lieuLuong').max = maxDosage;
        document.getElementById('vac-lieuLuong').value = 1;
    }
};

window.validateDosage = () => {
    const input = document.getElementById('vac-lieuLuong');
    const maxDosage = parseInt(input.max) || 10;
    const currentValue = parseInt(input.value) || 0;
    
    if (currentValue > maxDosage) {
        document.getElementById('dosage-warning').style.display = 'block';
        input.value = maxDosage;
    } else {
        document.getElementById('dosage-warning').style.display = 'none';
    }
};

window.closeModal = (id) => document.getElementById(id).style.display = 'none';

window.viewPrescriptions = async (maPDV) => {
    try {
        const modal = document.getElementById('prescriptionModal');
        const content = document.getElementById('prescription-content');
        modal.style.display = 'block';
        
        const res = await fetch(`/api/medical-forms/detail/${maPDV}`).then(r => r.json());
        if (res.success && res.data.prescriptions) {
            const prescList = res.data.prescriptions;
            if (prescList.length === 0) {
                content.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Không có toa thuốc cho ca khám này</p>';
                return;
            }
            
            const prescHTML = prescList.map((p, idx) => {
                return `
                    <div style="display: flex; align-items: center; padding: 12px; border-bottom: 1px solid #e5e7eb; background: #f9fafb; border-radius: 4px; margin-bottom: 8px;">
                        <span style="color: #667eea; font-weight: 700; min-width: 30px; text-align: center;">${idx + 1}.</span>
                        <div style="flex: 1; margin-left: 10px;">
                            <strong style="color: #1f2937;">${p.TenSanPham}</strong><br>
                            <small style="color: #6b7280;">SL: ${p.SoLuong}</small>
                        </div>
                    </div>
                `;
            }).join('');
            
            content.innerHTML = `
                <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 12px; border-radius: 4px; margin-bottom: 15px;">
                    <strong style="color: #1e40af; display: block; margin-bottom: 5px;">📋 Danh sách thuốc kê đơn</strong>
                    <small style="color: #1e40af;">Tổng cộng ${prescList.length} loại thuốc</small>
                </div>
                ${prescHTML}
            `;
        } else {
            content.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">Lỗi khi tải toa thuốc</p>';
        }
    } catch (err) {
        console.error(err);
        const content = document.getElementById('prescription-content');
        content.innerHTML = '<p style="color: #dc2626; text-align: center; padding: 20px;">❌ Lỗi khi tải toa thuốc</p>';
    }
};

async function handleVacSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitVac');
    
    const payload = {
        maPhieuDichVu: document.getElementById('vac-maPDV').value,
        maVacxin: document.getElementById('vac-maVacxin').value,
        lieuLuong: parseInt(document.getElementById('vac-lieuLuong').value) || 1
    };

    // Kiểm tra liều lượng
    const select = document.getElementById('vac-maVacxin');
    const selectedOption = select.options[select.selectedIndex];
    const maxDosage = parseInt(selectedOption.dataset.maxDosage) || 10;
    
    if (payload.lieuLuong > maxDosage) {
        alert(`Liều lượng không được vượt quá ${maxDosage}ml`);
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xác nhận...';

    try {
        const res = await fetch('/api/vaccinations/confirm-vaccination', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        }).then(r => r.json());

        if (res.success) {
            alert('✓ Đã xác nhận tiêm chủng thành công!');
            closeModal('vaccinationModal');
            await refreshData();
        } else {
            alert('Lỗi: ' + res.message);
        }
    } catch (err) {
        alert('Không thể kết nối đến máy chủ.');
        console.error(err);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="fas fa-check"></i> Xác nhận hoàn tất tiêm';
    }
}

function setupTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
        };
    });
}

// ============ LỊCH SỬ Y TẾ ============
window.searchForMedicalHistory = async () => {
    const input = document.getElementById('searchMedicalHistoryInput').value.trim();
    if (!input) {
        alert('Nhập CCCD hoặc SĐT khách');
        return;
    }

    try {
        const res = await fetch(`/api/customer/search?cccd=${input}&sdt=${input}`)
            .then(r => r.json());
        
        if (!res.success || !res.data) {
            alert('Không tìm thấy khách hàng');
            return;
        }

        const customer = res.data;
        state.selectedMedicalHistoryCustomer = customer;
        
        document.getElementById('historyCustomerName').textContent = customer.TenKhachHang;
        document.getElementById('historyCustomerPhone').textContent = customer.SoDienThoai;
        document.getElementById('historyCustomerCCCD').textContent = customer.CCCD;

        // Load pets
        const petsRes = await fetch(`/api/customer/pets/${customer.MaKhachHang}`)
            .then(r => r.json());
        const pets = petsRes.data || [];
        
        const petSelect = document.getElementById('historyPetSelect');
        petSelect.innerHTML = '<option value="">-- Chọn thú cưng --</option>' + 
            pets.map(p => `<option value="${p.MaThuCung}">${p.TenThuCung} (${p.LoaiThuCung})</option>`).join('');
        
        document.getElementById('medicalHistoryResults').style.display = 'block';
    } catch (err) {
        alert('Lỗi tìm kiếm: ' + err.message);
    }
};

window.loadMedicalHistory = async () => {
    const maThuCung = document.getElementById('historyPetSelect').value;
    if (!maThuCung) return;

    try {
        const res = await fetch(`/api/pets/history/${maThuCung}`)
            .then(r => r.json());
        
        if (!res.success) {
            alert('Lỗi tải lịch sử');
            return;
        }

        const { exams, vaccines } = res.data;
        
        // Render exam history
        const examsContainer = document.getElementById('historyExams');
        if (exams && exams.length > 0) {
            examsContainer.innerHTML = exams.map(exam => `
                <div class="booking-card border-medical">
                    <div class="booking-header">
                        <h3>${new Date(exam.NgayKham).toLocaleDateString('vi-VN')}</h3>
                        <span class="status-badge success">Đã khám</span>
                    </div>
                    <div class="booking-body">
                        <p><strong>Triệu chứng:</strong> ${exam.TrieuChung || 'Không ghi nhận'}</p>
                        <p><strong>Chẩn đoán:</strong> ${exam.ChuanDoan || 'Không ghi nhận'}</p>
                        <p><strong>Bác sĩ:</strong> ${exam.TenBacSi}</p>
                        ${exam.HenTaiKham ? `<p><strong>Hẹn tái khám:</strong> ${new Date(exam.HenTaiKham).toLocaleDateString('vi-VN')}</p>` : ''}
                    </div>
                </div>
            `).join('');
        } else {
            examsContainer.innerHTML = '<div class="empty-state">Không có lịch sử khám bệnh</div>';
        }

        // Render vaccine history
        const vaccinesContainer = document.getElementById('historyVaccines');
        if (vaccines && vaccines.length > 0) {
            vaccinesContainer.innerHTML = vaccines.map(vac => `
                <div class="booking-card border-vaccine">
                    <div class="booking-header">
                        <h3>${new Date(vac.NgayTiem).toLocaleDateString('vi-VN')}</h3>
                        <span class="status-badge success">Đã tiêm</span>
                    </div>
                    <div class="booking-body">
                        <p><strong>Vacxin:</strong> ${vac.TenVacxin}</p>
                        <p><strong>Liều lượng:</strong> ${vac.LieuLuong} ml</p>
                        <p><strong>Bác sĩ:</strong> ${vac.TenBacSi}</p>
                    </div>
                </div>
            `).join('');
        } else {
            vaccinesContainer.innerHTML = '<div class="empty-state">Không có lịch sử tiêm phòng</div>';
        }

        document.getElementById('medicalHistoryContent').style.display = 'block';
    } catch (err) {
        alert('Lỗi: ' + err.message);
    }
};

// ==================== TRA CỨU Y TẾ ====================
let historyData = {
    selectedCustomer: null,
    customers: [],
    selectedPet: null
};

// Tìm kiếm khách hàng
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('search-customer-input');
    if (searchInput) {
        searchInput.addEventListener('input', async (e) => {
            const keyword = e.target.value.trim();
            if (keyword.length < 2) {
                document.getElementById('customer-search-results').style.display = 'none';
                return;
            }

            try {
                const token = localStorage.getItem('token'); // Lấy token từ storage
                const response = await fetch(`/api/customer/search?keyword=${encodeURIComponent(keyword)}`, {
                    headers: { 
                        'Authorization': `Bearer ${token}` // Gửi kèm token xác thực
                    }
                });
                const result = await response.json();
                
                if (result.success && Array.isArray(result.data)) { // Kiểm tra mảng an toàn
                    const resultsDiv = document.getElementById('customer-search-results');
                    resultsDiv.innerHTML = result.data.map(customer => `
                        <div style="padding: 12px; border-bottom: 1px solid #e5e7eb; cursor: pointer;" 
                            onclick="selectCustomer('${customer.MaKhachHang}', '${customer.TenKhachHang}')">
                            <strong>${customer.TenKhachHang}</strong>
                            <small style="display: block;">📱 ${customer.SoDienThoai}</small> </div>
                    `).join('');
                    resultsDiv.style.display = 'block';
                }
            } catch (err) { console.error('Lỗi:', err); }
        });
    }
});

// Chọn khách hàng
window.selectCustomer = async function(maKhachHang, tenKhachHang) {
    historyData.selectedCustomer = maKhachHang;
    document.getElementById('search-customer-input').value = tenKhachHang;
    document.getElementById('customer-search-results').style.display = 'none';

    // Load danh sách thú cưng của khách hàng
    try {
        const response = await fetch(`/api/customer/pets/${maKhachHang}`);
        const result = await response.json();
        
        const petSelect = document.getElementById('history-pet-select');
        if (result.data && result.data.length > 0) {
            petSelect.innerHTML = '<option value="">-- Chọn thú cưng --</option>' +
                result.data.map(pet => `<option value="${pet.MaThuCung}">${pet.TenThuCung} (${pet.Loai})</option>`).join('');
        } else {
            petSelect.innerHTML = '<option value="">Khách hàng này không có thú cưng</option>';
        }
    } catch (err) {
        console.error('Lỗi load thú cưng:', err);
    }
};

// Tra cứu lịch sử y tế
window.searchMedicalHistory = async function() {
    if (!historyData.selectedCustomer) {
        alert('Vui lòng chọn khách hàng');
        return;
    }

    const petSelect = document.getElementById('history-pet-select');
    const selectedPet = petSelect.value;
    
    if (!selectedPet) {
        alert('Vui lòng chọn thú cưng');
        return;
    }

    // Ẩn phần hướng dẫn khi đang tra cứu
    const historyResults = document.getElementById('history-results');
    historyResults.style.display = 'none';

    try {
        const response = await fetch(`/api/medical-forms/pet-history/${selectedPet}`);
        const result = await response.json();
        
        if (result.data && result.data.length > 0) {
            const exams = result.data.filter(item => item.TrieuChung); // Phiếu khám bệnh
            const examSection = document.getElementById('history-exam-section');
            const examList = document.getElementById('history-exam-list');
            
            if (exams.length > 0) {
                examList.innerHTML = exams.map(exam => `
                    <div style="background: #f0f9ff; border-left: 4px solid #6366f1; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                            <strong style="color: #1e40af;">Phiếu: ${exam.MaPhieuDichVu}</strong>
                            <span style="color: #6b7280; font-size: 14px;">📅 ${new Date(exam.NgayKham || exam.ThoiGian).toLocaleDateString('vi-VN')}</span>
                        </div>
                        <p><strong>Triệu chứng:</strong> ${exam.TrieuChung}</p>
                        <p><strong>Chẩn đoán:</strong> ${exam.ChuanDoan}</p>
                        <p><strong>Bác sĩ:</strong> ${exam.HoTen}</p>
                        ${exam.NgayHenTaiKham ? `<p><strong>Hẹn tái khám:</strong> ${new Date(exam.NgayHenTaiKham).toLocaleDateString('vi-VN')}</p>` : ''}
                        <button class="btn-info" style="margin-top: 10px; width: 100%;" onclick="viewPrescriptions('${exam.MaPhieuDichVu}')">
                            <i class="fas fa-pills"></i> Xem toa thuốc
                        </button>
                    </div>
                `).join('');
                examSection.style.display = 'block';
            } else {
                examList.innerHTML = '<p style="color: #999; text-align: center;">Không có lịch sử khám bệnh</p>';
                examSection.style.display = 'block';
            }

            // Load lịch sử tiêm phòng từ API
            try {
                const vacResponse = await fetch(`/api/vaccinations/pet-history/${selectedPet}`);
                const vacResult = await vacResponse.json();
                const vaccineSection = document.getElementById('history-vaccine-section');
                const vaccineList = document.getElementById('history-vaccine-list');
                
                if (vacResult.data && vacResult.data.length > 0) {
                    vaccineList.innerHTML = vacResult.data.map(vac => `
                        <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin-bottom: 10px; border-radius: 8px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <strong style="color: #047857;">Phiếu: ${vac.MaPhieuDichVu}</strong>
                                <span style="color: #6b7280; font-size: 14px;">📅 ${new Date(vac.NgayTiem || vac.ThoiGian).toLocaleDateString('vi-VN')}</span>
                            </div>
                            <p><strong>Vacxin:</strong> ${vac.TenVacxin}</p>
                            <p><strong>Liều lượng:</strong> ${vac.LieuLuong} ml</p>
                            <p><strong>Bác sĩ:</strong> ${vac.HoTen}</p>
                        </div>
                    `).join('');
                    vaccineSection.style.display = 'block';
                } else {
                    vaccineList.innerHTML = '<p style="color: #999; text-align: center;">Không có lịch sử tiêm phòng</p>';
                    vaccineSection.style.display = 'block';
                }
            } catch (vacErr) {
                console.log('Lịch sử tiêm chưa có hoặc chưa khả dụng');
            }
        } else {
            // Hiển thị lại phần hướng dẫn nếu không có dữ liệu
            historyResults.style.display = 'block';
            document.getElementById('history-exam-section').style.display = 'none';
            document.getElementById('history-vaccine-section').style.display = 'none';
            alert('Không tìm thấy lịch sử y tế cho thú cưng này');
        }
    } catch (err) {
        console.error('Lỗi tra cứu:', err);
        alert('❌ Lỗi khi tra cứu lịch sử y tế');
    }
};