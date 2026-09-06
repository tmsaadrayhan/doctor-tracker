# Doctor Tracker

## Live app
https://doctor-tracker-imm7-gilt.vercel.app

## Description

Doctor Tracker is a full-stack healthcare administration application that allows authenticated users to manage doctors and patients, search and filter records, view doctor-specific patients, and monitor key statistics through an analytics dashboard.

## Setup Guide

### 1. Clone and install

```bash
git clone <your-repository-url>
cd doctor-tracker-nextjs
```

### 2. Backend

```bash
cd backend
npm install
```

Start the backend:

```bash
npm run dev
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
```

Start the frontend:

```bash
npm run dev
```

---

## System Architecture

```text
Next.js Frontend
       |
       | REST API + Bearer JWT
       v
Express / Node.js
       |
       | Mongoose
       v
MongoDB
```

The frontend handles the UI, while Express manages authentication, validation, business logic, and database operations.

---

## Technical Decisions

### 1. Separate Frontend and Backend

Next.js and Express are maintained as separate services. This creates a clear REST API boundary and allows the frontend and backend to be developed and deployed independently.

### 2. MongoDB Indexing & Server-Side Queries

MongoDB indexes are used on frequently queried fields such as `createdBy`, `doctor`, `specialization`, and `condition`. Search, filtering, pagination, and dashboard aggregation are performed on the server to reduce unnecessary data transfer and improve performance.

---

## Visual Evidence

### Desktop

Add a high-quality desktop screenshot of the dashboard here:

```text
![Desktop Dashboard](./screenshots/dashboard-desktop.png)
```

### Mobile

Add a mobile screenshot here:

```text
![Mobile Dashboard](./screenshots/dashboard-mobile.png)
```

> Screenshots should be captured after running the application with sample data.

---

## Project Structure

```text
doctor-tracker-nextjs/
├── backend/
├── frontend/
├── .gitignore
└── README.md
```

For detailed frontend and backend documentation, see:

* `frontend/README.md`
* `backend/README.md`
