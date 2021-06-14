# # From https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a

from django.urls import path
from .views import *



from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView
)

urlpatterns = [
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('token/verify/', TokenVerifyView.as_view(), name='token_verify'),

]

urlpatterns += [
    path('current_user/', current_user),
    path('current_user_email_json/', current_user_email_json),
    path('users/', UserList.as_view()),
    path('list-all-users/', ViewUserList.as_view())
]