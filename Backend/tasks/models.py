from django.db import models
from django.contrib.auth.models import User

class Task(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('in_progress', 'In_Progress'),
        ('complete', 'Complete'),
    ]
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=200)
    description = models.TextField(
        blank = True,
        null = True,
    )
    status = models.CharField(
        max_length=20,
        choices= STATUS_CHOICES,
        default='pending',
    )
    due_date = models.DateTimeField(
        blank= True,
        null= True
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    def __str__(self):
        return self.title