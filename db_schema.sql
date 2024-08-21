-- Create the database
CREATE DATABASE readRight;

-- Use the database
USE readRight;

-- Create the author table
CREATE TABLE author (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    name VARCHAR(255) NOT NULL UNIQUE,
    seriesNo INT,
    booksNo INT,
    date DATE,
    nationality VARCHAR(255),
    bio TEXT,
    x VARCHAR(255),
    fb VARCHAR(255),
    ig VARCHAR(255),
    link VARCHAR(255),
    genre VARCHAR(255),
    awards TEXT,
    searchCount INT DEFAULT 0
);

-- Create the series table
CREATE TABLE series (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    name VARCHAR(255) NOT NULL UNIQUE,
    author_name VARCHAR(255),
    booksNo INT,
    genres VARCHAR(255),
    link VARCHAR(255),
    searchCount INT DEFAULT 0,
    FOREIGN KEY (author_name) REFERENCES author(name) ON DELETE SET NULL
);

-- Create the books table
CREATE TABLE books (
    id INT AUTO_INCREMENT PRIMARY KEY,
    image VARCHAR(255),
    name VARCHAR(255) NOT NULL,
    serie_name VARCHAR(255),
    serieNo INT,
    author_name VARCHAR(255),
    genres VARCHAR(255),
    authorNo INT,
    date DATE,
    link VARCHAR(255),
    searchCount INT DEFAULT 0,
    FOREIGN KEY (serie_name) REFERENCES series(name) ON DELETE SET NULL,
    FOREIGN KEY (author_name) REFERENCES author(name) ON DELETE SET NULL
);


-- Create the users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    verification_code VARCHAR(6) NULL
);

 -- Admin
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


