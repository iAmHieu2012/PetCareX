import { api } from './api.js';

let revenueChart = null;
let doctorChart = null;

// Định dạng tiền tệ VND
const formatVND = (val) => new Intl.NumberFormat('vi-VN').format(val || 0) + ' đ';

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
    const branchId = document.getElementById('branchSelect').value;
    const type = document.getElementById('reportType').value;
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
        // Gọi API api.getAdvancedReport (đã sửa trong api.js)
        const response = await api.getAdvancedReport(branchId, value, year, type);
        
        // Bóc tách dữ liệu từ response
        const responseData = response.data || response;
        const { stats, doctors } = responseData;

        // 1. Cập nhật các thẻ số liệu - Lưu ý TÊN BIẾN phải khớp với SQL
        document.getElementById('totalRevenue').innerText = formatVND(stats.TongDoanhThu);
        document.getElementById('serviceRevenue').innerText = formatVND(stats.DoanhThuDichVu);
        document.getElementById('productRevenue').innerText = formatVND(stats.DoanhThuSanPham);
        document.getElementById('visitCount').innerText = stats.SoLuotKham;

        // 2. Vẽ biểu đồ Doanh thu (Sử dụng chính con số tổng)
        renderRevenueChart([{ ThoiGian: 'Kỳ này', TongDoanhThu: stats.TongDoanhThu }], type, branchId);

        // 3. Vẽ biểu đồ Bác sĩ (Truyền mảng doctors vào)
        renderDoctorChart(doctors);

    } catch (err) {
        console.error("Lỗi khi hiển thị báo cáo:", err);
    }
};

// Cập nhật các con số thẻ (Cards)
function updateKPIs(data) {
    const total = data.reduce((sum, item) => sum + (item.TongDoanhThu || 0), 0);
    document.getElementById('totalRevenue').innerText = formatVND(total);
}

function updateAdvancedCards(advData) {
    // Dữ liệu từ SP_Report_GeneralStats
    document.getElementById('serviceRevenue').innerText = formatVND(advData.totalServiceRevenue);
    document.getElementById('productRevenue').innerText = formatVND(advData.totalProductRevenue);
    document.getElementById('visitCount').innerText = advData.totalVisits || 0;
}

// Vẽ biểu đồ doanh thu
function renderRevenueChart(data, type, branch) {
    const ctx = document.getElementById('revenueChart').getContext('2d');
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
    const ctx = document.getElementById('doctorChart').getContext('2d');
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
            indexAxis: 'y', // Chuyển thành biểu đồ ngang cho dễ đọc tên bác sĩ
            responsive: true, 
            maintainAspectRatio: false 
        }
    });
}

// Khởi chạy khi tải trang
document.addEventListener('DOMContentLoaded', () => {
    window.toggleTimeInput(); // Set mặc định
});