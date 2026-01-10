// Trim tất cả properties của object
const trimObject = (obj) => {
    const trimmed = {};
    for (let key in obj) {
        if (typeof obj[key] === 'string') {
            trimmed[key] = obj[key].trim();
        } else {
            trimmed[key] = obj[key];
        }
    }
    return trimmed;
};

// Kiểm tra xem string có trống hay không
const isEmpty = (str) => {
    return !str || str.trim() === '';
};

// Lấy giá trị hoặc default
const getOrDefault = (value, defaultValue = null) => {
    return value !== null && value !== undefined ? value : defaultValue;
};

// Convert string thành number an toàn
const toNumber = (value, defaultValue = 0) => {
    const num = parseInt(value);
    return isNaN(num) ? defaultValue : num;
};

// Convert boolean string thành boolean
const toBoolean = (value) => {
    if (typeof value === 'boolean') return value;
    return value === 'true' || value === '1' || value === true;
};

// Pad string bên trái với ký tự
const padLeft = (str, length, char = '0') => {
    return String(str).padStart(length, char);
};

// Pad string bên phải với ký tự
const padRight = (str, length, char = '0') => {
    return String(str).padEnd(length, char);
};

// Capitalize chữ cái đầu
const capitalize = (str) => {
    if (isEmpty(str)) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

// Viết hoa toàn bộ từ
const uppercase = (str) => {
    return str ? str.toUpperCase() : '';
};

// Viết thường toàn bộ
const lowercase = (str) => {
    return str ? str.toLowerCase() : '';
};

module.exports = {
    trimObject,
    isEmpty,
    getOrDefault,
    toNumber,
    toBoolean,
    padLeft,
    padRight,
    capitalize,
    uppercase,
    lowercase
};
