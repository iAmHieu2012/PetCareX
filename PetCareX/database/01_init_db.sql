--==============================================================
-- PHẦN 1: TẠO CƠ SỞ DỮ LIỆU MỚI: PETCAREX
--==============================================================

USE master;
GO

IF EXISTS (SELECT name
FROM sys.databases
WHERE name = N'PETCAREX')
BEGIN
    ALTER DATABASE PETCAREX SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
    DROP DATABASE PETCAREX;
END
GO

CREATE DATABASE PETCAREX;
GO