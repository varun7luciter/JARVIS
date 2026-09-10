from django.urls import path
from .views import ChatAPIView, StatusAPIView, HistoryAPIView, ActivityAPIView

urlpatterns = [
    path('chat/', ChatAPIView.as_view(), name='api-chat'),
    path('status/', StatusAPIView.as_view(), name='api-status'),
    path('history/', HistoryAPIView.as_view(), name='api-history'),
    path('history/clear/', HistoryAPIView.as_view(), name='api-history-clear'),
    path('activity/', ActivityAPIView.as_view(), name='api-activity'),
]
