import json
from channels.generic.websocket import AsyncWebsocketConsumer

connected_user = {}
class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user_name = self.scope['url_route']['kwargs']['user_name']

        self.room_name = self.room_name.replace(' ', '_')
        self.room_group_name = f'chat_{self.room_name}'
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
        # send user count and list of connected usernames to frontend
        userlist = self.room_group_name + 'usernames'
        if self.room_group_name not in connected_user:
            connected_user[self.room_group_name] = 0
            connected_user[userlist] = []

        connected_user[self.room_group_name] += 1
        connected_user[userlist].append(self.user_name)

        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'send_users_info',
                'user_count': connected_user[self.room_group_name],
                'user_list': connected_user[userlist] 
            }
        )
    
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

        # send user count and list of connected usernames to frontend
        userlist = self.room_group_name + 'usernames'
        connected_user[self.room_group_name] -= 1
        connected_user[userlist].remove(self.user_name)

        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'send_users_info',
                'user_count': connected_user[self.room_group_name],
                'user_list': connected_user[userlist] 
            }
        )
    
    async def receive(self, text_data):
        json_text_data = json.loads(text_data)
        user_name = json_text_data['user_name']
        message = json_text_data['message']

        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'send_chat_msg',
                'user_name': user_name,
                'msg': message,
            }
        )
    
    #helper functions
    async def send_chat_msg(self, event):
        user_name = event['user_name']
        msg = event['msg']

        await self.send(text_data=json.dumps({
            'user_name': user_name,
            'message': msg,
        }))
    
    async def send_users_info(self, event):
        user_count = event['user_count']
        userlist = event['user_list']

        await self.send(text_data=json.dumps({
            'not_msg': True,
            'user_count': user_count,
            'user_list': userlist
        }))





class VideoConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope['url_route']['kwargs']['room_name']
        self.user_name = self.scope['url_route']['kwargs']['user_name']

        self.room_name = self.room_name.replace(' ', '_')
        self.room_group_name = f'video_{self.room_name}'
        
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        
    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        json_text_data = json.loads(text_data)

        action = json_text_data['action']
        timestamp = json_text_data['timestamp']
        videoID = json_text_data['videoID']

        await self.channel_layer.group_send(
            self.room_group_name, {
                'type': 'send_video_info',
                'user_name': self.user_name,
                'action': action,
                'timestamp': timestamp,
                'videoID': videoID
            }
        )
    
    # helper functions
    async def send_video_info(self, event):
        user_name = event['user_name']
        action = event['action']
        timestamp = event['timestamp']
        videoID = event['videoID']

        await self.send(text_data=json.dumps({
            'user_name': user_name,
            'action': action,
            'timestamp': timestamp,
            'videoID': videoID
        }))