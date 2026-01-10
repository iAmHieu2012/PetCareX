// Xử lý lỗi chung cho controllers
const handleControllerError = (err, res, functionName = '', statusCode = 500) => {
    console.error('❌ Lỗi Controller:', functionName, err.message);
    
    return res.status(statusCode).json({
        success: false,
        message: err.message || 'Lỗi server'
    });
};

// Xử lý lỗi validation
const handleValidationError = (res, message) => {
    return res.status(400).json({
        success: false,
        message
    });
};

// Xử lý lỗi không tìm thấy
const handleNotFound = (res, resource) => {
    return res.status(404).json({
        success: false,
        message: `${resource} không tìm thấy`
    });
};

// Xử lý lỗi truy cập bị từ chối
const handleUnauthorized = (res) => {
    return res.status(403).json({
        success: false,
        message: 'Không có quyền truy cập'
    });
};

// Xử lý lỗi model
const handleModelError = (err, context = '') => {
    console.error(`❌ Lỗi Model${context ? ` (${context})` : ''}:`, err.message);
    throw new Error(err.message);
};

module.exports = {
    handleControllerError,
    handleValidationError,
    handleNotFound,
    handleUnauthorized,
    handleModelError
};
