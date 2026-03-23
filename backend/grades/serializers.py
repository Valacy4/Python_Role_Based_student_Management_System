# grades/serializers.py
from rest_framework import serializers
from .models import Grade

class GradeSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    subject_name = serializers.SerializerMethodField()
    percentage   = serializers.SerializerMethodField()

    class Meta:
        model  = Grade
        fields = ['id', 'enrollment', 'exam_type', 'marks',
                  'max_marks', 'remarks', 'student_name',
                  'subject_name', 'percentage', 'graded_at']

    def get_student_name(self, obj):
        return obj.enrollment.student.user.get_full_name()

    def get_subject_name(self, obj):
        return obj.enrollment.cls.subject.name

    def get_percentage(self, obj):
        # Calculate percentage automatically
        if obj.max_marks > 0:
            return round((obj.marks / obj.max_marks) * 100, 2)
        return 0