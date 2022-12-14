import {IceServer as ClientIceServer} from './interfaces';
class IceServer implements ClientIceServer{
    readonly  urls: string[];
    readonly username?: string;
    readonly credential?: string;
    static protocols: string[] = [`turn`,`stun`];
    constructor(urls: string[],username?: string,credential?: string) {
        this.urls=urls;
        this.username=username;
        this.credential=credential
    }
    static get():IceServer[]{
        const iceServers:IceServer[]=[];
        const [url,port,username,credential]=['TURN_EXTERNAL_IP','TURN_LISTENING_PORT','TURN_USER','TURN_PASSWORD'].map(_=>process.env[_]);
        if(url && port && username && credential){
            for (const p of this.protocols){
                iceServers.push(new IceServer([`${p}:${url}:${port}`], username, credential));
            }
        }
        const custom=process.env['CUSTOM_ICE_SERVERS'];
        if(custom){
            const customServers=custom.split(',').map((_)=>{
                const [url,username,credential]=_.split('|');
                return {url,username,credential}
            });
            for (const {url,username,credential} of customServers){
                if(url && username && credential){
                    iceServers.push(new IceServer(url.split(';'), username, credential));
                }
                else {
                    throw 'invalid custom ice servers params'
                }
            }
        }
        return iceServers;
    }
}

export const iceServers=IceServer.get();