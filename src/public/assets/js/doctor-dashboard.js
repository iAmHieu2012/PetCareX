// Doctor Dashboard Class
class DoctorDashboard {
    constructor() {
        this.currentUser = this.loadUser();
        this.appointments = [];
        this.pets = [];
        this.prescriptions = [];
        this.init();
    }

    init() {
        if (!this.currentUser) {
            window.location.href = '/login.html';
            return;
        }

        document.getElementById('userNameDisplay').innerText = `Bác Sĩ ${this.currentUser.name}`;
        
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
        if (section === 'appointments') this.loadAppointments();
        else if (section === 'medical-records') this.loadMedicalRecords();
        else if (section === 'patients') this.loadPatients();
        else if (section === 'prescriptions') this.loadPrescriptions();
    }

    async loadDashboard() {
        try {
            const token = localStorage.getItem('token');
            
            // Load today's appointments
            const appointmentsRes = await fetch('/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const appointmentsData = await appointmentsRes.json();
            this.appointments = appointmentsData.data || appointmentsData || [];

            // Load all pets
            const petsRes = await fetch('/api/pets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const petsData = await petsRes.json();
            this.pets = petsData.data || petsData || [];

            // Calculate stats
            const today = new Date().toLocaleDateString('en-CA');
            const todayAppointments = this.appointments.filter(a => {
                const appointmentDate = new Date(a.ThoiGian).toLocaleDateString('en-CA');
                return appointmentDate === today;
            });

            const pending = todayAppointments.filter(a => a.TrangThai === 'Chờ xác nhận').length;
            const completed = todayAppointments.filter(a => a.TrangThai === 'Đã xác nhận').length;

            document.getElementById('appointmentsToday').innerText = todayAppointments.length;
            document.getElementById('pendingAppointments').innerText = pending;
            document.getElementById('completedAppointments').innerText = completed;

            // Show upcoming appointments
            this.renderUpcomingAppointments(todayAppointments);

            // Load prescriptions
            this.loadPrescriptions();
        } catch (err) {
            console.error('Lỗi tải dashboard:', err);
        }
    }

    renderUpcomingAppointments(appointments) {
        const container = document.getElementById('upcomingAppointments');
        
        if (appointments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #999;">Không có lịch hẹn nào hôm nay</p>';
            return;
        }

        container.innerHTML = appointments
            .sort((a, b) => new Date(a.ThoiGian) - new Date(b.ThoiGian))
            .map(apt => {
                const pet = this.pets.find(p => p.MaThuCung === apt.MaThuCung);
                const time = new Date(apt.ThoiGian).toLocaleTimeString('vi-VN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });

                return `
                    <li class="appointment-item">
                        <div class="appointment-time">${time}</div>
                        <div class="appointment-details">
                            <div class="appointment-pet">${pet?.TenThuCung || 'Chưa xác định'}</div>
                            <small>Loại: ${pet?.Loai || 'N/A'} | ${apt.LoaiLichHen}</small>
                        </div>
                        <span class="status-badge ${apt.TrangThai === 'Đã xác nhận' ? 'status-confirmed' : 'status-pending'}">
                            ${apt.TrangThai}
                        </span>
                    </li>
                `;
            })
            .join('');
    }

    async loadAppointments() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const appointments = data.data || data || [];

            const tbody = document.getElementById('appointmentsTable');
            
            if (appointments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có lịch hẹn nào</td></tr>';
                return;
            }

            tbody.innerHTML = appointments.map(apt => {
                const pet = this.pets.find(p => p.MaThuCung === apt.MaThuCung);
                const time = new Date(apt.ThoiGian).toLocaleString('vi-VN');

                return `
                    <tr>
                        <td>${time}</td>
                        <td>${apt.MaKhachHang}</td>
                        <td>${pet?.TenThuCung || 'N/A'}</td>
                        <td>${apt.LoaiLichHen}</td>
                        <td>
                            <span class="status-badge ${apt.TrangThai === 'Đã xác nhận' ? 'status-confirmed' : 'status-pending'}">
                                ${apt.TrangThai}
                            </span>
                        </td>
                        <td>
                            <button class="btn btn-primary" onclick="window.doctorDashboard.viewMedicalRecord('${apt.MaPhieuDichVu}')">
                                Xem Chi Tiết
                            </button>
                        </td>
                    </tr>
                `;
            }).join('');
        } catch (err) {
            console.error('Lỗi tải lịch hẹn:', err);
        }
    }

    async loadMedicalRecords() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/pets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const pets = data.data || data || [];

            const container = document.getElementById('medicalRecordsList');
            
            if (pets.length === 0) {
                container.innerHTML = '<p style="text-align: center;">Không có hồ sơ y tế</p>';
                return;
            }

            container.innerHTML = pets.map(pet => `
                <li class="appointment-item">
                    <div>
                        <div class="appointment-pet">${pet.TenThuCung}</div>
                        <small>Loại: ${pet.Loai} | Giống: ${pet.Giong || 'Chưa xác định'} | Tình Trạng: ${pet.TinhTrang || 'Bình thường'}</small>
                    </div>
                    <button class="btn btn-primary" onclick="window.doctorDashboard.viewMedicalHistory('${pet.MaThuCung}')">
                        Xem Chi Tiết
                    </button>
                </li>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải hồ sơ y tế:', err);
        }
    }

    async loadPatients() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/pets', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const pets = data.data || data || [];

            const tbody = document.getElementById('patientsTable');
            
            if (pets.length === 0) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Không có bệnh nhân</td></tr>';
                return;
            }

            tbody.innerHTML = pets.map(pet => `
                <tr>
                    <td>${pet.TenThuCung}</td>
                    <td>${pet.Loai}</td>
                    <td>${pet.Giong || 'N/A'}</td>
                    <td>${pet.MaKhachHang}</td>
                    <td>N/A</td>
                    <td>
                        <button class="btn btn-primary" onclick="window.doctorDashboard.viewPatientDetails('${pet.MaThuCung}')">
                            Chi Tiết
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải danh sách bệnh nhân:', err);
        }
    }

