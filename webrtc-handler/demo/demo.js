(async function () {
    const url=getParameterByName('url');
    if(!url){
        throw 'no url'
    }
    let client;
    const startButton=$('#start-button');
    const stopButton=$('#stop-playing');
    $$('.container-checkbox').forEach(b=>b.style.display='none');
    $$('.publish-button').forEach(b=>b.style.display='none');
    startButton.addEventListener('click',async (event)=> {
        startButton.disabled=true;
        event.preventDefault();
        client=new DemoClient();
        const track=await client.start(url);
        if(track){
            playbackVideo.srcObject=new MediaStream([track]);
            startPlaying();
        }
        stopButton.disabled=false;
    });
    function stop(event){
        if(event){
            event.preventDefault();
        }
        if(client){
            client.close();
            client=null;
        }
        stopButton.disabled=true;
        startButton.disabled=false;
        unmuteButton.disabled=true;
    }
    stopButton.addEventListener('click', stop);

})();
