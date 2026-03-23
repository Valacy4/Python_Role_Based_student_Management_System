// src/utils/validate.js

export function validateLogin({ email, password }) {
  const errors = {}
  if (!email)                        errors.email    = 'Email is required'
  else if (!/\S+@\S+\.\S+/.test(email)) errors.email = 'Enter a valid email'
  if (!password)                     errors.password = 'Password is required'
  else if (password.length < 6)      errors.password = 'Password must be at least 6 characters'
  return errors
}

export function validateGrade({ enrollment, marks, max_marks }) {
  const errors = {}
  if (!enrollment)              errors.enrollment = 'Select a student'
  if (marks === '' || marks === undefined)
                                errors.marks      = 'Marks are required'
  else if (isNaN(marks))        errors.marks      = 'Marks must be a number'
  else if (Number(marks) < 0)   errors.marks      = 'Marks cannot be negative'
  else if (Number(marks) > Number(max_marks))
                                errors.marks      = `Marks cannot exceed max marks (${max_marks})`
  if (!max_marks)               errors.max_marks  = 'Max marks required'
  return errors
}

export function validatePhone(phone) {
  const errors = {}
  if (phone && !/^\d{10}$/.test(phone))
    errors.phone = 'Phone must be exactly 10 digits'
  return errors
}

export function validateAttendance({ enrollment, date, status }) {
  const errors = {}
  if (!enrollment) errors.enrollment = 'Select a student'
  if (!date)       errors.date       = 'Date is required'
  if (!status)     errors.status     = 'Status is required'
  return errors
}