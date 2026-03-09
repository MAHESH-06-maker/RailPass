# RailPass
A webapp for the application of railway concession for college students.

run this in cmd prmpt in the same folder as these files:
npm init -y
npm install express mysql2 bcrypt body-parser cors

For the db:
CREATE DATABASE Railpass
USE Railpass
CREATE TABLE Users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    firstName VARCHAR(50),
    fatherName VARCHAR(50),
    lastName VARCHAR(50),
    nearestStation VARCHAR(100)
);

CREATE TABLE Applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    nearestStation VARCHAR(100),
    preferredClass VARCHAR(50),
    duration VARCHAR(50),
    status VARCHAR(20) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (username) REFERENCES Users(username)
);


Also before running do activate the backen server by using:
node server.js
Befor running the webpages.


