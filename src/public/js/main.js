import { api } from './api.js';

let sliders = {}; // Quản lý trạng thái từng slider

document.addEventListener('DOMContentLoaded', () => {
    const statusBadge = document.getElementById('status-badge');
    fetch('/')
        .then(response => {
            if (response.ok) {
                statusBadge.textContent = 'Đã kết nối tới Server thành công!';
                statusBadge.style.background = '#27ae60';
                renderContent();
            }
        })
        .catch(err => {
            statusBadge.textContent = 'Không thể kết nối tới Server';
            statusBadge.style.background = '#c0392b';
        });
});

async function renderContent() {
    try {
        const [branches, services] = await Promise.all([
            api.getBranches(),
            api.getServices()
        ]);

        const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit', minute: '2-digit', hour12: false
        });

        // 1. Đổ dữ liệu Chi nhánh
        const branchGrid = document.getElementById('branches-grid');
        const branchHTML = branches.map(bn => `
            <div class="branch-card">
                <h4>${bn.TenChiNhanh}</h4>
                <p><i class="fas fa-map-marker-alt"></i> ${bn.DiaChi}</p>
                <p><i class="fas fa-phone"></i> ${bn.DienThoai}</p>
                <p><i class="fas fa-clock"></i> ${timeFormatter.format(new Date(bn.GioMoCua))} - ${timeFormatter.format(new Date(bn.GioDongCua))}</p>
            </div>
        `).join('');
        
        // 2. Đổ dữ liệu Dịch vụ
        const serviceGrid = document.getElementById('services-grid');
        const icons = ['fa-stethoscope', 'fa-syringe', 'fa-cut', 'fa-bath', 'fa-tooth', 'fa-wave-square', 'fa-vials', 'fa-heartbeat'];
        const serviceHTML = services.map((sv, i) => `
            <div class="service-card">
                <i class="fas ${icons[i] || 'fa-paw'}"></i>
                <h3>${sv.TenDichVu}</h3>
                <p>${sv.MoTa}</p>
            </div>
        `).join('');

        // 3. Thiết lập chế độ "Bàn tròn" cho cả 2
        initInfiniteSlider('branches-grid', branchHTML, branches.length);
        initInfiniteSlider('services-grid', serviceHTML, services.length);

    } catch (err) {
        console.error("Lỗi đổ dữ liệu database:", err);
    }
}

// Hàm khởi tạo Slider vô tận
function initInfiniteSlider(id, htmlContent, count) {
    const track = document.getElementById(id);
    // Mẹo: Nhân bản nội dung (Bộ 1 - Bộ thật - Bộ 2)
    track.innerHTML = htmlContent + htmlContent + htmlContent;

    const firstCard = track.querySelector('div');
    const cardWidth = firstCard.offsetWidth + 20; // 20 là gap

    // Đưa slider về bộ ở giữa để bắt đầu
    let currentIndex = count; 
    track.style.transform = `translateX(${-currentIndex * cardWidth}px)`;

    sliders[id] = {
        index: currentIndex,
        width: cardWidth,
        total: count,
        moving: false
    };

    // Hàm di chuyển (Gắn vào Window để nút bấm gọi được)
    window.moveSlide = function(sliderId, direction) {
        const s = sliders[sliderId];
        if (s.moving) return; // Đang chạy thì đéo cho bấm tiếp

        const targetTrack = document.getElementById(sliderId);
        s.moving = true;
        s.index += direction;

        // Thêm hiệu ứng trượt mượt mà
        targetTrack.style.transition = "transform 0.5s cubic-bezier(0.25, 0.8, 0.25, 1)";
        targetTrack.style.transform = `translateX(${-s.index * s.width}px)`;

        // Xử lý khi trượt xong (Bàn tròn)
        targetTrack.addEventListener('transitionend', () => {
            s.moving = false;

            // Nếu trượt tới cuối bộ clone 2 -> Nhảy lén về bộ thật ở giữa
            if (s.index >= s.total * 2) {
                s.index = s.total;
                targetTrack.style.transition = "none";
                targetTrack.style.transform = `translateX(${-s.index * s.width}px)`;
            }
            // Nếu trượt ngược về bộ clone 1 -> Nhảy lén về bộ thật ở giữa
            if (s.index < s.total) {
                if (s.index <= 0 || direction === -1) {
                    s.index = s.total + (s.index % s.total);
                    // Nếu là 0 thì về cuối bộ thật
                    if(s.index === s.total) s.index = s.total * 2 - 1; 
                    
                    targetTrack.style.transition = "none";
                    targetTrack.style.transform = `translateX(${-s.index * s.width}px)`;
                }
            }
        }, { once: true });
    };
}