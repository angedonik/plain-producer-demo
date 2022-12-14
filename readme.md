**Deploying:**
- save **.env.example** as **.env** and edit it:
  - `EXTERNAL_IP` and `ANNOUNCED_IP` - `ip` and `announcedIp` for mediasoup webrtc transport
  - `HANDLER_IP` and `HANDLER_PORT` -  `ip` and `port` for http server
  - `HANDLER_PORT_FROM` and `HANDLER_PORT_TO` - port range for mediasoup worker
  - `TURN_EXTERNAL_IP`,`TURN_LISTENING_PORT`,`TURN_USER`,`TURN_PASSWORD` - coturn options (if needed)
  - `TCP_PORT` - port for connection between gstreamer and ffmpeg
- install docker, docker-compose and run `docker-compose up --build`

**Testing:**
- open **http://`HANDLER_IP`:`HANDLER_PORT`/demo/demo.html?url=https://codeda.com/data/rtmpDump.mp4** (url param is required )
- press **start** button

**Debugging:**
- run on your host `docker exec -ti webrtc-handler /bin/bash` 
- run inside container `gdb /root/server/node_modules/mediasoup/worker/out/Release/mediasoup-worker /tmp/cores/<dump-name>`