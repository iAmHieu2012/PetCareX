# 🐾 PetCareX - Pet Shop Management System

**Version:** 1.0.0  
**Build Date:** 30/12/2025  
**Author:** PetCareX Team

---

## 📋 Table of Contents

1. [Introduction](#introduction)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup & Installation](#setup--installation)
5. [Module Details](#module-details)
6. [Development Roadmap](#development-roadmap)
7. [API Documentation](#api-documentation)
8. [Building a Module (Step-by-Step)](#building-a-module-step-by-step)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## 🎯 Introduction

**PetCareX** is a comprehensive management system for pet care shops, including:

- ✅ Branch Management
- ✅ Employee & Payroll Management
- ✅ Product & Inventory Management
- ✅ Customer & Pet Management
- ✅ Service Management (Medical Checkup, Vaccination, etc.)
- ✅ Vaccination & Vaccination Package Management
- ✅ Service Ticket & Invoice Management
- ✅ Dashboard & Detailed Reports
- ✅ Authentication & Authorization System

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
- **Database Name:** PetCareX_DB
- **Port:** 1433 (default)

### Dependencies
```json
{
  "express": "^5.2.1",
  "mssql": "^12.2.0",
  "cors": "^2.8.5",
  "dotenv": "^17.2.3"
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
├── database/
│   ├── tables.sql           # Database schema
│   └── records.sql          # Sample data
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
- Database PetCareX_DB created
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
DB_NAME=PetCareX_DB
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
```bash
# Connect to SQL Server
sqlcmd -S localhost -U sa -P your_password

# Run the schema
> :r database/tables.sql
> GO

# Optional: Load sample data
> :r database/records.sql
> GO
```

### 5. Start Development Server
```bash
npm run dev
```

Expected output:
```
✅ Database connected successfully!
✅ Server running at: http://localhost:5000
```

---

## 📦 Module Details

### Module 1: Branch Management ⭐ (Start Here)
**Status:** Pending Implementation  
**Database Tables:** CHI_NHANH

**Features:**
- Create, read, update, delete branches
- View branch details (address, phone, opening hours)
- Search and filter branches
- List all branches with pagination

**API Endpoints:**
```
GET    /api/branches              # Get all branches
GET    /api/branches/:id          # Get branch by ID
POST   /api/branches              # Create new branch
PUT    /api/branches/:id          # Update branch
DELETE /api/branches/:id          # Delete branch
```

**Database Table:**
```sql
CREATE TABLE CHI_NHANH (
    id INT PRIMARY KEY IDENTITY(1,1),
    ten_chi_nhanh NVARCHAR(100) NOT NULL,
    dia_chi NVARCHAR(200),
    so_dien_thoai VARCHAR(20),
    email VARCHAR(100),
    gio_mo_cua TIME,
    gio_dong_cua TIME,
    trang_thai INT DEFAULT 1,
    ngay_tao DATETIME DEFAULT GETDATE(),
    ngay_cap_nhat DATETIME DEFAULT GETDATE()
);
```

---

### Module 2: Employee Management
**Status:** Pending Implementation  
**Database Tables:** NHAN_VIEN, CHUC_VU

**Features:**
- Add employee information (name, position, salary)
- Track employee contracts and dates
- Manage employee permissions/roles
- Calculate payroll and allowances
- Track attendance

**API Endpoints:**
```
GET    /api/employees              # Get all employees
GET    /api/employees/:id          # Get employee by ID
POST   /api/employees              # Create new employee
PUT    /api/employees/:id          # Update employee
DELETE /api/employees/:id          # Delete employee
```

---

### Module 3: Product Management
**Status:** Pending Implementation  
**Database Tables:** SAN_PHAM, LOAI_SAN_PHAM, KHO_HANG

**Features:**
- Manage product catalog (pet food, supplies, medicines)
- Track inventory and stock levels
- Set product prices
- Monitor product categories
- Low stock alerts

**API Endpoints:**
```
GET    /api/products               # Get all products
GET    /api/products/:id           # Get product by ID
POST   /api/products               # Create new product
PUT    /api/products/:id           # Update product
DELETE /api/products/:id           # Delete product
```

---

### Module 4: Customer Management
**Status:** Pending Implementation  
**Database Tables:** KHACH_HANG

**Features:**
- Register and manage customer information
- Track customer contact details
- Maintain customer purchase history
- Customer loyalty points
- Customer notifications

**API Endpoints:**
```
GET    /api/customers              # Get all customers
GET    /api/customers/:id          # Get customer by ID
POST   /api/customers              # Create new customer
PUT    /api/customers/:id          # Update customer
DELETE /api/customers/:id          # Delete customer
```

---

### Module 5: Pet Management
**Status:** Pending Implementation  
**Database Tables:** THU_CUNG

**Features:**
- Register pets with owner information
- Track pet health records
- Record pet medical history
- Pet vaccination schedule
- Medical alerts

**API Endpoints:**
```
GET    /api/pets                   # Get all pets
GET    /api/pets/:id               # Get pet by ID
POST   /api/pets                   # Create new pet
PUT    /api/pets/:id               # Update pet
DELETE /api/pets/:id               # Delete pet
```

---

### Module 6: Service Management
**Status:** Pending Implementation  
**Database Tables:** DICH_VU, LOAI_DICH_VU

**Features:**
- Define service types (medical, grooming, boarding)
- Set service prices
- Manage service descriptions
- Service availability tracking
- Service pricing by branch

**API Endpoints:**
```
GET    /api/services               # Get all services
GET    /api/services/:id           # Get service by ID
POST   /api/services               # Create new service
PUT    /api/services/:id           # Update service
DELETE /api/services/:id           # Delete service
```

---

### Module 7: Vaccination Management
**Status:** Pending Implementation  
**Database Tables:** VACXIN, GOI_TIEM

**Features:**
- Register vaccine types and manufacturers
- Create vaccination packages
- Track vaccination dates and schedules
- Manage vaccine inventory
- Vaccination certificate generation

**API Endpoints:**
```
GET    /api/vaccinations           # Get all vaccines
GET    /api/vaccinations/:id       # Get vaccine by ID
POST   /api/vaccinations           # Create new vaccine
PUT    /api/vaccinations/:id       # Update vaccine
DELETE /api/vaccinations/:id       # Delete vaccine
```

---

### Module 8: Service Ticket Management
**Status:** Pending Implementation  
**Database Tables:** PHIEU_DICH_VU, CHI_TIET_PHIEU

**Features:**
- Create service tickets/appointments
- Track service progress
- Manage service completion and payments
- Service history tracking
- Customer notifications

**API Endpoints:**
```
GET    /api/service-tickets        # Get all tickets
GET    /api/service-tickets/:id    # Get ticket by ID
POST   /api/service-tickets        # Create new ticket
PUT    /api/service-tickets/:id    # Update ticket
DELETE /api/service-tickets/:id    # Delete ticket
```

---

### Module 9: Invoice Management
**Status:** Pending Implementation  
**Database Tables:** HOA_DON, CHI_TIET_HOA_DON

**Features:**
- Generate invoices from service tickets
- Track payments
- Print/export invoices
- Invoice history
- Payment methods (cash, card, etc.)

**API Endpoints:**
```
GET    /api/invoices               # Get all invoices
GET    /api/invoices/:id           # Get invoice by ID
POST   /api/invoices               # Create new invoice
PUT    /api/invoices/:id           # Update invoice
DELETE /api/invoices/:id           # Delete invoice
```

---

### Module 10: Reports & Analytics
**Status:** Pending Implementation  
**Database Tables:** All tables (aggregated data)

**Features:**
- Revenue reports (daily, monthly, annual)
- Sales analysis by service/product
- Employee performance metrics
- Customer analytics
- Inventory reports
- Pet health statistics

**API Endpoints:**
```
GET    /api/reports/revenue        # Revenue report
GET    /api/reports/sales          # Sales report
GET    /api/reports/employees      # Employee report
GET    /api/reports/customers      # Customer report
GET    /api/reports/inventory      # Inventory report
GET    /api/reports/health         # Pet health report
```

---

### Module 11: Dashboard
**Status:** Pending Implementation  

**Features:**
- Real-time statistics
- Key performance indicators (KPIs)
- Charts and graphs
- Quick action buttons
- System notifications
- User activity logs

---

### Module 12: Authentication & Authorization
**Status:** Pending Implementation  
**Database Tables:** NGUOI_DUNG, QUYEN_HAN

**Features:**
- User login/logout
- Role-based access control (Admin, Manager, Staff)
- Permission management
- Session management
- Password reset
- Audit logs

---

## 📅 Development Roadmap

### Week 1: Core Modules (Branch, Employee, Product)
- [ ] Module 1: Branch Management ⭐
- [ ] Module 2: Employee Management
- [ ] Module 3: Product Management

### Week 2: Customer & Pet Management
- [ ] Module 4: Customer Management
- [ ] Module 5: Pet Management
- [ ] Basic frontend for customer/pet pages

### Week 3: Service & Vaccination
- [ ] Module 6: Service Management
- [ ] Module 7: Vaccination Management
- [ ] Service appointment scheduling

### Week 4: Service Tickets
- [ ] Module 8: Service Ticket Management
- [ ] Ticket workflow (create, progress, complete)
- [ ] Customer notifications

### Week 5: Invoicing & Payments
- [ ] Module 9: Invoice Management
- [ ] Payment processing
- [ ] Invoice printing/export

### Week 6: Reports & Dashboard
- [ ] Module 10: Reports & Analytics
- [ ] Module 11: Dashboard
- [ ] System-wide data visualization

### Week 7: Authentication & Polish
- [ ] Module 12: Authentication & Authorization
- [ ] Security hardening
- [ ] Final testing and bug fixes
- [ ] Deployment preparation

---

## 📡 API Documentation

### Request/Response Format

**Success Response (200 OK):**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": 1,
    "name": "Example"
  },
  "message": "Operation successful"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["name is required"]
  }
}
```

**Server Error (500 Internal Server Error):**
```json
{
  "success": false,
  "statusCode": 500,
  "error": {
    "code": "SERVER_ERROR",
    "message": "Internal server error"
  }
}
```

### Common HTTP Status Codes
- **200:** Success
- **201:** Created
- **400:** Bad Request (invalid data)
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **500:** Internal Server Error

---

## 🔨 Building a Module (Step-by-Step)

This section explains how to build each module using a consistent pattern.

### Module Building Pattern (6 Steps)

All modules follow this exact structure to ensure consistency:

1. **Create the Model** (Database layer)
2. **Create the Service** (Business logic layer)
3. **Create the Controller** (Request handling layer)
4. **Create the Routes** (API endpoint definitions)
5. **Create the Frontend** (HTML, CSS, JavaScript)
6. **Register in app.js** (Integrate with main application)

---

### Example: Building Module 1 (Branch Management)

#### Step 1: Create branchModel.js
Location: `src/models/branchModel.js`

```javascript
const sql = require('mssql');
const config = require('../config/db');

class BranchModel {
  // Get all branches
  static async getAll() {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .query('SELECT * FROM CHI_NHANH ORDER BY id DESC');
      await pool.close();
      return result.recordset;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Get branch by ID
  static async getById(id) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('id', sql.Int, id)
        .query('SELECT * FROM CHI_NHANH WHERE id = @id');
      await pool.close();
      return result.recordset[0] || null;
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Create new branch
  static async create(data) {
    try {
      const pool = await sql.connect(config);
      const result = await pool.request()
        .input('ten_chi_nhanh', sql.NVarChar(100), data.name)
        .input('dia_chi', sql.NVarChar(200), data.address)
        .input('so_dien_thoai', sql.VarChar(20), data.phone)
        .input('email', sql.VarChar(100), data.email)
        .input('gio_mo_cua', sql.Time, data.openTime)
        .input('gio_dong_cua', sql.Time, data.closeTime)
        .query(`
          INSERT INTO CHI_NHANH 
          (ten_chi_nhanh, dia_chi, so_dien_thoai, email, gio_mo_cua, gio_dong_cua)
          VALUES (@ten_chi_nhanh, @dia_chi, @so_dien_thoai, @email, @gio_mo_cua, @gio_dong_cua);
          SELECT SCOPE_IDENTITY() as id;
        `);
      await pool.close();
      return { id: result.recordset[0].id, ...data };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Update branch
  static async update(id, data) {
    try {
      const pool = await sql.connect(config);
      await pool.request()
        .input('id', sql.Int, id)
        .input('ten_chi_nhanh', sql.NVarChar(100), data.name)
        .input('dia_chi', sql.NVarChar(200), data.address)
        .input('so_dien_thoai', sql.VarChar(20), data.phone)
        .input('email', sql.VarChar(100), data.email)
        .input('gio_mo_cua', sql.Time, data.openTime)
        .input('gio_dong_cua', sql.Time, data.closeTime)
        .query(`
          UPDATE CHI_NHANH SET
          ten_chi_nhanh = @ten_chi_nhanh,
          dia_chi = @dia_chi,
          so_dien_thoai = @so_dien_thoai,
          email = @email,
          gio_mo_cua = @gio_mo_cua,
          gio_dong_cua = @gio_dong_cua,
          ngay_cap_nhat = GETDATE()
          WHERE id = @id
        `);
      await pool.close();
      return { id, ...data };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }

  // Delete branch
  static async delete(id) {
    try {
      const pool = await sql.connect(config);
      await pool.request()
        .input('id', sql.Int, id)
        .query('DELETE FROM CHI_NHANH WHERE id = @id');
      await pool.close();
      return { success: true, id };
    } catch (error) {
      throw new Error(`Database error: ${error.message}`);
    }
  }
}

module.exports = BranchModel;
```

---

#### Step 2: Create branchService.js
Location: `src/services/branchService.js`

```javascript
const BranchModel = require('../models/branchModel');

class BranchService {
  // Get all branches with formatting
  static async getAllBranches() {
    try {
      const branches = await BranchModel.getAll();
      return branches.map(branch => this.formatBranch(branch));
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Get branch by ID
  static async getBranchById(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Invalid branch ID');
      }
      const branch = await BranchModel.getById(id);
      if (!branch) {
        throw new Error('Branch not found');
      }
      return this.formatBranch(branch);
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Create branch with validation
  static async createBranch(data) {
    try {
      // Validate input
      if (!data.name || data.name.trim() === '') {
        throw new Error('Branch name is required');
      }
      if (!data.address || data.address.trim() === '') {
        throw new Error('Branch address is required');
      }
      if (!data.phone || data.phone.trim() === '') {
        throw new Error('Branch phone is required');
      }

      const newBranch = await BranchModel.create(data);
      return this.formatBranch(newBranch);
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Update branch
  static async updateBranch(id, data) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Invalid branch ID');
      }
      
      // Check if branch exists
      const existing = await BranchModel.getById(id);
      if (!existing) {
        throw new Error('Branch not found');
      }

      const updated = await BranchModel.update(id, data);
      return this.formatBranch(updated);
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Delete branch
  static async deleteBranch(id) {
    try {
      if (!id || isNaN(id)) {
        throw new Error('Invalid branch ID');
      }

      const existing = await BranchModel.getById(id);
      if (!existing) {
        throw new Error('Branch not found');
      }

      return await BranchModel.delete(id);
    } catch (error) {
      throw new Error(`Service error: ${error.message}`);
    }
  }

  // Format branch data
  static formatBranch(branch) {
    return {
      id: branch.id,
      name: branch.ten_chi_nhanh,
      address: branch.dia_chi,
      phone: branch.so_dien_thoai,
      email: branch.email,
      openTime: branch.gio_mo_cua,
      closeTime: branch.gio_dong_cua,
      status: branch.trang_thai,
      createdAt: branch.ngay_tao,
      updatedAt: branch.ngay_cap_nhat
    };
  }
}

module.exports = BranchService;
```

---

#### Step 3: Create branchController.js
Location: `src/controllers/branchController.js`

```javascript
const BranchService = require('../services/branchService');

class BranchController {
  // Get all branches
  static async getAll(req, res) {
    try {
      const branches = await BranchService.getAllBranches();
      res.json({
        success: true,
        statusCode: 200,
        data: branches,
        message: 'Branches retrieved successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        error: {
          code: 'FETCH_ERROR',
          message: error.message
        }
      });
    }
  }

  // Get branch by ID
  static async getById(req, res) {
    try {
      const { id } = req.params;
      const branch = await BranchService.getBranchById(id);
      res.json({
        success: true,
        statusCode: 200,
        data: branch,
        message: 'Branch retrieved successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        error: {
          code: 'NOT_FOUND',
          message: error.message
        }
      });
    }
  }

  // Create branch
  static async create(req, res) {
    try {
      const branch = await BranchService.createBranch(req.body);
      res.status(201).json({
        success: true,
        statusCode: 201,
        data: branch,
        message: 'Branch created successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message
        }
      });
    }
  }

  // Update branch
  static async update(req, res) {
    try {
      const { id } = req.params;
      const branch = await BranchService.updateBranch(id, req.body);
      res.json({
        success: true,
        statusCode: 200,
        data: branch,
        message: 'Branch updated successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        error: {
          code: 'UPDATE_ERROR',
          message: error.message
        }
      });
    }
  }

  // Delete branch
  static async delete(req, res) {
    try {
      const { id } = req.params;
      await BranchService.deleteBranch(id);
      res.json({
        success: true,
        statusCode: 200,
        data: { id },
        message: 'Branch deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        statusCode: 400,
        error: {
          code: 'DELETE_ERROR',
          message: error.message
        }
      });
    }
  }
}

module.exports = BranchController;
```

---

#### Step 4: Create branchRoutes.js
Location: `src/routes/branchRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const BranchController = require('../controllers/branchController');

// GET - Fetch all branches
router.get('/', BranchController.getAll);

// GET - Fetch branch by ID
router.get('/:id', BranchController.getById);

// POST - Create new branch
router.post('/', BranchController.create);

// PUT - Update branch
router.put('/:id', BranchController.update);

// DELETE - Delete branch
router.delete('/:id', BranchController.delete);

module.exports = router;
```

---

#### Step 5: Create branches.html (Frontend)
Location: `src/public/branches.html`

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Branch Management - PetCareX</title>
    <link rel="stylesheet" href="css/style.css">
    <style>
        .branches-container { max-width: 1200px; margin: 20px auto; padding: 20px; }
        .button-group { margin-bottom: 20px; }
        .btn { padding: 10px 20px; margin: 5px; background: #007bff; color: white; border: none; cursor: pointer; border-radius: 4px; }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        .btn-warning { background: #ffc107; color: black; }
        .btn-warning:hover { background: #e0a800; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:hover { background-color: #f5f5f5; }
        .modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background-color: rgba(0,0,0,0.4); }
        .modal.show { display: block; }
        .modal-content { background-color: white; margin: 10% auto; padding: 30px; border: 1px solid #888; width: 500px; border-radius: 8px; }
        .close { color: #aaa; float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
        .close:hover { color: black; }
        .form-group { margin-bottom: 15px; }
        label { display: block; margin-bottom: 5px; font-weight: bold; }
        input, textarea { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; font-family: Arial; }
        textarea { resize: vertical; min-height: 80px; }
        .search-box { margin-bottom: 20px; }
        .search-box input { width: 300px; padding: 10px; border: 1px solid #ddd; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="branches-container">
        <h1>🏢 Branch Management</h1>
        
        <div class="button-group">
            <button class="btn" id="addBranchBtn">➕ Add New Branch</button>
        </div>

        <div class="search-box">
            <input type="text" id="searchInput" placeholder="Search branches...">
        </div>

        <table id="branchesTable">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Branch Name</th>
                    <th>Address</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Opening Hours</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody></tbody>
        </table>
    </div>

    <!-- Add/Edit Modal -->
    <div id="branchModal" class="modal">
        <div class="modal-content">
            <span class="close" id="closeModal">&times;</span>
            <h2 id="modalTitle">Add New Branch</h2>
            <form id="branchForm">
                <div class="form-group">
                    <label for="branchName">Branch Name *</label>
                    <input type="text" id="branchName" required>
                </div>
                <div class="form-group">
                    <label for="branchAddress">Address *</label>
                    <textarea id="branchAddress" required></textarea>
                </div>
                <div class="form-group">
                    <label for="branchPhone">Phone *</label>
                    <input type="tel" id="branchPhone" required>
                </div>
                <div class="form-group">
                    <label for="branchEmail">Email</label>
                    <input type="email" id="branchEmail">
                </div>
                <div class="form-group">
                    <label for="branchOpenTime">Opening Time</label>
                    <input type="time" id="branchOpenTime">
                </div>
                <div class="form-group">
                    <label for="branchCloseTime">Closing Time</label>
                    <input type="time" id="branchCloseTime">
                </div>
                <button type="submit" class="btn">Save Branch</button>
            </form>
        </div>
    </div>

    <script>
        const API_BASE = 'http://localhost:5000/api/branches';
        let currentBranchId = null;
        const modal = document.getElementById('branchModal');
        const form = document.getElementById('branchForm');
        const table = document.getElementById('branchesTable').getElementsByTagName('tbody')[0];

        // Open modal for adding
        document.getElementById('addBranchBtn').addEventListener('click', () => {
            currentBranchId = null;
            form.reset();
            document.getElementById('modalTitle').textContent = 'Add New Branch';
            modal.classList.add('show');
        });

        // Close modal
        document.getElementById('closeModal').addEventListener('click', () => {
            modal.classList.remove('show');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });

        // Fetch and display branches
        async function loadBranches() {
            try {
                const response = await fetch(API_BASE);
                const result = await response.json();
                
                if (result.success) {
                    table.innerHTML = '';
                    result.data.forEach(branch => {
                        const row = table.insertRow();
                        row.innerHTML = `
                            <td>${branch.id}</td>
                            <td>${branch.name}</td>
                            <td>${branch.address}</td>
                            <td>${branch.phone}</td>
                            <td>${branch.email}</td>
                            <td>${branch.openTime || 'N/A'} - ${branch.closeTime || 'N/A'}</td>
                            <td>
                                <button class="btn btn-warning" onclick="editBranch(${branch.id})">Edit</button>
                                <button class="btn btn-danger" onclick="deleteBranch(${branch.id})">Delete</button>
                            </td>
                        `;
                    });
                }
            } catch (error) {
                console.error('Error loading branches:', error);
            }
        }

        // Submit form
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const data = {
                name: document.getElementById('branchName').value,
                address: document.getElementById('branchAddress').value,
                phone: document.getElementById('branchPhone').value,
                email: document.getElementById('branchEmail').value,
                openTime: document.getElementById('branchOpenTime').value,
                closeTime: document.getElementById('branchCloseTime').value
            };

            try {
                const url = currentBranchId ? `${API_BASE}/${currentBranchId}` : API_BASE;
                const method = currentBranchId ? 'PUT' : 'POST';

                const response = await fetch(url, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                const result = await response.json();
                if (result.success) {
                    modal.classList.remove('show');
                    loadBranches();
                    alert(currentBranchId ? 'Branch updated!' : 'Branch created!');
                }
            } catch (error) {
                console.error('Error saving branch:', error);
            }
        });

        // Edit branch
        async function editBranch(id) {
            try {
                const response = await fetch(`${API_BASE}/${id}`);
                const result = await response.json();
                
                if (result.success) {
                    const branch = result.data;
                    currentBranchId = branch.id;
                    document.getElementById('branchName').value = branch.name;
                    document.getElementById('branchAddress').value = branch.address;
                    document.getElementById('branchPhone').value = branch.phone;
                    document.getElementById('branchEmail').value = branch.email;
                    document.getElementById('branchOpenTime').value = branch.openTime;
                    document.getElementById('branchCloseTime').value = branch.closeTime;
                    document.getElementById('modalTitle').textContent = 'Edit Branch';
                    modal.classList.add('show');
                }
            } catch (error) {
                console.error('Error loading branch:', error);
            }
        }

        // Delete branch
        async function deleteBranch(id) {
            if (confirm('Are you sure you want to delete this branch?')) {
                try {
                    const response = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
                    const result = await response.json();
                    
                    if (result.success) {
                        loadBranches();
                        alert('Branch deleted!');
                    }
                } catch (error) {
                    console.error('Error deleting branch:', error);
                }
            }
        }

        // Search functionality
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            Array.from(table.rows).forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });

        // Load branches on page load
        loadBranches();
    </script>
</body>
</html>
```

---

#### Step 6: Register in app.js
Location: `src/app.js`

```javascript
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Import routes
const branchRoutes = require('./routes/branchRoutes');

// Register routes
app.use('/api/branches', branchRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server running' });
});

// Serve main HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
```

---

### Pattern Summary

**For each new module, follow these 6 steps:**

1. **Model:** Database operations (CRUD queries)
2. **Service:** Business logic & validation
3. **Controller:** HTTP request handlers
4. **Routes:** API endpoint definitions
5. **Frontend:** HTML form + JavaScript API integration
6. **app.js:** Register routes and middleware

**This pattern ensures:**
- ✅ Consistent code structure
- ✅ Easy debugging and testing
- ✅ Clear separation of concerns
- ✅ Scalability for future modules
- ✅ Reduced code duplication

---

## 🧪 Testing

### Manual API Testing with Postman

1. **GET All Branches**
   ```
   GET http://localhost:5000/api/branches
   ```

2. **GET Single Branch**
   ```
   GET http://localhost:5000/api/branches/1
   ```

3. **CREATE New Branch**
   ```
   POST http://localhost:5000/api/branches
   Content-Type: application/json
   
   {
     "name": "Downtown Branch",
     "address": "123 Main Street",
     "phone": "555-1234",
     "email": "downtown@petcarex.com",
     "openTime": "09:00",
     "closeTime": "18:00"
   }
   ```

4. **UPDATE Branch**
   ```
   PUT http://localhost:5000/api/branches/1
   Content-Type: application/json
   
   {
     "name": "Updated Branch Name",
     "address": "456 Oak Avenue",
     "phone": "555-5678",
     "email": "updated@petcarex.com",
     "openTime": "08:00",
     "closeTime": "19:00"
   }
   ```

5. **DELETE Branch**
   ```
   DELETE http://localhost:5000/api/branches/1
   ```

### Automated Testing

Create `tests/branch.test.js`:

```javascript
const request = require('supertest');
const app = require('../src/app');

describe('Branch API', () => {
  test('GET /api/branches should return all branches', async () => {
    const response = await request(app).get('/api/branches');
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
  });

  test('POST /api/branches should create new branch', async () => {
    const response = await request(app)
      .post('/api/branches')
      .send({
        name: 'Test Branch',
        address: '123 Test St',
        phone: '555-1234',
        email: 'test@test.com'
      });
    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
  });
});
```

---

## 🚀 Deployment

### Production Deployment Checklist

- [ ] Remove `.env` from version control (use `.env.example`)
- [ ] Set `NODE_ENV=production` in production
- [ ] Enable HTTPS/SSL certificates
- [ ] Configure production database connection
- [ ] Set up automated backups for database
- [ ] Configure logging to file system
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Enable request rate limiting
- [ ] Configure CORS for production domains
- [ ] Set up CI/CD pipeline
- [ ] Test all API endpoints in production
- [ ] Document deployment steps
- [ ] Set up monitoring and alerts

### Deployment Options

**Option 1: Windows Server with IIS**
- Install Node.js on server
- Use IIS Application Request Routing (ARR)
- Set up Windows service for Node app

**Option 2: Azure**
- Deploy to Azure App Service
- Use Azure SQL Database
- Configure Azure CDN for static files

**Option 3: Docker**
- Create Dockerfile and docker-compose.yml
- Push to Docker Hub or Azure Container Registry
- Deploy to container orchestration service

---

## 📝 Additional Notes

- All timestamps are automatically managed (ngay_tao, ngay_cap_nhat)
- Status fields use 1 = Active, 0 = Inactive
- All foreign keys have cascade delete rules
- Database queries use parameterized queries to prevent SQL injection
- All API responses follow standard format (success, statusCode, data, message)

---

## 🤝 Contributing

To add a new module:
1. Follow the 6-step pattern documented above
2. Update this README with module details
3. Test all CRUD operations
4. Update the development roadmap
5. Submit for review

---

## 📞 Support

For questions or issues:
- Check the module documentation
- Review code comments
- Test with Postman
- Check browser console for frontend errors

---

**Version History:**
- v1.0.0 (30/12/2025) - Initial documentation with 12 modules defined
- English filenames applied throughout documentation

Happy Coding! 🎉
