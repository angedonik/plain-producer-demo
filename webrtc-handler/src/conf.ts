import {CodecParameters, MediaSoupDefaultSettings} from './interfaces';
import {EnvUtils} from './utils';

export const rest={
    port:EnvUtils.getEnvNum('HANDLER_PORT'),
    ip:EnvUtils.getEnvStr('HANDLER_IP')
}
export const videoCodec:CodecParameters={
    kind: 'video',
    mimeType: 'video/H264',
    clockRate: 90000,
    payloadType  : 96,
    rtcpFeedback : [ ],
    parameters :
        {
            'packetization-mode' : 1,
            'profile-level-id' : '42e01f',
            //‘level-asymmetry-allowed’ : 0
        }
}
const listenIp={
    ip: EnvUtils.getEnvStr('EXTERNAL_IP'), announcedIp: EnvUtils.getEnvStr('ANNOUNCED_IP')
};
export const webRTC:MediaSoupDefaultSettings={
    worker: {
        logLevel: 'warn',
        logTags: [
            'info',
            'ice',
            'dtls',
            'rtp',
            'srtp',
            'rtcp'/*,
                'rtx',
                'bwe',
                'score',
                'simulcast',
                'svc'*/
        ]
    },
    router: {
        mediaCodecs:[videoCodec]
    },
    transport: {
        listenIps: [listenIp]
    },
    plainTransport: {
        recv:{listenIp,comedia:true,rtcpMux:false}
    }
}