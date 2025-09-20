# **MediConnect API 🩺✨**

Welcome to the MediConnect API\! This is the backend service for a modern healthcare application designed to connect patients with doctors, manage appointments, and handle reviews seamlessly.

## **⭐ Key Features**

- **🔑 User Authentication**: Secure registration and login for patients, doctors, and admins using JSON Web Tokens (JWT).
- **👨‍⚕️ Patient & Doctor Profiles**: Dedicated profiles for patients to manage their health records and for doctors to manage their professional information and schedules.
- **🗓️ Appointment Booking**: A complete system for patients to book, view, and manage appointments with doctors.
- **🌟 Doctor Reviews**: A robust review system allowing patients to rate and review doctors, with automatic calculation of average ratings.

## **🚀 Tech Stack**

This project is built with a modern, efficient, and scalable technology stack:

- **Node.js**: Event-driven, non-blocking I/O model for the server runtime.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js.
- **🍃 MongoDB**: A flexible and scalable NoSQL database to store application data.
- **Mongoose**: An elegant object data modeling (ODM) library for MongoDB and Node.js.
- **jsonwebtoken (JWT)**: For creating secure access tokens for authentication.
- **bcrypt**: A library for hashing user passwords.
- **dotenv**: For managing environment variables.

## **⚙️ Getting Started**

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### **1\. Prerequisites**

Make sure you have Node.js and npm installed on your machine. You will also need a MongoDB database (either local or a cloud service like MongoDB Atlas).

### **2\. Installation**

Clone the repository to your local machine:

git clone \<your-repository-url\>  
cd medi-connect

Install the required npm packages:

npm install

### **3\. Environment Variables**

Create a config.env file in the root directory of the project. This file will store your secret and configuration variables. Copy the contents of config.env.example (if available) or use the template below:

NODE_ENV=development  
PORT=5000

\# MongoDB Connection String  
DB_URL=\<your_mongodb_connection_string\>  
DB_PASS=\<your_database_password\>

\# JWT Configuration  
JWT_SECRET=\<your_jwt_secret_key\>  
JWT_EXPIRES_IN=30d

**Important**: Remember to replace the placeholder values (\<...\>) with your actual configuration details.

### **4\. Running the Application ▶️**

To start the server in development mode (with nodemon), run:

npm start

To start the server in production mode, run:

npm run start:prod

The server should now be running on http://localhost:5000\!

## **Endpoints API 🗺️**

Here are some of the main endpoints available in the API.

### **Users /api/v1/users**

| Method | Endpoint  | Description                           |
| :----- | :-------- | :------------------------------------ |
| POST   | /register | Register a new user (patient/doctor). |
| POST   | /login    | Log in a user and get a JWT.          |
| GET    | /me       | Get the current user's profile.       |

### **Reviews /api/v1/reviews**

| Method | Endpoint           | Description                            |
| :----- | :----------------- | :------------------------------------- |
| POST   | /                  | Create a new review for a doctor.      |
| GET    | /                  | Get a list of all reviews.             |
| GET    | /:id               | Get a single review by its ID.         |
| PATCH  | /:id               | Update a review.                       |
| DELETE | /:id               | Delete a review.                       |
| GET    | /doctors/:doctorId | Get all reviews for a specific doctor. |
