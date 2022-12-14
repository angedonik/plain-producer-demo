import { Device } from 'mediasoup-client';
import { Transport } from 'mediasoup-client/lib/Transport';
export declare class DemoClient {
    protected readonly device: Device;
    protected transport: Transport;
    constructor();
    protected jsonRequest(action: any, data?: {}): Promise<any>;
    start(url: string): Promise<MediaStreamTrack | undefined>;
    close(): void;
}
