var player;
var lastTime = 0;
var checkInterval = 500; // Check every 500 milliseconds
var checkSeekInterval;

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        // height: '360',
        // width: '640',
        videoId: 'neBokMVcUP8', // Extracted from the given link
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        },
        playerVars: {
            'controls': 1 // Show default player controls
        }
    });
}

function onPlayerReady(event) {
    console.log('Player is ready.');
}

function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
        console.log('Video playing');
        startSeekCheck();
    } else if (event.data == YT.PlayerState.PAUSED) {
        console.log('Video paused');
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
    if (Math.abs(currentTime - lastTime) > 1) { // Detect seek (threshold 1 second)
        console.log('Video seeked to: ' + Math.floor(currentTime) + ' seconds');
        lastTime = currentTime; // Update lastTime only if a seek is detected
    } else {
        lastTime = currentTime;
    }
}

// Example function to play video
function playVideo() {
    player.playVideo();
    console.log('Playing video');
}

// Example function to pause video
function pauseVideo() {
    player.pauseVideo();
    console.log('Pausing video');
}

// Example function to seek video
function seekVideo(seconds) {
    player.seekTo(seconds, true);
    console.log('Seeking video to ' + seconds + ' seconds');
}
