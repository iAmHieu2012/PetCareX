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
    updateGreeting();
    setupMainTabs();
    
    // Load initial data
    await loadUnconfirmedInvoices();
    await loadMyConfirmedInvoices();

    document.getElementById('logoutBtn').onclick = () => {
        localStorage.clear();
        window.location.href = '/login.html';
    };
});

// Update greeting message based on time
function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Chào buổi sáng';
    if (hour >= 11 && hour < 13) greeting = 'Chào trưa';
    else if (hour >= 13 && hour < 17) greeting = 'Chào chiều';
    else if (hour >= 17) greeting = 'Chào tối';
    
    const userName = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).name : 'Nhân viên';
    document.getElementById('greeting-message').textContent = `${greeting}, ${userName}!`;
}

function setupMainTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.onclick = async () => {
            document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(el => el.classList.remove('active'));
            btn.classList.add('active');
            const tabPane = document.getElementById(`${btn.dataset.tab}-tab`);
            if (tabPane) tabPane.classList.add('active');
            
            // Load my invoices khi click tab
            if (btn.dataset.tab === 'my-invoices') {
                await loadMyConfirmedInvoices();
            }
            
            // Load warehouse khi click tab
            if (btn.dataset.tab === 'warehouse') {
                await loadWarehouseProducts();
                await loadProductsForSelect();
            }
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
        console.log('Loading unconfirmed invoices...');
        const res = await api.getAllPendingConfirmationInvoices();
        console.log('API Response:', res);
        
        // FILTER: Chỉ lấy PHIEU_MUA_HANG (bán hàng)
        let allInvoices = res.data || [];
        
        // Lọc theo loại phiếu dịch vụ - chỉ lấy bán hàng (retail)
        const retailInvoices = allInvoices.filter(inv => inv.LoaiPhieu === 'retail');
        
        state.unconfirmedInvoices = retailInvoices;
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
                        <div class="booking-info-value">${new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">SĐT</div>
                        <div class="booking-info-value">${invoice.SoDienThoai || 'N/A'}</div>
                    </div>
                    <div class="booking-info-item">
                        <div class="booking-info-label">Tổng Tiền</div>
                        <div class="booking-info-value" style="color: #ef4444; font-weight: bold;">₫${parseInt(invoice.TongTienThanhToan).toLocaleString('vi-VN')}</div>
                    </div>
                </div>

                <div style="margin-top: 1rem; background: #f9fafb; padding: 1rem; border-radius: 8px;">
                    <p style="font-weight: 600; margin-bottom: 0.5rem; font-size: 0.9rem;"><i class="fas fa-list"></i> Thông tin dịch vụ:</p>
                    <div style="font-size: 0.9rem;">
                        <strong>${invoice.TongTien}</strong> VNĐ
                        <p style="color: #666; font-size: 0.85rem;">Phương thức: ${invoice.HinhThucThanhToan || 'Tiền mặt'}</p>
                    </div>
                </div>

                <div class="booking-actions" style="margin-top: 1rem; display: flex; gap: 10px;">
                    <button class="btn-primary" onclick="window.handleConfirmPayment('${invoice.MaHoaDon}', '${invoice.NgayLap.split('T')[0]}')" style="flex: 1;">
                        <i class="fas fa-check"></i> Xác Nhận Thanh Toán
                    </button>
                </div>
            </div>
        `).join('');
        
        console.log('Rendering HTML, length:', html.length);
        container.innerHTML = html;
        document.getElementById('pendingCount').textContent = state.unconfirmedInvoices.length;
    } catch (err) {
        console.error('Error loading unconfirmed invoices:', err);
        container.innerHTML = `<p style="color:red;">Lỗi tải dữ liệu: ${err.message}</p>`;
    }
}

async function loadConfirmedInvoices() {
    const container = document.getElementById('confirmedInvoicesList');
    if (!container) return; // Nếu không có element thì bỏ qua
    try {
        const res = await api.getInvoicesByBranch(state.maChiNhanh);
        // Lọc chỉ lấy những hóa đơn đã xác nhận (MaNhanVien IS NOT NULL) và chỉ PHIEU_MUA_HANG
        state.confirmedInvoices = (res.data || []).filter(inv => inv.MaNhanVien);
        
        document.getElementById('confirmedCount').textContent = state.confirmedInvoices.length;

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
                        <p><strong>Ngày bán:</strong> ${new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}</p>
                        <p><strong>Phương thức:</strong> ${invoice.HinhThucThanhToan || 'N/A'}</p>
                        <p><strong>Thành tiền:</strong> <span style="color: #10b981; font-weight: 600;">₫${parseInt(invoice.tongTien).toLocaleString('vi-VN')}</span></p>
                    </div>
                    <span class="status-badge confirmed">
                        <i class="fas fa-check-circle"></i> Đã xác nhận
                    </span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading confirmed invoices:', err);
        container.innerHTML = '<p style="color:red;">Lỗi tải dữ liệu</p>';
    }
}

// Load danh sách hóa đơn mà nhân viên hiện tại đã xác nhận
async function loadMyConfirmedInvoices() {
    const container = document.getElementById('myConfirmedInvoicesList');
    if (!container) return;
    
    try {
        if (!state.maNhanVien) {
            container.innerHTML = '<p style="color:red;">Lỗi: Không tìm thấy mã nhân viên</p>';
            return;
        }

        const res = await api.getConfirmedInvoicesByStaff(state.maNhanVien);
        // FILTER: Chỉ lấy PHIEU_MUA_HANG
        let invoices = res.data || [];
        
        if (invoices.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Bạn chưa xác nhận hóa đơn nào</p>
                </div>
            `;
            return;
        }

        container.innerHTML = invoices.map(invoice => `
            <div class="invoice-card">
                <div class="invoice-header">
                    <div class="invoice-info">
                        <h3><i class="fas fa-receipt"></i> ${invoice.MaHoaDon}</h3>
                        <p><strong>Khách hàng:</strong> ${invoice.TenKhachHang} (${invoice.MaKhachHang})</p>
                        <p><strong>Ngày xác nhận:</strong> ${new Date(invoice.NgayLap).toLocaleDateString('vi-VN')}</p>
                        <p><strong>SĐT:</strong> ${invoice.SoDienThoai}</p>
                        <p><strong>CCCD:</strong> ${invoice.CCCD}</p>
                        <p><strong>Chi nhánh:</strong> ${invoice.TenChiNhanh}</p>
                        <p><strong>Thành tiền:</strong> <span style="color: #10b981; font-weight: 600;">₫${parseInt(invoice.TongTienThanhToan).toLocaleString('vi-VN')}</span></p>
                        <p><strong>Phương thức:</strong> ${invoice.HinhThucThanhToan}</p>
                    </div>
                    <span class="status-badge confirmed">
                        <i class="fas fa-check-circle"></i> Đã xác nhận
                    </span>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error('Error loading my confirmed invoices:', err);
        container.innerHTML = '<p style="color:red;">Lỗi tải dữ liệu: ' + err.message + '</p>';
    }
}

// ==================== KHO HÀNG ====================
async function loadWarehouseProducts() {
    const container = document.getElementById('warehouseProductList');
    if (!container) {
        console.error('Warehouse product container not found!');
        return;
    }
    
    try {
        console.log('Loading warehouse products for branch:', state.maChiNhanh);
        
        // Fetch products in warehouse
        const res = await api.getWarehouseByBranch(state.maChiNhanh);
        console.log('Warehouse API Response:', res);
        
        const products = res.data || [];

        if (products.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Không có sản phẩm trong kho</p>
                </div>
            `;
            return;
        }

        // Render as table
        const html = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb;">
                        <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Tên Sản Phẩm</th>
                        <th style="padding: 0.75rem; text-align: left; font-weight: 600;">Loại</th>
                        <th style="padding: 0.75rem; text-align: center; font-weight: 600;">Số Lượng</th>
                        <th style="padding: 0.75rem; text-align: right; font-weight: 600;">Giá Bán</th>
                        <th style="padding: 0.75rem; text-align: center; font-weight: 600;">Thao Tác</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(product => {
                        let stockStatus = '';
                        let stockClass = '';

                        if (product.SoLuong === 0) {
                            stockStatus = 'Hết hàng';
                            stockClass = 'stock-out';
                        } else if (product.SoLuong <= 5) {
                            stockStatus = 'Sắp hết';
                            stockClass = 'stock-low';
                        } else {
                            stockStatus = 'Còn hàng';
                            stockClass = 'stock-good';
                        }

                        return `
                            <tr style="border-bottom: 1px solid #e5e7eb; hover: background: #f9fafb;">
                                <td style="padding: 0.75rem; color: #1f2937; font-weight: 500;">${product.TenSanPham}</td>
                                <td style="padding: 0.75rem; color: #6b7280;">${product.LoaiSanPham || 'N/A'}</td>
                                <td style="padding: 0.75rem; text-align: center;">
                                    <span class="status-badge ${stockClass}">${product.SoLuong}</span>
                                </td>
                                <td style="padding: 0.75rem; text-align: right; color: #ef4444; font-weight: 600;">₫${parseInt(product.Gia || 0).toLocaleString('vi-VN')}</td>
                                <td style="padding: 0.75rem; text-align: center;">
                                    <button class="btn-sm" onclick="viewProductBatches('${product.MaSanPham}', '${product.TenSanPham}')" style="background: #3b82f6; color: white; border: none; padding: 0.4rem 0.8rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem;">
                                        <i class="fas fa-eye"></i> Xem Lô
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    } catch (err) {
        console.error('Error loading warehouse products:', err);
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Lỗi tải dữ liệu: ${err.message}</p>
            </div>
        `;
    }
}

async function viewProductBatches(maSanPham, tenSanPham) {
    const modal = document.getElementById('batchDetailsModal');
    const content = document.getElementById('batchDetailsContent');
    const title = document.getElementById('batchModalTitle');
    
    title.textContent = `Chi Tiết Lô Hàng - ${tenSanPham}`;
    content.innerHTML = '<p>Đang tải...</p>';
    modal.style.display = 'flex';
    
    try {
        const res = await api.getWarehouseBatchesByBranch(state.maChiNhanh);
        const batches = (res.data || []).filter(b => b.MaLo === maSanPham);
        
        if (batches.length === 0) {
            content.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <p>Không có lô hàng cho sản phẩm này</p>
                </div>
            `;
            return;
        }
        
        const html = `
            <div style="display: grid; gap: 1rem;">
                ${batches.map(batch => {
                    const expiryDate = batch.NgayHetHan ? new Date(batch.NgayHetHan) : null;
                    const today = new Date();
                    let expiryStatus = 'Không có HSD';
                    let expiryClass = 'valid';
                    
                    if (expiryDate) {
                        const daysLeft = Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
                        if (daysLeft < 0) {
                            expiryStatus = 'Đã hết hạn';
                            expiryClass = 'expired';
                        } else if (daysLeft <= 30) {
                            expiryStatus = `Còn ${daysLeft} ngày`;
                            expiryClass = 'expiring-soon';
                        } else {
                            expiryStatus = `Còn ${daysLeft} ngày`;
                            expiryClass = 'valid';
                        }
                    }
                    
                    return `
                        <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; background: white;">
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1rem; margin-bottom: 0.5rem;">
                                <div>
                                    <p style="margin: 0.3rem 0; font-size: 0.9rem;"><strong>Ngày SX:</strong> ${new Date(batch.NgayNhap).toLocaleDateString('vi-VN')}</p>
                                    <p style="margin: 0.3rem 0; font-size: 0.9rem;"><strong>HSD:</strong> ${expiryDate ? expiryDate.toLocaleDateString('vi-VN') : 'Không xác định'}</p>
                                </div>
                                <div style="text-align: right;">
                                    <p style="margin: 0.3rem 0; font-size: 1.1rem; font-weight: 600; color: #10b981;">${batch.SoLuong}</p>
                                    <span class="expiry-badge ${expiryClass}" style="font-size: 0.8rem;">${expiryStatus}</span>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
        
        content.innerHTML = html;
    } catch (err) {
        console.error('Error loading batches:', err);
        content.innerHTML = `<p style="color: red;">Lỗi tải dữ liệu: ${err.message}</p>`;
    }
}

// ==================== XÁC NHẬN THANH TOÁN ====================
async function handleConfirmPayment(maHoaDon, ngayLap) {
    console.log('📝 Confirming payment:', { maHoaDon, ngayLap });
    
    if (!state.maNhanVien) {
        alert('Lỗi: Không tìm thấy mã nhân viên');
        return;
    }

    // Tìm hóa đơn từ danh sách
    const invoice = state.unconfirmedInvoices.find(inv => inv.MaHoaDon === maHoaDon);
    
    if (!invoice) {
        alert('Lỗi: Không tìm thấy hóa đơn');
        return;
    }

    if (confirm(`Xác nhận thanh toán hóa đơn ${maHoaDon}?`)) {
        try {
            const res = await api.confirmPayment({
                maHoaDon: maHoaDon,
                ngayLap: ngayLap,
                maNhanVien: state.maNhanVien,
                hinhThucThanhToan: invoice.HinhThucThanhToan || 'Tiền mặt'
            });

            if (res.success) {
                alert('✓ Xác nhận thanh toán thành công!');
                await loadUnconfirmedInvoices();
                await loadMyConfirmedInvoices();
            } else {
                alert('Lỗi: ' + (res.message || 'Không xác nhận được'));
            }
        } catch (err) {
            alert('Lỗi hệ thống: ' + err.message);
        }
    }
}

// ==================== EXPORT HÀM CHO GLOBAL SCOPE ====================
window.handleConfirmPayment = handleConfirmPayment;
window.openAddProductModal = openAddProductModal;
window.closeAddProductModal = closeAddProductModal;
window.handleAddProduct = handleAddProduct;
window.openImportBatchModal = openImportBatchModal;
window.closeImportBatchModal = closeImportBatchModal;
window.handleImportBatch = handleImportBatch;
window.viewProductBatches = viewProductBatches;
window.closeBatchDetailsModal = closeBatchDetailsModal;

// ==================== MODAL THÊM SẢN PHẨM ====================
function openAddProductModal() {
    document.getElementById('addProductModal').style.display = 'flex';
}

function closeAddProductModal() {
    document.getElementById('addProductModal').style.display = 'none';
    document.getElementById('addProductForm').reset();
}

async function handleAddProduct(event) {
    event.preventDefault();
    
    const tenSanPham = document.getElementById('productName').value;
    const loaiSanPham = document.getElementById('productType').value;
    const giaBan = parseFloat(document.getElementById('productPrice').value);
    
    if (!tenSanPham || !loaiSanPham || !giaBan) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
    }
    
    try {
        const res = await fetch('/api/retail/add-product', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                tenSanPham,
                loaiSanPham,
                giaBan
            })
        }).then(r => r.json());
        
        if (res.success) {
            alert('✓ Thêm sản phẩm thành công!');
            closeAddProductModal();
            await loadWarehouseProducts();
            await loadProductsForSelect();
        } else {
            alert('Lỗi: ' + (res.message || 'Không thêm được'));
        }
    } catch (err) {
        alert('Lỗi hệ thống: ' + err.message);
    }
}

// ==================== MODAL NHẬP LÔ HÀNG ====================
async function loadProductsForSelect() {
    const select = document.getElementById('batchProductId');
    try {
        const res = await api.getWarehouseByBranch(state.maChiNhanh);
        const products = res.data || [];
        
        select.innerHTML = '<option value="">-- Chọn sản phẩm --</option>' + 
            products.map(p => `<option value="${p.MaSanPham}">${p.TenSanPham}</option>`).join('');
    } catch (err) {
        console.error('Error loading products for select:', err);
    }
}

function openImportBatchModal() {
    document.getElementById('importBatchModal').style.display = 'flex';
    loadProductsForSelect();
}

function closeImportBatchModal() {
    document.getElementById('importBatchModal').style.display = 'none';
    document.getElementById('importBatchForm').reset();
}

async function handleImportBatch(event) {
    event.preventDefault();
    
    const maSanPham = document.getElementById('batchProductId').value;
    const ngaySanXuat = document.getElementById('batchProduceDate').value;
    const hanSuDung = document.getElementById('batchExpireDate').value || null;
    const soLuong = parseInt(document.getElementById('batchQuantity').value);
    
    if (!maSanPham || !ngaySanXuat || !soLuong) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
    }
    
    try {
        const res = await fetch('/api/retail/import-batch', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                maSanPham,
                maChiNhanh: state.maChiNhanh,
                ngaySanXuat,
                hanSuDung,
                soLuong
            })
        }).then(r => r.json());
        
        if (res.success) {
            alert('✓ Nhập lô hàng thành công!');
            closeImportBatchModal();
            await loadWarehouseProducts();
        } else {
            alert('Lỗi: ' + (res.message || 'Không nhập được'));
        }
    } catch (err) {
        alert('Lỗi hệ thống: ' + err.message);
    }
}

function closeBatchDetailsModal() {
    document.getElementById('batchDetailsModal').style.display = 'none';
}

// ==================== MODAL STYLING ====================
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

    .btn-sm {
        padding: 0.4rem 0.8rem;
        border-radius: 4px;
        border: none;
        cursor: pointer;
        font-size: 0.85rem;
        transition: all 0.2s;
    }

    .btn-sm:hover {
        opacity: 0.9;
        transform: scale(1.02);
    }

    .btn-secondary {
        background: #6b7280;
        color: white;
        border: none;
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        cursor: pointer;
        font-weight: 500;
        transition: all 0.2s;
    }

    .btn-secondary:hover {
        background: #4b5563;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }

    .form-group label {
        font-weight: 600;
        color: #1f2937;
        font-size: 0.9rem;
    }
`;
document.head.appendChild(style);

