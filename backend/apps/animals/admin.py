from django.contrib import admin
from .models import Animals

admin.site.register(Animals)

from django.contrib import admin
from .models import *

admin.site.register(Animals)
admin.site.register(AnimalSubtype)
