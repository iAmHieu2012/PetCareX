export const api = {
    getBranches: () => fetch('/api/branches').then(res => res.json()),
    getServices: () => fetch('/api/branches/services').then(res => res.json()),
    getDoctorsByBranch: (maChiNhanh) => fetch(`/api/branches/staff/doctors/${maChiNhanh}`).then(res => res.json()),
    getStaffCount: () => fetch('/api/branches/staff/count').then(res => res.json()),
    getCustomersCount: () => fetch('/api/branches/customers/count').then(res => res.json()),
    getAllStaff: (maNV = null) => {
        const url = maNV ? `/api/branches/staff?maNV=${maNV}` : '/api/branches/staff';
        return fetch(url).then(res => res.json());
    },
    getTransferHistory: (maNV) => fetch(`/api/branches/staff/${maNV}/transfers`).then(res => res.json()),
    getEmployeeIncome: (maNV, thang, nam) => fetch(`/api/branches/staff/${maNV}/income?thang=${thang}&nam=${nam}`).then(res => res.json()),
    getEmployeePerformance: (maNV, thang, nam) => fetch(`/api/branches/staff/${maNV}/performance?thang=${thang}&nam=${nam}`).then(res => res.json()),
    getAllEmployeesPerformance: (thang, nam, maNV = null) => {
        const url = maNV 
            ? `/api/branches/staff/performance/all?thang=${thang}&nam=${nam}&maNV=${maNV}`
            : `/api/branches/staff/performance/all?thang=${thang}&nam=${nam}`;
        return fetch(url).then(res => res.json());
    },
    // Booking APIs
    createBooking: (data) => fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    createBookingStaff: (data) => fetch('/api/bookings/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    confirmBooking: (maLichHen, maChiNhanh, maKhachHang) => fetch('/api/bookings/confirm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maLichHen, maChiNhanh, maKhachHang })
    }).then(res => res.json()),
    cancelBooking: (maLichHen, maChiNhanh) => fetch('/api/bookings/cancel', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ maLichHen, maChiNhanh })
    }).then(res => res.json()),
    getBookingsByBranch: (maChiNhanh) => fetch(`/api/bookings/branch/${maChiNhanh}`).then(res => res.json()),
    // Customer APIs
    getCustomerInfo: (maKhachHang) => fetch(`/api/customer/info/${maKhachHang}`).then(res => res.json()),
    getCustomerPets: (maKhachHang) => fetch(`/api/customer/pets/${maKhachHang}`).then(res => res.json()),
    getCustomerBookings: (maKhachHang) => fetch(`/api/bookings/customer/${maKhachHang}`).then(res => res.json()),
    searchCustomer: (query) => fetch(`/api/customer/search?q=${encodeURIComponent(query)}`).then(res => res.json()),
    getPetsByCustomer: (maKhachHang) => fetch(`/api/customer/pets/${maKhachHang}`).then(res => res.json()),
    // Pet APIs (NEW)
    getPetDetail: (maThuCung) => fetch(`/api/pets/detail/${maThuCung}`).then(res => res.json()),
    getPetMedicalHistory: (maThuCung) => fetch(`/api/pets/history/${maThuCung}`).then(res => res.json()),
    addPet: (data) => fetch('/api/pets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    // Medical Form APIs (NEW)
    confirmAndCreateMedicalForm: (data) => fetch('/api/medical-forms/confirm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    // Vaccination APIs (NEW)
    confirmAndCreateVaccinationForm: (data) => fetch('/api/vaccinations/confirm', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    // Product APIs
    getProducts: (type = '') => {
        const url = type && type !== 'all' ? `/api/products?type=${encodeURIComponent(type)}` : '/api/products';
        return fetch(url).then(res => res.json());
    },
    getProductsByBranch: (branchId, type = '') => {
        const url = type && type !== 'all' 
            ? `/api/products/by-branch/${branchId}?type=${encodeURIComponent(type)}` 
            : `/api/products/by-branch/${branchId}`;
        return fetch(url).then(res => res.json());
    },
    // Report APIs
    getRevenueReport: (branchId, type, value, year) => {
        return fetch(`/api/reports/revenue?branchId=${branchId}&type=${type}&value=${value}&year=${year}`)
            .then(res => res.json());
    },
    getAdvancedReport: (branchId, value, year, type) => {
        return fetch(`/api/reports/advanced?branchId=${branchId}&value=${value}&year=${year}&type=${type}`)
            .then(res => res.json());
    },
    // Retail APIs
    checkout: (orderData) => {
        return fetch('/api/retail/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        }).then(res => res.json());
    },
    // Invoice APIs
    getAllPendingConfirmationInvoices: () => fetch('/api/invoices/pending-confirmation').then(res => res.json()),
    getConfirmedInvoicesByStaff: (maNhanVien) => fetch(`/api/invoices/confirmed/${maNhanVien}`).then(res => res.json()),
    confirmPayment: (data) => fetch('/api/invoices/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(res => res.json()),
    getInvoicesByBranch: (maChiNhanh) => fetch(`/api/invoices/by-branch/${maChiNhanh}`).then(res => res.json())
};