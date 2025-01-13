from django.http import HttpResponse

def health_check(response):
    return HttpResponse(status=200)
