"""
URL configuration for the project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from django.views.generic.base import RedirectView
from apps.admin.views import health_check

urlpatterns = [
    path('', RedirectView.as_view(url='accounts/login', permanent=True)),
    # Note: we need a redirect for admin/login/?next=/admin/. TODO: make an apps/admin urls.py file
    path('admin/', admin.site.urls),
    # TODO: make a better accounts/login page
    path('accounts/', include('allauth.urls')),
    path('healthcheck/', health_check),
    path('api/', include('apps.animals.urls')),
    path('api/', include('apps.crops.urls')),
    path('api/', include('apps.shared.urls')),
    path('api/', include('apps.manure.urls')),
    path('api/', include('apps.fertilizers.urls')),
]
