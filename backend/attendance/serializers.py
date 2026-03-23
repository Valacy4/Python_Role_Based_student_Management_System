# attendance/serializers.py
from rest_framework import serializers
from .models import AttendanceRecord

class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()

    class Meta:
        model  = AttendanceRecord
        fields = ['id', 'enrollment', 'date', 'status',
                  'marked_by', 'student_name', 'subject_name']

    def get_student_name(self, obj):
        return obj.enrollment.student.user.get_full_name()

    def get_subject_name(self, obj):
        return obj.enrollment.cls.subject.name