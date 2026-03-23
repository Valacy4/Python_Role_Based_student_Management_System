// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

import Login from './pages/Login'

import ClassDetail from './pages/teacher/ClassDetail'

import PrincipalLayout   from './layouts/PrincipalLayout'
import HODLayout         from './layouts/HODLayout'
import TeacherLayout     from './layouts/TeacherLayout'
import StudentLayout     from './layouts/StudentLayout'

import PrincipalDashboard from './pages/principal/Dashboard'
import PrincipalUsers     from './pages/principal/Users'
import PrincipalDepartments from './pages/principal/Departments'
import SubjectDetail from './pages/principal/SubjectDetail'
import AddUser from './pages/principal/AddUser'
import EditUser from './pages/principal/EditUser'

import HODDashboard from './pages/hod/Dashboard'
import HODTeachers  from './pages/hod/Teachers'
import HODStudents  from './pages/hod/Students'
import HODMyClasses    from './pages/hod/MyClasses'
import HODMyAttendance from './pages/hod/MyAttendance'
import HODMyGrades     from './pages/hod/MyGrades'

import TeacherDashboard  from './pages/teacher/Dashboard'
import TeacherClasses    from './pages/teacher/Classes'
import TeacherAttendance from './pages/teacher/Attendance'
import TeacherGrades     from './pages/teacher/Grades'

import StudentDashboard  from './pages/student/Dashboard'
import StudentAttendance from './pages/student/Attendance'
import StudentMarks      from './pages/student/Marks'
import StudentProfile    from './pages/student/Profile'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/principal" element={
            <ProtectedRoute allowedRoles={['principal']}>
              <PrincipalLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard"   element={<PrincipalDashboard />} />
            <Route path="users"       element={<PrincipalUsers />} />
            <Route path="departments" element={<PrincipalDepartments />} />
            <Route path="subjects/:id" element={<SubjectDetail />} />
            <Route path="add-user" element={<AddUser />} />
            <Route path="edit-user/:id" element={<EditUser />} />
          </Route>

          <Route path="/hod" element={
            <ProtectedRoute allowedRoles={['hod']}>
              <HODLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<HODDashboard />} />
            <Route path="teachers"  element={<HODTeachers />} />
            <Route path="students"  element={<HODStudents />} />
            <Route path="my-classes"    element={<HODMyClasses />} />
            <Route path="my-classes/:id" element={<ClassDetail />} />
            <Route path="my-attendance" element={<HODMyAttendance />} />
            <Route path="my-grades"     element={<HODMyGrades />} />
          </Route>

          <Route path="/teacher" element={
            <ProtectedRoute allowedRoles={['teacher']}>
              <TeacherLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard"  element={<TeacherDashboard />} />
            <Route path="classes"    element={<TeacherClasses />} />
            <Route path="classes/:id" element={<ClassDetail />} />
            <Route path="attendance" element={<TeacherAttendance />} />
            <Route path="grades"     element={<TeacherGrades />} />
          </Route>

          <Route path="/student" element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard"  element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="marks"      element={<StudentMarks />} />
            <Route path="profile"    element={<StudentProfile />} />
          </Route>

          <Route path="/"  element={<Navigate to="/login" replace />} />
          <Route path="*"  element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}