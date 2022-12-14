FROM ubuntu:18.04
USER root
RUN apt-get update \
    && apt-get install curl apt-utils software-properties-common -y \
    && add-apt-repository ppa:jonathonf/ffmpeg-4 -y \
    && cd /root/ && curl -fsSL https://deb.nodesource.com/setup_16.x | bash - \
    && apt-get install -y nodejs ffmpeg \
    git-core python3 python3-pip gdb\
    libgstreamer1.0-0 gstreamer1.0-plugins-base gstreamer1.0-plugins-good gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-ugly gstreamer1.0-libav gstreamer1.0-doc gstreamer1.0-tools gstreamer1.0-x \
    gstreamer1.0-alsa gstreamer1.0-gl gstreamer1.0-gtk3 gstreamer1.0-qt5 gstreamer1.0-pulseaudio \
    libavutil-dev libswresample-dev libavcodec-dev libavformat-dev libavdevice-dev libswscale-dev \
    libbz2-dev libfaac-dev libfaad-dev libopus-dev libx264-dev libvpx-dev libx265-dev libaom-dev \
    libcurl4-openssl-dev libjson-c-dev libz-dev libmp3lame-dev libfdk-aac-dev && \
    mkdir /tmp/cores && chmod 777 /tmp/cores && echo "/tmp/cores/core.%e.sig%s.%p" > /proc/sys/kernel/core_pattern && \
    ulimit -c unlimited
COPY ./webrtc-handler/package*  /root/server/
RUN cd /root/server && npm i
COPY ./webrtc-handler  /root/server