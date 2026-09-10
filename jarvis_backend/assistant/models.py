from django.db import models
from django.utils import timezone


class ChatMessage(models.Model):
    SENDER_CHOICES = (
        ('user', 'User / Sir'),
        ('jarvis', 'J.A.R.V.I.S'),
        ('system', 'System Core'),
    )

    sender = models.CharField(max_length=20, choices=SENDER_CHOICES, default='user')
    message = models.TextField()
    response_time = models.FloatField(default=0.0, help_text="Processing time in seconds")
    model_name = models.CharField(max_length=100, blank=True, null=True, help_text="AI Model used")
    is_voice = models.BooleanField(default=False, help_text="Whether input was via voice")
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['timestamp']
        verbose_name = 'Chat Message'
        verbose_name_plural = 'Chat Messages'

    def __str__(self):
        return f"[{self.timestamp.strftime('%H:%M:%S')}] {self.sender.upper()}: {self.message[:40]}"


class ActivityLog(models.Model):
    SEVERITY_CHOICES = (
        ('info', 'Information'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('error', 'Error'),
    )

    action = models.CharField(max_length=255)
    details = models.TextField(blank=True, default='')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    timestamp = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ['-timestamp']
        verbose_name = 'Activity Log'
        verbose_name_plural = 'Activity Logs'

    def __str__(self):
        return f"[{self.timestamp.strftime('%H:%M:%S')}] {self.action}"
