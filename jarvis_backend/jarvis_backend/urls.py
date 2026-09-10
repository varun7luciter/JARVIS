"""
URL configuration for jarvis_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "status": "online",
        "system": "J.A.R.V.I.S Core System (Mark VII)",
        "endpoints": {
            "chat": "/api/chat/",
            "status": "/api/status/",
            "history": "/api/history/",
            "clear_history": "/api/history/clear/",
        },
        "version": "4.2.0"
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('assistant.urls')),
    path('', api_root, name='api-root'),
]
