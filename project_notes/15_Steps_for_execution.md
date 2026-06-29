# Execution & Deployment
web application link: https://ucab-ra7u.onrender.com

it will take you to direct website no need install dependencies

How to run the Ucab application locally.

## Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas URI)

## 1. Backend Server
Open a terminal in the `server` directory:
```bash
npm install
npm run dev
```
*The server will start on http://localhost:5000*

## 2. Frontend Client
Open a new terminal in the `client` directory:
```bash
npm install
npm run dev
```
*The React app will start on http://localhost:5173*

## 3. Database Seeding (Optional)
To populate the database with test users and drivers:
```bash
cd server
npm run seed
```
