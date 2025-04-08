from django.contrib import admin

from .models import Animals, AnimalSubtype, Breed

admin.site.register(Animals)
admin.site.register(AnimalSubtype)
admin.site.register(Breed)
