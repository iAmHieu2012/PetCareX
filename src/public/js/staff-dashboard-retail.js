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
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            const tabPane = document.getElementById(`${btn.dataset.tab}-tab`);
            if (tabPane) tabPane.classList.add('active');
        };
    });
}

// ==================== XÁC NHẬN THANH TOÁN ====================
async function loadUnconfirmedInvoices() {
    const container = document.getElementById('unconfirmedInvoicesList');
    if (!container) {
        console.error('Container not found!');
        return;
    }
    
    try {
        console.log('Loading unconfirmed invoices from:', `/api/retail/unconfirmed/${state.maChiNhanh}`);
        const res = await fetch(`/api/retail/unconfirmed/${state.maChiNhanh}`).then(r => r.json());
        console.log('API Response:', res);
        
        state.unconfirmedInvoices = res.data || [];
        console.log('State updated:', state.unconfirmedInvoices);

        if (state.unconfirmedInvoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-check-circle"></i>
                    <p>Không có hóa đơn chưa xác nhận</p>
                </div>
            `;
            return;
        }

        const html = state.unconfirmedInvoices.map(invoice => `
            <div class="booking-card" style="border-left: 5px solid #ff9500;">
                <div class="booking-header">
                    <div class="booking-header-left">
                        <h3 style="color: var(--primary); font-size: 1.1rem;">Mã HĐ: ${invoice.MaHoaDon}</h3>
                        <p style="font-size: 0.85rem; color: #666;">Khách: ${invoice.TenKhachHang}</p>
                    </div>
                    <span class="booking-status status-pending">Chưa Xác Nhận</span>
                </div>
                <div class="booking-body" style="grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
                    <div class="booking-info-item">
                        <div class="booking-info-label">Ngày Bán</div>
                        <div class="booking-info-value">${new Date(invoice.NgayTao).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">SĐT</div>
                        <div class="booking-info-value">${invoice.SoDienThoai || 'N/A'}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Tổng Tiền</div>
                        <div class="booking-info-value" style="color: #ef4444; font-weight: bold;">₫${parseInt(invoice.TongTien).toLocaleString('vi-VN')}</div>
                    </div>
                </div>
                
                <div style="margin-top: 1rem; background: #f9fafb; padding: 1rem; border-radius: 8px;">
                    <p style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;"><i class="fas fa-list"></i> Sản phẩm:</p>
                    ${(invoice.details || []).map(detail => `
                        <div style="display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #e5e7eb; font-size: 0.9rem;">
                            <span><strong>${detail.TenSanPham}</strong> × ${detail.SoLuong}</span>
                            <span style="color: #10b981;">₫${parseInt(detail.GiaBan * detail.SoLuong).toLocaleString('vi-VN')}</span>
                        </div>
                    `).join('')}
                </div>

                <div class="booking-actions" style="margin-top: 1rem; display: flex; gap: 10px;">
                    <button class="btn-primary" onclick="window.handleConfirmPayment('${invoice.MaPhieuDichVu}', '${invoice.MaHoaDon}')" style="flex: 1;">
                        <i class="fas fa-check"></i> Xác Nhận Thanh Toán
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('Rendering HTML, length:', html.length);
        container.innerHTML = html;
    } catch (err) {
        console.error('Error loading unconfirmed invoices:', err);
        container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`;
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
async function handleConfirmPayment(maPhieuDichVu, maHoaDon) {
    console.log('📝 Confirming payment:', { maPhieuDichVu, maHoaDon });
    
    if (!state.maNhanVien) {
        alert('Lỗi: Không tìm thấy mã nhân viên');
        return;
    }

    // Tìm hóa đơn từ danh sách
    const invoice = state.unconfirmedInvoices.find(inv => inv.MaPhieuDichVu === maPhieuDichVu);
    
    if (!invoice) {
        alert('Lỗi: Không tìm thấy hóa đơn');
        return;
    }

    if (confirm(`Xác nhận thanh toán hóa đơn ${maHoaDon || invoice.MaHoaDon}?`)) {
        try {
            const res = await fetch('/api/invoices/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    maHoaDon: maHoaDon || invoice.MaHoaDon,
                    ngayLap: invoice.NgayTao.split('T')[0],
                    maNhanVien: state.maNhanVien,
                    hinhThucThanhToan: invoice.HinhThucThanhToan || 'Tiền mặt'
                })
            }).then(r => r.json());

            if (res.success) {
                alert('✓ Xác nhận thanh toán thành công!');
                await loadUnconfirmedInvoices();
            } else {
                alert('Lỗi: ' + (res.message || 'Không xác nhận được'));
            }
        } catch (err) {
            alert('Lỗi hệ thống: ' + err.message);
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
