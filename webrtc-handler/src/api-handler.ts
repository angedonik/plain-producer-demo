import {videoCodec, webRTC} from './conf';
import {iceServers} from './ice-server';
import {
    ConnectTransportRequest,
    ConsumeRequest,
    ConsumeResponse,
    ERROR,
    PlainProduceResponse,
    ServerConfigs,
    TransportOptions
} from './interfaces';
import {ssrcRandom} from './utils';
import {Router} from 'mediasoup/node/lib/Router';
import {Producer} from 'mediasoup/node/lib/Producer';
import {Transport} from 'mediasoup/node/lib/Transport';
import {PlainTransport} from 'mediasoup/node/lib/PlainTransport';
import {ChildProcess, spawn} from 'child_process';
import {mkfifoSync} from 'mkfifo';
import {dir} from 'tmp-promise';
import {join} from 'path';

export class ApiHandler {
    private readonly router: Router;
    private producer: Producer | undefined;
    private transport: Transport | undefined;
    private plainTransport: PlainTransport | undefined
    private ffmpeg: ChildProcess | undefined
    private gst: ChildProcess | undefined

    constructor(router: Router) {
        this.router = router;
    }

    async getServerConfigs(): Promise<ServerConfigs> {
        return {
            routerRtpCapabilities: this.router.rtpCapabilities,
            iceServers
        };
    }

    async createTransport(): Promise<TransportOptions> {
        this.transport?.close()
        const {listenIps} = webRTC.transport;
        const transport = await this.router.createWebRtcTransport({
            listenIps
        });
        this.transport = transport;
        return {
            id: transport.id,
            iceParameters: transport.iceParameters,
            iceCandidates: transport.iceCandidates,
            dtlsParameters: transport.dtlsParameters
        };
    }

    async connectTransport({dtlsParameters}: ConnectTransportRequest): Promise<void> {
        if (this.transport) {
            await this.transport.connect({dtlsParameters});
        } else {
            throw {errorId: ERROR.INVALID_TRANSPORT}
        }
    }

    async closeTransport(): Promise<void> {
        this.transport?.close()
    }

    async closeProducer(): Promise<void> {
        this.producer?.close()
    }

    async consume({rtpCapabilities}: ConsumeRequest): Promise<ConsumeResponse> {
        if (this.producer) {
            if (this.transport) {
                const consumer = await this.transport.consume({
                    producerId: this.producer.id,
                    rtpCapabilities
                });
                this.producer.observer.on('close', () => {
                    consumer.close();
                });
                this.transport.observer.on('close', () => {
                    consumer.close();
                });
                return {
                    producerId: this.producer.id,
                    id: consumer.id,
                    kind: consumer.kind,
                    rtpParameters: consumer.rtpParameters,
                    type: consumer.type,
                    producerPaused: consumer.producerPaused
                };
            } else {
                throw {errorId: ERROR.INVALID_TRANSPORT}
            }
        }
        throw {errorId: ERROR.INVALID_PRODUCER}
    }

    async plainProduce(): Promise<PlainProduceResponse> {
        this.plainTransport?.close()
        this.producer?.close()
        const transport = await this.router.createPlainTransport(webRTC.plainTransport.recv);
        if (!transport.rtcpTuple) {
            throw {errorId: ERROR.INVALID_TRANSPORT, message: 'No rtcpTuple'}
        }
        const ssrc = ssrcRandom()
        const producer = await transport.produce({
            kind: videoCodec.kind,
            rtpParameters: {
                codecs: [videoCodec],
                encodings: [{ssrc}]
            }
        });
        transport.observer.on('close', () => {
            producer.close();
        });
        this.plainTransport = transport;
        this.producer = producer;
        producer.observer.on('close', async () => {
            transport.close();
        });
        return {
            payloadType: videoCodec.payloadType, ssrc, listenIp: transport.tuple.localIp,
            rtpPort: transport.tuple.localPort, rtcpPort: transport.rtcpTuple.localPort
        }
    }

    async startProducing({url}): Promise<void> {
        this.ffmpeg?.kill()
        this.gst?.kill()
        const tmpDir=await dir();
        const fifoPath=join(tmpDir.path,'video');
        mkfifoSync(fifoPath, 0o664);
        const {ssrc, listenIp, rtpPort, rtcpPort, payloadType} = await this.plainProduce();
        this.ffmpeg = spawn('ffmpeg', ['-analyzeduration', '20M', '-probesize', '20M', '-re', '-i', url, '-map', '0:v:0', '-c:v', 'copy',
            '-async', '10000', '-f', 'tee', `[select=v:f=h264]${fifoPath}`], {detached: false});
        this.ffmpeg.stderr?.on('data', (data) => {
            console.log(data.toString())
        })
        this.ffmpeg.on('exit', () => {
            tmpDir.cleanup().catch(e=>void e);
            delete this.ffmpeg;
            this.gst?.kill()
        })
        this.gst = spawn('gst-launch-1.0', ['-v', 'rtpbin', 'name=rtpbin', 'rtp-profile=avpf',
            "filesrc", `location=${fifoPath}`, '!', 'queue', '!', 'h264parse', '!',
            'rtph264pay', 'mtu=1300', `ssrc=${ssrc}`, `pt=${payloadType}`, '!',
            'rtprtxqueue', 'max-size-time=1000', 'max-size-packets=0', '!', 'rtpbin.send_rtp_sink_0',
            'rtpbin.send_rtp_src_0', '!', 'udpsink', `host=${listenIp}`, `port=${rtpPort}`,
            'rtpbin.send_rtcp_src_0', '!', 'udpsink', `host=${listenIp}`, `port=${rtcpPort}`, 'sync=false', 'async=false'], {
            detached: false,
            env: {GST_DEBUG: '1'}
        });
        this.gst.stderr?.on('data', (data) => {
            console.log(data.toString())
        })
        this.gst.on('exit', () => {
            delete this.gst;
            this.ffmpeg?.kill()
        })

    }
    async stopProducing(): Promise<void> {
        this.ffmpeg?.kill()
        this.gst?.kill()
        this.plainTransport?.close()
        this.producer?.close()
    }
}