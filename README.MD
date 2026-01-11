# 🐾 PetCareX – Pet Care Center Management System

## Introduction

PetCareX is a centralized management system designed for operating a chain of pet care centers.  
The system is developed as part of the **Advanced Database Systems** course project, focusing on **relational database design, optimization, and transaction-intensive workloads**.

PetCareX supports a network of **10 pet care centers** located in major cities.  
Each center provides integrated services including veterinary examination, vaccination programs, and retail sales of pet food, medicine, and accessories.

The project emphasizes:
- Real-world business workflow modeling
- Database design from conceptual to physical level
- Query optimization using indexes, views, and partitioning
- High-frequency transactional operations

---

## System Scope

### Core Entities

- **Branches**: Manage branch information, working hours, and provided services.
- **Customers (Members)**: Register membership accounts with loyalty tracking.
- **Pets**: Each customer can own multiple pets with medical histories.
- **Employees**: Veterinarians, sales staff, receptionists, and managers.
- **Products & Vaccines**: Retail products, vaccines, inventory, and batch tracking.
- **Invoices & Payments**: Unified billing for services and retail purchases.

---

## Functional Overview

### Customer & Pet Management
- Member registration and loyalty point tracking
- Multi-pet ownership per customer
- Membership tier classification (Basic, Loyal, VIP)

### Medical Services
- Appointment scheduling
- Veterinary examination and diagnosis
- Prescription and medical history tracking
- Vaccination (single shots and long-term packages)

### Retail & Inventory
- Product and vaccine catalog management
- Inventory tracking by branch and batch
- Expiry date monitoring

### Billing & Loyalty
- Invoice generation for services and purchases
- Loyalty point accumulation
- Automatic membership tier updates

### Human Resource Management
- Employee profile management
- Branch assignment and transfer history
- Salary configuration

### Reporting & Analytics
- Revenue reports by time period and branch
- Service and vaccine usage statistics
- Employee performance metrics
- Membership distribution analysis

---

## Tech Stack

### Backend
- **Runtime:** Node.js (v14+)
- **Framework:** Express.js
- **Database:** Microsoft SQL Server
- **Package Manager:** NPM

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript

### Database
- **DBMS:** Microsoft SQL Server 2019+
- **Database Name:** PETCAREX

---

## Project Structure

```text
PetCareX/
├── server.js
├── package.json
├── .env
├── README.md
├── database/
│   ├── 01_init_db.sql
│   ├── 02_tables.sql
│   ├── 03_indexes.sql
│   ├── 04_views.sql
│   ├── 05_functions.sql
│   ├── 06_procedures.sql
│   ├── 07_triggers.sql
│   └── 08_values.sql
└── src/
    ├── app.js
    ├── config/
    │   └── db.js
    ├── models/
    ├── services/
    ├── controllers/
    ├── routes/
    ├── middlewares/
    ├── utils/
    └── public/
```

---

## Database Design

The database is designed following a **three-level architecture**:

1. **Conceptual Level**
   - Entity-Relationship modeling
   - Identification of entities, relationships, and constraints

2. **Logical Level**
   - Relational schema transformation
   - Normalization and constraint definition

3. **Physical Level**
   - Indexing strategies
   - Views for reporting
   - Partitioning for large tables
   - Stored procedures and triggers

Performance optimization techniques such as **indexing, partitioning, and view materialization** are applied to high-frequency queries.

---

## Setup & Installation

### Prerequisites
- Node.js v14+
- Microsoft SQL Server
- SQL Server Management Studio

### Environment Configuration

Create a `.env` file:

```env
PORT=5000
NODE_ENV=development

DB_SERVER=localhost
DB_USER=sa
DB_PASSWORD=your-password
DB_NAME=PETCAREX
DB_PORT=1433
DB_TRUST_SERVER_CERTIFICATE=true
DB_ENCRYPT=false
```

### Install Dependencies

```bash
npm install
```

### Database Initialization

Execute all SQL scripts in the `database/` folder in order:

1. init database
2. tables
3. indexes
4. views
5. functions
6. procedures
7. triggers
8. sample data

### Run Development Server

```bash
npm run dev
```

---

## Testing

- Manual testing using Postman
- Transaction-based testing with rollback
- Performance comparison with and without indexing strategies

---

## Deployment Notes

- Remove `.env` from version control
- Enable SSL and secure authentication
- Configure database backup and monitoring
- Optional deployment using Docker or cloud services

---

## Academic Context

This project is developed for the course:

**CSC12002 – Advanced Database Systems**

Key learning objectives:
- Relational database design
- Query optimization
- Transaction management
- Performance evaluation

---

## Version History

- **v1.0.0 (2025-12-30)**  
  Initial release with full database schema, core functionalities, and reporting modules.

---
