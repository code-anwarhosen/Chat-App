from django.shortcuts import render

def index(request):
    return render(request, 'chat/room.html')

def room(request):
    if request.method == 'GET':
        user_name = request.GET.get('username')
        room_name = request.GET.get('room_name')

        context = {
            'user_name': user_name,
            'room_name' : room_name,
        }
        return render(request, 'chat/chat.html', context)