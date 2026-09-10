"""
URL configuration for jarvis_backend project.
"""
from pathlib import Path

from django.conf import settings
from django.contrib import admin
from django.http import JsonResponse
from django.urls import include, path
from django.views.generic import TemplateView
from django.views.static import serve

FRONTEND_DIR = Path(__file__).resolve().parent.parent.parent / 'frontend'


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
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('api-root/', api_root, name='api-root'),
]

for asset_dir in ['css', 'js', 'assets']:
    urlpatterns.append(
        path(f'{asset_dir}/<path:path>', lambda request, path, asset_dir=asset_dir: serve(request, path, str(FRONTEND_DIR / asset_dir), show_indexes=False))
    )

urlpatterns += [
    path('<path:path>', lambda request, path: serve(request, path, str(FRONTEND_DIR), show_indexes=False)),
]
