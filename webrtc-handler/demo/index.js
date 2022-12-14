function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);
const fullscreenButton=$('#fullscreen');
const playbackVideo=$('#playback-video');
const unmuteButton=$('#unmute-playback-video');
if(playbackVideo && fullscreenButton){
    fullscreenButton.addEventListener('click', function (event) {
        event.preventDefault();
        if (playbackVideo.requestFullscreen) {
            playbackVideo.requestFullscreen();
        } else if (playbackVideo.mozRequestFullScreen) {
            playbackVideo.mozRequestFullScreen();
        } else if (playbackVideo.webkitRequestFullscreen) {
            playbackVideo.webkitRequestFullscreen();
        } else if (playbackVideo.msRequestFullscreen) {
            playbackVideo.msRequestFullscreen();
        }
    });
}
if(playbackVideo && unmuteButton) {
    unmuteButton.addEventListener('click', function (event) {
        event.preventDefault();
        console.log('muted before',playbackVideo.muted, playbackVideo.volume);
        playbackVideo.muted=false;
        playbackVideo.volume=1;
        console.log('muted after',playbackVideo.muted, playbackVideo.volume);
        unmuteButton.disabled=true;
    });
    playbackVideo.addEventListener('volumechange', function (_) {
        console.log('volumechange',playbackVideo.muted, playbackVideo.volume);
        unmuteButton.disabled=!playbackVideo.muted && playbackVideo.volume>0.01;
    });
    function startPlaying() {
        console.log('trying to play');
        let playPromise = playbackVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
            }).catch(_ => {
                playbackVideo.muted = true;
                unmuteButton.disabled = false;
                playbackVideo.play().then(() => {
                    console.log('errorAutoPlayCallback OK');
                }, (_) => {
                    console.log('errorAutoPlayCallback error again');
                });
            });
        }
    }
}
