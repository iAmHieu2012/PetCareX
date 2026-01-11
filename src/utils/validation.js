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

// Kiểm tra và chuyển đổi định dạng thời gian (HH:mm hoặc HH:mm:ss)
const validateAndConvertTime = (timeString) => {
    if (!timeString) {
        return null;
    }

    // Kiểm tra định dạng HH:mm hoặc HH:mm:ss
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    
    if (!timeRegex.test(timeString)) {
        return {
            isValid: false,
            message: `Định dạng thời gian không hợp lệ. Vui lòng sử dụng định dạng HH:mm`
        };
    }

    // Nếu chỉ có HH:mm, thêm :00
    let normalizedTime = timeString;
    if (timeString.split(':').length === 2) {
        normalizedTime = timeString + ':00';
    }

    // Trả về thời gian đã chuẩn hóa dưới dạng Date để SQL Server có thể xử lý
    const timeParts = normalizedTime.split(':');
    const date = new Date();
    date.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), parseInt(timeParts[2]), 0);

    return {
        isValid: true,
        value: date // SQL mssql sẽ tự convert Date object sang TIME
    };
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
    validateQueryParams,
    validateAndConvertTime
};
