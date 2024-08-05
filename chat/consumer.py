import json
from channels.generic.websocket import AsyncWebsocketConsumer

class ChatConsumer(AsyncWebsocketConsumer):
    connected_user = 0
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        if ' ' in self.room_name:
            self.room_name = self.room_name.replace(' ', '_')
        self.room_group_name = f'chat_{self.room_name}'
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

        self.connected_user += 1
        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'all_users',
                'user_count': self.connected_user
            }
        )
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        self.connected_user -= 1
        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'all_users',
                'user_count': self.connected_user
            }
        )
    
    async def receive(self, text_data):
        json_text_data = json.loads(text_data)
        user_name = json_text_data['user_name']
        message = json_text_data['message']

        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'chat_msg',
                'user_name': user_name,
                'msg': message,
            }
        )
    async def chat_msg(self, event):
        user_name = event['user_name']
        msg = event['msg']

        await self.send(text_data=json.dumps({
            'user_name': user_name,
            'message': msg,
        }))
    
    async def all_users(self, event):
        user_count = event['user_count']
        await self.send(text_data=json.dumps({
            'user_count': user_count
        }))