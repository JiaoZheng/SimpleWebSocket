import * as webSocket from "ws";
import {
    routeI,
    requestLoginType,
    requestMessageType,
    loginResponse,
    messageResponse,
    broadCastLoginResponse,
    broadCastMessageResponse
} from "./types";
import { addUser } from "./dataPersistence";
import { checkAndFormat } from "./verification";
import { closeProcess, broadcast } from "./public";

// TODO Date格式化

/**
 * 路由
 */
const route: routeI = {
    login: (ws: webSocket, request: requestLoginType) => {

        const
            time = Date.now(),
            auth = time.toString(32),
            nickName = request.nickName;

        addUser(nickName, auth, ws);

        const broadCastResponse: broadCastLoginResponse = {
            type: 'broadCastLogin',
            result: {
                userName: nickName,
                message: time.toString()
            }
        };

        broadcast(nickName, broadCastResponse);

        const response: loginResponse = {
            type: 'login',
            result: true,
            auth: auth
        };

        ws.send(JSON.stringify(response));
    },
    message: (ws: webSocket, request: requestMessageType) => {

        const
            nickName = request.nickName,
            message = request.message;

        const broadCastResponse: broadCastMessageResponse = {
            type: 'broadCast',
            result: {
                userName: nickName,
                message:message
            }
        };

        broadcast(nickName,broadCastResponse);
        
        const response: messageResponse = {
            type: 'message',
            result: true
        };

        ws.send(JSON.stringify(response));

    }
};

/**
 * route的逻辑相当简单.
 * 
 * 校验用户传入的参数是否符合规定的格式.
 * 
 * 如果不符合就发送对应的不符合的消息,然后中断连接.
 * 
 * 如果非法连接就直接中断.
 * 
 * @param ws webSocket对象
 */
export function router(ws: webSocket) {

    ws.on('message', (data: string) => {

        const result = checkAndFormat(ws, data);

        if (result) {
            return route[result.type](ws, result);
        }

        return ws.terminate();

    });

    closeProcess.bind(ws);

    ws.once('error', closeProcess);
    ws.once('close', closeProcess);

};