    async loadPrescriptions() {
        try {
            const token = localStorage.getItem('token');
            
            // Since we don't have a dedicated prescription endpoint, simulate with appointments
            const response = await fetch('/api/bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            const appointments = data.data || data || [];

            // Filter for completed appointments (have medical records)
            const prescriptions = appointments.filter(a => a.MaPhieuDichVu);

            const tbody = document.getElementById('prescriptionsTable');
            
            if (prescriptions.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">Không có đơn thuốc nào</td></tr>';
                return;
            }

            tbody.innerHTML = prescriptions.map((apt, idx) => `
                <tr>
                    <td>ĐT${String(idx + 1).padStart(5, '0')}</td>
                    <td>${apt.MaThuCung}</td>
                    <td>${new Date(apt.ThoiGian).toLocaleDateString('vi-VN')}</td>
                    <td>Khám ${apt.LoaiLichHen}</td>
                    <td>
                        <button class="btn btn-primary" onclick="alert('Xem chi tiết đơn thuốc')">
                            Xem
                        </button>
                    </td>
                </tr>
            `).join('');
        } catch (err) {
            console.error('Lỗi tải đơn thuốc:', err);
        }
    }

    openPrescriptionModal() {
        // Populate pet dropdown
        const select = document.getElementById('prescriptionPet');
        select.innerHTML = '<option value="">-- Chọn bệnh nhân --</option>' + 
            this.pets.map(p => `<option value="${p.MaThuCung}">${p.TenThuCung}</option>`).join('');
        
        document.getElementById('prescriptionModal').classList.add('active');
    }

    closePrescriptionModal() {
        document.getElementById('prescriptionModal').classList.remove('active');
        document.getElementById('prescriptionForm').reset();
    }

    async submitPrescription(event) {
        event.preventDefault();
        
        const petId = document.getElementById('prescriptionPet').value;
        const content = document.getElementById('prescriptionContent').value;

        if (!petId) {
            alert('Vui lòng chọn bệnh nhân');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/prescriptions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    maThuCung: petId,
                    content: content,
                    ngayTao: new Date().toISOString().split('T')[0]
                })
            });

            if (response.ok) {
                alert('Lưu đơn thuốc thành công!');
                this.closePrescriptionModal();
                this.loadPrescriptions();
            }
        } catch (err) {
            console.error('Lỗi lưu đơn thuốc:', err);
            alert('Không thể lưu đơn thuốc');
        }
    }

    viewMedicalRecord(maPhieuDichVu) {
        alert(`Xem chi tiết hồ sơ: ${maPhieuDichVu}`);
        // Implementation for viewing medical record
    }

    viewMedicalHistory(maThuCung) {
        alert(`Xem lịch sử khám bệnh của: ${maThuCung}`);
        // Implementation for viewing medical history
    }

    viewPatientDetails(maThuCung) {
        const pet = this.pets.find(p => p.MaThuCung === maThuCung);
        if (pet) {
            alert(`Thú Cưng: ${pet.TenThuCung}\nLoại: ${pet.Loai}\nGiống: ${pet.Giong}\nSinh Nhật: ${pet.NgaySinh}`);
        }
    }

    logout() {
        localStorage.clear();
        window.location.href = '/login.html';
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.doctorDashboard = new DoctorDashboard();
    });
} else {
    window.doctorDashboard = new DoctorDashboard();
}
