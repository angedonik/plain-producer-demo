(async function () {
    const url=getParameterByName('url');
    if(!url){
        throw 'no url'
    }
    let subscriber;
    const startButton=$('#start-button');
    const stopButton=$('#stop-playing');
    $$('.container-checkbox').forEach(b=>b.style.display='none');
    $$('.publish-button').forEach(b=>b.style.display='none');
    let socket;
    startButton.addEventListener('click',async (event)=> {
        let socketMixer;
        const tracks = {};
        startButton.disabled=true;
        event.preventDefault();
        socket = io();
        socket.on('connect', ()=>{
            socket.on('socketMixer',({socketId})=> {
                socketMixer=socketId;
            })
            socket.emit('joinCall',{callId,mcu:true},async ()=>{
                stopButton.disabled=false;
                subscriber = new WebrtcSubscriber({socket});
                socket.on(ROOM_EVENT.NEW_PRODUCER,async ({producerId,socketId, kind})=>{
                    console.log(`${ROOM_EVENT.NEW_PRODUCER} ${producerId}(${kind}) for ${socketId}`)
                    if(socketMixer===socketId){
                        const consumer = await subscriber.subscribe(producerId);
                        listenBitrate(consumer)
                        tracks[producerId]=consumer.track;
                        if (Utils.isSafari || !playbackVideo.srcObject) {
                            playbackVideo.srcObject=new MediaStream(Object.values(tracks));
                            if(Utils.isFirefox){
                                playbackVideo.addEventListener('pause',startPlaying)
                            }
                            startPlaying();
                        } else {
                            playbackVideo.srcObject.addTrack(consumer.track)
                        }
                    }
                });
                socket.on(ROOM_EVENT.PRODUCER_CLOSED,async ({producerId,socketId})=>{
                    console.log(`${ROOM_EVENT.PRODUCER_CLOSED} ${producerId} for ${socketId}`)
                    const track = tracks[producerId];
                    if (track) {
                        await subscriber.unsubscribe(producerId);
                        delete tracks[producerId];
                        if (Utils.isSafari) {
                            playbackVideo.srcObject=new MediaStream(Object.values(tracks));
                        } else {
                            playbackVideo.srcObject.removeTrack(track)
                        }
                    }
                });
                subscriber.init();
            });
        });
    });
    function stop(event){
        if(event){
            event.preventDefault();
        }
        if(socket){
            socket.close();
            socket=null;
        }
        stopButton.disabled=true;
        if(subscriber){
            subscriber.close();
            subscriber=null;
        }
        startButton.disabled=false;
        unmuteButton.disabled=true;
    }
    stopButton.addEventListener('click', stop);

})();
