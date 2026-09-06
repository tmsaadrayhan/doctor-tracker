# Doctor Tracker — Next.js + Express + MongoDB + JWT

This project follows the supplied Doctor Tracker brief: authenticated administration, doctor management, patient management, search/filter/pagination, dashboard analytics, MongoDB indexes, validation, REST APIs, responsive UX, and a clean project structure.

## Architecture

```text
Next.js frontend
        |
        | REST + Bearer JWT
        v
Express/Node API
        |
        v
MongoDB
```

The frontend is a separate Next.js client application and the backend is a standalone Express server, matching the supplied architecture requirement.

## Folder structure

```text
doctor-tracker-nextjs/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── server.js
│   └── .env.example
├── frontend/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── dashboard/
│   │   ├── components/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── .env.local.example
└── README.md
```

## Backend setup

```bash
cd backend
npm install
```

Copy `.env.example` to `.env`, then set:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/doctor_tracker
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=1d
CLIENT_URL=http://localhost:3000
```

Start:

```bash
npm run dev
```

## Frontend setup

```bash
cd frontend
npm install
```

Copy `.env.local.example` to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Start:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Authentication

- Register/login returns a signed JWT.
- The Next.js client stores the token and sends it as `Authorization: Bearer <token>`.
- Express `auth.middleware.js` verifies the JWT.
- All doctor, patient and dashboard routes are protected.
- Every record is scoped to the authenticated user's `createdBy`.

For a production application, replace localStorage JWT storage with an HttpOnly Secure cookie and add CSRF protection/rate limiting.

## API

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Doctors
- `GET /api/doctors`
- `GET /api/doctors/options`
- `GET /api/doctors/:id`
- `POST /api/doctors`
- `PUT /api/doctors/:id`
- `DELETE /api/doctors/:id`
- `POST /api/doctors/:id/patients`

### Patients
- `GET /api/patients`
- `GET /api/patients/options`
- `GET /api/patients/:id`
- `POST /api/patients`
- `PUT /api/patients/:id`
- `DELETE /api/patients/:id`

### Dashboard
- `GET /api/dashboard`

## Technical decisions

### 1. Separate Next.js and Express services
The supplied brief describes a separate Next.js frontend and standalone Node/Express backend. Keeping them separate makes the REST boundary explicit, allows independent deployment/scaling, and keeps API concerns out of the UI.

### 2. Query optimization
Doctor and patient collections include indexes for `createdBy`, creation date, doctor, specialization and condition. List endpoints use server-side pagination and `Promise.all` for independent count/list operations. Dashboard statistics use MongoDB aggregation rather than loading all records into Node.

## Assignment checklist

- Authentication: JWT + protected middleware
- Doctor CRUD: included
- Patient CRUD: included
- Doctor-specific patient view: included
- Search: included
- Date filters: included
- Condition/gender/specialization/hospital filters: included
- Pagination: included
- Dashboard analytics: included
- Charts: Recharts
- MongoDB indexes: included
- Validation: express-validator + Mongoose
- Responsive frontend: included
- README + env examples: included

## Important

The brief requests high-quality desktop/mobile screenshots as visual evidence. This codebase supplies the UI but cannot truthfully include screenshots until the app is run with your own MongoDB data.
# doctor-tracker
# doctor-tracker
