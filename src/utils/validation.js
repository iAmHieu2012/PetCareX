// Kiểm tra xem field bắt buộc có tồn tại
const validateRequired = (fields, data) => {
    for (let field of fields) {
        if (!data[field]) {
            return {
                isValid: false,
                message: `${field} là bắt buộc`
            };
        }
    }
    return { isValid: true };
};

// Kiểm tra xem ID có hợp lệ không
const validateId = (id) => {
    return id && id.trim() !== '';
};

// Kiểm tra email
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Kiểm tra số điện thoại Việt Nam
const validatePhone = (phone) => {
    const phoneRegex = /^(0|84)(\d{9,10})$/;
    return phoneRegex.test(phone);
};

// Kiểm tra CCCD (12 hoặc 9 chữ số)
const validateCCCD = (cccd) => {
    const cccdRegex = /^\d{9}$|^\d{12}$/;
    return cccdRegex.test(cccd);
};

// Kiểm tra ngày tháng năm hợp lệ
const validateDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
};

// Kiểm tra năm hợp lệ
const validateYear = (year) => {
    const yearNum = parseInt(year);
    const currentYear = new Date().getFullYear();
    return yearNum > 1900 && yearNum <= currentYear + 5;
};

// Kiểm tra tháng hợp lệ (1-12)
const validateMonth = (month) => {
    const monthNum = parseInt(month);
    return monthNum >= 1 && monthNum <= 12;
};

// Kiểm tra các tham số query bắt buộc
const validateQueryParams = (params, data) => {
    for (let param of params) {
        if (!data[param]) {
            return {
                isValid: false,
                message: `Tham số ${param} là bắt buộc`
            };
        }
    }
    return { isValid: true };
};

module.exports = {
    validateRequired,
    validateId,
    validateEmail,
    validatePhone,
    validateCCCD,
    validateDate,
    validateYear,
    validateMonth,
    validateQueryParams
};
