// Format response thành công
const successResponse = (data, message = 'Thành công') => {
    return {
        success: true,
        message,
        data
    };
};

// Format response lỗi validation
const validationErrorResponse = (message) => {
    return {
        success: false,
        message
    };
};

// Format response lỗi server
const serverErrorResponse = (error) => {
    return {
        success: false,
        message: error.message || 'Lỗi server'
    };
};

// Format response không tìm thấy
const notFoundResponse = (resource) => {
    return {
        success: false,
        message: `${resource} không tìm thấy`
    };
};

// Format response unauthorized
const unauthorizedResponse = () => {
    return {
        success: false,
        message: 'Không có quyền truy cập'
    };
};

// Format response tạo mới thành công
const createdResponse = (data, message = 'Tạo thành công') => {
    return {
        success: true,
        message,
        data
    };
};

module.exports = {
    successResponse,
    validationErrorResponse,
    serverErrorResponse,
    notFoundResponse,
    unauthorizedResponse,
    createdResponse
};
