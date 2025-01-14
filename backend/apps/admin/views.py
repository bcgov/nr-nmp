from django.http import HttpResponse

def health_check(response):
    return HttpResponse("OK", status=200)
