let userName = JSON.parse(document.getElementById('user-name').textContent);
let roomName = JSON.parse(document.getElementById('room-name').textContent);

let protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const chatSocket = new WebSocket(
    `${protocol}//${window.location.host}/ws/chat/${roomName}/${userName}/`
    // ws://127.0.0.1:8000/ws/chat/Friends/Anwar/
);

chatSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);

    // if data.not_msg is true thats mean its not a chat message. its users info
    if (data.not_msg === true){
        console.log("User just conneted/disconnected");
        document.getElementById('active').innerHTML = 'Active: ' + data.user_count;
        
        const userList = document.getElementById('userList');
        userList.innerHTML = "";
        data.user_list.forEach(element => {
            userList.innerHTML += `<li>${String(element)}</li>`;
        });
        return;
    }

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
    var chatLog = document.getElementById('chat-log');
    chatLog.innerHTML += msgHTML;
    chatLog.scrollTop = chatLog.scrollHeight;
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

// leave websocket with close code 1000, which is normal close code
document.getElementById('leaveChat').onclick = function (e) {
    let yes = confirm("Are you sure?");
    if (yes === false) {
        return;
    }
    document.getElementById('leaveChat').textContent = "Leaving Chat...";

    chatSocket.close(1000);
    setTimeout(function() {
        window.location.href = window.location.origin;
    }, 800);  // 800ms delay
}

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