from django.conf import settings
from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from pprint import pprint

class SocialAccountAdapter(DefaultSocialAccountAdapter):

    def populate_user(self, request, sociallogin, data):
        # Runs on each login and initial signup.  Flag all users as "staff" for the admin interface.
        user = super().populate_user(request, sociallogin, data)
        user.is_staff = True
        user.is_superuser = True
        return user
