const {DemoClient}=DemoClientLib;
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
    function startPlaying() {
        console.log('trying to play');
        let playPromise = playbackVideo.play();
        if (playPromise !== undefined) {
            playPromise.then(_ => {
            }).catch(_ => {
                playbackVideo.muted = true;
                playbackVideo.play().then(() => {
                    console.log('errorAutoPlayCallback OK');
                }, (_) => {
                    console.log('errorAutoPlayCallback error again');
                });
            });
        }
    }
}
