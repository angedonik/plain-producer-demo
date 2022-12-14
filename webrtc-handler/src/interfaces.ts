import {WorkerSettings} from 'mediasoup/node/lib/Worker';
import {RouterOptions} from 'mediasoup/node/lib/Router';
import {TransportListenIp} from 'mediasoup/node/lib/Transport';
import {MediaKind, RtpCapabilities, RtpCodecParameters, RtpParameters} from 'mediasoup/node/lib/RtpParameters';
import {ConsumerType} from 'mediasoup/node/lib/Consumer';
import {PlainTransportOptions} from 'mediasoup/node/lib/PlainTransport';
import {DtlsParameters, IceCandidate, IceParameters} from 'mediasoup/node/lib/WebRtcTransport';

export enum ERROR {UNKNOWN,INVALID_TRANSPORT,INVALID_PRODUCER,INVALID_ACTION}
export enum PATH {API = "api"}
export interface IceServer {
    urls: string[];
    username?: string;
    credential?: string;
}
export interface ServerConfigs {
    routerRtpCapabilities:RtpCapabilities
    iceServers?:IceServer[]
}
export interface ConnectTransportRequest{
    dtlsParameters: DtlsParameters
}
export interface ConsumeRequest {
    rtpCapabilities: RtpCapabilities
}
export interface ConsumeResponse {
    id: string
    rtpParameters: RtpParameters
    type: ConsumerType
    producerPaused: boolean
    kind: MediaKind
}
export interface PlainProduceResponse{
    payloadType: number
    ssrc: number
    rtpPort: number
    rtcpPort: number
    listenIp: string
}
export interface MediaSoupSettings {
    worker:WorkerSettings
    router:RouterOptions
    transport: {
        listenIps:TransportListenIp[]|string[]
    }
    plainTransport:{
        recv:PlainTransportOptions
    }
}
export interface MediaSoupDefaultSettings extends MediaSoupSettings{
    worker:Omit<WorkerSettings, "rtcMinPort" | "rtcMaxPort">
}
export interface CodecParameters extends RtpCodecParameters{
    kind:MediaKind
}
export type TransportOptions = {
    id: string;
    iceParameters: IceParameters;
    iceCandidates: IceCandidate[];
    dtlsParameters: DtlsParameters;
};
