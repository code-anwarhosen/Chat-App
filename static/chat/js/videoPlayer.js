let openMediaDiv = document.getElementById("openMedia");
let closeMediaDiv = document.getElementById("closeVideoDiv");

///////////////Video Socket Section//////////////////////////
const videoSocket = new WebSocket(
    `${protocol}//${window.location.host}/ws/video/${roomName}/${userName}/`
    // ws://127.0.0.1:8000/ws/video/Friends/Anwar/
);

videoSocket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    if (data.videoID) {
        LoadYouTubeVideo(data.videoID);
        closeMediaDiv.style.display = 'block';

        setTimeout(() => {
            adjustPlayerSize();
        }, 1000); //1s delay
        return;
    }

    // console.log('msg from video socket');
    console.log('action : ' + String(data.action));
    console.log('timestamp : ' + data.timestamp);
    console.log('video id : ' + data.videoID);

    if (data.timestamp && data.action === 'seek') {
        seekVideo(data.timestamp);
    } else if (data.action === 'play' && player.getPlayerState() !== YT.PlayerState.PLAYING) {
        player.playVideo();
    } else if (data.action === 'pause' && player.getPlayerState() !== YT.PlayerState.PAUSED) {
        player.pauseVideo();
    }
};

videoSocket.onclose = function(e) {
    console.error('Video socket closed unexpectedly');
};

function send_video_data(action='', timestamp=null, videoID=null) {
    videoSocket.send(JSON.stringify({
        'user_name': userName,
        'action': action,
        'timestamp': timestamp,
        'videoID': videoID
    }));
}


//////////Youtube media player api///////////
var player;
var lastTime = 0;
var checkSeekInterval;

function onYouTubeIframeAPIReady() {
    // This function is called automatically when the API is ready
}

function onPlayerReady(event) {
    console.log('Player is ready.');
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

function startSeekCheck() {
    checkSeekInterval = setInterval(checkSeek, 500); // 200ms
}

function stopSeekCheck() {
    clearInterval(checkSeekInterval);
}

let lastCheckTime = 0;
function checkSeek() {
    var currentTime = player.getCurrentTime();
    const now = new Date().getTime();
    const expectedTime = lastTime + (now - lastCheckTime) / 1000; // Convert milliseconds to seconds
    
    // Check if the difference is greater than the seek threshold
    if (Math.abs(currentTime - expectedTime) > 10) { // if differ 50ms
        send_video_data('seek', currentTime);
        console.log('Video seeked to: ' + currentTime + ' seconds');
    }
    lastTime = currentTime;
    lastCheckTime = now;
}

let lastAction = '';
function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING && lastAction !== 'play') {
        lastAction = 'play';
        send_video_data('play');
        startSeekCheck();

    } else if (event.data == YT.PlayerState.PAUSED && lastAction !== 'pause') {
        lastAction = 'pause';
        send_video_data('pause');
        stopSeekCheck();

    } else if (event.data == YT.PlayerState.ENDED) {
        lastAction = 'ended';
        stopSeekCheck();
    }
}

closeMediaDiv.onclick = function () {
    closeMediaDiv.style.display = 'none';
    videoSocket.close(1000);

    let mediaDiv = document.getElementById("player");
    mediaDiv.style.width = '0';
    mediaDiv.style.height = '0';
    if (window.matchMedia('(max-width: 768px)').matches) {
        document.getElementsByClassName('messages')[0].style.height = '75vh';
    } else {
        document.getElementsByClassName('messages')[0].style.height = '100%';
    }
}

openMediaDiv.onclick = function () {
    toggleSidebar(); // close the sidebar
    openMediaDiv.textContent = "Select another video";
    let url = prompt("Enter the YouTube video link.");
    
    let videoId = extractVideoId(url);
    if (videoId) {
        send_video_data('', null, videoId);
    } else {
        alert("Invalid URL");
    }
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
        mediaDiv.style.height = '30vh';
        document.getElementsByClassName('messages')[0].style.height = '50vh';
    } else {
        mediaDiv.style.width = '100%';
        mediaDiv.style.height = '100%';
    }
}

function seekVideo(seconds) {
    player.seekTo(seconds, true);
}