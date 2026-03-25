# Backend - Course Enrollment System

This backend is built with **Node.js + Express + MongoDB (Mongoose)** using **MVC architecture** and **JWT authentication**.

## Quick Start

1. Install dependencies
2. Start the API server
3. (Optional) Seed initial data

```cmd
cd backend
npm install
npm run dev
```

Optional seeding:

```cmd
cd backend
npm run seed
```

## Important Rules Implemented

- Student can self-register.
- Faculty/Admin users can be created only by Admin.
- Enrollment check order:
  1. `maintenanceMode`
  2. `enrollStatus`
  3. `allowSelfEnrollment`
  4. `maxEnrollment`
- Settings is a singleton document with fixed `_id = "SYSTEM_SETTINGS"`.
- Dropping a course updates enrollment to `status: "dropped"` and sets `droppedAt`; enrollment records are never deleted.

## Main API Groups

- `/api/auth`
- `/api/users`
- `/api/courses`
- `/api/enrollments`
- `/api/settings`
- `/api/health`
