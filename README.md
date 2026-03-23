# Student Management System

A full-stack web application for managing students, teachers, HODs and principal with role-based access control.

## Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Backend   | Python, Django, Django REST Framework   |
| Auth      | JWT (djangorestframework-simplejwt)     |
| Frontend  | React 18, Vite, React Router v6, Axios |
| Database  | MySQL                                   |

## Features

### Principal
- View and manage all users (students, teachers, HODs)
- Add new users for any role
- Edit user details and active status
- View all departments and subjects
- Click any subject to see teacher and enrolled students

### HOD
- Department management view — teachers and students
- Teaching view — their own classes, attendance, grades
- Dual role (HOD + Teacher) with tab switching

### Teacher
- View assigned classes
- Mark attendance for students
- Add and manage grades
- Download class data as CSV or Excel
- Add/remove students from their class

### Student
- Profile page with edit access
- Attendance view grouped by subject with percentage
- Marks view grouped by subject with overall percentage
- Dashboard with charts — donut chart and bar graphs

## Project Structure
```
student_management/
├── backend/                  ← Django REST API
│   ├── accounts/             ← User model, JWT auth, permissions
│   ├── academics/            ← Departments, subjects, classes, enrollments
│   ├── attendance/           ← Attendance records
│   ├── grades/               ← Marks and grades
│   ├── core/                 ← Django settings and URLs
│   ├── manage.py
│   └── requirements.txt
└── frontend/                 ← React + Vite
    └── src/
        ├── api/              ← Axios instance
        ├── components/       ← Reusable components
        ├── context/          ← Auth context
        ├── hooks/            ← Custom hooks
        ├── layouts/          ← Role-based layouts with sidebars
        ├── pages/            ← Pages per role
        │   ├── principal/
        │   ├── hod/
        │   ├── teacher/
        │   └── student/
        └── utils/            ← Validation, export helpers
```

## Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- MySQL 8.0+

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate — Windows
venv\Scripts\activate

# Activate — Mac/Linux
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database credentials

# Run migrations
python manage.py migrate

# Seed database with sample data
python manage.py seed_full_data

# Start server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`

## Environment Variables

Create `backend/.env` using `backend/.env.example` as reference:
```
SECRET_KEY=your-django-secret-key
DEBUG=True
DB_NAME=sms_db
DB_USER=your-db-username
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=3306
```

## Default Login Credentials

After running `seed_full_data`:

| Role      | Email                        | Password       |
|-----------|------------------------------|----------------|
| Principal | principal@sms.com            | Principal@1234 |
| HOD (CS)  | hod_cs@sms.com               | Hod@1234       |
| HOD (IT)  | hod_it@sms.com               | Hod@1234       |
| HOD (EC)  | hod_ec@sms.com               | Hod@1234       |
| HOD (ME)  | hod_me@sms.com               | Hod@1234       |
| Teacher   | teacher_cs_1@sms.com         | Teacher@1234   |
| Student   | student_cs2022001@sms.com    | Student@1234   |

## API Endpoints
```
POST   /api/auth/login/           Login and get JWT token
POST   /api/auth/refresh/         Refresh access token
POST   /api/auth/logout/          Logout and blacklist token
GET    /api/auth/whoami/          Get current user info

GET    /api/auth/users/           List all users (principal only)
POST   /api/auth/users/           Create user (principal only)
PATCH  /api/auth/users/update-me/ Update own profile

GET    /api/departments/          List departments
GET    /api/subjects/             List subjects
GET    /api/teachers/             List teacher profiles
GET    /api/students/             List student profiles
GET    /api/classes/              List classes
GET    /api/classes/my-classes/   List teacher's own classes
GET    /api/enrollments/          List enrollments
GET    /api/attendance/           List attendance records
GET    /api/grades/               List grades
```

## Running Tests
```bash
cd backend
python manage.py test accounts
```