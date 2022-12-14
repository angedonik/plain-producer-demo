export abstract class EnvUtils {
    private static readonly getEnv = <T>(key:string,func:(s:string)=>T,_default?:T):T => {
        const s=process.env[key];
        if(!s){
            if(_default!==undefined){
                return _default;
            }
            else {
                throw `env ${key} is required`
            }
        }
        else {
            return func(s);
        }
    }
    static getEnvStr(key:string,_default?:string):string {
        return this.getEnv<string>(key,_=>_.toString(),_default)
    }
    static getEnvNum(key:string,_default?:number):number {
        return this.getEnv<number>(key,parseInt,_default)
    }
}
export function ssrcRandom():number{
    return Math.floor(Math.random() * 99999999) + 10000000
}