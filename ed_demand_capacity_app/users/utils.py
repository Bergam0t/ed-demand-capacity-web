# # From https://medium.com/@dakota.lillie/django-react-jwt-authentication-5015ee00ef9a

# from .serializers import UserSerializer

# # From
# # "All this is doing is adding a new ‘user’ field with the user’s serialized data 
# # when a token is generated. This is going to be our new default JWT response handler, 
# # which we can set up by adding a little bit to our settings.py file"
# def my_jwt_response_handler(token, user=None, request=None):
#     return {
#         'token': token,
#         'user': UserSerializer(user, context={'request': request}).data
#     }