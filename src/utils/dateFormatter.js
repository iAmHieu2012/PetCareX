// Định dạng ngày thành chuỗi (DD/MM/YYYY)
const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
};

// Định dạng thời gian đầy đủ (DD/MM/YYYY HH:MM)
const formatDateTime = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}`;
};

// Chuyển đổi ngày từ chuỗi input thành Date object
const parseDate = (dateString) => {
    return new Date(dateString);
};

// Lấy ngày hôm nay
const getTodayDate = () => {
    return new Date();
};

// Lấy ngày bắt đầu tháng
const getStartOfMonth = (year, month) => {
    return new Date(year, month - 1, 1);
};

// Lấy ngày kết thúc tháng
const getEndOfMonth = (year, month) => {
    return new Date(year, month, 0);
};

// Tính số ngày giữa 2 ngày
const daysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
};

module.exports = {
    formatDate,
    formatDateTime,
    parseDate,
    getTodayDate,
    getStartOfMonth,
    getEndOfMonth,
    daysBetween
};
