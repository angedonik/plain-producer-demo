import {Device} from 'mediasoup-client';
import {Transport, TransportOptions} from 'mediasoup-client/lib/Transport';
import {RtpCapabilities} from 'mediasoup-client/lib/RtpParameters';

export class DemoClient {
    protected readonly device:Device;
    protected transport:Transport
    constructor() {
        this.device = new Device({});
    }
    protected async jsonRequest(action, data={}):Promise<any>
    {
        return new Promise(resolve =>{
            const xmlHttp = new XMLHttpRequest();
            xmlHttp.onreadystatechange = function() {
                if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                    resolve(JSON.parse(xmlHttp.responseText));
            };
            xmlHttp.open("POST", `/api/${action}`, true);
            xmlHttp.setRequestHeader('Content-Type', 'application/json');
            xmlHttp.send((data && JSON.stringify(data))||null);
        } );

    }
    async start(url:string):Promise<MediaStreamTrack|undefined>{
        if(!this.device.loaded){
            const {routerRtpCapabilities,iceServers} = await this.jsonRequest('getServerConfigs');
            if (routerRtpCapabilities.headerExtensions)
            {
                routerRtpCapabilities.headerExtensions = routerRtpCapabilities.headerExtensions.
                filter((ext) => ext.uri !== 'urn:3gpp:video-orientation');
            }
            await this.device.load({ routerRtpCapabilities });
            if(!this.transport){
                const self:DemoClient = this;
                const data:TransportOptions = await this.jsonRequest('createTransport');
                if(iceServers){
                    data.iceServers=iceServers;
                }
                this.transport = this.device.createRecvTransport(data);
                this.transport.on('connect', ({ dtlsParameters }, callback, errback) => {
                    self.jsonRequest('connectTransport',{
                        dtlsParameters
                    }).then(callback).catch(errback);
                });
            }
            await this.jsonRequest('startProducing',{ url});
            const rtpCapabilities:RtpCapabilities  = this.device.rtpCapabilities as RtpCapabilities;
            const data=await this.jsonRequest('consume',{ rtpCapabilities});
            const consumer=await this.transport.consume(data);
            consumer.observer.on('close', async ()=>{
                consumer.track?.stop()
            });
            return consumer.track
        }
    }
    close():void{
        if(this.transport){
            if(!this.transport.closed){
                this.transport.close();
            }
            this.jsonRequest('closeTransport').catch(e=>void e)
        }
        this.jsonRequest('stopProducing').catch(e=>void e)
    }
}