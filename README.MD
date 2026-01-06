# 🐾 PetCareX - Pet Shop Management System

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup & Installation](#setup--installation)
5. [Module Details](#module-details)
6. [Development Roadmap](#development-roadmap)
7. [API Documentation](#api-documentation)
8. [Building a Module (Step-by-step)](#building-a-module-step-by-step)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## 🎯 Introduction

PetCareX là một hệ thống quản lý quy mô lớn được thiết kế để vận hành chuỗi 10 trung tâm chăm sóc thú cưng hiện đại tại các thành phố trọng điểm. Mỗi chi nhánh trong hệ thống hoạt động như một tổ hợp dịch vụ khép kín, bao gồm phòng khám thú y chuyên khoa, trung tâm tiêm chủng và cửa hàng bán lẻ cung cấp thức ăn, thuốc và phụ kiện thú cưng. Hệ thống không chỉ quản lý thông tin hành chính của từng chi nhánh như địa chỉ, hotline, giờ đóng/mở cửa mà còn cho phép tùy chỉnh danh mục dịch vụ riêng biệt phù hợp với năng lực của từng cơ sở cụ thể.

Hệ sinh thái PetCareX tập trung vào trải nghiệm khách hàng thông qua chương trình hội viên đa cấp độ, cho phép người nuôi thú cưng đăng ký tài khoản và quản lý hồ sơ sức khỏe chi tiết cho nhiều thú cưng cùng lúc. Mọi hoạt động từ đặt lịch hẹn, quy trình thăm khám bệnh lý, đến việc triển khai các gói tiêm chủng dài hạn (6 tháng, 12 tháng) đều được số hóa hoàn toàn để đảm bảo tính chính xác và kịp thời. Bên cạnh đó, hệ thống tích hợp chặt chẽ quản lý kho vận với bán lẻ, cho phép theo dõi tồn kho thực tế theo từng lô sản xuất và hạn sử dụng tại mỗi chi nhánh.

### 1. Quản lý Hội viên & Thú cưng
* **Đăng ký hội viên:** Lưu trữ thông tin cá nhân khách hàng (Họ tên, SĐT, Email, CCCD, Ngày sinh) và khởi tạo hạng "Cơ bản" mặc định.
* **Quản lý hồ sơ thú cưng:** Tiếp nhận thú cưng mới, ghi nhận đặc điểm (giống, loài, giới tính, tình trạng sức khỏe) và liên kết trực tiếp với chủ sở hữu.
* **Tra cứu Loyalty & Hạng:** Tìm kiếm thông tin qua SĐT/CCCD để kiểm tra điểm tích lũy và thứ hạng hiện tại.
* **Thăng hạng tự động:** Hệ thống tự động xét duyệt hạng Thân thiết (chi tiêu $\ge$ 5 triệu/năm) hoặc VIP (chi tiêu $\ge$ 12 triệu/năm) và tích điểm với tỷ lệ 1 điểm = 50.000 VNĐ.

### 2. Dịch vụ Y tế & Tiêm phòng
* **Quản lý lịch hẹn:** Tiếp nhận đặt lịch (ngày giờ, chi nhánh, dịch vụ) và xác nhận khởi tạo phiếu dịch vụ khi khách đến trung tâm.
* **Khám bệnh & Kê toa:** Ghi nhận triệu chứng, chẩn đoán của bác sĩ, lập toa thuốc điều trị và hẹn ngày tái khám.
* **Tiêm chủng định kỳ:** Triển khai tiêm lẻ hoặc đăng ký gói tiêm 6-12 tháng giúp khách hàng chủ động lộ trình và nhận ưu đãi giảm giá từ 5% đến 15%.
* **Truy xuất lịch sử y tế:** Xem lại toàn bộ bệnh án, đơn thuốc và lịch sử tiêm chủng cũ của từng thú cưng qua hệ thống View hỗ trợ.

### 3. Quản lý Bán lẻ & Kho hàng
* **Danh mục sản phẩm:** Quản lý hàng hóa (thức ăn, thuốc, phụ kiện) với đầy đủ mã sản phẩm, tên, phân loại và giá bán.
* **Quản lý tồn kho & Lô hàng:** Theo dõi số lượng tồn thực tế tại từng chi nhánh, quản lý hàng theo lô sản xuất và lọc danh sách hàng sắp hết hạn.
* **Tiếp nhận đơn mua lẻ:** Xử lý nhanh các đơn bán hàng cho khách lẻ không sử dụng dịch vụ y tế tại trung tâm.

### 4. Thanh toán & Đánh giá
* **Lập hóa đơn:** Tổng hợp danh sách dịch vụ/sản phẩm, tính toán khuyến mãi, cập nhật hình thức thanh toán và doanh thu thực tế.
* **Ghi nhận phản hồi:** Thu thập điểm đánh giá chất lượng dịch vụ, thái độ nhân viên và nội dung bình luận phản hồi từ khách hàng.

### 5. Quản trị Nhân sự & Báo cáo
* **Quản lý nhân sự:** Lưu trữ hồ sơ bác sĩ, nhân viên bán hàng, tiếp tân; quản lý mức lương cơ bản và chức vụ tương ứng.
* **Điều động công tác:** Cập nhật chi nhánh làm việc mới và lưu lại lịch sử luân chuyển nhân sự trong toàn hệ thống.
* **Báo cáo & Thống kê:** Tổng hợp doanh thu chu kỳ (ngày/tháng/quý/năm), thống kê loại dịch vụ/vắc-xin được sử dụng nhiều nhất và hiệu suất nhân viên.

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js (v14+)
- **Framework:** Express.js 5.x
- **Database:** Microsoft SQL Server
- **Package Manager:** NPM

### Frontend
- **HTML5** - Page Structure
- **CSS3** - Styling & Responsive Design
- **Vanilla JavaScript** - Logic & API Integration

### Database
- **DBMS:** Microsoft SQL Server 2019+
- **Database Name:** PETCAREX
- **Port:** 1433 (default)

### Dependencies
```json
{
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "mssql": "^12.2.0"
}
```

### DevDependencies
```json
{
    "nodemon": "^3.1.11"
}
```

---

## 📁 Project Structure

```
PetCareX/
│
├── server.js                 # Entry point - Start server
├── package.json              # Dependencies
├── .env                      # Environment variables
├── README.md                 # This file
├── database/                 # Database configuration
├── src/
│   ├── app.js               # Express app configuration
│   ├── config/
│   │   └── db.js            # Database connection
│   ├── models/              # Database query functions
│   ├── services/            # Business logic
│   ├── controllers/         # Request handlers
│   ├── routes/              # API endpoints
│   ├── middlewares/         # Custom middleware
│   │   ├── errorHandler.js
│   │   └── logger.js
│   ├── utils/               # Helper functions
│   │   ├── dateFormat.js
│   │   ├── validation.js
│   │   └── response.js
│   └── public/              # Frontend files
│       ├── index.html       # Home page
│       ├── css/
│       │   ├── style.css    # Main styles
│       │   └── responsive.css # Mobile responsive
│       ├── js/
│       │   ├── api.js       # API client functions
│       │   ├── main.js      # Main app logic
│       └── assets/          # Images, icons, etc.
│           ├── logo.png
│           ├── icons/
│           └── images/
```

---

## 📌 Setup & Installation

### 1. Prerequisites
- Node.js v14+ installed
- Microsoft SQL Server installed and running
- Database PETCAREX created
- .env file configured

### 2. Environment Variables (.env)
```
# ==========================================
# SERVER CONFIGURATION
# ==========================================
PORT=5000
NODE_ENV=development

# ==========================================
# DATABASE CONFIGURATION (SQL SERVER)
# ==========================================
DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=your-password-here
DB_NAME=PETCAREX
DB_PORT=1433
DB_TRUST_SERVER_CERTIFICATE=true
DB_ENCRYPT=false

# ==========================================
# CORS CONFIGURATION
# ==========================================
# URL of Frontend
CLIENT_URL=http://localhost:3000
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Create Database
Use Microsoft SQL Server Management Studio to execute all files in database folder
- 01_init_db.sql
- 02_tables.sql
- 03_indexes.sql
- 04_views.sql
- 05_functions.sql
- 06_procedures.sql
- 07_triggers.sql
- 08_values.sql

### 5. Start Development Server
```bash
npm run dev
```

Expected output:
```
Đã kết nối thành công tới SQL Server: PETCAREX
-----------------------------------------
Server đang chạy tại: http://localhost:5000
-----------------------------------------
```

---

## 📦 Module Details

### Tổng quan hệ thống theo yêu cầu
- Hệ thống PetCareX gồm 10 chi nhánh tại các thành phố lớn.
- Mỗi chi nhánh cung cấp: khám bệnh, tiêm phòng, và cửa hàng bán thức ăn/phụ kiện.
- Mỗi chi nhánh có: tên, địa chỉ, số điện thoại, thời gian mở/đóng, danh sách dịch vụ có cung cấp (chi nhánh có thể khác nhau về dịch vụ).
- Khách hàng là người nuôi thú cưng; có thể đăng ký làm hội viên với thông tin: họ tên, số điện thoại, email, CCCD, giới tính, ngày sinh.
- Một khách hàng có thể sở hữu nhiều thú cưng; mỗi thú cưng có mã, tên, loài, giống, ngày sinh, giới tính, tình trạng sức khỏe.
- Dịch vụ chính:
  - Khám bệnh: lưu bác sĩ phụ trách, triệu chứng, chẩn đoán, toa thuốc, ngày hẹn tái khám.
  - Tiêm phòng: loại vắc-xin, ngày tiêm, liều lượng, bác sĩ; hỗ trợ mũi lẻ và gói tiêm theo tháng (6, 12, ...).
  - Mua hàng: sản phẩm gồm mã, tên, loại (thức ăn, thuốc, phụ kiện), giá bán, số lượng tồn kho.
- Khi khách sử dụng dịch vụ => hệ thống tạo hóa đơn liên kết khách hàng, nhân viên, thú cưng (nếu có), danh sách dịch vụ/sản phẩm, tổng tiền, khuyến mãi, hình thức thanh toán.
- Chương trình hội viên: Cơ bản – Thân thiết - VIP với ngưỡng và quy tắc giữ hạng (xem Business Rules).
- Loyalty: 1 điểm = 50.000 VNĐ, điểm cộng khi thanh toán hóa đơn.
- Hệ thống quản lý nhân sự: bác sĩ thú y, nhân viên bán hàng, nhân viên tiếp tân, quản lý chi nhánh; mỗi nhân viên có mã, họ tên, ngày sinh, giới tính, ngày vào làm, chức vụ, chi nhánh, lương cơ bản; có lịch sử điều động.

---

### Tập trung vào các giao tác (T1–T20)

Dưới đây liệt kê chi tiết 20 giao tác trọng tâm (mô tả, endpoints gợi ý, bảng DB chính liên quan, hành động):

T1: Đăng ký hội viên mới
- Mục tiêu: Lưu thông tin cá nhân khách hàng và khởi tạo hạng "Cơ bản".
- Endpoint: POST /api/customers
- Payload: { name, phone, email, cccd, gender, dob }
- DB chính: INSERT vào KHACH_HANG; tạo TAI_KHOAN nếu cần; PHAN_LOAI_KHACH_HANG mặc định/năm tính sau.
- Kết quả: MaKhachHang mới, DiemTichLuy=0, hạng="Cơ bản".

T2: Tiếp nhận thú cưng mới
- Mục tiêu: Tạo hồ sơ thú cưng, ghi nhận loài/giống và liên kết với chủ.
- Endpoint: POST /api/pets
- Payload: { ownerId, code, name, species, breed, dob, gender, healthStatus }
- DB chính: INSERT vào THU_CUNG (MaThuCung, TenThuCung, Loai, Giong, NgaySinh, GioiTinh, TinhTrang, MaKhachHang).

T3: Tra cứu hồ sơ khách hàng & Loyalty
- Mục tiêu: Tìm khách hàng theo SĐT/CCCD, kiểm tra điểm tích lũy và hạng.
- Endpoint: GET /api/customers/search?phone=... or ?cccd=...
- DB chính: SELECT từ KHACH_HANG JOIN PHAN_LOAI_KHACH_HANG; tính tổng chi tiêu từ HOA_DON; lấy danh sách thú cưng.

T4: Tra cứu thú cưng và chủ sở hữu
- Mục tiêu: Xem danh sách thú cưng của khách hoặc chủ từ hồ sơ thú cưng.
- Endpoint: GET /api/customers/:customerId/pets; GET /api/pets/:petId
- DB chính: SELECT THU_CUNG JOIN KHACH_HANG.

T5: Đặt lịch hẹn
- Mục tiêu: Ghi nhận lịch hẹn gồm ngày giờ, chi nhánh, dịch vụ, thú cưng.
- Endpoint: POST /api/appointments
- Payload: { appointmentCode, datetime, branchId, serviceCode, petId, customerId }
- DB chính: INSERT LICH_HEN (MaLichHen, ThoiGian, TrangThai='Chờ xác nhận', MaChiNhanh, MaKhachHang, MaThuCung, LoaiLichHen).

T6: Xác nhận lịch hẹn & Khởi tạo phiếu dịch vụ
- Mục tiêu: Khi khách đến, chuyển LICH_HEN thành PHIEU_DICH_VU.
- Endpoint: POST /api/appointments/:id/confirm
- Hành động DB: UPDATE LICH_HEN.TrangThai='Đã xác nhận'; CREATE PHIEU_DICH_VU (MaPhieuDichVu, TongTien=0, MaChiNhanh, MaKhachHang); liên kết dịch vụ/chi tiết sau.

T7: Ghi nhận khám bệnh & Kê toa
- Mục tiêu: Bác sĩ cập nhật triệu chứng, chẩn đoán, hẹn tái khám, kê toa.
- Endpoint: POST /api/service-tickets/:ticketId/medical
- Payload: { doctorId, symptoms, diagnosis, nextVisitDate, prescriptions: [{ drugId, qty }] }
- DB chính: INSERT/UPDATE PHIEU_KHAM_BENH; INSERT CHI_TIET_TOA_THUOC.

T8: Tra cứu lịch sử y tế
- Mục tiêu: Truy xuất toàn bộ bệnh án, đơn thuốc, lịch sử tiêm chủng của thú cưng.
- Endpoint: GET /api/pets/:petId/medical-history
- DB chính: SELECT PHIEU_KHAM_BENH, CHI_TIET_TOA_THUOC, PHIEU_TIEM_PHONG, PHIEU_DANG_KY_GOI_TIEM.

T9: Đăng ký gói tiêm phòng
- Mục tiêu: Khách đăng ký gói (6/12 tháng...) để nhận ưu đãi.
- Endpoint: POST /api/vaccine-packages/:packageId/register
- Payload: { customerId, petId, startDate }
- DB chính: INSERT PHIEU_DANG_KY_GOI_TIEM; áp dụng UuDai của GOI_TIEM khi tạo HOA_DON.

T10: Thực hiện tiêm vắc-xin
- Mục tiêu: Ghi nhận chi tiết mũi tiêm.
- Endpoint: POST /api/vaccinations/perform
- Payload: { serviceTicketId, vaccineId, dosage, date, doctorId, packageId? }
- DB chính: INSERT PHIEU_TIEM_PHONG (MaPhieuDichVu, NgayTiem, MaVacxin, LieuLuong, MaGoiTiem, MaThuCung, MaBacSi); nếu thuộc gói, cập nhật tiến độ gói.

T11: Quản lý danh mục sản phẩm & vắc-xin
- Mục tiêu: Thêm/sửa/xóa/cập nhật giá sản phẩm và vắc-xin.
- Endpoints: CRUD /api/products (SAN_PHAM), /api/vaccines (VACXIN)
- DB chính: INSERT/UPDATE/DELETE SAN_PHAM, VACXIN.

T12: Quản lý tồn kho & Lô hàng
- Mục tiêu: Tra cứu tồn kho thực tế tại chi nhánh, lọc hàng sắp hết hạn theo lô.
- Endpoint: GET /api/inventory?branchId=&productId=
- DB chính: SELECT KHO_HANG JOIN LO_HANG; lọc LO_HANG.HanSuDung gần đến.

T13: Tiếp nhận đơn mua hàng lẻ
- Mục tiêu: Xử lý bán sản phẩm cho khách không dùng dịch vụ y tế.
- Endpoint: POST /api/sales
- Payload: { customerId?, branchId, items: [{productId, qty, price}], employeeId, paymentMethod }
- DB chính: CREATE PHIEU_MUA_HANG; INSERT CHI_TIET_MUA_HANG; cập nhật KHO_HANG (trừ tồn).

T14: Lập hóa đơn và Thanh toán
- Mục tiêu: Tổng hợp dịch vụ/sản phẩm, tính khuyến mãi, tạo hóa đơn, cập nhật doanh thu.
- Endpoint: POST /api/invoices
- Payload: { serviceTicketId?, saleId?, items, discounts, paymentMethod, cashierId }
- DB chính: INSERT HOA_DON; cập nhật DiemTichLuy của KHACH_HANG; cập nhật trạng thái PHIEU_DICH_VU/PHIEU_MUA_HANG.

T15: Thăng hạng thành viên tự động
- Mục tiêu: Hệ thống kiểm tra tổng chi tiêu và cập nhật hạng (job định kỳ).
- Endpoint (job): POST /api/memberships/recalculate (hoặc cron)
- Hành động: SUM HOA_DON theo năm => so sánh ngưỡng => cập nhật PHAN_LOAI_KHACH_HANG / trạng thái hạng.

T16: Ghi nhận đánh giá & Phản hồi
- Mục tiêu: Lưu điểm chất lượng, thái độ và bình luận của khách.
- Endpoint: POST /api/ratings
- Payload: { invoiceId, qualityScore, staffScore, satisfactionScore, comment }
- DB chính: INSERT DANH_GIA; dùng cho KPI & báo cáo.

T17: Quản lý hồ sơ nhân viên
- Mục tiêu: Lưu trữ/cập nhật nhân sự, chức vụ, lương cơ bản.
- Endpoints: CRUD /api/employees
- DB chính: NHAN_VIEN, BANG_LUONG, phân loại bảng (BAC_SI_THU_Y, ...).

T18: Điều động nhân sự
- Mục tiêu: Cập nhật chi nhánh làm việc và lưu lịch sử điều động.
- Endpoint: POST /api/employees/:id/transfer
- Payload: { toBranchId, startDate, endDate? }
- DB chính: UPDATE NHAN_VIEN.MaChiNhanh; INSERT LICH_SU_DIEU_DONG.

T19: Cập nhật bảng lương
- Mục tiêu: Điều chỉnh mức lương cho từng chức danh.
- Endpoint: PUT /api/payroll/positions
- Payload: { position, baseSalary }
- DB chính: UPDATE BANG_LUONG.

T20: Báo cáo doanh thu & Thống kê dịch vụ
- Mục tiêu: Tổng hợp báo cáo doanh thu theo chu kỳ và thống kê dịch vụ/vắc-xin.
- Endpoints gợi ý:
  - GET /api/reports/branch/:branchId/revenue?from=&to=
  - GET /api/reports/system/revenue?from=&to=
  - GET /api/reports/top-services?period=6m
  - GET /api/reports/vaccine-stats?branchId=&period=
- DB chính: HOA_DON, PHIEU_DICH_VU, PHIEU_TIEM_PHONG, KHO_HANG, PHIEU_MUA_HANG.
- Gợi ý kỹ thuật: dùng view, index, partition để tối ưu (ví dụ: vw_BaoCaoDoanhThu_ChiNhanh).

---

## 📡 API Documentation (Tổng quan)

- Response mẫu thành công:
```json
{
  "success": true,
  "statusCode": 200,
  "data": { "id": 1, "name": "Example" },
  "message": "Operation successful"
}
```

- Response lỗi (400):
```json
{
  "success": false,
  "statusCode": 400,
  "error": { "code": "VALIDATION_ERROR", "message": "Invalid input data", "details": ["name is required"] }
}
```

- HTTP codes: 200, 201, 400, 401, 403, 404, 500.

Ví dụ endpoint T1:
- POST /api/customers
- Body: { name, phone, email, cccd, gender, dob }
- Success (201): trả về MaKhachHang, hạng, điểm.

---

## 📊 Reports & Analytics (chi tiết theo yêu cầu)

Báo cáo cấp chi nhánh:
- Doanh thu theo ngày/tháng/quý/năm.
- Danh sách thú cưng được tiêm trong kỳ.
- Thống kê loại vắc-xin nhiều nhất.
- Tồn kho sản phẩm bán lẻ, cảnh báo tồn thấp.
- Tra cứu vắc-xin theo tên, loại, ngày sản xuất.
- Tra cứu lịch sử khám/tiêm/gói tiêm theo thú cưng.
- Hiệu suất nhân viên (số đơn/dịch vụ, điểm đánh giá).
- Số lượng khách hàng tại chi nhánh, khách hàng lâu chưa quay lại.
- Quản lý nhân viên chi nhánh.

Báo cáo cấp công ty:
- Doanh thu toàn hệ thống và theo chi nhánh.
- Dịch vụ mang lại doanh thu cao nhất trong 6 tháng.
- Thống kê thú cưng theo loài/giống.
- Tình hình hội viên (tỷ lệ Cơ bản/Thân thiết/VIP).
- Quản lý nhân sự toàn hệ thống.

Kỹ thuật:
- Dùng views (ví dụ vw_BaoCaoDoanhThu_ChiNhanh), index, partitioning (HOA_DON theo thời gian; LICH_HEN/KHO_HANG theo chi nhánh).

---

## 🧪 Testing

- Manual: Postman collection cho các workflow T1–T14.
- Automated: Jest + supertest cho API endpoints quan trọng (ví dụ: tạo KH, tạo THU_CUNG, đặt lịch, tạo hóa đơn).
- DB tests: sử dụng giao dịch (transaction) rollback trong tests để giữ sạch môi trường.

Ví dụ case test:
- Tạo khách hàng → tạo thú cưng → đặt lịch → confirm → khởi tạo phiếu dịch vụ → tạo hóa đơn → kiểm tra điểm loyalty, cập nhật hạng.

---

## 🚀 Deployment

- Remove .env from VCS; use .env.example.
- NODE_ENV=production; enable HTTPS/SSL.
- Configure production DB, backups, logging, monitoring (Sentry).
- Set rate limiting, CORS production domains, CI/CD.
- Options: Windows/IIS, Azure App Service with Azure SQL, Docker (Dockerfile + docker-compose).

---

## 📝 Additional Notes

- Timestamps (ngay_tao, ngay_cap_nhat) quản lý tự động trong DB.
- Status fields: 1 = Active, 0 = Inactive.
- FK cascade rules đã thiết lập trong schema (kiểm tra tables.sql).
- DB queries must use parameterized queries to prevent SQL injection.
- Background jobs recommended for membership recalculation, reminders, inventory alerts.

---

## 🤝 Contributing

1. Follow the 6-step module pattern (Model → Service → Controller → Routes → Frontend → Register).
2. Update README with module details and API docs.
3. Write tests for new features.
4. Submit PR for review.

---

## 📞 Support

- Check module documentation and code comments.
- Test with Postman.
- Check browser console for frontend errors.
- For DB issues, check FK constraints, partitioning and locks.

---

**Version History:**
- v1.0.0 (30/12/2025) - Initial documentation with 12 modules defined; updated Module Details and focused workflows (T1–T20) for 10-branch deployment.

Happy Coding! 🎉