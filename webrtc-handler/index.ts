import {config as dotenv} from 'dotenv';
import {createServer} from 'http';
import * as express from 'express';
import * as cors from 'cors';
import consoleStamp from 'console-stamp';
import {json as jsonBodyParser} from "body-parser";
import * as router from 'router';
import {ApiHandler} from './src/classes/api-handler';
import {rest, webRTC} from './src/conf';
import * as mediasoup from 'mediasoup';
import {ERROR, PATH} from './src/interfaces';
import {EnvUtils} from './src/utils';

dotenv();
consoleStamp(console, {format:':date(yyyy-mm-dd HH:MM:ss.l)'});

const app = express();
app.use(cors());
app.use(jsonBodyParser());
app.use(router());
const server = createServer(app);
server.listen(rest.port, rest.ip, async () => {
    console.log(`Server is listening ${rest.ip} on port ${rest.port}`);
    const rtcMinPort=EnvUtils.getEnvNum('HANDLER_PORT_FROM');
    const rtcMaxPort=EnvUtils.getEnvNum('HANDLER_PORT_TO');
    const worker = await mediasoup.createWorker({
        ...webRTC.worker, rtcMinPort, rtcMaxPort
    });
    console.log('starting worker %d %d %d',rtcMinPort,rtcMaxPort)
    const router=await worker.createRouter(webRTC.router);
    const h=new ApiHandler(router)
    app.post(`/${PATH.API}/:action`,async (req,res)=>{
        const action=req.params.action;
        console.info('got message', action, JSON.stringify(req.body));
        let response = (data) => {
            res.send(data);
            console.info('sent message', action, JSON.stringify(data));
        };
        let error = (errorId: ERROR=ERROR.UNKNOWN) => {
            response({errorId})
        };
        if(action in h){
            try {
                response(await h[action](req.body))
            }
            catch (e) {
                console.error('got error', action, e.stackTrace || e);
                error(e.errorId);
            }
        }
        else {
            error(ERROR.INVALID_ACTION);
        }
    })
});
app.get('/',(req,res)=>{
    res.send('WebRTC handler test page')
});