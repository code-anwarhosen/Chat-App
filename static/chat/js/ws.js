const userName = JSON.parse(document.getElementById('user-name').textContent);
const roomName = JSON.parse(document.getElementById('room-name').textContent);

const chatSocket = new WebSocket(
    'ws://'
    + window.location.host
    + '/ws/chat/'
    + roomName
    + '/'
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);

    const now = new Date();
    const currentDate = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().split(' ')[0];
    const dateTime = String(currentTime) + " " + String(currentDate);
    
    var senderClass = userName === data.user_name ? 'sender' : '';
    const msgHTML = `<div class="message ${senderClass}">
                        <div class="username">${data.user_name}</div>
                        <div class="text">${data.message}</div>
                        <div class="timestamp">${String(currentTime)}</div>
                    </div>`
    document.querySelector('#chat-log').innerHTML += msgHTML;
};

chatSocket.onclose = function(e) {
    console.error('Chat socket closed unexpectedly');
};

document.querySelector('#chat-message-input').focus();
document.querySelector('#chat-message-input').onkeyup = function(e) {
    if (e.key === 'Enter') {  // enter, return
        document.querySelector('#chat-message-submit').click();
    }
};

document.querySelector('#chat-message-submit').onclick = function(e) {
    const messageInputDom = document.querySelector('#chat-message-input');
    const message = messageInputDom.value;

    if (String(message).length != 0){
        chatSocket.send(JSON.stringify({
            'user_name': userName,
            'message': message
        }));
        messageInputDom.value = '';
    }
};