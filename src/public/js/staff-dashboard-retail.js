import { api } from './api.js';

const state = {
    maChiNhanh: localStorage.getItem('maChiNhanh'),
    maNhanVien: localStorage.getItem('maNhanVien'),
    unconfirmedInvoices: [],
    confirmedInvoices: [],
    warehouseItems: [],
    currentInvoice: null
};

document.addEventListener('DOMContentLoaded', async () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'BanHang') window.location.href = '/login.html';
    
    document.getElementById('userName').textContent = user.name;
    setupMainTabs();
    await loadUnconfirmedInvoices();

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.clear();
        window.location.href = '/login.html';
    };
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

// ==================== XÁC NHẬN THANH TOÁN ====================
async function loadUnconfirmedInvoices() {
    const container = document.getElementById('unconfirmedInvoicesList');
    try {
        const res = await fetch(`/api/retail/unconfirmed/${state.maChiNhanh}`).then(r => r.json());
        state.unconfirmedInvoices = res.data || [];

        if (state.unconfirmedInvoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Không có hóa đơn chưa xác nhận</p>
                </div>
            `;
            return;
        }

        container.innerHTML = state.unconfirmedInvoices.map(invoice => `
            <div class="invoice-card">
                <div class="invoice-header">
                    <div class="invoice-info">
                        <h3><i class="fas fa-receipt"></i> ${invoice.MaHoaDon}</h3>
                        <p><strong>Khách hàng:</strong> ${invoice.TenKhachHang}</p>
                        <p><strong>Ngày bán:</strong> ${new Date(invoice.NgayTao).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Thành tiền:</strong> <span style="color: #ef4444; font-weight: 600;">₫${parseInt(invoice.TongTien).toLocaleString('vi-VN')}</span></p>
                    </div>
                    <span class="status-badge pending">
                        <i class="fas fa-hourglass-half"></i> Chưa xác nhận
                    </span>
                </div>

                <div class="invoice-details">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">Chi tiết sản phẩm:</div>
                    ${(invoice.details || []).map(detail => `
                        <div class="detail-item">
                            <div class="detail-product">
                                <strong>${detail.TenSanPham}</strong>
                                <small>${detail.DonVi}</small>
                            </div>
                            <div class="detail-quantity">
                                <strong>${detail.SoLuong}</strong>
                            </div>
                            <div class="detail-price">
                                ₫${parseInt(detail.GiaBan * detail.SoLuong).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    `).join('')}
                </div>

                <button class="btn-confirm" onclick="window.handleConfirmPayment('${invoice.MaPhieuDichVu}')">
                    <i class="fas fa-check"></i> Xác Nhận
                </button>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading unconfirmed invoices:', err);
        container.innerHTML = '<p style="color:red;">Lỗi tải dữ liệu</p>';
    }
}

async function loadConfirmedInvoices() {
    const container = document.getElementById('confirmedInvoicesList');
    if (!container) return; // Nếu không có element thì bỏ qua
    try {
        const res = await fetch(`/api/retail/confirmed/${state.maChiNhanh}`).then(r => r.json());
        state.confirmedInvoices = res.data || [];

        if (state.confirmedInvoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Không có hóa đơn đã xác nhận</p>
                </div>
            `;
            return;
        }

        container.innerHTML = state.confirmedInvoices.map(invoice => `
            <div class="invoice-card">
                <div class="invoice-header">
                    <div class="invoice-info">
                        <h3><i class="fas fa-receipt"></i> ${invoice.MaHoaDon}</h3>
                        <p><strong>Khách hàng:</strong> ${invoice.TenKhachHang}</p>
                        <p><strong>Ngày bán:</strong> ${new Date(invoice.NgayTao).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Phương thức:</strong> ${invoice.PhuongThucThanhToan || 'N/A'}</p>
                        <p><strong>Thành tiền:</strong> <span style="color: #10b981; font-weight: 600;">₫${parseInt(invoice.TongTien).toLocaleString('vi-VN')}</span></p>
                    </div>
                    <span class="status-badge confirmed">
                        <i class="fas fa-check-circle"></i> Đã xác nhận
                    </span>
                </div>

                <div class="invoice-details">
                    <div style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;">Chi tiết sản phẩm:</div>
                    ${(invoice.details || []).map(detail => `
                        <div class="detail-item">
                            <div class="detail-product">
                                <strong>${detail.TenSanPham}</strong>
                                <small>${detail.DonVi}</small>
                            </div>
                            <div class="detail-quantity">
                                <strong>${detail.SoLuong}</strong>
                            </div>
                            <div class="detail-price">
                                ₫${parseInt(detail.GiaBan * detail.SoLuong).toLocaleString('vi-VN')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading confirmed invoices:', err);
        container.innerHTML = '<p style="color:red;">Lỗi tải dữ liệu</p>';
    }
}

// ==================== KHO HÀNG ====================
async function loadWarehouseInventory() {
    const container = document.getElementById('warehouseList');
    try {
        const res = await fetch(`/api/retail/warehouse/${state.maChiNhanh}`).then(r => r.json());
        state.warehouseItems = res.data || [];

        if (state.warehouseItems.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-inbox"></i>
                    <p>Không có sản phẩm trong kho</p>
                </div>
            `;
            return;
        }

        container.innerHTML = state.warehouseItems.map(item => {
            let stockStatus = '';
            let stockClass = '';

            if (item.SoLuong === 0) {
                stockStatus = 'Hết hàng';
                stockClass = 'stock-out';
            } else if (item.SoLuong <= 5) {
                stockStatus = 'Sắp hết';
                stockClass = 'stock-low';
            } else {
                stockStatus = 'Còn hàng';
                stockClass = 'stock-good';
            }

            return `
                <div class="warehouse-card">
                    <div class="product-name">${item.TenSanPham}</div>
                    <div class="quantity-display">${item.SoLuong}</div>
                    <div class="unit">${item.DonVi}</div>
                    <div class="stock-status ${stockClass}">
                        <i class="fas ${stockClass === 'stock-good' ? 'fa-check-circle' : stockClass === 'stock-low' ? 'fa-exclamation-triangle' : 'fa-times-circle'}"></i>
                        ${stockStatus}
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading warehouse:', err);
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-exclamation-circle"></i>
                <p>Lỗi tải dữ liệu</p>
            </div>
        `;
    }
}

// ==================== MODAL THANH TOÁN ====================
async function handleConfirmPayment(maPhieuDichVu) {
    console.log('📝 handleConfirmPayment called with:', maPhieuDichVu);
    console.log('📊 state.unconfirmedInvoices:', state.unconfirmedInvoices);
    
    if (!state.maNhanVien) {
        alert('Lỗi: Không tìm thấy mã nhân viên');
        return;
    }

    // Tìm hóa đơn từ danh sách
    const invoice = state.unconfirmedInvoices.find(inv => inv.MaPhieuDichVu === maPhieuDichVu);
    console.log('🔍 Found invoice:', invoice);
    
    if (!invoice || !invoice.MaHoaDon) {
        alert('Lỗi: Không tìm thấy mã hóa đơn\nMaPhieuDichVu: ' + maPhieuDichVu);
        return;
    }

    if (confirm('Xác nhận cập nhật hóa đơn này?')) {
        try {
            const res = await fetch('/api/invoices/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maHoaDon: invoice.MaHoaDon,
                    ngayLap: invoice.NgayTao,
                    maNhanVien: state.maNhanVien,
                    hinhThucThanhToan: invoice.HinhThucThanhToan || 'Tiền mặt'
                })
            }).then(r => r.json());

            if (res.success) {
                alert('✓ Xác nhận thành công!');
                await loadUnconfirmedInvoices();
            } else {
                alert('Lỗi: ' + res.message);
            }
        } catch (err) {
            alert('Không thể kết nối đến máy chủ.');
            console.error(err);
        }
    }
}

// Modal styling
const style = document.createElement('style');
style.textContent = `
    .modal {
        display: none;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .modal-content {
        background: white;
        border-radius: 15px;
        padding: 2rem;
        max-width: 600px;
        width: 90%;
        max-height: 90vh;
        overflow-y: auto;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
`;
document.head.appendChild(style);

// ==================== EXPORT HÀM CHO GLOBAL SCOPE ====================
window.handleConfirmPayment = handleConfirmPayment;
