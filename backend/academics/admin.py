# academics/admin.py
from django.contrib import admin
from .models import Department, TeacherProfile, StudentProfile, Subject, Class, Enrollment

admin.site.register(Department)
admin.site.register(TeacherProfile)
admin.site.register(StudentProfile)
admin.site.register(Subject)
admin.site.register(Class)
admin.site.register(Enrollment)