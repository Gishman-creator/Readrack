-- Create the database
CREATE DATABASE readRight;

-- Use the database
USE readRight;

-- Create the books table
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    serie VARCHAR(255),
    serieNo INT,
    author VARCHAR(255),
    genres VARCHAR(255),
    authorNo INT,
    date DATE,
    link VARCHAR(255)
);

-- Create the series table
CREATE TABLE series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    author VARCHAR(255),
    booksNo INT,
    genres VARCHAR(255),
    link VARCHAR(255)
);

-- Create the author table
CREATE TABLE author (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    seriesNo INT,
    bookNo INT,
    date DATE,
    nationality VARCHAR(255),
    bio TEXT,
    x VARCHAR(255),
    fb VARCHAR(255),
    ig VARCHAR(255),
    link VARCHAR(255),
    genre VARCHAR(255),
    awards TEXT
);

-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE admin (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    refresh_token TEXT,           -- Store the refresh token
    verification_code VARCHAR(6), -- Store the verification code
    role ENUM('admin', 'subAccount') NOT NULL DEFAULT 'admin', -- Store user role
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
