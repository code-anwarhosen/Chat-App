from django.urls import path
from . import consumer

websocket_urlpatterns = [
    path('ws/chat/<str:room_name>/<str:user_name>/', consumer.ChatConsumer.as_asgi()),
    path('ws/video/<str:room_name>/<str:user_name>/', consumer.VideoConsumer.as_asgi()),
]