export const api = {
    getBranches: () => fetch('/api/branches').then(res => res.json()),
    getServices: () => fetch('/api/branches/services').then(res => res.json()),
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
    getPetDetails: (maThuCung) => fetch(`/api/branches/pets/${maThuCung}`).then(res => res.json()),
    // Customer APIs
    getCustomerInfo: (maKhachHang) => fetch(`/api/customer/info/${maKhachHang}`).then(res => res.json()),
    getCustomerPets: (maKhachHang) => fetch(`/api/customer/pets/${maKhachHang}`).then(res => res.json()),
    getPetDetail: (maThuCung) => fetch(`/api/customer/pets/detail/${maThuCung}`).then(res => res.json()),
    getCustomerBookings: (maKhachHang) => fetch(`/api/customer/bookings/${maKhachHang}`).then(res => res.json())
};