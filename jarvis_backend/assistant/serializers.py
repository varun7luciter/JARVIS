from rest_framework import serializers
from .models import ChatMessage, ActivityLog


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(
        required=True,
        allow_blank=False,
        error_messages={'blank': 'Sir, the transmission is empty. Please provide a message.'}
    )
    is_voice = serializers.BooleanField(required=False, default=False)
    history = serializers.ListField(
        child=serializers.DictField(),
        required=False,
        default=list
    )


class ChatResponseSerializer(serializers.Serializer):
    success = serializers.BooleanField()
    reply = serializers.CharField()
    timestamp = serializers.DateTimeField()
    response_time = serializers.FloatField()
    model = serializers.CharField(required=False)
    action = serializers.CharField(required=False, allow_null=True)
    action_data = serializers.DictField(required=False, allow_null=True)


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'sender', 'message', 'response_time', 'model_name', 'is_voice', 'timestamp']


class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = ['id', 'action', 'details', 'severity', 'timestamp']
