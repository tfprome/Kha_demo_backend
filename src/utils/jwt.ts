import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { config } from "../config";

export interface tokenType {
    sub: string,
    email: string,
    role: 'customer' | 'admin',
    jti: string,

}

export type BasePayload = Omit<tokenType, 'jti'>


export function signAccessToken(payload: BasePayload): { token: string, jti: string } {
    const jti = randomUUID()
    const token = jwt.sign({ ...payload, jti }, config.jwtAccessSecret, {
        expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn']
    })
    return { token, jti }
}

export function signRefreshToken(payload: BasePayload): { token: string, jti: string } {
    const jti = randomUUID()
    const token = jwt.sign({ ...payload, jti }, config.jwtRefreshSecret, {
        expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn']
    })
    return { token, jti }
}

export function verifyAccessToken(token:string){
    const decoded= jwt.verify(token,config.jwtAccessSecret) as tokenType
    return decoded
}

export function verifyRefreshToken(token:string){
    const decoded= jwt.verify(token,config.jwtRefreshSecret) as tokenType
    //console.log(decoded)
    return decoded
}

export function getRemainingTtl(token: string) {
    const time = jwt.decode(token) as { exp: number } | null
    //console.log('decode',time)
    if (!time) return 0;
    return Math.max(time.exp - Math.floor(Date.now() / 1000))
}