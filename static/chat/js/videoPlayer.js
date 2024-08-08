///////////////Video Socket Section//////////////////////////
const videoSocket = new WebSocket(
    `${protocol}//${window.location.host}/ws/video/${roomName}/${userName}/`
    // ws://127.0.0.1:8000/ws/video/Friends/Anwar/
);

videoSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);

    console.log('msg from video socket');
    console.log('action : ' + String(data.action));
    console.log('timestamp : ' + data.timestamp);
    if (data.timestamp) {
        seekVideo(data.timestamp);
        playVideo();
    }
    else {
        if (data.action === 'play') {
            playVideo();
        } else {
            pauseVideo();
        }
    }
};

videoSocket.onclose = function(e) {
    console.error('Video socket closed unexpectedly');
};

function send_video_data(action='', timestamp=null) {
    videoSocket.send(JSON.stringify({
        'user_name': userName,
        'action': action,
        'timestamp': timestamp
    }));
}


//////////Youtube media player api///////////
var player;
var lastTime = 0;
var checkInterval = 500; // Check every 500 milliseconds
var checkSeekInterval;

function onYouTubeIframeAPIReady() {
    // This function is called automatically when the API is ready
}

function LoadYouTubeVideo(videoID) {
    if (player) {
        player.loadVideoById(videoID); // Load a new video into the existing player
    } else {
        player = new YT.Player('player', {
            videoId: videoID, 
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            },
            playerVars: {
                'controls': 1
            }
        });
    }
}

document.getElementById("openMedia").onclick = function () {
    document.getElementById("openMedia").textContent = "Select another video";
    let url = prompt("Enter the YouTube video link.");
    
    let videoId = extractVideoId(url);
    if (videoId) {
        LoadYouTubeVideo(videoId);
        adjustPlayerSize(); // Adjust the player size based on screen width
    } else {
        alert("Invalid URL");
    }
    toggleSidebar(); // close the sidebar
};

function extractVideoId(url) {
    let videoId = null;
    let parts = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    if (parts[2] !== undefined) {
        videoId = parts[2].split(/[^0-9a-z_\-]/i)[0];
    } else {
        videoId = url;
    }
    return videoId.length === 11 ? videoId : null; // Ensure the extracted ID is 11 characters long
}

function adjustPlayerSize() {
    let mediaDiv = document.getElementById("player");
    if (window.matchMedia('(max-width: 768px)').matches) {
        mediaDiv.style.width = '100%';
        mediaDiv.style.height = '25vh';
        document.getElementsByClassName('messages')[0].style.height = '55vh';
    } else {
        mediaDiv.style.width = '100%';
        mediaDiv.style.height = '100%';
    }
}

function onPlayerReady(event) {
    console.log('Player is ready.');
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        console.log('Video playing');
        send_video_data('play');
        startSeekCheck();
    } else if (event.data == YT.PlayerState.PAUSED) {
        console.log('Video paused');
        send_video_data('pause');
        stopSeekCheck();
    } else if (event.data == YT.PlayerState.ENDED) {
        console.log('Video ended');
        stopSeekCheck();
    }
}

function startSeekCheck() {
    checkSeekInterval = setInterval(checkSeek, checkInterval);
}

function stopSeekCheck() {
    clearInterval(checkSeekInterval);
}

function checkSeek() {
    var currentTime = player.getCurrentTime();
    if (Math.abs(currentTime - lastTime) > 1) { 
        let TimeStamp = Math.floor(currentTime);
        send_video_data('seek', TimeStamp);
        console.log('Video seeked to: ' + TimeStamp + ' seconds');
    }
    lastTime = currentTime;
}

function playVideo() {
    player.playVideo();
}

function pauseVideo() {
    player.pauseVideo();
}

function seekVideo(seconds) {
    player.seekTo(seconds, true);
}