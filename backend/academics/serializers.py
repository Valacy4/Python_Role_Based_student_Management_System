# academics/serializers.py
from rest_framework import serializers
from .models import Department, Subject, TeacherProfile, StudentProfile, Class, Enrollment
from accounts.models import User


class DepartmentSerializer(serializers.ModelSerializer):
    hod_name = serializers.SerializerMethodField()

    class Meta:
        model  = Department
        fields = ['id', 'name', 'hod', 'hod_name']

    def get_hod_name(self, obj):
        if obj.hod:
            return obj.hod.get_full_name()
        return None


class SubjectSerializer(serializers.ModelSerializer):
    department_name = serializers.SerializerMethodField()

    class Meta:
        model  = Subject
        fields = ['id', 'name', 'code', 'department',
                  'department_name', 'semester', 'credits']

    def get_department_name(self, obj):
        return obj.department.name


class TeacherProfileSerializer(serializers.ModelSerializer):
    user      = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    full_name = serializers.SerializerMethodField()
    email     = serializers.SerializerMethodField()

    class Meta:
        model  = TeacherProfile
        fields = ['id', 'user', 'full_name', 'email',
                  'department', 'employee_id', 'specialization']

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_email(self, obj):
        return obj.user.email


class StudentProfileSerializer(serializers.ModelSerializer):
    user            = serializers.PrimaryKeyRelatedField(queryset=User.objects.all())
    full_name       = serializers.SerializerMethodField()
    email           = serializers.SerializerMethodField()
    department_name = serializers.SerializerMethodField()

    class Meta:
        model  = StudentProfile
        fields = ['id', 'user', 'full_name', 'email', 'department',
                  'department_name', 'roll_number', 'semester', 'batch_year']

    def get_full_name(self, obj):
        return obj.user.get_full_name()

    def get_email(self, obj):
        return obj.user.email

    def get_department_name(self, obj):
        return obj.department.name if obj.department else '—'


class ClassSerializer(serializers.ModelSerializer):
    subject_name = serializers.SerializerMethodField()
    teacher_name = serializers.SerializerMethodField()
    semester     = serializers.SerializerMethodField()  # ← added

    class Meta:
        model  = Class
        fields = ['id', 'subject', 'subject_name', 'teacher',
                  'teacher_name', 'academic_year', 'is_active',
                  'semester']                            # ← added

    def get_subject_name(self, obj):
        return f"{obj.subject.code} - {obj.subject.name}"

    def get_teacher_name(self, obj):
        return obj.teacher.user.get_full_name()

    def get_semester(self, obj):                        # ← added
        return obj.subject.semester


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    roll_number  = serializers.SerializerMethodField()
    class_name   = serializers.SerializerMethodField()

    class Meta:
        model  = Enrollment
        fields = ['id', 'student', 'cls', 'student_name',
                  'roll_number', 'class_name', 'enrolled_at']

    def get_student_name(self, obj):
        return obj.student.user.get_full_name()

    def get_roll_number(self, obj):
        return obj.student.roll_number

    def get_class_name(self, obj):
        return str(obj.cls)