from django.contrib import admin
from .models import ChatMessage, ActivityLog


@admin.register(ChatMessage)
class ChatMessageAdmin(admin.ModelAdmin):
    list_display = ('sender', 'message_snippet', 'response_time', 'model_name', 'is_voice', 'timestamp')
    list_filter = ('sender', 'is_voice', 'model_name', 'timestamp')
    search_fields = ('message',)

    def message_snippet(self, obj):
        return obj.message[:50] + "..." if len(obj.message) > 50 else obj.message
    message_snippet.short_description = "Message"


@admin.register(ActivityLog)
class ActivityLogAdmin(admin.ModelAdmin):
    list_display = ('action', 'severity', 'timestamp', 'details')
    list_filter = ('severity', 'timestamp')
    search_fields = ('action', 'details')
